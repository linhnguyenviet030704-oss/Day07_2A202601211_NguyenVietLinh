from __future__ import annotations

import json
import math
import re
import uuid
from pathlib import Path
from typing import Any, Callable

import chromadb

from .chunking import _dot
from .embeddings import _mock_embed
from .models import Document


class EmbeddingStore:
    """
    ChromaDB vector store for text chunks.

    The embedding_fn parameter allows injection of mock embeddings for tests.
    """

    def __init__(
        self,
        collection_name: str = "documents",
        embedding_fn: Callable[[str], list[float]] | None = None,
        persist_directory: str | Path | None = None,
    ) -> None:
        self._embedding_fn = embedding_fn or _mock_embed
        self._collection_name = collection_name
        chroma_collection_name = collection_name if persist_directory else f"{collection_name}_{uuid.uuid4().hex}"[:512]
        self._client = (
            chromadb.PersistentClient(path=str(persist_directory))
            if persist_directory
            else chromadb.EphemeralClient()
        )
        self._collection = self._client.get_or_create_collection(
            name=chroma_collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        self._store: list[dict[str, Any]] = []
        self._hnsw_graph: dict[int, set[int]] = {}
        self._entry_point: int | None = None
        self._refresh_cache()

    def add_documents(self, docs: list[Document]) -> None:
        """
        Embed each document's content and store it.
        """
        if not docs:
            return
        texts = [doc.content for doc in docs]
        embed = getattr(self._embedding_fn, "embed", None)
        embeddings = embed(texts) if embed else [self._embedding_fn(text) for text in texts]
        self.add_documents_with_embeddings(docs, embeddings)

    def add_documents_with_embeddings(self, docs: list[Document], embeddings: list[list[float]]) -> None:
        if not docs:
            return
        self._collection.upsert(
            ids=[f"{doc.id}::{uuid.uuid4().hex}" for doc in docs],
            documents=[doc.content for doc in docs],
            metadatas=[self._metadata(doc) for doc in docs],
            embeddings=embeddings,
        )
        self._refresh_cache()

    def search(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        """
        Semantic/vector search over ChromaDB.
        """
        if top_k <= 0 or self.get_collection_size() == 0:
            return []
        result = self._collection.query(
            query_embeddings=[self._embedding_fn(query)],
            n_results=min(top_k, self.get_collection_size()),
            include=["documents", "metadatas", "distances"],
        )
        return _query_result(result)

    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        strategy: str = "semantic",
        reranker: Callable[[str, dict[str, Any]], float] | None = None,
    ) -> list[dict[str, Any]]:
        strategy = strategy.lower()
        if strategy == "bm25":
            return self.search_bm25(query, top_k)
        if strategy in {"semantic", "vector"}:
            return self.search(query, top_k)
        if strategy in {"hybrid", "bm25_vector"}:
            return self.search_hybrid(query, top_k)
        if strategy in {"rerank", "bm25_vector_rerank"}:
            return self.search_with_rerank(query, top_k, reranker)
        raise ValueError(f"unknown retrieval strategy: {strategy}")

    def get_collection_size(self) -> int:
        """Return the total number of stored chunks."""
        return self._collection.count()

    def search_with_filter(self, query: str, top_k: int = 3, metadata_filter: dict | None = None) -> list[dict]:
        """
        Search with optional metadata pre-filtering.
        """
        if not metadata_filter:
            return self.search(query, top_k)
        if top_k <= 0 or self.get_collection_size() == 0:
            return []
        result = self._collection.query(
            query_embeddings=[self._embedding_fn(query)],
            n_results=min(top_k, self.get_collection_size()),
            where=_where(metadata_filter),
            include=["documents", "metadatas", "distances"],
        )
        return _query_result(result)

    def delete_document(self, doc_id: str) -> bool:
        """
        Remove all chunks belonging to a document.
        """
        matches = self._collection.get(where={"doc_id": doc_id}, include=[])
        ids = matches.get("ids", [])
        if not ids:
            return False
        self._collection.delete(ids=ids)
        self._refresh_cache()
        return True

    def search_bm25(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        query_terms = _terms(query)
        if not query_terms:
            return []
        docs_terms = [_terms(record["content"]) for record in self._store]
        avgdl = sum(map(len, docs_terms)) / len(docs_terms) if docs_terms else 0.0
        df = {term: sum(1 for terms in docs_terms if term in terms) for term in set(query_terms)}
        scored = []
        for record, terms in zip(self._store, docs_terms):
            score = _bm25(query_terms, terms, df, len(self._store), avgdl)
            scored.append(self._result(record, score))
        return sorted(scored, key=lambda item: item["score"], reverse=True)[:top_k]

    def search_hybrid(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        limit = min(len(self._store), max(top_k * 4, top_k))
        bm25 = self.search_bm25(query, limit)
        semantic = self.search(query, limit)
        scores: dict[str, dict[str, Any]] = {}
        for weight, results in ((0.5, _normalize(bm25)), (0.5, _normalize(semantic))):
            for result, score in results:
                item = scores.setdefault(result["id"], dict(result, score=0.0))
                item["score"] += weight * score
        return sorted(scores.values(), key=lambda item: item["score"], reverse=True)[:top_k]

    def search_with_rerank(
        self,
        query: str,
        top_k: int = 5,
        reranker: Callable[[str, dict[str, Any]], float] | None = None,
    ) -> list[dict[str, Any]]:
        candidates = self.search_hybrid(query, min(len(self._store), max(top_k * 3, top_k)))
        rank = reranker or _lexical_rerank
        reranked = [dict(result, score=float(rank(query, result))) for result in candidates]
        return sorted(reranked, key=lambda item: item["score"], reverse=True)[:top_k]

    def _add_hnsw_node(self, index: int) -> None:
        self._hnsw_graph.setdefault(index, set())

    def _hnsw_candidates(self, query_embedding: list[float], limit: int) -> list[int]:
        return list(range(min(limit, len(self._store))))

    def _rebuild_hnsw(self) -> None:
        self._refresh_cache()

    def _metadata(self, doc: Document) -> dict[str, Any]:
        metadata = _chroma_metadata(doc.metadata)
        metadata.setdefault("doc_id", doc.id)
        metadata["record_id"] = doc.id
        return metadata

    def _refresh_cache(self) -> None:
        data = self._collection.get(include=["documents", "metadatas", "embeddings"])
        self._store = [
            {
                "id": metadata.get("record_id", chroma_id),
                "content": document,
                "metadata": _public_metadata(metadata),
                "embedding": [float(value) for value in embedding],
                "index": index,
            }
            for index, (chroma_id, document, metadata, embedding) in enumerate(
                zip(data.get("ids", []), data.get("documents", []), data.get("metadatas", []), data.get("embeddings", []))
            )
        ]
        self._hnsw_graph = {record["index"]: set() for record in self._store}
        self._entry_point = self._store[0]["index"] if self._store else None

    @staticmethod
    def _result(record: dict[str, Any], score: float) -> dict[str, Any]:
        return {
            "id": record["id"],
            "content": record["content"],
            "metadata": record["metadata"],
            "score": float(score),
        }


def _terms(text: str) -> list[str]:
    return re.findall(r"\w+", text.lower(), flags=re.UNICODE)


def _chroma_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    clean = {}
    for key, value in metadata.items():
        if isinstance(value, str | int | float | bool):
            clean[key] = value
        elif value is not None:
            clean[key] = json.dumps(value, ensure_ascii=False)
    return clean


def _public_metadata(metadata: dict[str, Any]) -> dict[str, Any]:
    return {key: value for key, value in metadata.items() if key != "record_id"}


def _where(metadata_filter: dict[str, Any]) -> dict[str, Any]:
    filters = []
    for key, value in metadata_filter.items():
        if isinstance(value, list):
            filters.append({key: {"$in": value}})
        else:
            filters.append({key: value})
    return filters[0] if len(filters) == 1 else {"$and": filters}


def _query_result(result: dict[str, Any]) -> list[dict[str, Any]]:
    ids = result.get("ids", [[]])[0]
    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]
    rows = []
    for chroma_id, document, metadata, distance in zip(ids, documents, metadatas, distances):
        rows.append(
            {
                "id": metadata.get("record_id", chroma_id),
                "content": document,
                "metadata": _public_metadata(metadata),
                "score": 1.0 - float(distance),
            }
        )
    return sorted(rows, key=lambda item: item["score"], reverse=True)


def _bm25(query_terms: list[str], terms: list[str], df: dict[str, int], total_docs: int, avgdl: float) -> float:
    counts = {term: terms.count(term) for term in set(query_terms)}
    score = 0.0
    k1, b = 1.5, 0.75
    for term in query_terms:
        if not counts.get(term):
            continue
        idf = math.log(1 + (total_docs - df.get(term, 0) + 0.5) / (df.get(term, 0) + 0.5))
        denom = counts[term] + k1 * (1 - b + b * len(terms) / (avgdl or 1.0))
        score += idf * counts[term] * (k1 + 1) / denom
    return score


def _normalize(results: list[dict[str, Any]]) -> list[tuple[dict[str, Any], float]]:
    if not results:
        return []
    best = max(abs(result["score"]) for result in results) or 1.0
    return [(result, result["score"] / best) for result in results]


def _lexical_rerank(query: str, result: dict[str, Any]) -> float:
    query_terms = set(_terms(query))
    content_terms = set(_terms(result["content"]))
    overlap = len(query_terms & content_terms) / len(query_terms | content_terms) if query_terms and content_terms else 0.0
    return result["score"] + overlap

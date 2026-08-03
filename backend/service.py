from __future__ import annotations

import base64
import json
import os
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib import request as urlrequest

from src.chunking import DocumentStructureChunker, FixedSizeChunker, RecursiveChunker, SemanticChunker
from src.embeddings import FPT_EMBEDDING_MODEL, RequestEmbedder, VOYAGE_RATE_LIMIT_RPM, VOYAGE_RATE_LIMIT_TPM, _mock_embed
from src.models import Document
from src.store import EmbeddingStore


VOYAGE_MODEL_SIZES = {
    "voyage-4-large": [2048, 1024, 512, 256],
    "voyage-4": [2048, 1024, 512, 256],
    "voyage-4-lite": [2048, 1024, 512, 256],
}
FPT_MODEL_SIZES = {FPT_EMBEDDING_MODEL: [1024]}

CHAT_MODELS = {
    "local": {"provider": "local", "default_model": "local-rag"},
    "gemini": {"provider": "google", "default_model": "gemini-1.5-flash"},
    "gpt": {"provider": "openai", "default_model": "gpt-4o-mini"},
    "voyage": {"provider": "voyage", "default_model": "voyage-rag"},
}
DEFAULT_CHAT_MODEL = "voyage"


class BackendService:
    default_user_id = "default-user"
    default_knowledge_base_id = "default-kb"

    def __init__(self, storage_dir: str | Path = "backend/storage") -> None:
        self.storage_dir = Path(storage_dir)
        self.upload_dir = self.storage_dir / "uploads"
        self.index_dir = self.storage_dir / "indexes"
        self.chat_dir = self.storage_dir / "conversations"
        self.chroma_dir = self.storage_dir / "chroma"
        for folder in (self.upload_dir, self.index_dir, self.chat_dir, self.chroma_dir):
            folder.mkdir(parents=True, exist_ok=True)
        self.db_path = self.storage_dir / "rag.sqlite3"
        self._create_schema()
        self._ensure_default_account()

    def options(self) -> dict[str, Any]:
        return {
            "theme": {"mode": "light", "surface": "#ffffff", "accent": "#4f7cff"},
            "chunking_strategies": ["fixed_size", "semantic", "document_structure", "recursive"],
            "embedding_models": {
                "mock": {"provider": "mock", "sizes": [64], "default_size": 64},
                **{
                    model: {
                        "provider": "voyage",
                        "sizes": sizes,
                        "default_size": 1024,
                        "rate_limit": {"tpm": VOYAGE_RATE_LIMIT_TPM, "rpm": VOYAGE_RATE_LIMIT_RPM},
                    }
                    for model, sizes in VOYAGE_MODEL_SIZES.items()
                },
                **{
                    model: {"provider": "fpt", "sizes": sizes, "default_size": 1024}
                    for model, sizes in FPT_MODEL_SIZES.items()
                },
            },
            "retrieval_strategies": ["bm25", "semantic", "bm25_vector", "bm25_vector_rerank"],
            "chat_models": CHAT_MODELS,
            "rate_limits": {"voyage": {"tpm": VOYAGE_RATE_LIMIT_TPM, "rpm": VOYAGE_RATE_LIMIT_RPM}},
        }

    def create_user(self, name: str) -> dict[str, Any]:
        user = {"id": str(uuid.uuid4()), "name": name, "created_at": _now()}
        with self._connect() as conn:
            conn.execute("INSERT INTO users (id, name, created_at) VALUES (?, ?, ?)", tuple(user.values()))
        return user

    def list_users(self) -> list[dict[str, Any]]:
        with self._connect() as conn:
            return [_dict(row) for row in conn.execute("SELECT id, name, created_at FROM users ORDER BY created_at DESC")]

    def create_knowledge_base(self, user_id: str, name: str) -> dict[str, Any]:
        self._require_user(user_id)
        kb = {"id": str(uuid.uuid4()), "user_id": user_id, "name": name, "created_at": _now()}
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO knowledge_bases (id, user_id, name, created_at) VALUES (?, ?, ?, ?)",
                (kb["id"], kb["user_id"], kb["name"], kb["created_at"]),
            )
        return kb

    def list_knowledge_bases(self, user_id: str | None = None) -> list[dict[str, Any]]:
        params: list[Any] = []
        where = ""
        if user_id:
            where = "WHERE kb.user_id = ?"
            params.append(user_id)
        with self._connect() as conn:
            return [
                _dict(row)
                for row in conn.execute(
                    f"""
                    SELECT kb.id, kb.user_id, kb.name, kb.created_at, COUNT(d.id) AS documents_count
                    FROM knowledge_bases kb
                    LEFT JOIN documents d ON d.knowledge_base_id = kb.id
                    {where}
                    GROUP BY kb.id
                    ORDER BY kb.created_at DESC
                    """,
                    params,
                )
            ]

    def upload_document(
        self,
        filename: str,
        content_b64: str,
        chunking: dict[str, Any] | None = None,
        embedding: dict[str, Any] | None = None,
        knowledge_base_id: str | None = None,
        user_id: str | None = None,
    ) -> dict[str, Any]:
        chunking = chunking or {}
        embedding = embedding or {}
        knowledge_base_id = knowledge_base_id or self._default_kb_for_user(user_id or self.default_user_id)
        kb = self._require_knowledge_base(knowledge_base_id)
        if user_id and kb["user_id"] != user_id:
            raise ValueError("knowledge_base_id does not belong to user_id")

        scan = self.scan_document(filename, content_b64, chunking)
        if _needs_markdown_hierarchy(chunking) and not scan["hierarchy_ok"]:
            raise ValueError("Markdown headings (#, ##, ...) are required for hierarchy chunking")

        safe_name = _safe_filename(filename)
        raw = base64.b64decode(content_b64)
        text = raw.decode("utf-8")
        doc_id = str(uuid.uuid4())
        created_at = _now()
        file_dir = self.upload_dir / knowledge_base_id
        file_dir.mkdir(parents=True, exist_ok=True)
        file_path = file_dir / f"{doc_id}_{safe_name}"
        file_path.write_bytes(raw)
        legacy_path = self.upload_dir / safe_name
        if not legacy_path.exists():
            legacy_path.write_bytes(raw)

        embedder, embedding_config = self._embedder(embedding, input_type="document")
        chunks = self._chunker(chunking).chunk(text)
        vectors = embedder.embed(chunks) if hasattr(embedder, "embed") else [embedder(chunk) for chunk in chunks]
        chunk_records = []
        for index, (chunk, vector) in enumerate(zip(chunks, vectors)):
            metadata = {
                "doc_id": doc_id,
                "knowledge_base_id": knowledge_base_id,
                "chunk_index": index,
                "source": str(legacy_path),
            }
            chunk_records.append(
                {
                    "id": f"{doc_id}::chunk_{index}",
                    "index": index,
                    "content": chunk,
                    "metadata": metadata,
                    "embedding": vector,
                }
            )
        EmbeddingStore(
            collection_name=_chroma_collection_name(knowledge_base_id),
            embedding_fn=embedder,
            persist_directory=self.chroma_dir,
        ).add_documents_with_embeddings(
            [Document(id=record["id"], content=record["content"], metadata=record["metadata"]) for record in chunk_records],
            vectors,
        )
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO documents
                    (id, knowledge_base_id, filename, file_path, chunking_json, embedding_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (doc_id, knowledge_base_id, safe_name, str(file_path), _json(chunking), _json(embedding_config), created_at),
            )
            for record in chunk_records:
                conn.execute(
                    """
                    INSERT INTO document_chunks
                        (id, document_id, chunk_index, content, metadata_json, embedding_json, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        record["id"],
                        doc_id,
                        record["index"],
                        record["content"],
                        _json(record["metadata"]),
                        _json(record["embedding"]),
                        created_at,
                    ),
                )
        self._export_documents_json()
        return {
            "doc_id": doc_id,
            "knowledge_base_id": knowledge_base_id,
            "filename": safe_name,
            "chunk_count": len(chunks),
            "scan": scan,
        }

    def list_documents(self, knowledge_base_id: str | None = None) -> list[dict[str, Any]]:
        params: list[Any] = []
        where = ""
        if knowledge_base_id:
            where = "WHERE d.knowledge_base_id = ?"
            params.append(knowledge_base_id)
        with self._connect() as conn:
            return [
                _dict(row)
                for row in conn.execute(
                    f"""
                    SELECT
                        d.id,
                        d.filename AS name,
                        d.created_at,
                        COUNT(c.id) AS chunks_count
                    FROM documents d
                    LEFT JOIN document_chunks c ON c.document_id = d.id
                    {where}
                    GROUP BY d.id
                    ORDER BY d.created_at DESC
                    """,
                    params,
                )
            ]

    def scan_document(
        self,
        filename: str,
        content_b64: str,
        chunking: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        text = base64.b64decode(content_b64).decode("utf-8")
        headings = [
            {"level": len(match.group(1)), "title": match.group(2).strip()}
            for match in re.finditer(r"(?m)^(#{1,6})\s+(.+?)\s*$", text)
        ]
        levels = [heading["level"] for heading in headings]
        is_md = Path(filename).suffix.lower() in {".md", ".markdown"} or bool(headings)
        hierarchy_ok = is_md and bool(headings) and _levels_are_reasonable(levels)
        warnings = []
        if _needs_markdown_hierarchy(chunking or {}) and not is_md:
            warnings.append("File is not Markdown, so hierarchy chunking cannot use #/## sections.")
        elif _needs_markdown_hierarchy(chunking or {}) and not headings:
            warnings.append("No Markdown headings found for hierarchy chunking.")
        elif headings and not _levels_are_reasonable(levels):
            warnings.append("Markdown heading levels jump too far, e.g. # directly to ###.")
        return {
            "is_markdown": is_md,
            "heading_count": len(headings),
            "heading_levels": levels,
            "headings": headings,
            "hierarchy_ok": hierarchy_ok,
            "warnings": warnings,
        }

    def create_chat(
        self,
        title: str = "New chat",
        user_id: str | None = None,
        knowledge_base_id: str | None = None,
    ) -> dict[str, Any]:
        user_id = user_id or self.default_user_id
        knowledge_base_id = knowledge_base_id or self._default_kb_for_user(user_id)
        self._require_user(user_id)
        kb = self._require_knowledge_base(knowledge_base_id)
        if kb["user_id"] != user_id:
            raise ValueError("knowledge_base_id does not belong to user_id")
        chat = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "knowledge_base_id": knowledge_base_id,
            "title": title,
            "created_at": _now(),
            "messages": [],
        }
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO chats (id, user_id, knowledge_base_id, title, created_at) VALUES (?, ?, ?, ?, ?)",
                (chat["id"], user_id, knowledge_base_id, title, chat["created_at"]),
            )
        self._save_chat_snapshot(chat["id"])
        return chat

    def list_chats(self, user_id: str | None = None) -> list[dict[str, Any]]:
        params: list[Any] = []
        where = ""
        if user_id:
            where = "WHERE user_id = ?"
            params.append(user_id)
        with self._connect() as conn:
            return [
                _dict(row)
                for row in conn.execute(
                    f"""
                    SELECT id, user_id, knowledge_base_id, title, created_at
                    FROM chats
                    {where}
                    ORDER BY created_at DESC
                    """,
                    params,
                )
            ]

    def get_chat(self, chat_id: str) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id, user_id, knowledge_base_id, title, created_at FROM chats WHERE id = ?",
                (chat_id,),
            ).fetchone()
            if not row:
                raise KeyError(chat_id)
            chat = _dict(row)
            messages = []
            for message in conn.execute(
                """
                SELECT id, role, content, created_at, retrieval_json, chat_model, model_used
                FROM messages
                WHERE chat_id = ?
                ORDER BY rowid
                """,
                (chat_id,),
            ):
                item = _dict(message)
                if item["retrieval_json"]:
                    item["retrieval"] = json.loads(item.pop("retrieval_json"))
                else:
                    item.pop("retrieval_json")
                if item["role"] == "assistant":
                    item["retrieved_items"] = self.list_retrieved_items(item["id"])
                messages.append(item)
            chat["messages"] = messages
            return chat

    def add_message(
        self,
        chat_id: str,
        message: str,
        retrieval: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        chat = self.get_chat(chat_id)
        retrieval = retrieval or {}
        results = self.retrieve(message, retrieval, chat["knowledge_base_id"])
        generation_result = self.request_chat(
            message=message,
            retrieved_items=results,
            chat_model=retrieval.get("chat_model", DEFAULT_CHAT_MODEL),
            generation=retrieval.get("generation"),
        )
        user_msg = {
            "id": str(uuid.uuid4()),
            "role": "user",
            "content": message,
            "created_at": _now(),
            "chat_model": None,
            "model_used": None,
        }
        assistant_msg = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": generation_result["content"],
            "created_at": _now(),
            "retrieved_items": results,
            "retrieval": retrieval,
            "chat_model": generation_result["chat_model"],
            "model_used": generation_result["model_used"],
        }
        with self._connect() as conn:
            self._insert_message(conn, chat_id, user_msg, None)
            self._insert_message(conn, chat_id, assistant_msg, retrieval)
            for rank, result in enumerate(results, start=1):
                conn.execute(
                    """
                    INSERT INTO retrieved_items
                        (id, message_id, chunk_id, rank, score, distance, similarity, content, metadata_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        str(uuid.uuid4()),
                        assistant_msg["id"],
                        result["id"],
                        rank,
                        float(result["score"]),
                        float(result["distance"]),
                        float(result["similarity"]),
                        result["content"],
                        _json(result["metadata"]),
                    ),
                )
        self._save_chat_snapshot(chat_id)
        return {"user": user_msg, "assistant": assistant_msg}

    def list_retrieved_items(self, message_id: str) -> list[dict[str, Any]]:
        with self._connect() as conn:
            return [
                {
                    "id": row["chunk_id"],
                    "content": row["content"],
                    "metadata": json.loads(row["metadata_json"]),
                    "score": row["score"],
                    "distance": row["distance"],
                    "similarity": row["similarity"],
                    "rank": row["rank"],
                }
                for row in conn.execute(
                    """
                    SELECT chunk_id, rank, score, distance, similarity, content, metadata_json
                    FROM retrieved_items
                    WHERE message_id = ?
                    ORDER BY rank
                    """,
                    (message_id,),
                )
            ]

    def request_chat(
        self,
        message: str,
        retrieved_items: list[dict[str, Any]],
        chat_model: str = DEFAULT_CHAT_MODEL,
        generation: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        generation = generation or {}
        chat_model = (chat_model or DEFAULT_CHAT_MODEL).lower()
        if chat_model not in CHAT_MODELS:
            raise ValueError(f"unknown chat_model: {chat_model}")

        prompt = _chat_prompt(message, retrieved_items, generation.get("mode", "grounded_strict"))
        temperature = float(generation.get("temperature", 0.2))
        try:
            if chat_model == "gemini" and os.getenv("GEMINI_API_KEY"):
                return _gemini_chat(prompt, temperature, generation.get("model_name"))
            if chat_model == "gpt" and os.getenv("OPENAI_API_KEY"):
                return _gpt_chat(prompt, temperature, generation.get("model_name"))
        except Exception:
            pass

        return {
            "chat_model": chat_model,
            "model_used": CHAT_MODELS[chat_model]["default_model"] if chat_model == "local" else f"{chat_model}-fallback",
            "content": _answer_preview(retrieved_items),
        }

    def retrieve(
        self,
        query: str,
        retrieval: dict[str, Any] | None = None,
        knowledge_base_id: str | None = None,
    ) -> list[dict[str, Any]]:
        retrieval = retrieval or {}
        strategy = retrieval.get("strategy", "bm25_vector")
        top_k = int(retrieval.get("top_k", 3))
        knowledge_base_id = knowledge_base_id or retrieval.get("knowledge_base_id")
        records = self._load_index(knowledge_base_id, retrieval.get("filter_doc_ids"))
        if not records:
            return []
        store = EmbeddingStore(
            collection_name=_chroma_collection_name(knowledge_base_id or self.default_knowledge_base_id),
            embedding_fn=self._query_embedder(records),
            persist_directory=self.chroma_dir,
        )
        filter_doc_ids = retrieval.get("filter_doc_ids")
        if filter_doc_ids:
            allowed = set(filter_doc_ids)
            store._store = [record for record in store._store if record["metadata"].get("doc_id") in allowed]
            if strategy.lower() in {"semantic", "vector"}:
                results = store.search_with_filter(query, top_k=top_k, metadata_filter={"doc_id": list(allowed)})
                return [_with_similarity(result) for result in results]
        results = store.retrieve(query, top_k=top_k, strategy=strategy)
        return [_with_similarity(result) for result in results]

    def _connect(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def _create_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS knowledge_bases (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    name TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS documents (
                    id TEXT PRIMARY KEY,
                    knowledge_base_id TEXT NOT NULL REFERENCES knowledge_bases(id) ON DELETE CASCADE,
                    filename TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    chunking_json TEXT NOT NULL,
                    embedding_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    metadata_json TEXT NOT NULL,
                    embedding_json TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS chats (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    knowledge_base_id TEXT NOT NULL REFERENCES knowledge_bases(id) ON DELETE RESTRICT,
                    title TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    chat_id TEXT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
                    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    retrieval_json TEXT,
                    chat_model TEXT,
                    model_used TEXT
                );
                CREATE TABLE IF NOT EXISTS retrieved_items (
                    id TEXT PRIMARY KEY,
                    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
                    chunk_id TEXT NOT NULL REFERENCES document_chunks(id) ON DELETE RESTRICT,
                    rank INTEGER NOT NULL,
                    score REAL NOT NULL,
                    distance REAL NOT NULL,
                    similarity REAL NOT NULL,
                    content TEXT NOT NULL,
                    metadata_json TEXT NOT NULL
                );
                """
            )

    def _ensure_default_account(self) -> None:
        created_at = _now()
        with self._connect() as conn:
            conn.execute(
                "INSERT OR IGNORE INTO users (id, name, created_at) VALUES (?, ?, ?)",
                (self.default_user_id, "Default user", created_at),
            )
            conn.execute(
                "INSERT OR IGNORE INTO knowledge_bases (id, user_id, name, created_at) VALUES (?, ?, ?, ?)",
                (self.default_knowledge_base_id, self.default_user_id, "Default knowledge base", created_at),
            )

    def _default_kb_for_user(self, user_id: str) -> str:
        self._require_user(user_id)
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id FROM knowledge_bases WHERE user_id = ? ORDER BY created_at LIMIT 1",
                (user_id,),
            ).fetchone()
            if row:
                return row["id"]
        return self.create_knowledge_base(user_id, "Default knowledge base")["id"]

    def _require_user(self, user_id: str) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute("SELECT id, name, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
        if not row:
            raise KeyError(user_id)
        return _dict(row)

    def _require_knowledge_base(self, knowledge_base_id: str) -> dict[str, Any]:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT id, user_id, name, created_at FROM knowledge_bases WHERE id = ?",
                (knowledge_base_id,),
            ).fetchone()
        if not row:
            raise KeyError(knowledge_base_id)
        return _dict(row)

    def _insert_message(
        self,
        conn: sqlite3.Connection,
        chat_id: str,
        message: dict[str, Any],
        retrieval: dict[str, Any] | None,
    ) -> None:
        conn.execute(
            """
            INSERT INTO messages
                (id, chat_id, role, content, created_at, retrieval_json, chat_model, model_used)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                message["id"],
                chat_id,
                message["role"],
                message["content"],
                message["created_at"],
                _json(retrieval) if retrieval is not None else None,
                message.get("chat_model"),
                message.get("model_used"),
            ),
        )

    def _query_embedder(self, records: list[dict[str, Any]]):
        config = dict(records[0].get("embedding_config", {})) if records else {}
        if config.get("provider") == "mock":
            return _mock_embed
        embedder, _ = self._embedder(config, input_type="query")
        return embedder

    def _chunker(self, options: dict[str, Any]):
        strategy = options.get("strategy", "fixed_size")
        size = int(options.get("chunk_size", 500))
        if strategy == "fixed_size":
            return FixedSizeChunker(chunk_size=size, overlap=int(options.get("overlap", 50)))
        if strategy == "semantic":
            return SemanticChunker(max_sentences_per_chunk=int(options.get("max_sentences_per_chunk", 4)))
        if strategy == "document_structure":
            return DocumentStructureChunker(chunk_size=size)
        if strategy == "recursive":
            return RecursiveChunker(chunk_size=size)
        raise ValueError(f"unknown chunking strategy: {strategy}")

    def _embedder(self, options: dict[str, Any], input_type: str):
        provider = options.get("provider", "mock")
        model = options.get("model_name", "mock" if provider == "mock" else "voyage-4-lite")
        size = int(options.get("embedding_size", 64 if provider == "mock" else 1024))
        self._validate_embedding(provider, model, size)
        if provider == "mock":
            return _mock_embed, {"provider": provider, "model_name": model, "embedding_size": size}
        return (
            RequestEmbedder(
                provider=provider,
                model_name=model,
                api_key=options.get("api_key"),
                input_type="passage" if provider == "fpt" and input_type == "document" else input_type,
                output_dimension=size,
            ),
            {"provider": provider, "model_name": model, "embedding_size": size},
        )

    def _validate_embedding(self, provider: str, model: str, size: int) -> None:
        if provider == "mock":
            if size != 64:
                raise ValueError("mock embedding_size must be 64")
            return
        if provider == "fpt" and model in FPT_MODEL_SIZES:
            if size not in FPT_MODEL_SIZES[model]:
                raise ValueError(f"{model} supports embedding sizes {FPT_MODEL_SIZES[model]}")
            return
        if provider != "voyage" or model not in VOYAGE_MODEL_SIZES:
            raise ValueError(f"unknown embedding model: {model}")
        if size not in VOYAGE_MODEL_SIZES[model]:
            raise ValueError(f"{model} supports embedding sizes {VOYAGE_MODEL_SIZES[model]}")

    def _load_index(
        self,
        knowledge_base_id: str | None = None,
        filter_doc_ids: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        where = []
        params: list[Any] = []
        if knowledge_base_id:
            where.append("d.knowledge_base_id = ?")
            params.append(knowledge_base_id)
        if filter_doc_ids:
            where.append(f"d.id IN ({','.join('?' for _ in filter_doc_ids)})")
            params.extend(filter_doc_ids)
        clause = f"WHERE {' AND '.join(where)}" if where else ""
        with self._connect() as conn:
            rows = conn.execute(
                f"""
                SELECT
                    c.id,
                    c.document_id,
                    c.content,
                    c.metadata_json,
                    c.embedding_json,
                    c.created_at,
                    d.filename,
                    d.embedding_json AS embedding_config_json
                FROM document_chunks c
                JOIN documents d ON d.id = c.document_id
                {clause}
                ORDER BY d.created_at, c.chunk_index
                """,
                params,
            )
            return [
                {
                    "id": row["id"],
                    "doc_id": row["document_id"],
                    "filename": row["filename"],
                    "content": row["content"],
                    "metadata": json.loads(row["metadata_json"]),
                    "embedding": json.loads(row["embedding_json"]),
                    "embedding_config": json.loads(row["embedding_config_json"]),
                    "created_at": row["created_at"],
                }
                for row in rows
            ]

    def _export_documents_json(self) -> None:
        self._write_json(self.index_dir / "documents.json", self._load_index())

    def _save_chat_snapshot(self, chat_id: str) -> None:
        self._write_json(self.chat_dir / f"{chat_id}.json", self.get_chat(chat_id))

    def _write_json(self, path: Path, data) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _dict(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)


def _json(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False)


def _safe_filename(filename: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]+", "_", Path(filename).name).strip("._") or "upload.txt"


def _needs_markdown_hierarchy(chunking: dict[str, Any]) -> bool:
    return chunking.get("strategy") in {"document_structure", "hierarchy", "hierarchy_chunking"}


def _levels_are_reasonable(levels: list[int]) -> bool:
    previous = 0
    for level in levels:
        if previous and level > previous + 1:
            return False
        previous = level
    return True


def _chroma_collection_name(knowledge_base_id: str) -> str:
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", f"kb_{knowledge_base_id}")[:512].strip("._-")
    return name if len(name) >= 3 else "kb_default"


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _answer_preview(results: list[dict[str, Any]]) -> str:
    if not results:
        return "Khong tim thay ngu canh phu hop."
    return "Tim thay ngu canh lien quan:\n" + "\n".join(f"- {item['content'][:180]}" for item in results)


def _chat_prompt(message: str, retrieved_items: list[dict[str, Any]], mode: str) -> str:
    context = "\n\n".join(
        f"[{index + 1}] {item.get('metadata', {}).get('source', 'document')}\n{item['content']}"
        for index, item in enumerate(retrieved_items)
    ) or "No retrieved context."
    return (
        "You are a RAG assistant. Answer in Vietnamese using only the retrieved context.\n"
        f"Mode: {mode}\n\n"
        f"Retrieved context:\n{context}\n\n"
        f"User question: {message}"
    )


def _gemini_chat(prompt: str, temperature: float, model_name: str | None) -> dict[str, Any]:
    model = model_name or CHAT_MODELS["gemini"]["default_model"]
    data = _post_json(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={os.getenv('GEMINI_API_KEY')}",
        {"contents": [{"role": "user", "parts": [{"text": prompt}]}], "generationConfig": {"temperature": temperature}},
        {},
    )
    return {"chat_model": "gemini", "model_used": model, "content": data["candidates"][0]["content"]["parts"][0]["text"]}


def _gpt_chat(prompt: str, temperature: float, model_name: str | None) -> dict[str, Any]:
    model = model_name or CHAT_MODELS["gpt"]["default_model"]
    data = _post_json(
        "https://api.openai.com/v1/chat/completions",
        {"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": temperature},
        {"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
    )
    return {"chat_model": "gpt", "model_used": model, "content": data["choices"][0]["message"]["content"]}


def _post_json(url: str, payload: dict[str, Any], headers: dict[str, str]) -> dict[str, Any]:
    req = urlrequest.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )
    with urlrequest.urlopen(req, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def _with_similarity(result: dict[str, Any]) -> dict[str, Any]:
    similarity = max(0.0, min(1.0, float(result["score"])))
    return {**result, "distance": 1.0 - similarity, "similarity": similarity}

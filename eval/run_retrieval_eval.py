from __future__ import annotations

import argparse
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from statistics import mean
from typing import Any

from src import (
    Document,
    DocumentStructureChunker,
    EmbeddingStore,
    FixedSizeChunker,
    RecursiveChunker,
    SentenceChunker,
    _mock_embed,
)


DEFAULT_QUERIES = [
    {"query": "hoc bong sinh vien", "gold_terms": ["hoc bong", "sinh vien"]},
    {"query": "dang ky mon hoc", "gold_terms": ["dang ky", "mon hoc"]},
    {"query": "hoc phi", "gold_terms": ["hoc phi"]},
    {"query": "thu vien muon sach", "gold_terms": ["thu vien", "muon sach"]},
    {"query": "cap giay to cho sinh vien", "gold_terms": ["giay to", "sinh vien"]},
]

CHUNKERS = {
    "fixed_300": FixedSizeChunker(chunk_size=300, overlap=50),
    "sentence_3": SentenceChunker(max_sentences_per_chunk=3),
    "recursive_500": RecursiveChunker(chunk_size=500),
    "structure_500": DocumentStructureChunker(chunk_size=500),
}

RETRIEVERS = ("semantic", "bm25", "hybrid", "rerank")


@dataclass
class SourceDoc:
    path: Path
    text: str


def run_evaluation(
    data_dir: str | Path = "data",
    report_dir: str | Path = "report",
    queries: list[dict[str, Any] | str] | None = None,
    top_k: int = 3,
) -> dict[str, Any]:
    data_dir = Path(data_dir)
    report_dir = Path(report_dir)
    source_docs = _load_sources(data_dir)
    if not source_docs:
        raise ValueError(f"no .md/.txt documents found in {data_dir}")

    normalized_queries = _normalize_queries(queries or DEFAULT_QUERIES)
    evaluations = []
    for chunker_name, chunker in CHUNKERS.items():
        chunks = _chunk_sources(source_docs, chunker_name, chunker)
        store = EmbeddingStore(f"eval_{chunker_name}", embedding_fn=_mock_embed)
        store.add_documents(chunks)
        for retriever in RETRIEVERS:
            rows = []
            for query in normalized_queries:
                results = store.retrieve(query["query"], top_k=top_k, strategy=retriever)
                rows.append(_score_query(query, results, top_k))
            evaluations.append(
                {
                    "chunker": chunker_name,
                    "retriever": retriever,
                    "chunk_count": len(chunks),
                    "avg_chunk_length": round(mean(map(lambda doc: len(doc.content), chunks)), 1),
                    "precision_at_k": round(mean(row["precision_at_k"] for row in rows), 3),
                    "avg_score": round(mean(row["avg_score"] for row in rows), 3),
                    "queries": rows,
                }
            )

    summary = {
        "data_dir": str(data_dir),
        "source_count": len(source_docs),
        "top_k": top_k,
        "evaluations": sorted(evaluations, key=lambda row: row["precision_at_k"], reverse=True),
    }
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "retrieval_eval_results.json").write_text(
        json.dumps(summary, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (report_dir / "retrieval_eval_report.md").write_text(_markdown(summary), encoding="utf-8")
    return summary


def _load_sources(data_dir: Path) -> list[SourceDoc]:
    paths = sorted(path for path in data_dir.rglob("*") if path.suffix.lower() in {".md", ".txt"})
    docs = []
    for path in paths:
        text = path.read_text(encoding="utf-8", errors="replace").strip()
        if text:
            docs.append(SourceDoc(path=path, text=text))
    return docs


def _chunk_sources(source_docs: list[SourceDoc], chunker_name: str, chunker: Any) -> list[Document]:
    docs = []
    for source in source_docs:
        for index, chunk in enumerate(chunker.chunk(source.text)):
            docs.append(
                Document(
                    id=f"{source.path.stem}-{chunker_name}-{index}",
                    content=chunk,
                    metadata={"source": str(source.path), "chunker": chunker_name, "chunk_index": index},
                )
            )
    return docs


def _normalize_queries(queries: list[dict[str, Any] | str]) -> list[dict[str, Any]]:
    normalized = []
    for item in queries:
        if isinstance(item, str):
            normalized.append({"query": item, "gold_terms": _terms(item)})
        else:
            normalized.append({"query": item["query"], "gold_terms": item.get("gold_terms") or _terms(item["query"])})
    return normalized


def _score_query(query: dict[str, Any], results: list[dict[str, Any]], top_k: int) -> dict[str, Any]:
    hits = sum(_is_relevant(query["gold_terms"], result["content"]) for result in results)
    return {
        "query": query["query"],
        "precision_at_k": hits / max(1, top_k),
        "avg_score": mean(result["score"] for result in results) if results else 0.0,
        "top_results": [
            {
                "score": round(result["score"], 3),
                "source": result["metadata"].get("source", ""),
                "preview": re.sub(r"\s+", " ", result["content"])[:180],
            }
            for result in results
        ],
    }


def _is_relevant(gold_terms: list[str], content: str) -> bool:
    haystack = _plain(content)
    return any(_plain(term) in haystack for term in gold_terms)


def _terms(text: str) -> list[str]:
    return re.findall(r"\w+", _plain(text))


def _plain(text: str) -> str:
    normalized = unicodedata.normalize("NFD", text.lower())
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def _markdown(summary: dict[str, Any]) -> str:
    lines = [
        "# Retrieval Evaluation Report",
        "",
        f"- Data directory: `{summary['data_dir']}`",
        f"- Source files: {summary['source_count']}",
        f"- Top-k: {summary['top_k']}",
        "- Embedding: mock fallback, so use BM25/hybrid trends for classroom comparison unless a real embedder is configured.",
        "",
        "## Summary",
        "",
        "| Rank | Chunker | Retriever | Precision@k | Avg score | Chunks | Avg chunk length |",
        "|---:|---|---|---:|---:|---:|---:|",
    ]
    for rank, item in enumerate(summary["evaluations"], 1):
        lines.append(
            f"| {rank} | {item['chunker']} | {item['retriever']} | "
            f"{item['precision_at_k']:.3f} | {item['avg_score']:.3f} | "
            f"{item['chunk_count']} | {item['avg_chunk_length']} |"
        )

    lines.extend(["", "## Query Details", ""])
    for item in summary["evaluations"]:
        lines.append(f"### {item['chunker']} + {item['retriever']}")
        lines.append("")
        for row in item["queries"]:
            lines.append(f"- `{row['query']}`: precision={row['precision_at_k']:.3f}, avg_score={row['avg_score']:.3f}")
            for result in row["top_results"]:
                lines.append(f"  - {result['score']:.3f} `{result['source']}` - {result['preview']}")
        lines.append("")
    return "\n".join(lines)


def _load_queries(path: str | Path | None) -> list[dict[str, Any] | str] | None:
    if not path:
        return None
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate chunking and retrieval strategies.")
    parser.add_argument("--data-dir", default="data")
    parser.add_argument("--report-dir", default="report")
    parser.add_argument("--queries", help="JSON list of strings or {'query', 'gold_terms'} objects")
    parser.add_argument("--top-k", type=int, default=3)
    args = parser.parse_args()
    summary = run_evaluation(args.data_dir, args.report_dir, _load_queries(args.queries), args.top_k)
    best = summary["evaluations"][0]
    print(
        "best="
        f"{best['chunker']}+{best['retriever']} "
        f"precision@{summary['top_k']}={best['precision_at_k']:.3f}"
    )


if __name__ == "__main__":
    main()

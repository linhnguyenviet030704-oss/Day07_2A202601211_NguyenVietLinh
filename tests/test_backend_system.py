from __future__ import annotations

import base64
import json
import threading
from http.server import ThreadingHTTPServer
from urllib import request

import pytest

import backend.app as backend_app
import backend.service as backend_service
from backend.service import BackendService


def _b64(text: str) -> str:
    return base64.b64encode(text.encode()).decode()


def _post(url: str, payload: dict) -> dict:
    req = request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with request.urlopen(req, timeout=5) as response:
        return json.loads(response.read().decode())


def _get(url: str):
    with request.urlopen(url, timeout=5) as response:
        return json.loads(response.read().decode())


def test_backend_http_full_rag_lifecycle(tmp_path):
    backend_app.service = BackendService(tmp_path)
    server = ThreadingHTTPServer(("127.0.0.1", 0), backend_app.Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}"

    try:
        options = _get(f"{base_url}/options")
        assert options["theme"]["mode"] == "light"
        assert "document_structure" in options["chunking_strategies"]

        scan = _post(
            f"{base_url}/documents/scan",
            {
                "filename": "rag-guide.md",
                "content_b64": _b64("# RAG\nRetrieval finds context.\n\n## Chunking\nChunking shapes recall."),
                "chunking": {"strategy": "document_structure"},
            },
        )
        assert scan["hierarchy_ok"] is True
        assert scan["heading_levels"] == [1, 2]

        upload = _post(
            f"{base_url}/documents",
            {
                "filename": "rag-guide.md",
                "content_b64": _b64("# RAG\nRetrieval finds context.\n\n## Chunking\nChunking shapes recall."),
                "chunking": {"strategy": "document_structure", "chunk_size": 300},
                "embedding": {"provider": "mock", "model_name": "mock", "embedding_size": 64},
            },
        )
        assert upload["chunk_count"] == 2
        assert (tmp_path / "uploads" / "rag-guide.md").exists()
        assert (tmp_path / "indexes" / "documents.json").exists()

        chat = _post(f"{base_url}/chats", {"title": "RAG demo"})
        answer = _post(
            f"{base_url}/chats/{chat['id']}/messages",
            {"message": "What does retrieval find?", "retrieval": {"strategy": "bm25", "top_k": 1}},
        )
        item = answer["assistant"]["retrieved_items"][0]
        assert item["content"]
        assert item["similarity"] == 1 - item["distance"]
        assert 0 <= item["similarity"] <= 1

        persisted = _get(f"{base_url}/chats/{chat['id']}")
        assert [message["role"] for message in persisted["messages"]] == ["user", "assistant"]
        assert (tmp_path / "conversations" / f"{chat['id']}.json").exists()
    finally:
        server.shutdown()
        server.server_close()


def test_backend_scan_warns_on_bad_markdown_hierarchy(tmp_path):
    service = BackendService(tmp_path)

    scan = service.scan_document(
        "bad.md",
        _b64("# Title\n\n### Skipped level"),
        {"strategy": "document_structure"},
    )

    assert scan["is_markdown"] is True
    assert scan["hierarchy_ok"] is False
    assert scan["warnings"]


def test_backend_retrieval_options_return_similarity_cards(tmp_path):
    service = BackendService(tmp_path)
    service.upload_document(
        "python.md",
        _b64("# Python\nPython powers data pipelines and RAG applications."),
        {"strategy": "document_structure", "chunk_size": 300},
        {"provider": "mock", "model_name": "mock", "embedding_size": 64},
    )
    service.upload_document(
        "retrieval.md",
        _b64("# Retrieval\nBM25 and vector search retrieve relevant chunks."),
        {"strategy": "document_structure", "chunk_size": 300},
        {"provider": "mock", "model_name": "mock", "embedding_size": 64},
    )

    for strategy in ("bm25", "semantic", "bm25_vector", "bm25_vector_rerank"):
        results = service.retrieve("vector retrieval chunks", {"strategy": strategy, "top_k": 2})
        assert 0 < len(results) <= 2
        assert all("similarity" in item and "distance" in item for item in results)
        assert all(item["similarity"] == pytest.approx(1 - item["distance"]) for item in results)


def test_backend_voyage_upload_and_query_use_selected_model_size(monkeypatch, tmp_path):
    calls = []

    class FakeVoyageEmbedder:
        def __init__(self, provider, model_name, api_key, input_type, output_dimension):
            calls.append((provider, model_name, api_key, input_type, output_dimension))
            self.input_type = input_type

        def __call__(self, text):
            return [1.0, 0.0, 0.0] if self.input_type == "document" else [0.9, 0.1, 0.0]

        def embed(self, texts):
            return [self(text) for text in texts]

    monkeypatch.setattr(backend_service, "RequestEmbedder", FakeVoyageEmbedder)
    service = BackendService(tmp_path)
    service.upload_document(
        "voyage.md",
        _b64("# Voyage\nVoyage embeddings support selected dimensions."),
        {"strategy": "document_structure", "chunk_size": 300},
        {
            "provider": "voyage",
            "model_name": "voyage-4-lite",
            "embedding_size": 1024,
            "api_key": "test-key",
        },
    )

    results = service.retrieve("Voyage dimensions", {"strategy": "semantic", "top_k": 1})

    assert results
    assert calls[0] == ("voyage", "voyage-4-lite", "test-key", "document", 1024)
    assert calls[-1] == ("voyage", "voyage-4-lite", None, "query", 1024)


def test_backend_upload_batches_voyage_chunks_in_one_request(monkeypatch, tmp_path):
    batches = []

    class FakeVoyageEmbedder:
        def __init__(self, **_):
            pass

        def embed(self, texts):
            batches.append(texts)
            return [[1.0, 0.0, 0.0] for _ in texts]

    monkeypatch.setattr(backend_service, "RequestEmbedder", FakeVoyageEmbedder)
    service = BackendService(tmp_path)
    service.upload_document(
        "batch.md",
        _b64("# A\none\n\n## B\ntwo\n\n## C\nthree"),
        {"strategy": "document_structure", "chunk_size": 20},
        {
            "provider": "voyage",
            "model_name": "voyage-4",
            "embedding_size": 1024,
            "api_key": "test-key",
        },
    )

    assert len(batches) == 1
    assert len(batches[0]) == 3

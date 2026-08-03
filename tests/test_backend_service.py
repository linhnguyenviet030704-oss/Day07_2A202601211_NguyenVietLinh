import base64

import backend.service as backend_service
from backend.service import BackendService


def test_options_include_chunking_embedding_and_retrieval(tmp_path):
    service = BackendService(tmp_path)
    options = service.options()

    assert "semantic" in options["chunking_strategies"]
    assert "voyage-4-lite" in options["embedding_models"]
    assert set(options["embedding_models"]) == {"mock", "voyage-4", "voyage-4-lite", "voyage-4-large", "Vietnamese_Embedding"}
    assert 1024 in options["embedding_models"]["voyage-4-lite"]["sizes"]
    assert options["embedding_models"]["Vietnamese_Embedding"] == {
        "provider": "fpt",
        "sizes": [1024],
        "default_size": 1024,
    }
    assert options["embedding_models"]["voyage-4-lite"]["rate_limit"] == {"tpm": 10000, "rpm": 3}
    assert options["rate_limits"]["voyage"] == {"tpm": 10000, "rpm": 3}
    assert "bm25_vector_rerank" in options["retrieval_strategies"]
    assert set(options["chat_models"]) == {"local", "gemini", "gpt", "voyage"}


def test_upload_document_saves_file_and_indexes_chunks(tmp_path):
    service = BackendService(tmp_path)

    result = service.upload_document(
        filename="notes.txt",
        content_b64=base64.b64encode(b"Python helps RAG systems.\n\nChunking improves retrieval.").decode(),
        chunking={"strategy": "fixed_size", "chunk_size": 80, "overlap": 0},
        embedding={"provider": "mock", "model_name": "mock", "embedding_size": 64},
    )

    assert result["chunk_count"] == 1
    assert (tmp_path / "uploads" / "notes.txt").exists()
    assert (tmp_path / "indexes" / "documents.json").exists()


def test_list_documents_groups_uploaded_chunks(tmp_path):
    service = BackendService(tmp_path)

    uploaded = service.upload_document(
        filename="notes.txt",
        content_b64=base64.b64encode(b"Python helps RAG systems.\n\nChunking improves retrieval.").decode(),
        chunking={"strategy": "fixed_size", "chunk_size": 30, "overlap": 0},
        embedding={"provider": "mock", "model_name": "mock", "embedding_size": 64},
    )

    docs = service.list_documents()

    assert docs == [
        {
            "id": uploaded["doc_id"],
            "name": "notes.txt",
            "chunks_count": uploaded["chunk_count"],
            "created_at": docs[0]["created_at"],
        }
    ]


def test_scan_document_reports_markdown_hierarchy(tmp_path):
    service = BackendService(tmp_path)

    result = service.scan_document(
        filename="guide.md",
        content_b64=base64.b64encode(b"# Title\nIntro\n\n## Details\nMore").decode(),
        chunking={"strategy": "document_structure"},
    )

    assert result["is_markdown"]
    assert result["heading_count"] == 2
    assert result["heading_levels"] == [1, 2]
    assert result["hierarchy_ok"]


def test_hierarchy_chunking_rejects_non_markdown_upload(tmp_path):
    service = BackendService(tmp_path)

    try:
        service.upload_document(
            filename="notes.txt",
            content_b64=base64.b64encode(b"plain text without markdown headings").decode(),
            chunking={"strategy": "document_structure"},
            embedding={"provider": "mock", "model_name": "mock", "embedding_size": 64},
        )
    except ValueError as exc:
        assert "Markdown headings" in str(exc)
    else:
        raise AssertionError("expected hierarchy chunking validation to fail")


def test_upload_rejects_embedding_size_not_supported_by_model(tmp_path):
    service = BackendService(tmp_path)

    try:
            service.upload_document(
                filename="notes.txt",
                content_b64=base64.b64encode(b"hello").decode(),
                embedding={"provider": "voyage", "model_name": "voyage-4", "embedding_size": 999},
            )
    except ValueError as exc:
        assert "supports embedding sizes" in str(exc)
    else:
        raise AssertionError("expected invalid embedding size to fail")


def test_fpt_upload_uses_passage_input_type(monkeypatch, tmp_path):
    calls = []

    class FakeFptEmbedder:
        def __init__(self, **kwargs):
            calls.append(kwargs)

        def embed(self, texts):
            return [[1.0, 0.0, 0.0] for _ in texts]

    monkeypatch.setattr(backend_service, "RequestEmbedder", FakeFptEmbedder)
    service = BackendService(tmp_path)
    service.upload_document(
        filename="fpt.txt",
        content_b64=base64.b64encode(b"FPT Vietnamese embedding.").decode(),
        chunking={"strategy": "fixed_size", "chunk_size": 120, "overlap": 0},
        embedding={"provider": "fpt", "model_name": "Vietnamese_Embedding", "embedding_size": 1024},
    )

    assert calls[0]["provider"] == "fpt"
    assert calls[0]["model_name"] == "Vietnamese_Embedding"
    assert calls[0]["input_type"] == "passage"
    assert calls[0]["output_dimension"] == 1024


def test_chat_message_persists_retrieved_items_with_similarity(tmp_path):
    service = BackendService(tmp_path)
    service.upload_document(
        filename="rag.txt",
        content_b64=base64.b64encode(b"RAG retrieves supporting documents before answering.").decode(),
        chunking={"strategy": "fixed_size", "chunk_size": 120, "overlap": 0},
        embedding={"provider": "mock", "model_name": "mock", "embedding_size": 64},
    )
    chat = service.create_chat("Demo")

    result = service.add_message(
        chat["id"],
        "What does RAG retrieve?",
        retrieval={"strategy": "bm25", "top_k": 1},
    )

    assert result["assistant"]["retrieved_items"][0]["similarity"] <= 1
    assert result["assistant"]["retrieved_items"][0]["content"]
    assert result["assistant"]["chat_model"] == "voyage"
    assert result["assistant"]["model_used"] == "voyage-fallback"
    assert service.get_chat(chat["id"])["messages"][-1]["role"] == "assistant"


def test_create_chat_rejects_foreign_knowledge_base(tmp_path):
    service = BackendService(tmp_path)
    owner = service.create_user("Owner")
    other = service.create_user("Other")
    kb = service.create_knowledge_base(owner["id"], "Owner KB")

    try:
        service.create_chat("Wrong", user_id=other["id"], knowledge_base_id=kb["id"])
    except ValueError as exc:
        assert "does not belong" in str(exc)
    else:
        raise AssertionError("expected chat creation to reject a foreign knowledge base")


def test_request_chat_uses_selected_chat_model_with_fallback_generation(tmp_path):
    service = BackendService(tmp_path)

    result = service.request_chat(
        message="What is RAG?",
        retrieved_items=[{"content": "RAG retrieves context before generation.", "metadata": {"source": "rag.md"}}],
        chat_model="gpt",
        generation={"mode": "grounded_strict", "temperature": 0.1},
    )

    assert result["chat_model"] == "gpt"
    assert result["model_used"] == "gpt-fallback"
    assert "RAG retrieves context" in result["content"]


def test_user_knowledge_base_chat_and_retrieved_items_are_relational(tmp_path):
    service = BackendService(tmp_path)
    user = service.create_user("Linh")
    python_kb = service.create_knowledge_base(user["id"], "Python")
    finance_kb = service.create_knowledge_base(user["id"], "Finance")

    service.upload_document(
        filename="python.txt",
        content_b64=base64.b64encode(b"Python decorators wrap functions.").decode(),
        chunking={"strategy": "fixed_size", "chunk_size": 120, "overlap": 0},
        embedding={"provider": "mock", "model_name": "mock", "embedding_size": 64},
        knowledge_base_id=python_kb["id"],
    )
    service.upload_document(
        filename="finance.txt",
        content_b64=base64.b64encode(b"Revenue forecasts belong to finance planning.").decode(),
        chunking={"strategy": "fixed_size", "chunk_size": 120, "overlap": 0},
        embedding={"provider": "mock", "model_name": "mock", "embedding_size": 64},
        knowledge_base_id=finance_kb["id"],
    )

    chat = service.create_chat("Ask Python", user_id=user["id"], knowledge_base_id=python_kb["id"])
    answer = service.add_message(chat["id"], "What wraps functions?", {"strategy": "bm25", "top_k": 3})
    saved = service.get_chat(chat["id"])

    assert chat["knowledge_base_id"] == python_kb["id"]
    assert saved["user_id"] == user["id"]
    assert saved["knowledge_base_id"] == python_kb["id"]
    assert "Python decorators" in answer["assistant"]["retrieved_items"][0]["content"]
    assert all(item["metadata"]["knowledge_base_id"] == python_kb["id"] for item in answer["assistant"]["retrieved_items"])
    assert len(service.list_retrieved_items(saved["messages"][-1]["id"])) == len(answer["assistant"]["retrieved_items"])

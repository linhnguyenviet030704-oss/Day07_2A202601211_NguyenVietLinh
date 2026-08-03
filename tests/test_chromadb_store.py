from src.embeddings import _mock_embed
from src.models import Document
from src.store import EmbeddingStore


def test_embedding_store_persists_documents_in_chromadb(tmp_path):
    store = EmbeddingStore(
        collection_name="persist_test",
        embedding_fn=_mock_embed,
        persist_directory=tmp_path,
    )
    store.add_documents([Document(id="doc1", content="ChromaDB stores vectors.", metadata={})])

    reopened = EmbeddingStore(
        collection_name="persist_test",
        embedding_fn=_mock_embed,
        persist_directory=tmp_path,
    )

    assert reopened.get_collection_size() == 1
    assert reopened.search("vectors", top_k=1)[0]["id"] == "doc1"

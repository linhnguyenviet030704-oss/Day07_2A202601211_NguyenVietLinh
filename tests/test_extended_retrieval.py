from src import Document, EmbeddingStore, DocumentStructureChunker as ExportedStructureChunker, SemanticChunker as ExportedSemanticChunker
from src.chunking import DocumentStructureChunker, SemanticChunker


def test_semantic_chunker_groups_related_sentences():
    chunks = SemanticChunker(max_sentences_per_chunk=2).chunk(
        "Python is used for data work. Python has many libraries. "
        "Campus rules describe tuition deadlines."
    )
    assert chunks
    assert all(isinstance(chunk, str) for chunk in chunks)
    assert all(chunk.strip() == chunk for chunk in chunks)


def test_document_structure_chunker_keeps_markdown_sections():
    chunks = DocumentStructureChunker(chunk_size=80).chunk(
        "# Admissions\nApply before May.\n\n# Tuition\nPay fees by June."
    )
    assert chunks[0].startswith("# Admissions")
    assert any(chunk.startswith("# Tuition") for chunk in chunks)


def test_store_builds_hnsw_graph_and_supports_four_retrieval_strategies():
    store = EmbeddingStore("extended")
    store.add_documents(
        [
            Document("py", "Python programming language and data science", {"doc_id": "py"}),
            Document("ml", "Machine learning algorithms learn from data", {"doc_id": "ml"}),
            Document("fees", "University tuition fees and payment deadlines", {"doc_id": "fees"}),
        ]
    )

    assert store._hnsw_graph
    for strategy in ("bm25", "semantic", "hybrid", "rerank"):
        results = store.retrieve("machine learning data", top_k=2, strategy=strategy)
        assert 0 < len(results) <= 2
        assert {"content", "metadata", "score"} <= results[0].keys()

    for strategy in ("vector", "bm25_vector", "bm25_vector_rerank"):
        assert store.retrieve("machine learning data", top_k=1, strategy=strategy)


def test_new_chunkers_are_exported_from_src_package():
    assert ExportedSemanticChunker is SemanticChunker
    assert ExportedStructureChunker is DocumentStructureChunker

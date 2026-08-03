import assert from 'node:assert/strict';
import test from 'node:test';
import {
  mapChunkingStrategy,
  mapEmbeddingOptions,
  mapRetrievalOptions,
  selectVoyageRateLimit,
  toRetrievedItem
} from './backendClient.ts';

test('maps frontend upload options to backend contract', () => {
  assert.deepEqual(mapChunkingStrategy({
    chunkingStrategy: 'markdown_header',
    chunkSize: 512,
    chunkOverlap: 64,
    embeddingModel: 'mock',
    embeddingDimension: 64
  }), {
    strategy: 'document_structure',
    chunk_size: 512,
    overlap: 64
  });

  assert.deepEqual(mapEmbeddingOptions({
    chunkingStrategy: 'recursive',
    chunkSize: 256,
    chunkOverlap: 20,
    embeddingModel: 'mock',
    embeddingDimension: 64
  }), {
    provider: 'mock',
    model_name: 'mock',
    embedding_size: 64
  });

  assert.deepEqual(mapEmbeddingOptions({
    chunkingStrategy: 'recursive',
    chunkSize: 256,
    chunkOverlap: 20,
    embeddingModel: 'Vietnamese_Embedding',
    embeddingDimension: 1024
  }), {
    provider: 'fpt',
    model_name: 'Vietnamese_Embedding',
    embedding_size: 1024
  });
});

test('maps retrieval options and backend cards to frontend shape', () => {
  assert.deepEqual(mapRetrievalOptions({
    retrievalMethod: 'hybrid_bm25',
    topK: 2,
    minSimilarityThreshold: 0.4,
    hybridAlpha: 0.7,
    chatModel: 'gpt',
    generationMode: 'grounded_strict',
    temperature: 0.2,
    filterDocIds: []
  }), {
    strategy: 'bm25_vector',
    top_k: 2,
    chat_model: 'gpt',
    generation: { mode: 'grounded_strict', temperature: 0.2 },
    filter_doc_ids: []
  });

  const item = toRetrievedItem({
    id: 'doc1::chunk_0',
    content: 'Python powers RAG.',
    metadata: { doc_id: 'doc1', chunk_index: 0, source: 'backend/storage/uploads/python.md' },
    distance: 0.125,
    similarity: 0.875
  }, 'hybrid_bm25');

  assert.equal(item.chunk.documentName, 'python.md');
  assert.equal(item.scoreFormatted, '87.5%');
  assert.equal(item.retrievalMethodUsed, 'hybrid_bm25');
});

test('reads voyage rate limit from backend options with default fallback', () => {
  assert.deepEqual(selectVoyageRateLimit({ rate_limits: { voyage: { tpm: 10000, rpm: 3 } } }), {
    tpm: 10000,
    rpm: 3
  });
  assert.deepEqual(selectVoyageRateLimit(), { tpm: 10000, rpm: 3 });
});

import {
  DocumentIngestOptions,
  KnowledgeBase,
  RAGDocument,
  RetrievalMethod,
  RetrievalOptions,
  RetrievedChunkResult
} from './types';

const API_BASE = '/backend';
export const DEFAULT_VOYAGE_RATE_LIMIT = { tpm: 10000, rpm: 3 };

export type VoyageRateLimit = typeof DEFAULT_VOYAGE_RATE_LIMIT;

export type BackendOptions = {
  rate_limits?: { voyage?: VoyageRateLimit };
  embedding_models?: Record<string, { rate_limit?: VoyageRateLimit }>;
};

export function selectVoyageRateLimit(options?: BackendOptions): VoyageRateLimit {
  return options?.rate_limits?.voyage || DEFAULT_VOYAGE_RATE_LIMIT;
}

export function mapChunkingStrategy(options: DocumentIngestOptions) {
  const strategy = {
    fixed_window: 'fixed_size',
    semantic_paragraph: 'semantic',
    sentence: 'semantic',
    markdown_header: 'document_structure',
    recursive: 'recursive',
  }[options.chunkingStrategy];

  return {
    strategy,
    chunk_size: options.chunkSize,
    overlap: options.chunkOverlap,
  };
}

export function mapEmbeddingOptions(options: DocumentIngestOptions) {
  if (options.embeddingModel === 'Vietnamese_Embedding') {
    return {
      provider: 'fpt',
      model_name: 'Vietnamese_Embedding',
      embedding_size: options.embeddingDimension,
    };
  }
  if (options.embeddingModel === 'mock' || !options.embeddingModel.startsWith('voyage-')) {
    return { provider: 'mock', model_name: 'mock', embedding_size: 64 };
  }
  return {
    provider: 'voyage',
    model_name: options.embeddingModel,
    embedding_size: options.embeddingDimension,
  };
}

export function mapRetrievalOptions(options: RetrievalOptions) {
  const strategy: Record<RetrievalMethod, string> = {
    dense_cosine: 'semantic',
    hybrid_bm25: 'bm25_vector',
    multi_query: 'bm25_vector',
    reranked: 'bm25_vector_rerank',
  };
  return {
    strategy: strategy[options.retrievalMethod],
    top_k: options.topK,
    chat_model: options.chatModel,
    generation: { mode: options.generationMode, temperature: options.temperature },
    filter_doc_ids: options.filterDocIds || [],
  };
}

export async function listKnowledgeBases() {
  return api<KnowledgeBase[]>('/knowledge-bases');
}

export async function getBackendOptions() {
  return api<BackendOptions>('/options');
}

export async function createKnowledgeBase(name: string) {
  return api<KnowledgeBase>('/knowledge-bases', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function listDocuments(knowledgeBaseId?: string) {
  const query = knowledgeBaseId ? `?knowledge_base_id=${encodeURIComponent(knowledgeBaseId)}` : '';
  return api<any[]>(`/documents${query}`);
}

export async function createChat(title: string, knowledgeBaseId?: string) {
  return api<any>('/chats', {
    method: 'POST',
    body: JSON.stringify({ title, knowledge_base_id: knowledgeBaseId }),
  });
}

export async function sendChatMessage(chatId: string, message: string, options: RetrievalOptions) {
  return api<any>(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, retrieval: mapRetrievalOptions(options) }),
  });
}

export async function uploadDocument(
  fileData: { name: string; content: string },
  options: DocumentIngestOptions,
  knowledgeBaseId?: string
) {
  return api<any>('/documents', {
    method: 'POST',
    body: JSON.stringify({
      filename: fileData.name,
      content_b64: toBase64(fileData.content),
      chunking: mapChunkingStrategy(options),
      embedding: mapEmbeddingOptions(options),
      knowledge_base_id: knowledgeBaseId,
    }),
  });
}

export function toRagDocument(doc: any): RAGDocument {
  return {
    id: doc.id,
    name: doc.name,
    fileType: doc.name?.split('.').pop() || 'txt',
    sizeBytes: 0,
    uploadedAt: doc.created_at,
    ingestOptions: {
      chunkingStrategy: 'recursive',
      chunkSize: 0,
      chunkOverlap: 0,
      embeddingModel: 'mock',
      embeddingDimension: 64,
    },
    chunksCount: doc.chunks_count,
    chunks: [],
    status: 'ready',
  };
}

export function toRetrievedItem(item: any, method: RetrievalMethod): RetrievedChunkResult {
  const source = String(item.metadata?.source || item.metadata?.doc_id || 'document.txt').replace(/\\/g, '/');
  const documentName = source.split('/').pop() || 'document.txt';
  const similarity = Number(item.similarity ?? 0);
  const content = String(item.content || '');
  return {
    chunk: {
      id: item.id,
      documentId: item.metadata?.doc_id || item.id,
      documentName,
      chunkIndex: Number(item.metadata?.chunk_index ?? 0),
      content,
      tokenCount: content.split(/\s+/).filter(Boolean).length,
      characterCount: content.length,
    },
    distance: Number(item.distance ?? 1 - similarity),
    similarity,
    scoreFormatted: `${(similarity * 100).toFixed(1)}%`,
    matchedTerms: [],
    retrievalMethodUsed: method,
  };
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(data?.error || response.statusText);
  return data;
}

function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

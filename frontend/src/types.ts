export type ChunkingStrategy = 
  | 'recursive'
  | 'fixed_window'
  | 'semantic_paragraph'
  | 'sentence'
  | 'markdown_header';

export type EmbeddingModel = 
  | 'mock'
  | 'Vietnamese_Embedding'
  | 'voyage-4-large'
  | 'voyage-4'
  | 'voyage-4-lite'
  | 'text-embedding-004'
  | 'text-embedding-3-small'
  | 'bge-large-en-v1.5'
  | 'nomic-embed-text-v1'
  | 'multilingual-e5-large';

export const EMBEDDING_MODEL_DETAILS: Record<EmbeddingModel, {
  name: string;
  provider: string;
  description: string;
  allowedDimensions: number[];
  defaultDimension: number;
}> = {
  'mock': {
    name: 'Mock Embedding',
    provider: 'Local',
    description: 'Deterministic local embedding, no API key required.',
    allowedDimensions: [64],
    defaultDimension: 64
  },
  'Vietnamese_Embedding': {
    name: 'FPT Vietnamese Embedding',
    provider: 'FPT Cloud',
    description: 'Vietnamese embedding API qua FPT Cloud Marketplace.',
    allowedDimensions: [1024],
    defaultDimension: 1024
  },
  'voyage-4-large': {
    name: 'Voyage 4 Large',
    provider: 'Voyage AI',
    description: 'Voyage API embedding model.',
    allowedDimensions: [2048, 1024, 512, 256],
    defaultDimension: 1024
  },
  'voyage-4': {
    name: 'Voyage 4',
    provider: 'Voyage AI',
    description: 'Voyage API embedding model.',
    allowedDimensions: [2048, 1024, 512, 256],
    defaultDimension: 1024
  },
  'voyage-4-lite': {
    name: 'Voyage 4 Lite',
    provider: 'Voyage AI',
    description: 'Voyage API embedding model.',
    allowedDimensions: [2048, 1024, 512, 256],
    defaultDimension: 1024
  },
  'text-embedding-004': {
    name: 'Gemini Text Embedding 004',
    provider: 'Google AI',
    description: 'Mô hình embedding thế hệ mới nhất của Google, tối ưu tốt đa ngôn ngữ & ngữ cảnh RAG',
    allowedDimensions: [768, 512, 256, 128],
    defaultDimension: 768
  },
  'text-embedding-3-small': {
    name: 'Text Embedding 3 Small',
    provider: 'OpenAI Compatible',
    description: 'Mô hình nhỏ gọn, độ chính xác cao và tốc độ truy vấn vượt trội',
    allowedDimensions: [1536, 1024, 512, 256],
    defaultDimension: 1536
  },
  'bge-large-en-v1.5': {
    name: 'BGE Large En/Vi v1.5',
    provider: 'BAAI Open Source',
    description: 'Mô hình BAAI chuyên dụng cho RAG retrieval & reranking',
    allowedDimensions: [1024, 512],
    defaultDimension: 1024
  },
  'nomic-embed-text-v1': {
    name: 'Nomic Embed Text v1.5',
    provider: 'Nomic AI',
    description: 'Chuyên dụng cho kho văn bản dài và ngữ cảnh đa dạng',
    allowedDimensions: [768, 512],
    defaultDimension: 768
  },
  'multilingual-e5-large': {
    name: 'Multilingual E5 Large',
    provider: 'Microsoft AI',
    description: 'Hiệu suất cao cho tài liệu tiếng Việt và đa ngôn ngữ chuyên sâu',
    allowedDimensions: [1024, 768, 512],
    defaultDimension: 1024
  }
};

export const CHUNKING_STRATEGY_DETAILS: Record<ChunkingStrategy, {
  name: string;
  description: string;
  recommendation: string;
}> = {
  'recursive': {
    name: 'Recursive Character (Lặp ký tự)',
    description: 'Tách đoạn văn bản thông minh theo các dấu câu, ký tự xuống dòng và khoảng trắng.',
    recommendation: 'Khuyến nghị cho hầu hết tài liệu chung, văn bản hành chính & báo cáo.'
  },
  'semantic_paragraph': {
    name: 'Semantic Paragraph (Đoạn văn Ý nghĩa)',
    description: 'Gộp các câu/đoạn có tính liên kết chủ đề cao dựa trên sự tương đồng nội dung.',
    recommendation: 'Thích hợp cho sách, bài viết nghiên cứu, tài liệu diễn giải sâu.'
  },
  'fixed_window': {
    name: 'Fixed Window (Cửa sổ cố định)',
    description: 'Cắt văn bản theo chính xác số lượng token/ký tự cố định kết hợp overlap.',
    recommendation: 'Phù hợp khi cần kiểm soát chính xác bộ nhớ vector.'
  },
  'sentence': {
    name: 'Sentence Level (Theo từng câu)',
    description: 'Phân đoạn dựa theo các điểm kết thúc câu độc lập.',
    recommendation: 'Tốt cho FAQ, bộ câu hỏi trả lời ngắn và định nghĩa khái niệm.'
  },
  'markdown_header': {
    name: 'Header & Section (Tiêu đề & Mục)',
    description: 'Phân đoạn theo cấu trúc H1, H2, H3 của tài liệu Markdown/HTML.',
    recommendation: 'Hoàn hảo cho tài liệu kỹ thuật, Wiki, API Docs.'
  }
};

export interface DocumentIngestOptions {
  chunkingStrategy: ChunkingStrategy;
  chunkSize: number;
  chunkOverlap: number;
  embeddingModel: EmbeddingModel;
  embeddingDimension: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  characterCount: number;
  embedding?: number[];
  metadata?: {
    pageNumber?: number;
    sectionTitle?: string;
  };
}

export interface RAGDocument {
  id: string;
  name: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt: string;
  ingestOptions: DocumentIngestOptions;
  chunksCount: number;
  chunks: DocumentChunk[];
  status: 'ready' | 'processing' | 'error';
  statusMessage?: string;
}

export interface KnowledgeBase {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  documents_count: number;
}

export type RetrievalMethod = 'dense_cosine' | 'hybrid_bm25' | 'multi_query' | 'reranked';
export type RAGGenerationMode = 'grounded_strict' | 'analytical_synthesis' | 'creative_contextual';
export type ChatModel = 'local' | 'gemini' | 'gpt' | 'voyage';

export interface RetrievalOptions {
  retrievalMethod: RetrievalMethod;
  topK: number;
  minSimilarityThreshold: number; // 0.0 -> 1.0
  hybridAlpha: number; // 0.0 (dense) -> 1.0 (sparse)
  chatModel: ChatModel;
  generationMode: RAGGenerationMode;
  temperature: number;
  filterDocIds?: string[];
}

export interface RetrievedChunkResult {
  chunk: DocumentChunk;
  distance: number;       // e.g. 0.108
  similarity: number;     // 1 - distance, e.g. 0.892
  scoreFormatted: string; // "89.2%"
  matchedTerms: string[];
  retrievalMethodUsed: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  retrievedItems?: RetrievedChunkResult[];
  retrievalOptionsUsed?: RetrievalOptions;
  executionTimeMs?: number;
  modelUsed?: string;
  tokensUsed?: {
    prompt: number;
    completion: number;
  };
}

export interface ChatSession {
  id: string;
  backendChatId?: string;
  knowledgeBaseId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  activeDocIds: string[];
  retrievalOptions: RetrievalOptions;
}

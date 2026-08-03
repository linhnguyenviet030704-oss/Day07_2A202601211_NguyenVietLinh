import {
  DocumentChunk,
  DocumentIngestOptions,
  RAGDocument,
  RetrievalOptions,
  RetrievedChunkResult,
} from '../types';

// Simple Hash Vector Generator for high-quality client-side vector representations fallback
function generateTextEmbedding(text: string, dim: number): number[] {
  const vec = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, ' ').split(/\s+/).filter(Boolean);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    for (let d = 0; d < dim; d++) {
      const weight = Math.sin(hash + d * 0.17 + i * 0.05);
      vec[d] += weight;
    }
  }

  // L2 normalize
  let norm = 0;
  for (let d = 0; d < dim; d++) norm += vec[d] * vec[d];
  norm = Math.sqrt(norm) || 1;
  for (let d = 0; d < dim; d++) vec[d] /= norm;

  return vec;
}

// Calculate Cosine Distance and Cosine Similarity
export function calculateVectorDistanceAndSimilarity(vecA: number[], vecB: number[]): { distance: number; similarity: number } {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return { distance: 1.0, similarity: 0.0 };
  }

  const minLen = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return { distance: 1.0, similarity: 0.0 };
  }

  const cosineSim = Math.max(-1.0, Math.min(1.0, dotProduct / (normA * normB)));
  // Cosine distance = 1 - cosine similarity
  // Normalized to [0, 1] range
  const similarity = Math.max(0, Math.min(1, (cosineSim + 1) / 2));
  const distance = Math.max(0, 1 - similarity);

  return { distance, similarity };
}

// Text Chunking Logic
export function chunkTextContent(
  text: string,
  docId: string,
  docName: string,
  options: DocumentIngestOptions
): DocumentChunk[] {
  const { chunkingStrategy, chunkSize, chunkOverlap, embeddingDimension } = options;
  const rawChunks: string[] = [];

  const effectiveChunkSize = Math.max(100, chunkSize * 4); // Approx 4 chars per token
  const effectiveOverlap = Math.min(effectiveChunkSize / 2, chunkOverlap * 4);

  if (chunkingStrategy === 'markdown_header') {
    // Split by Markdown Headers #, ##, ###
    const sections = text.split(/(?=\n#{1,4}\s)/g);
    for (const section of sections) {
      if (section.trim().length > 0) {
        if (section.length > effectiveChunkSize) {
          // Fallback split for long sections
          for (let i = 0; i < section.length; i += effectiveChunkSize - effectiveOverlap) {
            rawChunks.push(section.slice(i, i + effectiveChunkSize));
          }
        } else {
          rawChunks.push(section.trim());
        }
      }
    }
  } else if (chunkingStrategy === 'semantic_paragraph') {
    // Split by double newlines (paragraphs)
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    for (const p of paragraphs) {
      if ((currentChunk + '\n\n' + p).length <= effectiveChunkSize) {
        currentChunk = currentChunk ? currentChunk + '\n\n' + p : p;
      } else {
        if (currentChunk) rawChunks.push(currentChunk);
        currentChunk = p;
      }
    }
    if (currentChunk) rawChunks.push(currentChunk);
  } else if (chunkingStrategy === 'sentence') {
    // Split by sentence terminators
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';
    for (const s of sentences) {
      if ((currentChunk + ' ' + s).length <= effectiveChunkSize) {
        currentChunk = currentChunk ? currentChunk + ' ' + s : s;
      } else {
        if (currentChunk) rawChunks.push(currentChunk.trim());
        currentChunk = s;
      }
    }
    if (currentChunk) rawChunks.push(currentChunk.trim());
  } else if (chunkingStrategy === 'fixed_window') {
    // Fixed window sliding split
    const step = Math.max(20, effectiveChunkSize - effectiveOverlap);
    for (let i = 0; i < text.length; i += step) {
      const chunk = text.slice(i, i + effectiveChunkSize);
      if (chunk.trim().length > 0) {
        rawChunks.push(chunk);
      }
    }
  } else {
    // Recursive character strategy (default)
    const separators = ['\n\n', '\n', '. ', ' ', ''];
    function splitRecursive(input: string, sepIndex: number): string[] {
      if (input.length <= effectiveChunkSize || sepIndex >= separators.length) {
        return [input];
      }
      const sep = separators[sepIndex];
      const parts = input.split(sep);
      const result: string[] = [];
      let buffer = '';

      for (const part of parts) {
        const candidate = buffer ? buffer + sep + part : part;
        if (candidate.length <= effectiveChunkSize) {
          buffer = candidate;
        } else {
          if (buffer) result.push(buffer);
          if (part.length > effectiveChunkSize) {
            result.push(...splitRecursive(part, sepIndex + 1));
            buffer = '';
          } else {
            buffer = part;
          }
        }
      }
      if (buffer) result.push(buffer);
      return result;
    }

    rawChunks.push(...splitRecursive(text, 0));
  }

  // Filter empty chunks & build Chunk objects with embeddings
  return rawChunks
    .map(c => c.trim())
    .filter(c => c.length > 10)
    .map((content, idx) => {
      const charCount = content.length;
      const tokenEst = Math.ceil(charCount / 4);
      const embedding = generateTextEmbedding(content, embeddingDimension);

      // Detect optional section header
      const headerMatch = content.match(/^(#{1,4}\s+[^\n]+)/);
      const sectionTitle = headerMatch ? headerMatch[1] : `Phân đoạn #${idx + 1}`;

      return {
        id: `${docId}_chunk_${idx + 1}`,
        documentId: docId,
        documentName: docName,
        chunkIndex: idx + 1,
        content,
        characterCount: charCount,
        tokenCount: tokenEst,
        embedding,
        metadata: {
          pageNumber: Math.floor(idx / 3) + 1,
          sectionTitle
        }
      };
    });
}

// Perform Vector & Hybrid Retrieval
export function performRAGRetrieval(
  query: string,
  documents: RAGDocument[],
  options: RetrievalOptions
): RetrievedChunkResult[] {
  const {
    retrievalMethod,
    topK,
    minSimilarityThreshold,
    hybridAlpha,
    filterDocIds
  } = options;

  // Gather active chunks
  let activeChunks: DocumentChunk[] = [];
  for (const doc of documents) {
    if (doc.status === 'ready' && (!filterDocIds || filterDocIds.length === 0 || filterDocIds.includes(doc.id))) {
      activeChunks.push(...doc.chunks);
    }
  }

  if (activeChunks.length === 0) {
    return [];
  }

  // Get query embedding dimension from first chunk
  const dim = activeChunks[0]?.embedding?.length || 768;
  const queryVec = generateTextEmbedding(query, dim);
  const queryTerms = query.toLowerCase().replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, ' ').split(/\s+/).filter(w => w.length > 2);

  const results: RetrievedChunkResult[] = activeChunks.map(chunk => {
    // 1. Dense Cosine Distance
    const chunkVec = chunk.embedding || generateTextEmbedding(chunk.content, dim);
    const { distance: denseDist, similarity: denseSim } = calculateVectorDistanceAndSimilarity(queryVec, chunkVec);

    // 2. BM25 Sparse Match Score
    const chunkTextLower = chunk.content.toLowerCase();
    let termHits = 0;
    const matchedTerms: string[] = [];

    for (const term of queryTerms) {
      if (chunkTextLower.includes(term)) {
        termHits++;
        if (!matchedTerms.includes(term)) matchedTerms.push(term);
      }
    }

    const bm25Score = queryTerms.length > 0 ? termHits / queryTerms.length : 0;

    // 3. Score Combination according to retrieval method
    let finalSimilarity = denseSim;

    if (retrievalMethod === 'hybrid_bm25') {
      // hybridAlpha weight between Dense (1-alpha) and Sparse (alpha)
      finalSimilarity = (1 - hybridAlpha) * denseSim + hybridAlpha * bm25Score;
    } else if (retrievalMethod === 'multi_query') {
      // Boost if multiple matching terms
      finalSimilarity = Math.min(1.0, denseSim * (1 + 0.15 * termHits));
    } else if (retrievalMethod === 'reranked') {
      // Cross-Encoder rerank simulation: header bonus & term match bonus
      const hasHeaderBonus = chunk.metadata?.sectionTitle ? 0.05 : 0;
      finalSimilarity = Math.min(1.0, denseSim * 0.8 + bm25Score * 0.15 + hasHeaderBonus);
    }

    // Formula required by user prompt: similarity = 1 - distance
    const finalDistance = Math.max(0, 1 - finalSimilarity);
    const scoreFormatted = `${(finalSimilarity * 100).toFixed(1)}%`;

    return {
      chunk,
      distance: Number(finalDistance.toFixed(4)),
      similarity: Number(finalSimilarity.toFixed(4)),
      scoreFormatted,
      matchedTerms,
      retrievalMethodUsed: retrievalMethod
    };
  });

  // Filter by minSimilarityThreshold
  const filtered = results.filter(r => r.similarity >= minSimilarityThreshold);

  // Sort descending by similarity score
  filtered.sort((a, b) => b.similarity - a.similarity);

  // Return topK
  return filtered.slice(0, topK);
}

// Sample Pre-loaded Documents for rich instant interaction
export const INITIAL_SAMPLE_DOCUMENTS: RAGDocument[] = [
  {
    id: 'doc_rag_handbook_2026',
    name: 'Sổ_Tay_Kiến_Trúc_RAG_Và_AI_2026.md',
    fileType: 'markdown',
    sizeBytes: 18400,
    uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'ready',
    chunksCount: 6,
    ingestOptions: {
      chunkingStrategy: 'recursive',
      chunkSize: 512,
      chunkOverlap: 50,
      embeddingModel: 'text-embedding-004',
      embeddingDimension: 768
    },
    chunks: []
  },
  {
    id: 'doc_finance_plan_2026',
    name: 'Báo_Cáo_Đầu_Tư_Và_Kế_Hoạch_Kinh_Doanh.txt',
    fileType: 'txt',
    sizeBytes: 12500,
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'ready',
    chunksCount: 5,
    ingestOptions: {
      chunkingStrategy: 'semantic_paragraph',
      chunkSize: 512,
      chunkOverlap: 40,
      embeddingModel: 'multilingual-e5-large',
      embeddingDimension: 1024
    },
    chunks: []
  }
];

// Content for Sample Documents
export const SAMPLE_DOC_CONTENTS: Record<string, string> = {
  'doc_rag_handbook_2026': `# Sổ Tay Architecture RAG (Retrieval-Augmented Generation) 2026

## 1. Tổng quan về Hệ thống RAG Thông Minh
RAG (Retrieval-Augmented Generation) là kiến trúc kết hợp giữa mô hình truy vấn thông tin (Information Retrieval - IR) và mô hình ngôn ngữ lớn (LLM). Hệ thống cho phép LLM truy xuất các thông tin chính xác từ kho tri thức nội bộ mà không cần tinh chỉnh (fine-tuning) lại trọng số mô hình.

### Các thành phần chính trong Pipeline RAG:
1. **Document Ingestion & Segmentation**: Nạp tài liệu, làm sạch và phân đoạn (Chunking) theo kích thước phù hợp.
2. **Embedding Calculation**: Chuyển đổi các đoạn văn bản (chunks) thành các vectơ biểu diễn không gian ngữ nghĩa (Dense Vector Space).
3. **Vector Database / Store**: Lưu trữ vectơ cùng thông tin metadata (nguồn tài liệu, số trang, chunk ID).
4. **Context Retrieval**: Tìm kiếm các chunk tương đồng nhất với câu hỏi người dùng dựa trên độ đo khoảng cách (Distance Metric) như Cosine Distance, Euclidean Distance.
5. **Augmented Prompting & Response Generation**: Đưa các chunk đã retrieve vào System Prompt gửi đến mô hình Gemini 3.6 Flash để tổng hợp câu trả lời chính xác.

## 2. Đo Lường Độ Tương Đồng (Similarity Metric)
Trong các hệ thống RAG chuẩn hóa, độ tương đồng giữa câu hỏi và tài liệu được tính dựa trên công thức trực quan:
\`\`\`text
Similarity = 1 - Distance
\`\`\`
Trong đó:
- **Cosine Distance = 1 - Cosine Similarity**
- Khi Distance = 0.10, Similarity = 0.90 (Độ tương đồng 90% - rất cao).
- Chỉ số Similarity càng tiến gần 1.0 (100%), đoạn văn bản càng phù hợp và liên quan mật thiết đến truy vấn của người dùng.

## 3. Chiến lược Phân đoạn (Chunking Strategy)
- **Recursive Character**: Phân đoạn linh hoạt theo ký tự lặp, bảo toàn tính liên tục ngữ nghĩa.
- **Semantic Paragraph**: Cắt theo đoạn văn ý nghĩa, thích hợp cho báo cáo phân tích sâu.
- **Fixed Size Window**: Cắt theo kích thước cố định token/ký tự kèm độ chồng lấp (Overlap).
- **Header & Section**: Cắt dựa trên tiêu đề Markdown (H1, H2, H3), phù hợp với tài liệu API & hướng dẫn kỹ thuật.

## 4. Các Tham Số Truy Vấn (Retrieving Options)
- **Retrieval Method**: Dense Cosine Search, Hybrid (Dense + BM25), Multi-Query Expansion, Reranked.
- **Top-K**: Số lượng đoạn văn bản tối đa được trích xuất gửi cho LLM (thường từ 3 đến 6 chunks).
- **Similarity Threshold**: Ngưỡng độ tương đồng tối thiểu (vd: 0.45) để loại bỏ các thông tin rác.`,

  'doc_finance_plan_2026': `BÁO CÁO KẾ HOẠCH ĐẦU TƯ CÔNG NGHỆ VÀ TÀI CHÍNH DOANH NGHIỆP 2026

I. TỔNG QUAN TÀI CHÍNH QUÝ I & QUÝ II 2026
- Tổng doanh thu dự kiến năm 2026: 150 tỷ VNĐ (Tăng trưởng 35% so với năm 2025).
- Ngân sách dành cho Nghiên cứu & Phát triển AI/RAG: 25 tỷ VNĐ.
- Chi phí cơ sở hạ tầng đám mây (Cloud Server & Vector DB): 4.5 tỷ VNĐ/năm.
- Lợi nhuận trước thuế ước tính: 42 tỷ VNĐ.

II. KẾ HOẠCH TRIỂN KHAI TRÍ TUỆ NHÂN TẠO RAG TẠI CÁC PHÒNG BAN
1. Khối Chăm sóc Khách hàng (Customer Support):
- Triển khai RAG Chatbot tự động trả lời 85% thắc mắc thường gặp về dịch vụ.
- Thời gian phản hồi trung bình giảm từ 5 phút xuống dưới 3 giây.
- Tiết kiệm 1.2 tỷ VNĐ chi phí vận hành hàng tháng.

2. Khối Quản trị Tri thức Nội bộ (Knowledge Management):
- Tích hợp mô hình Google Gemini 3.6 Flash để tra cứu quy trình nhân sự, hợp đồng kinh doanh.
- Áp dụng chiến lược Embedding model Multilingual E5 Large với độ phân giải Vector 1024 chiều.
- Ngưỡng truy xuất Similarity cutoff đạt 0.75 giúp loại bỏ 99% câu trả lời sai lệch.

III. QUY TRÌNH QUẢN LÝ RỦI RỎ VÀ BẢO MẬT DỮ LIỆU
- Mọi dữ liệu tài liệu upload lên hệ thống RAG được mã hóa AES-256 trên server.
- Phân quyền truy cập theo vai trò (RBAC): Chỉ nhân sự cấp Quản lý mới có quyền xem tài liệu tài chính.`
};

// Initialize Sample Chunks
INITIAL_SAMPLE_DOCUMENTS[0].chunks = chunkTextContent(
  SAMPLE_DOC_CONTENTS['doc_rag_handbook_2026'],
  INITIAL_SAMPLE_DOCUMENTS[0].id,
  INITIAL_SAMPLE_DOCUMENTS[0].name,
  INITIAL_SAMPLE_DOCUMENTS[0].ingestOptions
);
INITIAL_SAMPLE_DOCUMENTS[0].chunksCount = INITIAL_SAMPLE_DOCUMENTS[0].chunks.length;

INITIAL_SAMPLE_DOCUMENTS[1].chunks = chunkTextContent(
  SAMPLE_DOC_CONTENTS['doc_finance_plan_2026'],
  INITIAL_SAMPLE_DOCUMENTS[1].id,
  INITIAL_SAMPLE_DOCUMENTS[1].name,
  INITIAL_SAMPLE_DOCUMENTS[1].ingestOptions
);
INITIAL_SAMPLE_DOCUMENTS[1].chunksCount = INITIAL_SAMPLE_DOCUMENTS[1].chunks.length;

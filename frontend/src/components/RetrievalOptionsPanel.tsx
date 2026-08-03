import React from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Layers,
  CheckCircle2,
  Filter,
  FileText,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';
import {
  ChatModel,
  RAGDocument,
  RAGGenerationMode,
  RetrievalMethod,
  RetrievalOptions
} from '../types';

interface RetrievalOptionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  options: RetrievalOptions;
  onChangeOptions: (newOptions: RetrievalOptions) => void;
  documents: RAGDocument[];
}

export const RetrievalOptionsPanel: React.FC<RetrievalOptionsPanelProps> = ({
  isOpen,
  onClose,
  options,
  onChangeOptions,
  documents,
}) => {
  if (!isOpen) return null;

  const updateOption = <K extends keyof RetrievalOptions>(key: K, value: RetrievalOptions[K]) => {
    onChangeOptions({
      ...options,
      [key]: value
    });
  };

  const toggleDocFilter = (docId: string) => {
    const current = options.filterDocIds || [];
    const updated = current.includes(docId)
      ? current.filter(id => id !== docId)
      : [...current, docId];
    updateOption('filterDocIds', updated);
  };

  const resetToDefault = () => {
    onChangeOptions({
      retrievalMethod: 'dense_cosine',
      topK: 4,
      minSimilarityThreshold: 0.45,
      hybridAlpha: 0.7,
      chatModel: 'voyage',
      generationMode: 'grounded_strict',
      temperature: 0.2,
      filterDocIds: []
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Tham Số Retrieving & RAG Generation
              </h3>
              <p className="text-[11px] text-slate-500">
                Tùy chỉnh thuật toán phục hồi tri thức cho cuộc trò chuyện
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar text-xs">
          {/* 1. Retrieval Method */}
          <div className="space-y-2.5">
            <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>1. Phương Thức Phục Hồi (Retrieval Method)</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'dense_cosine',
                  title: 'Dense Vector Search (Cosine)',
                  desc: 'Tìm kiếm không gian ngữ nghĩa với công thức similarity = 1 - distance.'
                },
                {
                  id: 'hybrid_bm25',
                  title: 'Hybrid (Dense Vector + BM25 Sparse)',
                  desc: 'Kết hợp ngữ nghĩa và trùng khớp từ khóa chính xác.'
                },
                {
                  id: 'multi_query',
                  title: 'Multi-Query Expansion',
                  desc: 'Tăng cường biến thể câu hỏi để mở rộng phạm vi trích xuất.'
                },
                {
                  id: 'reranked',
                  title: 'Reranked Context Search',
                  desc: 'Tái sắp xếp điểm ưu tiên dựa trên mô hình Cross-Encoder.'
                }
              ].map((m) => {
                const isSelected = options.retrievalMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => updateOption('retrievalMethod', m.id as RetrievalMethod)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium text-slate-800">
                      <span>{m.title}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-200/80" />

          {/* 2. Top-K Items & Min Similarity Threshold */}
          <div className="space-y-4">
            <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              2. Giới Hạn & Ngưỡng Tương Đồng
            </label>

            {/* Top-K Slider */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Top-K Chunks Retrieve:</span>
                <span className="font-semibold text-emerald-700 font-mono text-sm">{options.topK} chunks</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={options.topK}
                onChange={(e) => updateOption('topK', Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400">
                Số lượng đoạn văn bản tối đa gửi cho mô hình LLM tổng hợp.
              </p>
            </div>

            {/* Min Similarity Threshold Slider */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Ngưỡng Tương Đồng Tối Thiểu (Cutoff):</span>
                <span className="font-semibold text-emerald-700 font-mono text-sm">
                  {(options.minSimilarityThreshold * 100).toFixed(0)}% (max dist: {(1 - options.minSimilarityThreshold).toFixed(2)})
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={0.95}
                step={0.05}
                value={options.minSimilarityThreshold}
                onChange={(e) => updateOption('minSimilarityThreshold', Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="text-[10px] text-slate-400">
                Chỉ giữ lại những đoạn có <code className="text-emerald-700">similarity = 1 - distance</code> cao hơn ngưỡng này.
              </p>
            </div>

            {/* Hybrid Alpha Weight if Hybrid chosen */}
            {options.retrievalMethod === 'hybrid_bm25' && (
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-teal-900">Trọng số Hybrid Alpha:</span>
                  <span className="font-semibold text-teal-800 font-mono">
                    Dense: {((1 - options.hybridAlpha) * 100).toFixed(0)}% | Sparse: {(options.hybridAlpha * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.1}
                  value={options.hybridAlpha}
                  onChange={(e) => updateOption('hybridAlpha', Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
            )}
          </div>

          <hr className="border-slate-200/80" />

          {/* 3. Generation Strategy & Temperature */}
          <div className="space-y-3">
            <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              3. Chiến Lược Sinh Phản Hồi (RAG Prompt Strategy)
            </label>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'local', name: 'Local', desc: 'Không cần API key' },
                { id: 'gemini', name: 'Gemini', desc: 'Google model' },
                { id: 'gpt', name: 'GPT', desc: 'OpenAI model' },
                { id: 'voyage', name: 'Voyage', desc: 'Fallback RAG' },
              ].map((m) => {
                const isSelected = options.chatModel === m.id;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => updateOption('chatModel', m.id as ChatModel)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-slate-800">{m.name}</span>
                    <span className="block text-[10px] text-slate-500 mt-0.5">{m.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {[
                {
                  id: 'grounded_strict',
                  name: 'Grounded Strict (Chính xác tuyệt đối)',
                  desc: 'Chỉ trả lời dựa trên thông tin retrieved, không suy đoán.'
                },
                {
                  id: 'analytical_synthesis',
                  name: 'Analytical Synthesis (Tổng hợp & Phân tích)',
                  desc: 'Tổng hợp sâu, so sánh đối chiếu giữa các nguồn tài liệu.'
                },
                {
                  id: 'creative_contextual',
                  name: 'Creative Contextual (Mở rộng tự nhiên)',
                  desc: 'Kết hợp tri thức tài liệu với khả năng suy luận tự nhiên.'
                }
              ].map((g) => (
                <div
                  key={g.id}
                  onClick={() => updateOption('generationMode', g.id as RAGGenerationMode)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    options.generationMode === g.id
                      ? 'border-emerald-500 bg-emerald-50/50 text-slate-900 font-medium'
                      : 'border-slate-200 bg-white hover:bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold">{g.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{g.desc}</p>
                </div>
              ))}
            </div>

            {/* Model Temperature Slider */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Nhiệt Độ Mô Hình (Temperature):</span>
                <span className="font-semibold text-emerald-700 font-mono">{options.temperature}</span>
              </div>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.05}
                value={options.temperature}
                onChange={(e) => updateOption('temperature', Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          <hr className="border-slate-200/80" />

          {/* 4. Filter Specific Documents */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] flex items-center justify-between">
              <span>4. Bố Cục Kho Tài Liệu Áp Dụng</span>
              <span className="text-[10px] text-slate-500 font-normal">
                {options.filterDocIds?.length ? `Đã chọn ${options.filterDocIds.length}/${documents.length}` : 'Tất cả file'}
              </span>
            </label>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {documents.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic p-2 text-center">Chưa có tài liệu nào trong kho.</p>
              ) : (
                documents.map((doc) => {
                  const isChecked = !options.filterDocIds || options.filterDocIds.length === 0 || options.filterDocIds.includes(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleDocFilter(doc.id)}
                      className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate text-slate-700 font-medium">{doc.name}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs"
          >
            Áp Dụng
          </button>
        </div>
      </div>
    </div>
  );
};

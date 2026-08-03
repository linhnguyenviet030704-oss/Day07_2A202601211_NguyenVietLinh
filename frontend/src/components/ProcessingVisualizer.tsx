import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, Layers, Cpu, Database, Eye, X } from 'lucide-react';
import { DocumentChunk, DocumentIngestOptions } from '../types';

interface ProcessingVisualizerProps {
  isOpen: boolean;
  documentName: string;
  options: DocumentIngestOptions;
  generatedChunks: DocumentChunk[];
  onComplete: () => void;
  onCancel: () => void;
}

export const ProcessingVisualizer: React.FC<ProcessingVisualizerProps> = ({
  isOpen,
  documentName,
  options,
  generatedChunks,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activePreviewChunk, setActivePreviewChunk] = useState<DocumentChunk | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    // Simulate animated pipeline step transitions
    const timer1 = setTimeout(() => setCurrentStep(1), 800); // Segmentation
    const timer2 = setTimeout(() => setCurrentStep(2), 2200); // Embedding calculation
    const timer3 = setTimeout(() => setCurrentStep(3), 3600); // Indexing
    const timer4 = setTimeout(() => {
      setCurrentStep(4); // Finished
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const steps = [
    { title: '1. Nạp & Làm sạch Tài liệu', desc: `Đang đọc file ${documentName}`, icon: Layers },
    { title: '2. Phân đoạn (Segmentation)', desc: `Chiến lược: ${options.chunkingStrategy} (${options.chunkSize} tokens)`, icon: Layers },
    { title: '3. Tính Toán Vector Embedding', desc: `Model: ${options.embeddingModel} (${options.embeddingDimension} dims)`, icon: Cpu },
    { title: '4. Đánh Chỉ Mục (Vector Store)', desc: `Lưu trữ ${generatedChunks.length} chunks vào Memory DB`, icon: Database },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Pipeline RAG Segmentation & Embedding
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {documentName}
              </p>
            </div>
          </div>
          {currentStep === 4 && (
            <button
              onClick={onCancel}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Pipeline Step Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((step, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
                    : isCurrent
                    ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-100 bg-slate-50/50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isDone || isCurrent ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-semibold">{step.title}</span>
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Processing Summary Stats & Generated Chunks Preview */}
        {currentStep >= 2 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-700">
              <span className="font-semibold">Kết quả Chunking ({generatedChunks.length} chunks):</span>
              <span className="text-emerald-700 font-mono">
                {options.embeddingModel} • {options.embeddingDimension} dims
              </span>
            </div>

            {/* Chunks Horizon Scroll / List */}
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {generatedChunks.map((chunk, i) => (
                <div
                  key={chunk.id}
                  onClick={() => setActivePreviewChunk(chunk)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50/80 hover:bg-emerald-50/30 transition-all text-xs cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span className="font-semibold text-emerald-800">Chunk #{chunk.chunkIndex}</span>
                      <span>• {chunk.tokenCount} tokens</span>
                      <span>• {chunk.characterCount} ký tự</span>
                    </div>
                    <p className="text-slate-700 truncate text-[11px] mt-0.5">
                      {chunk.content}
                    </p>
                  </div>
                  <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          {currentStep === 4 ? (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Hoàn Thành & Đã Thêm Vào Kho Tri Thức</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              Đang tự động thực thi pipeline RAG...
            </div>
          )}
        </div>
      </div>

      {/* Chunk Detail Modal Preview */}
      {activePreviewChunk && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-semibold text-slate-800 text-sm">
                Chi Tiết Chunk #{activePreviewChunk.chunkIndex}
              </h4>
              <button
                onClick={() => setActivePreviewChunk(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-500 font-mono">
                <span>Tokens: {activePreviewChunk.tokenCount}</span>
                <span>Ký tự: {activePreviewChunk.characterCount}</span>
                <span>Trang: {activePreviewChunk.metadata?.pageNumber || 1}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-mono leading-relaxed max-h-60 overflow-y-auto">
                {activePreviewChunk.content}
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg text-[11px]">
                <strong>Vector Preview ({activePreviewChunk.embedding?.length || 0} dims):</strong>
                <p className="font-mono text-[10px] text-emerald-700 truncate mt-0.5">
                  [{activePreviewChunk.embedding?.slice(0, 8).map(n => n.toFixed(4)).join(', ')}...]
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePreviewChunk(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

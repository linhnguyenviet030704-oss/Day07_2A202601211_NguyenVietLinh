import React from 'react';
import { X, FileText, Cpu, Copy, Check, Database, Layers } from 'lucide-react';
import { RetrievedChunkResult } from '../types';

interface ChunkInspectorModalProps {
  item: RetrievedChunkResult | null;
  onClose: () => void;
}

export const ChunkInspectorModal: React.FC<ChunkInspectorModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const { chunk, distance, similarity, scoreFormatted } = item;

  const handleCopy = () => {
    navigator.clipboard.writeText(chunk.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-hidden space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Chi Tiết Chunk Được Retrieve
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {chunk.documentName} • Phân đoạn #{chunk.chunkIndex}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Độ Tương Đồng</span>
            <p className="font-mono font-bold text-emerald-900 text-sm mt-0.5">{scoreFormatted}</p>
            <span className="text-[10px] text-emerald-700 font-mono">1 - distance</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Khoảng Cách Vector</span>
            <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{distance.toFixed(4)}</p>
            <span className="text-[10px] text-slate-400 font-mono">Cosine Distance</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Kích Thước Chunk</span>
            <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">{chunk.tokenCount} tokens</p>
            <span className="text-[10px] text-slate-400 font-mono">{chunk.characterCount} ký tự</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Metadata Vị Trí</span>
            <p className="font-mono font-bold text-slate-800 text-sm mt-0.5">Trang #{chunk.metadata?.pageNumber || 1}</p>
            <span className="text-[10px] text-slate-400 truncate block">{chunk.metadata?.sectionTitle || 'Section'}</span>
          </div>
        </div>

        {/* Full Content Text Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Nội dung phân đoạn đầy đủ:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Đã chép' : 'Sao chép văn bản'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-sans text-xs leading-relaxed max-h-56 overflow-y-auto custom-scrollbar select-text">
            {chunk.content}
          </div>
        </div>

        {/* Vector Embedding Preview */}
        {chunk.embedding && chunk.embedding.length > 0 && (
          <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-emerald-400" />
                Dữ liệu Dense Vector Embedding
              </span>
              <span>{chunk.embedding.length} dimensions</span>
            </div>
            <p className="truncate text-emerald-400 text-[10px] opacity-90">
              [{chunk.embedding.slice(0, 12).map(n => n.toFixed(5)).join(', ')}, ...]
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

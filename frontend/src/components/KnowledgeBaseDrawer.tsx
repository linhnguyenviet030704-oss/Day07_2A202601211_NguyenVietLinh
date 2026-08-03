import React, { useState } from 'react';
import { X, Database, Trash2, FileText, Layers, Eye, Plus, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { RAGDocument, DocumentChunk } from '../types';

interface KnowledgeBaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: RAGDocument[];
  onDeleteDocument: (docId: string) => void;
  onOpenUpload: () => void;
}

export const KnowledgeBaseDrawer: React.FC<KnowledgeBaseDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  onDeleteDocument,
  onOpenUpload,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<RAGDocument | null>(null);
  const [inspectChunk, setInspectChunk] = useState<DocumentChunk | null>(null);

  if (!isOpen) return null;

  const totalChunks = documents.reduce((sum, doc) => sum + doc.chunksCount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">
                Quản Lý Kho Tri Thức RAG
              </h3>
              <p className="text-[11px] text-slate-500">
                {documents.length} tài liệu • {totalChunks} chunks đã được đánh chỉ mục
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Danh sách File Hiện Có
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm File Mới</span>
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">Kho tri thức đang trống.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenUpload();
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-medium"
              >
                Upload Tài Liệu Ngay
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                const status = doc.status || 'ready';
                const statusClass = status === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : status === 'processing'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200';
                const statusLabel = status === 'error' ? 'Error' : status === 'processing' ? 'Processing' : 'Ready';

                return (
                  <div
                    key={doc.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <FileText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={doc.name}>
                            {doc.name}
                          </p>
                          <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                            {status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {status === 'error' && <AlertCircle className="w-3 h-3" />}
                            {status === 'ready' && <CheckCircle2 className="w-3 h-3" />}
                            {statusLabel}
                          </span>
                          {doc.statusMessage && (
                            <p className={`text-[11px] mt-1 ${status === 'error' ? 'text-red-600' : status === 'processing' ? 'text-amber-700' : 'text-emerald-700'}`}>
                              {doc.statusMessage}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {(doc.sizeBytes / 1024).toFixed(1)} KB • {doc.chunksCount} chunks • {new Date(doc.uploadedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedDoc(isSelected ? null : doc)}
                          disabled={doc.chunks.length === 0}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Thu gọn' : 'Xem chunks'}</span>
                        </button>

                        <button
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600"
                          title="Xóa tài liệu khỏi kho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Document Ingestion Settings Summary */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Strategy: {doc.ingestOptions?.chunkingStrategy}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Chunk size: {doc.ingestOptions?.chunkSize} tokens
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                        {doc.ingestOptions?.embeddingModel} ({doc.ingestOptions?.embeddingDimension}d)
                      </span>
                    </div>

                    {/* Expandable Chunks List */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 animate-in fade-in">
                        <p className="text-[11px] font-semibold text-slate-700">
                          Danh sách Chunks ({doc.chunks.length}):
                        </p>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                          {doc.chunks.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => setInspectChunk(c)}
                              className="p-2 rounded bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/60 hover:border-emerald-300 text-[11px] cursor-pointer transition-colors"
                            >
                              <div className="flex justify-between font-mono text-slate-500 text-[10px]">
                                <span className="font-semibold text-emerald-800">Chunk #{c.chunkIndex}</span>
                                <span>{c.tokenCount} tokens</span>
                              </div>
                              <p className="text-slate-700 truncate text-[11px] mt-0.5">
                                {c.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 text-center text-xs text-slate-500">
          <p>Mọi dữ liệu tài liệu được chỉ mục với không gian vector đa chiều trong bộ nhớ server.</p>
        </div>
      </div>

      {/* Chunk Modal */}
      {inspectChunk && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-semibold text-slate-800 text-sm">
                Chi Tiết Chunk #{inspectChunk.chunkIndex} ({inspectChunk.documentName})
              </h4>
              <button
                onClick={() => setInspectChunk(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-800 font-sans leading-relaxed max-h-60 overflow-y-auto">
              {inspectChunk.content}
            </div>
            <button
              onClick={() => setInspectChunk(null)}
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

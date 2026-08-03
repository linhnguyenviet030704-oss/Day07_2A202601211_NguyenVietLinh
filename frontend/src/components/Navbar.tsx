import React from 'react';
import { Bot, FileText, Database, Settings2, Upload, Sparkles, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenOptions: () => void;
  onOpenKnowledgeBase: () => void;
  documentCount: number;
  totalChunksCount: number;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onOpenOptions,
  onOpenKnowledgeBase,
  documentCount,
  totalChunksCount,
  hasApiKey,
}) => {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all">
      {/* Brand & Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-200">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-slate-800 text-base sm:text-lg tracking-tight">
              RAG Intelligence Workspace
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini 3.6 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden sm:block">
            Retrieval-Augmented Generation với công thức minh bạch: <code className="text-emerald-700 font-mono">similarity = 1 - distance</code>
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Knowledge Base Badge / Button */}
        <button
          onClick={onOpenKnowledgeBase}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100/80 text-xs font-medium text-slate-700 transition-colors shadow-xs"
          title="Xem kho tài liệu hiện tại"
        >
          <Database className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden md:inline">Kho Tri Thức</span>
          <span className="px-1.5 py-0.2 rounded-md bg-teal-100 text-teal-800 text-[11px] font-semibold">
            {documentCount} file ({totalChunksCount} chunks)
          </span>
        </button>

        {/* Upload Document Button */}
        <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs sm:text-sm font-medium transition-all shadow-sm shadow-emerald-200"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Tài liệu</span>
        </button>

        {/* Retrieving Options Settings Button */}
        <button
          onClick={onOpenOptions}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/90 bg-white hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-700 transition-colors shadow-xs"
          title="Tùy chỉnh Tham số Retrieval & Model"
        >
          <Settings2 className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Tham số RAG</span>
        </button>
      </div>
    </header>
  );
};

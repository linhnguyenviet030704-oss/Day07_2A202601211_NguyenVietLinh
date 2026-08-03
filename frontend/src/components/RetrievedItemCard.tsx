import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Maximize2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RetrievedChunkResult } from '../types';

interface RetrievedItemCardProps {
  item: RetrievedChunkResult;
  index: number;
  onInspectChunk: (item: RetrievedChunkResult) => void;
}

export const RetrievedItemCard: React.FC<RetrievedItemCardProps> = ({
  item,
  index,
  onInspectChunk,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { chunk, distance, similarity, scoreFormatted, matchedTerms } = item;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(chunk.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine Similarity Badge Style
  let badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
  let badgeBar = 'bg-emerald-500';
  if (similarity < 0.6) {
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200/80';
    badgeBar = 'bg-amber-500';
  } else if (similarity < 0.8) {
    badgeBg = 'bg-cyan-50 text-cyan-800 border-cyan-200/80';
    badgeBar = 'bg-cyan-500';
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white hover:border-emerald-300 transition-all shadow-xs overflow-hidden group">
      {/* Top Header Row */}
      <div className="p-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">
            #{index + 1}
          </div>
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 truncate" title={chunk.documentName}>
            {chunk.documentName}
          </span>
          <span className="text-[11px] text-slate-400 font-mono shrink-0">
            (Chunk #{chunk.chunkIndex})
          </span>
        </div>

        {/* PROMINENT SIMILARITY SCORE BADGE with formula display */}
        <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-2 text-xs font-mono font-semibold shrink-0 ${badgeBg}`}>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-sans font-medium text-slate-600">
              Similarity:
            </span>
            <span className="text-emerald-900 font-bold">{scoreFormatted}</span>
          </div>

          <span className="text-[10px] opacity-70 border-l border-slate-300 pl-1.5 font-normal">
            dist: {distance.toFixed(3)}
          </span>
        </div>
      </div>

      {/* Content Snippet */}
      <div className="p-3 space-y-2">
        <p className={`text-xs text-slate-700 leading-relaxed font-sans ${isExpanded ? '' : 'line-clamp-3'}`}>
          {chunk.content}
        </p>

        {/* Matched Keywords Badge if any */}
        {matchedTerms && matchedTerms.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-[10px] text-slate-400">Từ khóa trùng:</span>
            {matchedTerms.map((term, i) => (
              <span
                key={i}
                className="px-1.5 py-0.2 rounded bg-emerald-100/70 text-emerald-800 text-[10px] font-mono font-medium"
              >
                {term}
              </span>
            ))}
          </div>
        )}

        {/* Formula Explanation Banner */}
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono border-t border-slate-100 mt-2">
          <span className="flex items-center gap-1 text-slate-500">
            <Info className="w-3 h-3 text-emerald-600" />
            <code>similarity = 1 - distance</code> ({similarity.toFixed(4)} = 1 - {distance.toFixed(4)})
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-0.5 rounded hover:bg-slate-100 text-slate-600 font-medium flex items-center gap-1 transition-colors"
            >
              {isExpanded ? (
                <>Thu gọn <ChevronUp className="w-3 h-3" /></>
              ) : (
                <>Xem thêm <ChevronDown className="w-3 h-3" /></>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
              title="Sao chép trích dẫn"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onInspectChunk(item)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-700 transition-colors"
              title="Xem chi tiết chunk & vector"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

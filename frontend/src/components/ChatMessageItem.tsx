import React, { useState } from 'react';
import { Bot, User, Clock, ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';
import { ChatMessage, RetrievedChunkResult } from '../types';
import { RetrievedItemCard } from './RetrievedItemCard';
import { parseMarkdown } from '../markdown';

interface ChatMessageItemProps {
  message: ChatMessage;
  onInspectChunk: (item: RetrievedChunkResult) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onInspectChunk,
}) => {
  const isAssistant = message.sender === 'assistant';
  const [showRetrievedCards, setShowRetrievedCards] = useState<boolean>(true);

  const hasRetrieved = message.retrievedItems && message.retrievedItems.length > 0;

  return (
    <div className={`py-4 px-4 sm:px-6 transition-colors ${
      isAssistant ? 'bg-slate-50/60 border-y border-slate-100' : 'bg-white'
    }`}>
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header info */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-800">
              {isAssistant ? 'RAG Assistant' : 'Bạn'}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              {message.executionTimeMs && (
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  {message.executionTimeMs}ms
                </span>
              )}
              {message.modelUsed && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-sans font-medium">
                  {message.modelUsed}
                </span>
              )}
              <span>{message.timestamp}</span>
            </div>
          </div>

          {/* Text Message */}
          <MarkdownContent content={message.content} />

          {/* RETRIEVED ITEMS CARDS CONTAINER (Thẻ xem item đã được retrieve) */}
          {isAssistant && hasRetrieved && (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => setShowRetrievedCards(!showRetrievedCards)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-300 text-xs text-slate-700 font-medium transition-colors shadow-2xs group"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>
                    Nguồn Tài Liệu Đã Retrieve ({message.retrievedItems?.length} chunks)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    similarity = 1 - distance
                  </span>
                </div>
                {showRetrievedCards ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                )}
              </button>

              {/* Grid of Retrieved Item Cards */}
              {showRetrievedCards && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 animate-in fade-in duration-200">
                  {message.retrievedItems?.map((item, idx) => (
                    <RetrievedItemCard
                      key={`${item.chunk.id}_${idx}`}
                      item={item}
                      index={idx}
                      onInspectChunk={onInspectChunk}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans space-y-3">
      {parseMarkdown(content).map((block, index) => {
        if (block.type === 'heading') {
          return <h3 key={index} className="text-sm sm:text-base font-semibold text-slate-900 mt-3">{renderInline(block.text)}</h3>;
        }
        if (block.type === 'ordered-list') {
          return (
            <ol key={index} className="list-decimal pl-5 space-y-1">
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
            </ol>
          );
        }
        if (block.type === 'unordered-list') {
          return (
            <ul key={index} className="list-disc pl-5 space-y-1">
              {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>)}
            </ul>
          );
        }
        if (block.type === 'math') {
          return <div key={index} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-emerald-800">{block.text}</div>;
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-emerald-800">{part.slice(1, -1)}</code>;
    return part;
  });
}

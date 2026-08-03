import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Search,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap
} from 'lucide-react';
import { ChatSession, KnowledgeBase, RAGDocument, RetrievalOptions } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  canCreateNewSession: boolean;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  documents: RAGDocument[];
  retrievalOptions: RetrievalOptions;
  knowledgeBases: KnowledgeBase[];
  activeKnowledgeBaseId: string;
  onSelectKnowledgeBase: (id: string) => void;
  onCreateKnowledgeBase: () => void;
  onOpenOptions: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  canCreateNewSession,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession,
  documents,
  retrievalOptions,
  knowledgeBases,
  activeKnowledgeBaseId,
  onSelectKnowledgeBase,
  onCreateKnowledgeBase,
  onOpenOptions,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditingTitle(session.title);
  };

  const saveRename = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-slate-50/90 border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat Button */}
        <div className="p-4 border-b border-slate-200/70 space-y-3 bg-white/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Lưu Trữ Cuộc Trò Chuyện
            </span>
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 hover:bg-slate-200/60 rounded-md text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewSession();
              onCloseMobile();
            }}
            disabled={!canCreateNewSession}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed text-white font-medium text-sm transition-all shadow-xs active:scale-[0.98]"
            title={canCreateNewSession ? 'Tạo cuộc trò chuyện mới' : 'Hãy nhập nội dung trước khi tạo cuộc trò chuyện mới'}
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Cuộc trò chuyện mới</span>
          </button>

          <div className="flex gap-2">
            <select
              value={activeKnowledgeBaseId}
              onChange={(e) => onSelectKnowledgeBase(e.target.value)}
              className="min-w-0 flex-1 px-2.5 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              title="Kho tai lieu cho cuoc tro chuyen moi"
            >
              {knowledgeBases.map((kb) => (
                <option key={kb.id} value={kb.id}>
                  {kb.name}
                </option>
              ))}
            </select>
            <button
              onClick={onCreateKnowledgeBase}
              className="px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-emerald-700 hover:border-emerald-300"
              title="Tao kho tai lieu"
            >
              +
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm hội thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Saved Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              {searchQuery ? 'Không tìm thấy cuộc trò chuyện nào.' : 'Chưa có lịch sử cuộc trò chuyện.'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = editingId === session.id;
              const msgCount = session.messages.filter(m => m.sender !== 'system').length;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobile();
                  }}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-white text-emerald-950 font-medium border-emerald-200/80 shadow-xs ring-1 ring-emerald-500/10'
                      : 'border-transparent text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full px-1.5 py-0.5 text-xs rounded border border-emerald-400 focus:outline-none bg-white text-slate-800"
                      />
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800 leading-snug">
                          {session.title || 'Cuộc trò chuyện mới'}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {msgCount} tin nhắn • {new Date(session.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions for active / hovered session */}
                  <div className="flex items-center gap-1 opacity-80 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => saveRename(session.id, e)}
                          className="p-1 hover:bg-emerald-100 rounded text-emerald-700"
                          title="Lưu"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={cancelRename}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                          title="Hủy"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => startRename(session, e)}
                          className="p-1 hover:bg-slate-200/70 rounded text-slate-500 hover:text-slate-800"
                          title="Đổi tên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {sessions.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
                            title="Xóa cuộc trò chuyện"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Current Retrieval Parameter Status */}
        <div className="p-3 border-t border-slate-200/80 bg-white/70 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-medium flex items-center gap-1 text-slate-700">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              Retrieving Config
            </span>
            <button
              onClick={onOpenOptions}
              className="text-[11px] text-emerald-600 hover:underline font-medium"
            >
              Chỉnh sửa
            </button>
          </div>

          <div className="p-2 rounded-lg bg-slate-100/70 border border-slate-200/60 text-[11px] space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Phương thức:</span>
              <span className="font-semibold text-slate-800 capitalize">
                {retrievalOptions.retrievalMethod.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Top-K Chunks:</span>
              <span className="font-semibold text-slate-800">{retrievalOptions.topK}</span>
            </div>
            <div className="flex justify-between">
              <span>Min Similarity:</span>
              <span className="font-semibold text-emerald-700 font-mono">
                {(retrievalOptions.minSimilarityThreshold * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

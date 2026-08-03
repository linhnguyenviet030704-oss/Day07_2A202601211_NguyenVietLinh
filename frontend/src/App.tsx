import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  Sparkles,
  Upload,
  Database,
  Sliders,
  MessageSquare,
  Menu,
  FileText,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  Layers,
  ArrowDown
} from 'lucide-react';
import {
  ChatMessage,
  ChatSession,
  DocumentIngestOptions,
  KnowledgeBase,
  RAGDocument,
  RetrievalOptions,
  RetrievedChunkResult
} from './types';
import {
  INITIAL_SAMPLE_DOCUMENTS,
  SAMPLE_DOC_CONTENTS,
  chunkTextContent,
  performRAGRetrieval
} from './utils/ragEngine';
import {
  createChat,
  createKnowledgeBase,
  DEFAULT_VOYAGE_RATE_LIMIT,
  getBackendOptions,
  listDocuments,
  listKnowledgeBases,
  sendChatMessage,
  selectVoyageRateLimit,
  toRagDocument,
  toRetrievedItem,
  VoyageRateLimit,
  uploadDocument
} from './backendClient';
import { shouldCreateNewSession } from './chatSessions';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { UploadModal } from './components/UploadModal';
import { ProcessingVisualizer } from './components/ProcessingVisualizer';
import { RetrievalOptionsPanel } from './components/RetrievalOptionsPanel';
import { ChatMessageItem } from './components/ChatMessageItem';
import { KnowledgeBaseDrawer } from './components/KnowledgeBaseDrawer';
import { ChunkInspectorModal } from './components/ChunkInspectorModal';

const DEFAULT_RETRIEVAL_OPTIONS: RetrievalOptions = {
  retrievalMethod: 'dense_cosine',
  topK: 4,
  minSimilarityThreshold: 0.40,
  hybridAlpha: 0.7,
  chatModel: 'voyage',
  generationMode: 'grounded_strict',
  temperature: 0.2,
  filterDocIds: []
};

export default function App() {
  // 1. Storage & State Initialization
  const [documents, setDocuments] = useState<RAGDocument[]>(() => {
    const saved = localStorage.getItem('rag_documents');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_SAMPLE_DOCUMENTS;
  });

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('rag_chat_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      } catch (e) { /* fallback */ }
    }
    const initSession: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'Hội thoại RAG Tri Thức',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_welcome',
          sender: 'assistant',
          content: `Xin chào! Tôi là **Trợ lý RAG Intelligence**.

Tôi có thể giúp bạn tra cứu tri thức từ kho tài liệu nội bộ dựa trên thuật toán vector embedding và công thức tính độ tương đồng minh bạch:
$$\\text{Similarity} = 1 - \\text{Distance}$$

### Bạn có thể thử nghiệm ngay:
1. Nhập câu hỏi bên dưới để xem hệ thống trích xuất các **Thẻ Retrived Items** với điểm Similarity chính xác.
2. Thêm file mới bằng cách nhấn **Upload Tài liệu** để tùy chỉnh các tham số **Chunking Strategy**, **Embedding Model** và **Embedding Size** trước khi nạp.
3. Nhấn **Tham số RAG** để thử nghiệm các chế độ **Dense Cosine**, **Hybrid BM25** hoặc **Multi-Query Expansion**.`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.6-flash'
        }
      ],
      knowledgeBaseId: 'default-kb',
      activeDocIds: [],
      retrievalOptions: DEFAULT_RETRIEVAL_OPTIONS
    };
    return [initSession];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [activeKnowledgeBaseId, setActiveKnowledgeBaseId] = useState<string>('default-kb');
  const [voyageRateLimit, setVoyageRateLimit] = useState<VoyageRateLimit>(DEFAULT_VOYAGE_RATE_LIMIT);

  // UI Drawer & Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isOptionsPanelOpen, setIsOptionsPanelOpen] = useState<boolean>(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState<boolean>(false);
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState<boolean>(false);

  // Ingestion Processing Visualizer States
  const [isVisualizerOpen, setIsVisualizerOpen] = useState<boolean>(false);
  const [visualizerDocName, setVisualizerDocName] = useState<string>('');
  const [visualizerOptions, setVisualizerOptions] = useState<DocumentIngestOptions | null>(null);
  const [visualizerChunks, setVisualizerChunks] = useState<any[]>([]);
  const [pendingDocToAdd, setPendingDocToAdd] = useState<RAGDocument | null>(null);
  const [pendingUploadDocId, setPendingUploadDocId] = useState<string | null>(null);

  // Chunk Inspector Modal
  const [inspectingChunkResult, setInspectingChunkResult] = useState<RetrievedChunkResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Health Endpoint
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.hasApiKey) setHasApiKey(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    listKnowledgeBases()
      .then((items) => {
        setKnowledgeBases(items);
        if (items[0]?.id) setActiveKnowledgeBaseId(items[0].id);
      })
      .catch(() => {});
    getBackendOptions()
      .then((options) => setVoyageRateLimit(selectVoyageRateLimit(options)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeKnowledgeBaseId) return;
    listDocuments(activeKnowledgeBaseId)
      .then((docs) => setDocuments(docs.length ? docs.map(toRagDocument) : []))
      .catch(() => {});
  }, [activeKnowledgeBaseId]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('rag_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('rag_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Auto Scroll Chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSessionId, sessions]);

  // Active Chat Session Helper
  const currentSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // 2. Chat Handlers
  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputMessage).trim();
    if (!queryText || isSending) return;

    setInputMessage('');
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: 'msg_u_' + Date.now(),
      sender: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    // Update session with user message
    const updatedMessages = [...currentSession.messages, userMsg];
    const newTitle = currentSession.messages.length <= 1
      ? (queryText.length > 30 ? queryText.substring(0, 30) + '...' : queryText)
      : currentSession.title;

    updateSessionMessages(currentSession.id, updatedMessages, newTitle);

    const backendOptions = currentSession.retrievalOptions || DEFAULT_RETRIEVAL_OPTIONS;
    try {
      const startedAt = performance.now();
      let backendChatId = currentSession.backendChatId;
      if (!backendChatId) {
        const chat = await createChat(newTitle, currentSession.knowledgeBaseId || activeKnowledgeBaseId);
        backendChatId = chat.id;
        setSessions(prev => prev.map(s => s.id === currentSession.id ? { ...s, backendChatId, knowledgeBaseId: chat.knowledge_base_id } : s));
      }

      const data = await sendChatMessage(backendChatId, queryText, backendOptions);
      const retrievedItems = (data.assistant?.retrieved_items || []).map((item: any) =>
        toRetrievedItem(item, backendOptions.retrievalMethod)
      );
      const assistantMsg: ChatMessage = {
        id: 'msg_a_' + Date.now(),
        sender: 'assistant',
        content: data.assistant?.content || 'Backend did not return an answer.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        retrievedItems,
        retrievalOptionsUsed: backendOptions,
        executionTimeMs: Math.round(performance.now() - startedAt),
        modelUsed: data.assistant?.model_used || backendOptions.chatModel
      };
      updateSessionMessages(currentSession.id, [...updatedMessages, assistantMsg]);
    } catch (error: any) {
      const assistantMsg: ChatMessage = {
        id: 'msg_a_' + Date.now(),
        sender: 'assistant',
        content: `Backend RAG is not ready: ${error.message || 'connection failed'}`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        retrievedItems: [],
        retrievalOptionsUsed: backendOptions,
        modelUsed: 'Python Backend RAG'
      };
      updateSessionMessages(currentSession.id, [...updatedMessages, assistantMsg]);
    } finally {
      setIsSending(false);
    }
    return;

    // STEP 1: PERFORM RAG VECTOR RETRIEVAL (Dense, Hybrid, Multi-Query)
    const activeOptions = currentSession.retrievalOptions || DEFAULT_RETRIEVAL_OPTIONS;
    const retrievedItems = performRAGRetrieval(queryText, documents, activeOptions);

    // STEP 2: CALL SERVER RAG GENERATION ENDPOINT (Gemini 3.6 Flash)
    try {
      const response = await fetch('/api/rag/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          retrievedContext: retrievedItems,
          retrievalOptions: activeOptions
        })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: 'msg_a_' + Date.now(),
        sender: 'assistant',
        content: data.answer || 'Đã tạo câu trả lời thành công.',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        retrievedItems,
        retrievalOptionsUsed: activeOptions,
        executionTimeMs: data.executionTimeMs || 420,
        modelUsed: data.modelUsed || 'gemini-3.6-flash'
      };

      updateSessionMessages(currentSession.id, [...updatedMessages, assistantMsg]);
    } catch (error) {
      console.error('Error generating RAG response:', error);
      // Fallback local assistant response
      const assistantMsg: ChatMessage = {
        id: 'msg_a_' + Date.now(),
        sender: 'assistant',
        content: `Dựa trên ${retrievedItems.length} đoạn tài liệu được trích xuất từ kho tri thức:\n\n` +
          (retrievedItems.length > 0
            ? retrievedItems.map(item => `• **${item.chunk.documentName}** *(Similarity: ${item.scoreFormatted})*: ${item.chunk.content}`).join('\n\n')
            : 'Không tìm thấy đoạn tài liệu phù hợp.'),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        retrievedItems,
        retrievalOptionsUsed: activeOptions,
        executionTimeMs: 180,
        modelUsed: 'RAG Direct Engine'
      };

      updateSessionMessages(currentSession.id, [...updatedMessages, assistantMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const updateSessionMessages = (sessionId: string, newMsgs: ChatMessage[], title?: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          title: title || s.title,
          updatedAt: new Date().toISOString(),
          messages: newMsgs
        };
      }
      return s;
    }));
  };

  const handleNewSession = () => {
    if (!shouldCreateNewSession(currentSession)) {
      setActiveSessionId(currentSession.id);
      return;
    }

    const newSession: ChatSession = {
      id: 'session_' + Date.now(),
      title: 'Cuộc trò chuyện ' + (sessions.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg_welcome_' + Date.now(),
          sender: 'assistant',
          content: 'Xin chào! Bắt đầu cuộc trò chuyện mới. Hãy đặt câu hỏi để tôi tra cứu kho tri thức tài liệu cho bạn.',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.6-flash'
        }
      ],
      knowledgeBaseId: activeKnowledgeBaseId,
      activeDocIds: [],
      retrievalOptions: DEFAULT_RETRIEVAL_OPTIONS
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter(s => s.id !== id);
      setActiveSessionId(remaining[0]?.id || '');
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  // 3. Document Upload & Ingest Pipeline Trigger
  const handleStartIngest = async (
    fileData: { name: string; fileType: string; content: string; sizeBytes: number },
    options: DocumentIngestOptions,
    uiOptions: { showVisualizer?: boolean } = {}
  ) => {
    const shouldShowVisualizer = uiOptions.showVisualizer !== false;
    const tempDocId = 'upload_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    const pendingDoc: RAGDocument = {
      id: tempDocId,
      name: fileData.name,
      fileType: fileData.fileType,
      sizeBytes: fileData.sizeBytes,
      uploadedAt: new Date().toISOString(),
      ingestOptions: options,
      chunksCount: 0,
      chunks: [],
      status: 'processing',
      statusMessage: options.embeddingModel.startsWith('voyage-')
        ? 'Dang upload va tao Voyage embeddings'
        : 'Dang upload va tao vector'
    };
    if (shouldShowVisualizer) setPendingUploadDocId(tempDocId);
    setDocuments(prev => [pendingDoc, ...prev.filter(doc => doc.id !== tempDocId)]);
    setIsKnowledgeBaseOpen(true);

    let uploaded: any;
    try {
      uploaded = await uploadDocument(fileData, options, activeKnowledgeBaseId);
    } catch (error: any) {
      setDocuments(prev => prev.map(doc => doc.id === tempDocId ? {
        ...doc,
        status: 'error',
        statusMessage: error.message || 'Upload failed'
      } : doc));
      throw new Error(`Backend upload failed: ${error.message || 'connection failed'}`);
    }

    const docId = uploaded.doc_id || 'doc_' + Date.now();
    const chunks = chunkTextContent(fileData.content, docId, fileData.name, options);
    setDocuments(prev => prev.map(doc => doc.id === tempDocId ? {
      ...doc,
      chunksCount: uploaded.chunk_count || chunks.length,
      statusMessage: 'Backend da upload xong, dang hien thi flow'
    } : doc));

    const newDoc: RAGDocument = {
      id: docId,
      name: fileData.name,
      fileType: fileData.fileType,
      sizeBytes: fileData.sizeBytes,
      uploadedAt: new Date().toISOString(),
      ingestOptions: options,
      chunksCount: uploaded.chunk_count || chunks.length,
      chunks: chunks,
      status: 'processing',
      statusMessage: 'Dang hien thi flow segmentation'
    };

    if (!shouldShowVisualizer) {
      const readyDoc = { ...newDoc, status: 'ready' as const, statusMessage: 'Da index vao vector store' };
      setDocuments(prev => prev.map(doc => doc.id === tempDocId ? readyDoc : doc));
      return;
    }

    setVisualizerDocName(fileData.name);
    setVisualizerOptions(options);
    setVisualizerChunks(chunks);
    setPendingDocToAdd(newDoc);
    setIsVisualizerOpen(true);
  };

  const handleVisualizerComplete = () => {
    if (pendingDocToAdd) {
      const readyDoc = { ...pendingDocToAdd, status: 'ready' as const, statusMessage: 'Da index vao vector store' };
      setDocuments(prev => pendingUploadDocId
        ? prev.map(doc => doc.id === pendingUploadDocId ? readyDoc : doc)
        : [readyDoc, ...prev]
      );
      setPendingDocToAdd(null);
      setPendingUploadDocId(null);
    }
    setIsVisualizerOpen(false);
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleCreateKnowledgeBase = async () => {
    const name = prompt('Ten kho tai lieu moi');
    if (!name?.trim()) return;
    const kb = await createKnowledgeBase(name.trim());
    setKnowledgeBases(prev => [kb, ...prev]);
    setActiveKnowledgeBaseId(kb.id);
    setDocuments([]);
  };

  // 4. Update Retrieval Options for Active Session
  const handleUpdateOptions = (newOpts: RetrievalOptions) => {
    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, retrievalOptions: newOpts } : s));
  };

  const sampleQuestions = [
    'Lợi nhuận trước thuế và chi phí Cloud Server năm 2026 là bao nhiêu?',
    'Công thức tính Similarity trong kiến trúc RAG là gì?',
    'Chiến lược Chunking nào phù hợp nhất cho tài liệu Markdown kỹ thuật?',
    'Tỷ lệ tiết kiệm chi phí vận hành ở khối Chăm sóc Khách hàng?'
  ];

  const totalChunksCount = documents.reduce((sum, d) => sum + d.chunksCount, 0);

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 antialiased overflow-hidden">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onOpenOptions={() => setIsOptionsPanelOpen(true)}
        onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
        documentCount={documents.length}
        totalChunksCount={totalChunksCount}
        hasApiKey={hasApiKey}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setIsSidebarMobileOpen(true)}
          className="lg:hidden absolute top-3 left-3 z-20 p-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600 hover:text-slate-900"
          title="Mở Lịch sử cuộc trò chuyện"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Sidebar History Drawer */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          canCreateNewSession={shouldCreateNewSession(currentSession)}
          onSelectSession={setActiveSessionId}
          onNewSession={handleNewSession}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          documents={documents}
          retrievalOptions={currentSession.retrievalOptions || DEFAULT_RETRIEVAL_OPTIONS}
          knowledgeBases={knowledgeBases}
          activeKnowledgeBaseId={activeKnowledgeBaseId}
          onSelectKnowledgeBase={setActiveKnowledgeBaseId}
          onCreateKnowledgeBase={handleCreateKnowledgeBase}
          onOpenOptions={() => setIsOptionsPanelOpen(true)}
          isOpenMobile={isSidebarMobileOpen}
          onCloseMobile={() => setIsSidebarMobileOpen(false)}
        />

        {/* Main Chat Thread Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white/60">
          {/* Chat Messages Scroll Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {currentSession.messages.length === 0 ? (
              <div className="p-8 text-center max-w-md mx-auto my-auto space-y-3">
                <Bot className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-semibold text-slate-800">Bắt đầu trò chuyện với RAG</h3>
                <p className="text-xs text-slate-500">
                  Đặt câu hỏi để trích xuất ngữ cảnh từ kho tri thức tài liệu của bạn.
                </p>
              </div>
            ) : (
              currentSession.messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onInspectChunk={(item) => setInspectingChunkResult(item)}
                />
              ))
            )}

            {/* Loading Indicator when query running */}
            {isSending && (
              <div className="py-4 px-6 bg-slate-50/60 border-y border-slate-100">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <span>RAG Engine đang thực thi...</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Calculating similarity = 1 - distance
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Đang tìm kiếm trong kho tri thức ({documents.length} file, {totalChunksCount} chunks)...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Questions Chips */}
          <div className="px-4 py-2 border-t border-slate-100 bg-white/80 overflow-x-auto whitespace-nowrap custom-scrollbar flex items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
              Gợi ý:
            </span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isSending}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200/80 text-slate-700 font-medium transition-all text-xs shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white shadow-xs">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="max-w-4xl mx-auto relative flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Nhập câu hỏi để tra cứu kho tri thức RAG..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                className="w-full pl-4 pr-12 py-3 text-xs sm:text-sm rounded-xl border border-slate-200/90 bg-slate-50/50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="absolute right-1.5 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-all shadow-xs active:scale-[0.96]"
                title="Gửi câu hỏi"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Mode: <strong className="text-slate-600">{currentSession.retrievalOptions?.retrievalMethod}</strong> + <strong className="text-slate-600">{currentSession.retrievalOptions?.chatModel || 'voyage'}</strong> (Top-{currentSession.retrievalOptions?.topK} chunks)
              </span>

              <span className="font-mono">
                Formula: <code className="text-emerald-700 font-semibold">similarity = 1 - distance</code>
              </span>
            </div>
          </div>
        </main>
      </div>

      {/* Modals & Drawers */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onStartIngest={handleStartIngest}
        voyageRateLimit={voyageRateLimit}
        sampleDocsAvailable={[
          {
            id: 'doc_rag_handbook_2026',
            name: 'Sổ_Tay_Kiến_Trúc_RAG_Và_AI_2026.md',
            content: SAMPLE_DOC_CONTENTS['doc_rag_handbook_2026']
          },
          {
            id: 'doc_finance_plan_2026',
            name: 'Báo_Cáo_Đầu_Tư_Và_Kế_Hoạch_Kinh_Doanh.txt',
            content: SAMPLE_DOC_CONTENTS['doc_finance_plan_2026']
          }
        ]}
      />

      {visualizerOptions && (
        <ProcessingVisualizer
          isOpen={isVisualizerOpen}
          documentName={visualizerDocName}
          options={visualizerOptions}
          generatedChunks={visualizerChunks}
          onComplete={handleVisualizerComplete}
          onCancel={() => setIsVisualizerOpen(false)}
        />
      )}

      <RetrievalOptionsPanel
        isOpen={isOptionsPanelOpen}
        onClose={() => setIsOptionsPanelOpen(false)}
        options={currentSession.retrievalOptions || DEFAULT_RETRIEVAL_OPTIONS}
        onChangeOptions={handleUpdateOptions}
        documents={documents}
      />

      <KnowledgeBaseDrawer
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        documents={documents}
        onDeleteDocument={handleDeleteDocument}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      <ChunkInspectorModal
        item={inspectingChunkResult}
        onClose={() => setInspectingChunkResult(null)}
      />
    </div>
  );
}

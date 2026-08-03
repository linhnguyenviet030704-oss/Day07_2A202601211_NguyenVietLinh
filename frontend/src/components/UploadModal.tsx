import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  Sliders,
  Layers,
  Cpu,
  Sparkles,
  Info,
  CheckCircle2,
  FileCode,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  ChunkingStrategy,
  EmbeddingModel,
  DocumentIngestOptions,
  EMBEDDING_MODEL_DETAILS,
  CHUNKING_STRATEGY_DETAILS
} from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartIngest: (
    fileData: { name: string; fileType: string; content: string; sizeBytes: number },
    options: DocumentIngestOptions,
    uiOptions?: { showVisualizer?: boolean }
  ) => Promise<void>;
  voyageRateLimit: { tpm: number; rpm: number };
  sampleDocsAvailable: { id: string; name: string; content: string }[];
}

type UploadFileData = { name: string; fileType: string; content: string; sizeBytes: number };

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onStartIngest,
  voyageRateLimit,
  sampleDocsAvailable,
}) => {
  if (!isOpen) return null;

  // File State
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFileType, setSelectedFileType] = useState<string>('txt');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileSizeBytes, setFileSizeBytes] = useState<number>(0);
  const [selectedFiles, setSelectedFiles] = useState<UploadFileData[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'sample' | 'text'>('upload');
  const [pastedText, setPastedText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [pastedTitle, setPastedTitle] = useState<string>('Văn_Bản_Mới.txt');

  // Ingestion Options State
  const [chunkingStrategy, setChunkingStrategy] = useState<ChunkingStrategy>('recursive');
  const [chunkSize, setChunkSize] = useState<number>(512);
  const [chunkOverlap, setChunkOverlap] = useState<number>(50);
  const [embeddingModel, setEmbeddingModel] = useState<EmbeddingModel>('mock');
  
  // Dynamic Embedding Dimension state based on model
  const allowedDimensions = EMBEDDING_MODEL_DETAILS[embeddingModel].allowedDimensions;
  const [embeddingDimension, setEmbeddingDimension] = useState<number>(
    EMBEDDING_MODEL_DETAILS[embeddingModel].defaultDimension
  );

  // Update dimension when embedding model changes if current dimension not allowed
  const handleModelChange = (model: EmbeddingModel) => {
    setEmbeddingModel(model);
    const newAllowed = EMBEDDING_MODEL_DETAILS[model].allowedDimensions;
    if (!newAllowed.includes(embeddingDimension)) {
      setEmbeddingDimension(EMBEDDING_MODEL_DETAILS[model].defaultDimension);
    }
  };

  // Handle Local File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList?.length) return;
    const files: File[] = [];
    for (let index = 0; index < fileList.length; index++) {
      const file = fileList.item(index);
      if (file) files.push(file);
    }

    const loadedFiles = await Promise.all(files.map(async (file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      return {
        name: file.name,
        fileType: ext,
        content: await file.text(),
        sizeBytes: file.size
      };
    }));

    setSelectedFiles(loadedFiles);
    setSelectedFileName(loadedFiles.length === 1 ? loadedFiles[0].name : `${loadedFiles.length} files selected`);
    setFileSizeBytes(loadedFiles.reduce((total, file) => total + file.sizeBytes, 0));
    setSelectedFileType(loadedFiles[0]?.fileType || 'txt');
    setFileContent(loadedFiles[0]?.content || '');
  };

  // Select Sample Document
  const handleSelectSample = (doc: { id: string; name: string; content: string }) => {
    setSelectedFiles([]);
    setSelectedFileName(doc.name);
    setFileContent(doc.content);
    setFileSizeBytes(new Blob([doc.content]).size);
    setSelectedFileType(doc.name.endsWith('.md') ? 'markdown' : 'txt');
  };

  // Submit Flow
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setUploadError('');

    let filesToUpload: UploadFileData[] = [];
    if (activeTab === 'upload') {
      filesToUpload = selectedFiles;
    } else if (activeTab === 'text') {
      if (!pastedText.trim()) return;
      filesToUpload = [{
        name: pastedTitle.endsWith('.txt') ? pastedTitle : `${pastedTitle}.txt`,
        fileType: 'txt',
        content: pastedText,
        sizeBytes: new Blob([pastedText]).size
      }];
    } else {
      filesToUpload = [{
        name: selectedFileName || 'Tai_Lieu_RAG.txt',
        fileType: selectedFileType,
        content: fileContent,
        sizeBytes: fileSizeBytes
      }];
    }

    filesToUpload = filesToUpload.filter((file) => file.content.trim());
    if (!filesToUpload.length) return;
    const [firstFile, ...remainingFiles] = filesToUpload;
    const finalName = firstFile.name;
    const finalType = firstFile.fileType;
    const finalContent = firstFile.content;
    const finalSize = firstFile.sizeBytes;

    const options: DocumentIngestOptions = {
      chunkingStrategy,
      chunkSize,
      chunkOverlap,
      embeddingModel,
      embeddingDimension
    };

    setIsSubmitting(true);
    try {
      await onStartIngest(
      {
        name: finalName || 'Tài_Lệu_RAG.txt',
        fileType: finalType,
        content: finalContent,
        sizeBytes: finalSize
      },
      options,
      { showVisualizer: filesToUpload.length === 1 }
      );
      for (const file of remainingFiles) {
        await onStartIngest(file, options, { showVisualizer: false });
      }
      onClose();
    } catch (error: any) {
      setUploadError(error?.message || 'Upload failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || (
    activeTab === 'text'
      ? !pastedText.trim()
      : activeTab === 'upload'
        ? selectedFiles.length === 0
        : !fileContent.trim()
  );
  const usesVoyage = embeddingModel.startsWith('voyage-');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              Upload & Cấu Hình Phân Đoạn (Segmentation & Embedding)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn các tham số chunking và vector embedding trước khi chạy qua tự động hóa pipeline RAG.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Section 1: Choose Document Source */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              1. Chọn Nguồn Tài Liệu
            </label>

            {/* Source Tab Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'upload' ? 'bg-white text-emerald-950 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tải File Từ Máy
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sample')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'sample' ? 'bg-white text-emerald-950 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kho Tài Liệu Mẫu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'text' ? 'bg-white text-emerald-950 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dán Văn Bản Trực Tiếp
              </button>
            </div>

            {/* Tab 1: Upload File */}
            {activeTab === 'upload' && (
              <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/20 transition-all cursor-pointer relative">
                <input
                  type="file"
                  accept=".txt,.md,.pdf,.json,.csv,.docx"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedFileName ? selectedFileName : 'Kéo thả file vào đây hoặc nhấp để chọn'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Hỗ trợ: TXT, Markdown, PDF, JSON, CSV (tối đa 15MB/file)
                    </p>
                  </div>
                  {selectedFileName && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã chọn {selectedFiles.length || 1} file ({(fileSizeBytes / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Sample Docs */}
            {activeTab === 'sample' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleDocsAvailable.map((doc) => {
                  const isSelected = selectedFileName === doc.name;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectSample(doc)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <BookOpen className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{doc.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                            {doc.content.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 3: Paste Raw Text */}
            {activeTab === 'text' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Tên văn bản (vd: Quy_Trinh_Moi.txt)"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <textarea
                  rows={4}
                  placeholder="Dán nội dung tài liệu của bạn vào đây..."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  className="w-full p-3 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                />
              </div>
            )}
          </div>

          <hr className="border-slate-200/80" />

          {/* Section 2: Segmentation / Chunking Strategy Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                2. Chiến Lược Phân Đoạn (Chunking Strategy)
              </label>
            </div>

            {/* Strategy Radio Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(Object.keys(CHUNKING_STRATEGY_DETAILS) as ChunkingStrategy[]).map((strat) => {
                const details = CHUNKING_STRATEGY_DETAILS[strat];
                const isSelected = chunkingStrategy === strat;
                return (
                  <div
                    key={strat}
                    onClick={() => setChunkingStrategy(strat)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">{details.name}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{details.description}</p>
                    <p className="text-[10px] text-emerald-700 font-medium mt-1">
                      💡 {details.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Chunk Size & Overlap Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Chunk Size (Kích thước):</span>
                  <span className="font-semibold text-emerald-700 font-mono">{chunkSize} tokens (~{chunkSize * 4} ký tự)</span>
                </div>
                <input
                  type="range"
                  min={128}
                  max={2048}
                  step={64}
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>128 tokens</span>
                  <span>512 (Chuẩn)</span>
                  <span>2048 tokens</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-700">Chunk Overlap (Độ chồng lấp):</span>
                  <span className="font-semibold text-emerald-700 font-mono">{chunkOverlap} tokens</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  step={10}
                  value={chunkOverlap}
                  onChange={(e) => setChunkOverlap(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0 tokens</span>
                  <span>50 (10%)</span>
                  <span>200 tokens</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200/80" />

          {/* Section 3: Embedding Model & Dynamic Size Selection */}
          <div className="space-y-4">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-emerald-600" />
              3. Mô Hình Vector Embedding & Kích Thước Vector (Embedding Size)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Embedding Model Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Mô hình Embedding:</label>
                <select
                  value={embeddingModel}
                  onChange={(e) => handleModelChange(e.target.value as EmbeddingModel)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {(Object.keys(EMBEDDING_MODEL_DETAILS) as EmbeddingModel[]).map((m) => (
                    <option key={m} value={m}>
                      {EMBEDDING_MODEL_DETAILS[m].name} ({EMBEDDING_MODEL_DETAILS[m].provider})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 italic">
                  {EMBEDDING_MODEL_DETAILS[embeddingModel].description}
                </p>
                {usesVoyage && (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                    <div className="flex items-start gap-2">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-700" />
                      <span>
                        Voyage backend rate limit: <strong>{voyageRateLimit.tpm.toLocaleString('en-US')} TPM</strong> / <strong>{voyageRateLimit.rpm} RPM</strong>.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Embedding Size / Dimension Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                  <span>Kích thước Vector (Embedding Size):</span>
                  <span className="text-emerald-700 font-mono font-semibold">{embeddingDimension} chiều (dims)</span>
                </label>

                <div className="flex flex-wrap gap-2 pt-1">
                  {allowedDimensions.map((dim) => {
                    const isSelected = embeddingDimension === dim;
                    return (
                      <button
                        type="button"
                        key={dim}
                        onClick={() => setEmbeddingDimension(dim)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {dim} dims
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400">
                  Số chiều vector cho phép tương ứng chính xác với mô hình <strong className="text-slate-600">{EMBEDDING_MODEL_DETAILS[embeddingModel].name}</strong>.
                </p>
              </div>
            </div>
          </div>

          {(isSubmitting || uploadError) && (
            <div className={`rounded-xl border p-3 text-xs ${
              uploadError
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-900'
            }`}>
              <div className="flex items-start gap-2">
                {uploadError ? (
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                ) : (
                  <Loader2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-700 animate-spin" />
                )}
                <div>
                  <p className="font-semibold">
                    {uploadError ? 'Upload khong thanh cong' : 'Dang upload va tao vector'}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-5">
                    {uploadError
                      ? uploadError.includes('429')
                        ? 'Voyage dang gioi han tan suat (429 Too Many Requests). Cho mot luc roi thu lai, hoac chuyen sang mock embedding de test nhanh.'
                        : uploadError
                      : usesVoyage
                        ? 'Dang goi Voyage API de tao embeddings. Buoc nay co the mat vai chuc giay neu tai lieu dai.'
                        : 'Dang gui tai lieu sang backend va luu vao vector store.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Chạy Flow Segmentation & Embedding</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

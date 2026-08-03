"""
Bài 3.1 (Giai đoạn 2) — Chiến lược chunking cá nhân được nhóm B08 phân công:
"Structure chunking" (`DocumentStructureChunker`, tương ứng `structure_500` trong
report/retrieval_eval_report.md của nhóm) — cắt theo heading Markdown, phù hợp với
sổ tay sinh viên / văn bản quy định có cấu trúc theo mục.

Đây là script hỗ trợ cho REPORT_CANHAN.md / REPORT_NHOM.md, KHÔNG thuộc gói `src/`
đã hoàn thiện (không ảnh hưởng phần code cá nhân đã chấm ở Phần 3).

Chạy so sánh với baseline (FixedSizeChunker) trên dữ liệu HUS + USSH đã crawl:
    python report/document_structure_chunker.py
Kết quả được ghi ra report/document_structure_chunker_comparison.txt.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


class DocumentStructureChunker:
    """Chia nhỏ theo tiêu đề/mục (heading/section), phù hợp cho sổ tay sinh viên
    và văn bản hành chính (thông báo học phí, nội quy KTX, hướng dẫn thư viện...).

    Lý do thiết kế: các tài liệu K3 (sổ tay sinh viên, thông báo/quy định đại học)
    được viết theo từng mục nội dung độc lập (VD: "Điều kiện, thủ tục vào ở KTX",
    "Nội quy...", "Mức thu học phí từng ngành"...). Nếu văn bản có heading markdown
    cấp mục (##, ###, ...) thì cắt đúng theo ranh giới mục đó — bỏ qua H1 (chỉ là
    tiêu đề tài liệu, không phải ranh giới nội dung) để tránh gộp nhầm cả tài liệu
    thành một mục. Nếu không có heading cấp mục (do nội dung được trích xuất thô từ
    HTML), coi mỗi đoạn văn cách nhau bởi dòng trống là một "mục" — gộp các đoạn quá
    nhỏ lại với nhau để tránh chunk vụn, và chỉ cắt cứng theo câu khi một mục vẫn
    vượt quá max_chars (tránh cắt đứt giữa một điều kiện/quy định).
    """

    def __init__(self, max_chars: int = 600, min_chars: int = 150) -> None:
        self.max_chars = max_chars
        self.min_chars = min_chars

    def chunk(self, text: str) -> list[str]:
        if not text:
            return []
        sections = self._split_sections(text)
        pieces: list[str] = []
        for section in sections:
            if len(section) <= self.max_chars:
                pieces.append(section)
            else:
                pieces.extend(self._split_by_sentence(section))
        return self._merge_small(pieces)

    def _split_sections(self, text: str) -> list[str]:
        # Chỉ coi là "có heading mục" khi có từ ## trở xuống (bỏ qua H1 - tiêu đề
        # tài liệu) và có ít nhất 2 mốc, tránh gộp nhầm cả tài liệu thành 1 "mục".
        heading_matches = list(re.finditer(r"^#{2,6}\s", text, re.MULTILINE))
        if len(heading_matches) >= 2:
            parts = re.split(r"(?=^#{2,6}\s)", text, flags=re.MULTILINE)
        else:
            parts = re.split(r"\n\s*\n", text)
        return [p.strip() for p in parts if p.strip()]

    def _split_by_sentence(self, section: str) -> list[str]:
        sentences = re.split(r"(?<=[.!?])\s+", section)
        chunks: list[str] = []
        current = ""
        for sentence in sentences:
            candidate = f"{current} {sentence}".strip() if current else sentence
            if len(candidate) <= self.max_chars:
                current = candidate
            else:
                if current:
                    chunks.append(current)
                current = sentence
        if current:
            chunks.append(current)
        return chunks

    def _merge_small(self, pieces: list[str]) -> list[str]:
        merged: list[str] = []
        current = ""
        for piece in pieces:
            candidate = f"{current}\n\n{piece}" if current else piece
            if len(current) < self.min_chars and len(candidate) <= self.max_chars:
                current = candidate
            else:
                if current:
                    merged.append(current)
                current = piece
        if current:
            merged.append(current)
        return merged


def _run_comparison() -> None:
    from ingest import load_documents
    from src.chunking import FixedSizeChunker

    data_dirs = ["data/hus_university", "data/ussh_university"]
    baseline = FixedSizeChunker()  # chunk_size=500, overlap=50 (mac dinh cua build_knowledge_base)
    custom = DocumentStructureChunker(max_chars=600, min_chars=150)

    lines: list[str] = []
    total_base = total_custom = 0
    for data_dir in data_dirs:
        for doc in load_documents(Path(__file__).resolve().parent.parent / data_dir):
            base_chunks = baseline.chunk(doc.content)
            custom_chunks = custom.chunk(doc.content)
            total_base += len(base_chunks)
            total_custom += len(custom_chunks)
            base_avg = sum(len(c) for c in base_chunks) / len(base_chunks) if base_chunks else 0
            custom_avg = sum(len(c) for c in custom_chunks) / len(custom_chunks) if custom_chunks else 0
            lines.append(f"=== {Path(data_dir).name}/{doc.id} ({len(doc.content)} chars) ===")
            lines.append(f"  FixedSizeChunker        : {len(base_chunks)} chunks, avg_len={base_avg:.0f}")
            lines.append(f"  DocumentStructureChunker: {len(custom_chunks)} chunks, avg_len={custom_avg:.0f}")
            lines.append("")
    lines.append(f"TONG: FixedSizeChunker={total_base} chunks | DocumentStructureChunker={total_custom} chunks")

    out_path = Path(__file__).resolve().parent / "document_structure_chunker_comparison.txt"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Da ghi ket qua vao {out_path}")


if __name__ == "__main__":
    _run_comparison()

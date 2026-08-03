"""
Kiem tra Phan 4 (Du doan do tuong tu) trong REPORT_CANHAN.md.
Chay:  python check_similarity.py
Ket qua duoc ghi ra file similarity_result.txt (de tranh loi encoding tren console Windows).
"""
from pathlib import Path
from dotenv import load_dotenv
from src import compute_similarity, OpenAIEmbedder

load_dotenv(dotenv_path=Path(".env"), override=False)
embedder = OpenAIEmbedder()

pairs = [
    ("Thư viện mở cửa từ 7 giờ sáng đến 9 giờ tối các ngày trong tuần.",
     "Thư viện hoạt động từ 7h sáng tới 9h tối, tất cả các ngày trong tuần."),
    ("Python is a high-level programming language.",
     "Python is a high level programming language."),
    ("Học phí phải đóng trước khi bắt đầu học kỳ mới.",
     "Sinh viên cần thanh toán học phí đúng hạn quy định."),
    ("Thư viện cho sinh viên mượn sách và tài liệu học tập.",
     "Ký túc xá có quy định về giờ giới nghiêm cho sinh viên nội trú."),
    ("Con mèo đang ngủ trên ghế sofa.",
     "Học bổng khuyến khích học tập dành cho sinh viên có thành tích tốt."),
]

lines = [f"Backend nhung: {embedder._backend_name}", ""]
for i, (a, b) in enumerate(pairs, start=1):
    score = compute_similarity(embedder(a), embedder(b))
    lines.append(f"Cap {i}: score={score:.4f}")
    lines.append(f"  A: {a}")
    lines.append(f"  B: {b}")
    lines.append("")

Path("similarity_result.txt").write_text("\n".join(lines), encoding="utf-8")
print("Da ghi ket qua vao similarity_result.txt")

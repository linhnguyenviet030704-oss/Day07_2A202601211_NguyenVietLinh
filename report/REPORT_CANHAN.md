# Báo Cáo Cá Nhân - Lab 7: Embedding & Vector Store

**Họ tên:** Nguyễn Việt Linh  
**Nhóm:** B08
**Ngày:** 03/08/2026

---

## 1. Khởi Động

### Độ tương tự cosine

Độ tương tự cosine cao nghĩa là hai vector văn bản có hướng gần nhau trong không gian embedding, tức là hai đoạn văn có nội dung hoặc ý nghĩa gần nhau. Cosine similarity phù hợp với text embedding vì nó tập trung vào hướng biểu diễn ngữ nghĩa thay vì độ lớn tuyệt đối của vector.

**Ví dụ tương tự cao**

- Câu A: Sinh viên cần đăng nhập cổng thông tin để đăng ký học phần.
- Câu B: Người học sử dụng tài khoản sinh viên để chọn môn học trên hệ thống.
- Lý do: Cả hai câu đều nói về thao tác đăng ký môn học qua hệ thống trực tuyến.

**Ví dụ tương tự thấp**

- Câu A: Sinh viên cần đăng nhập cổng thông tin để đăng ký học phần.
- Câu B: Thư viện mở cửa từ thứ Hai đến thứ Sáu.
- Lý do: Hai câu thuộc hai dịch vụ khác nhau, một câu nói về học vụ, một câu nói về thư viện.

### Bài toán chunking

Với tài liệu 10.000 ký tự, `chunk_size=500`, `overlap=50`:

- Bước trượt: `500 - 50 = 450`
- Số chunk: `ceil((10000 - 500) / 450) + 1 = 23`

Nếu overlap tăng lên 100 thì bước trượt còn 400, số chunk tăng thành `ceil((10000 - 500) / 400) + 1 = 25`. Overlap lớn hơn giúp giữ ngữ cảnh ở ranh giới chunk, nhưng làm tăng số chunk và chi phí tìm kiếm/lưu trữ.

---

## 2. Hướng Tiếp Cận Cá Nhân

### Chunking

Với `SentenceChunker`, em tách câu bằng regex dựa trên dấu `.`, `!`, `?` và xuống dòng, sau đó gom tối đa `max_sentences_per_chunk` câu vào một chunk. Cách này giữ câu nguyên vẹn nên chunk dễ đọc hơn fixed-size, đồng thời xử lý chuỗi rỗng bằng cách trả về danh sách rỗng.

Với `RecursiveChunker`, em ưu tiên tách theo ranh giới lớn trước: đoạn văn, dòng, câu, khoảng trắng, rồi mới cắt cứng khi không còn separator phù hợp. Base case là đoạn hiện tại đã ngắn hơn `chunk_size`; nếu mọi separator đều không tách được thì dùng `FixedSizeChunker` không overlap.

Em cũng bổ sung `DocumentStructureChunker` để tách Markdown theo heading. Chiến lược này phù hợp với sổ tay sinh viên/quy định học vụ vì nội dung thường được tổ chức theo mục và tiểu mục.

### Vector store và retrieval

`EmbeddingStore` dùng ChromaDB để lưu nội dung chunk, metadata và embedding. Khi thêm tài liệu, store hỗ trợ cả embedding từng văn bản và embedding theo batch nếu embedder có hàm `embed`, giúp dùng được mock, local model, OpenAI, Voyage hoặc FPT.

Tìm kiếm semantic dùng embedding query và trả về score dạng `1 - distance`. Ngoài semantic search, em bổ sung BM25, hybrid và rerank:

- `bm25`: mạnh với truy vấn tiếng Việt ngắn chứa từ khóa rõ.
- `semantic`: phù hợp khi embedding thật có chất lượng tốt.
- `hybrid`: kết hợp lexical và vector.
- `rerank`: lấy ứng viên từ hybrid rồi cộng thêm điểm overlap từ khóa.

`search_with_filter` truyền `where` vào ChromaDB để lọc metadata trước khi trả kết quả. `delete_document` xóa toàn bộ chunk có cùng `doc_id`, sau đó refresh cache nội bộ.

### Agent RAG

`KnowledgeBaseAgent.answer()` lấy top-k chunk bằng store, ghép thành context có đánh số, rồi tạo prompt yêu cầu LLM trả lời chỉ dựa trên context. Cách này giữ luồng RAG đơn giản: retrieve trước, inject context sau, cuối cùng gọi `llm_fn`.

---

## 3. Hoàn Thiện Code

Các phần đã hoàn thành:

- `SentenceChunker`, `RecursiveChunker`, `compute_similarity`, `ChunkingStrategyComparator`.
- `EmbeddingStore` với add/search/filter/delete và các strategy BM25, semantic, hybrid, rerank.
- Các backend embedding: mock, local multilingual, OpenAI, Voyage, FPT.
- Backend service lưu hội thoại, upload tài liệu, scan Markdown, query RAG.
- Frontend React/Vite cho chat, upload tài liệu, cấu hình retrieval và xem chunk.
- Bộ đánh giá retrieval trong `eval/run_retrieval_eval.py`.

### Kết quả kiểm thử

Lệnh đã chạy:

```bash
python -m pytest
```

Kết quả:

```text
collected 70 items
70 passed, 1 warning in 3.21s
```

**Số lượng bài test vượt qua:** 70 / 70

---

## 4. Dự Đoán Độ Tương Tự

| Cặp | Câu A | Câu B | Dự đoán | Giải thích |
|---:|---|---|---|---|
| 1 | Sinh viên đăng ký học phần trên cổng đào tạo. | Người học chọn môn học trực tuyến bằng tài khoản sinh viên. | Cao | Cùng nói về đăng ký môn học. |
| 2 | Học bổng khuyến khích học tập xét theo kết quả học tập. | Sinh viên đạt kết quả tốt có thể được xét học bổng. | Cao | Cùng chủ đề học bổng và điều kiện xét. |
| 3 | Thư viện hỗ trợ mượn sách và tài liệu học tập. | Sinh viên cần đóng học phí đúng hạn. | Thấp | Hai dịch vụ khác nhau. |
| 4 | Cấp giấy xác nhận sinh viên thực hiện qua hệ thống CTSV. | Sinh viên xin giấy giới thiệu tại dịch vụ công. | Cao | Cùng nhóm thủ tục cấp giấy tờ. |
| 5 | Bảo hiểm y tế hỗ trợ khám chữa bệnh. | Câu lạc bộ sinh viên tổ chức hoạt động ngoại khóa. | Thấp | Nội dung không liên quan. |

Điểm bất ngờ trong quá trình đánh giá là mock embedding gần như không phản ánh tốt ngữ nghĩa tiếng Việt, nên semantic search có thể thấp hơn BM25. Điều này cho thấy chất lượng embedding backend ảnh hưởng trực tiếp đến kết luận về chiến lược chunking.

---

## 5. Kết Quả Truy Xuất Cá Nhân

Chiến lược cá nhân em chọn là `recursive_500 + bm25`. Đây là cấu hình có kết quả tốt nhất trong benchmark tự động: `Precision@3 = 0.667`, tạo 261 chunk với độ dài trung bình 385.1 ký tự.

| # | Query | Top-1 chunk | Top-3 có chunk đúng? | Precision@3 | Nhận xét |
|---:|---|---|---|---:|---|
| 1 | `hoc bong sinh vien` | `01-hoc-bong.md`, score `10.944` | Có | 1.000 | Truy xuất đúng tài liệu học bổng ngay top-1; các kết quả còn lại cũng liên quan qua index học bổng. |
| 2 | `dang ky mon hoc` | `course-registration.md`, score `16.081` | Có theo đánh giá thủ công | 0.000 | Top-1 đúng chủ đề đăng ký học phần, nhưng metric tự động không tính đúng vì gold terms dùng "mon hoc" trong khi tài liệu ghi "học phần". |
| 3 | `hoc phi` | `06-cac-quy-dinh-va-bieu-mau-thuong-dung.md`, score `9.445` | Có | 0.667 | Có nội dung hỏi đáp học phí trong top-1, nhưng kết quả còn nhiễu do file index và quy định chung. |
| 4 | `thu vien muon sach` | `00-INDEX.md`, score `7.214` | Có | 0.667 | Top-1 chưa phải chunk tốt nhất; `library-services.md` nằm ở top-2 với score `6.313`, đủ để agent có ngữ cảnh thư viện. |
| 5 | `cap giay to cho sinh vien` | `00-INDEX.md`, score `21.941` | Có | 1.000 | Truy xuất tốt nhờ từ khóa đặc thù; top-2 là tài liệu hướng dẫn sinh viên đăng ký cấp giấy trên hệ thống. |

**Tổng kết kết quả cá nhân**

- Câu hỏi có chunk liên quan trong top-3 theo đánh giá thủ công: 5 / 5.
- Câu hỏi có top-1 đúng hoặc chấp nhận được: 4 / 5.
- `Precision@3` trung bình theo benchmark tự động: 0.667.
- Điểm yếu chính: file `00-INDEX.md` thường được BM25 xếp cao vì chứa nhiều tiêu đề/từ khóa, nhưng không phải lúc nào cũng là chunk giàu ngữ cảnh nhất.

**Điều học được:** Với tài liệu hành chính tiếng Việt, BM25 rất mạnh khi query ngắn và chứa đúng từ khóa. Tuy nhiên cần kết hợp metadata filter hoặc rerank để đẩy các chunk nội dung chi tiết lên trên file index. Semantic search chỉ nên dùng để kết luận khi cấu hình embedding thật như local multilingual, Voyage, FPT hoặc OpenAI thay vì mock embedding.

---

## Tự Đánh Giá Cá Nhân

| Tiêu chí | Điểm tự đánh giá |
|---|---:|
| Khởi động | 5 / 5 |
| Hướng tiếp cận cá nhân | 10 / 10 |
| Hoàn thiện code | 30 / 30 |
| Dự đoán độ tương tự | 5 / 5 |
| Kết quả truy xuất cá nhân | 9 / 10 |
| **Tổng phần cá nhân** | **59 / 60** |

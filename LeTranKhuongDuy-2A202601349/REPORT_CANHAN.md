# Báo Cáo Cá Nhân — Lab 7: Embedding & Vector Store

**Họ tên:** Lê Trần Khương Duy — 2A202601349
**Nhóm:** B08
**Ngày:** 03/08/2026

> **Nộp 1 bản / sinh viên.** Phần nhóm (lựa chọn tài liệu, thiết kế chiến lược, bộ câu hỏi đánh giá, demo) nộp chung 1 bản trong `REPORT_NHOM.md`. Chi tiết thang điểm: `docs/SCORING.md`.

**Tổng điểm phần cá nhân: 60** = Khởi động (5) + Hướng tiếp cận (10) + Hoàn thiện code (30) + Dự đoán độ tương tự (5) + Kết quả truy xuất của tôi (10).

> **Chiến lược chunking của tôi:** `FixedSizeChunker(chunk_size=300, overlap=50)` + retrieval **BM25** (cấu hình `fixed_300 + bm25`). Đây là chiến lược cá nhân được đăng ký trong `REPORT_NHOM.md`, và mọi câu trả lời / kết quả bên dưới đều dựa trên chiến lược này.

---

## 1. Khởi động (Warm-up) — Cá nhân (5 điểm)

### Độ tương tự Cosine (Cosine Similarity) (Bài tập 1.1)

**Độ tương tự cosine cao (High cosine similarity) nghĩa là gì?**

> Hai vector embedding gần như cùng hướng trong không gian nhiều chiều (góc giữa chúng nhỏ, cosine tiến về 1), nghĩa là hai đoạn văn bản gần nhau về **ý nghĩa/ngữ nghĩa**, chứ không chỉ trùng từ.

**Ví dụ có độ tương tự CAO:**

- Câu A: "Sinh viên đăng ký học phần trên cổng học vụ."
- Câu B: "Đăng ký môn học online theo lịch quy định."
- Tại sao tương đồng: cùng chủ đề (đăng ký môn học), cùng ý định hành chính, dùng các từ khóa gần nghĩa nhau.

**Ví dụ có độ tương tự THẤP:**

- Câu A: "Thư viện mở cửa đến 9 giờ tối."
- Câu B: "Lệ phí cấp giấy vay vốn ngân hàng."
- Tại sao khác: hai chủ đề tách biệt (giờ mở cửa thư viện vs. thủ tục cấp giấy tờ), không chung ngữ cảnh.

**Tại sao độ tương tự cosine (cosine similarity) được ưu tiên hơn khoảng cách Euclid (Euclidean distance) cho text embeddings?**

> Độ dài văn bản làm độ lớn (magnitude) của vector thay đổi, trong khi cosine chỉ so **hướng** nên bỏ qua độ lớn; nhờ đó một câu ngắn và một đoạn dài cùng chủ đề vẫn được coi là tương đồng, còn khoảng cách Euclid dễ bị "phạt" oan vì chênh lệch độ lớn.

### Bài toán tính toán Chunking (Bài tập 1.2)

**Tài liệu 10,000 ký tự, chunk_size=500, overlap=50. Bao nhiêu chunks?**

> *Trình bày phép tính:* `step = chunk_size − overlap = 500 − 50 = 450`. Vị trí bắt đầu chạy `0, 450, 900, …` cho tới khi phủ hết 10,000 ký tự. Số chunk = `ceil((10000 − 500) / 450) + 1 = ceil(9500 / 450) + 1 = ceil(21.11) + 1 = 22 + 1`.
> *Đáp án:* **23 chunks.** (Kiểm chứng theo `FixedSizeChunker.chunk`: các `start` là `0…9900` bước 450 → 23 lát, lát cuối `text[9900:10000]` rồi dừng.)

**Nếu độ chồng chéo (overlap) tăng lên 100, số lượng chunk thay đổi thế nào? Tại sao muốn độ chồng chéo nhiều hơn?**

> Khi `overlap=100` thì `step=400`, số chunk tăng lên `ceil((10000 − 500) / 400) + 1 = ceil(23.75) + 1 = 25 chunks`. Overlap nhiều hơn giúp một câu/ý nằm ở ranh giới không bị cắt đôi và mất ngữ cảnh — thông tin gần mép chunk xuất hiện trọn vẹn ở ít nhất một chunk, cải thiện recall khi truy xuất.

---

## 2. Hướng tiếp cận của tôi (My Approach) — Cá nhân (10 điểm)

Giải thích cách tiếp cận của bạn khi lập trình (implement) các phần chính trong gói `src`.

> Lưu ý: khi vận hành pipeline, tôi nạp corpus bằng `FixedSizeChunker(chunk_size=300, overlap=50)` rồi truy xuất bằng `retrieve(..., strategy="bm25")`, đúng chiến lược `fixed_300 + bm25` của tôi.

### Các hàm chia nhỏ (Chunking Functions)

**`SentenceChunker.chunk`** — hướng tiếp cận:

> Dùng regex `(?<=[.!?])\s+|\n+` trong `_sentences()`: lookbehind bắt các dấu kết câu `. ! ?` theo sau bởi khoảng trắng, hoặc tách theo xuống dòng. Sau đó gom mỗi `max_sentences_per_chunk` câu thành một chunk, `join` bằng dấu cách và `strip()`. Edge case: text rỗng → trả `[]`; khoảng trắng thừa được cắt bỏ; câu không có dấu kết vẫn được giữ nhờ nhánh `\n+`.

**`RecursiveChunker.chunk` / `_split`** — hướng tiếp cận:

> Thử các separator theo thứ tự ưu tiên `["\n\n", "\n", ". ", " ", ""]` (thô → mịn). **Base case:** đoạn ≤ `chunk_size` → trả `[text]`; hết separator hoặc gặp separator rỗng → fallback `FixedSizeChunker(overlap=0)`. Với mỗi mức, gom tham lam (greedy) các phần nối bằng separator hiện tại cho tới khi thêm phần kế tiếp sẽ vượt `chunk_size`, rồi đệ quy phần đã gom xuống separator mịn hơn. Nhờ vậy giữ được ranh giới đoạn/câu tự nhiên trước khi buộc phải cắt cứng.

### Lớp EmbeddingStore

**`add_documents` + `search`** — hướng tiếp cận:

> `add_documents` embed nội dung từng `Document` (hỗ trợ batch qua `.embed` nếu có, không thì gọi `embedding_fn` từng text) rồi `upsert` vào collection ChromaDB kèm metadata. `search` embed truy vấn, gọi `collection.query` với không gian `cosine`, và quy đổi điểm `score = 1.0 − distance`, sắp xếp giảm dần. Với chiến lược của tôi thì `retrieve(strategy="bm25")` được dùng thay cho `search` thuần vector.

**`search_with_filter` + `delete_document`** — hướng tiếp cận:

> `search_with_filter` **lọc trước** (pre-filter): dựng mệnh đề `where` cho ChromaDB (list → `$in`, nhiều điều kiện → `$and`) nên ChromaDB áp filter *trước* khi xếp hạng tương tự; không có filter thì rơi về `search` thường. `delete_document` `get` các id có `doc_id` khớp rồi `collection.delete`, refresh cache; trả `True/False` tùy có xóa được gì không.

### Tác tử KnowledgeBaseAgent

**`answer`** — hướng tiếp cận:

> Theo mẫu RAG: (1) `retrieve` top-k chunk theo `strategy` (tôi truyền `"bm25"`); (2) dựng context bằng cách đánh số từng chunk `"[i] content"` nối bằng dòng trống; (3) chèn context vào prompt *"Answer the question using only the context below…"* trước câu hỏi rồi gọi `llm_fn`. Context được inject nguyên khối phía trên câu hỏi để mô hình chỉ trả lời dựa trên ngữ cảnh truy xuất.

---

## 3. Hoàn thiện code (Core Implementation) — Cá nhân (30 điểm)

Vượt qua bộ kiểm thử là điều kiện tính điểm phần này.

### Kết Quả Kiểm Thử (Test Results)

```
$ python -m pytest tests/test_solution.py -v
platform win32 -- Python 3.11.9, pytest-9.1.1, pluggy-1.6.0
collected 42 items

tests/test_solution.py::TestProjectStructure ....................... PASSED
tests/test_solution.py::TestClassBasedInterfaces .................... PASSED
tests/test_solution.py::TestFixedSizeChunker ....................... PASSED
tests/test_solution.py::TestSentenceChunker ........................ PASSED
tests/test_solution.py::TestRecursiveChunker ....................... PASSED
tests/test_solution.py::TestEmbeddingStore ......................... PASSED
tests/test_solution.py::TestKnowledgeBaseAgent ..................... PASSED
tests/test_solution.py::TestComputeSimilarity ...................... PASSED
tests/test_solution.py::TestCompareChunkingStrategies .............. PASSED
tests/test_solution.py::TestEmbeddingStoreSearchWithFilter ......... PASSED
tests/test_solution.py::TestEmbeddingStoreDeleteDocument ........... PASSED

============================= 42 passed in 2.54s ==============================
```

**Số lượng bài test vượt qua (pass):** **42 / 42**

---

## 4. Dự đoán độ tương tự (Similarity Predictions) — Cá nhân (5 điểm)

> Điểm thực tế được tính bằng `compute_similarity` với embedding mặc định (MockEmbedder, `dim=64`).

| Cặp | Câu A                                                   | Câu B                                                   | Dự đoán | Điểm thực tế | Đúng? |
| ---- | -------------------------------------------------------- | -------------------------------------------------------- | ---------- | ---------------- | ------- |
| 1    | Sinh viên đăng ký học phần trên cổng học vụ    | Đăng ký môn học online theo lịch quy định        | cao        | −0.099          | ✗      |
| 2    | Mức học phí chương trình chính quy năm 2024      | Học phí và miễn giảm học phí cho sinh viên       | cao        | 0.038            | ✗      |
| 3    | Hướng dẫn mượn sách tại thư viện Tạ Quang Bửu | Cấp giấy xác nhận sinh viên tại phòng CTSV        | thấp      | −0.053          | ✓      |
| 4    | Học bổng khuyến khích học tập cho sinh viên giỏi | Học bổng khuyến khích học tập cho sinh viên giỏi | cao        | 1.000            | ✓      |
| 5    | Thư viện mở cửa đến 9 giờ tối                    | Lệ phí cấp giấy vay vốn ngân hàng                 | thấp      | −0.107          | ✓      |

**Kết quả nào bất ngờ nhất? Điều này nói gì về cách embeddings biểu diễn ý nghĩa?**

> Bất ngờ nhất là cặp 1 và 2: hai câu **rõ ràng cùng nghĩa** nhưng điểm gần 0 (thậm chí âm). Nguyên nhân là MockEmbedder băm text bằng MD5 thành vector giả-ngẫu nhiên, nên chỉ text **trùng khớp tuyệt đối** mới đạt 1.000 (cặp 4), còn mọi cặp khác nhau đều ~0. Điều này cho thấy mock embedding **không mã hóa ngữ nghĩa**, chỉ mã hóa danh tính chuỗi — muốn đo ý nghĩa thật (nhất là tiếng Việt) phải dùng embedder multilingual thực (`EMBEDDING_PROVIDER=local`/API). Đây cũng là lý do chiến lược của tôi dựa vào **BM25** (khớp từ khóa) thay vì semantic khi chỉ có mock embedding.

---

## 5. Kết quả truy xuất của tôi (Competition Results) — Cá nhân (10 điểm)

Chạy **5 câu hỏi đánh giá của nhóm** trên mã nguồn cá nhân của bạn trong gói `src`, dùng chiến lược **`fixed_300 + bm25`** (số liệu từ `report/retrieval_eval_report.md`, top-k=3).

| # | Câu hỏi (Query)             | Top-1 Chunk truy xuất được (tóm tắt)                                                   | Điểm Score | Có liên quan không? (Relevant)                                             | Câu trả lời của Agent (tóm tắt)                                                     |
| - | ----------------------------- | -------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1 | `hoc bong sinh vien`        | `01-hoc-bong.md` — mục học bổng tài trợ / trao đổi sinh viên                      | 9.019        | Có                                                                           | Nêu các chương trình học bổng khuyến khích, tài trợ và trao đổi sinh viên. |
| 2 | `dang ky mon hoc`           | `k3_university/course-registration.md` — "Đăng ký học phần", audience=student        | 15.184       | Có (đánh giá thủ công; metric tự động = 0.000)                       | Sinh viên đăng ký học phần trên hệ thống học vụ theo thời gian quy định.    |
| 3 | `hoc phi`                   | `06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` — biểu mẫu/thắc mắc học tập, học phí | 10.638       | Một phần (top-1 là biểu mẫu chung; chunk mức học phí ở hạng dưới) | Chỉ dẫn kênh hỏi đáp học phí và biểu mẫu liên quan.                           |
| 4 | `thu vien muon sach`        | `00-INDEX.md` — dòng mục lục (top-1); `library-services.md` ở #2                    | 7.143        | Top-1 chưa đúng, nhưng có`library-services.md` trong top-3             | Giới thiệu dịch vụ thư viện và hướng dẫn mượn sách.                          |
| 5 | `cap giay to cho sinh vien` | `00-INDEX.md` — mục "Cấp giấy tờ cho sinh viên (giấy giới thiệu, vay vốn…)"     | 21.633       | Có                                                                           | Sinh viên đăng ký cấp giấy tờ qua hệ thống CTSV/iCTSV.                           |

**Bao nhiêu câu hỏi trả về chunk có liên quan trong top-3?** **5 / 5** (đánh giá thủ công). Precision@3 trung bình theo metric tự động của cấu hình `fixed_300 + bm25` = **0.467** (đứng thứ 2 toàn bộ benchmark).

**Điều hay nhất tôi học được từ thành viên khác / nhóm khác (qua demo):**

> Từ chiến lược `recursive_500 + bm25` của Nguyễn Việt Linh, tôi thấy giữ nguyên ranh giới đoạn/mục (recursive) cho chunk dài và liền mạch hơn giúp Precision@3 tăng từ 0.467 lên 0.667 trên cùng bộ câu hỏi. Fixed chunking của tôi bắt từ khóa tốt nhưng dễ cắt ngang quy trình thành nhiều chunk rời; kết hợp ý tưởng recursive để giảm phân mảnh là hướng cải thiện rõ ràng cho lần sau.

---

## Tự Đánh Giá (Phần Cá Nhân)

| Tiêu chí                                           | Điểm tự đánh giá |
| ---------------------------------------------------- | ---------------------- |
| Khởi động (Warm-up)                               | 5 / 5                  |
| Hướng tiếp cận của tôi (My Approach)           | 10 / 10                |
| Hoàn thiện code (Core Implementation — tests)     | 30 / 30                |
| Dự đoán độ tương tự (Similarity Predictions) | 5 / 5                  |
| Kết quả truy xuất của tôi (Competition Results) | 8 / 10                 |
| **Tổng phần cá nhân**                      | **58 / 60**      |

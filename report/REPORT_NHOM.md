# Báo Cáo Nhóm - Lab 7: Embedding & Vector Store

**Nhóm:** B08
**Thành viên:** Nguyễn Việt Linh  2A202601211
Lê Trần Khương Duy 2A202601349
Nguyễn Việt Hùng 2A202601275 
Đỗ Tùng Dương 2A202601899
**Ngày:** 03/08/2026

---

## 1. Lựa Chọn Tài Liệu

### Phạm vi

Nhóm chọn chủ đề dịch vụ và quy định đại học cho sinh viên, tập trung vào các câu hỏi thường gặp: học bổng, đăng ký học phần, học phí, thư viện và cấp giấy tờ sinh viên. Đây là các nhóm nội dung phù hợp với biến thể K3 vì có thể gắn metadata như `audience`, `department`, `source_url`, `retrieved_at`, `document_version`.

### Bộ tài liệu

Corpus dùng trong đánh giá nằm trong thư mục `data/`, gồm 29 file nguồn Markdown/TXT. Phần chính là sổ tay sinh viên HUST và dữ liệu mẫu K3 về đăng ký học phần, dịch vụ thư viện.

| # | Tài liệu | Nguồn | Vai trò trong benchmark | Metadata chính |
|---:|---|---|---|---|
| 1 | `01-hoc-bong.md` | Sổ tay sinh viên HUST | Câu hỏi học bổng | `source`, `chunker`, `chunk_index` |
| 2 | `20-muc-hoc-phi...md` | Sổ tay sinh viên HUST | Câu hỏi học phí | `source`, `chunker`, `chunk_index` |
| 3 | `04-huong-dan-su-dung-thu-vien...md` | Sổ tay sinh viên HUST | Câu hỏi thư viện | `source`, `chunker`, `chunk_index` |
| 4 | `03-cap-giay-to...md` | Sổ tay sinh viên HUST | Câu hỏi cấp giấy tờ | `source`, `chunker`, `chunk_index` |
| 5 | `course-registration.md` | `data/k3_university` | Câu hỏi đăng ký học phần | `audience`, `department`, `source_url`, `retrieved_at`, `document_version` |
| 6 | `library-services.md` | `data/k3_university` | Câu hỏi dịch vụ thư viện | `audience`, `department`, `source_url`, `retrieved_at`, `document_version` |

### Metadata schema

| Trường | Kiểu | Ví dụ | Tác dụng |
|---|---|---|---|
| `source` | string | `data/.../01-hoc-bong.md` | Truy vết chunk về tài liệu gốc. |
| `chunker` | string | `recursive_500` | So sánh chất lượng giữa các chiến lược chunking. |
| `chunk_index` | number | `3` | Xác định vị trí chunk trong tài liệu. |
| `audience` | string | `student` | Lọc tài liệu đúng đối tượng sử dụng. |
| `department` | string | `academic-affairs` | Lọc theo đơn vị phụ trách. |
| `source_url` | string | URL nguồn | Kiểm chứng nguồn công khai. |
| `retrieved_at` | string | `2026-08-02` | Biết thời điểm thu thập. |
| `document_version` | string | `2026.1` | Theo dõi phiên bản quy định. |

### Governance

- Corpus chỉ dùng tài liệu công khai/mẫu học tập, không đưa secret hoặc thông tin đăng nhập vào Git.
- File runtime như `backend/storage/`, log, `.env`, `node_modules`, `dist` đã được ignore để tránh push nhầm dữ liệu cục bộ.
- Với dữ liệu mẫu `example.edu`, nhóm chỉ dùng để kiểm thử pipeline; khi nộp chính thức nên thay bằng nguồn thật nếu giảng viên yêu cầu nguồn công khai đầy đủ.

---

## 2. Thiết Kế Chiến Lược

Nhóm đánh giá bốn hướng chunking và bốn hướng retrieval:

- Chunking: `fixed_300`, `sentence_3`, `recursive_500`, `structure_500`.
- Retrieval: `semantic`, `bm25`, `hybrid`, `rerank`.
- Top-k: 3.
- Embedding mặc định: mock fallback.

Kết quả tổng hợp từ `report/retrieval_eval_report.md`:

| Hạng | Chunker | Retriever | Precision@3 | Chunks | Avg chunk length |
|---:|---|---|---:|---:|---:|
| 1 | `recursive_500` | `bm25` | 0.667 | 261 | 385.1 |
| 2 | `fixed_300` | `bm25` | 0.467 | 409 | 293.3 |
| 3 | `sentence_3` | `hybrid` | 0.467 | 436 | 228.6 |
| 4 | `recursive_500` | `hybrid` | 0.467 | 261 | 385.1 |
| 5 | `recursive_500` | `rerank` | 0.467 | 261 | 385.1 |
| 16 | `structure_500` | `semantic` | 0.133 | 307 | 327.7 |

### Chiến lược từng thành viên

**Nguyễn Việt Linh - Recursive chunking + BM25**

- Chia tài liệu theo đoạn/dòng/câu trước, chỉ cắt cứng khi cần.
- Dùng BM25 vì bộ câu hỏi benchmark là truy vấn ngắn, nhiều từ khóa rõ.
- Kết quả tốt nhất trong đánh giá: `Precision@3 = 0.667`.

**Lê Trần Khương Duy - Fixed chunking + BM25**

- Dùng `FixedSizeChunker(chunk_size=300, overlap=50)` để tạo baseline đơn giản, ổn định và dễ tái lập.
- Kết hợp BM25 để tận dụng các từ khóa hành chính xuất hiện trực tiếp trong câu hỏi như "học phí", "học bổng", "cấp giấy tờ".
- Kết quả: `fixed_300 + bm25` đạt `Precision@3 = 0.467`, đứng thứ 2 toàn bộ benchmark. Điểm mạnh là bắt từ khóa tốt; điểm yếu là có thể cắt ngang câu hoặc tách một quy trình thành nhiều chunk rời.

**Nguyễn Việt Hùng - Sentence chunking + Hybrid**

- Dùng `SentenceChunker(max_sentences_per_chunk=3)` để giữ câu nguyên vẹn, giúp chunk dễ đọc và phù hợp khi agent cần tạo câu trả lời.
- Kết hợp hybrid search để lấy điểm mạnh của cả BM25 và semantic search.
- Kết quả: `sentence_3 + hybrid` đạt `Precision@3 = 0.467`, đứng thứ 3. Chiến lược này tốt cho phần trình bày câu trả lời, nhưng tạo 436 chunk nên tốn lưu trữ và dễ có nhiều chunk gần giống nhau.

**Đỗ Tùng Dương - Structure chunking + BM25/metadata**

- Dùng `DocumentStructureChunker(chunk_size=500)` để tách theo heading Markdown, phù hợp với tài liệu dạng sổ tay sinh viên và quy định học vụ.
- Ưu tiên dùng BM25 và metadata filter vì heading thường chứa tên thủ tục/phòng ban/đối tượng áp dụng.
- Kết quả tốt nhất của hướng này là `structure_500 + bm25` đạt `Precision@3 = 0.467`. `structure_500 + semantic` chỉ đạt `0.133` do mock embedding không phản ánh tốt ngữ nghĩa tiếng Việt, nên chiến lược này cần thử lại với local multilingual embedding.

### Kết luận chiến lược

Trong điều kiện hiện tại, `recursive_500 + bm25` là lựa chọn tốt nhất. Recursive chunking giữ được ngữ cảnh theo đoạn/mục, còn BM25 phù hợp với câu hỏi hành chính ngắn như "học phí", "học bổng", "cấp giấy tờ". Semantic search chưa đáng tin để kết luận vì đang dùng mock embedding.

---

## 3. Câu Hỏi Đánh Giá Và Chất Lượng Truy Xuất

### Bộ 5 câu hỏi benchmark

| # | Query | Gold answer | Chunk/tài liệu kỳ vọng |
|---:|---|---|---|
| 1 | `hoc bong sinh vien` | Thông tin về học bổng khuyến khích học tập, học bổng tài trợ và học bổng trao đổi sinh viên. | `01-hoc-bong.md` |
| 2 | `dang ky mon hoc` | Sinh viên đăng ký học phần trên hệ thống/cổng học vụ theo thời gian quy định. | `course-registration.md` |
| 3 | `hoc phi` | Thông tin mức học phí, miễn giảm học phí và kênh hỏi đáp học phí. | `20-muc-hoc-phi...md`, `07-ban-dao-tao...md` |
| 4 | `thu vien muon sach` | Thông tin dịch vụ thư viện, mượn sách/tài liệu và hướng dẫn sử dụng thư viện. | `library-services.md`, `04-huong-dan-su-dung-thu-vien...md` |
| 5 | `cap giay to cho sinh vien` | Sinh viên đăng ký cấp giấy xác nhận/giấy giới thiệu/giấy vay vốn qua hệ thống CTSV hoặc iCTSV. | `03-cap-giay-to...md`, `07-ban-dao-tao...md` |

### Kết quả theo cấu hình tốt nhất

| # | Query | Best strategy | Precision trong report | Nhận xét |
|---:|---|---|---:|---|
| 1 | `hoc bong sinh vien` | `recursive_500 + bm25` | 1.000 | Truy xuất đúng tài liệu học bổng. |
| 2 | `dang ky mon hoc` | `recursive_500 + bm25` | 0.000 | Top-1 là `course-registration.md`; đánh giá thủ công là phù hợp, metric tự động cần gold terms tốt hơn. |
| 3 | `hoc phi` | `recursive_500 + bm25` | 0.667 | Có chunk liên quan nhưng đôi lúc bị nhiễu bởi file index/quy định chung. |
| 4 | `thu vien muon sach` | `recursive_500 + bm25` | 0.667 | Có `library-services.md` trong top-3, top-1 đôi khi chưa phải tài liệu thư viện. |
| 5 | `cap giay to cho sinh vien` | `recursive_500 + bm25` | 1.000 | Truy xuất tốt nhờ từ khóa đặc thù. |

**Precision@3 trung bình tốt nhất:** 0.667

### Metadata filter

Metadata filter hữu ích nhất cho các câu hỏi có đối tượng rõ, ví dụ câu `dang ky mon hoc` nên lọc `audience=student` và `department=academic-affairs`. Với corpus nhiều tài liệu hành chính, filter giúp giảm nhiễu từ tài liệu dành cho đơn vị khác hoặc nội dung không cùng phòng ban.

---

## 4. Demo Và Bài Học Nhóm

### Điểm sẽ trình bày

- Recursive chunking cân bằng tốt giữa số chunk và độ liền mạch ngữ cảnh.
- BM25 là baseline mạnh cho văn bản hành chính tiếng Việt vì câu hỏi thường chứa từ khóa gần với tài liệu gốc.
- Mock embedding không đủ để đánh giá semantic retrieval; cần local multilingual embedding hoặc API embedding thật để so sánh công bằng.

### Bài học rút ra

Cùng một corpus nhưng cách chia chunk và cách retrieval tạo khác biệt rõ. Chunk quá nhỏ giúp match từ khóa nhưng dễ mất ngữ cảnh; chunk theo heading dễ đọc nhưng cần embedding tốt hoặc query rõ để phát huy. Với tài liệu quy định, cần kết hợp metadata, keyword search và kiểm tra thủ công thay vì chỉ nhìn một metric.

### Nếu làm lại

Nhóm sẽ chuẩn hóa gold answer và gold source tốt hơn để metric tự động không đánh sai các chunk hợp lý. Ngoài ra, nhóm sẽ chạy lại benchmark với `EMBEDDING_PROVIDER=local` hoặc embedding API thật, rồi so sánh lại semantic/hybrid/rerank.

---

## Tự Đánh Giá Nhóm

| Tiêu chí | Điểm tự đánh giá |
|---|---:|
| Lựa chọn tài liệu | 9 / 10 |
| Thiết kế chiến lược | 15 / 15 |
| Chất lượng truy xuất | 9 / 10 |
| Thuyết trình/demo | 5 / 5 |
| **Tổng phần nhóm** | **38 / 40** |

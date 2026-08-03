# Báo Cáo Cá Nhân — Lab 7: Embedding & Vector Store

**Họ tên:** Nguyễn Việt Hùng
**Nhóm:** B8
**Ngày:** 03/08/2026

> **Nộp 1 bản / sinh viên.** Phần nhóm (lựa chọn tài liệu, thiết kế chiến lược, bộ câu hỏi đánh giá, demo) nộp chung 1 bản trong `REPORT_NHOM.md`. Chi tiết thang điểm: `docs/SCORING.md`.

**Tổng điểm phần cá nhân: 60** = Khởi động (5) + Hướng tiếp cận (10) + Hoàn thiện code (30) + Dự đoán độ tương tự (5) + Kết quả truy xuất của tôi (10).

---

## 1. Khởi động (Warm-up) — Cá nhân (5 điểm)

### Độ tương tự Cosine (Cosine Similarity) (Bài tập 1.1)

**Độ tương tự cosine cao (High cosine similarity) nghĩa là gì?**
> *Viết 1-2 câu:*
> Hai đoạn văn bản có độ tương tự cosine cao nghĩa là vector biểu diễn (embedding) của chúng có góc hợp bởi giữa chúng rất nhỏ (chỉ về cùng một hướng) trong không gian vector. Về mặt ngữ nghĩa, điều này cho thấy hai đoạn văn bản có nội dung, ý nghĩa hoặc chủ đề rất giống nhau hoặc liên quan chặt chẽ đến nhau.

**Ví dụ có độ tương tự CAO:**
- Câu A: "Con mèo đang ngủ ngon lành trên tấm thảm."
- Câu B: "Một chú mèo con đang nằm nghỉ trên chiếc thảm trải sàn."
- Tại sao tương đồng: Cả hai câu đều mô tả cùng một hành động và sự việc (con mèo đang nằm/ngủ trên thảm) dù sử dụng các từ vựng khác nhau.

**Ví dụ có độ tương tự THẤP:**
- Câu A: "Lãi suất tiền gửi ngân hàng đã tăng mạnh trong quý này."
- Câu B: "Món phở gà ở cửa hàng này có nước dùng rất ngọt và thanh."
- Tại sao khác: Hai câu đề cập đến hai lĩnh vực và chủ đề hoàn toàn không liên quan đến nhau (tài chính kinh tế và ẩm thực).

**Tại sao độ tương tự cosine (cosine similarity) được ưu tiên hơn khoảng cách Euclid (Euclidean distance) cho text embeddings?**
> *Viết 1-2 câu:*
> Khoảng cách Euclid đo khoảng cách tuyệt đối giữa hai điểm và bị ảnh hưởng nhiều bởi độ dài (độ lớn) của vector (ví dụ: độ dài văn bản). Trong khi đó, độ tương tự cosine chỉ đo góc giữa hai vector nên không bị ảnh hưởng bởi độ lớn vector, giúp đánh giá chính xác sự tương đồng về mặt ngữ nghĩa bất kể độ dài văn bản khác nhau.

### Bài toán tính toán Chunking (Bài tập 1.2)

**Tài liệu 10,000 ký tự, chunk_size=500, overlap=50. Bao nhiêu chunks?**
> *Trình bày phép tính:* `số lượng chunk = làm_tròn_lên((10000 - 50) / (500 - 50)) = làm_tròn_lên(9950 / 450) = làm_tròn_lên(22.111...)`
> *Đáp án:* 23 chunks.

**Nếu độ chồng chéo (overlap) tăng lên 100, số lượng chunk thay đổi thế nào? Tại sao muốn độ chồng chéo nhiều hơn?**
> *Viết 1-2 câu:*
> Nếu overlap tăng lên 100, số lượng chunk sẽ tăng lên (25 chunks). Việc tăng độ chồng chéo giúp duy trì nhiều đoạn ngữ cảnh chung giữa các chunk liền kề, tránh việc một câu hoặc một ý quan trọng bị cắt ngang ở ranh giới của 2 chunk, từ đó đảm bảo tính toàn vẹn của thông tin.

---

## 2. Hướng tiếp cận của tôi (My Approach) — Cá nhân (10 điểm)

Giải thích cách tiếp cận của bạn khi lập trình (implement) các phần chính trong gói `src`.

### Các hàm chia nhỏ (Chunking Functions)

**`SentenceChunker.chunk`** — hướng tiếp cận:
> *Viết 2-3 câu: dùng biểu thức chính quy (regex) gì để phát hiện câu? Xử lý trường hợp ngoại lệ (edge case) nào?*
> Sử dụng regex `(\.\s+|\!\s+|\?\s+|\.\n)` để tách câu dựa trên các dấu câu kết thúc tiêu chuẩn, đồng thời giữ lại dấu câu thuộc về câu đó. Trường hợp ngoại lệ như chuỗi rỗng được xử lý bằng cách trả về danh sách rỗng, các khoảng trắng thừa ở hai đầu được loại bỏ bằng hàm `strip()`. Cuối cùng, các câu được gom nhóm lại thành từng chunk với số lượng câu tối đa `max_sentences_per_chunk`.

**`RecursiveChunker.chunk` / `_split`** — hướng tiếp cận:
> *Viết 2-3 câu: thuật toán hoạt động thế nào? Base case (trường hợp cơ sở) là gì?*
> Thuật toán đệ quy sẽ thử tách văn bản bằng dấu phân cách hiện tại (như ngắt đoạn, ngắt dòng, khoảng trắng), sau đó gom các phần tử lại sao cho không vượt quá `chunk_size`. Nếu một phần tử sau khi tách vẫn quá lớn, hàm sẽ gọi đệ quy `_split` với dấu phân cách tiếp theo. Base case là khi kích thước đoạn đã thỏa mãn `chunk_size` hoặc khi đã cạn kiệt danh sách dấu phân cách (lúc này buộc phải cắt cứng theo đúng số lượng ký tự).

### Lớp EmbeddingStore

**`add_documents` + `search`** — hướng tiếp cận:
> *Viết 2-3 câu: lưu trữ thế nào? Tính độ tương tự ra sao?*
> Phương thức `add_documents` hỗ trợ lưu trữ linh hoạt: với ChromaDB thì gọi API `add()` của Chroma, nếu lưu trong bộ nhớ (in-memory) thì append từng dictionary chứa cả nội dung và embedding vào list `_store`. Hàm `search` sẽ nhúng truy vấn, sau đó tính tích vô hướng (dot product) đối với dữ liệu in-memory hoặc dùng thẳng tính năng search có sẵn của ChromaDB để lấy ra `top_k` chunk tương tự nhất.

**`search_with_filter` + `delete_document`** — hướng tiếp cận:
> *Viết 2-3 câu: lọc (filter) trước hay sau? Xóa bằng cách nào?*
> Thuật toán ưu tiên lọc theo `metadata_filter` trước để thu hẹp không gian tìm kiếm, sau đó mới tiến hành tính toán độ tương tự nhằm tối ưu hiệu năng. Hàm `delete_document` thực hiện việc quét và loại bỏ các record (bằng list comprehension in-memory hoặc API `delete` của Chroma) dựa vào `doc_id` để đảm bảo dọn sạch toàn bộ các chunk của một document cụ thể.

### Tác tử KnowledgeBaseAgent

**`answer`** — hướng tiếp cận:
> *Viết 2-3 câu: cấu trúc prompt? Cách đưa ngữ cảnh (inject context) vào thế nào?*
> Hàm `answer` thực hiện truy xuất (`search`) từ store để lấy các chunk phù hợp nhất (top_k). Nội dung của những chunk này được join (nối) lại với nhau để làm ngữ cảnh và đưa trực tiếp vào prompt theo khuôn mẫu (template) cứng. Thông qua prompt chứa đầy đủ ngữ cảnh này, LLM sẽ sinh câu trả lời căn cứ vào kiến thức đã cung cấp để tránh "ảo giác" (hallucination).

---

## 3. Hoàn thiện code (Core Implementation) — Cá nhân (30 điểm)

Vượt qua bộ kiểm thử là điều kiện tính điểm phần này.

### Kết Quả Kiểm Thử (Test Results)

```
============================= test session starts =============================
platform win32 -- Python 3.13.3, pytest-9.1.1, pluggy-1.6.0
rootdir: D:\AITHUCCHIENK3\Lab7\Day07_2A202601211_NguyenVietLinh
plugins: anyio-4.14.2, langsmith-0.10.15, asyncio-1.4.0
asyncio: mode=Mode.STRICT, debug=False, asyncio_default_fixture_loop_scope=None, asyncio_default_test_loop_scope=function
collected 70 items

tests\test_backend_service.py ...........                                [ 15%]
tests\test_backend_system.py .....                                       [ 22%]
tests\test_chromadb_store.py .                                           [ 24%]
tests\test_eval_runner.py ..                                             [ 27%]
tests\test_extended_retrieval.py ....                                    [ 32%]
tests\test_request_embedder.py .....                                     [ 40%]
tests\test_solution.py ..........................................        [100%]

============================= 70 passed in 4.91s ==============================
```

**Số lượng bài test vượt qua (pass):** 70 / 70

---

## 4. Dự đoán độ tương tự (Similarity Predictions) — Cá nhân (5 điểm)

| Cặp | Câu A | Câu B | Dự đoán | Điểm thực tế | Đúng? |
|------|-----------|-----------|---------|--------------|-------|
| 1 | "Sinh viên đăng ký học phần trên cổng thông tin." | "Quy trình đăng ký môn học cho sinh viên chính quy." | Cao | 0.063 (mock) | Sai — mock embedding không phản ánh ngữ nghĩa tiếng Việt |
| 2 | "Học bổng khuyến khích học tập dành cho sinh viên xuất sắc." | "Mức học phí chương trình đào tạo chính quy." | Thấp | 0.219 (mock) | Sai — mock embedding lại cho điểm 2 câu này cao nhất trong 5 câu |
| 3 | "Thư viện mở cửa từ 7h đến 21h hàng ngày." | "Dịch vụ mượn sách và tài liệu tại thư viện." | Cao | 0.061 (mock) | Sai — mock embedding cho điểm gần nhau dù có liên quan |
| 4 | "Quy định ký túc xá sinh viên trường đại học." | "Món phở gà ngon nhất Hà Nội ở đâu?" | Thấp | -0.123 (mock) | Đúng — điểm âm do hai câu hoàn toàn không liên quan |
| 5 | "Điều kiện xét tốt nghiệp đại học hệ chính quy." | "Sinh viên cần tích lũy đủ tín chỉ để ra trường." | Cao | 0.060 (mock) | Sai — mock embedding cho điểm thấp dù hai câu rất liên quan |

**Kết quả nào bất ngờ nhất? Điều này nói gì về cách embeddings biểu diễn ý nghĩa?**
> Cặp số 2 (có điểm tương đồng cao nhất là 0.219 dù khác nghĩa) và cặp số 4 (ra điểm âm -0.123) là bất ngờ nhất. Điều này cho thấy `MockEmbedder` (dựa trên thuật toán mã hóa MD5 băm chuỗi thành vector) thực chất tạo ra vector ngẫu nhiên dựa vào độ dài và ký tự, hoàn toàn không nắm bắt được ngữ nghĩa. Để đánh giá thực tế và hệ thống RAG hoạt động đúng, bắt buộc phải dùng embedding model thật (ví dụ: mô hình sentence-transformers đa ngữ hoặc API của nhà cung cấp).

---

## 5. Kết quả truy xuất của tôi (Competition Results) — Cá nhân (10 điểm)

Chạy **5 câu hỏi đánh giá của nhóm** trên mã nguồn cá nhân của bạn trong gói `src`. **5 câu hỏi này phải trùng với các thành viên cùng nhóm** (xem `REPORT_NHOM.md`).

Chiến lược sử dụng: `recursive_500 + bm25` (cấu hình đạt kết quả tốt nhất trong eval).

| # | Câu hỏi (Query) | Top-1 Chunk truy xuất được (tóm tắt) | Điểm Score | Có liên quan không? (Relevant) | Câu trả lời của Agent (tóm tắt) |
|---|-------|--------------------------------|-------|-----------|------------------------|
| 1 | hoc bong sinh vien | `01-hoc-bong.md` — Chi tiết các chương trình học bổng tài trợ, học bổng khuyến khích, học bổng trao đổi quốc tế | 10.944 | Có ✅ | Sinh viên có thể nhận học bổng KKHT, học bổng tài trợ và học bổng trao đổi quốc tế, chi tiết xem tại cổng sv-ctt. |
| 2 | dang ky mon hoc | `course-registration.md` — Hướng dẫn đăng ký học phần trên hệ thống cổng học vụ | 16.081 | Có ✅ | Sinh viên đăng ký học phần trên hệ thống theo thời gian quy định của phòng đào tạo. |
| 3 | hoc phi | `06-cac-quy-dinh-va-bieu-mau.md` — Biểu mẫu và quy định liên quan đào tạo, bao gồm câu hỏi về học phí | 9.445 | Có (một phần) ⚠️ | Thông tin về mức học phí và kênh hỏi đáp liên quan, nhưng top-1 không phải file chuyên về học phí. |
| 4 | thu vien muon sach | `00-INDEX.md` — Mục lục sổ tay sinh viên, có link tới hướng dẫn thư viện | 7.214 | Có (một phần) ⚠️ | Có đề cập đến dịch vụ thư viện nhưng top-1 là file index; `library-services.md` ở vị trí top-2 (score 6.313). |
| 5 | cap giay to cho sinh vien | `00-INDEX.md` — Mục Cấp giấy tờ cho sinh viên (giấy giới thiệu, chứng nhận, vay vốn) | 21.941 | Có ✅ | Sinh viên đăng ký cấp giấy xác nhận/giấy giới thiệu qua hệ thống CTSV tại ctsv.hust.edu.vn. |

**Bao nhiêu câu hỏi trả về chunk có liên quan trong top-3?** 5 / 5

**Điều hay nhất tôi học được từ thành viên khác / nhóm khác (qua demo):**
> Tôi nhận ra rằng BM25 là baseline cực kỳ mạnh cho tài liệu hành chính tiếng Việt vì câu hỏi thường chứa từ khóa gần đúng với tài liệu gốc. Ngoài ra, việc thiết kế metadata schema hợp lý (audience, department) giúp lọc trước khi search, tránh nhiễu từ tài liệu không liên quan. Cần dùng embedding model thật thay vì mock để đánh giá công bằng semantic retrieval.

---

## Tự Đánh Giá (Phần Cá Nhân)

| Tiêu chí | Điểm tự đánh giá |
|----------|-------------------|
| Khởi động (Warm-up) | 5 / 5 |
| Hướng tiếp cận của tôi (My Approach) | 9 / 10 |
| Hoàn thiện code (Core Implementation — tests) | 30 / 30 |
| Dự đoán độ tương tự (Similarity Predictions) | 4 / 5 |
| Kết quả truy xuất của tôi (Competition Results) | 8 / 10 |
| **Tổng phần cá nhân** | **56 / 60** |

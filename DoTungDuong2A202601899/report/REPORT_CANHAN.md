# Báo Cáo Cá Nhân — Lab 7: Embedding & Vector Store

**Họ tên:** Đỗ Tùng Dương
**Nhóm:** B08
**Ngày:** 2026-08-03

> **Nộp 1 bản / sinh viên.** Phần nhóm (lựa chọn tài liệu, thiết kế chiến lược, bộ câu hỏi đánh giá, demo) nộp chung 1 bản trong `REPORT_NHOM.md`. Chi tiết thang điểm: `docs/SCORING.md`.

**Tổng điểm phần cá nhân: 60** = Khởi động (5) + Hướng tiếp cận (10) + Hoàn thiện code (30) + Dự đoán độ tương tự (5) + Kết quả truy xuất của tôi (10).

---

## 1. Khởi động (Warm-up) — Cá nhân (5 điểm)

### Độ tương tự Cosine (Cosine Similarity) (Bài tập 1.1)

**Độ tương tự cosine cao (High cosine similarity) nghĩa là gì?**

> Độ tương tự cosine cao nghĩa là hai vector embedding "chỉ theo cùng một hướng" trong không gian nhiều chiều  hai đoạn văn bản mang ý nghĩa/ngữ nghĩa gần nhau, dù cách diễn đạt (từ ngữ, độ dài câu) có thể khác nhau.

**Ví dụ có độ tương tự CAO:**

- Câu A: "Sinh viên đăng ký học phần trong cổng học vụ theo lịch học kỳ."
- Câu B: "Việc đăng ký môn học được thực hiện trên hệ thống theo thời khóa biểu."
- Tại sao tương đồng: cùng nói về hành động đăng ký môn/học phần qua một hệ thống theo lịch trình cố định — cùng chủ đề, cùng ý định.

**Ví dụ có độ tương tự THẤP:**

- Câu A: "Con mèo đang ngủ trên ghế sofa."
- Câu B: "Học bổng khuyến khích học tập dành cho sinh viên có thành tích tốt."
- Tại sao khác: không chia sẻ chủ đề, thực thể hay ý định nào — một câu về vật nuôi, một câu về chính sách học vụ.

**Tại sao độ tương tự cosine (cosine similarity) được ưu tiên hơn khoảng cách Euclid (Euclidean distance) cho text embeddings?**

> Cosine chỉ quan tâm đến *hướng* của vector (nội dung/ngữ nghĩa) chứ không quan tâm đến *độ lớn* (magnitude, thường bị ảnh hưởng bởi độ dài văn bản). Hai đoạn văn cùng ý nghĩa nhưng độ dài khác nhau có thể cho vector embedding với magnitude khác nhau; Euclidean distance sẽ phạt sự khác biệt độ lớn đó, còn cosine thì không, nên phản ánh đúng độ tương đồng ngữ nghĩa hơn.

### Bài toán tính toán Chunking (Bài tập 1.2)

**Tài liệu 10,000 ký tự, chunk_size=500, overlap=50. Bao nhiêu chunks?**

> Trình bày phép tính:
> `số lượng chunk = ceil((10000 - 50) / (500 - 50)) = ceil(9950 / 450) = ceil(22.11) = 23`
>
> Đã kiểm chứng lại bằng code thật (`FixedSizeChunker(chunk_size=500, overlap=50).chunk("a"*10000)`) → **23 chunks**, khớp công thức.

**Nếu độ chồng chéo (overlap) tăng lên 100, số lượng chunk sẽ thay đổi thế nào? Tại sao bạn lại muốn tăng độ chồng chéo?**

> `ceil((10000 - 100) / (500 - 100)) = ceil(9900 / 400) = ceil(24.75) = 25 chunks` (kiểm chứng bằng code cho kết quả **25**, tăng thêm 2 chunk so với overlap=50).
>
> Overlap càng lớn thì bước trượt (`chunk_size - overlap`) càng nhỏ, nên số chunk tăng. Tăng overlap giúp giữ ngữ cảnh liên tục qua ranh giới chunk — tránh trường hợp một câu/ý quan trọng bị cắt đúng vào điểm nối giữa hai chunk, làm mất thông tin khi retrieval chỉ lấy đúng 1 chunk. Đánh đổi là tốn thêm bộ nhớ/chi phí embedding vì nhiều chunk trùng lặp nội dung hơn.

---

## 2. Hướng tiếp cận của tôi (My Approach) — Cá nhân (10 điểm)

### Các hàm chia nhỏ (Chunking Functions)

**`SentenceChunker.chunk`** — hướng tiếp cận:

> Dùng regex `r"(?<=[.!?])\s+|(?<=\.)\n"` để tách câu tại vị trí sau dấu `.`, `!`, `?` theo sau bởi khoảng trắng, hoặc sau dấu `.` theo sau bởi xuống dòng — đúng theo mô tả ranh giới câu trong docstring (". ", "! ", "? ", ".\n"). Sau khi tách, strip từng câu và bỏ câu rỗng, rồi gom nhóm `max_sentences_per_chunk` câu liên tiếp thành một chunk, nối bằng khoảng trắng. Edge case: văn bản rỗng trả về `[]` ngay từ đầu; nếu số câu không chia hết cho nhóm, nhóm cuối chỉ chứa phần còn lại (ít câu hơn).

**`RecursiveChunker.chunk` / `_split`** — hướng tiếp cận:

> Thuật toán đệ quy theo thứ tự ưu tiên separator (`["\n\n", "\n", ". ", " ", ""]`). Base case: nếu đoạn văn bản hiện tại đã `<= chunk_size` thì trả về chính nó làm 1 chunk (hoặc `[]` nếu hết separator lẫn text rỗng). Nếu còn quá dài, tách theo separator đầu tiên trong danh sách còn lại, rồi gộp dần các phần đã tách lại với nhau (nối lại bằng chính separator đó) cho tới khi gần chạm `chunk_size` — thay vì tạo 1 chunk cho mỗi phần tách nhỏ lẻ. Nếu một phần tách vẫn còn dài hơn `chunk_size`, gọi đệ quy `_split` cho phần đó với separator tiếp theo trong danh sách. Nếu hết separator (`remaining_separators` rỗng), cắt cứng theo `chunk_size`. Cách gộp lại này giúp chunk gần với kích thước mục tiêu hơn là vụn thành từng từ/câu riêng lẻ.

### Lớp EmbeddingStore

**`add_documents` + `search`** — hướng tiếp cận:

> Mỗi `Document` được chuẩn hoá qua `_make_record` thành 1 dict `{id, content, metadata, embedding}`, trong đó `metadata` được bổ sung thêm khoá `doc_id` (để phục vụ xoá/lọc sau này) — record này được append vào danh sách `self._store` (dùng song song cả khi `_use_chroma=True`, để `search`/`delete`/`get_collection_size` luôn nhất quán trong môi trường lab không có chromadb thật). `search` nhúng câu truy vấn qua `embedding_fn`, rồi dùng `_dot` (tích vô hướng) so với embedding của từng record — vì các embedder trong lab (mock/local/OpenAI) đều trả về vector đã chuẩn hoá (norm = 1), nên dot product tương đương cosine similarity nhưng rẻ hơn. Kết quả được sắp xếp giảm dần theo `score` và cắt lấy `top_k`.

**`search_with_filter` + `delete_document`** — hướng tiếp cận:

> `search_with_filter` lọc **trước** khi tìm kiếm: duyệt `self._store`, giữ lại record nào có `metadata[key] == value` cho **tất cả** cặp key/value trong `metadata_filter`, rồi mới chạy hàm search dùng chung `_search_records` trên tập đã lọc — tránh phải tính similarity cho toàn bộ store khi không cần. `delete_document` xoá bằng cách giữ lại (list comprehension) mọi record có `metadata["doc_id"] != doc_id`, so sánh độ dài trước/sau để biết có xoá được gì không (trả về `True`/`False`).

### Chiến lược chunking được nhóm phân công (Giai đoạn 2)

**`DocumentStructureChunker`** (`report/document_structure_chunker.py`, tương ứng `structure_500` trong `report/retrieval_eval_report.md` của nhóm) — hướng tiếp cận: cắt theo heading Markdown cấp mục (`##` trở xuống, bỏ qua H1 vì đó chỉ là tiêu đề tài liệu); nếu tài liệu không có heading cấp mục thì coi mỗi đoạn văn cách nhau bởi dòng trống là một "mục", gộp các đoạn nhỏ và chỉ cắt cứng theo câu khi một mục vượt `max_chars=600`. Đây là script hỗ trợ nằm trong `report/`, không đụng tới code đã hoàn thiện trong `src/`.

### Tác tử KnowledgeBaseAgent

**`answer`** — hướng tiếp cận:

> Gọi `store.search(question, top_k=top_k)` để lấy các chunk liên quan nhất, nối nội dung từng chunk thành danh sách gạch đầu dòng làm `context`. Prompt được dựng theo cấu trúc: hướng dẫn ("chỉ trả lời dựa trên context, nếu không có thì nói không biết") → khối `Context:` chứa các chunk → `Question:` → `Answer:`. Cách đưa ngữ cảnh vào prompt bằng cách chèn trực tiếp text của chunk (không phải id/score) để LLM chỉ thấy nội dung cần dùng để trả lời, giữ đúng nguyên tắc RAG (grounding vào retrieved context).

---

## 3. Hoàn thiện code (Core Implementation) — Cá nhân (30 điểm)

Vượt qua bộ kiểm thử là điều kiện tính điểm phần này.

### Kết Quả Kiểm Thử (Test Results)

```
(ai26) PS E:\AI26\lab\day07\Day07_2A202601899_DoTungDuong> pytest tests/ -v
==================================================================================== test session starts =====================================================================================
platform win32 -- Python 3.11.15, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\ASUS\miniconda3\envs\ai26\python.exe
cachedir: .pytest_cache
rootdir: E:\AI26\lab\day07\Day07_2A202601899_DoTungDuong
plugins: anyio-4.14.2
collected 42 items                                                                                                                                                                      

tests/test_solution.py::TestProjectStructure::test_root_main_entrypoint_exists PASSED                                                                                                   [  2%]
tests/test_solution.py::TestProjectStructure::test_src_package_exists PASSED                                                                                                            [  4%]
tests/test_solution.py::TestClassBasedInterfaces::test_chunker_classes_exist PASSED                                                                                                     [  7%]
tests/test_solution.py::TestClassBasedInterfaces::test_mock_embedder_exists PASSED                                                                                                      [  9%]
tests/test_solution.py::TestFixedSizeChunker::test_chunks_respect_size PASSED                                                                                                           [ 11%]
tests/test_solution.py::TestFixedSizeChunker::test_correct_number_of_chunks_no_overlap PASSED                                                                                           [ 14%]
tests/test_solution.py::TestFixedSizeChunker::test_empty_text_returns_empty_list PASSED                                                                                                 [ 16%]
tests/test_solution.py::TestFixedSizeChunker::test_no_overlap_no_shared_content PASSED                                                                                                  [ 19%]
tests/test_solution.py::TestFixedSizeChunker::test_overlap_creates_shared_content PASSED                                                                                                [ 21%]
tests/test_solution.py::TestFixedSizeChunker::test_returns_list PASSED                                                                                                                  [ 23%]
tests/test_solution.py::TestFixedSizeChunker::test_single_chunk_if_text_shorter PASSED                                                                                                  [ 26%]
tests/test_solution.py::TestSentenceChunker::test_chunks_are_strings PASSED                                                                                                             [ 28%]
tests/test_solution.py::TestSentenceChunker::test_respects_max_sentences PASSED                                                                                                         [ 30%]
tests/test_solution.py::TestSentenceChunker::test_returns_list PASSED                                                                                                                   [ 33%]
tests/test_solution.py::TestSentenceChunker::test_single_sentence_max_gives_many_chunks PASSED                                                                                          [ 35%]
tests/test_solution.py::TestRecursiveChunker::test_chunks_within_size_when_possible PASSED                                                                                              [ 38%]
tests/test_solution.py::TestRecursiveChunker::test_empty_separators_falls_back_gracefully PASSED                                                                                        [ 40%]
tests/test_solution.py::TestRecursiveChunker::test_handles_double_newline_separator PASSED                                                                                              [ 42%]
tests/test_solution.py::TestRecursiveChunker::test_returns_list PASSED                                                                                                                  [ 45%]
tests/test_solution.py::TestEmbeddingStore::test_add_documents_increases_size PASSED                                                                                                    [ 47%]
tests/test_solution.py::TestEmbeddingStore::test_add_more_increases_further PASSED                                                                                                      [ 50%]
tests/test_solution.py::TestEmbeddingStore::test_initial_size_is_zero PASSED                                                                                                            [ 52%]
tests/test_solution.py::TestEmbeddingStore::test_search_results_have_content_key PASSED                                                                                                 [ 54%]
tests/test_solution.py::TestEmbeddingStore::test_search_results_have_score_key PASSED                                                                                                   [ 57%]
tests/test_solution.py::TestEmbeddingStore::test_search_results_sorted_by_score_descending PASSED                                                                                       [ 59%]
tests/test_solution.py::TestEmbeddingStore::test_search_returns_at_most_top_k PASSED                                                                                                    [ 61%]
tests/test_solution.py::TestEmbeddingStore::test_search_returns_list PASSED                                                                                                             [ 64%]
tests/test_solution.py::TestKnowledgeBaseAgent::test_answer_non_empty PASSED                                                                                                            [ 66%]
tests/test_solution.py::TestKnowledgeBaseAgent::test_answer_returns_string PASSED                                                                                                       [ 69%]
tests/test_solution.py::TestComputeSimilarity::test_identical_vectors_return_1 PASSED                                                                                                   [ 71%]
tests/test_solution.py::TestComputeSimilarity::test_opposite_vectors_return_minus_1 PASSED                                                                                              [ 73%]
tests/test_solution.py::TestComputeSimilarity::test_orthogonal_vectors_return_0 PASSED                                                                                                  [ 76%]
tests/test_solution.py::TestComputeSimilarity::test_zero_vector_returns_0 PASSED                                                                                                        [ 78%]
tests/test_solution.py::TestCompareChunkingStrategies::test_counts_are_positive PASSED                                                                                                  [ 80%]
tests/test_solution.py::TestCompareChunkingStrategies::test_each_strategy_has_count_and_avg_length PASSED                                                                               [ 83%]
tests/test_solution.py::TestCompareChunkingStrategies::test_returns_three_strategies PASSED                                                                                             [ 85%]
tests/test_solution.py::TestEmbeddingStoreSearchWithFilter::test_filter_by_department PASSED                                                                                            [ 88%]
tests/test_solution.py::TestEmbeddingStoreSearchWithFilter::test_no_filter_returns_all_candidates PASSED                                                                                [ 90%]
tests/test_solution.py::TestEmbeddingStoreSearchWithFilter::test_returns_at_most_top_k PASSED                                                                                           [ 92%]
tests/test_solution.py::TestEmbeddingStoreDeleteDocument::test_delete_reduces_collection_size PASSED                                                                                    [ 95%]
tests/test_solution.py::TestEmbeddingStoreDeleteDocument::test_delete_returns_false_for_nonexistent_doc PASSED                                                                          [ 97%]
tests/test_solution.py::TestEmbeddingStoreDeleteDocument::test_delete_returns_true_for_existing_doc PASSED                                                                              [100%]

===================================================================================== 42 passed in 0.13s =====================================================================================
(ai26) PS E:\AI26\lab\day07\Day07_2A202601899_DoTungDuong>
```

**Số lượng bài test vượt qua (pass):** 42 / 42

---

## 4. Dự đoán độ tương tự (Similarity Predictions) — Cá nhân (5 điểm)

> Chạy `compute_similarity()` với embedding thật (`OpenAIEmbedder`, model `text-embedding-3-small`) trên 5 cặp câu, để dự đoán/kết quả phản ánh đúng chất lượng ngữ nghĩa (mock chỉ cho điểm gần-ngẫu-nhiên nên không dùng ở đây).

| Cặp | Câu A                                                                         | Câu B                                                                              | Dự đoán | Điểm thực tế | Đúng?                                     |
| ---- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------- | ---------------- | ------------------------------------------- |
| 1    | Thư viện mở cửa từ 7 giờ sáng đến 9 giờ tối các ngày trong tuần. | Thư viện hoạt động từ 7h sáng tới 9h tối, tất cả các ngày trong tuần. | cao        | 0.8231           | ✅                                          |
| 2    | Python is a high-level programming language.                                   | Python is a high level programming language.                                        | cao        | 0.9905           | ✅                                          |
| 3    | Học phí phải đóng trước khi bắt đầu học kỳ mới.                   | Sinh viên cần thanh toán học phí đúng hạn quy định.                       | cao        | 0.5551           | Đúng hướng nhưng thấp hơn dự đoán |
| 4    | Thư viện cho sinh viên mượn sách và tài liệu học tập.               | Ký túc xá có quy định về giờ giới nghiêm cho sinh viên nội trú.        | thấp      | 0.4060           | ✅                                          |
| 5    | Con mèo đang ngủ trên ghế sofa.                                           | Học bổng khuyến khích học tập dành cho sinh viên có thành tích tốt.     | thấp      | 0.1948           | ✅                                          |

**Kết quả nào bất ngờ nhất? Điều này nói gì về cách embeddings biểu diễn ý nghĩa?**

> Bất ngờ nhất là sự chênh lệch giữa cặp 2 và cặp 3. Cặp 2 chỉ khác nhau đúng 1 dấu gạch nối nhưng đạt 0.9905 - gần như là cùng một câu. Trong khi đó cặp 3 diễn đạt cùng ý nghĩa bằng cách viết hoàn toàn khác nhau, nhưng chỉ đạt 0.5551 - thấp hơn hẳn dù về mặt ngữ nghĩa con người vẫn coi là tương đương. Điều này cho thấy `text-embedding-3-small` nhạy với sự trùng lặp bề mặt từ vựng/cấu trúc câu hơn là thuần suy luận ngữ nghĩa trừu tượng: câu càng giống nhau về từ ngữ thì điểm càng cao, dù cùng ý nghĩa nhưng đổi hẳn cách diễn đạt thì điểm rơi về mức trung bình (~0.4–0.6) chứ không gần 1.0. Nhiều chunk đúng nội dung nhưng diễn đạt khác vẫn có thể chỉ đạt điểm ~0.5.

---

## 5. Kết quả truy xuất của tôi (Competition Results) — Cá nhân (10 điểm)

| # | Câu hỏi (Query)         | Top-1 Chunk truy xuất được (tóm tắt)                                      | Điểm Score | Có liên quan không? (Relevant)                                                                                                                                                                  | Câu trả lời của Agent (tóm tắt)                                               |
| - | ------------------------- | ------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1 | hoc bong sinh vien        | "...sinh viên có thể đặt mượn từ xa..." (04-huong-dan-su-dung-thu-vien) | 0.438        | Không ở top-1,**nhưng có** ở top-3 (rank 2: `01-hoc-bong::chunk_7`, score 0.437)                                                                                                      | Agent trả lời dựa vào chunk thư viện (sai chủ đề) vì top-1 không đúng  |
| 2 | dang ky mon hoc           | "Mục 36 — Công tác lưu học sinh" (07-ban-dao-tao)                         | 0.428        | Không đúng tài liệu kỳ vọng (`course-registration.md` không xuất hiện trong top-3); rank 2 là "Rút/hủy đăng ký học phần" — liên quan chủ đề nhưng khác nguồn kỳ vọng | Trả lời dựa vào thông tin liên hệ, không phải quy định đăng ký        |
| 3 | hoc phi                   | "Mục 3 — Thắc mắc về miễn giảm học phí" (07-ban-dao-tao)               | 0.385        | Liên quan chủ đề nhưng**tài liệu kỳ vọng `20-muc-hoc-phi...md` không xuất hiện trong top-3**                                                                                   | Trả lời chung chung về kênh hỏi đáp, không có số liệu học phí cụ thể |
| 4 | thu vien muon sach        | "Mục 29 — Trích sao bảng điểm" (07-ban-dao-tao)                           | 0.347        | **Không liên quan** — cả `library-services.md` lẫn `04-huong-dan-su-dung-thu-vien...md` đều vắng mặt trong top-3                                                                | Trả lời sai chủ đề (nhầm sang trích sao bảng điểm)                        |
| 5 | cap giay to cho sinh vien | "...sinh viên có thể đặt mượn từ xa..." (04-huong-dan-su-dung-thu-vien) | 0.383        | **Không liên quan** — tài liệu kỳ vọng `03-cap-giay-to...md` không xuất hiện trong top-3                                                                                         | Trả lời sai chủ đề (nhầm sang dịch vụ thư viện)                           |

**Bao nhiêu câu hỏi trả về chunk có liên quan trong top-3? 2 / 5** (câu 1 và câu 3 có chunk cùng chủ đề trong top-3, dù không phải top-1; câu 2 có chunk liên quan quy trình nhưng khác nguồn kỳ vọng nên tính là biên; câu 4, 5 trượt hoàn toàn)

**Phân tích lỗi (failure analysis):** Kết quả kém hơn hẳn so với Phần 4 (nơi các cặp câu đầy đủ, có dấu cho điểm 0.4–0.99). Nguyên nhân nhiều khả năng:

1. 5 câu hỏi benchmark của nhóm viết không dấu, dạng từ khóa ngắn ("hoc bong sinh vien", "dang ky mon hoc"...) — embedding OpenAI được huấn luyện chủ yếu trên văn bản có dấu chuẩn, nên câu hỏi không dấu bị lệch nghĩa nhiều hơn so với việc dùng BM25 (khớp từ khóa thuần túy).
2. Đúng như `REPORT_NHOM.md` Phần 2 đã ghi nhận: `recursive_500 + bm25` đạt Precision@3 = 0.667 — cao hơn hẳn kết quả `structure_500` tôi thử ở đây. Điều này cho thấy với câu hỏi hành chính ngắn/không dấu, retrieval theo từ khóa (BM25) đang thắng thế semantic/dense embedding, bất kể chiến lược chunking nào.
3. Tài liệu `07-ban-dao-tao...md` (danh bạ liên hệ theo "Mục N") có rất nhiều chunk ngắn, đồng dạng ("Mục X — chủ đề — email liên hệ") nên dễ được xếp hạng cao dù không phải nội dung quy định thật — một hạn chế của `DocumentStructureChunker` khi heading cấp mục trong tài liệu là mục lục liên hệ chứ không phải nội dung quy định.

**Điều hay nhất tôi học được từ thành viên khác / nhóm khác (qua demo):**

> Từ `REPORT_NHOM.md`, phát hiện đáng chú ý nhất là BM25 (retrieval theo từ khóa) vượt trội hơn semantic search trên toàn bộ 5 câu hỏi benchmark của nhóm (`recursive_500+bm25` đạt Precision@3=0.667, trong khi các cấu hình `+semantic` thấp hơn hẳn, ví dụ `structure_500+semantic` chỉ 0.133). Điều này khớp với kết quả thất bại tôi vừa đo ở trên: với câu hỏi hành chính ngắn, không dấu, retrieval dựa thuần vào embedding ngữ nghĩa không đáng tin bằng khớp từ khóa trực tiếp — bài học là nên kết hợp BM25/keyword filter thay vì chỉ dựa vào dense embedding cho loại câu hỏi này.

---

## Tự Đánh Giá (Phần Cá Nhân)

| Tiêu chí                                           | Điểm tự đánh giá                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Khởi động (Warm-up)                               | 5 / 5                                                                             |
| Hướng tiếp cận của tôi (My Approach)           | 10 / 10                                                                           |
| Hoàn thiện code (Core Implementation — tests)     | 30 / 30                                                                           |
| Dự đoán độ tương tự (Similarity Predictions) | 5 / 5                                                                             |
| Kết quả truy xuất của tôi (Competition Results) | 4 / 10 (2/5 câu có chunk liên quan trong top-3, xem phân tích lỗi ở trên) |
| **Tổng phần cá nhân**                      | **54 / 60**                                                                 |

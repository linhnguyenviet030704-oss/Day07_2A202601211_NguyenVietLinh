# Retrieval Evaluation Report

- Data directory: `data`
- Source files: 29
- Top-k: 3
- Embedding: mock fallback, so use BM25/hybrid trends for classroom comparison unless a real embedder is configured.

## Summary

| Rank | Chunker | Retriever | Precision@k | Avg score | Chunks | Avg chunk length |
|---:|---|---|---:|---:|---:|---:|
| 1 | recursive_500 | bm25 | 0.667 | 10.236 | 261 | 385.1 |
| 2 | fixed_300 | bm25 | 0.467 | 10.044 | 409 | 293.3 |
| 3 | sentence_3 | hybrid | 0.467 | 0.522 | 436 | 228.6 |
| 4 | recursive_500 | hybrid | 0.467 | 0.510 | 261 | 385.1 |
| 5 | recursive_500 | rerank | 0.467 | 0.573 | 261 | 385.1 |
| 6 | structure_500 | bm25 | 0.467 | 9.718 | 307 | 327.7 |
| 7 | sentence_3 | bm25 | 0.400 | 9.990 | 436 | 228.6 |
| 8 | recursive_500 | semantic | 0.400 | 0.344 | 261 | 385.1 |
| 9 | structure_500 | rerank | 0.400 | 0.575 | 307 | 327.7 |
| 10 | fixed_300 | semantic | 0.333 | 0.305 | 409 | 293.3 |
| 11 | fixed_300 | hybrid | 0.333 | 0.541 | 409 | 293.3 |
| 12 | fixed_300 | rerank | 0.333 | 0.602 | 409 | 293.3 |
| 13 | sentence_3 | semantic | 0.333 | 0.316 | 436 | 228.6 |
| 14 | sentence_3 | rerank | 0.333 | 0.587 | 436 | 228.6 |
| 15 | structure_500 | hybrid | 0.333 | 0.507 | 307 | 327.7 |
| 16 | structure_500 | semantic | 0.133 | 0.319 | 307 | 327.7 |

## Query Details

### recursive_500 + bm25

- `hoc bong sinh vien`: precision=1.000, avg_score=9.645
  - 10.944 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - - Chi tiết về các chương trình học bổng tài trợ sinh viên xem **TẠI ĐÂY.** (https://sv-ctt.hust.edu.vn/#/hoc-bong) ### 4. Học bổng trao đổi sinh viên quốc tế
  - 9.325 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn giảm học phí, vay vố
  - 8.666 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 19 | [Hướng dẫn chụp, công chứng và rút học bạ trong hồ sơ sinh viên](19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học
- `dang ky mon hoc`: precision=0.000, avg_score=12.064
  - 16.081 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 11.760 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - - (2) Tham gia hoạt động xây dựng kế hoạch bản thân: https://ctsv.hust.edu.vn/#/hoat-dong/9452/xay-dung-ke-hoach-hoc-tap-va-chi-tieu-cho-hoc-ky-2023-2 - (3) Tham gia hoạt động rèn 
  - 8.351 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 19 | [Hướng dẫn chụp, công chứng và rút học bạ trong hồ sơ sinh viên](19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học
- `hoc phi`: precision=0.667, avg_score=8.469
  - 9.445 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 6. Biểu mẫu về xét nhận đồ án, khóa luận tốt nghiệp: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-
  - 8.119 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 19 | [Hướng dẫn chụp, công chứng và rút học bạ trong hồ sơ sinh viên](19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học
  - 7.843 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn giảm học phí, vay vố
- `thu vien muon sach`: precision=0.667, avg_score=6.419
  - 7.214 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 6.313 `data\k3_university\library-services.md` - --- doc_id: k3-library-services title: Dịch vụ thư viện audience: all # student | faculty | staff | all department: library language: vi source_url: https://example.edu/thu-vien/di
  - 5.731 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn giảm học phí, vay vố
- `cap giay to cho sinh vien`: precision=1.000, avg_score=14.581
  - 21.941 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 11.631 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - Sinh viên đăng nhập vào tài khoản cá nhân trên hệ thống cổng thông tin sinh viên **ctsv.hust.edu.vn (https://ctsv.hust.edu.vn/#/xin-cap-giay (https://ctsv.hust.edu.vn/#/xin-cap-gia
  - 10.172 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md` - - Các bạn có thể vào mục Hồ sơ sinh viên để tải bản mềm ảnh chụp học bạ do các bạn đã tải lên hệ thống khi khai hồ sơ nhập học trực tuyến tại đây: https://ctsv.hust.edu.vn/#/cap-nh

### fixed_300 + bm25

- `hoc bong sinh vien`: precision=0.667, avg_score=8.519
  - 9.019 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` -  viên xem **TẠI ĐÂY** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_edu_vn1/EbEKhfFyCe9CvHP86a1I098BVsIOPCj_oUIwYXEZoZx5Vw?e=hUb8b0); - Chi tiết về các ch
  - 8.590 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - (19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học phí các chương trình đào tạo chính quy trong học kỳ 1 năm học 2023-202
  - 7.948 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - t.hust.edu.vn/#/hoc-bong) ### 4. Học bổng trao đổi sinh viên quốc tế Với mục tiêu đẩy mạnh quốc tế hóa môi trường giáo dục, ĐHBK Hà Nội không chỉ tăng cường tiếp nhận giảng viên, s
- `dang ky mon hoc`: precision=0.000, avg_score=11.508
  - 15.184 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 10.985 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - hoạch bản thân: https://ctsv.hust.edu.vn/#/hoat-dong/9452/xay-dung-ke-hoach-hoc-tap-va-chi-tieu-cho-hoc-ky-2023-2 - (3) Tham gia hoạt động rèn luyện ý thức tự học https://ctsv.hust
  - 8.354 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - (19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học phí các chương trình đào tạo chính quy trong học kỳ 1 năm học 2023-202
- `hoc phi`: precision=0.333, avg_score=9.145
  - 10.638 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - u-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi) ### III. Giải quyết thắc mắc 1. Với công tác đào tạo: xem hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/hu
  - 8.534 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - (19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học phí các chương trình đào tạo chính quy trong học kỳ 1 năm học 2023-202
  - 8.262 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\09-huong-dan-quy-trinh-thuc-hien-mot-so-thu-tuc-thuong-gap.md` - # LIÊN HỆ các thắc mắc sẽ gửi qua email theo hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
- `thu vien muon sach`: precision=0.667, avg_score=6.604
  - 7.143 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - y giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-giay-vay-von-ngan-hang-giay-lam.md) | 
  - 6.982 `data\k3_university\library-services.md` - --- doc_id: k3-library-services title: Dịch vụ thư viện audience: all # student | faculty | staff | all department: library language: vi source_url: https://example.edu/thu-vien/di
  - 5.687 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - 04-huong-dan-su-dung-thu-vien-ta-quang-buu.md) | 2021-09-14 10:53:05 | | 5 | [Hướng dẫn sử dụng phần mềm Office 365 và học trực tuyến; sử dụng hệ thống email do Trường cấp](05-huon
- `cap giay to cho sinh vien`: precision=0.667, avg_score=14.447
  - 21.633 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - y giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-giay-vay-von-ngan-hang-giay-lam.md) | 
  - 11.554 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - tsv.hust.edu.vn/#/xin-cap-giay (https://ctsv.hust.edu.vn/#/xin-cap-giay)) hoặc đăng ký trên App iCTSV (Dịch vụ công) **để đăng ký nhận giấy vay vốn, hệ thống sẽ tự động hẹn lịch tr
  - 10.153 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - sinh viên **[Hồ sơ cá nhân]** Đăng ký cấp giấy tờ hoặc sửa thông tin SV **tại đây** (https://sv-ctt.hust.edu.vn/#/xin-cap-giay) Thắc mắc về việc cấp giấy tờ **tại đây** (https://ct

### sentence_3 + hybrid

- `hoc bong sinh vien`: precision=1.000, avg_score=0.584
  - 0.753 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 14 | [Cẩm nang sinh viên và Cẩm nang Phòng tư vấn](14-cam-nang-sinh-vien-va-cam-nang-phong-tu-van.md) | 2024-03-26 17:19:49 | | 15 | [Hướng dẫn tổ chức đánh giá kết quả rèn luyện
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 17 | [PHÒNG TƯ VẤN HỌC TẬP & TÂM LÝ SINH VIÊN](17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md) | 2023-06-03 12:01:12 | | 18 | [Hướng dẫn tìm nhà trọ](18-huong-dan-tim-nha-tro.md) | 
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md` - - Tiếp nhận đăng ký tổ chức các hoạt động ngoại khóa cho sinh viên trong khuôn viên Trường. - Tiếp nhận và hỗ trợ sinh viên làm thủ tục thành lập câu lạc bộ sinh viên. - Chỉnh sửa 
- `dang ky mon hoc`: precision=0.000, avg_score=0.470
  - 0.500 `data\k3_university\course-registration.md` - source_url: https://example.edu/hoc-vu/dang-ky-hoc-phan retrieved_at: 2026-08-02 document_version: "2026.1"
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - Chi tiết Quy định về việc xét cấp học bổng KKHT (áp dụng từ năm học 2023-2024) sinh viên xem **TẠI ĐÂY.** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_ed
  - 0.411 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - > Nhóm nội dung: Sổ tay SV ## Nội dung Hiện tại các địa điểm trong khuôn viên giảng đường của Trường Đại học Bách khoa Hà Nội đã được phủ sóng wifi để phục vụ cho việc giảng dạy và
- `hoc phi`: precision=0.333, avg_score=0.494
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 2. Biểu mẫu học tập: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\20-muc-hoc-phi-cac-chuong-trinh-dao-tao-chinh-quy-trong-hoc-ky-1-nam-hoc-2023-2024.md` - **Chế độ miễn, giảm học phí** Chế độ miễn, giảm học phí được thực hiện theo Quy định ban hành kèm theo Quyết định số 5776/QĐ-ĐHBK ngày 18 tháng 7 năm 2023 của Giám đốc Đại học Bách
  - 0.482 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - Chuyên viên Giang Hương (316-C1)
- `thu vien muon sach`: precision=0.000, avg_score=0.535
  - 0.604 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - 3. Sinh viên là thành viên của hộ gia đình có mức thu nhập bình quân đầu người tối đa bằng 150% mức thu nhập bình quân đầu người của hộ gia đình nghèo theo quy định của Nhà nước. 4
  - 0.500 `data\k3_university\library-services.md` - source_url: https://example.edu/thu-vien/dich-vu retrieved_at: 2026-08-02 document_version: "2026.1"
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - Bạn tham khảo cách khiếu nại** tại đây! (https://www.facebook.com/ictsv.hust/photos/a.353908892774864/382030623296024/)** **Với các Minh chứng liên quan đến kết quả học tập, Ban CT
- `cap giay to cho sinh vien`: precision=1.000, avg_score=0.527
  - 0.582 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md` - - B1: Bạn đăng ký công chứng tại đây: https://ctsv.hust.edu.vn/#/viet-giay/30_HOSO (https://ctsv.hust.edu.vn/#/viet-giay/30_HOSO), đăng nhập bằng tài khoản email trường cấp. - B2: 
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - Đối tượng được nhận hỗ trợ chi phí học tập: **Sinh viên là người dân tộc thiểu số thuộc hộ nghèo, hộ cận nghèo theo quy định của Nhà nước **2. Mức hỗ trợ chi phí học tập: **Bằng 60

### recursive_500 + hybrid

- `hoc bong sinh vien`: precision=0.667, avg_score=0.574
  - 0.721 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 21 | [Hướng dẫn triển khai các vấn đề liên quan đến CLB Sinh viên](21-huong-dan-trien-khai-cac-van-de-lien-quan-den-clb-sinh-vien.md) | 2023-12-29 13:53:17 |
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - - Chi tiết về các chương trình học bổng tài trợ sinh viên xem **TẠI ĐÂY.** (https://sv-ctt.hust.edu.vn/#/hoc-bong) ### 4. Học bổng trao đổi sinh viên quốc tế
  - 0.500 `data\rag_system_design.md` - Xây dựng một hệ thống tạo văn bản tăng cường truy xuất (retrieval-augmented generation - RAG) để tìm các tài liệu nội bộ có liên quan trước khi đưa ra câu trả lời. Trợ lý nên giảm 
- `dang ky mon hoc`: precision=0.000, avg_score=0.519
  - 0.558 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - *+6 điểm từ tiêu chí tuân thủ kỷ luật học tập.* Để được điểm này chỉ cần bạn không bị cấm thi các học phần trong học kỳ. +* 6 điểm* từ làm bài kiểm tra quy chế. Các bạn xem chi tiế
  - 0.500 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - Tư vấn, gỡ rối và hỗ trợ giải quyết những vấn đề liên quan tới học tập, tâm lý, sức khỏe sinh sản, giới tính,... của sinh viên. Hướng dẫn, đào tạo kỹ năng sống thông qua những buổi
- `hoc phi`: precision=0.333, avg_score=0.477
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 6. Biểu mẫu về xét nhận đồ án, khóa luận tốt nghiệp: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - Sinh viên đặc biệt lưu ý **ĐỌC KỸ CÁC HƯỚNG DẪN TẠI MỤC 5** để có thể cài đặt và sử dụng phần mềm MS TEAMS **PHỤC VỤ CHO VIỆC HỌC TẬP TRỰC TUYẾN** trong thời gian còn thực hiện giã
  - 0.430 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 19 | [Hướng dẫn chụp, công chứng và rút học bạ trong hồ sơ sinh viên](19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học
- `thu vien muon sach`: precision=0.333, avg_score=0.485
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - hue.nguyenkim@hust.edu.vn (mailto:hue.nguyenkim@hust.edu.vn) Đơn cần nộp trực tiếp tại phòng 202A-C1, chuyên viên tiếp nhận: Nguyễn Kim Huệ Đơn chuyển trường trong nước tại đây (ht
  - 0.456 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 2. Qui định ngoại ngữ áp dụng từ khóa K68: **xem tại đây (https://ctt.hust.edu.vn/DisplayWeb/DisplayBaiViet?baiviet=43411)** 3. Qui định ngoại ngữ áp dụng từ khóa K65: **xem tại đâ
- `cap giay to cho sinh vien`: precision=1.000, avg_score=0.495
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\14-cam-nang-sinh-vien-va-cam-nang-phong-tu-van.md` - Từ năm 2015, Nhà trường đã biên soạn cuốn “Sổ tay sinh viên” để giúp cho SV có được những thông tin và chỉ dẫn cơ bản, gần gũi nhất với việc học tập và rèn luyện tại Trường. Sổ tay
  - 0.485 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - Đặt câu hỏi **tại đây** (https://ctsv.hust.edu.vn/#/viet-giay/1) #### Mục 4 Kết quả học tập các kỳ (GPA, CPA, tín chỉ nợ...) Tăng/giảm mức cảnh báo học tập **[Kết quả HT]** hung.tr

### recursive_500 + rerank

- `hoc bong sinh vien`: precision=1.000, avg_score=0.673
  - 0.784 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 21 | [Hướng dẫn triển khai các vấn đề liên quan đến CLB Sinh viên](21-huong-dan-trien-khai-cac-van-de-lien-quan-den-clb-sinh-vien.md) | 2023-12-29 13:53:17 |
  - 0.631 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 19 | [Hướng dẫn chụp, công chứng và rút học bạ trong hồ sơ sinh viên](19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học
  - 0.603 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - - Chi tiết về các chương trình học bổng tài trợ sinh viên xem **TẠI ĐÂY.** (https://sv-ctt.hust.edu.vn/#/hoc-bong) ### 4. Học bổng trao đổi sinh viên quốc tế
- `dang ky mon hoc`: precision=0.000, avg_score=0.589
  - 0.609 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - - (2) Tham gia hoạt động xây dựng kế hoạch bản thân: https://ctsv.hust.edu.vn/#/hoat-dong/9452/xay-dung-ke-hoach-hoc-tap-va-chi-tieu-cho-hoc-ky-2023-2 - (3) Tham gia hoạt động rèn 
  - 0.586 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 0.572 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - *+6 điểm từ tiêu chí tuân thủ kỷ luật học tập.* Để được điểm này chỉ cần bạn không bị cấm thi các học phần trong học kỳ. +* 6 điểm* từ làm bài kiểm tra quy chế. Các bạn xem chi tiế
- `hoc phi`: precision=0.000, avg_score=0.547
  - 0.603 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 3. Biểu mẫu đính chính thông tin bằng cấp: **Xem tại đây. ** (https://ctt.hust.edu.vn/DisplayWeb/DisplayBaiViet?baiviet=93) 4. Biểu mẫu xin thôi học, nghỉ học dài hạn, chuyển ngành
  - 0.538 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 6. Biểu mẫu về xét nhận đồ án, khóa luận tốt nghiệp: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - Sinh viên đặc biệt lưu ý **ĐỌC KỸ CÁC HƯỚNG DẪN TẠI MỤC 5** để có thể cài đặt và sử dụng phần mềm MS TEAMS **PHỤC VỤ CHO VIỆC HỌC TẬP TRỰC TUYẾN** trong thời gian còn thực hiện giã
- `thu vien muon sach`: precision=0.333, avg_score=0.507
  - 0.532 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - hue.nguyenkim@hust.edu.vn (mailto:hue.nguyenkim@hust.edu.vn) Đơn cần nộp trực tiếp tại phòng 202A-C1, chuyên viên tiếp nhận: Nguyễn Kim Huệ Đơn chuyển trường trong nước tại đây (ht
  - 0.489 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 13 | [Liên hệ, giải đáp thắc mắc (làm gì? ở đâu?)](13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md) | 2023-10-12 13:38:30 | | 14 | [Cẩm nang sinh viên và Cẩm nang Phòng tư vấn](14-c
- `cap giay to cho sinh vien`: precision=1.000, avg_score=0.547
  - 0.598 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 0.524 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\14-cam-nang-sinh-vien-va-cam-nang-phong-tu-van.md` - Từ năm 2015, Nhà trường đã biên soạn cuốn “Sổ tay sinh viên” để giúp cho SV có được những thông tin và chỉ dẫn cơ bản, gần gũi nhất với việc học tập và rèn luyện tại Trường. Sổ tay
  - 0.519 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - Tư vấn, gỡ rối và hỗ trợ giải quyết những vấn đề liên quan tới học tập, tâm lý, sức khỏe sinh sản, giới tính,... của sinh viên. Hướng dẫn, đào tạo kỹ năng sống thông qua những buổi

### structure_500 + bm25

- `hoc bong sinh vien`: precision=1.000, avg_score=10.354
  - 11.339 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - Vw?e=hUb8b0); - Chi tiết về các chương trình học bổng tài trợ sinh viên xem **TẠI ĐÂY.** (https://sv-ctt.hust.edu.vn/#/hoc-bong)
  - 10.709 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - ## Danh mục tài liệu | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn
  - 9.012 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - -ho-tro-tu-van-tam-ly-sinh-vien-giai-doan-2021-2025.md) | 2023-06-03 11:35:29 | | 17 | [PHÒNG TƯ VẤN HỌC TẬP & TÂM LÝ SINH VIÊN](17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md) | 2023
- `dang ky mon hoc`: precision=0.000, avg_score=10.465
  - 12.725 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 10.492 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - -dong/9578/ren-luyen-ky-nang-tu-hoc-ky-2023-2 (https://ctsv.hust.edu.vn/#/hoat-dong/9578/ren-luyen-ky-nang-tu-hoc-ky-2023-2) Một học kỳ các đơn vị trong Nhà trường tổ chức trung bì
  - 8.178 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - y trong học kỳ 1 năm học 2023-2024](20-muc-hoc-phi-cac-chuong-trinh-dao-tao-chinh-quy-trong-hoc-ky-1-nam-hoc-2023-2024.md) | 2023-09-26 17:18:05 | | 21 | [Hướng dẫn triển khai các 
- `hoc phi`: precision=0.000, avg_score=8.793
  - 9.863 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
  - 8.473 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - ### III. Giải quyết thắc mắc 1. Với công tác đào tạo: xem hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc
  - 8.045 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\09-huong-dan-quy-trinh-thuc-hien-mot-so-thu-tuc-thuong-gap.md` - ### LIÊN HỆ các thắc mắc sẽ gửi qua email theo hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-ph
- `thu vien muon sach`: precision=0.333, avg_score=6.353
  - 6.957 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - ## Danh mục tài liệu | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn
  - 6.650 `data\k3_university\library-services.md` - --- doc_id: k3-library-services title: Dịch vụ thư viện audience: all # student | faculty | staff | all department: library language: vi source_url: https://example.edu/thu-vien/di
  - 5.453 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - i/sinh-vien/sinh-vien-hien-tai/bach-khoa-co-can-phong-giup-sinh-vien-bo-quen-buon-lo-ap-luc-646334.html** **Thông tin liên hệ** - Phòng 101 - C1 (Mở cửa theo lịch làm việc các ngày
- `cap giay to cho sinh vien`: precision=1.000, avg_score=12.626
  - 17.694 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - ## Danh mục tài liệu | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn
  - 10.273 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - ### III. Cách thức đăng ký cấp giấy vay vốn: Sinh viên đăng nhập vào tài khoản cá nhân trên hệ thống cổng thông tin sinh viên **ctsv.hust.edu.vn (https://ctsv.hust.edu.vn/#/xin-cap
  - 9.912 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - #### Mục 6 Sửa thông tin cá nhân trên Cổng thông tin sinh viên Cấp giấy xác nhận SV Thủ tục khi bị mất thẻ sinh viên **[Hồ sơ cá nhân]** Đăng ký cấp giấy tờ hoặc sửa thông tin SV *

### sentence_3 + bm25

- `hoc bong sinh vien`: precision=1.000, avg_score=8.854
  - 9.275 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 17 | [PHÒNG TƯ VẤN HỌC TẬP & TÂM LÝ SINH VIÊN](17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md) | 2023-06-03 12:01:12 | | 18 | [Hướng dẫn tìm nhà trọ](18-huong-dan-tim-nha-tro.md) | 
  - 9.137 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn giảm học phí, vay vốn ngân hàng](02-huong-dan-ho-so-che-do-chi
  - 8.152 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 20 | [Mức học phí các chương trình đào tạo chính quy trong học kỳ 1 năm học 2023-2024](20-muc-hoc-phi-cac-chuong-trinh-dao-tao-chinh-quy-trong-hoc-ky-1-nam-hoc-2023-2024.md) | 20
- `dang ky mon hoc`: precision=0.000, avg_score=12.692
  - 19.334 `data\k3_university\course-registration.md` - source_url: https://example.edu/hoc-vu/dang-ky-hoc-phan retrieved_at: 2026-08-02 document_version: "2026.1"
  - 11.349 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - - (2) Tham gia hoạt động xây dựng kế hoạch bản thân: https://ctsv.hust.edu.vn/#/hoat-dong/9452/xay-dung-ke-hoach-hoc-tap-va-chi-tieu-cho-hoc-ky-2023-2 - (3) Tham gia hoạt động rèn 
  - 7.393 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 20 | [Mức học phí các chương trình đào tạo chính quy trong học kỳ 1 năm học 2023-2024](20-muc-hoc-phi-cac-chuong-trinh-dao-tao-chinh-quy-trong-hoc-ky-1-nam-hoc-2023-2024.md) | 20
- `hoc phi`: precision=0.000, avg_score=8.763
  - 9.124 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 2. Biểu mẫu học tập: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
  - 8.583 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - Biểu mẫu về xét nhận đồ án, khóa luận tốt nghiệp: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi
  - 8.583 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - Giải quyết thắc mắc 1. Với công tác đào tạo: xem hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-
- `thu vien muon sach`: precision=0.000, avg_score=7.111
  - 10.007 `data\k3_university\library-services.md` - source_url: https://example.edu/thu-vien/dich-vu retrieved_at: 2026-08-02 document_version: "2026.1"
  - 6.016 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - Đồng thời, các bạn cũng sẽ có cơ hội được giúp đỡ các bạn sinh viên gặp khó khăn khác.** **Tham khảo: https://hust.edu.vn/vi/sinh-vien/sinh-vien-hien-tai/bach-khoa-co-can-phong-giu
  - 5.309 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn giảm học phí, vay vốn ngân hàng](02-huong-dan-ho-so-che-do-chi
- `cap giay to cho sinh vien`: precision=1.000, avg_score=12.531
  - 16.717 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 10.569 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - ### III. Cách thức đăng ký cấp giấy vay vốn: Sinh viên đăng nhập vào tài khoản cá nhân trên hệ thống cổng thông tin sinh viên **ctsv.hust.edu.vn (https://ctsv.hust.edu.vn/#/xin-cap
  - 10.308 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - **[Hồ sơ cá nhân]** Đăng ký cấp giấy tờ hoặc sửa thông tin SV **tại đây** (https://sv-ctt.hust.edu.vn/#/xin-cap-giay) Thắc mắc về việc cấp giấy tờ **tại đây** (https://ctsv.hust.ed

### recursive_500 + semantic

- `hoc bong sinh vien`: precision=0.667, avg_score=0.385
  - 0.438 `data\rag_system_design.md` - Xây dựng một hệ thống tạo văn bản tăng cường truy xuất (retrieval-augmented generation - RAG) để tìm các tài liệu nội bộ có liên quan trước khi đưa ra câu trả lời. Trợ lý nên giảm 
  - 0.429 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 21 | [Hướng dẫn triển khai các vấn đề liên quan đến CLB Sinh viên](21-huong-dan-trien-khai-cac-van-de-lien-quan-den-clb-sinh-vien.md) | 2023-12-29 13:53:17 |
  - 0.289 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - # Các Quy định và Biểu mẫu thường dùng > Nguồn: [Sổ tay sinh viên HUST](https://sv-ctt.hust.edu.vn/#/so-tay-sv) > Ngày đăng trên nguồn: 2024-03-12 09:29:58 > Nhóm nội dung: Sổ tay 
- `dang ky mon hoc`: precision=0.000, avg_score=0.329
  - 0.356 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - Tư vấn, gỡ rối và hỗ trợ giải quyết những vấn đề liên quan tới học tập, tâm lý, sức khỏe sinh sản, giới tính,... của sinh viên. Hướng dẫn, đào tạo kỹ năng sống thông qua những buổi
  - 0.339 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - Tải mẫu đơn đăng ký hoãn thi tại đây (https://husteduvn.sharepoint.com/:w:/s/NguyenXuanTung_PDT/ESj7AYgEYQZMj6xjKvDg78oBTqQn48NrjGYOuZeaS89F_g?e=iGo101) #### Mục 32 #### Đăng ký th
  - 0.293 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - *+6 điểm từ tiêu chí tuân thủ kỷ luật học tập.* Để được điểm này chỉ cần bạn không bị cấm thi các học phần trong học kỳ. +* 6 điểm* từ làm bài kiểm tra quy chế. Các bạn xem chi tiế
- `hoc phi`: precision=0.333, avg_score=0.374
  - 0.465 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - Sinh viên đặc biệt lưu ý **ĐỌC KỸ CÁC HƯỚNG DẪN TẠI MỤC 5** để có thể cài đặt và sử dụng phần mềm MS TEAMS **PHỤC VỤ CHO VIỆC HỌC TẬP TRỰC TUYẾN** trong thời gian còn thực hiện giã
  - 0.335 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\12-ke-hoach-dao-tao-he-dai-hoc-va-sau-dai-hoc-nam-hoc-2023-2024-va-nam-truoc.md` - - Lịch đăng ký học tập: Đăng ký, điều chỉnh đăng ký các học phần trong học kỳ; đăng ký nhận đồ án/ khóa luận tốt nghiệp. - Lịch học tập: Lịch học các học kỳ chính, học kỳ hè; thời 
  - 0.322 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\14-cam-nang-sinh-vien-va-cam-nang-phong-tu-van.md` - Để hoàn thành tốt việc học tập tại Trường, ngoài việc nhận được sự hướng dẫn từ giảng viên, cố vấn học tập, các phòng ban chức năng và các tổ chức đoàn thể, mỗi SV phải tự trang bị
- `thu vien muon sach`: precision=0.000, avg_score=0.282
  - 0.310 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - hue.nguyenkim@hust.edu.vn (mailto:hue.nguyenkim@hust.edu.vn) Đơn cần nộp trực tiếp tại phòng 202A-C1, chuyên viên tiếp nhận: Nguyễn Kim Huệ Đơn chuyển trường trong nước tại đây (ht
  - 0.283 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 2. Qui định ngoại ngữ áp dụng từ khóa K68: **xem tại đây (https://ctt.hust.edu.vn/DisplayWeb/DisplayBaiViet?baiviet=43411)** 3. Qui định ngoại ngữ áp dụng từ khóa K65: **xem tại đâ
  - 0.254 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - **[Thắc mắc điểm]** **Các bước cần thực hiện:** **Bước 1:** Liên hệ với giảng viên/khoa,viện qua email để biết được giảng viên đã nhập điểm lên hệ thống hay chưa. **Bước 2:** Nếu g
- `cap giay to cho sinh vien`: precision=1.000, avg_score=0.349
  - 0.364 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\14-cam-nang-sinh-vien-va-cam-nang-phong-tu-van.md` - Từ năm 2015, Nhà trường đã biên soạn cuốn “Sổ tay sinh viên” để giúp cho SV có được những thông tin và chỉ dẫn cơ bản, gần gũi nhất với việc học tập và rèn luyện tại Trường. Sổ tay
  - 0.348 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md` - # Liên hệ, giải đáp thắc mắc (làm gì? ở đâu?) > Nguồn: [Sổ tay sinh viên HUST](https://sv-ctt.hust.edu.vn/#/so-tay-sv) > Ngày đăng trên nguồn: 2023-10-12 13:38:30 > Nhóm nội dung: 
  - 0.337 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - - **b)** Bản sao chứng thực Giấy xác nhận khuyết tật do Ủy ban nhân dân cấp xã cấp hoặc bản sao chứng thực Quyết định của Chủ tịch Ủy ban nhân dân cấp huyện về việc trợ cấp xã hội;

### structure_500 + rerank

- `hoc bong sinh vien`: precision=1.000, avg_score=0.663
  - 0.733 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - anh%20QD%20to%20chuc%20thi%20Truc%20tuyen.pdf) 9. Quy định công nhận tín chỉ và chuyển đổi kết quả học phần tương đương: **Xem tại đây.** (https://ctt.hust.edu.vn/Upload/Nguyen%20Q
  - 0.647 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - y trong học kỳ 1 năm học 2023-2024](20-muc-hoc-phi-cac-chuong-trinh-dao-tao-chinh-quy-trong-hoc-ky-1-nam-hoc-2023-2024.md) | 2023-09-26 17:18:05 | | 21 | [Hướng dẫn triển khai các 
  - 0.611 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - Vw?e=hUb8b0); - Chi tiết về các chương trình học bổng tài trợ sinh viên xem **TẠI ĐÂY.** (https://sv-ctt.hust.edu.vn/#/hoc-bong)
- `dang ky mon hoc`: precision=0.000, avg_score=0.524
  - 0.548 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 0.522 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - ### II. Các biểu mẫu thường dùng 1. Biểu mẫu thủ tục hành chính xin xác nhận của Trường (giấy chứng nhận SV, giấy giới thiệu, giấy vay vốn ngân hàng, giấy làm thẻ xe buýt....): **X
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - ## Nội dung Hiện tại các địa điểm trong khuôn viên giảng đường của Trường Đại học Bách khoa Hà Nội đã được phủ sóng wifi để phục vụ cho việc giảng dạy và học tập. Ngoài ra Nhà trườ
- `hoc phi`: precision=0.000, avg_score=0.525
  - 0.595 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md` - ### 3. Rút học bạ (hồ sơ sinh viên) Sinh viên chỉ rút học bạ gốc trong các trường hợp có: (1) Quyết định thôi học hoặc (2) Quyết định nghỉ học, bảo lưu học tập do Ban Giám đốc ĐHBK
  - 0.478 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - ### III. Giải quyết thắc mắc 1. Với công tác đào tạo: xem hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc
- `thu vien muon sach`: precision=0.333, avg_score=0.667
  - 0.807 `data\k3_university\library-services.md` - --- doc_id: k3-library-services title: Dịch vụ thư viện audience: all # student | faculty | staff | all department: library language: vi source_url: https://example.edu/thu-vien/di
  - 0.671 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - #### Mục 20 Thắc mắc về thời khóa biểu **[Thời khóa biểu]** thu.nguyenthiha@hust.edu.vn Với SV các chương trình đào tạo hợp tác quốc tế, liên hệ chuyên viên Giang Hương: huong.gian
  - 0.525 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - ## Danh mục tài liệu | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn
- `cap giay to cho sinh vien`: precision=0.667, avg_score=0.497
  - 0.576 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - ## Danh mục tài liệu | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn
  - 0.514 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - ### 3. Học bổng tài trợ Hàng năm sinh viên ĐHBK Hà Nội nhận được khoảng từ 5-7 tỷ đồng học bổng tài trợ từ các cá nhân, tổ chức, doanh nghiệp trong và ngoài nước như: học bổng Sumi
  - 0.402 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - ### II. Các biểu mẫu thường dùng 1. Biểu mẫu thủ tục hành chính xin xác nhận của Trường (giấy chứng nhận SV, giấy giới thiệu, giấy vay vốn ngân hàng, giấy làm thẻ xe buýt....): **X

### fixed_300 + semantic

- `hoc bong sinh vien`: precision=0.667, avg_score=0.288
  - 0.298 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - t_edu_vn1/ERg4NeFLkeBOu8j8SXfOHUoBBarqEtWAJHqETEODPYt5DA?e=wfLtCi).
  - 0.292 `data\k3_university\course-registration.md` -  ký. Khi gặp lỗi trùng lịch, sinh viên điều chỉnh lớp học phần trước thời hạn điều chỉnh được công bố. Mọi yêu cầu ngoại lệ phải được gửi qua kênh hỗ trợ học vụ chính thức.
  - 0.274 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` -  ĐÂY (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_edu_vn1/EaQb5XucFDpIjtckawafR2ABVFBqq5VQ4c-akklE2JjP3Q?e=ia25Rv).** ### 3. Học bổng tài trợ Hàng năm si
- `dang ky mon hoc`: precision=0.000, avg_score=0.276
  - 0.304 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\09-huong-dan-quy-trinh-thuc-hien-mot-so-thu-tuc-thuong-gap.md` - ểm kỳ mới nhất để phục vụ công tác phúc tra: **Xem tại đây.** (https://ctt.hust.edu.vn/DisplayWeb/DisplayBaiViet?baiviet=34476) 4. Hướng dẫn thủ tục chuyển trường dành cho du học s
  - 0.264 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - C TẬP & TÂM LÝ SINH VIÊN](17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md) | 2023-06-03 12:01:12 | | 18 | [Hướng dẫn tìm nhà trọ](18-huong-dan-tim-nha-tro.md) | 2023-06-03 13:57:53 | |
  - 0.260 `data\k3_university\library-services.md` - " --- > Khối metadata phía trên là **template mẫu** cho K3 — thay `source_url`/`retrieved_at`/`document_version` bằng nguồn công khai thật trước khi dùng làm benchmark. # Dịch vụ t
- `hoc phi`: precision=0.000, avg_score=0.364
  - 0.393 `data\python_intro.txt` - n thường kết nối các mô hình embedding, vector store, và logic ứng dụng trong một cơ sở mã duy nhất. Mặc dù linh hoạt, Python vẫn có những sự đánh đổi. Nó thường chậm hơn các ngôn 
  - 0.366 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - kết quê hương cho sinh viên, học viên chương trình kỹ sư chuyên sâu đặc thù có đồ án/khóa luận tốt nghiệp (ĐANT) góp phần cải tiến, nâng cao chất lượng, hiệu quả kinh doanh, sản xu
  - 0.334 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\14-cam-nang-sinh-vien-va-cam-nang-phong-tu-van.md` - ác bạn SV. Để phục vụ tốt hơn nữa nhu cầu của SV trong năm học mới 2023 - 2024, Ban Công tác sinh viên đã kết hợp với các đơn vị có liên quan tiến hành chỉnh sửa cuốn “Sổ tay sinh 
- `thu vien muon sach`: precision=0.000, avg_score=0.292
  - 0.297 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - y 16/9/2021 của Ủy ban dân tộc). 14. Sinh viên là con cán bộ, công chức, viên chức, công nhân mà cha hoặc mẹ bị tai nạn lao động hoặc mắc bệnh nghề nghiệp được hưởng trợ cấp thường
  - 0.291 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - gày 30/5/2017 và Quyết định số 1656/QĐ-TTg, ngày 19/11/2019 và Quyết định số 05/2022/QĐ-TTg, ngày 23/3/2022 ### I. Đối tượng được vay vốn: Sinh viên thuộc một trong các diện sau đư
  - 0.289 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\08-huong-dan-ve-bhyt-va-su-dung-the-bhyt-kham-chua-benh-nam-2024.md` - từ 01/07/2024 đến 31/12/2024 (06 tháng). Số tiền phải đóng: **6 tháng x 56.700 đồng/tháng = 340.200 đồng**. - Đợt 3: Từ ngày 01/09/2024 đến ngày 20/09/2024. Thời gian tham gia bảo 
- `cap giay to cho sinh vien`: precision=1.000, avg_score=0.305
  - 0.323 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - hoa Hà Nội: **Xem tại đây.** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_edu_vn1/ERM9j9d46etEkTa9ggjN-9EBD4I5nuozz-5hy2HLsXKB2A?e=UPFf5j) 18. Quy định v
  - 0.296 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\08-huong-dan-ve-bhyt-va-su-dung-the-bhyt-kham-chua-benh-nam-2024.md` -  tháng x 73.710 đồng/tháng = 221.130 đồng.** Hình thức nộp tiền: Sinh viên nộp tiền theo cú pháp **MSSV_Hovaten** vào tài khoản 12210002113656 - DAI HOC BACH KHOA HA NOI tại Ngân h
  - 0.296 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` -  hưởng bởi kết quả học tập hoặc có kết quả rèn luyện kém. - Sinh viên có dấu hiệu bệnh lý, hoặc “chủ động” nhờ trợ giúp tâm lý. - Phụ huynh và những người liên quan. **Đến với Phòn

### fixed_300 + hybrid

- `hoc bong sinh vien`: precision=0.667, avg_score=0.586
  - 0.759 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - vướng mắc, lo âu trong cuộc sống, những khó khăn trong học tập. Đồng thời, các bạn cũng sẽ có cơ hội được giúp đỡ các bạn sinh viên gặp khó khăn khác.** **Tham khảo: https://hust.e
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` -  viên xem **TẠI ĐÂY** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_edu_vn1/EbEKhfFyCe9CvHP86a1I098BVsIOPCj_oUIwYXEZoZx5Vw?e=hUb8b0); - Chi tiết về các ch
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - t_edu_vn1/ERg4NeFLkeBOu8j8SXfOHUoBBarqEtWAJHqETEODPYt5DA?e=wfLtCi).
- `dang ky mon hoc`: precision=0.000, avg_score=0.544
  - 0.633 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - ctsv.hust.edu.vn/#/hoat-dong/9578/ren-luyen-ky-nang-tu-hoc-ky-2023-2) Một học kỳ các đơn vị trong Nhà trường tổ chức trung bình **300 hoạt động khác nhau. **Do đó, bạn hoàn toàn có
  - 0.500 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\09-huong-dan-quy-trinh-thuc-hien-mot-so-thu-tuc-thuong-gap.md` - ểm kỳ mới nhất để phục vụ công tác phúc tra: **Xem tại đây.** (https://ctt.hust.edu.vn/DisplayWeb/DisplayBaiViet?baiviet=34476) 4. Hướng dẫn thủ tục chuyển trường dành cho du học s
- `hoc phi`: precision=0.000, avg_score=0.489
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - u-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi) ### III. Giải quyết thắc mắc 1. Với công tác đào tạo: xem hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/hu
  - 0.500 `data\python_intro.txt` - n thường kết nối các mô hình embedding, vector store, và logic ứng dụng trong một cơ sở mã duy nhất. Mặc dù linh hoạt, Python vẫn có những sự đánh đổi. Nó thường chậm hơn các ngôn 
  - 0.466 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - kết quê hương cho sinh viên, học viên chương trình kỹ sư chuyên sâu đặc thù có đồ án/khóa luận tốt nghiệp (ĐANT) góp phần cải tiến, nâng cao chất lượng, hiệu quả kinh doanh, sản xu
- `thu vien muon sach`: precision=0.333, avg_score=0.597
  - 0.792 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - vướng mắc, lo âu trong cuộc sống, những khó khăn trong học tập. Đồng thời, các bạn cũng sẽ có cơ hội được giúp đỡ các bạn sinh viên gặp khó khăn khác.** **Tham khảo: https://hust.e
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - y giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-giay-vay-von-ngan-hang-giay-lam.md) | 
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - y 16/9/2021 của Ủy ban dân tộc). 14. Sinh viên là con cán bộ, công chức, viên chức, công nhân mà cha hoặc mẹ bị tai nạn lao động hoặc mắc bệnh nghề nghiệp được hưởng trợ cấp thường
- `cap giay to cho sinh vien`: precision=0.667, avg_score=0.486
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - y giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-giay-vay-von-ngan-hang-giay-lam.md) | 
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - hoa Hà Nội: **Xem tại đây.** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_edu_vn1/ERM9j9d46etEkTa9ggjN-9EBD4I5nuozz-5hy2HLsXKB2A?e=UPFf5j) 18. Quy định v
  - 0.459 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\08-huong-dan-ve-bhyt-va-su-dung-the-bhyt-kham-chua-benh-nam-2024.md` -  tháng x 73.710 đồng/tháng = 221.130 đồng.** Hình thức nộp tiền: Sinh viên nộp tiền theo cú pháp **MSSV_Hovaten** vào tài khoản 12210002113656 - DAI HOC BACH KHOA HA NOI tại Ngân h

### fixed_300 + rerank

- `hoc bong sinh vien`: precision=0.667, avg_score=0.636
  - 0.796 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - vướng mắc, lo âu trong cuộc sống, những khó khăn trong học tập. Đồng thời, các bạn cũng sẽ có cơ hội được giúp đỡ các bạn sinh viên gặp khó khăn khác.** **Tham khảo: https://hust.e
  - 0.579 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` -  viên xem **TẠI ĐÂY** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_edu_vn1/EbEKhfFyCe9CvHP86a1I098BVsIOPCj_oUIwYXEZoZx5Vw?e=hUb8b0); - Chi tiết về các ch
  - 0.533 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - (19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md) | 2023-07-05 15:57:45 | | 20 | [Mức học phí các chương trình đào tạo chính quy trong học kỳ 1 năm học 2023-202
- `dang ky mon hoc`: precision=0.000, avg_score=0.607
  - 0.666 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - ctsv.hust.edu.vn/#/hoat-dong/9578/ren-luyen-ky-nang-tu-hoc-ky-2023-2) Một học kỳ các đơn vị trong Nhà trường tổ chức trung bình **300 hoạt động khác nhau. **Do đó, bạn hoàn toàn có
  - 0.579 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - C TẬP & TÂM LÝ SINH VIÊN](17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md) | 2023-06-03 12:01:12 | | 18 | [Hướng dẫn tìm nhà trọ](18-huong-dan-tim-nha-tro.md) | 2023-06-03 13:57:53 | |
  - 0.577 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
- `hoc phi`: precision=0.000, avg_score=0.569
  - 0.660 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md` - nh và giải đáp các thắc mắc với Phòng Đào tạo sinh viên xem **TẠI ĐÂY.** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-ho
  - 0.548 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - u-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi) ### III. Giải quyết thắc mắc 1. Với công tác đào tạo: xem hướng dẫn **TẠI ĐÂY** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/hu
  - 0.500 `data\python_intro.txt` - n thường kết nối các mô hình embedding, vector store, và logic ứng dụng trong một cơ sở mã duy nhất. Mặc dù linh hoạt, Python vẫn có những sự đánh đổi. Nó thường chậm hơn các ngôn 
- `thu vien muon sach`: precision=0.333, avg_score=0.660
  - 0.810 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - vướng mắc, lo âu trong cuộc sống, những khó khăn trong học tập. Đồng thời, các bạn cũng sẽ có cơ hội được giúp đỡ các bạn sinh viên gặp khó khăn khác.** **Tham khảo: https://hust.e
  - 0.630 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` -  mẹ hoặc chỉ mồ côi cha hoặc mẹ nhưng người còn lại không có khả năng lao động. 2. Sinh viên là thành viên của hộ nghèo, cận nghèo theo quy định của Nhà nước. 3. Sinh viên là thành
  - 0.539 `data\k3_university\library-services.md` - --- doc_id: k3-library-services title: Dịch vụ thư viện audience: all # student | faculty | staff | all department: library language: vi source_url: https://example.edu/thu-vien/di
- `cap giay to cho sinh vien`: precision=0.667, avg_score=0.536
  - 0.611 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - y giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-giay-vay-von-ngan-hang-giay-lam.md) | 
  - 0.519 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - hoa Hà Nội: **Xem tại đây.** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_edu_vn1/ERM9j9d46etEkTa9ggjN-9EBD4I5nuozz-5hy2HLsXKB2A?e=UPFf5j) 18. Quy định v
  - 0.477 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\08-huong-dan-ve-bhyt-va-su-dung-the-bhyt-kham-chua-benh-nam-2024.md` -  tháng x 73.710 đồng/tháng = 221.130 đồng.** Hình thức nộp tiền: Sinh viên nộp tiền theo cú pháp **MSSV_Hovaten** vào tài khoản 12210002113656 - DAI HOC BACH KHOA HA NOI tại Ngân h

### sentence_3 + semantic

- `hoc bong sinh vien`: precision=0.667, avg_score=0.267
  - 0.269 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md` - - Tiếp nhận đăng ký tổ chức các hoạt động ngoại khóa cho sinh viên trong khuôn viên Trường. - Tiếp nhận và hỗ trợ sinh viên làm thủ tục thành lập câu lạc bộ sinh viên. - Chỉnh sửa 
  - 0.266 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - Trường hợp có thắc mắc về thủ tục tại Ban Đào tạo sẽ liên hệ theo qua email: hue.nguyenkim@hust.edu.vn 2. Nộp đơn tại Trung tâm Đào tạo liên tục (khu nhà TC) để được tư vấn và xếp 
  - 0.266 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - Bạn tham khảo cách khiếu nại** tại đây! (https://www.facebook.com/ictsv.hust/photos/a.353908892774864/382030623296024/)** **Với các Minh chứng liên quan đến kết quả học tập, Ban CT
- `dang ky mon hoc`: precision=0.000, avg_score=0.319
  - 0.371 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - Chi tiết Quy định về việc xét cấp học bổng KKHT (áp dụng từ năm học 2023-2024) sinh viên xem **TẠI ĐÂY.** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_ed
  - 0.305 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - > Nhóm nội dung: Sổ tay SV ## Nội dung Hiện tại các địa điểm trong khuôn viên giảng đường của Trường Đại học Bách khoa Hà Nội đã được phủ sóng wifi để phục vụ cho việc giảng dạy và
  - 0.281 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - Đối tượng được nhận hỗ trợ chi phí học tập: **Sinh viên là người dân tộc thiểu số thuộc hộ nghèo, hộ cận nghèo theo quy định của Nhà nước **2. Mức hỗ trợ chi phí học tập: **Bằng 60
- `hoc phi`: precision=0.333, avg_score=0.328
  - 0.337 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\20-muc-hoc-phi-cac-chuong-trinh-dao-tao-chinh-quy-trong-hoc-ky-1-nam-hoc-2023-2024.md` - **Chế độ miễn, giảm học phí** Chế độ miễn, giảm học phí được thực hiện theo Quy định ban hành kèm theo Quyết định số 5776/QĐ-ĐHBK ngày 18 tháng 7 năm 2023 của Giám đốc Đại học Bách
  - 0.325 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - Chuyên viên Giang Hương (316-C1)
  - 0.321 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - huong.nguyenthi1@hust.edu.vn Tải tại đây (https://husteduvn.sharepoint.com/:w:/s/NguyenXuanTung_PDT/EdDCJnCWLlRHtEafh2p11aoBLB1ev58zMt1tmTuk9x9Nfg?e=1efidj) #### Mục 14
- `thu vien muon sach`: precision=0.000, avg_score=0.320
  - 0.342 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - Bạn tham khảo cách khiếu nại** tại đây! (https://www.facebook.com/ictsv.hust/photos/a.353908892774864/382030623296024/)** **Với các Minh chứng liên quan đến kết quả học tập, Ban CT
  - 0.315 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - Sửa thông tin cá nhân trên Cổng thông tin sinh viên Cấp giấy xác nhận SV Thủ tục khi bị mất thẻ sinh viên
  - 0.303 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md` - - Tư vấn hỗ trợ về việc thực hiện chế độ chính sách, học bổng, việc làm cho sinh viên.
- `cap giay to cho sinh vien`: precision=0.667, avg_score=0.345
  - 0.354 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - Đối tượng được nhận hỗ trợ chi phí học tập: **Sinh viên là người dân tộc thiểu số thuộc hộ nghèo, hộ cận nghèo theo quy định của Nhà nước **2. Mức hỗ trợ chi phí học tập: **Bằng 60
  - 0.353 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\08-huong-dan-ve-bhyt-va-su-dung-the-bhyt-kham-chua-benh-nam-2024.md` - - **Bước 3:** Thực hiện xét nghiệm, cận lâm sàng (nếu có) - **Bước 4:** Trở lại Phòng khám ban đầu (sau khi có kết quả cận lâm sàng) - **Bước 5:** Đợi Bác sỹ kê đơn thuốc và ra bàn
  - 0.327 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\17-phong-tu-van-hoc-tap-tam-ly-sinh-vien.md` - > Nhóm nội dung: Sổ tay SV ## Nội dung **Phòng hỗ trợ, tư vấn học tập và tâm lý sinh viên là đơn vị thuộc Phòng CTSV được thành lập ngày 30-06- 2021 theo Quyết định số 1598 của Hiệ

### sentence_3 + rerank

- `hoc bong sinh vien`: precision=0.667, avg_score=0.691
  - 0.778 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 14 | [Cẩm nang sinh viên và Cẩm nang Phòng tư vấn](14-cam-nang-sinh-vien-va-cam-nang-phong-tu-van.md) | 2024-03-26 17:19:49 | | 15 | [Hướng dẫn tổ chức đánh giá kết quả rèn luyện
  - 0.670 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 0.626 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 2. Biểu mẫu học tập: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
- `dang ky mon hoc`: precision=0.000, avg_score=0.533
  - 0.688 `data\k3_university\course-registration.md` - source_url: https://example.edu/hoc-vu/dang-ky-hoc-phan retrieved_at: 2026-08-02 document_version: "2026.1"
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - Chi tiết Quy định về việc xét cấp học bổng KKHT (áp dụng từ năm học 2023-2024) sinh viên xem **TẠI ĐÂY.** (https://husteduvn-my.sharepoint.com/:b:/g/personal/khai_tranquang_hust_ed
  - 0.411 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - > Nhóm nội dung: Sổ tay SV ## Nội dung Hiện tại các địa điểm trong khuôn viên giảng đường của Trường Đại học Bách khoa Hà Nội đã được phủ sóng wifi để phục vụ cho việc giảng dạy và
- `hoc phi`: precision=0.000, avg_score=0.550
  - 0.569 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - - (2) Tham gia hoạt động xây dựng kế hoạch bản thân: https://ctsv.hust.edu.vn/#/hoat-dong/9452/xay-dung-ke-hoach-hoc-tap-va-chi-tieu-cho-hoc-ky-2023-2 - (3) Tham gia hoạt động rèn 
  - 0.561 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - 2. Biểu mẫu học tập: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
  - 0.520 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - Biểu mẫu về xét nhận đồ án, khóa luận tốt nghiệp: **Xem tại đây. ** (https://sv-ctt.hust.edu.vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi
- `thu vien muon sach`: precision=0.000, avg_score=0.587
  - 0.636 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - 3. Sinh viên là thành viên của hộ gia đình có mức thu nhập bình quân đầu người tối đa bằng 150% mức thu nhập bình quân đầu người của hộ gia đình nghèo theo quy định của Nhà nước. 4
  - 0.625 `data\k3_university\library-services.md` - source_url: https://example.edu/thu-vien/dich-vu retrieved_at: 2026-08-02 document_version: "2026.1"
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - Bạn tham khảo cách khiếu nại** tại đây! (https://www.facebook.com/ictsv.hust/photos/a.353908892774864/382030623296024/)** **Với các Minh chứng liên quan đến kết quả học tập, Ban CT
- `cap giay to cho sinh vien`: precision=1.000, avg_score=0.575
  - 0.635 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md` - - B1: Bạn đăng ký công chứng tại đây: https://ctsv.hust.edu.vn/#/viet-giay/30_HOSO (https://ctsv.hust.edu.vn/#/viet-giay/30_HOSO), đăng nhập bằng tài khoản email trường cấp. - B2: 
  - 0.568 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - | 3 | [Cấp giấy tờ cho sinh viên (Giấy giới thiệu, giấy chứng nhận, giấy vay vốn ngân hàng, giấy làm Thẻ xe buýt...)](03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-g
  - 0.521 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - Đối tượng được nhận hỗ trợ chi phí học tập: **Sinh viên là người dân tộc thiểu số thuộc hộ nghèo, hộ cận nghèo theo quy định của Nhà nước **2. Mức hỗ trợ chi phí học tập: **Bằng 60

### structure_500 + hybrid

- `hoc bong sinh vien`: precision=1.000, avg_score=0.565
  - 0.694 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - anh%20QD%20to%20chuc%20thi%20Truc%20tuyen.pdf) 9. Quy định công nhận tín chỉ và chuyển đổi kết quả học phần tương đương: **Xem tại đây.** (https://ctt.hust.edu.vn/Upload/Nguyen%20Q
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - Vw?e=hUb8b0); - Chi tiết về các chương trình học bổng tài trợ sinh viên xem **TẠI ĐÂY.** (https://sv-ctt.hust.edu.vn/#/hoc-bong)
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-giay-vay-von-ngan-hang-giay-lam.md` - ### 1. Các thức đăng ký Sinh viên cần cấp các loại giấy tờ như: Giấy chứng nhận sinh viên, giấy giới thiệu sinh viện, giấy vay vốn ngân hàng, giấy ưu đãi trong giáo dục,... trên ứn
- `dang ky mon hoc`: precision=0.000, avg_score=0.471
  - 0.500 `data\k3_university\course-registration.md` - --- doc_id: k3-course-registration title: Đăng ký học phần audience: student # student | faculty | staff | all department: academic-affairs language: vi source_url: https://example
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - ## Nội dung Hiện tại các địa điểm trong khuôn viên giảng đường của Trường Đại học Bách khoa Hà Nội đã được phủ sóng wifi để phục vụ cho việc giảng dạy và học tập. Ngoài ra Nhà trườ
  - 0.412 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\15-huong-dan-to-chuc-danh-gia-ket-qua-ren-luyen.md` - -dong/9578/ren-luyen-ky-nang-tu-hoc-ky-2023-2 (https://ctsv.hust.edu.vn/#/hoat-dong/9578/ren-luyen-ky-nang-tu-hoc-ky-2023-2) Một học kỳ các đơn vị trong Nhà trường tổ chức trung bì
- `hoc phi`: precision=0.000, avg_score=0.484
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - vn/#/so-tay-sv/69/huong-dan-gui-cau-hoi-toi-phong-dao-tao-cac-van-de-ve-hoc-tap-hoc-phi)
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md` - ### 3. Rút học bạ (hồ sơ sinh viên) Sinh viên chỉ rút học bạ gốc trong các trường hợp có: (1) Quyết định thôi học hoặc (2) Quyết định nghỉ học, bảo lưu học tập do Ban Giám đốc ĐHBK
  - 0.453 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\11-huong-dan-lam-the-gui-xe-trong-truong-va-lam-ve-xe-buyt-thang.md` - # Hướng dẫn làm Thẻ gửi xe trong Trường và làm vé xe buýt tháng > Nguồn: [Sổ tay sinh viên HUST](https://sv-ctt.hust.edu.vn/#/so-tay-sv) > Ngày đăng trên nguồn: 2022-08-25 10:33:15
- `thu vien muon sach`: precision=0.000, avg_score=0.547
  - 0.641 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - #### Mục 20 Thắc mắc về thời khóa biểu **[Thời khóa biểu]** thu.nguyenthiha@hust.edu.vn Với SV các chương trình đào tạo hợp tác quốc tế, liên hệ chuyên viên Giang Hương: huong.gian
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - ## Danh mục tài liệu | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - #### Mục 3 Thắc mắc về miễn giảm học phí Đặt câu hỏi **tại đây** (https://ctsv.hust.edu.vn/#/viet-giay/1)
- `cap giay to cho sinh vien`: precision=0.667, avg_score=0.467
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\00-INDEX.md` - ## Danh mục tài liệu | STT | Tài liệu | Ngày đăng trên nguồn | |---:|---|---| | 1 | [Học bổng](01-hoc-bong.md) | 2024-06-13 11:12:13 | | 2 | [Hướng dẫn Hồ sơ chế độ chính sách miễn
  - 0.500 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - ### 3. Học bổng tài trợ Hàng năm sinh viên ĐHBK Hà Nội nhận được khoảng từ 5-7 tỷ đồng học bổng tài trợ từ các cá nhân, tổ chức, doanh nghiệp trong và ngoài nước như: học bổng Sumi
  - 0.402 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - ### II. Các biểu mẫu thường dùng 1. Biểu mẫu thủ tục hành chính xin xác nhận của Trường (giấy chứng nhận SV, giấy giới thiệu, giấy vay vốn ngân hàng, giấy làm thẻ xe buýt....): **X

### structure_500 + semantic

- `hoc bong sinh vien`: precision=0.333, avg_score=0.294
  - 0.310 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\03-cap-giay-to-cho-sinh-vien-giay-gioi-thieu-giay-chung-nhan-giay-vay-von-ngan-hang-giay-lam.md` - ### 1. Các thức đăng ký Sinh viên cần cấp các loại giấy tờ như: Giấy chứng nhận sinh viên, giấy giới thiệu sinh viện, giấy vay vốn ngân hàng, giấy ưu đãi trong giáo dục,... trên ứn
  - 0.289 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\11-huong-dan-lam-the-gui-xe-trong-truong-va-lam-ve-xe-buyt-thang.md` - uyết định số 44/2017/QĐ-UBND ngày 15/12/2017 của UBND Thành phố Hà Nội áp dụng đối với khu vực trường học. Cụ thể như sau: **Loại xe** **Thường xuyên (đồng/xe/lượt)** **Vãng lai** 
  - 0.282 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - #### Mục 24 Tiếp nhận trở lại học sau khi nghỉ dài hạn (Thời gian tiếp nhận đơn là trước 3-4 tuần so với thời điểm bắt đầu học kỳ) **[Tiếp nhận học]** hue.nguyenkim@hust.edu.vn (ma
- `dang ky mon hoc`: precision=0.000, avg_score=0.322
  - 0.373 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\05-huong-dan-su-dung-phan-mem-office-365-va-hoc-truc-tuyen-su-dung-he-thong-email-do-truong-c.md` - ## Nội dung Hiện tại các địa điểm trong khuôn viên giảng đường của Trường Đại học Bách khoa Hà Nội đã được phủ sóng wifi để phục vụ cho việc giảng dạy và học tập. Ngoài ra Nhà trườ
  - 0.301 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - ### A. Miễn, giảm học phí Việc miễn giảm học phí cho sinh viên diện chế độ chính sách (CĐCS) từ năm học 2021-2022 được thực hiện theo Nghị định 81/2021/NĐ-CP, ngày 27/8/2021 của Ch
  - 0.293 `data\chunking_experiment_report.md` - ## Chia nhỏ đệ quy (Recursive Chunking) Chia nhỏ đệ quy mang lại sự cân bằng tốt nhất trong thử nghiệm. Đầu tiên nó cố gắng cắt ở các ranh giới cấu trúc lớn hơn như đoạn văn, sau đ
- `hoc phi`: precision=0.000, avg_score=0.313
  - 0.342 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\19-huong-dan-chup-cong-chung-va-rut-hoc-ba-trong-ho-so-sinh-vien.md` - ### 3. Rút học bạ (hồ sơ sinh viên) Sinh viên chỉ rút học bạ gốc trong các trường hợp có: (1) Quyết định thôi học hoặc (2) Quyết định nghỉ học, bảo lưu học tập do Ban Giám đốc ĐHBK
  - 0.310 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\11-huong-dan-lam-the-gui-xe-trong-truong-va-lam-ve-xe-buyt-thang.md` - # Hướng dẫn làm Thẻ gửi xe trong Trường và làm vé xe buýt tháng > Nguồn: [Sổ tay sinh viên HUST](https://sv-ctt.hust.edu.vn/#/so-tay-sv) > Ngày đăng trên nguồn: 2022-08-25 10:33:15
  - 0.287 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md` - #### 1. Thông tin liên hệ: - Địa chỉ: Phòng 101 – 102 – 103 – 104 -104 nhà C1 - Điện thoại: 024.3869.2896 (Phòng 102 nhà C1); 024.3869.3108 (Phòng 103-104 nhà C1) - Email: ctsv@hus
- `thu vien muon sach`: precision=0.000, avg_score=0.342
  - 0.345 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\07-ban-dao-tao-huong-dan-thu-tuc-bieu-mau-thac-mac-ve-hoc-tap-hoc-phi.md` - #### Mục 3 Thắc mắc về miễn giảm học phí Đặt câu hỏi **tại đây** (https://ctsv.hust.edu.vn/#/viet-giay/1)
  - 0.343 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\13-lien-he-giai-dap-thac-mac-lam-gi-o-dau.md` - ### I. Phòng Đào tạo
  - 0.337 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\02-huong-dan-ho-so-che-do-chinh-sach-mien-giam-hoc-phi-vay-von-ngan-hang.md` - ### II. Mức miễn giảm học phí - **a)** Đối tượng từ 1 đến 12: Được miễn học phí. - **b)** Đối tượng 13: Được giảm 70% học phí. - **c)** Đối tượng 14: Được giảm 50% học phí.
- `cap giay to cho sinh vien`: precision=0.333, avg_score=0.326
  - 0.378 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\01-hoc-bong.md` - ### 3. Học bổng tài trợ Hàng năm sinh viên ĐHBK Hà Nội nhận được khoảng từ 5-7 tỷ đồng học bổng tài trợ từ các cá nhân, tổ chức, doanh nghiệp trong và ngoài nước như: học bổng Sumi
  - 0.304 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\06-cac-quy-dinh-va-bieu-mau-thuong-dung.md` - ### II. Các biểu mẫu thường dùng 1. Biểu mẫu thủ tục hành chính xin xác nhận của Trường (giấy chứng nhận SV, giấy giới thiệu, giấy vay vốn ngân hàng, giấy làm thẻ xe buýt....): **X
  - 0.297 `data\hust-so-tay-sv-21-markdown\hust_so_tay_sv_markdown\11-huong-dan-lam-the-gui-xe-trong-truong-va-lam-ve-xe-buyt-thang.md` - ### II. Làm vé xe buýt tháng

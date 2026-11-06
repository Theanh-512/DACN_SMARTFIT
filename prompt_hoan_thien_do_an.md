# CÁC PROMPT ĐỂ HOÀN THIỆN ĐỒ ÁN SMARTFIT (PHẦN THỬ ĐỒ 3D VÀ TƯ VẤN SIZE)

Thứ tự gửi Antigravity, mỗi lần một prompt, chỉ gửi prompt sau khi đã kiểm tra kết quả prompt trước:

0. Prompt kiểm chứng đã đưa ở tin trước (độ chật không bị pushout che, số đo, slider, tích hợp API). BẮT BUỘC làm trước.
1. Prompt A1: khảo sát model ước lượng cơ thể từ ảnh (chưa cài gì).
2. Prompt A2: tích hợp model đã chọn và chụp bằng camera trên web.
3. Prompt B: đánh giá thực nghiệm (THuman2.1 và người thật).
4. Prompt C: tích hợp cuối, bảo mật, đóng gói, tài liệu.
5. Prompt D (mở rộng, nếu còn thời gian): camera bắt chuyển động.

Quy tắc chung cho mọi prompt: khảo sát mã nguồn -> xác định tiêu chí nghiệm thu -> làm một phạm vi nhỏ -> chạy kiểm thử -> đưa bằng chứng (ảnh chụp từ ứng dụng thật, bảng số liệu, log test, danh sách file đổi) -> dừng chờ tôi. Gán PASS, FAIL, BLOCKED hoặc NOT RUN cho từng tiêu chí. Không tự tải file cần đăng ký hay nguồn không chính thức. Không sửa logic ngoài phạm vi prompt. Các prompt có thay đổi file nên dán thêm khối "QUY TẮC RED-TEAM VÀ KIỂM SOÁT THAY ĐỔI" của senior lên đầu.

---

## PROMPT A1: KHẢO SÁT MODEL ƯỚC LƯỢNG CƠ THỂ TỪ ẢNH (chỉ đọc, chưa cài)

```
Chỉ khảo sát, KHÔNG cài đặt, KHÔNG tải checkpoint, KHÔNG sửa code. Kết quả là một bảng so sánh để tôi chọn.

Bối cảnh: hệ thống dùng mô hình cơ thể SMPL (6.890 đỉnh). Hiện bộ ước lượng ảnh -> betas là MockBodyEstimator, không đọc nội dung ảnh. Cần một model thật. Máy: Windows 11, GTX 1650 Ti 4 GB VRAM, hiện có Python 3.14 (chưa tương thích nhiều model); dự kiến dùng venv Python 3.11.

1. Kiểm chứng (đọc README, mã nguồn, giấy phép chính thức; KHÔNG đoán) các ứng viên: BEDLAM-CLIFF, SHAPY, CameraHMR, HMR2.0 (4DHumans), TokenHMR, và thư mục Focused-human-body-measurement trong ai-service. Có thể thêm ứng viên khác nếu có lý do rõ, nêu nguồn.
2. Với mỗi ứng viên nêu:
   a) Đầu ra: SMPL hay SMPL-X, có xuất betas (shape) không, shape có điều kiện theo chiều cao hoặc cân nặng không.
   b) Có thể xuất ra SMPL cho mô hình tôi đang dùng không; nếu phải chuyển SMPL-X sang SMPL bằng công cụ chuyển đổi chính thức thì nêu thêm sai số và công cụ nào.
   c) Cách cài trên Windows (phụ thuộc, có cần biên dịch C++ hay mmcv không), phiên bản Python và PyTorch yêu cầu.
   d) Checkpoint nào cần tải, tải ở đâu, có cần đăng ký hay đồng ý giấy phép riêng không (chỉ đưa link, tôi tự tải).
   e) Giấy phép (dùng cho đồ án phi thương mại có được không) và ràng buộc kèm theo.
   f) VRAM và thời gian xử lý một ảnh trên GTX 1650 Ti 4 GB (chạy GPU và chạy CPU). Đây phải là số đo thực hoặc trích dẫn từ tài liệu chính thức; nếu chưa đo được thì ghi "chưa đo", không ước đoán.
   g) Chất lượng ước lượng shape (độ chính xác số đo) theo tài liệu hay bài báo của chính model, và có cần ảnh có người mặc đồ ôm hay không.
3. Đánh giá ngắn lợi và hại với bối cảnh của tôi (SMPL, 4 GB VRAM, Windows). Đề xuất 2 lựa chọn xếp hạng kèm lý do và rủi ro lớn nhất của mỗi lựa chọn.
4. Khi nào dùng Focused-human-body-measurement: nó xuất cái gì (số đo trực tiếp hay mesh), có hợp với quy trình hiện tại không.
Rồi dừng, chờ tôi chọn.
```

---

## PROMPT A2: TÍCH HỢP MODEL ĐÃ CHỌN VÀ CHỤP BẰNG CAMERA

Điền tên model đã chọn vào dấu ngoặc trước khi gửi.

```
Tích hợp model ước lượng đã chọn: [TÊN MODEL]. Tôi đã tự tải checkpoint vào [ĐƯỜNG DẪN]. Giữ BodyEstimator làm interface; giữ MockBodyEstimator làm dự phòng và hiển thị badge "MOCK" trên giao diện khi dùng nó.

Backend
1. Tạo venv Python 3.11 riêng cho ml_service, ghi danh sách phiên bản thư viện, KHÔNG phá môi trường hiện tại. Cài model theo đúng hướng dẫn chính thức; nếu cần chuyển SMPL-X sang SMPL thì dùng công cụ chuyển đổi chính thức và ghi rõ sai số.
2. Viết adapter PretrainedBodyEstimator: ảnh -> phát hiện người và cắt khung -> model -> betas của SMPL (kèm nhãn giới tính nếu model có). Có thể chạy CPU hoặc GPU qua biến môi trường, tự lùi về CPU khi hết VRAM.
3. Cổng chất lượng ảnh: từ chối hoặc cảnh báo khi không thấy toàn thân, người quá nhỏ trong khung, nhiều người, ảnh mờ, tư thế quá xa tư thế đứng thẳng, quần áo rộng. Trả mã lỗi và thông điệp tiếng Việt rõ ràng.
4. Chuẩn hóa chiều cao thật: KHÔNG chỉ dựa vào betas[1] (betas SMPL là thành phần PCA, không gắn riêng với chiều cao). Tìm betas gần nhất với ước lượng của model sao cho chiều cao mesh bằng chiều cao người dùng nhập (ví dụ tối ưu bình phương tối thiểu có ràng buộc, hoặc giữ tỉ lệ rồi chiếu); mô tả phương pháp và kiểm thử.
5. Gộp 2 ảnh (thẳng và nghiêng): mô tả cách gộp (trung bình betas có trọng số, hoặc trung vị) và kiểm thử với 2 ảnh cùng một người. Nếu nhận nhiều ảnh hơn thì lấy trung vị.
6. Trả về: betas, 7 số đo (cm), điểm tin cậy hoặc cảnh báo thực sự dựa trên cổng chất lượng. Không hiển thị con số tin cậy tự đặt.
7. Quyền riêng tư: ảnh chỉ xử lý trong bộ nhớ hoặc thư mục đệm và bị xóa ngay trong khối finally kể cả khi lỗi; không ghi nội dung ảnh vào log; có test.

Frontend (Angular)
8. Component chụp ảnh bằng getUserMedia (webcam hoặc camera điện thoại; lưu ý yêu cầu HTTPS hoặc localhost), khung hướng dẫn đứng toàn thân, nút chụp ảnh thẳng và ảnh nghiêng, xem lại và chụp lại, nhập chiều cao (bắt buộc) và cân nặng (tùy chọn), chọn giới tính, checkbox đồng ý xử lý ảnh trước khi gửi. Gửi POST /body/estimate; hiển thị kết quả lên người 3D và cập nhật các slider theo số đo trả về, cho người dùng chỉnh tay tiếp.
9. Xử lý lỗi và trạng thái chờ rõ ràng; tác vụ nặng dùng hàng đợi hoặc job_id kèm polling.

Nghiệm thu (có ảnh, số liệu, rồi dừng)
10. Với 3 người thật khác nhau (tôi cung cấp ảnh và số đo bằng thước dây): in betas, 7 số đo ước lượng, so với số đo thước dây, sai số TỪNG loại, thời gian xử lý. Nêu rõ nếu sai số lớn; không điều chỉnh để số liệu đẹp lên.
11. Ảnh trước và sau khi ước lượng trên người 3D. Test: ảnh tạm bị xóa, ảnh không đạt chất lượng bị từ chối đúng cách, chuẩn hóa chiều cao đạt (chênh dưới 1 cm với chiều cao nhập).
```

---

## PROMPT B: ĐÁNH GIÁ THỰC NGHIỆM

Chỉ làm sau khi bạn đã đọc và chấp nhận điều khoản sử dụng của THuman2.1.

```
Làm phần đánh giá thực nghiệm trong thư mục eval/. KHÔNG sửa logic hệ thống; chỉ thêm script đánh giá.

1. Xác định cách lấy số đo chuẩn (ground truth) từ THuman2.1 trước khi viết code, báo cáo cho tôi chọn. Lưu ý: THuman2.1 cung cấp tham số SMPL-X, còn tôi chỉ có trọng số SMPL. Các phương án: (a) đo trực tiếp trên mesh scan bằng cách cắt lát tại các mốc xác định từ khớp (cần xử lý scan ở tư thế đứng tự nhiên); (b) dựng mesh SMPL-X từ tham số (cần trọng số SMPL-X mà tôi chưa có); (c) chuyển sang SMPL bằng công cụ chuyển đổi chính thức và đo trên mesh đó. Nêu ưu, nhược, sai số có thể có của từng phương án.
2. Sau khi tôi chọn: script chọn tập con (số lượng và tiêu chí chọn ghi rõ), render ảnh thẳng và nghiêng, chạy bộ ước lượng, đo 7 số đo bằng ĐÚNG định nghĩa đã dùng ở hệ thống, so với số đo chuẩn.
3. Báo cáo sai số trung bình tuyệt đối (MAE, cm), độ lệch chuẩn và biểu đồ phân phối sai số cho từng số đo; tách theo giới tính. Lưu eval/results.csv và eval/report.md; chạy lại được bằng một lệnh.
4. So sánh ít nhất 2 model ước lượng theo interface BodyEstimator (ví dụ hai ứng viên đã xếp hạng ở bước khảo sát) trên cùng tập ảnh.
5. Độ chính xác khuyến nghị size: với bộ bảng size mẫu, so size khuyến nghị tính từ số đo ước lượng với size tính từ số đo chuẩn; báo cáo tỷ lệ trùng khớp và ma trận nhầm lẫn.
6. Đối chiếu người thật (tôi tự đo bằng thước dây theo hướng dẫn, có đồng ý): script đọc file CSV (id, giới tính, chiều cao, ngực, eo, hông, vai, dài tay), so với ước lượng từ ảnh và báo cáo tương tự. Không bịa số liệu; nếu thiếu dữ liệu thì ghi NOT RUN.
7. Ghi rõ giới hạn: kích thước mẫu, sai khác giữa ảnh render và ảnh thật, định nghĩa số đo, các nguồn lỗi. Rồi dừng.
```

---

## PROMPT C: TÍCH HỢP CUỐI, BẢO MẬT, ĐÓNG GÓI, TÀI LIỆU

```
Hoàn thiện tích hợp và đóng gói. Chỉ sửa cấu hình, bảo mật, tài liệu và lỗi tích hợp; KHÔNG đổi thuật toán, route API hay schema nếu chưa được duyệt.

1. Luồng thương mại: vào trang sản phẩm -> thử đồ 3D (lấy hồ sơ cơ thể từ ảnh hoặc nhập tay) -> chọn size theo khuyến nghị -> giỏ hàng -> thanh toán giả lập -> đơn hàng ghi đúng size. Lưu hồ sơ cơ thể (CHỈ betas và số đo, KHÔNG lưu ảnh) gắn với tài khoản, có nút xem và xóa hồ sơ. Viết kiểm thử đầu cuối cho luồng này.
2. Cấu hình: tách địa chỉ API .NET, ml_service, ai-service thành biến môi trường theo từng môi trường (dev, docker); xác minh bằng Network tab. Thay CORS "*" bằng danh sách nguồn cho phép. Không đưa bí mật vào repo; tạo .env.example không chứa khóa thật.
3. Bảo mật và giấy phép: .gitignore loại trừ trọng số SMPL, SMPL-X, THuman, checkpoint model, dữ liệu người dùng; kiểm tra file nào trong chỉ mục Git đang theo dõi các loại này và BÁO CÁO (không tự xóa, không viết lại lịch sử). README ghi rõ giấy phép phi thương mại của SMPL, SMPL-X, THuman và các model.
4. Đóng gói: Docker Compose cho frontend, shop API, ml_service (CPU và GPU), ai-service nếu còn dùng; trọng số và checkpoint gắn qua volume, không đóng vào image. Hướng dẫn chạy từ máy sạch.
5. Tài liệu: README gốc, docs/architecture (kiến trúc, luồng dữ liệu, định nghĩa số đo và quy tắc quy đổi chu vi áo), docs/api-contracts (các endpoint ML), danh sách giới hạn đã biết (sai số số đo từ ảnh đơn, mô phỏng vải chỉ đúng với chất liệu đã định nghĩa, pose corrective chưa có, bảng size mẫu là giả định).
6. Kiểm chứng từ máy sạch: chạy docker compose up và đi hết luồng ở mục 1; báo cáo PASS, FAIL, BLOCKED hoặc NOT RUN cho từng bước. Rồi dừng.
```

---

## PROMPT D (MỞ RỘNG): CAMERA BẮT CHUYỂN ĐỘNG

Dùng lại prompt Phase 3.7 trong file prompt_phase_3_6_den_5.md, thêm các chỉnh sau:

```
Bổ sung vào Phase 3.7:
- Chạy MediaPipe Pose trong Web Worker để không chặn luồng giao diện (nếu thư viện hỗ trợ; nếu không, nêu rõ cách xử lý để tránh giật).
- Ánh xạ từ điểm 3D sang xoay khớp SMPL phải giữ riêng rest pose và pose hiện tại (không tính lại bind matrix từ pose đang xoay).
- Chưa bật áo theo chuyển động nếu skinning transfer chưa qua kiểm thử 5 tư thế (vai, nách, khuỷu, cúi thân, bước chân).
- Nghiệm thu bằng video quay màn hình, kèm FPS thực đo, và xác nhận số đo trên giao diện không đổi trong lúc bắt chuyển động.
```

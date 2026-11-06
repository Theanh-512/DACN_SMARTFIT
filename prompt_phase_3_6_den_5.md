# CÁC PROMPT TIẾP THEO CHO ANTIGRAVITY (sau khi Phase 3.5 được kiểm chứng)

Thứ tự khuyến nghị: 3.6 (cơ thể điều khiển được) -> 4 (áo từ ảnh + bảng size) -> 5 (đánh giá độ vừa) -> 3.7 (camera bắt chuyển động, mở rộng) -> 6 (khuôn mặt, tùy chọn).
Gửi từng prompt một. Sau mỗi prompt, Antigravity phải dừng chờ xác nhận.

Quy tắc chung cho mọi prompt:
- Mô hình hiện tại là SMPL (6.890 đỉnh). Code phải độc lập với số đỉnh, để sau này đổi sang SMPL-X không phải làm lại.
- Số đo luôn tính trên mesh cuối cùng ở T-pose, trên da (không tính lớp đồ lót hay áo).
- Không tự tải file cần đăng ký. Không dùng nguồn tải không chính thức.
- Báo cáo phải kèm ảnh và số liệu thật cho từng tiêu chí nghiệm thu, nêu rõ tiêu chí nào chưa đạt.

---

## PROMPT PHASE 3.6: CƠ THỂ ĐIỀU KHIỂN ĐƯỢC KHỚP, DẠNG NGƯỜI, LỚP ĐỒ LÓT

```
Làm "Phase 3.6: cơ thể điều khiển được". KHÔNG làm áo, không làm camera, không làm khuôn mặt.

A. Bộ xương và xoay khớp
1. Xuất GLB có bộ xương (24 khớp theo kintree của SMPL), skin weights và 10 morph target của betas. Tư thế gốc (rest pose) là T-pose chuẩn của SMPL; tư thế hiển thị mặc định là A-pose, tạo bằng cách xoay vai, không nướng cứng vào mesh.
2. QUAN TRỌNG: khi betas đổi thì vị trí các khớp đổi theo. Phải tính lại vị trí khớp từ J_regressor nhân với mesh đã biến dạng (v_shaped) mỗi lần betas hoặc local morph đổi, rồi cập nhật bind pose (inverse bind matrices) cho SkinnedMesh. Nếu không, tư thế sẽ bị méo khi đổi dáng người. Xuất J_regressor dạng ma trận thưa (JSON hoặc binary) cho frontend.
3. Giao diện: panel "Tư thế": chọn khớp chính (cổ, đầu, vai, khuỷu, cổ tay, cột sống, hông, gối, cổ chân), mỗi khớp có slider xoay theo 3 trục với giới hạn sinh học hợp lý (ví dụ khuỷu chỉ gập một chiều). Có preset tư thế: A-pose, T-pose, đứng thẳng, dang tay, bước chân; nút "Đặt lại tư thế". Bỏ qua các khớp ngón tay.
4. SMPL không có pose corrective (posedirs) trong glTF skinning thường, nên khuỷu và gối có thể hơi méo khi gập mạnh. Chấp nhận ở mức MVP, ghi rõ trong README. Chỉ làm posedirs nếu còn thời gian và tôi yêu cầu.

B. Dạng người (béo, gầy, cơ bắp...)
5. Betas của SMPL chỉ phủ phạm vi thể hình của tập scan gốc, không đủ biểu diễn mọi dạng người. Hãy thêm "morph cục bộ" theo vùng: bụng, ngực, bắp tay, đùi, mông, vai. Mỗi morph đẩy các đỉnh trong vùng theo pháp tuyến với độ giảm dần dạng Gaussian theo khoảng cách tới điểm neo (neo xác định theo vị trí khớp và chiều cao, không theo chỉ số đỉnh cố định). Giới hạn biên độ để không méo hoặc tự cắt mesh.
6. Giao diện: thêm các slider "Bụng", "Ngực/cơ ngực", "Bắp tay", "Đùi", "Mông"; preset dạng người: Gầy, Cân đối, Thể thao (cơ bắp), Đầy đặn, Bụng to, Quả lê, Đồng hồ cát. Mỗi preset là tổ hợp betas và morph cục bộ.
7. Hồi quy số đo -> tham số (đã làm ở Phase 3.5) phải tính cả morph cục bộ. Số đo vẫn khớp slider với sai lệch dưới 1 cm ở giá trị cực trị của MỖI slider, không chỉ ở mặc định. Báo cáo bảng này.

C. Lớp đồ lót nền (như manơcanh trong ứng dụng thử đồ)
8. Nữ: áo bikini kiểu trơn, che phủ đủ, và quần lót trắng. Nam: quần lót kiểu boxer brief. Màu trắng hoặc xám nhạt, mờ đục, không họa tiết, không texture gợi cảm. Đây chỉ là lớp nền để người xem thấy rõ cơ thể khi thử áo.
9. Cách làm: chọn nhóm đỉnh theo vùng (dùng phân vùng đỉnh của SMPL nếu có, nếu không thì chọn theo skin weight chủ đạo kết hợp độ cao so với các khớp), sao chép các mặt của vùng đó thành mesh riêng, đẩy ra theo pháp tuyến 2 đến 3 mm, làm mượt đường viền. Mesh đồ lót dùng chung bộ xương, skin weights, và morph target (cắt theo tập đỉnh con) với cơ thể để tự động theo mọi thay đổi dáng người và tư thế.
10. Nút bật/tắt lớp đồ lót. Lớp đồ lót KHÔNG được đưa vào tính số đo.

D. Kiểm thử và nghiệm thu
11. Unit test: vị trí khớp sau khi đổi betas bằng J_regressor nhân v_shaped; morph cục bộ không tạo mặt lộn hoặc tự cắt; số đo khớp slider sau mọi preset.
12. Ảnh nghiệm thu, cho cả Nam và Nữ: (a) 3 tư thế (A-pose, dang tay, bước chân) chính diện và nghiêng; (b) 5 preset dạng người từ Gầy đến Bụng to; (c) có và không có lớp đồ lót; (d) cùng một tư thế nhưng đổi betas trong lúc đang pose, hình không được méo.
13. Dừng, chờ tôi xác nhận.
```

---

## PROMPT PHASE 4: ÁO 3D TỪ ẢNH VÀ BẢNG SIZE, GHÉP LÊN NGƯỜI

Lưu ý khi đọc: không có model nào dựng áo 3D đúng số đo size từ một ảnh một cách đáng tin cậy. Hướng khả thi là: bảng size (cm) quyết định kích thước, ảnh áo chỉ cung cấp màu, họa tiết và hình dáng cổ, tay.

```
Làm "Phase 4: áo 3D từ ảnh và bảng size". Thay thế kế hoạch Phase 4 cũ (áo parametric đơn giản). KHÔNG làm đánh giá độ vừa (Phase 5), không làm camera, không làm khuôn mặt.

1. Dữ liệu sản phẩm 3D (JSON, một file mỗi sản phẩm): loại áo (thun, sơ mi, cardigan, khoác...), ảnh phẳng mặt trước (tùy chọn mặt sau), bảng size XS đến XXL với số đo áo đặt phẳng (cm): ngang ngực, dài thân, rộng vai, dài tay, ngang gấu, vòng cổ; chất liệu (độ co giãn %, độ dày). Dùng số giả định cho sản phẩm mẫu và ghi rõ là giả định.
2. Bộ sinh rập: từ số đo của một size, sinh các mảnh rập 2D tham số (thân trước, thân sau, hai tay, cổ) cho từng loại áo. Tham khảo cách tổ chức rập của GarmentCode nếu giấy phép cho phép (kiểm tra trước, báo cáo cho tôi). Mỗi size ra một bộ rập riêng.
3. Từ ảnh áo: tách nền, lấy màu chủ đạo và họa tiết làm texture cho mảnh thân trước (và thân sau nếu có ảnh); không dùng model image-to-3D tổng quát vì không điều khiển được kích thước. Tùy chọn: trích silhouette từ ảnh để so tỉ lệ rộng/dài với bảng size và cảnh báo khi lệch lớn.
4. Dựng 3D: khâu các mảnh rập quanh cơ thể người dùng (T-pose hoặc A-pose) và mô phỏng vải: ưu tiên Blender headless (bpy) cloth simulation; chế độ dự phòng "push-out": đẩy đỉnh áo ra ngoài thân cho tới khi cách thân tối thiểu bằng độ dày vải, rồi làm mượt. Chọn chế độ bằng biến môi trường DRAPE_MODE; có timeout và tự lùi về push-out khi Blender lỗi. Cache kết quả theo (sản phẩm, size, hồ sơ cơ thể).
5. Hiển thị: xuất áo thành GLB riêng, ghép lên người. Để áo theo tư thế khi xoay khớp, chuyển skin weights từ đỉnh cơ thể gần nhất sang đỉnh áo; chấp nhận méo nhẹ khi gập mạnh và ghi rõ giới hạn.
6. Giao diện quản trị: trang "Tạo áo 3D" cho một sản phẩm: tải ảnh, chọn loại, nhập bảng size, bấm "Tạo áo 3D", xem trước từng size XS đến XXL trên người mẫu. Giao diện người dùng: chọn size thì người mặc áo size đó.
7. Đánh giá thêm (không bắt buộc, chỉ báo cáo, đừng cài): các nghiên cứu ảnh sang rập hoặc áo (ví dụ SewFormer, NeuralTailor, DressCode, ChatGarment). Với mỗi cái nêu: đầu vào, giấy phép, VRAM, có chạy được trên GTX 1650 Ti 4 GB không. Chỉ để tôi quyết định có đưa vào phần nghiên cứu mở rộng hay không.
8. Nghiệm thu, rồi dừng: (a) hai sản phẩm mẫu (áo thun, cardigan); (b) ảnh người Nam và Nữ mặc size S, M, L, XL; (c) bảng so sánh số đo đo trực tiếp trên mesh áo (ngang ngực, dài thân, dài tay) với bảng size, sai lệch trong 1 cm; (d) ảnh người cao 1m80 mặc size S cho thấy áo bị căng; (e) áo không xuyên thân, mô tả kiểm tra va chạm và kết quả.
```

---

## PROMPT PHASE 5: ĐÁNH GIÁ ĐỘ VỪA

Dùng lại nguyên prompt Phase 5 và fit_advisor đã đưa trước đó, chỉ đổi hai điểm: số đo áo lấy từ mesh áo đã dựng (không chỉ từ bảng size), và heatmap tính từ khoảng cách đỉnh áo tới thân. Khối "AI tư vấn kích cỡ" trên giao diện phải nối với /fit/evaluate thật, bỏ giá trị "độ tin cậy 85%" điền sẵn.

---

## PROMPT PHASE 3.7: CAMERA BẮT CHUYỂN ĐỘNG (MỞ RỘNG, LÀM SAU PHASE 5)

```
Làm "Phase 3.7: camera bắt chuyển động". Đây là module TÁCH BIỆT với module chụp ảnh lấy dáng người.

1. Tách rõ hai module: (a) shape-capture: chụp ảnh tĩnh, ước lượng betas và số đo, chỉ chạy khi người dùng bấm chụp; (b) pose-tracker: chạy liên tục để điều khiển các khớp. Pose-tracker KHÔNG được thay đổi betas, morph cục bộ hay số đo.
2. pose-tracker dùng MediaPipe Pose (Tasks Vision) chạy ngay trong trình duyệt. Lấy các điểm 3D (world landmarks), ánh xạ sang xoay khớp của bộ xương SMPL cho các khớp chính (cổ, vai, khuỷu, cổ tay, hông, gối, cổ chân, cột sống, đầu) bằng cách tính xoay từ hướng của từng xương; bỏ ngón tay. Làm mượt chuyển động (One Euro filter hoặc EMA); giới hạn góc theo giới hạn sinh học đã dùng ở Phase 3.6.
3. Hai chế độ: "Gương" (người 3D bắt chước theo camera) và "Thủ công" (dùng slider khớp). Có nút tạm dừng bắt chuyển động.
4. Quyền riêng tư: xử lý khung hình hoàn toàn trong trình duyệt, không gửi video lên server, không lưu video. Cần checkbox đồng ý trước khi bật camera.
5. Hiệu năng: giảm độ phân giải đầu vào còn khoảng 640x480; mục tiêu từ 20 FPS trở lên trên laptop có GTX 1650 Ti.
6. Giới hạn cần ghi trong README: không bắt được xoay dọc trục xương (twist), độ sâu có nhiễu, bắt kém khi quay người nghiêng hoặc quay lưng.
7. Nghiệm thu, rồi dừng: video quay màn hình cho thấy người 3D bắt chước giơ tay, dang tay, bước chân; xác nhận số đo trên giao diện không đổi trong lúc tracking.
```

---

## PHASE 6: KHUÔN MẶT (TÙY CHỌN, LÀM CUỐI CÙNG)

SMPL không có khuôn mặt hay ngón tay có thể biểu cảm. Có ba hướng, chọn một:

- A (khuyến nghị, rẻ nhất): đầu trung tính theo màu da đã chọn, đủ cho đồ án vì giá trị chính là thân người và size.
- B: chuyển sang SMPL-X (có đầu theo FLAME, có bàn tay). Cần tải trọng số SMPL-X riêng; code Phase 3.6 đến 5 đã độc lập số đỉnh nên đổi được, nhưng phải sinh lại GLB, hồi quy và đồ lót.
- C: chiếu ảnh chân dung làm texture lên đầu. Phức tạp, rủi ro quyền riêng tư cao, nên để sau cùng hoặc bỏ.

Chỉ khi chọn B hoặc C mới soạn prompt riêng.

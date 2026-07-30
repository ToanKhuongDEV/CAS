# CAS — Edge cases và cách xử lý

## 1. Mục đích

Tài liệu này lưu lại các trường hợp biên của hệ thống và hướng xử lý nghiệp vụ.

Các trường hợp đã chốt sẽ được đánh dấu `Đã chốt`. Các trường hợp còn cần xác nhận sẽ được đánh dấu `Cần chốt` để tránh tự ý biến giả định thành thiết kế chính thức.

## 2. Nguyên tắc chung

- Không làm mất dữ liệu order, payment hoặc audit log.
- Không xóa vật lý order và payment.
- Dữ liệu tính tiền phải dựa trên giá đã ghi nhận trong `order_items`, không lấy lại giá menu hiện tại.
- Các thao tác quan trọng của nhân viên/admin phải ghi `audit_logs`.
- Backend không tin dữ liệu nhạy cảm do client gửi lên như role, account xác nhận payment hoặc tổng tiền.

## 3. QR bàn không hợp lệ

**Trạng thái:** Đã chốt

### Tình huống

Khách quét QR nhưng token không tồn tại, đã bị thu hồi hoặc không còn `ACTIVE`.

### Cách xử lý

- Không tạo table session.
- Hiển thị thông báo QR không hợp lệ.
- Ghi log lỗi nếu cần theo dõi vận hành.

## 4. Bàn bị inactive

**Trạng thái:** Đã chốt

### Tình huống

QR hợp lệ nhưng bàn đang `INACTIVE`.

### Cách xử lý

- Không cho tạo session mới.
- Hiển thị thông báo bàn tạm thời không phục vụ.
- Admin/operator cần kích hoạt lại bàn nếu muốn nhận khách.

## 5. Nhiều thiết bị cùng quét một QR

**Trạng thái:** Đã chốt

### Tình huống

Nhiều khách tại cùng bàn quét cùng QR.

### Cách xử lý

- Tất cả dùng chung table session đang `OPEN`.
- Tất cả nhìn thấy cùng danh sách order của session.
- Chỉ người đầu tiên mở session bàn cần nhập tên và số điện thoại.
- Người quét QR sau trong cùng session không cần nhập lại thông tin.
- Thông tin người đầu tiên được lưu trong `client_accounts` và gắn với session.
- Khi tạo session cần chống race condition để một bàn không bao giờ có nhiều hơn một session `OPEN` tại cùng một thời điểm.

## 5.1. Khách đầu tiên không nhập tên hoặc số điện thoại

**Trạng thái:** Đã chốt

### Tình huống

Bàn chưa có session đang mở, khách đầu tiên quét QR nhưng bỏ qua hoặc nhập thiếu tên/SĐT.

### Cách xử lý

- Không tạo session mới nếu thiếu tên hoặc số điện thoại.
- Hiển thị form yêu cầu nhập đủ thông tin.
- Chỉ sau khi có đủ tên và số điện thoại mới tạo hoặc tìm `client_accounts`, tạo session và mở menu.

## 6. Khách gửi order nhiều lần

**Trạng thái:** Đã chốt

### Tình huống

Khách gọi món lần đầu, sau đó gọi thêm.

### Cách xử lý

- Mỗi lần khách bấm gửi món tạo một `orders` mới.
- Các món của lần gửi đó nằm trong `order_items`.
- Không cộng món mới vào order cũ.

## 7. Khách bấm gửi order lặp do mạng chậm

**Trạng thái:** Đã chốt

### Tình huống

Khách bấm gửi order nhiều lần vì mạng chậm, hoặc frontend retry request.

### Cách xử lý

- Frontend bắt buộc gửi kèm một `idempotency_key` cho mỗi lần submit order.
- Phạm vi duy nhất của key là trong cùng một table session.
- Backend lưu `idempotency_key` bền vững trong `orders`; Redis không phải nguồn dữ liệu chính cho cơ chế này.
- Backend chuẩn hóa payload order, tính SHA-256 và lưu kết quả vào `orders.request_fingerprint`; client không gửi fingerprint.
- Database đặt unique constraint cho `table_session_id + idempotency_key` để chống tạo order trùng khi có request đồng thời.
- Nếu request lặp lại với cùng key và cùng fingerprint, backend trả về order đã tạo trước đó.
- Nếu request dùng lại cùng key nhưng fingerprint khác, backend từ chối với HTTP `409 Conflict`.
- Key gắn với order và không cần TTL.

## 8. Món hết hàng sau khi khách đã mở menu

**Trạng thái:** Đã chốt

### Tình huống

Khách mở menu thấy món còn bán, nhưng trước khi gửi order thì nhân viên chuyển món sang `SOLD_OUT` hoặc `INACTIVE`.

### Cách xử lý

- Backend kiểm tra lại trạng thái món tại thời điểm submit order.
- Nếu món không còn được bán, từ chối dòng món đó.
- Frontend thông báo khách chọn món khác.

## 9. Giá menu thay đổi sau khi khách đã gọi món

**Trạng thái:** Đã chốt

### Tình huống

Admin đổi giá món sau khi khách đã đặt.

### Cách xử lý

- Không cập nhật lại giá trong order cũ.
- Bill/payment về sau dùng giá gốc và tổng tiền đã lưu trong `order_items`, cùng các snapshot option trong `order_item_options`.
- Giá mới chỉ áp dụng cho order tạo sau thời điểm đổi giá.

## 10. Option không hợp lệ

**Trạng thái:** Đã chốt

### Tình huống

Khách gửi option thiếu lựa chọn bắt buộc, vượt `max_select`, hoặc option đã bị inactive.

### Cách xử lý

- Backend validate option khi submit order.
- Backend kiểm tra `option_group_item_id` thuộc option group của đúng món chính, liên kết và menu item option đều đang hoạt động.
- Nếu option không hợp lệ, không tạo order.
- Frontend yêu cầu khách chọn lại.

## 11. Yêu cầu hủy món vượt quá số lượng

**Trạng thái:** Đã chốt

### Tình huống

Khách yêu cầu hủy số lượng lớn hơn số lượng còn lại của dòng món.

### Cách xử lý

- Không tạo hoặc không duyệt yêu cầu hủy không hợp lệ.
- Nếu yêu cầu hợp lệ, tạo `order_item_cancellation_requests` với `public_id` và `idempotency_key`.
- Nhân viên duyệt hoặc từ chối.
- Khi duyệt, hệ thống giữ nguyên số lượng và thành tiền gốc trong `order_items`.
- Số lượng đã hủy được tính từ tổng `requested_quantity` của các yêu cầu `APPROVED`; hệ thống dùng số lượng còn lại để tính lại tổng tiền order.
- Việc kiểm tra và duyệt phải chạy trong transaction để tổng số lượng hủy đã duyệt không vượt quá `order_items.quantity` khi có xử lý đồng thời.
- Chỉ tạo hoặc xử lý yêu cầu hủy khi session còn `OPEN`; không cho yêu cầu thanh toán nếu còn yêu cầu hủy `PENDING`.

## 12. Khách yêu cầu thanh toán rồi muốn gọi thêm

**Trạng thái:** Đã chốt

### Tình huống

Session đã chuyển sang `PAYMENT_PENDING` nhưng khách muốn gọi thêm món.

### Cách xử lý

- Không nhận thêm order vào session cũ.
- Session `PAYMENT_PENDING` không chiếm dụng bàn và không ngăn việc tạo session `OPEN` mới cho cùng bàn.
- Nếu khách tiếp tục gọi món, hệ thống tạo session `OPEN` mới.
- Order/payment của session mới không gộp với session cũ.

## 13. Người tạo QR khác người xác nhận thanh toán

**Trạng thái:** Đã chốt

### Tình huống

Nhân viên A tạo QR, nhân viên B muốn xác nhận payment.

### Cách xử lý

- Không cho xác nhận thay.
- Backend lấy account xác nhận từ token/session đăng nhập.
- Khi confirm payment, `confirmed_by` phải bằng `qr_created_by`.
- Nên có constraint hoặc check ở database: `confirmed_by IS NULL OR confirmed_by = qr_created_by`.

## 14. Payment pending không được thanh toán

**Trạng thái:** Đã chốt

### Tình huống

Payment đã tạo QR nhưng khách chưa chuyển tiền, chuyển thiếu hoặc sai nội dung.

### Cách xử lý

- Payment giữ trạng thái `PENDING`.
- Payment `PENDING` không tự hết hạn.
- Nhân viên không được hủy payment.
- Nhân viên chỉ được đánh dấu payment là `IGNORED`.
- Payment `IGNORED` không bị xóa và chỉ đại diện cho một lần thử thanh toán đã kết thúc.
- Khi đánh dấu `IGNORED`, hệ thống tạo hoặc sử dụng một `unpaid_records` trạng thái `OPEN`, sao chép `amount` và `bill_snapshot` từ payment nếu khoản chưa thanh toán chưa tồn tại, rồi liên kết payment với khoản đó.
- Báo cáo công nợ chỉ tính `unpaid_records`; không cộng riêng payment `IGNORED`.

## 15. Khách trốn về trước khi tạo payment

**Trạng thái:** Đã chốt

### Tình huống

Khách đã gọi món, hệ thống đã có `orders` và `order_items`, nhưng khách rời đi trước khi yêu cầu thanh toán hoặc trước khi nhân viên tạo VietQR.

### Vấn đề

Chưa có `payments`, nên nếu thiết kế chỉ lưu `bill_snapshot` trong payment thì chưa có snapshot tại thời điểm khách rời đi.

Tuy nhiên, dữ liệu tính tiền vẫn còn trong `order_items`:

- `item_name`
- `unit_price`
- `options_amount`
- `quantity`
- `total_amount`

Chi tiết option của từng dòng món vẫn còn trong `order_item_options`.

### Cách xử lý đã chốt

- Không bắt buộc tạo payment ngay khi phát hiện khách rời đi chưa thanh toán.
- Tạo một bản ghi trong bảng `unpaid_records` liên kết duy nhất với table session.
- Tạo `bill_snapshot` và ghi nhận tổng tiền trong `unpaid_records` từ dữ liệu đã chốt của `orders` và `order_items` tại thời điểm ghi nhận khách chưa thanh toán.
- `bill_snapshot` trong `unpaid_records` là bất biến.
- Đóng table session để giải phóng bàn với `status = CLOSED` và lưu `closed_at`.
- Bản ghi `unpaid_records` bắt đầu ở trạng thái `OPEN` và được đưa vào màn hình theo dõi riêng cho admin.
- Ghi người thực hiện, thời điểm, lý do và audit log khi ghi nhận khoản chưa thanh toán.
- Khi cần thu tiền sau, admin tạo payment mới liên kết với `unpaid_records`; `amount` và `bill_snapshot` của payment được lấy từ bản ghi chưa thanh toán đã chốt.
- Payment vẫn lưu `bill_snapshot` riêng để ghi nhận chính xác nội dung của lần tạo VietQR đó.
- Khi payment mới được xác nhận `PAID`, chuyển `unpaid_records` sang `RESOLVED`; không lưu cờ thanh toán trong table session.
- Không tính lại theo giá menu hiện tại.

## 16. Tạo lại thanh toán sau khi payment bị ignored

**Trạng thái:** Đã chốt

### Tình huống

Payment đã từng được tạo QR nhưng bị đánh dấu `IGNORED`. Sau đó khách quay lại hoặc cửa hàng liên hệ được khách để thu tiền.

### Cách xử lý đã chốt

- Không sửa payment `IGNORED` gốc.
- Payment `IGNORED` chỉ là lịch sử của một lần thử thanh toán, không phải một khoản công nợ độc lập.
- Payment `IGNORED` phải liên kết với một `unpaid_records` trạng thái `OPEN`.
- Admin tạo payment mới từ `unpaid_records`, không tạo trực tiếp từ dữ liệu order hoặc coi payment cũ là nguồn công nợ.
- Payment mới có `reference_code` mới theo dạng `CAS_` + UUID.
- Payment mới có VietQR mới.
- Payment mới sao chép `amount` và `bill_snapshot` bất biến từ `unpaid_records`.
- Payment mới và các payment `IGNORED` cũ cùng liên kết với `unpaid_records`; lịch sử được sắp xếp theo `created_at`.
- Khi payment mới được xác nhận `PAID`, hệ thống chuyển `unpaid_records` sang `RESOLVED`.
- Báo cáo khoản còn phải thu chỉ dựa trên `unpaid_records` trạng thái `OPEN`.

## 17. Trùng reference code

**Trạng thái:** Đã chốt

### Tình huống

UUID gần như không trùng, nhưng database vẫn cần bảo vệ.

### Cách xử lý

- `payments.reference_code` có unique constraint.
- Nếu insert bị trùng, backend sinh UUID mới và thử lại.
- Không tái sử dụng `reference_code`.

## 18. Khách chuyển khoản đúng tiền nhưng sai nội dung

**Trạng thái:** Đã chốt

### Tình huống

Khách chuyển đúng số tiền nhưng nội dung chuyển khoản không khớp `reference_code`.

### Cách xử lý

- Nhân viên không xác nhận payment là `PAID`.
- Payment giữ `PENDING`.
- Nhân viên xử lý ngoài hệ thống hoặc đánh dấu `IGNORED` nếu cần bỏ qua payment này.
- Ghi audit log nếu có thao tác bỏ qua.

## 19. Khách chuyển thiếu tiền

**Trạng thái:** Đã chốt

### Tình huống

Khách chuyển khoản thiếu so với số tiền trên payment.

### Cách xử lý

- Không xác nhận payment là `PAID`.
- Payment giữ `PENDING`.
- Nhân viên yêu cầu khách chuyển đủ với đúng nội dung.
- Nếu không xử lý tiếp payment đó, đánh dấu `IGNORED`.

## 20. Payment đã paid nhưng thao tác confirm bị bấm lại

**Trạng thái:** Đã chốt

### Tình huống

Nhân viên bấm xác nhận nhiều lần hoặc request bị retry.

### Cách xử lý

- Confirm payment cần idempotent.
- Nếu payment đã `PAID`, backend trả về trạng thái hiện tại, không tạo audit log trùng.
- Không cập nhật lại `confirmed_at`.

## 21. Session đã đóng nhưng khách quét lại QR

**Trạng thái:** Đã chốt

### Tình huống

Khách hoặc lượt khách mới quét lại QR sau khi session cũ đã `CLOSED`.

### Cách xử lý

- Không mở lại session cũ.
- Nếu bàn không có session `OPEN`, hệ thống tạo session mới.
- QR bàn vẫn là QR cố định.

## 22. Các edge case cần bổ sung sau

- Mất kết nối khi đang submit order.
- Mất kết nối khi đang tạo QR.
- Nhân viên đổi trạng thái món trong lúc khách đang chọn option.
- Admin đổi thông tin tài khoản ngân hàng khi đang có payment `PENDING`.
- Bàn bị chuyển sang `INACTIVE` khi đang có session mở.
- Khách thanh toán nhầm sang nội dung của payment cũ.

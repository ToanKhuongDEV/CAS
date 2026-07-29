# CAS — Mô tả nghiệp vụ từng luồng

## 1. Mục đích

Tài liệu mô tả các luồng nghiệp vụ chính của MVP 1 ở mức hành vi hệ thống, tác nhân tham gia, trạng thái liên quan và kết quả mong đợi.

Chi tiết bảng dữ liệu nằm trong `DATABASE_DESIGN.md`. Tài liệu này tập trung vào cách người dùng và hệ thống tương tác trong từng luồng.

## 2. Phạm vi

Các luồng thuộc MVP 1:

- Đăng nhập khu vực vận hành.
- Quét QR và mở phiên bàn.
- Xem menu.
- Gọi món.
- Gọi thêm món.
- Yêu cầu hủy món.
- Yêu cầu thanh toán.
- Ghi nhận khách rời đi chưa thanh toán.
- Nhân viên tạo VietQR.
- Nhân viên xác nhận thanh toán thủ công.
- Đóng phiên bàn.

Ngoài phạm vi MVP 1:

- Phân quyền chi tiết ngoài ba role cơ bản.
- Tách hóa đơn.
- Tự động xác nhận giao dịch qua webhook ngân hàng.
- Tự động hết hạn payment đang chờ thanh toán.
- Màn hình bếp/phục vụ riêng.
- Theo dõi trạng thái chế biến từng món.

## 3. Tác nhân và role

| Tác nhân | Mô tả |
|---|---|
| Khách hàng | Quét QR, xem menu, gửi order, yêu cầu hủy món và yêu cầu thanh toán |
| `ADMIN` | Quản trị cấu hình hệ thống và dữ liệu vận hành |
| `OPERATOR` | Xử lý order, tạo VietQR và xác nhận thanh toán |
| `USER` | Tài khoản sử dụng thông thường khi cần đăng nhập vào hệ thống |

MVP 1 chỉ phân quyền theo role `ADMIN`, `USER` và `OPERATOR`, chưa có permission chi tiết theo từng chức năng.

Tài khoản nội bộ của quán được lưu trong `accounts`. Thông tin khách hàng nhập khi mở bàn được lưu riêng trong `client_accounts`.

## 4. Luồng đăng nhập khu vực vận hành

### Mục tiêu

Cho phép tài khoản hợp lệ truy cập giao diện vận hành.

### Luồng chính

1. Người dùng nhập username và password.
2. Hệ thống kiểm tra tài khoản trong `accounts`.
3. Hệ thống kiểm tra trạng thái tài khoản là `ACTIVE`.
4. Hệ thống xác thực password.
5. Hệ thống tạo phiên đăng nhập hoặc token truy cập.
6. Hệ thống ghi nhận `last_login_at`.
7. Người dùng được chuyển vào giao diện vận hành phù hợp với role.

### Quy tắc nghiệp vụ

- Tài khoản `INACTIVE` không được đăng nhập.
- Password luôn được lưu bằng `password_hash`, không lưu password thô.
- Role được lấy từ backend theo tài khoản đăng nhập, client không được tự gửi role để quyết định quyền.

## 5. Luồng quét QR và mở phiên bàn

### Mục tiêu

Khách hàng quét QR tại bàn để truy cập đúng bàn và dùng chung phiên bàn đang mở.

### Luồng chính

1. Khách hàng quét QR tại bàn.
2. QR dẫn tới đường dẫn chứa `table_qr_codes.token`.
3. Hệ thống kiểm tra token tồn tại và có trạng thái `ACTIVE`.
4. Hệ thống xác định `dining_tables` tương ứng.
5. Nếu bàn đang có `table_sessions` trạng thái `OPEN`, hệ thống trả về session hiện tại.
6. Nếu bàn chưa có session đang mở, hệ thống yêu cầu khách đầu tiên nhập tên và số điện thoại.
7. Hệ thống tìm `client_accounts` theo số điện thoại trong cửa hàng hiện tại.
8. Nếu chưa có, hệ thống tạo `client_accounts` mới.
9. Hệ thống tạo `table_sessions` mới với trạng thái `OPEN`, `is_paid = false`, gắn `client_account_id` và lưu snapshot tên/SĐT người mở phiên bàn.
10. Khách hàng được chuyển tới màn hình menu của bàn.

### Quy tắc nghiệp vụ

- Một bàn chỉ có một QR đang hoạt động tại một thời điểm.
- Chỉ session ở trạng thái `OPEN` mới được xem là đang chiếm dụng bàn.
- Session ở trạng thái `PAYMENT_PENDING` không ngăn việc tạo một session `OPEN` mới cho cùng bàn.
- Việc tạo session `OPEN` phải an toàn khi có xử lý đồng thời, bảo đảm một bàn không bao giờ có nhiều hơn một session `OPEN` tại cùng một thời điểm.
- Người đầu tiên mở session bàn phải nhập tên và số điện thoại.
- Tên và số điện thoại này được lưu trong `client_accounts`, tách riêng với `accounts` của nhân viên/admin.
- Nhiều điện thoại quét cùng QR sau đó sẽ dùng chung session, không cần nhập lại thông tin khách và nhìn thấy cùng danh sách order.
- QR bàn là mã cố định được in và dán tại bàn.

### Ngoại lệ

- Token không tồn tại hoặc đã bị thu hồi: hiển thị lỗi QR không hợp lệ.
- Bàn `INACTIVE`: không cho tạo session mới.

## 6. Luồng xem menu

### Mục tiêu

Khách hàng xem danh mục, món và tùy chọn món đang bán.

### Luồng chính

1. Khách hàng mở menu từ session bàn.
2. Hệ thống lấy danh sách `categories` đang hiển thị.
3. Hệ thống lấy danh sách `menu_items` theo danh mục.
4. Hệ thống trả về thông tin món, giá hiện tại, hình ảnh, trạng thái còn/hết món và các option nếu có.
5. Khách hàng chọn món và tùy chọn.

### Quy tắc nghiệp vụ

- Món `SOLD_OUT` vẫn có thể hiển thị nhưng không được chọn để đặt.
- Món `INACTIVE` không hiển thị cho khách.
- Mỗi món chỉ có một ảnh.
- Giá tại thời điểm khách gửi order sẽ được ghi lại vào `order_items`, không phụ thuộc vào giá menu thay đổi sau đó.

## 7. Luồng gọi món

### Mục tiêu

Khách hàng gửi một order mới trong session bàn.

### Luồng chính

1. Khách hàng chọn một hoặc nhiều món.
2. Khách hàng chọn option bắt buộc nếu món có cấu hình.
3. Khách hàng nhập ghi chú nếu cần.
4. Khách hàng gửi order.
5. Hệ thống kiểm tra session còn `OPEN`.
6. Hệ thống kiểm tra món còn bán và option hợp lệ.
7. Hệ thống tạo một bản ghi `orders`.
8. Hệ thống tạo các dòng `order_items`.
9. Hệ thống tính `subtotal_amount` và `total_amount`.
10. Hệ thống trả về order đã tạo và cập nhật danh sách order của session.

### Quy tắc nghiệp vụ

- Mỗi lần khách gửi món tạo một order riêng.
- Một session có thể có nhiều order.
- Order không cần bước xác nhận trước khi cửa hàng xử lý.
- MVP 1 không theo dõi trạng thái chế biến của order hoặc từng món.
- `item_name`, `unit_price` và `selected_options` trong `order_items` là dữ liệu đã chốt tại thời điểm khách gửi order.

### Ngoại lệ

- Session không còn `OPEN`: không cho gửi order.
- Món hết hàng hoặc không tồn tại: từ chối dòng món tương ứng.
- Option bắt buộc chưa chọn hoặc vượt quá `max_select`: không cho gửi order.

## 8. Luồng gọi thêm món

### Mục tiêu

Khách hàng gọi thêm món trong cùng phiên bàn trước khi yêu cầu thanh toán.

### Luồng chính

1. Khách hàng tiếp tục mở menu từ QR hoặc từ màn hình hiện tại.
2. Hệ thống xác định session đang `OPEN` của bàn.
3. Khách hàng chọn thêm món.
4. Khách hàng gửi order.
5. Hệ thống tạo một `orders` mới trong cùng `table_sessions`.
6. Hệ thống cập nhật danh sách order của phiên bàn.

### Quy tắc nghiệp vụ

- Gọi thêm không cộng dòng món vào order cũ.
- Gọi thêm luôn tạo order mới trong cùng session.
- Nếu session đã chuyển sang chờ thanh toán, hệ thống không nhận thêm món vào session đó.

## 9. Luồng yêu cầu hủy món

### Mục tiêu

Khách hàng gửi yêu cầu hủy một phần hoặc toàn bộ số lượng của một dòng món, nhân viên quyết định đồng ý hoặc từ chối.

### Luồng chính

1. Khách hàng chọn dòng món muốn hủy.
2. Khách hàng nhập số lượng muốn hủy và lý do nếu có.
3. Hệ thống tạo `order_item_cancellation_requests` với trạng thái `PENDING`.
4. Nhân viên xem yêu cầu hủy trong giao diện vận hành.
5. Nhân viên chọn đồng ý hoặc từ chối.
6. Nếu đồng ý, hệ thống cập nhật số lượng hoặc loại bỏ dòng món khỏi phần tính tiền.
7. Hệ thống tính lại tổng tiền order.
8. Hệ thống lưu người xử lý, tên người xử lý và thời điểm xử lý.
9. Hệ thống ghi audit log cho thao tác xử lý yêu cầu hủy.

### Quy tắc nghiệp vụ

- Yêu cầu hủy món phải được nhân viên đồng ý hoặc từ chối.
- Yêu cầu bị từ chối không làm thay đổi tổng tiền.
- Không cho hủy quá số lượng còn lại của dòng món.
- Không xử lý hủy món khi table session đã `CLOSED` hoặc `is_paid = true`.

## 10. Luồng yêu cầu thanh toán

### Mục tiêu

Khách hàng báo muốn thanh toán toàn bộ các order trong phiên bàn.

### Luồng chính

1. Khách hàng bấm yêu cầu thanh toán.
2. Hệ thống kiểm tra session đang `OPEN`.
3. Hệ thống kiểm tra session có ít nhất một order cần thanh toán.
4. Hệ thống chuyển session sang `PAYMENT_PENDING`.
5. Hệ thống thông báo yêu cầu thanh toán cho giao diện vận hành.

### Quy tắc nghiệp vụ

- Thanh toán áp dụng cho toàn bộ các order của phiên bàn.
- MVP 1 chưa hỗ trợ tách hóa đơn.
- `bill_snapshot` được tạo khi nhân viên tạo payment/VietQR.
- Khi session đã `PAYMENT_PENDING`, khách không thể gọi thêm món vào session đó.
- Nếu khách tiếp tục gọi món sau khi yêu cầu thanh toán, hệ thống tạo session `OPEN` mới cho cùng bàn, không gộp với session cũ.
- Session `PAYMENT_PENDING` không chiếm dụng bàn và không ngăn việc tạo session `OPEN` mới.
- `orders` không có trạng thái riêng trong MVP 1; trạng thái chờ thanh toán nằm ở `table_sessions.status`.

## 11. Luồng ghi nhận khách rời đi chưa thanh toán

### Mục tiêu

Ghi nhận trường hợp khách rời đi trước khi yêu cầu thanh toán hoặc trước khi nhân viên tạo QR.

### Tình huống điển hình

Khách gọi món xong nhưng rời khỏi quán mà chưa bấm yêu cầu thanh toán. Vì chưa có payment, hệ thống chưa có `bill_snapshot`, nhưng vẫn còn dữ liệu tính tiền trong `orders` và `order_items`.

### Luồng chính

1. Nhân viên hoặc admin mở session của bàn chưa thanh toán.
2. Người dùng chọn ghi nhận khách chưa thanh toán.
3. Hệ thống kiểm tra session chưa thanh toán và có order.
4. Hệ thống ghi nhận trạng thái chưa thanh toán theo phương án sẽ được chốt trong `EDGE_CASES.md`.
5. Hệ thống ghi audit log thao tác ghi nhận khách chưa thanh toán.
6. Khoản chưa thanh toán được đưa vào màn hình thống kê riêng cho admin.

### Quy tắc nghiệp vụ

- Luồng này dùng khi chưa có payment/VietQR.
- Cách lưu trạng thái chưa thanh toán còn cần chốt.
- Không cần tạo payment ngay nếu chưa thu được tiền.
- Khi cần tạo payment sau này, hệ thống có thể dựng bill từ `orders` và `order_items` đã chốt giá.
- Không tính lại theo giá menu hiện tại.

## 12. Luồng nhân viên tạo VietQR

### Mục tiêu

Nhân viên tạo QR thanh toán cho một phiên bàn với số tiền và nội dung chuyển khoản duy nhất.

### Luồng chính

1. Nhân viên mở danh sách session đang `PAYMENT_PENDING`.
2. Nhân viên chọn session cần thanh toán.
3. Hệ thống gom toàn bộ order trong session.
4. Hệ thống tạo `bill_snapshot` từ `orders` và `order_items`.
5. Hệ thống lấy tài khoản ngân hàng nhận tiền từ `stores`.
6. Hệ thống sinh `reference_code` theo dạng `CAS_` + UUID.
7. Hệ thống tạo `payments` với trạng thái `PENDING`.
8. Hệ thống lưu `qr_created_by` và `qr_created_at`.
9. Hệ thống hiển thị VietQR trên web hoặc thiết bị của nhân viên.

### Quy tắc nghiệp vụ

- VietQR chỉ hiển thị trên web hoặc thiết bị của nhân viên.
- VietQR không hiển thị trực tiếp trên web khách hàng.
- `reference_code` là duy nhất và không tái sử dụng cho payment khác.
- MVP 1 tạm thời mỗi cửa hàng chỉ dùng một tài khoản ngân hàng nhận tiền.
- `bill_snapshot` nằm trong payment và không thay đổi trong vòng đời payment đó.
- Payment `PENDING` không tự hết hạn.

## 13. Luồng xác nhận thanh toán thủ công

### Mục tiêu

Nhân viên xác nhận payment sau khi kiểm tra giao dịch ngân hàng.

### Luồng chính

1. Khách hàng chuyển khoản theo VietQR.
2. Khách hàng báo đã chuyển khoản.
3. Tài khoản đã tạo QR kiểm tra ứng dụng ngân hàng.
4. Nhân viên đối chiếu số tiền và nội dung chuyển khoản.
5. Nếu đúng, nhân viên xác nhận đã nhận tiền.
6. Hệ thống kiểm tra tài khoản đang xác nhận trùng với `qr_created_by`.
7. Hệ thống cập nhật payment sang `PAID`.
8. Hệ thống lưu `confirmed_by`, `confirmed_by_name` và `confirmed_at`.
9. Hệ thống cập nhật table session: `is_paid = true`, `status = CLOSED` và lưu `closed_at`.
10. Hệ thống ghi audit log xác nhận thanh toán.

### Quy tắc nghiệp vụ

- Nhân viên khác không được xác nhận thay người đã tạo QR.
- Backend phải lấy tài khoản xác nhận từ phiên đăng nhập hoặc token, không nhận `confirmed_by` từ client.
- Khi xác nhận thanh toán, `confirmed_by` phải bằng `qr_created_by`.
- Nếu chưa nhận được tiền, chuyển thiếu hoặc sai nội dung, payment giữ nguyên `PENDING`.
- MVP 1 không tự động xác nhận giao dịch qua webhook ngân hàng.

## 14. Luồng đánh dấu payment bỏ qua

### Mục tiêu

Cho phép nhân viên bỏ qua một payment không được dùng để hoàn tất thanh toán, nhưng vẫn giữ dữ liệu để admin thống kê.

### Luồng chính

1. Nhân viên mở payment đang `PENDING`.
2. Nhân viên chọn đánh dấu bỏ qua.
3. Nhân viên nhập lý do nếu cần.
4. Hệ thống cập nhật payment sang `IGNORED`.
5. Hệ thống lưu `ignored_by`, `ignored_by_name`, `ignored_reason` và `ignored_at`.
6. Hệ thống ghi audit log thao tác đánh dấu bỏ qua.
7. Payment `IGNORED` được đưa vào màn hình thống kê riêng cho admin.

### Quy tắc nghiệp vụ

- Payment `PENDING` không tự hết hạn.
- Nhân viên không được hủy payment.
- Đánh dấu bỏ qua không xóa payment.
- Payment `IGNORED` không được coi là đã thanh toán.
- Admin có thể xem và thống kê các payment bị bỏ qua ở một màn hình riêng.

## 15. Luồng tạo lại thanh toán từ payment bỏ qua

### Mục tiêu

Cho phép admin tạo QR thanh toán mới từ payment đã bị đánh dấu `IGNORED`.

### Tình huống điển hình

Khách rời đi hoặc trốn thanh toán sau khi đã từng tạo QR. Payment cũ được đánh dấu `IGNORED`. Sau một vài ngày, nếu cửa hàng liên hệ được khách hoặc khách quay lại, admin mở màn hình thống kê và tạo QR mới để thu tiền.

### Luồng chính

1. Admin mở màn hình thống kê payment `IGNORED`.
2. Admin chọn payment cần thu lại.
3. Hệ thống tạo payment mới trong `payments`.
4. Hệ thống gán `recreated_from_payment_id` trỏ tới payment `IGNORED` gốc.
5. Hệ thống sinh `reference_code` mới theo dạng `CAS_` + UUID.
6. Hệ thống tạo VietQR mới từ tài khoản ngân hàng của cửa hàng, số tiền cần thu và `reference_code` mới.
7. Admin đưa QR mới cho khách thanh toán.
8. Nếu nhận đúng tiền và đúng nội dung chuyển khoản, admin xác nhận payment mới là `PAID`.

### Quy tắc nghiệp vụ

- Không sửa lại payment `IGNORED` gốc.
- Payment tạo lại luôn có mã chuyển khoản và QR mới.
- Cách xử lý `bill_snapshot` của payment tạo lại còn cần chốt trong `EDGE_CASES.md`.
- Payment mới và payment `IGNORED` gốc được liên kết bằng `recreated_from_payment_id` để truy vết.
- Người tạo QR mới phải là người xác nhận payment mới.

## 16. Luồng đóng phiên bàn

### Mục tiêu

Kết thúc lượt sử dụng bàn sau khi thanh toán thành công.

### Luồng chính

1. Payment được xác nhận `PAID`.
2. Hệ thống cập nhật table session: `is_paid = true`.
3. Hệ thống chuyển `table_sessions` sang `CLOSED`.
4. Hệ thống lưu `closed_at`.
5. Bàn có thể nhận session mới ở lượt khách tiếp theo.

### Quy tắc nghiệp vụ

- Order và payment không bị xóa vật lý.
- Session đã `CLOSED` không nhận thêm order.
- QR bàn vẫn là QR cố định, lượt khách tiếp theo quét cùng QR sẽ tạo hoặc nhận session mới phù hợp.

## 17. Trạng thái chính

| Entity | Trạng thái |
|---|---|
| Table session | `OPEN`, `PAYMENT_PENDING`, `CLOSED` |
| Payment | `PENDING`, `PAID`, `IGNORED` |
| Cancellation request | `PENDING`, `APPROVED`, `REJECTED` |
| Account | `ACTIVE`, `INACTIVE` |

## 18. Câu hỏi còn cần xác nhận

1. Khi khách rời đi trước khi tạo payment, hệ thống đánh dấu chưa thanh toán bằng trạng thái trên `table_sessions` hay dùng bảng riêng?
2. Với payment tạo lại từ payment `IGNORED`, hệ thống copy `bill_snapshot` cũ hay tạo lại snapshot từ `orders/order_items`?

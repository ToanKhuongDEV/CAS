# CAS — Mô tả nghiệp vụ từng luồng

## 1. Mục đích

Tài liệu mô tả các luồng nghiệp vụ chính ở mức hành vi hệ thống, tác nhân tham gia, trạng thái liên quan và kết quả mong đợi.

Chi tiết bảng dữ liệu nằm trong `DATABASE_DESIGN.md`. Tài liệu này tập trung vào cách người dùng và hệ thống tương tác trong từng luồng.

## 2. Phạm vi

Các luồng thuộc phạm vi hiện tại:

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

Ngoài phạm vi hiện tại:

- Phân quyền chi tiết của hai role vận hành.
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

Khách hàng không có tài khoản đăng nhập và không phải account role. Hệ thống phân quyền tài khoản vận hành theo role `ADMIN` và `OPERATOR`; phạm vi thao tác chi tiết của hai role sẽ được chốt sau.

Tài khoản nội bộ của quán được lưu trong `accounts`. Thông tin khách hàng nhập khi mở bàn được lưu riêng trong `client_accounts`.

Các giao diện đồng bộ thay đổi từ thiết bị khác bằng polling REST API. Thao tác do chính giao diện gửi đi được cập nhật ngay từ API response. Giai đoạn đầu không dùng SSE hoặc WebSocket.

## 4. Luồng đăng nhập khu vực vận hành

### Mục tiêu

Cho phép tài khoản hợp lệ truy cập giao diện vận hành.

### Luồng chính

1. Người dùng nhập username và password.
2. Hệ thống kiểm tra tài khoản trong `accounts`.
3. Hệ thống kiểm tra trạng thái tài khoản là `ACTIVE`.
4. Hệ thống xác thực password.
5. Hệ thống cấp access JWT có thời hạn 15 phút và refresh JWT có thời hạn 10 ngày.
6. Hệ thống ghi nhận `last_login_at`.
7. Người dùng được chuyển vào giao diện vận hành phù hợp với role.

### Quy tắc nghiệp vụ

- Tài khoản `INACTIVE` không được đăng nhập.
- Password luôn được lưu bằng `password_hash`, không lưu password thô.
- Password phải dài hơn 8 ký tự, có ít nhất một chữ cái và một chữ số.
- Password được băm bằng BCrypt.
- Role được lấy từ backend theo tài khoản đăng nhập, client không được tự gửi role để quyết định quyền.
- Chỉ `ADMIN` được tạo tài khoản vận hành.
- Hệ thống không giới hạn số thiết bị đăng nhập và không quản lý cơ chế chủ động thu hồi JWT trong phạm vi hiện tại.
- Access JWT và refresh JWT không được lưu trong `localStorage`; cơ chế vận chuyển và lưu token cụ thể sẽ được chốt trong API contract.
- Phạm vi thao tác chi tiết của `ADMIN` và `OPERATOR` sẽ được chốt sau.

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
9. Hệ thống tạo `table_sessions` mới với trạng thái `OPEN`, gắn `client_account_id` và lưu snapshot tên/SĐT người mở phiên bàn.
10. Khách hàng được chuyển tới màn hình menu của bàn.

### Quy tắc nghiệp vụ

- Một bàn chỉ có một QR đang hoạt động tại một thời điểm.
- Chỉ session ở trạng thái `OPEN` mới được xem là đang chiếm dụng bàn.
- Trạng thái bàn trống hay đang có khách được suy ra từ session `OPEN`, không lưu trong `dining_tables`.
- Session ở trạng thái `PAYMENT_PENDING` không ngăn việc tạo một session `OPEN` mới cho cùng bàn.
- Việc tạo session `OPEN` phải an toàn khi có xử lý đồng thời, bảo đảm một bàn không bao giờ có nhiều hơn một session `OPEN` tại cùng một thời điểm.
- Người đầu tiên mở session bàn phải nhập tên và số điện thoại.
- Tên và số điện thoại này được lưu trong `client_accounts`, tách riêng với `accounts` của nhân viên/admin.
- Nhiều điện thoại quét cùng QR sau đó sẽ dùng chung session, không cần nhập lại thông tin khách và nhìn thấy cùng danh sách order.
- QR bàn là mã cố định được in và dán tại bàn.

### Ngoại lệ

- Token không tồn tại hoặc đã bị thu hồi: hiển thị lỗi QR không hợp lệ.

## 6. Luồng xem menu

### Mục tiêu

Khách hàng xem danh mục, món và tùy chọn món đang bán.

### Luồng chính

1. Khách hàng mở menu từ session bàn.
2. Hệ thống lấy danh sách `categories` đang hiển thị.
3. Hệ thống lấy danh sách `menu_items` thuộc category loại `REGULAR`.
4. Với từng món, hệ thống lấy `option_groups`, `option_group_items` và các `menu_items` loại option được phép chọn.
5. Hệ thống trả về thông tin món, giá hiện tại, hình ảnh, trạng thái còn/hết món và các option nếu có.
6. Khách hàng chọn món và tùy chọn.

### Quy tắc nghiệp vụ

- Món `SOLD_OUT` vẫn có thể hiển thị nhưng không được chọn để đặt.
- Món `INACTIVE` không hiển thị cho khách.
- Category loại `OPTION` và các menu item trong đó không hiển thị như món chính; chúng chỉ xuất hiện qua option group của món được liên kết.
- Giá cộng thêm của option lấy từ `menu_items.price` của option.
- Mỗi món chỉ có một ảnh.
- Giá tại thời điểm khách gửi order sẽ được ghi lại vào `order_items`, không phụ thuộc vào giá menu thay đổi sau đó.

## 7. Luồng gọi món

### Mục tiêu

Khách hàng gửi một order mới trong session bàn.

### Luồng chính

1. Khách hàng chọn một hoặc nhiều món.
2. Khách hàng chọn option bắt buộc nếu món có cấu hình.
3. Khách hàng nhập ghi chú chung cho toàn bộ order nếu cần.
4. Khách hàng gửi order kèm một `idempotency_key` duy nhất cho lần submit đó.
5. Hệ thống kiểm tra session còn `OPEN`.
6. Hệ thống kiểm tra món chính còn bán; mọi liên kết option còn `ACTIVE`, thuộc option group của đúng món và menu item option còn `AVAILABLE`.
7. Hệ thống kiểm tra số lựa chọn trong từng nhóm theo `selection_type`, `min_select` và `max_select`.
8. Backend chuẩn hóa payload order và tính `request_fingerprint`.
9. Hệ thống tạo một bản ghi `orders`, lưu `idempotency_key` và `request_fingerprint`.
10. Hệ thống tạo các dòng `order_items`.
11. Hệ thống tạo các dòng `order_item_options` liên kết với đúng `order_item_id`.
12. Hệ thống tính `original_amount` và `payable_amount`.
13. Hệ thống trả về order đã tạo và cập nhật danh sách order của session.

### Quy tắc nghiệp vụ

- Mỗi lần khách gửi món tạo một order riêng.
- Một session có thể có nhiều order.
- `idempotency_key` là bắt buộc khi tạo order và chỉ duy nhất trong phạm vi một table session.
- `request_fingerprint` do backend tính từ payload đã chuẩn hóa; client không được cung cấp hoặc quyết định giá trị này.
- Request lặp lại với cùng key và cùng fingerprint trả về order đã tạo, không tạo order mới.
- Request dùng lại cùng key nhưng fingerprint khác bị từ chối với HTTP `409 Conflict`.
- Database phải dùng unique constraint trên `table_session_id + idempotency_key` để bảo đảm an toàn khi có request đồng thời.
- Order không cần bước xác nhận trước khi cửa hàng xử lý.
- Mỗi order chỉ có một ghi chú chung trong `orders.note`; `order_items` không có ghi chú riêng.
- `order_items.unit_price` là giá gốc của món; giá option được lưu riêng trong `order_item_options`.
- `order_items.total_amount = (unit_price + options_amount) × quantity`.
- Hai món chỉ được gộp cùng một dòng khi có cấu hình option giống nhau.
- Hệ thống không theo dõi trạng thái chế biến của order hoặc từng món.
- Tên và giá trong `order_items`, `order_item_options` là dữ liệu đã chốt tại thời điểm khách gửi order.

### Ngoại lệ

- Session không còn `OPEN`: không cho gửi order.
- Món hết hàng hoặc không tồn tại: từ chối dòng món tương ứng.
- Option bắt buộc chưa chọn hoặc vượt quá `max_select`: không cho gửi order.
- Option không liên kết với món qua `option_group_items`: không cho gửi order.

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
2. Khách hàng nhập số lượng muốn hủy, lý do nếu có và gửi một `idempotency_key` cho lần submit.
3. Hệ thống tạo `order_item_cancellation_requests` với trạng thái `PENDING`, lưu `public_id` và `idempotency_key`.
4. Nhân viên xem yêu cầu hủy trong giao diện vận hành.
5. Nhân viên chọn đồng ý hoặc từ chối.
6. Nếu đồng ý, hệ thống giữ nguyên `order_items.quantity` và ghi nhận số lượng được hủy qua yêu cầu có trạng thái `APPROVED`.
7. Hệ thống tính lại tổng tiền order.
8. Hệ thống lưu người xử lý, tên người xử lý và thời điểm xử lý.
9. Hệ thống ghi audit log cho thao tác xử lý yêu cầu hủy.

### Quy tắc nghiệp vụ

- Yêu cầu hủy món phải được nhân viên đồng ý hoặc từ chối.
- Yêu cầu bị từ chối không làm thay đổi tổng tiền.
- Không cho hủy quá số lượng còn lại của dòng món.
- `order_items.quantity` và `order_items.total_amount` là dữ liệu order gốc, không bị sửa hoặc xóa khi duyệt hủy.
- Số lượng còn tính tiền bằng số lượng ban đầu trừ tổng `requested_quantity` của các yêu cầu `APPROVED`.
- `idempotency_key` là bắt buộc và duy nhất theo `order_item_id + idempotency_key`.
- Request lặp lại với cùng key và cùng nội dung trả về yêu cầu đã tạo; cùng key nhưng khác nội dung trả HTTP `409 Conflict`.
- Chỉ tạo và xử lý yêu cầu hủy khi table session còn `OPEN`.
- Không cho yêu cầu thanh toán khi còn cancellation request `PENDING`; nhân viên phải xử lý xong trước khi khóa bill.

## 10. Luồng yêu cầu thanh toán

### Mục tiêu

Khách hàng báo muốn thanh toán toàn bộ các order trong phiên bàn.

### Luồng chính

1. Khách hàng bấm yêu cầu thanh toán.
2. Hệ thống kiểm tra session đang `OPEN`.
3. Hệ thống kiểm tra session có ít nhất một order cần thanh toán.
4. Hệ thống kiểm tra không còn cancellation request `PENDING`.
5. Hệ thống chuyển session sang `PAYMENT_PENDING` và lưu `payment_requested_at`.
6. Hệ thống thông báo yêu cầu thanh toán cho giao diện vận hành.

### Quy tắc nghiệp vụ

- Thanh toán áp dụng cho toàn bộ các order của phiên bàn.
- Hệ thống chưa hỗ trợ tách hóa đơn.
- `bill_snapshot` được tạo khi nhân viên tạo payment/VietQR.
- Khi session đã `PAYMENT_PENDING`, order, option và cancellation của session không được thay đổi.
- Khi session đã `PAYMENT_PENDING`, khách không thể gọi thêm món vào session đó.
- Nếu khách tiếp tục gọi món sau khi yêu cầu thanh toán, hệ thống tạo session `OPEN` mới cho cùng bàn, không gộp với session cũ.
- Session `PAYMENT_PENDING` không chiếm dụng bàn và không ngăn việc tạo session `OPEN` mới.
- `orders` không có trạng thái riêng; trạng thái chờ thanh toán nằm ở `table_sessions.status`.

## 11. Luồng ghi nhận khách rời đi chưa thanh toán

### Mục tiêu

Ghi nhận trường hợp khách rời đi trước khi yêu cầu thanh toán hoặc trước khi nhân viên tạo QR.

### Tình huống điển hình

Khách gọi món xong nhưng rời khỏi quán mà chưa bấm yêu cầu thanh toán. Vì chưa có payment, hệ thống chưa có `bill_snapshot`, nhưng vẫn còn dữ liệu tính tiền trong `orders` và `order_items`.

### Luồng chính

1. Nhân viên hoặc admin mở session của bàn chưa thanh toán.
2. Người dùng chọn ghi nhận khách chưa thanh toán.
3. Hệ thống kiểm tra session chưa thanh toán và có order.
4. Hệ thống tạo `bill_snapshot` và tổng tiền từ `orders` và `order_items` đã chốt.
5. Hệ thống tạo một bản ghi `unpaid_records` trạng thái `OPEN`, liên kết duy nhất với session và lưu snapshot vừa tạo.
6. Hệ thống đóng session với `status = CLOSED` và lưu `closed_at` để giải phóng bàn.
7. Hệ thống ghi người thực hiện, thời điểm, lý do và audit log thao tác ghi nhận khách chưa thanh toán.
8. Khoản chưa thanh toán được đưa vào màn hình theo dõi riêng cho admin.

### Quy tắc nghiệp vụ

- Luồng này dùng khi chưa có payment/VietQR.
- Khoản chưa thanh toán được quản lý trong bảng `unpaid_records`, không thêm trạng thái `UNPAID` vào `table_sessions`.
- Mỗi table session chỉ có tối đa một `unpaid_records`.
- `unpaid_records.amount` và `unpaid_records.bill_snapshot` được chốt tại thời điểm ghi nhận và không thay đổi.
- Không cần tạo payment ngay nếu chưa thu được tiền.
- Khi cần tạo payment sau này, hệ thống lấy số tiền và nội dung bill từ `unpaid_records`.
- Payment thu lại phải liên kết với `unpaid_records`.
- Payment thu lại vẫn lưu `bill_snapshot` riêng cho lần tạo VietQR đó.
- Khi payment được xác nhận `PAID`, `unpaid_records` chuyển sang `RESOLVED`; trạng thái đã thanh toán được xác định từ payment và khoản chưa thanh toán, không lưu trong table session.
- Không tính lại theo giá menu hiện tại.

## 12. Luồng nhân viên tạo VietQR

### Mục tiêu

Nhân viên tạo QR thanh toán cho một phiên bàn với số tiền và nội dung chuyển khoản duy nhất.

### Luồng chính

1. Nhân viên mở danh sách session đang `PAYMENT_PENDING`.
2. Nhân viên chọn session cần thanh toán.
3. Hệ thống gom toàn bộ order trong session.
4. Hệ thống tính tiền từ `orders.payable_amount` và tạo `bill_snapshot` từ `orders`, `order_items`, `order_item_options` cùng các yêu cầu hủy `APPROVED`.
5. Hệ thống lấy tài khoản ngân hàng nhận tiền từ `stores`.
6. Hệ thống sinh `reference_code` theo dạng `CAS_` + UUID.
7. Hệ thống tạo `payments` với trạng thái `PENDING`.
8. Backend gọi VietQR Generate API bằng tài khoản ngân hàng, số tiền và `reference_code` đã lấy từ dữ liệu server.
9. Hệ thống lưu `qr_created_by`; `payments.created_at` là thời điểm tạo payment và VietQR.
10. Hệ thống hiển thị VietQR trên web hoặc thiết bị của nhân viên.

### Quy tắc nghiệp vụ

- VietQR chỉ hiển thị trên web hoặc thiết bị của nhân viên.
- VietQR không hiển thị trực tiếp trên web khách hàng.
- `reference_code` là duy nhất và không tái sử dụng cho payment khác.
- Mỗi cửa hàng dùng một tài khoản ngân hàng nhận tiền.
- `bill_snapshot` nằm trong payment và không thay đổi trong vòng đời payment đó.
- `payments.amount` bằng tổng `orders.payable_amount` tại thời điểm tạo snapshot.
- Payment `PENDING` không tự hết hạn.
- Frontend không gọi trực tiếp VietQR API và không được cung cấp số tiền, tài khoản ngân hàng hoặc nội dung chuyển khoản để backend tin cậy.
- VietQR API chỉ sinh mã QR; kết quả thanh toán vẫn được xác nhận thủ công.

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
9. Hệ thống cập nhật table session sang `CLOSED` và lưu `closed_at`.
10. Hệ thống ghi audit log xác nhận thanh toán.

### Quy tắc nghiệp vụ

- Nhân viên khác không được xác nhận thay người đã tạo QR.
- Backend phải lấy tài khoản xác nhận từ access JWT, không nhận `confirmed_by` từ client.
- Khi xác nhận thanh toán, `confirmed_by` phải bằng `qr_created_by`.
- Confirm payment là idempotent: request lặp trên payment đã `PAID` trả trạng thái hiện tại, không đổi `confirmed_at` và không tạo audit log trùng.
- Nếu chưa nhận được tiền, chuyển thiếu hoặc sai nội dung, payment giữ nguyên `PENDING`.
- Hệ thống không tự động xác nhận giao dịch qua webhook ngân hàng.

## 14. Luồng đánh dấu payment bỏ qua

### Mục tiêu

Cho phép nhân viên kết thúc một lần thử thanh toán không còn được sử dụng, đồng thời bảo đảm khoản còn phải thu được quản lý trong `unpaid_records`.

### Luồng chính

1. Nhân viên mở payment đang `PENDING`.
2. Nhân viên chọn đánh dấu bỏ qua.
3. Nhân viên nhập lý do nếu cần.
4. Hệ thống cập nhật payment sang `IGNORED`.
5. Hệ thống lưu `ignored_by`, `ignored_by_name`, `ignored_reason` và `ignored_at`.
6. Nếu payment chưa liên kết với `unpaid_records`, hệ thống tạo một khoản chưa thanh toán `OPEN` bằng cách sao chép `amount` và `bill_snapshot` của payment.
7. Hệ thống liên kết payment `IGNORED` với khoản chưa thanh toán.
8. Hệ thống đóng session với `status = CLOSED` nếu session chưa đóng.
9. Hệ thống ghi audit log thao tác đánh dấu bỏ qua.

### Quy tắc nghiệp vụ

- Payment `PENDING` không tự hết hạn.
- Nhân viên không được hủy payment.
- Đánh dấu bỏ qua không xóa payment.
- Payment `IGNORED` không được coi là đã thanh toán.
- `IGNORED` chỉ là trạng thái kết thúc của một lần thử thanh toán, không đại diện cho một khoản công nợ độc lập.
- `unpaid_records` là nguồn sự thật duy nhất để theo dõi và thống kê khoản còn phải thu.
- Payment `IGNORED` có thể được tra cứu trong lịch sử/audit nhưng không được cộng riêng vào tổng công nợ.
- Mỗi payment `IGNORED` phải liên kết với một `unpaid_records`.

## 15. Luồng tạo lại thanh toán từ payment bỏ qua

### Mục tiêu

Cho phép admin tạo một lần thanh toán mới cho khoản chưa thanh toán đang `OPEN`.

### Tình huống điển hình

Khách rời đi hoặc chưa thanh toán sau một hoặc nhiều lần tạo QR. Các payment cũ có thể đã `IGNORED`, còn khoản phải thu vẫn nằm trong một `unpaid_records` trạng thái `OPEN`.

### Luồng chính

1. Admin mở màn hình khoản chưa thanh toán.
2. Admin chọn `unpaid_records` trạng thái `OPEN` cần thu lại.
3. Hệ thống tạo payment mới trong `payments`.
4. Hệ thống gán `unpaid_record_id` và sao chép `amount`, `bill_snapshot` bất biến từ khoản chưa thanh toán.
5. Hệ thống sinh `reference_code` mới theo dạng `CAS_` + UUID.
6. Backend gọi VietQR Generate API để tạo QR mới từ tài khoản ngân hàng của cửa hàng, số tiền cần thu và `reference_code` mới.
7. Admin đưa QR mới cho khách thanh toán.
8. Nếu nhận đúng tiền và đúng nội dung chuyển khoản, admin xác nhận payment mới là `PAID`.
9. Hệ thống chuyển `unpaid_records` sang `RESOLVED`, gán `resolution_payment_id` và lưu `resolved_at`.

### Quy tắc nghiệp vụ

- Không sửa lại payment `IGNORED` gốc.
- Payment tạo lại luôn có mã chuyển khoản và QR mới.
- Payment mới lấy `amount` và `bill_snapshot` từ `unpaid_records`, không dựng lại từ `orders/order_items`.
- Các payment thuộc cùng khoản phải thu được liên kết bằng `unpaid_record_id` và sắp xếp theo `created_at`.
- Người tạo QR mới phải là người xác nhận payment mới.
- Một khoản chưa thanh toán có thể có nhiều payment theo lịch sử nhưng chỉ được `RESOLVED` bởi payment `PAID`.

## 16. Luồng đóng phiên bàn

### Mục tiêu

Kết thúc lượt sử dụng bàn sau khi thanh toán thành công.

### Luồng chính

1. Payment được xác nhận `PAID`.
2. Hệ thống chuyển `table_sessions` sang `CLOSED`.
3. Hệ thống lưu `closed_at`.
4. Bàn có thể nhận session mới ở lượt khách tiếp theo.

### Quy tắc nghiệp vụ

- Order và payment không bị xóa vật lý.
- Session đã `CLOSED` không nhận thêm order.
- Table session không lưu `is_paid`; kết quả thanh toán được xác định từ `payments` và `unpaid_records`.
- QR bàn vẫn là QR cố định, lượt khách tiếp theo quét cùng QR sẽ tạo hoặc nhận session mới phù hợp.

## 17. Trạng thái chính

| Entity | Trạng thái |
|---|---|
| Table session | `OPEN`, `PAYMENT_PENDING`, `CLOSED` |
| Unpaid record | `OPEN`, `RESOLVED` |
| Payment | `PENDING`, `PAID`, `IGNORED` |
| Cancellation request | `PENDING`, `APPROVED`, `REJECTED` |
| Account | `ACTIVE`, `INACTIVE` |

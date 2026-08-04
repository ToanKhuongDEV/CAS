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
- Nhân viên xác nhận trạng thái thanh toán thủ công.
- Đóng phiên bàn.

Ngoài phạm vi hiện tại:

- Ma trận phân quyền chi tiết theo từng API.
- Tách hóa đơn.
- Tích hợp VietQR, ngân hàng, ví điện tử hoặc cổng thanh toán.
- CAS tự động theo dõi, đối soát hoặc xác minh luồng tiền thực tế.
- Tự động hết hạn payment đang chờ xác nhận.
- Màn hình bếp/phục vụ riêng.
- Theo dõi trạng thái chế biến từng món.

## 3. Tác nhân và role

| Tác nhân | Mô tả |
|---|---|
| Khách hàng | Quét QR, xem menu, gửi order, yêu cầu hủy món và yêu cầu thanh toán |
| `ADMIN` | Thực hiện toàn bộ chức năng quản trị cấu hình hệ thống và dữ liệu |
| `OPERATOR` | Chỉ xử lý nghiệp vụ vận hành như order và xác nhận trạng thái thanh toán |

Khách hàng không có tài khoản đăng nhập và không phải account role. Mọi chức năng quản trị chỉ dành cho `ADMIN`. `OPERATOR` không được truy cập chức năng quản trị và chỉ được thực hiện các nghiệp vụ vận hành thuộc phạm vi được cấp.

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
- Backend phải kiểm tra role trên mọi API được bảo vệ: API quản trị chỉ cho phép `ADMIN`; API vận hành chỉ cho phép role có quyền vận hành theo API contract.

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
- Session ở trạng thái `OPEN` hoặc `PAYMENT_PENDING` được xem là đang chiếm dụng bàn.
- Trạng thái bàn trống hay đang có khách được suy ra từ session đang chiếm dụng, không lưu trong `dining_tables`.
- Session ở trạng thái `OPEN` hoặc `PAYMENT_PENDING` đều chiếm dụng bàn. Chỉ khi session `CLOSED` mới được tạo session mới cho cùng bàn.
- Việc tạo session phải an toàn khi có xử lý đồng thời, bảo đảm một bàn không bao giờ có nhiều hơn một session đang chiếm dụng tại cùng một thời điểm.
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
4. Với từng món, hệ thống lấy các `tags` qua `menu_item_tags`, các `option_groups`, `option_group_items` và các `menu_items` loại option được phép chọn.
5. Hệ thống suy ra `selectionType` của từng option group từ `max_select`: `SINGLE` khi giá trị bằng `1`, ngược lại là `MULTIPLE`.
6. Hệ thống trả về thông tin món, giá hiện tại, hình ảnh, nhãn, trạng thái còn/hết món, các option và `selectionType` nếu có.
7. Khách hàng chọn món và tùy chọn.

### Quy tắc nghiệp vụ

- Món `SOLD_OUT` vẫn có thể hiển thị nhưng không được chọn để đặt.
- Món `INACTIVE` không hiển thị cho khách.
- Category loại `OPTION` và các menu item trong đó không hiển thị như món chính; chúng chỉ xuất hiện qua option group của món được liên kết.
- Giá cộng thêm của option lấy từ `menu_items.price` của option.
- Frontend hiển thị option group `SINGLE` bằng radio và `MULTIPLE` bằng checkbox, dựa trên `selectionType` do backend trả về.
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
7. Hệ thống kiểm tra số lựa chọn trong từng nhóm theo `max_select`; `max_select = 1` tương ứng `SINGLE`, các giá trị còn lại tương ứng `MULTIPLE`.
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
- Số option vượt quá `max_select`: không cho gửi order.
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

Khách hàng gửi yêu cầu thanh toán cho toàn bộ các order trong phiên bàn.

### Luồng chính

1. Khách hàng bấm yêu cầu thanh toán.
2. Hệ thống kiểm tra session đang `OPEN`.
3. Hệ thống kiểm tra session có ít nhất một order cần thanh toán.
4. Hệ thống kiểm tra không còn cancellation request `PENDING`.
5. Backend tính `amount` bằng tổng `orders.payable_amount` của session và tạo `bill_snapshot` từ dữ liệu order đã chốt.
6. Hệ thống tạo một payment trạng thái `PENDING`.
7. Hệ thống chuyển session sang `PAYMENT_PENDING`, lưu `payment_requested_at` và thông báo cho giao diện vận hành.
8. Giao diện thông báo khách bắt buộc ra gặp nhân viên để hoàn tất thanh toán.

### Quy tắc nghiệp vụ

- Thanh toán áp dụng cho toàn bộ các order của phiên bàn.
- Hệ thống chưa hỗ trợ tách hóa đơn.
- Mỗi table session chỉ có một payment.
- `payments.amount` do backend tự tính và luôn bằng tổng `orders.payable_amount` tại thời điểm tạo payment; client không được cung cấp hoặc ghi đè số tiền.
- `bill_snapshot` được tạo cùng payment và không thay đổi trong vòng đời payment.
- Khi session đã `PAYMENT_PENDING`, order, option và cancellation của session không được thay đổi.
- Khi session đã `PAYMENT_PENDING`, khách không thể gọi thêm món vào session đó.
- Session `PAYMENT_PENDING` vẫn chiếm dụng bàn; không tạo session mới cho bàn cho đến khi session hiện tại được đóng.
- `orders` không có trạng thái riêng; trạng thái chờ thanh toán nằm ở `table_sessions.status`.
- Hệ thống không tạo QR thanh toán và không lưu thông tin ngân hàng hoặc giao dịch tài chính.
- Khách không thể hoàn tất luồng thanh toán chỉ trên giao diện Customer; sau khi gửi yêu cầu, khách phải gặp nhân viên.

## 11. Luồng nhân viên xác nhận thanh toán

### Mục tiêu

Nhân viên xác minh chuyển khoản qua loa báo giao dịch (“ting ting”) rồi ghi nhận yêu cầu thanh toán đã hoàn tất trong CAS.

### Luồng chính

1. Nhân viên mở danh sách payment đang `PENDING`.
2. Khách ra gặp nhân viên và thực hiện chuyển khoản.
3. Nhân viên chỉ tiếp tục khi loa báo giao dịch phát tín hiệu “ting ting”, xác nhận chuyển khoản thành công.
4. Nhân viên chọn đúng yêu cầu và bấm xác nhận thanh toán thành công.
5. Backend lấy tài khoản xác nhận từ access JWT.
6. Trong cùng transaction, hệ thống chuyển payment sang `PAID`, lưu `confirmed_by`, `confirmed_by_name`, `confirmed_at`, chuyển table session sang `CLOSED` và lưu `closed_at`.
7. Nếu session có `unpaid_records` trạng thái `OPEN`, hệ thống chuyển bản ghi đó sang `RESOLVED`.
8. Hệ thống ghi audit log xác nhận thanh toán.

### Quy tắc nghiệp vụ

- Backend phải lấy tài khoản xác nhận từ access JWT, không nhận `confirmed_by` từ client.
- Nhân viên chỉ bấm xác nhận sau khi đã xác minh tín hiệu chuyển khoản thành công từ loa báo giao dịch.
- Confirm payment là idempotent: request lặp trên payment đã `PAID` trả trạng thái hiện tại, không đổi `confirmed_at` và không tạo audit log trùng.
- Payment `PENDING` không tự hết hạn.
- CAS không kết nối với loa hoặc ngân hàng và không tự xác minh giao dịch; tín hiệu “ting ting” là bước kiểm tra thủ công bên ngoài hệ thống.

## 12. Luồng ghi nhận chưa thanh toán

### Mục tiêu

Ghi nhận trường hợp cần đóng phiên bàn nhưng payment chưa được nhân viên xác nhận `PAID`.

### Luồng chính

1. Nhân viên mở session có order nhưng chưa thanh toán.
2. Nhân viên chọn ghi nhận chưa thanh toán và nhập lý do nếu cần.
3. Nếu session chưa có payment, backend tạo payment `PENDING`; `amount` và `bill_snapshot` được lấy từ dữ liệu order đã chốt.
4. Hệ thống tạo một `unpaid_records` trạng thái `OPEN`, liên kết duy nhất với session và sao chép `amount`, `bill_snapshot` từ payment.
5. Hệ thống đóng session để giải phóng bàn và ghi audit log.

### Quy tắc nghiệp vụ

- Payment vẫn giữ `PENDING`, thể hiện chưa được xác nhận thanh toán thành công.
- Mỗi table session có tối đa một payment và một `unpaid_records`.
- `unpaid_records` chỉ là bản ghi trạng thái chưa thanh toán phục vụ vận hành; CAS không quản lý phương thức thu tiền, đối soát hoặc giao dịch tài chính.
- Nếu payment được nhân viên xác nhận sau đó, payment chuyển sang `PAID` và `unpaid_records` chuyển sang `RESOLVED`.
- Không tính lại theo giá menu hiện tại.

## 13. Luồng đóng phiên bàn

### Mục tiêu

Kết thúc lượt sử dụng bàn sau khi thanh toán thành công.

### Luồng chính

1. Payment được xác nhận `PAID`, hoặc nhân viên ghi nhận session là chưa thanh toán.
2. Hệ thống chuyển `table_sessions` sang `CLOSED`.
3. Hệ thống lưu `closed_at`.
4. Bàn có thể nhận session mới ở lượt khách tiếp theo.

### Quy tắc nghiệp vụ

- Order và payment không bị xóa vật lý.
- Session đã `CLOSED` không nhận thêm order.
- Table session không lưu `is_paid`; kết quả thanh toán được xác định từ `payments.status`, còn `unpaid_records` ghi nhận trường hợp đóng phiên khi payment vẫn `PENDING`.
- QR bàn vẫn là QR cố định, lượt khách tiếp theo quét cùng QR sẽ tạo hoặc nhận session mới phù hợp.

## 14. Trạng thái chính

| Entity | Trạng thái |
|---|---|
| Table session | `OPEN`, `PAYMENT_PENDING`, `CLOSED` |
| Unpaid record | `OPEN`, `RESOLVED` |
| Payment | `PENDING`, `PAID` |
| Cancellation request | `PENDING`, `APPROVED`, `REJECTED` |
| Account | `ACTIVE`, `INACTIVE` |

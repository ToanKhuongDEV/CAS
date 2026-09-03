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
- Tạo và xem Báo cáo sự cố phát sinh (OPERATOR tạo, ADMIN xem).
- Admin tra cứu khách hàng đã mở bàn và lịch sử sử dụng bàn.
- Quản lý và áp dụng khuyến mãi (ADMIN quản lý, Customer/OPERATOR áp dụng khi đặt món).
- Quản lý và nhận Thông báo hệ thống (ADMIN tạo và gửi, OPERATOR/CUSTOMER nhận thông báo).
- Ghi nhận dịch vụ đặt trước được chốt qua Zalo và thanh toán độc lập với phiên bàn.
- Admin quản lý banner/ảnh giới thiệu hiển thị cho Customer tại Welcome và Menu.

Ngoài phạm vi hiện tại:

- Đổi bàn, chuyển bàn hoặc gộp bàn giữa các phiên bàn.
- Ma trận phân quyền chi tiết theo từng API.
- Tách hóa đơn.
- Tích hợp VietQR, ngân hàng, ví điện tử hoặc cổng thanh toán.
- CAS tự động theo dõi, đối soát hoặc xác minh luồng tiền thực tế.
- Tự động hết hạn payment đang chờ xác nhận.
- Màn hình bếp/phục vụ riêng.
- Theo dõi trạng thái chế biến từng món.
- Khai báo tiền mặt đầu ca/cuối ca, đối soát tiền mặt theo ca và xử lý chênh lệch quỹ.

## 3. Tác nhân và role

| Tác nhân | Mô tả |
|---|---|
| Khách hàng | Quét QR, xem menu, gửi order, yêu cầu hủy món và yêu cầu thanh toán |
| `ADMIN` | Thực hiện toàn bộ chức năng quản trị cấu hình hệ thống và dữ liệu |
| `OPERATOR` | Chỉ xử lý nghiệp vụ vận hành như order và xác nhận trạng thái thanh toán |

Khách hàng không có tài khoản đăng nhập và không phải account role. Mọi chức năng quản trị chỉ dành cho `ADMIN`. `OPERATOR` không được truy cập chức năng quản trị và chỉ được thực hiện các nghiệp vụ vận hành thuộc phạm vi được cấp.

Tài khoản nội bộ của quán được nhận diện bằng email, lưu trong `accounts` và xác thực qua Firebase. Thông tin khách hàng được lưu riêng trong `client_accounts`: khách có số điện thoại được nhận diện theo số điện thoại trong phạm vi cửa hàng, còn khách không cung cấp số điện thoại là khách lẻ.

Các giao diện đồng bộ thay đổi từ thiết bị khác bằng polling REST API. Thao tác do chính giao diện gửi đi được cập nhật ngay từ API response. Giai đoạn đầu không dùng SSE hoặc WebSocket.

## 3.1. Luồng quản lý và hiển thị banner giới thiệu

### Mục tiêu

Cho phép `ADMIN` quản lý một cấu hình Welcome Customer gồm 2 ảnh Hero, 5 ảnh xem trước Menu và 1 ảnh Banner.

### Luồng chính

1. `ADMIN` tạo hoặc cập nhật một cấu hình Welcome trong phạm vi store của mình, và có thể bật/tắt cấu hình đó.
2. Khi lưu, Backend xác thực các ảnh đã upload thuộc Cloudinary của store; client không tự gán URL hoặc khóa lưu trữ tùy ý.
3. Customer tải record cấu hình `ACTIVE` của store.
4. Welcome gán 2 field Hero vào khu vực giới thiệu, 5 field Menu vào khu vực xem trước thực đơn và field Banner vào khu vực banner; ảnh trong `frontend/public` chỉ là fallback/test asset khi chưa cấu hình ảnh thực tế.

### Quy tắc nghiệp vụ

- Mỗi store chỉ có một record cấu hình; các ảnh nằm ở 8 field cố định gồm 2 Hero, 5 Menu và 1 Banner. Không lưu tiêu đề hoặc mô tả vì Welcome hiện không hiển thị chúng theo từng ảnh.
- Không có thời gian bắt đầu, kết thúc hoặc cơ chế tự động bật/tắt banner.
- Banner giới thiệu không áp dụng discount, voucher, header ticker hoặc gợi ý giỏ hàng.
- `OPERATOR` không quản lý banner.

## 4. Luồng đăng nhập khu vực vận hành

### Mục tiêu

Cho phép tài khoản hợp lệ truy cập giao diện vận hành.

### Luồng chính

1. Nhân viên nhập email trên Frontend.
2. Frontend xác thực người dùng qua **Firebase Authentication**.
3. Firebase phát hành ID Token cho Client.
4. Client gửi Firebase ID Token lên CAS Backend trong HTTP Header (`Authorization: Bearer <Firebase_ID_Token>`).
5. Backend verify Firebase ID Token, dùng email đã xác thực để tìm tài khoản tương ứng trong `accounts` và xác nhận trạng thái `ACTIVE`.

Khi `ADMIN` tạo tài khoản `OPERATOR`, Client gửi `email`, `phone` và `displayName`
đến `POST /api/v1/admin/operators`. CAS Backend kiểm tra quyền `ADMIN`, gán mật
khẩu mặc định ở server, gọi Firebase Admin SDK để tạo Firebase user, rồi lưu
Firebase UID trả về vào `accounts.firebase_uid` với role cố định `OPERATOR` và
`store_id` của ADMIN đang đăng nhập. Client không gửi role để backend tin cậy.
6. Hệ thống ghi nhận `last_login_at`.
7. Người dùng được chuyển vào giao diện vận hành phù hợp với role.

### Quy tắc nghiệp vụ

- Xác thực tài khoản vận hành sử dụng Firebase Authentication.
- Email đã xác thực từ Firebase là định danh tài khoản vận hành; client không tự gửi email để backend tin cậy.
- Backend sử dụng Firebase Admin SDK (hoặc thư viện xác thực Firebase) để verify Firebase ID Token.
- Tài khoản `INACTIVE` không được phép truy cập hệ thống.
- Role được lấy từ backend theo tài khoản trong database tương ứng với danh tính Firebase, client không được tự gửi role để quyết định quyền.
- Chỉ `ADMIN` được tạo tài khoản vận hành.
- Backend phải kiểm tra role trên mọi API được bảo vệ: API quản trị chỉ cho phép `ADMIN`; API vận hành chỉ cho phép role có quyền vận hành theo API contract.

## 4.1. Luồng Admin xem danh sách report

**Trạng thái:** Cần chốt chi tiết

### Mục tiêu

Cho phép tài khoản có role `ADMIN` truy cập màn hình và xem danh sách `report`
của hệ thống.

### Luồng khung đã chốt

1. `ADMIN` đăng nhập khu vực quản trị.
2. `ADMIN` mở chức năng danh sách `report`.
3. Frontend yêu cầu dữ liệu từ CAS Backend.
4. Backend xác thực tài khoản và kiểm tra role `ADMIN`.
5. Backend trả danh sách `report` theo API contract sẽ được chốt.
6. Frontend hiển thị kết quả, trạng thái tải, danh sách trống và lỗi phù hợp.

### Quy tắc đã chốt

- Chức năng này chỉ dành cho `ADMIN`; `OPERATOR` không được truy cập.
- Backend là nơi bắt buộc kiểm tra quyền, frontend chỉ hỗ trợ trải nghiệm.
- Đây là chức năng xem danh sách, chưa bao gồm tạo, sửa, xóa, duyệt hoặc thay
  đổi trạng thái report.
- Không coi đây là chức năng báo cáo và phân tích nâng cao.

### Nội dung cần chốt

- Khái niệm và các loại `report` trong phạm vi CAS.
- Tác nhân hoặc quy trình tạo report.
- Trường dữ liệu và trạng thái của report.
- Bộ lọc, tìm kiếm, sắp xếp và phân trang.
- Quyền xem chi tiết và các thao tác xử lý sau khi mở report.
- API contract và nhu cầu bổ sung mô hình dữ liệu.

## 4.2. Luồng Admin tra cứu khách hàng

### Mục tiêu

Cho phép `ADMIN` tra cứu khách đã từng mở table session tại cửa hàng và xem lịch sử sử dụng bàn có liên quan, mà không mở rộng CAS thành CRM.

### Luồng chính

1. `ADMIN` đăng nhập khu vực quản trị và mở danh sách khách hàng.
2. Frontend yêu cầu danh sách khách trong phạm vi cửa hàng của tài khoản.
3. Backend xác thực Firebase ID Token, kiểm tra role `ADMIN` và giới hạn dữ liệu theo `store_id`.
4. Backend trả thông tin nhận diện tối thiểu của `client_accounts`, số lượt mở bàn và thời điểm sử dụng gần nhất; số điện thoại được che một phần ở danh sách khi có, còn khách không có số điện thoại hiển thị là `Khách lẻ`.
5. `ADMIN` có thể tìm theo tên hoặc số điện thoại, rồi mở một khách hàng để xem các `table_sessions` cùng order, payment hoặc `unpaid_records` liên quan.
6. Frontend hiển thị dữ liệu lịch sử, trạng thái tải, danh sách trống và lỗi phù hợp.

### Quy tắc nghiệp vụ

- Chức năng chỉ dành cho `ADMIN`; `OPERATOR` không được truy cập.
- Đây là chức năng chỉ đọc, không cho sửa hoặc xóa `client_accounts`, table session, order, payment hay khoản chưa thanh toán.
- Mọi truy vấn phải giới hạn theo `store_id`; không trả dữ liệu khách của cửa hàng khác.
- Lịch sử dùng snapshot trong `table_sessions`, order và payment làm nguồn hiển thị; không thay đổi dữ liệu lịch sử khi `client_accounts.display_name` được cập nhật ở một phiên sau.
- Danh sách không hiển thị đầy đủ số điện thoại khi có; chỉ màn chi tiết mới được trả số điện thoại đầy đủ khi thật sự cần thiết. Khách có `phone = NULL` hiển thị là `Khách lẻ` và không thể tìm bằng số điện thoại.
- Chức năng không bao gồm phân nhóm khách, ghi chú khách, tích điểm, voucher cá nhân, chiến dịch tiếp thị hay gửi thông báo theo từng khách.

## 5. Luồng quét QR và mở phiên bàn

### Mục tiêu

Khách hàng quét QR tại bàn để truy cập đúng bàn và dùng chung phiên bàn đang mở.

### Luồng chính

1. Khách hàng quét QR tại bàn.
2. QR dẫn tới đường dẫn chứa `table_qr_codes.token`.
3. Hệ thống kiểm tra token tồn tại và có trạng thái `ACTIVE`.
4. Hệ thống xác định `dining_tables` tương ứng.
5. Nếu bàn đang có `table_sessions` trạng thái `OPEN`, hệ thống trả về session hiện tại.
6. Nếu bàn chưa có session đang mở, hệ thống yêu cầu khách đầu tiên nhập tên; số điện thoại là tùy chọn.
7. Nếu khách cung cấp số điện thoại, hệ thống tìm `client_accounts` theo số điện thoại trong cửa hàng hiện tại.
8. Nếu có số điện thoại nhưng chưa tồn tại, hệ thống tạo `client_accounts` mới; nếu không có số điện thoại, hệ thống tạo một `client_accounts` khách lẻ với `phone = NULL`.
9. Hệ thống tạo `table_sessions` mới với trạng thái `OPEN`, gắn `client_account_id` và lưu snapshot tên/SĐT người mở phiên bàn; SĐT snapshot là `NULL` cho khách lẻ.
10. Khách hàng được chuyển từ `/table/{qrToken}` tới `/menu`.

### Quy tắc nghiệp vụ

- Một bàn chỉ có một QR đang hoạt động tại một thời điểm.
- Session ở trạng thái `OPEN` hoặc `PAYMENT_PENDING` được xem là đang chiếm dụng bàn.
- Trạng thái bàn trống hay đang có khách được suy ra từ session đang chiếm dụng, không lưu trong `dining_tables`.
- Session ở trạng thái `OPEN` hoặc `PAYMENT_PENDING` đều chiếm dụng bàn. Chỉ khi session `CLOSED` mới được tạo session mới cho cùng bàn.
- Việc tạo session phải an toàn khi có xử lý đồng thời, bảo đảm một bàn không bao giờ có nhiều hơn một session đang chiếm dụng tại cùng một thời điểm.
- Người đầu tiên mở session bàn phải nhập tên; số điện thoại là tùy chọn. Khi không có số điện thoại, khách được ghi nhận là khách lẻ.
- Nếu có số điện thoại, hệ thống tìm hoặc tạo `client_accounts` theo số đó; nếu không có, hệ thống tạo một `client_accounts` khách lẻ với `phone = NULL`. Bảng này tách riêng với `accounts` nhận diện nhân viên/admin bằng email.
- Nhiều điện thoại quét cùng QR sau đó sẽ dùng chung session, không cần nhập lại thông tin khách và nhìn thấy cùng danh sách order.
- QR bàn là mã cố định được in và dán tại bàn.
- QR token chỉ xuất hiện trong route vào ban đầu `/table/{qrToken}`.
- Sau khi QR được xác minh và table session hợp lệ được tìm hoặc tạo, các màn
  Customer tiếp tục dùng `/menu`, `/cart` và `/orders`; không đưa QR token,
  table ID hoặc session ID vào các URL này.
- Cơ chế vận chuyển và lưu ngữ cảnh table session cho các API Customer phải
  được chốt trong API contract. Backend phải xác minh ngữ cảnh session ở mỗi
  thao tác và không tin định danh bàn hoặc phiên do client tự suy diễn.

### Ngoại lệ

- Token không tồn tại hoặc đã bị thu hồi: hiển thị lỗi QR không hợp lệ.

## 6. Luồng xem menu

### Mục tiêu

Khách hàng xem danh mục, món và tùy chọn món đang bán.

### Luồng chính

1. Khách hàng mở menu hoặc giỏ hàng công khai, không cần quét QR hay có session bàn.
2. Hệ thống lấy danh sách `categories` đang hiển thị và danh sách `menu_items`.
3. Với từng món, hệ thống lấy các `tags` qua `menu_item_tags`, các `option_groups` được liên kết qua `menu_item_option_groups` và các `option_values` thuộc từng nhóm.
4. Hệ thống xác định `selection_type` của từng option group (`SINGLE` hoặc `MULTIPLE`).
5. Hệ thống trả về thông tin món, giá hiện tại, hình ảnh, nhãn, trạng thái còn/hết món, các option và `selectionType` nếu có.
6. Khi thêm món vào giỏ, nếu chưa có session QR hợp lệ thì khách quét hoặc nhập QR bàn. Nếu bàn chưa có session `OPEN`, người mở bàn nhập tên bắt buộc và số điện thoại tùy chọn; sau đó menu tải lại theo store của bàn trước khi khách thêm món.

### Quy tắc nghiệp vụ

- Món `SOLD_OUT` vẫn có thể hiển thị nhưng không được chọn để đặt.
- Món `INACTIVE` không hiển thị cho khách.
- Category loại `OPTION` và các menu item trong đó không hiển thị như món chính; chúng chỉ xuất hiện qua option group của món được liên kết.
- Giá cộng thêm của option lấy từ `menu_items.price` của option.
- Frontend hiển thị option group `SINGLE` bằng radio và `MULTIPLE` bằng checkbox, dựa trên `selectionType` do backend trả về.
- Mỗi món chỉ có một ảnh.
- Giá tại thời điểm khách gửi order sẽ được ghi lại vào `order_items`, không phụ thuộc vào giá menu thay đổi sau đó.
- Khi chưa có session QR hợp lệ, Catalog Customer hiển thị menu của store mặc định `1`. Sau khi quét hoặc nhập QR, Catalog ưu tiên store của table session để bảo đảm đúng menu của bàn.

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
13. Order mới được xếp vào hàng ưu tiên lên món theo `created_at`.
14. Hệ thống trả về order đã tạo và cập nhật danh sách order của session.

### Quy tắc nghiệp vụ

- Mỗi lần khách gửi món tạo một order riêng.
- Một session có thể có nhiều order.
- Các order được ưu tiên theo FIFO: `created_at` sớm hơn được xếp lên món trước.
- Nếu nhiều order có cùng `created_at`, thứ tự giữa các order đó không cần được
  bảo đảm; order nào hiển thị trước cũng được chấp nhận.
- FIFO là thứ tự ưu tiên hiển thị và xử lý thủ công; CAS theo dõi số lượng đã
  làm xong bằng `order_items.prepared_quantity`, nhưng không tự xác nhận món đã
  được lên.
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
- Hệ thống không lưu trạng thái enum cho order. Tiến độ làm món được lưu bằng
  `order_items.prepared_quantity`; trạng thái hoàn thành của dòng món và order
  được suy ra từ số lượng.
- Tên và giá trong `order_items`, `order_item_options` là dữ liệu đã chốt tại thời điểm khách gửi order.

### Ngoại lệ

- Session không còn `OPEN`: không cho gửi order.
- Món hết hàng hoặc không tồn tại: từ chối dòng món tương ứng.
- Số option vượt quá `max_select`: không cho gửi order.
- Option value không thuộc option group được liên kết với món qua `menu_item_option_groups`: không cho gửi order.

## 7.1. Luồng nhân viên tạo order hộ khách

### Mục tiêu

Cho phép `OPERATOR` tiếp nhận yêu cầu gọi món trực tiếp tại bàn và tạo order hộ
khách bằng cùng khả năng chọn món của giao diện Customer.

### Luồng chính

1. `OPERATOR` đăng nhập khu vực vận hành.
2. Nhân viên mở chức năng tạo order hộ và chọn bàn cần phục vụ.
3. Backend xác thực tài khoản `OPERATOR`, phạm vi cửa hàng và tìm table session
   `OPEN` đang chiếm dụng bàn. Nếu bàn chưa có session `OPEN`, nhân viên nhập tên
   khách bắt buộc và số điện thoại tùy chọn để backend tạo table session mới.
4. Nhân viên xem menu hiện hành, chọn món, số lượng và các option hợp lệ.
5. Nhân viên quản lý giỏ món và nhập ghi chú chung cho order nếu khách yêu cầu.
6. Giao diện tạo `idempotency_key` mới và gửi order cho table session đã chọn.
7. Backend thực hiện toàn bộ kiểm tra menu, option, session, giá và
   `request_fingerprint` giống luồng gọi món của Customer.
8. Hệ thống tạo `orders`, `order_items` và `order_item_options` trong cùng
   transaction.
9. Hệ thống ghi `audit_logs` cho order được tạo hộ, với
   `actor_account_id` là tài khoản nhân viên đang đăng nhập.
10. Order mới tham gia hàng FIFO theo `orders.created_at` và xuất hiện trong
    danh sách order chung của table session.

### Quy tắc nghiệp vụ

- Phạm vi “chức năng như Customer” trong luồng này gồm xem menu, chọn món và
  option, giỏ món, ghi chú chung, gửi order và gọi thêm món; không mặc nhiên cấp
  cho `OPERATOR` các thao tác chỉ dành cho Customer ngoài mục đích tạo order hộ.
- `OPERATOR` được phép mở table session mới cho bàn chưa có session đang chiếm dụng.
  Tên khách là bắt buộc, số điện thoại là tùy chọn; backend tìm hoặc tạo
  `client_accounts` theo cùng quy tắc của luồng quét QR và lưu snapshot thông tin
  người mở phiên. Session `PAYMENT_PENDING` hoặc `CLOSED` không được nhận thêm món.
- Nhân viên không được ghi đè giá món, giá option, tổng tiền, store, danh tính
  tài khoản thực hiện hoặc thứ tự FIFO.
- Backend phải tải menu, giá, quyền, table session và quan hệ cửa hàng từ dữ
  liệu đáng tin cậy.
- Mỗi lần nhân viên gửi món tạo một order mới; gọi thêm không sửa order cũ.
- Order do nhân viên tạo hộ và order do Customer tạo được xử lý giống nhau trong
  tổng tiền, hủy món, tổng hợp chế biến, cảnh báo chờ lâu và thanh toán.
- Retry tuân theo cùng quy tắc `idempotency_key` và `request_fingerprint` của
  luồng gọi món.
- Việc tạo order hộ là thao tác vận hành quan trọng và phải có audit log.

### Ngoại lệ

- Bàn không tồn tại hoặc không thuộc cửa hàng của tài khoản: không tạo session hay order.
- Dữ liệu menu thay đổi trong lúc nhân viên chọn món: backend kiểm tra lại tại
  thời điểm submit và từ chối dữ liệu không còn hợp lệ.
- Tài khoản không có role hoặc trạng thái hợp lệ: từ chối thao tác.

### Nội dung cần chốt

- API contract và route UI cụ thể cho thao tác chọn bàn, mở session và tạo order hộ.

## 8. Luồng gọi thêm món

### Mục tiêu

Khách hàng gọi thêm món trong cùng phiên bàn trước khi yêu cầu thanh toán.

### Luồng chính

1. Khách hàng tiếp tục mở menu từ QR hoặc từ màn hình hiện tại.
2. Hệ thống xác định session đang `OPEN` của bàn.
3. Khách hàng chọn thêm món.
4. Khách hàng gửi order.
5. Hệ thống tạo một `orders` mới trong cùng `table_sessions`.
6. Order gọi thêm được xếp sau các order có `created_at` sớm hơn trong hàng ưu
   tiên lên món.
7. Hệ thống cập nhật danh sách order của phiên bàn.

### Quy tắc nghiệp vụ

- Gọi thêm không cộng dòng món vào order cũ.
- Gọi thêm luôn tạo order mới trong cùng session.
- Order gọi thêm không được chen trước order đã tạo trước đó.
- Nếu session đã chuyển sang chờ thanh toán, hệ thống không nhận thêm món vào session đó.

## 8.1. Luồng tổng hợp và hoàn thành món theo mẻ

### Mục tiêu

Giúp nhân viên tổng hợp số phần của các món giống nhau từ nhiều order để chế
biến cùng lúc, sau đó phân bổ số lượng đã làm xong về các bàn theo FIFO.

### Luồng chính

1. Hệ thống lấy các `order_items` còn số lượng cần làm.
2. Hệ thống trừ tổng số lượng hủy `APPROVED` khỏi `order_items.quantity`.
3. Hệ thống trừ tiếp `order_items.prepared_quantity` để xác định số phần còn
   cần làm.
4. Các dòng món có cùng `menu_item_id` và cùng toàn bộ cấu hình option được gộp
   thành một nhóm chế biến.
5. Giao diện hiển thị tổng số phần còn cần làm của từng nhóm, ví dụ `Bò: 19
   phần`, `Gà: 5 phần`.
6. Nhân viên mở một nhóm để xem phân bổ theo bàn và order, sắp xếp theo
   `orders.created_at ASC`.
7. Nhân viên nhập số phần vừa làm xong và gửi thao tác hoàn thành theo mẻ.
8. Backend khóa các dòng liên quan hoặc dùng cơ chế transaction tương đương,
   kiểm tra lại số lượng còn cần làm và phân bổ số phần hoàn thành theo FIFO.
9. Backend tăng `order_items.prepared_quantity` trên các dòng được phân bổ và
   ghi audit log.
10. Backend trả kết quả phân bổ mới nhất; frontend cập nhật tổng hợp và chi tiết
    theo bàn.

### Quy tắc nghiệp vụ

- `order_items.prepared_quantity` mặc định bằng `0`.
- Số lượng hiệu lực của dòng món bằng `quantity` trừ tổng số lượng hủy
  `APPROVED`.
- Số lượng còn cần làm bằng số lượng hiệu lực trừ `prepared_quantity`.
- `prepared_quantity` không được âm và không được lớn hơn số lượng hiệu lực.
- Chỉ gộp các dòng có cùng món chính và cùng chính xác toàn bộ cấu hình option;
  khác size, cấp độ cay, topping hoặc option ảnh hưởng chế biến phải là nhóm
  riêng.
- Phân bổ hoàn thành theo `orders.created_at ASC`. Các order trùng `created_at`
  có thể được phân bổ theo bất kỳ thứ tự nào.
- Order gọi thêm tham gia hàng FIFO tại thời điểm order đó được tạo.
- Một dòng món hoàn thành khi số lượng còn cần làm bằng `0`.
- Một order hoàn thành theo giá trị suy ra khi mọi dòng món còn hiệu lực đều có
  số lượng còn cần làm bằng `0`; không lưu `orders.is_completed`.
- Thao tác hoàn thành theo mẻ phải được backend xử lý trong transaction và có
  cơ chế idempotency bền vững trước khi mở API ghi dữ liệu.
- Trong phạm vi hiện tại, “đã làm xong” là mốc hoàn thành vận hành của món; hệ
  thống chưa tách riêng trạng thái bếp làm xong và nhân viên đã mang tới bàn.

### Ngoại lệ

- Số lượng nhân viên nhập lớn hơn tổng số phần còn cần làm: từ chối và trả dữ
  liệu mới nhất.
- Dữ liệu đã thay đổi do yêu cầu hủy được duyệt hoặc nhân viên khác vừa hoàn
  thành một mẻ: backend tính lại trong transaction, không cho vượt số lượng hiệu
  lực.
- Retry cùng thao tác hoàn thành không được cộng `prepared_quantity` hai lần.

## 8.2. Luồng cảnh báo bàn chờ lâu cho nhân viên

### Mục tiêu

Giúp `OPERATOR` nhận biết các bàn có order cũ còn món chưa làm xong để
chủ động kiểm tra và hỗ trợ.

### Luồng chính

1. Hệ thống lấy các table session đang `OPEN`.
2. Với mỗi session, hệ thống tìm order cũ nhất còn ít nhất một
   `order_items` có số lượng còn cần làm lớn hơn `0`.
3. Hệ thống tính thời gian chờ từ `orders.created_at` của order chưa hoàn thành
   cũ nhất đến thời điểm hiện tại.
4. Backend lấy ngưỡng cảnh báo do `ADMIN` cấu hình.
5. Các bàn có thời gian chờ lớn hơn hoặc bằng ngưỡng được trả về cho dashboard
   Operation.
6. Giao diện hiển thị bàn, order cũ nhất chưa hoàn thành, thời điểm gửi, thời
   gian đã chờ và ngưỡng cảnh báo đang áp dụng.
7. Dashboard dùng REST polling để cập nhật danh sách từ backend.

### Quy tắc nghiệp vụ

- Mốc tính thời gian chờ là `created_at` của order cũ nhất còn món chưa làm xong
  trong table session, không phải thời điểm mở session hoặc order mới nhất.
- Order không còn phần cần làm không tham gia tính cảnh báo.
- Bàn chưa có order không được tính thời gian chờ theo luồng này.
- Frontend chỉ hiển thị kết quả do backend cung cấp, không tự quyết định bàn nào
  thuộc diện cảnh báo.
- Cảnh báo không tạo trạng thái riêng cho `orders` hoặc `table_sessions`; kết
  quả được suy ra từ `order_items.prepared_quantity`.
- Ngưỡng thời gian cảnh báo do `ADMIN` cấu hình và được lưu tại `stores.long_wait_warning_minutes`.
- API cấu hình dùng `GET` và `PUT /api/v1/admin/store/settings/long-wait-warning`; chỉ `ADMIN` được cập nhật giá trị `longWaitWarningMinutes`.
- Giá trị `0` tắt cảnh báo; giá trị bật cảnh báo phải nằm trong khoảng từ `1` đến `1440` phút. Giá trị khác bị từ chối tại API boundary.
- Nếu backend không đọc được cấu hình hợp lệ, backend dùng ngưỡng dự phòng `25` phút.
- Bàn được cảnh báo khi thời gian chờ lớn hơn hoặc bằng ngưỡng đang áp dụng; khi ngưỡng bằng `0`, backend không trả bàn nào là chờ lâu.
- Mỗi lần `ADMIN` cập nhật ngưỡng phải được ghi vào `audit_logs`.
- Backend phải dùng giá trị cấu hình đáng tin cậy; client Operation không được
  gửi hoặc ghi đè ngưỡng khi truy vấn danh sách cảnh báo.

### API contract cấu hình ngưỡng chờ lâu

- `GET /api/v1/admin/store/settings/long-wait-warning` trả HTTP `200` với
  wrapper success dùng chung; `data` chỉ gồm `longWaitWarningMinutes`. Nếu
  backend không đọc được cấu hình hợp lệ, giá trị trong response là `25`.

```json
{
  "status": 200,
  "message": "Long-wait warning setting retrieved.",
  "data": {
    "longWaitWarningMinutes": 25
  },
  "requestId": "c2105e5e-64c9-4c18-a8ec-4a4edbfad5cf"
}
```

- `PUT /api/v1/admin/store/settings/long-wait-warning` nhận body chỉ gồm
  `longWaitWarningMinutes`, trả HTTP `200` với giá trị đã lưu và phải ghi audit
  log. Giá trị `0` tắt cảnh báo, giá trị từ `1` đến `1440` bật cảnh báo.

```json
{
  "status": 200,
  "message": "Long-wait warning setting updated.",
  "data": {
    "longWaitWarningMinutes": 0
  },
  "requestId": "c2105e5e-64c9-4c18-a8ec-4a4edbfad5cf"
}
```

- Lỗi validation dùng HTTP `400` và `ApiError` chung, với
  `fieldErrors.longWaitWarningMinutes`; xác thực và phân quyền lỗi lần lượt
  dùng HTTP `401` và `403` cùng contract lỗi chung.

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
   Thao tác này nằm trong trang Đơn hàng; Thanh toán không xuất hiện như một tab
   thường trực trên thanh điều hướng Customer.
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
5. Backend lấy tài khoản xác nhận từ Firebase ID Token đã verify.
6. Trong cùng transaction, hệ thống chuyển payment sang `PAID`, lưu `confirmed_by`, `confirmed_by_name`, `confirmed_at`, chuyển table session sang `CLOSED` và lưu `closed_at`.
7. Nếu session có `unpaid_records` trạng thái `OPEN`, hệ thống chuyển bản ghi đó sang `RESOLVED`.
8. Hệ thống ghi audit log xác nhận thanh toán.
9. Các giao diện Customer đang mở cùng table session nhận trạng thái payment
   `PAID` qua polling.
10. Giao diện Customer thay màn chờ bằng màn “Thanh toán thành công”, hiển thị
    bàn, `payments.amount`, `confirmed_at`, lời cảm ơn và thao tác “Tiếp tục tạo
    đơn mới”.
11. Khi Customer chọn tiếp tục, giao diện dùng lại QR token cố định của chính bàn
    đó để trở về `/table/{qrToken}` và hiển thị màn nhập thông tin như một khách
    mới; session vừa thanh toán không được tái sử dụng.

### Quy tắc nghiệp vụ

- Backend phải lấy tài khoản xác nhận từ Firebase ID Token đã verify, không nhận `confirmed_by` từ client.
- Nhân viên chỉ bấm xác nhận sau khi đã xác minh tín hiệu chuyển khoản thành công từ loa báo giao dịch.
- Confirm payment là idempotent: request lặp trên payment đã `PAID` trả trạng thái hiện tại, không đổi `confirmed_at` và không tạo audit log trùng.
- Payment `PENDING` không tự hết hạn.
- CAS không kết nối với loa hoặc ngân hàng và không tự xác minh giao dịch; tín hiệu “ting ting” là bước kiểm tra thủ công bên ngoài hệ thống.
- Customer chỉ được hiển thị thanh toán thành công khi backend trả payment
  `PAID`; không suy ra kết quả từ thời gian chờ, thao tác phía client hoặc thông
  tin do Customer nhập.
- Khi payment đã `PAID`, session đã `CLOSED`; Customer không được gọi thêm món,
  hủy món hoặc gửi lại yêu cầu thanh toán.
- Mọi thiết bị đang xem cùng table session phải chuyển sang trạng thái hoàn tất
  sau lần polling nhận `PAID`.
- Màn hoàn tất không hiển thị thông tin ngân hàng, mã giao dịch, QR thanh toán
  hoặc dữ liệu từ loa báo giao dịch.
- Thao tác tạo đơn mới chỉ dùng lại QR token của bàn để bắt đầu luồng khách mới;
  không mở lại hoặc thêm order vào session đã `CLOSED`.

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
- `OPERATOR` và `ADMIN` có thể thực hiện thao tác kết thúc phiên và ghi nhận chưa thanh toán; `ADMIN` có thêm quyền theo dõi số lượng, tổng tiền, trạng thái và bill snapshot của các khoản chưa thanh toán.

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

## 15. Luồng Báo cáo sự cố phát sinh

### Tác nhân

- `OPERATOR`: Tạo báo cáo sự cố phát sinh trong ca trực.
- `ADMIN`: Tiếp nhận, xem và theo dõi danh sách báo cáo sự cố.

### Mục tiêu

Ghi nhận các sự cố vận hành đột xuất trong ca (hỏng hóc thiết bị, thiếu nguyên liệu, rơi vỡ, mâu thuẫn khách hàng...) từ phía nhân viên `OPERATOR` để gửi lên cho `ADMIN` kiểm tra và xử lý.

### Luồng chính

1. Nhân viên `OPERATOR` mở form "Báo cáo sự cố phát sinh" tại trang Tổng quan (`/operator/dashboard`).
2. `OPERATOR` nhập thông tin người tạo báo cáo (`created_by_name`) và nội dung mô tả chi tiết sự cố.
3. Hệ thống ghi nhận báo cáo với thời gian hiện tại (`created_at`) và lưu vào cơ sở dữ liệu.
4. Quản trị viên `ADMIN` truy cập trang quản trị/báo cáo để tra cứu, theo dõi và tổng hợp toàn bộ các sự cố do nhân viên báo cáo.

### Quy tắc nghiệp vụ

- Tài khoản `OPERATOR` chỉ có quyền tạo báo cáo sự cố (Create).
- Tài khoản `ADMIN` có quyền xem và tra cứu danh sách toàn bộ báo cáo sự cố (Read/View).
- Báo cáo sự cố bắt buộc lưu trữ thời điểm khởi tạo (`created_at`), người tạo (`created_by_name`/`created_by_account_id`) và nội dung mô tả (`description`).

## 16. Luồng Quản lý và Áp dụng Khuyến mãi (Promotions)

### Tác nhân

- `ADMIN`: Quản lý chương trình khuyến mãi, điều kiện, phạm vi áp dụng và mã khuyến mãi.
- Khách hàng (`CLIENT`) / `OPERATOR`: Chọn một khuyến mãi cho bill của table session; nhập mã khi chương trình yêu cầu code.

### Mục tiêu

Cho phép cửa hàng áp dụng một khuyến mãi cho toàn bộ bill của table session trước khi payment được tạo. Backend tính giảm giá riêng, không sửa giá niêm yết của menu, và khóa snapshot discount khi bill được chốt.

### Luồng chính

1. `ADMIN` tạo `promotions` thuộc một `store`, chọn `promotion_type` là `PERCENT_OFF`, `FIXED_AMOUNT_OFF`, `ITEM_PERCENT_OFF` hoặc `ITEM_FIXED_OFF`, rồi đặt `status` là `DRAFT`, `ACTIVE` hoặc `INACTIVE`.
2. `ADMIN` cấu hình trực tiếp tại promotion giá trị giảm, mức giảm tối đa, điều kiện cơ bản `min_bill_amount`, thời gian hiệu lực và quota.
3. `ADMIN` cấu hình phạm vi món/danh mục tại `promotion_targets`, và code tại `promotion_codes` nếu chương trình yêu cầu khách nhập mã.
4. Khi Customer hoặc `OPERATOR` xem bill, backend tải các promotion `ACTIVE` của đúng store, trong thời gian hiệu lực, kiểm tra điều kiện/code và trả danh sách promotion đủ điều kiện cùng số tiền dự kiến được giảm.
5. Khách chọn tối đa một promotion cho bill của table session. Backend không tự chọn promotion có lợi nhất; muốn đổi promotion, khách phải bỏ promotion hiện tại rồi chọn promotion khác.
6. Khi order trong session thay đổi do gọi thêm món hoặc yêu cầu hủy được duyệt, backend đánh giá lại promotion trước khi tạo payment. Nếu không còn đủ điều kiện, backend gỡ promotion hiện tại để khách chọn promotion khác.
7. Khi khách yêu cầu thanh toán, backend tính lại promotion trong transaction, lưu discount cấp bill tại `bill_discounts`, rồi khóa snapshot cùng bill/payment.
8. Khi payment của session chuyển `PAID`, hệ thống tạo `promotion_redemptions`. Nếu payment đã `PAID` bị refund hoặc hủy toàn bộ trong tương lai, redemption chuyển `REVERSED` và không tính vào quota.

### Quy tắc nghiệp vụ

- Backend bắt buộc tự tính toán lại tiền giảm từ server, không tin số tiền giảm do Client truyền lên.
- Mọi record promotion, redemption và discount snapshot phải có `store_id`; backend luôn kiểm tra promotion và bill thuộc cùng store.
- Không sửa `menu_items.price` để kích hoạt hoặc kết thúc khuyến mãi.
- Một promotion chỉ được áp dụng một lần cho cùng bill; phiên bản hiện tại chỉ cho phép mỗi khách hàng dùng tối đa một voucher/promotion cho mỗi bill và mỗi table session chỉ áp dụng tối đa một promotion.
- `PERCENT_OFF` có thể dùng `max_discount_amount`; giá trị `NULL` nghĩa là không giới hạn mức giảm.
- Discount được làm tròn tới đơn vị đồng bằng cùng quy tắc backend `RoundingMode.HALF_UP`, dù database dùng `DECIMAL(15,2)`.
- `BUY_X_GET_Y` và `FREE_ITEM` ngoài phạm vi mô hình promotion đơn giản hiện tại; chỉ bổ sung khi có mô hình dữ liệu mua/tặng riêng.
- Trước khi payment được tạo, kết quả discount chỉ là áp dụng tạm thời và phải được tính lại khi bill thay đổi. Sau khi session chuyển `PAYMENT_PENDING`, `bill_discounts` là snapshot bất biến; hóa đơn lịch sử không tính lại theo promotion hiện hành.
- Quota được kiểm tra khi tạo redemption `COMPLETED`: `promotions.max_redemptions` giới hạn toàn chương trình, `promotion_codes.max_redemptions` giới hạn từng code khi một promotion có nhiều code, và `promotions.max_redemptions_per_customer` giới hạn số bill mà một khách sử dụng promotion.
- Tổng tiền phải trả sau giảm không bao giờ âm (tối thiểu là 0 VNĐ).

### Nội dung cần chốt

- Không còn nội dung cần chốt cho mô hình promotion hiện tại. Những quy tắc mới chỉ được bổ sung khi phạm vi yêu cầu phân bổ discount theo order, tách bill hoặc điều kiện phức tạp hơn.

## 17. Luồng Quản lý và Nhận Thông báo Hệ thống (System Notifications)

### Tác nhân

- `ADMIN`: Tạo và phát hành thông báo hệ thống.
- `OPERATOR` / `ADMIN`: Nhận và xem danh sách thông báo.

### Mục tiêu

Thông báo các thông tin quan trọng (tin tức ca trực, bảo trì hệ thống, thay đổi quy trình) đến nhân viên vận hành và quản lý.

### Luồng chính

1. `ADMIN` tạo thông báo mới tại giao diện quản trị với tiêu đề (`title`), nội dung (`content`), loại thông báo (`type`: `INFO`, `WARNING`, `URGENT`) và đối tượng nhận (`target_role`: `OPERATOR`, `CUSTOMER`, `BOTH`).
2. Trong cùng transaction, hệ thống lưu notification và tạo `system_notification_recipients`: một record cho mỗi Operator `ACTIVE` khi target có `OPERATOR`, hoặc một record cho mỗi table session `OPEN`/`PAYMENT_PENDING` khi target có `CUSTOMER`.
3. Giao diện Customer và Operator nhận thông báo qua Polling REST API theo recipient của mình.
4. Khi người nhận xem thông báo, backend chuyển recipient từ `UNREAD` sang `READ` và lưu `read_at`; thao tác lặp lại không làm thay đổi `read_at`.
5. Table session đã `CLOSED` chỉ giữ lịch sử nhận thông báo cũ, không nhận notification được phát hành sau thời điểm đóng.

### Quy tắc nghiệp vụ

- Chỉ `ADMIN` được tạo hoặc xóa thông báo hệ thống.
- Thông báo hỗ trợ phân loại mức độ ưu tiên (`INFO`, `WARNING`, `URGENT`).
- Cửa sổ thông báo hiển thị danh sách mới nhất xếp theo `created_at` giảm dần.
- Biểu tượng **Chuông thông báo (Bell Icon)** ở góc trên bên phải của giao diện `Customer` và `Operator` tự động đếm số lượng thông báo chưa đọc (`unreadCount`) và mở danh sách thông báo dạng popover khi bấm vào.

## 18. Luồng Dịch vụ đặt trước chốt qua Zalo

### Tác nhân

- Khách hàng: liên hệ Zalo qua số hotline của cửa hàng để yêu cầu dịch vụ.
- `OPERATOR` và `ADMIN`: chốt tên dịch vụ, giá và trạng thái thanh toán.

### Luồng chính

1. Khách chọn dịch vụ đặt trước trên menu và mở Zalo bằng số hotline của cửa hàng.
2. Khách và nhân viên thỏa thuận tên dịch vụ, giá và thời điểm thanh toán qua Zalo, ngoài CAS.
3. `OPERATOR` hoặc `ADMIN` nhập tên và số điện thoại của khách. Backend tìm `client_accounts` theo số điện thoại; nếu chưa có thì tạo mới, nếu đã có thì dùng lại ID hiện có. Tên không dùng để nhận diện khách.
4. Hệ thống tạo `service_booking` với `client_account_id`, tên dịch vụ và `agreed_price` đã chốt.
5. Nếu thanh toán sau, record bắt đầu ở `PAY_LATER`.
6. Nếu khách thanh toán ngay hoặc thanh toán sau đó, nhân viên chuyển record sang `PENDING`, tự xác minh giao dịch rồi xác nhận `PAID`.
7. Nếu khách không tiếp tục đặt dịch vụ, nhân viên đánh dấu record là `CANCELLED`; dịch vụ đã hủy không thể chuyển sang thanh toán.
8. Hệ thống lưu người tạo, người xác nhận (nếu có) và thời điểm tương ứng, đồng thời ghi audit log.

### Quy tắc nghiệp vụ

- Dịch vụ đặt trước không tạo table session, order món, payment, bill snapshot hoặc khoản chưa thanh toán.
- Giá dịch vụ chỉ do `OPERATOR` hoặc `ADMIN` nhập từ kết quả thỏa thuận; client không gửi hoặc ghi đè giá. Giá có thể bằng `0` với dịch vụ miễn phí.
- Số điện thoại là định danh duy nhất của khách trong cửa hàng; tên chỉ là thông tin hiển thị.
- `ADMIN` có toàn bộ quyền thao tác của `OPERATOR` với dịch vụ đặt trước.
- Mọi thao tác thay đổi dịch vụ đặt trước phải ghi audit log: tạo record, sửa tên dịch vụ/giá đã chốt, chuyển sang `PENDING`, xác nhận `PAID` hoặc hủy `CANCELLED`.
- CAS chỉ mở liên hệ Zalo theo `stores.phone`; không tích hợp, lưu hoặc đọc nội dung tin nhắn Zalo.
- Việc xác minh thanh toán vẫn thủ công; CAS không tích hợp ngân hàng, VietQR hoặc dữ liệu giao dịch.

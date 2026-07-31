# CAS — Thiết kế database cơ bản

## 1. Mục đích

Tài liệu mô tả mô hình dữ liệu cơ bản cho CAS, bao gồm:

- Quản lý cửa hàng, bàn và mã QR.
- Quản lý menu.
- Phiên sử dụng bàn.
- Gọi món và xử lý order.
- Thanh toán chuyển khoản bằng VietQR và xác nhận thủ công.
- Tài khoản, phân quyền theo role và nhật ký cơ bản.

## 2. Nguyên tắc thiết kế

- MySQL là nguồn dữ liệu chính của hệ thống.
- Backend truy cập MySQL bằng MyBatis và SQL tường minh, không dựa trên cơ chế quản lý entity của JPA/Hibernate.
- Dữ liệu tiền tệ sử dụng `DECIMAL`.
- Tất cả thời gian nghiệp vụ được lưu theo múi giờ Việt Nam `Asia/Ho_Chi_Minh` (`UTC+07:00`).
- Các bảng nghiệp vụ có `created_at` và `updated_at` khi phù hợp.
- Order và payment không bị xóa vật lý.
- Dữ liệu cha đang được tham chiếu không bị xóa vật lý; tất cả foreign key dùng `ON DELETE RESTRICT` và `ON UPDATE RESTRICT`.
- Quy tắc nghiệp vụ được kiểm tra trong Java, không dùng MySQL `CHECK` constraint.
- Thông tin order được lưu theo các cột nghiệp vụ.
- Toàn bộ nội dung bill được lưu trong JSON snapshot khi ghi nhận khoản chưa thanh toán và khi tạo từng payment.
- Các mã được sử dụng bên ngoài hệ thống không dùng ID tăng dần.
- Thay đổi database được quản lý bằng Flyway migration.

## 3. Quy ước và tên bảng

### 3.1. Quy ước đặt tên

- Tên bảng và tên cột dùng tiếng Anh, chữ thường và `snake_case`.
- Tên bảng dùng dạng số nhiều.
- Khóa chính dùng tên `id`.
- Khóa ngoại dùng dạng `<entity>_id`.
- Cột thời gian dùng hậu tố `_at`.
- Cột JSON dùng hậu tố `_snapshot`, `_payload` hoặc tên thể hiện rõ nội dung.

### 3.2. Quy ước kiểu dữ liệu

- Khóa chính nội bộ dùng `BIGINT UNSIGNED AUTO_INCREMENT`; khóa ngoại phải dùng cùng kiểu `BIGINT UNSIGNED`.
- UUID dùng bên ngoài hệ thống được lưu dạng chuỗi chuẩn trong `CHAR(36)`.
- Tiền tệ dùng `DECIMAL(15,2)`, không dùng `FLOAT` hoặc `DOUBLE`.
- Thời gian dùng `DATETIME(3)` và mang ý nghĩa múi giờ `Asia/Ho_Chi_Minh`; ứng dụng phải cấu hình timezone nhất quán khi đọc và ghi.
- Giá trị boolean dùng `BOOLEAN`, tương đương `TINYINT(1)` trong MySQL.
- Trạng thái dùng `VARCHAR`, không dùng MySQL `ENUM` hoặc `CHECK` constraint; Java chịu trách nhiệm kiểm tra giá trị hợp lệ và quy tắc chuyển trạng thái.
- Các cột `NULL` và `NOT NULL` được ghi trực tiếp trong kiểu dữ liệu. Chỉ dùng `NULL` khi giá trị thực sự chưa tồn tại hoặc không áp dụng theo trạng thái nghiệp vụ.
- Toàn bộ chuỗi dùng character set `utf8mb4`; collation được chốt ở cấp database và dùng nhất quán cho các bảng.

### 3.3. Quy ước giá trị mặc định

- `created_at` dùng `DEFAULT CURRENT_TIMESTAMP(3)`.
- `updated_at` dùng `DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`.
- Các cột `display_order` dùng `DEFAULT 0`.
- `option_group_items.is_default` dùng `DEFAULT FALSE`.
- `stores`, `table_qr_codes`, `categories`, `option_groups`, `option_group_items` và `accounts` dùng trạng thái mặc định `ACTIVE`.
- `menu_items.availability_status`, trạng thái session, cancellation request, unpaid record và payment phải được Java truyền rõ khi tạo, không dùng giá trị mặc định trong database.
- `dining_tables` không có cột trạng thái.

### 3.4. Danh sách tên bảng

| Nhóm | Tên bảng | Nội dung |
|---|---|---|
| Cửa hàng | `stores` | Thông tin cửa hàng |
| Bàn | `dining_tables` | Danh sách bàn |
| QR | `table_qr_codes` | Mã QR của bàn |
| Menu | `categories` | Danh mục món |
| Menu | `menu_items` | Thông tin món |
| Menu | `option_groups` | Nhóm lựa chọn của món |
| Menu | `option_group_items` | Liên kết nhóm lựa chọn với menu item loại option |
| Phiên bàn | `table_sessions` | Lượt sử dụng bàn |
| Order | `orders` | Các order thuộc mỗi phiên bàn |
| Order | `order_items` | Các món trong order |
| Order | `order_item_options` | Các option thực tế đã chọn cho từng dòng món |
| Order | `order_item_cancellation_requests` | Yêu cầu hủy món và kết quả xử lý |
| Chưa thanh toán | `unpaid_records` | Nguồn sự thật của các khoản còn phải thu |
| Thanh toán | `payments` | VietQR, xác nhận thanh toán và JSON snapshot của bill |
| Tài khoản | `accounts` | Tài khoản đăng nhập hệ thống |
| Tài khoản khách | `client_accounts` | Thông tin khách hàng mở phiên bàn |
| Vận hành | `audit_logs` | Nhật ký thao tác quan trọng |

Các tên trên là tên vật lý dự kiến dùng trong MySQL.

## 4. Sơ đồ quan hệ tổng quan

```text
stores
  ├── dining_tables
  │     ├── table_qr_codes
  │     └── table_sessions
  │            ├── orders
  │            │     └── order_items
  │            │            ├── order_item_options
  │            │            └── order_item_cancellation_requests
  │            ├── unpaid_records
  │            └── payments
  │
  ├── categories
  │     └── menu_items
  │
  │   menu_items (REGULAR)
  │     └── option_groups
  │            └── option_group_items
  │                    └── menu_items (OPTION)
  │
  ├── accounts
  └── client_accounts

audit_logs
```

## 5. Các nhóm dữ liệu

### 5.1. Cửa hàng và bàn

#### `stores`

Lưu thông tin cửa hàng.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh cửa hàng |
| `name` | `VARCHAR(150) NOT NULL` | Tên cửa hàng |
| `address` | `VARCHAR(500) NULL` | Địa chỉ |
| `phone` | `VARCHAR(20) NULL` | Số điện thoại |
| `timezone` | `VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'` | Múi giờ vận hành, dùng cố định `Asia/Ho_Chi_Minh` (`UTC+07:00`) |
| `bank_account_number` | `VARCHAR(34) NOT NULL` | Số tài khoản ngân hàng nhận tiền |
| `bank_code` | `VARCHAR(20) NOT NULL` | Mã ngân hàng nhận tiền |
| `bank_account_name` | `VARCHAR(150) NOT NULL` | Tên chủ tài khoản nhận tiền |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái hoạt động |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Hệ thống hiện vận hành một cửa hàng nhưng vẫn giữ entity `stores` để dữ liệu có ngữ cảnh rõ ràng. Mỗi cửa hàng dùng một tài khoản ngân hàng nhận tiền để tạo VietQR. Giá trị `stores.timezone` mặc định là `Asia/Ho_Chi_Minh` và không cho phép thay đổi.

#### `dining_tables`

Lưu thông tin bàn.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh bàn |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng |
| `code` | `VARCHAR(50) NOT NULL` | Mã bàn |
| `name` | `VARCHAR(100) NOT NULL` | Tên hiển thị |
| `capacity` | `SMALLINT UNSIGNED NULL` | Số chỗ dự kiến |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Trạng thái bàn trống hay đang có khách được suy ra từ việc tồn tại một `table_sessions` trạng thái `OPEN`, không lưu trong `dining_tables`.

#### `table_qr_codes`

Lưu mã QR được gắn với bàn.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh bản ghi QR |
| `table_id` | `BIGINT UNSIGNED NOT NULL` | Bàn tương ứng |
| `token` | `CHAR(64) NOT NULL` | Token ngẫu nhiên dùng trong đường dẫn QR |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái sử dụng |
| `issued_at` | `DATETIME(3) NOT NULL` | Thời điểm phát hành |
| `revoked_at` | `DATETIME(3) NULL` | Thời điểm thu hồi |

Một bàn có thể có nhiều bản ghi QR trong lịch sử nhưng chỉ có một mã đang hoạt động.

### 5.2. Menu

#### `categories`

Lưu danh mục món.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh danh mục |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng |
| `name` | `VARCHAR(150) NOT NULL` | Tên danh mục |
| `description` | `TEXT NULL` | Mô tả |
| `category_type` | `VARCHAR(20) NOT NULL` | Loại danh mục `REGULAR` hoặc `OPTION` |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái hiển thị |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `menu_items`

Lưu thông tin món.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh món |
| `category_id` | `BIGINT UNSIGNED NOT NULL` | Danh mục |
| `name` | `VARCHAR(150) NOT NULL` | Tên món |
| `description` | `TEXT NULL` | Mô tả |
| `price` | `DECIMAL(15,2) NOT NULL` | Giá hiện tại |
| `image_url` | `VARCHAR(2048) NULL` | URL hình ảnh |
| `image_storage_key` | `VARCHAR(512) NULL` | Khóa asset trên dịch vụ lưu trữ để thay thế hoặc xóa ảnh |
| `availability_status` | `VARCHAR(20) NOT NULL` | Trạng thái còn hoặc hết món |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `option_groups`

Lưu nhóm lựa chọn của món như kích thước, topping, độ ngọt hoặc cách chế biến.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh nhóm lựa chọn |
| `menu_item_id` | `BIGINT UNSIGNED NOT NULL` | Món áp dụng |
| `name` | `VARCHAR(150) NOT NULL` | Tên nhóm lựa chọn |
| `selection_type` | `VARCHAR(20) NOT NULL` | Kiểu chọn `SINGLE` hoặc `MULTIPLE` |
| `min_select` | `SMALLINT UNSIGNED NOT NULL DEFAULT 0` | Số lựa chọn tối thiểu |
| `max_select` | `SMALLINT UNSIGNED NULL` | Số lựa chọn tối đa; `NULL` nghĩa là không giới hạn |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái sử dụng |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Nhóm bắt buộc được xác định bằng `min_select > 0`, không lưu thêm `is_required`. Với nhóm size, hệ thống chọn một giá trị mặc định được cấu hình trong `option_group_items`. Với nhóm topping, `max_select` có thể để trống để biểu thị không giới hạn số lựa chọn.

#### `option_group_items`

Liên kết một nhóm lựa chọn với các `menu_items` thuộc category loại `OPTION`. Giá cộng thêm lấy từ `menu_items.price` của option, không lưu giá override trong bảng liên kết.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh liên kết |
| `option_group_id` | `BIGINT UNSIGNED NOT NULL` | Nhóm lựa chọn của món chính |
| `option_menu_item_id` | `BIGINT UNSIGNED NOT NULL` | Menu item loại option được phép chọn |
| `is_default` | `BOOLEAN NOT NULL DEFAULT FALSE` | Option mặc định của nhóm lựa chọn |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái sử dụng |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Ví dụ:

```text
Trà sữa
├── Kích thước (chọn một, bắt buộc)
│   ├── menu_items: Size M, giá 0
│   └── menu_items: Size L, giá 10.000
├── Độ ngọt (chọn một)
│   ├── menu_items: 30%, giá 0
│   ├── menu_items: 50%, giá 0
│   └── menu_items: 100%, giá 0
└── Topping (chọn nhiều)
    ├── menu_items: Trân châu, giá 5.000
    └── menu_items: Pudding, giá 7.000
```

Category loại `OPTION` không hiển thị như danh mục món chính trên giao diện khách. Một option có thể được liên kết với nhiều nhóm của nhiều món. Menu item loại option không được có option group con.

Ảnh món được quản lý qua CAS Backend. Backend nhận file từ giao diện admin, upload lên Cloudinary bằng authenticated API, sau đó lưu URL hiển thị vào `image_url` và khóa asset vào `image_storage_key`. Frontend không upload trực tiếp lên Cloudinary.

### 5.3. Phiên sử dụng bàn

#### `table_sessions`

Đại diện cho một lượt khách sử dụng bàn.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh phiên |
| `table_id` | `BIGINT UNSIGNED NOT NULL` | Bàn |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng ở giao diện khách |
| `client_account_id` | `BIGINT UNSIGNED NOT NULL` | Tài khoản khách đầu tiên mở phiên bàn |
| `opened_by_customer_name` | `VARCHAR(150) NOT NULL` | Tên khách đầu tiên mở phiên bàn |
| `opened_by_customer_phone` | `VARCHAR(20) NOT NULL` | Số điện thoại khách đầu tiên mở phiên bàn |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái phiên |
| `payment_requested_at` | `DATETIME(3) NULL` | Thời điểm khách yêu cầu thanh toán, để trống khi chưa yêu cầu |
| `closed_at` | `DATETIME(3) NULL` | Thời điểm đóng |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm phiên bắt đầu |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Chỉ table session ở trạng thái `OPEN` mới được xem là đang chiếm dụng bàn. Mỗi bàn chỉ được có tối đa một session `OPEN` tại cùng một thời điểm. Session ở trạng thái `PAYMENT_PENDING` không chiếm dụng bàn và không ngăn việc tạo session `OPEN` mới cho cùng bàn. Người đầu tiên mở phiên bàn cần nhập tên và số điện thoại. Hệ thống tạo hoặc tìm `client_accounts` theo số điện thoại rồi gắn vào session qua `client_account_id`. Nhiều điện thoại quét cùng QR sau đó sẽ dùng chung session `OPEN`, không cần nhập lại thông tin khách và nhìn thấy cùng danh sách order của phiên bàn.

Khi khách yêu cầu thanh toán, session chuyển sang `PAYMENT_PENDING` và không nhận thêm món. Nếu khách tiếp tục gọi món thì hệ thống tạo session `OPEN` mới cho cùng bàn, không gộp order hoặc payment với session cũ.

Table session không lưu `is_paid`. Kết quả thanh toán được xác định từ payment `PAID` và trạng thái của `unpaid_records`; `table_sessions.status` chỉ quản lý vòng đời sử dụng bàn.

### 5.4. Order

#### `orders`

Lưu một lần gửi món của một table session. Khách có thể gọi món nhiều lần trong cùng session; mỗi lần gửi tạo một order riêng cho đến khi yêu cầu thanh toán.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh order |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài |
| `table_session_id` | `BIGINT UNSIGNED NOT NULL` | Phiên bàn |
| `idempotency_key` | `VARCHAR(100) NOT NULL` | Khóa chống tạo order trùng cho một lần submit trong cùng phiên bàn |
| `request_fingerprint` | `CHAR(64) NOT NULL` | SHA-256 dạng hexadecimal của payload order đã được backend chuẩn hóa |
| `order_number` | `VARCHAR(50) NOT NULL` | Mã hiển thị cho cửa hàng |
| `original_amount` | `DECIMAL(15,2) NOT NULL` | Tổng tiền order tại thời điểm khách gửi, bất biến |
| `payable_amount` | `DECIMAL(15,2) NOT NULL` | Số tiền hiện còn phải trả sau các yêu cầu hủy được duyệt |
| `note` | `VARCHAR(1000) NULL` | Ghi chú chung cho toàn bộ lần gọi món |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Một `table_session_id` có thể xuất hiện ở nhiều bản ghi trong `orders`, tương ứng một session có nhiều order theo từng lần khách gửi món.

`idempotency_key` do frontend tạo mới cho mỗi lần submit order và được lưu bền vững cùng order. Backend chuẩn hóa payload, tính SHA-256 và lưu vào `request_fingerprint`; client không được gửi hoặc quyết định fingerprint. Cặp `table_session_id + idempotency_key` là duy nhất. Request lặp lại với cùng key và cùng fingerprint trả về order đã tạo; nếu fingerprint khác, backend trả HTTP `409 Conflict`. Key không cần TTL và fingerprint không cần unique constraint.

#### `order_items`

Lưu các món thuộc order.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh dòng món |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài |
| `order_id` | `BIGINT UNSIGNED NOT NULL` | Order |
| `menu_item_id` | `BIGINT UNSIGNED NOT NULL` | Tham chiếu món gốc |
| `item_name` | `VARCHAR(150) NOT NULL` | Tên món được ghi nhận trong order |
| `unit_price` | `DECIMAL(15,2) NOT NULL` | Giá gốc của một đơn vị món tại thời điểm đặt |
| `options_amount` | `DECIMAL(15,2) NOT NULL DEFAULT 0` | Tổng giá option cho một đơn vị món tại thời điểm đặt |
| `quantity` | `INT UNSIGNED NOT NULL` | Số lượng món có cùng cấu hình option |
| `total_amount` | `DECIMAL(15,2) NOT NULL` | Thành tiền ban đầu: `(unit_price + options_amount) × quantity` |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

`item_name`, `unit_price`, `options_amount`, `quantity` và `total_amount` là nội dung order gốc đã được khách gửi. Các giá trị này không thay đổi khi menu được cập nhật hoặc khi yêu cầu hủy món được duyệt.

Hai món giống nhau chỉ được gộp chung một dòng và tăng `quantity` khi toàn bộ cấu hình option giống nhau. Nếu option khác nhau, hệ thống tạo các `order_items` riêng.

#### `order_item_options`

Lưu các option thực tế khách đã chọn cho một dòng món. Quan hệ `order_item_id` xác định rõ size hoặc topping thuộc món nào.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh option đã chọn |
| `order_item_id` | `BIGINT UNSIGNED NOT NULL` | Dòng món chính |
| `option_group_item_id` | `BIGINT UNSIGNED NOT NULL` | Liên kết option trong catalog tại thời điểm đặt |
| `option_group_name` | `VARCHAR(150) NOT NULL` | Snapshot tên nhóm như `Kích thước`, `Topping` |
| `option_name` | `VARCHAR(150) NOT NULL` | Snapshot tên option như `Size L`, `Trân châu` |
| `unit_price` | `DECIMAL(15,2) NOT NULL` | Giá option cho một đơn vị tại thời điểm đặt |
| `quantity_per_item` | `INT UNSIGNED NOT NULL DEFAULT 1` | Số lượng option trên mỗi đơn vị món chính |
| `total_amount` | `DECIMAL(15,2) NOT NULL` | `unit_price × quantity_per_item × order_items.quantity` tại thời điểm đặt |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |

Các trường tên và giá trong `order_item_options` là snapshot, không thay đổi khi catalog được cập nhật. Mỗi option được chọn tối đa một lần trong một dòng món; nếu hỗ trợ “double topping”, số lượng được lưu trong `quantity_per_item`.

Các công thức:

```text
options_amount
= SUM(order_item_options.unit_price × quantity_per_item)

order_items.total_amount
= (unit_price + options_amount) × quantity

order_item_options.total_amount
= unit_price × quantity_per_item × order_items.quantity
```

Với nhóm `SINGLE`, một dòng món có đúng một option và `quantity_per_item = 1`. Với nhóm `MULTIPLE`, `min_select`/`max_select` được kiểm tra trên tổng `quantity_per_item` trong nhóm.

Hệ thống không lưu ghi chú riêng trong `order_items` hoặc `order_item_options`. Ghi chú tự do của khách chỉ được lưu một lần tại `orders.note`.

Hệ thống không theo dõi trạng thái chế biến của order hoặc từng món.

#### `order_item_cancellation_requests`

Lưu yêu cầu hủy món của khách và kết quả xử lý của nhân viên.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh yêu cầu |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài |
| `order_item_id` | `BIGINT UNSIGNED NOT NULL` | Dòng món cần hủy |
| `idempotency_key` | `VARCHAR(100) NOT NULL` | Khóa chống tạo yêu cầu hủy trùng trong cùng dòng món |
| `requested_quantity` | `INT UNSIGNED NOT NULL` | Số lượng khách yêu cầu hủy |
| `reason` | `VARCHAR(1000) NULL` | Lý do yêu cầu |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái chờ xử lý, đồng ý hoặc từ chối |
| `resolved_by` | `BIGINT UNSIGNED NULL` | Tài khoản xử lý |
| `resolved_by_name` | `VARCHAR(150) NULL` | Tên người xử lý tại thời điểm thao tác |
| `resolved_at` | `DATETIME(3) NULL` | Thời điểm xử lý |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm yêu cầu |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Khi yêu cầu được đồng ý, hệ thống không cập nhật `order_items.quantity`, không cập nhật `order_items.total_amount` và không xóa dòng món. Số lượng đã hủy bằng tổng `requested_quantity` của các yêu cầu trạng thái `APPROVED`; số lượng còn tính tiền bằng số lượng ban đầu trừ số lượng đã hủy. Hệ thống dùng số lượng còn lại để cập nhật `orders.payable_amount`; `orders.original_amount` không thay đổi. Yêu cầu bị từ chối không làm thay đổi số tiền.

```text
remaining_quantity
= order_items.quantity
  - SUM(APPROVED cancellation requested_quantity)

payable_line_amount
= (order_items.unit_price + order_items.options_amount)
  × remaining_quantity
```

Việc tạo và duyệt yêu cầu hủy phải kiểm tra số lượng còn lại trong transaction để tổng số lượng đã duyệt không vượt quá `order_items.quantity` khi có xử lý đồng thời. Cặp `order_item_id + idempotency_key` là duy nhất. Request lặp lại với cùng key và cùng nội dung trả về yêu cầu cũ; cùng key nhưng khác nội dung trả HTTP `409 Conflict`.

Chỉ tạo hoặc xử lý cancellation request khi table session còn `OPEN`. Session không được chuyển sang `PAYMENT_PENDING` nếu còn cancellation request `PENDING`; sau khi chuyển trạng thái, dữ liệu cấu thành bill của session là bất biến.

### 5.5. Thanh toán

#### `unpaid_records`

Lưu khoản còn phải thu, dù được ghi nhận trước khi có payment hay phát sinh sau khi một lần thanh toán bị đánh dấu `IGNORED`. Đây là nguồn sự thật duy nhất cho theo dõi và thống kê công nợ. Payment chỉ biểu diễn từng lần thử thanh toán.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh bản ghi |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài |
| `table_session_id` | `BIGINT UNSIGNED NOT NULL` | Phiên bàn chưa thanh toán; duy nhất trong bảng |
| `amount` | `DECIMAL(15,2) NOT NULL` | Tổng tiền chưa thanh toán tại thời điểm ghi nhận |
| `bill_snapshot` | `JSON NOT NULL` | Toàn bộ nội dung bill tại thời điểm ghi nhận chưa thanh toán |
| `origin_type` | `VARCHAR(30) NOT NULL` | Nguồn tạo khoản phải thu: `LEFT_BEFORE_PAYMENT` hoặc `PAYMENT_IGNORED` |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái `OPEN` hoặc `RESOLVED` |
| `reason` | `VARCHAR(1000) NULL` | Lý do ghi nhận, nếu có |
| `reported_by` | `BIGINT UNSIGNED NOT NULL` | Tài khoản ghi nhận |
| `reported_by_name` | `VARCHAR(150) NOT NULL` | Tên người ghi nhận tại thời điểm thao tác |
| `resolution_payment_id` | `BIGINT UNSIGNED NULL` | Payment đã thu lại thành công, để trống khi chưa xử lý xong |
| `resolved_at` | `DATETIME(3) NULL` | Thời điểm xử lý xong |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Nếu khách rời đi trước khi có payment, hệ thống tạo bản ghi `origin_type = LEFT_BEFORE_PAYMENT`, lấy `amount` từ tổng `orders.payable_amount` và tạo `bill_snapshot` từ dữ liệu đã chốt. Nếu một payment hiện có bị đánh dấu `IGNORED`, hệ thống tạo hoặc sử dụng `unpaid_records`, đặt `origin_type = PAYMENT_IGNORED` khi tạo mới và sao chép `amount`, `bill_snapshot` từ payment. Sau đó hệ thống liên kết payment với khoản chưa thanh toán.

Trong cả hai trường hợp, hệ thống đóng table session với `status = CLOSED` và lưu `closed_at` nếu session chưa đóng. Snapshot của khoản chưa thanh toán là bất biến.

Khi admin tạo payment để thu lại, payment liên kết với `unpaid_records` và sao chép `amount`, `bill_snapshot` đã chốt sang payment. Payment vẫn giữ snapshot riêng để ghi nhận nội dung của chính lần tạo VietQR đó. Sau khi payment được xác nhận `PAID`, hệ thống chuyển bản ghi sang `RESOLVED`, gán `resolution_payment_id`, lưu `resolved_at` và đóng session nếu cần. Người xác nhận và thời điểm xác nhận được lấy từ payment thành công, không lặp lại trong `unpaid_records`.

#### `payments`

Lưu VietQR và kết quả xác nhận thanh toán thủ công của table session. Mỗi payment thanh toán toàn bộ các order thuộc session tại thời điểm tạo bill snapshot.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh payment |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài |
| `table_session_id` | `BIGINT UNSIGNED NOT NULL` | Phiên bàn |
| `unpaid_record_id` | `BIGINT UNSIGNED NULL` | Khoản còn phải thu mà payment đang thử thanh toán; được gán khi tạo từ khoản chưa thanh toán hoặc khi payment bị `IGNORED` |
| `reference_code` | `VARCHAR(40) NOT NULL` | Nội dung chuyển khoản duy nhất, sinh theo dạng `CAS_` + UUID |
| `bank_account_number` | `VARCHAR(34) NOT NULL` | Số tài khoản nhận tiền |
| `bank_code` | `VARCHAR(20) NOT NULL` | Mã ngân hàng |
| `bank_account_name` | `VARCHAR(150) NOT NULL` | Tên chủ tài khoản |
| `amount` | `DECIMAL(15,2) NOT NULL` | Số tiền cần thanh toán |
| `bill_snapshot` | `JSON NOT NULL` | Toàn bộ nội dung bill tại thời điểm tạo payment/VietQR |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái thanh toán |
| `qr_created_by` | `BIGINT UNSIGNED NOT NULL` | Tài khoản tạo QR |
| `confirmed_by` | `BIGINT UNSIGNED NULL` | Tài khoản xác nhận đã nhận tiền, phải trùng với `qr_created_by` |
| `confirmed_by_name` | `VARCHAR(150) NULL` | Tên người xác nhận tại thời điểm thao tác |
| `confirmed_at` | `DATETIME(3) NULL` | Thời điểm xác nhận đã nhận tiền |
| `ignored_by` | `BIGINT UNSIGNED NULL` | Tài khoản đánh dấu bỏ qua payment |
| `ignored_by_name` | `VARCHAR(150) NULL` | Tên người đánh dấu bỏ qua tại thời điểm thao tác |
| `ignored_reason` | `VARCHAR(1000) NULL` | Lý do bỏ qua payment, nếu có |
| `ignored_at` | `DATETIME(3) NULL` | Thời điểm đánh dấu bỏ qua |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo payment và VietQR |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

`bill_snapshot` là bản dữ liệu dùng để hiển thị và xác nhận bill gắn với payment. Snapshot gom toàn bộ các order của session tại thời điểm nhân viên bấm tạo QR thanh toán và không thay đổi trong suốt vòng đời payment.

Nội dung JSON cơ bản:

```json
{
  "billNumber": "BILL-20260728-001",
  "table": {
    "id": "table-id",
    "name": "Bàn 01"
  },
  "orders": [
    {
      "orderNumber": "ORD-001",
      "placedAt": "2026-07-28T10:00:00+07:00",
      "note": "Mang tất cả món ra cùng lúc",
      "items": [
        {
          "name": "Trà sữa",
          "unitPrice": 30000,
          "optionsAmount": 15000,
          "quantity": 2,
          "remainingQuantity": 2,
          "options": [
            {
              "groupName": "Kích thước",
              "name": "Size L",
              "unitPrice": 10000,
              "quantityPerItem": 1
            },
            {
              "groupName": "Topping",
              "name": "Trân châu",
              "unitPrice": 5000,
              "quantityPerItem": 1
            }
          ],
          "originalLineAmount": 90000,
          "payableLineAmount": 90000
        }
      ],
      "originalAmount": 90000,
      "payableAmount": 90000
    }
  ],
  "originalAmount": 90000,
  "payableAmount": 90000,
  "currency": "VND"
}
```

Snapshot chỉ chứa dữ liệu cần thiết của bill, không sao chép toàn bộ dữ liệu cửa hàng, menu hoặc dữ liệu kỹ thuật.

Snapshot của mỗi order cần chứa `orders.note`; các item không có trường ghi chú riêng.

CAS Backend gọi VietQR Generate API để sinh VietQR động từ tài khoản ngân hàng của quán, số tiền chính xác và nội dung chuyển khoản duy nhất. `reference_code` được sinh theo dạng `CAS_` + UUID, ví dụ `CAS_550e8400-e29b-41d4-a716-446655440000`, và không tái sử dụng cho payment khác. Frontend không gọi trực tiếp VietQR API. QR chỉ hiển thị trên web hoặc thiết bị của nhân viên, không hiển thị trực tiếp trên web khách hàng.

Sau khi khách báo đã chuyển khoản, nhân viên đã tạo QR kiểm tra ứng dụng ngân hàng. Chỉ khi nhận đúng số tiền và nội dung, chính tài khoản đã tạo QR mới được xác nhận payment là `PAID`. Nếu chưa nhận được tiền hoặc khách chuyển thiếu, payment giữ nguyên `PENDING`.

Payment `PENDING` không tự hết hạn. Nhân viên không được hủy payment, chỉ được đánh dấu payment là `IGNORED` khi cần kết thúc lần thử thanh toán này. Payment `IGNORED` được giữ lại để truy vết lịch sử nhưng không phải nguồn dữ liệu thống kê công nợ.

Khi payment được xác nhận:

- Lưu `confirmed_by`, `confirmed_by_name` và `confirmed_at`, trong đó `confirmed_by` phải bằng `qr_created_by`.
- Cập nhật table session sang `CLOSED` và lưu `closed_at`.
- Ghi thao tác xác nhận vào `audit_logs`.

Khi payment được đánh dấu bỏ qua:

- Chuyển payment sang `IGNORED`.
- Lưu `ignored_by`, `ignored_by_name`, `ignored_reason` và `ignored_at`.
- Không xóa payment và không coi payment là đã thanh toán.
- Tạo hoặc sử dụng một `unpaid_records` trạng thái `OPEN`; nếu tạo mới thì sao chép `amount` và `bill_snapshot` từ payment.
- Gán `payments.unpaid_record_id` để liên kết lần thử thanh toán với khoản còn phải thu.
- Không cộng payment `IGNORED` riêng vào báo cáo công nợ; báo cáo chỉ dùng `unpaid_records`.
- Ghi thao tác đánh dấu bỏ qua vào `audit_logs`.

Nếu sau một vài ngày khách quay lại hoặc cửa hàng cần thu hồi khoản chưa thanh toán, admin tạo một payment mới từ `unpaid_records` trạng thái `OPEN`:

- Tạo bản ghi `payments` mới với `public_id`, `reference_code` và VietQR mới.
- Gán `unpaid_record_id` và sao chép `amount`, `bill_snapshot` từ khoản chưa thanh toán.
- Không sửa trạng thái payment `IGNORED` gốc.
- Lịch sử các lần thử được truy vấn theo `unpaid_record_id` và `created_at`, không lưu chuỗi `recreated_from_payment_id`.
- Không dựng lại bill từ `orders/order_items` khi tạo lần thanh toán mới cho khoản đã chốt.
- Khi payment mới được xác nhận `PAID`, hệ thống chuyển `unpaid_records` sang `RESOLVED`, gán `resolution_payment_id`, lưu `resolved_at` và đóng session nếu chưa đóng.

Trường hợp khách rời đi trước khi yêu cầu thanh toán và chưa có payment nào được tạo được ghi nhận trong `unpaid_records` cùng `amount` và `bill_snapshot` bất biến.

### 5.6. Vận hành

#### `accounts`

Lưu tài khoản đăng nhập hệ thống. Authentication phân quyền theo role, chưa có permission chi tiết.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh tài khoản |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng |
| `username` | `VARCHAR(100) NOT NULL` | Tên đăng nhập |
| `password_hash` | `VARCHAR(255) NOT NULL` | Mật khẩu đã băm |
| `display_name` | `VARCHAR(150) NOT NULL` | Tên hiển thị |
| `role` | `VARCHAR(20) NOT NULL` | Vai trò của tài khoản |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái tài khoản |
| `last_login_at` | `DATETIME(3) NULL` | Lần đăng nhập gần nhất |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Các role cơ bản:

- `ADMIN`: quản trị cấu hình hệ thống và dữ liệu vận hành.
- `OPERATOR`: xử lý order, tạo VietQR và xác nhận thanh toán.

Khách hàng không có tài khoản đăng nhập và không phải một giá trị của `accounts.role`. Hệ thống chưa triển khai permission chi tiết cho `ADMIN` và `OPERATOR`.

Authentication sử dụng JWT:

- Access JWT có thời hạn 15 phút.
- Refresh JWT có thời hạn 10 ngày.
- Không giới hạn số thiết bị đăng nhập và không lưu cơ chế chủ động thu hồi JWT trong phạm vi hiện tại.
- Password được băm bằng BCrypt; password đầu vào phải dài hơn 8 ký tự, có ít nhất một chữ cái và một chữ số.
- Chỉ `ADMIN` được tạo tài khoản vận hành.
- Phạm vi thao tác chi tiết của `ADMIN` và `OPERATOR` sẽ được chốt sau.

#### `client_accounts`

Lưu thông tin khách hàng mở phiên bàn. Bảng này tách riêng với `accounts` vì khách hàng không phải tài khoản vận hành nội bộ của quán.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh tài khoản khách |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng |
| `phone` | `VARCHAR(20) NOT NULL` | Số điện thoại khách |
| `display_name` | `VARCHAR(150) NOT NULL` | Tên khách |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Khi người đầu tiên mở phiên bàn nhập tên và số điện thoại:

- Nếu `phone` đã tồn tại trong `client_accounts` của cửa hàng, hệ thống dùng lại tài khoản khách đó và có thể cập nhật `display_name`.
- Nếu `phone` chưa tồn tại, hệ thống tạo `client_accounts` mới.
- `table_sessions` lưu `client_account_id` để biết ai là người đại diện mở phiên bàn.
- `opened_by_customer_name` và `opened_by_customer_phone` trong `table_sessions` là snapshot tại thời điểm mở phiên, không thay đổi nếu thông tin khách được cập nhật sau này.

#### `audit_logs`

Lưu các thao tác thay đổi quan trọng như đổi giá món, thay đổi trạng thái bán của món, duyệt hủy món, xác nhận thanh toán thủ công hoặc đánh dấu payment bỏ qua.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh log |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng liên quan |
| `request_id` | `CHAR(36) NOT NULL` | UUID tương quan của request hoặc use case |
| `action` | `VARCHAR(50) NOT NULL` | Loại thao tác |
| `entity_type` | `VARCHAR(50) NOT NULL` | Loại dữ liệu bị thay đổi |
| `entity_id` | `BIGINT UNSIGNED NOT NULL` | Định danh dữ liệu |
| `entity_name` | `VARCHAR(150) NULL` | Tên hiển thị của dữ liệu bị thay đổi |
| `change_data` | `JSON NOT NULL` | Dữ liệu trước, sau và các field thay đổi |
| `actor_account_id` | `BIGINT UNSIGNED NOT NULL` | ID tài khoản thực hiện thao tác |
| `actor_name` | `VARCHAR(150) NOT NULL` | Tên người thực hiện tại thời điểm thao tác |
| `description` | `VARCHAR(1000) NULL` | Nội dung tóm tắt, nếu cần |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm thao tác |

Trong đó:

- `entity_type` có thể là `MENU_ITEM`, `ORDER`, `PAYMENT`, `UNPAID_RECORD`, `CANCELLATION_REQUEST` hoặc `DINING_TABLE`.
- `entity_id` liên kết logic tới dữ liệu gốc. Không tạo một foreign key chung vì audit log có thể tham chiếu nhiều loại bảng.
- `entity_name` giúp nhận biết nhanh dữ liệu đã thay đổi, ví dụ `Cà phê sữa`.
- `actor_account_id` lưu ID tài khoản thực hiện thao tác.
- `actor_name` lưu tên người thực hiện tại thời điểm thao tác để lịch sử không đổi khi tài khoản được cập nhật.
- `request_id` giúp gom các audit log được tạo trong cùng một request hoặc transaction nghiệp vụ.
- `change_data` lưu toàn bộ thông tin cần thiết để xem lại thay đổi.

Ví dụ `change_data` khi đổi giá món:

```json
{
  "before": {
    "name": "Cà phê sữa",
    "price": 30000,
    "availabilityStatus": "AVAILABLE"
  },
  "after": {
    "name": "Cà phê sữa",
    "price": 35000,
    "availabilityStatus": "AVAILABLE"
  },
  "changedFields": {
    "price": {
      "before": 30000,
      "after": 35000
    }
  }
}
```

Các cột ngoài JSON của bản ghi tương ứng:

```text
action          = UPDATE
entity_type     = MENU_ITEM
entity_id       = <menu_item_id>
entity_name     = Cà phê sữa
actor_account_id = <account_id>
actor_name       = Nguyễn Văn A
```

Audit log chỉ được ghi cho các thao tác quan trọng cần truy vết, không ghi mọi lần đọc dữ liệu hoặc thao tác giao diện thông thường.

## 6. Quan hệ chính

| Quan hệ | Loại |
|---|---|
| Store — Dining table | Một - nhiều |
| Dining table — QR code | Một - nhiều theo lịch sử |
| Dining table — Table session | Một - nhiều theo thời gian |
| Store — Category | Một - nhiều |
| Category — Menu item | Một - nhiều |
| Menu item — Option group | Một - nhiều |
| Option group — Option group item | Một - nhiều |
| Option menu item — Option group item | Một - nhiều |
| Table session — Order | Một - nhiều |
| Order — Order item | Một - nhiều |
| Order item — Order item option | Một - nhiều |
| Order item — Cancellation request | Một - nhiều |
| Table session — Unpaid record | Một - không hoặc một |
| Unpaid record — Payment | Một - nhiều lần thử thu, tối đa một payment được dùng để xử lý thành công |
| Table session — Payment | Một - nhiều |
| Store — Audit log | Một - nhiều |
| Account — Audit log | Một - nhiều |
| Client account — Table session | Một - nhiều |

## 7. Trạng thái dữ liệu

Các giá trị dưới đây là trạng thái đã chốt cho hệ thống.

| Entity | Trạng thái |
|---|---|
| Store | `ACTIVE`, `INACTIVE` |
| QR code | `ACTIVE`, `REVOKED` |
| Table session | `OPEN`, `PAYMENT_PENDING`, `CLOSED` |
| Unpaid record | `OPEN`, `RESOLVED` |
| Category | `ACTIVE`, `INACTIVE` |
| Menu item | `AVAILABLE`, `SOLD_OUT`, `INACTIVE` |
| Option group | `ACTIVE`, `INACTIVE` |
| Option group item | `ACTIVE`, `INACTIVE` |
| Cancellation request | `PENDING`, `APPROVED`, `REJECTED` |
| Payment | `PENDING`, `PAID`, `IGNORED` |
| Account | `ACTIVE`, `INACTIVE` |
| Account role | `ADMIN`, `OPERATOR` |

## 8. Ràng buộc và index cơ bản

### 8.1. Khóa ngoại và chính sách xóa

- Tất cả quan hệ trong mục 6 được tạo foreign key vật lý, ngoại trừ `audit_logs.entity_id` là liên kết logic tới nhiều loại entity.
- Tất cả foreign key dùng `ON DELETE RESTRICT` và `ON UPDATE RESTRICT`.
- Mỗi foreign key có index với tên tường minh để MySQL không tự tạo index ẩn.
- Dữ liệu đã được tham chiếu không bị xóa vật lý; các entity có trạng thái được chuyển sang `INACTIVE` hoặc `REVOKED`.

### 8.2. Unique constraint và quy tắc nghiệp vụ

- `dining_tables`: unique `store_id + code`.
- `table_qr_codes`: unique `token`.
- `categories`: unique `store_id + name`.
- `option_groups`: unique `menu_item_id + name`.
- `option_group_items`: unique `option_group_id + option_menu_item_id`.
- `orders`: unique `public_id`, `order_number` và cặp `table_session_id + idempotency_key`.
- `orders.request_fingerprint`: bắt buộc, do backend tạo từ SHA-256 của payload đã chuẩn hóa; không đặt unique constraint.
- `order_items`: unique `public_id`.
- `order_item_options`: unique `order_item_id + option_group_item_id`.
- Catalog đã được tham chiếu bởi order chỉ được chuyển `INACTIVE`, không xóa vật lý; snapshot trong order vẫn là nguồn hiển thị lịch sử.
- `order_item_cancellation_requests`: unique `public_id` và cặp `order_item_id + idempotency_key`.
- Tạo/resolve cancellation và chuyển session sang `PAYMENT_PENDING` phải khóa session hoặc dùng transaction tương đương để không phát sinh thay đổi sau khi bill bị khóa.
- `unpaid_records`: unique `public_id`, `table_session_id` và `resolution_payment_id`.
- `payments`: unique `public_id` và `reference_code`.
- Confirm lặp trên payment đã `PAID` là thao tác đọc idempotent: không cập nhật dữ liệu và không tạo audit log mới.
- Mỗi unpaid record chỉ được giải quyết bởi một payment `PAID`; confirm payment và cập nhật unpaid record phải nằm trong cùng transaction.
- `accounts`: unique `store_id + username`.
- `client_accounts`: unique `store_id + phone`.

### 8.3. Quy tắc chỉ kiểm tra trong Java

Database không tạo `CHECK` constraint cho các quy tắc dưới đây. Java phải kiểm tra trong application/domain layer trước khi ghi dữ liệu:

- Giá trị hợp lệ và quy tắc chuyển đổi của tất cả trạng thái.
- `categories.category_type` chỉ nhận `REGULAR` hoặc `OPTION`.
- `option_groups.menu_item_id` phải trỏ tới menu item thuộc category loại `REGULAR`; option không được có option group con.
- `option_groups.min_select >= 0`; `max_select IS NULL OR max_select >= min_select`; nhóm `SINGLE` có `max_select = 1`.
- `option_group_items.option_menu_item_id` phải trỏ tới menu item thuộc category loại `OPTION`.
- Mỗi option group có tối đa một option mặc định và option đó phải thuộc nhóm đang hoạt động. Quy tắc này không có unique constraint trong database.
- Giá tiền không âm, số lượng lớn hơn 0 và `orders.payable_amount <= orders.original_amount`.
- `unpaid_records.amount` bằng `bill_snapshot.payableAmount`; trạng thái `OPEN` không có thông tin resolve và trạng thái `RESOLVED` có đủ thông tin resolve.
- Payment và unpaid record liên quan phải thuộc cùng table session; số tiền và bill snapshot phải khớp.
- Các cột xác nhận hoặc bỏ qua payment phải phù hợp với trạng thái; `confirmed_by = qr_created_by`.
- Payment chỉ chuyển từ `PENDING` sang `PAID` hoặc `IGNORED`.

### 8.4. Unique constraint có điều kiện

MySQL dùng generated column kết hợp unique index cho các quy tắc cần chống race condition:

- `table_qr_codes.active_table_id`: nhận `table_id` khi `status = 'ACTIVE'`, ngược lại nhận `NULL`; unique index bảo đảm mỗi bàn chỉ có một QR `ACTIVE`.
- `table_sessions.open_table_id`: nhận `table_id` khi `status = 'OPEN'`, ngược lại nhận `NULL`; unique index bảo đảm mỗi bàn chỉ có một session `OPEN`.
- `payments.pending_table_session_id`: nhận `table_session_id` khi payment `PENDING` không gắn với unpaid record, ngược lại nhận `NULL`.
- `payments.pending_unpaid_record_id`: nhận `unpaid_record_id` khi payment `PENDING` gắn với unpaid record, ngược lại nhận `NULL`.
- Unique index trên hai generated column của payment bảo đảm mỗi session hoặc unpaid record chỉ có một payment `PENDING` trong đúng phạm vi tương ứng.

Java vẫn phải dùng transaction và khóa scope tương ứng khi tạo QR, session hoặc payment; unique index là lớp bảo vệ cuối cùng khi có request đồng thời.

### 8.5. Index phục vụ truy vấn menu

Giai đoạn đầu chỉ tạo thêm các performance index phục vụ luồng xem menu:

- `categories(store_id, category_type, status, display_order)`.
- `menu_items(category_id, availability_status, display_order)`.
- `option_groups(menu_item_id, status, display_order)`.
- `option_group_items(option_group_id, status, display_order)`.

Primary key, unique index và index bắt buộc cho foreign key vẫn được tạo đầy đủ. Index cho payment, unpaid record, order, cancellation request, audit log, thống kê và tìm kiếm tên món sẽ được bổ sung khi triển khai các truy vấn tương ứng và kiểm tra bằng `EXPLAIN`.

## 9. Các nội dung ngoài phạm vi hiện tại

Thiết kế hiện tại chưa bao gồm:

- Hồ sơ và lịch sử nhân viên.
- Permission chi tiết của hai role vận hành.
- Kho và nguyên vật liệu.
- Khuyến mãi, voucher và điểm thành viên.
- Hồ sơ khách hàng và CRM.
- Zalo và chiến dịch marketing.
- Game và AI.
- Hóa đơn điện tử.
- Nhiều chi nhánh với dữ liệu dùng chung.
- Báo cáo phân tích chuyên sâu.

## 10. Các quyết định đã xác nhận

- Giữ nguyên mô hình 17 bảng nghiệp vụ và các quan hệ tổng quan trong mục 4 và mục 6.
- Tất cả foreign key vật lý dùng `ON DELETE RESTRICT` và `ON UPDATE RESTRICT`; `audit_logs.entity_id` tiếp tục là liên kết logic và không có foreign key.
- Không dùng MySQL `CHECK` constraint cho quy tắc nghiệp vụ; Java chịu trách nhiệm validation.
- Generated column kết hợp unique index được dùng để bảo đảm một QR `ACTIVE` cho mỗi bàn, một session `OPEN` cho mỗi bàn và một payment `PENDING` cho mỗi session hoặc unpaid record.
- Quy tắc mỗi option group có tối đa một option mặc định chỉ được kiểm tra trong Java, không có unique constraint trong database.
- Giai đoạn đầu chỉ tạo performance index cho truy vấn menu; index cho các luồng khác được bổ sung khi triển khai truy vấn tương ứng.
- Authentication dùng access JWT 15 phút và refresh JWT 10 ngày; không giới hạn số thiết bị và chưa có cơ chế chủ động thu hồi JWT.
- Password được băm bằng BCrypt, dài hơn 8 ký tự và chứa ít nhất một chữ cái cùng một chữ số.
- Chỉ `ADMIN` được tạo tài khoản vận hành; client không có tài khoản đăng nhập; phạm vi thao tác chi tiết của `ADMIN` và `OPERATOR` được chốt sau.
- Mỗi table session có thể có nhiều order; mỗi lần khách gửi món tạo một order riêng trong cùng session.
- Tất cả trường thời gian nghiệp vụ được lưu theo `Asia/Ho_Chi_Minh` (`UTC+07:00`); giá trị thời gian trao đổi qua API phải kèm offset `+07:00`.
- Mỗi order chỉ có một ghi chú chung trong `orders.note`; không lưu `note` trong `order_items`.
- Tạo order bắt buộc có `idempotency_key`; key duy nhất trong cùng table session, được lưu trong `orders` và được bảo vệ bằng unique constraint `table_session_id + idempotency_key`.
- Backend lưu `orders.request_fingerprint` từ SHA-256 của payload chuẩn hóa để phân biệt retry hợp lệ với việc tái sử dụng key cho nội dung khác.
- `orders.original_amount` là tổng tiền ban đầu và bất biến; `orders.payable_amount` là số tiền còn phải trả sau các yêu cầu hủy `APPROVED`.
- Option là `menu_items` thuộc category loại `OPTION`; không dùng bảng `option_values`.
- `option_group_items` xác định option nào được phép chọn cho từng nhóm của món; `order_item_options` lưu option thực tế của từng dòng món.
- Giá món chính nằm ở `order_items.unit_price`; giá option nằm ở `order_item_options.unit_price`; `order_items.options_amount` là tổng giá option trên một đơn vị món.
- Hai món có cấu hình option khác nhau phải nằm ở hai `order_items` khác nhau.
- Thanh toán toàn bộ các order của phiên bàn, chưa hỗ trợ tách hóa đơn.
- Khi yêu cầu thanh toán, session cũ ngừng nhận món. Lượt gọi thêm sau đó thuộc một session và payment mới, không liên quan session cũ.
- `orders` không có trạng thái riêng; trạng thái xử lý được quản lý ở `table_sessions`.
- `table_sessions` không lưu `is_paid`; payment `PAID` và `unpaid_records` là nguồn xác định kết quả thanh toán.
- `table_sessions.payment_requested_at` được lưu khi session chuyển từ `OPEN` sang `PAYMENT_PENDING`.
- Size có một giá trị mặc định được cấu hình theo món.
- Topping không giới hạn số lựa chọn.
- Không theo dõi trạng thái chế biến của order hoặc từng món.
- Yêu cầu hủy món phải được nhân viên đồng ý hoặc từ chối. Khi đồng ý, hệ thống tính lại tổng tiền.
- Duyệt hủy món không sửa hoặc xóa dữ liệu gốc trong `order_items`; số lượng đã hủy được tính từ các yêu cầu `APPROVED`.
- `dining_tables` không lưu trạng thái; bàn đang có khách được suy ra từ session `OPEN`.
- VietQR thanh toán tự sinh theo đúng số tiền và nội dung chuyển khoản duy nhất.
- VietQR chỉ hiển thị trên web hoặc thiết bị của nhân viên.
- Nhân viên kiểm tra ứng dụng ngân hàng và xác nhận thủ công khi nhận đúng số tiền, đúng nội dung.
- Tài khoản tạo QR thanh toán phải là tài khoản xác nhận payment. Nhân viên khác không được xác nhận thay.
- Nếu chưa nhận được tiền hoặc khách chuyển thiếu, payment tiếp tục ở trạng thái `PENDING`.
- Payment `PENDING` không tự hết hạn.
- Nhân viên không được hủy payment, chỉ được đánh dấu là `IGNORED`.
- Payment `IGNORED` không bị xóa nhưng chỉ dùng để truy vết một lần thử thanh toán đã kết thúc.
- `unpaid_records` là nguồn sự thật duy nhất cho khoản còn phải thu và báo cáo công nợ; payment `IGNORED` không được cộng riêng.
- Nếu cần thu lại tiền sau một payment `IGNORED`, admin tạo payment mới từ `unpaid_records` với mã chuyển khoản và VietQR mới.
- Trường hợp khách rời đi trước khi tạo payment được lưu trong `unpaid_records`; session được đóng để giải phóng bàn, không thêm trạng thái `UNPAID` hoặc cờ `is_paid` vào `table_sessions`.
- `unpaid_records` lưu `amount` và `bill_snapshot` bất biến tại thời điểm ghi nhận; payment thu lại sao chép dữ liệu đã chốt này và vẫn lưu snapshot riêng.
- `unpaid_records.origin_type` phân biệt khách rời đi trước payment và khoản phát sinh từ payment `IGNORED`.
- Các lần thử thanh toán của cùng khoản phải thu liên kết bằng `payments.unpaid_record_id`; không dùng `recreated_from_payment_id`.
- Chỉ session `OPEN` chiếm dụng bàn; session `PAYMENT_PENDING` không ngăn việc tạo session `OPEN` mới cho cùng bàn.
- Một bàn không bao giờ được có nhiều hơn một session `OPEN` tại cùng một thời điểm, kể cả khi có nhiều yêu cầu tạo session đồng thời.
- Nhiều điện thoại quét cùng QR dùng chung session và nhìn thấy cùng danh sách order.
- Người đầu tiên mở session bàn cần nhập tên và số điện thoại; hệ thống tạo hoặc dùng lại `client_accounts`; người quét QR sau trong cùng session không cần nhập lại.
- Order không cần bước xác nhận trước khi cửa hàng xử lý.
- Hệ thống không tách màn hình bếp và phục vụ.
- Không lưu bảng lịch sử giá món riêng.
- Mỗi món chỉ có một ảnh.
- `menu_items.image_storage_key` được dùng để quản lý asset trên dịch vụ lưu trữ; `image_url` chỉ phục vụ hiển thị.
- QR bàn là mã cố định được in và dán tại bàn; QR thanh toán được sinh động theo payment.
- Mỗi cửa hàng dùng một tài khoản ngân hàng nhận tiền. Hệ thống hiện vận hành một cửa hàng.
- Mã chuyển khoản của payment dùng `reference_code` sinh theo dạng `CAS_` + UUID và không tái sử dụng.
- Ảnh món được frontend gửi qua CAS Backend; backend upload lên Cloudinary bằng authenticated API.
- CAS Backend gọi VietQR Generate API để sinh mã; VietQR không tham gia xác nhận thanh toán.

## 11. Bước tiếp theo

1. Tạo Flyway migration khởi tạo schema nghiệp vụ theo các quyết định đã chốt.
2. Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.

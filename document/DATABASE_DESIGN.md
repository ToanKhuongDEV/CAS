# CAS — Thiết kế database cơ bản

## 1. Mục đích

Tài liệu mô tả mô hình dữ liệu cơ bản cho CAS, bao gồm:

- Quản lý cửa hàng, bàn và mã QR.
- Quản lý menu.
- Phiên sử dụng bàn.
- Gọi món và xử lý order.
- Yêu cầu thanh toán và xác nhận trạng thái thủ công.
- Tài khoản, phân quyền theo role và nhật ký cơ bản.
- Cấu hình khuyến mãi 

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
- Toàn bộ nội dung bill được lưu trong JSON snapshot khi tạo payment và khi ghi nhận khoản chưa thanh toán.
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
- `option_values.is_default` dùng `DEFAULT FALSE`.
- `stores`, `table_qr_codes`, `categories`, `option_groups`, `option_values` và `accounts` dùng trạng thái mặc định `ACTIVE`.
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
| Menu | `tags` | Nhãn có thể gắn cho món hoặc option |
| Menu | `menu_item_tags` | Liên kết nhiều-nhiều giữa món và nhãn |
| Menu | `option_groups` | Nhóm lựa chọn dùng chung hoặc thuộc cửa hàng (như Kích thước, Đường, Topping) |
| Menu | `option_values` | Các giá trị bên trong nhóm lựa chọn (như Size L, 50%, Trân châu) |
| Menu | `menu_item_option_groups` | Liên kết nhiều-nhiều giữa món và nhóm lựa chọn |
| Phiên bàn | `table_sessions` | Lượt sử dụng bàn |
| Order | `orders` | Các order thuộc mỗi phiên bàn |
| Order | `order_items` | Các món trong order |
| Order | `order_item_options` | Các option thực tế đã chọn cho từng dòng món |
| Order | `order_item_cancellation_requests` | Yêu cầu hủy món và kết quả xử lý |
| Chưa thanh toán | `unpaid_records` | Ghi nhận phiên bàn đóng khi payment chưa được xác nhận |
| Thanh toán | `payments` | Yêu cầu, trạng thái xác nhận và JSON snapshot của bill |
| Dịch vụ đặt trước | `service_bookings` | Dịch vụ được chốt tên và giá qua Zalo, thanh toán độc lập với phiên bàn |
| Tài khoản | `accounts` | Tài khoản đăng nhập hệ thống |
| Tài khoản khách | `client_accounts` | Thông tin khách hàng mở phiên bàn |
| Vận hành | `operational_incidents` | Báo cáo sự cố phát sinh do nhân viên vận hành ghi nhận trong ca |
| Vận hành | `audit_logs` | Nhật ký thao tác quan trọng |
| Khuyến mãi | `promotions` | Chương trình khuyến mãi và loại ưu đãi |
| Mã khuyến mãi | `promotion_codes` | Mã nhập tùy chọn của chương trình khuyến mãi |
| Khuyến mãi | `promotion_targets` | Phạm vi áp dụng theo món hoặc danh mục |
| Khuyến mãi | `promotion_redemptions` | Lịch sử chương trình đã được sử dụng |
| Giảm giá bill | `bill_discounts` | Snapshot discount thực tế áp dụng cho bill của table session |
| Thông báo | `system_notifications` | Thông báo hệ thống và tin tức vận hành |
| Người nhận thông báo | `system_notification_recipients` | Trạng thái đọc của từng account hoặc table session nhận thông báo |

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
  │            ├── payments
  │            └── bill_discounts
  │
  ├── categories
  │     └── menu_items
  │            ├── menu_item_tags ─── tags
  │            └── menu_item_option_groups
  │                    └── option_groups
  │                           └── option_values
  │
  ├── option_groups (store_id)
  ├── accounts
  ├── client_accounts
  ├── operational_incidents
  ├── service_bookings
  ├── system_notifications
  │     └── system_notification_recipients
  └── promotions
        ├── promotion_targets
        └── promotion_redemptions

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
| `address` | `VARCHAR(500) NOT NULL` | Địa chỉ cửa hàng |
| `phone` | `VARCHAR(20) NOT NULL` | Số điện thoại hotline |
| `email` | `VARCHAR(254) NOT NULL` | Email liên hệ |
| `google_maps_location` | `VARCHAR(2048) NULL` | Đường dẫn Google Maps hoặc cặp tọa độ vị trí cửa hàng |
| `open_time` | `TIME NOT NULL` | Giờ mở cửa theo giờ địa phương của cửa hàng |
| `close_time` | `TIME NOT NULL` | Giờ đóng cửa theo giờ địa phương của cửa hàng |
| `welcome_slogan` | `VARCHAR(500) NULL` | Thông điệp/slogan chào mừng hiển thị cho khách |
| `long_wait_warning_minutes` | `SMALLINT UNSIGNED NOT NULL DEFAULT 25` | Ngưỡng cảnh báo bàn chờ lâu, tính theo phút |
| `timezone` | `VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh'` | Múi giờ vận hành, dùng cố định `Asia/Ho_Chi_Minh` (`UTC+07:00`) |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái hoạt động |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Hệ thống hiện vận hành một cửa hàng nhưng vẫn giữ entity `stores` để dữ liệu có ngữ cảnh rõ ràng. Các trường liên hệ, vị trí, giờ hoạt động và slogan được `ADMIN` cấu hình từ màn hình Settings; Customer có thể dùng dữ liệu công khai này để xem thông tin cửa hàng. CAS không lưu thông tin tài khoản ngân hàng. Giá trị `stores.timezone` mặc định là `Asia/Ho_Chi_Minh` và không cho phép thay đổi.

#### `dining_tables`

Lưu thông tin bàn.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh bàn |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng |
| `code` | `INT UNSIGNED NOT NULL` | Mã bàn |
| `capacity` | `SMALLINT UNSIGNED NULL` | Sức chứa bàn, nếu cửa hàng cần quản lý |
| `created_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin tạo bàn |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Trạng thái bàn trống hay đang có khách được suy ra từ việc tồn tại một `table_sessions` trạng thái `OPEN` hoặc `PAYMENT_PENDING`, không lưu trong `dining_tables`.

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
| `created_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin tạo danh mục |
| `updated_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin cập nhật gần nhất |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `menu_items`

Lưu thông tin món.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh món |
| `category_id` | `BIGINT UNSIGNED NOT NULL` | Danh mục |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng, được lưu dư thừa có kiểm soát để DB bảo đảm món và danh mục cùng cửa hàng |
| `name` | `VARCHAR(150) NOT NULL` | Tên món |
| `description` | `TEXT NULL` | Mô tả |
| `price` | `DECIMAL(15,2) NOT NULL` | Giá hiện tại |
| `image_url` | `VARCHAR(2048) NULL` | URL hình ảnh |
| `image_storage_key` | `VARCHAR(512) NULL` | Khóa asset trên dịch vụ lưu trữ để thay thế hoặc xóa ảnh |
| `availability_status` | `VARCHAR(20) NOT NULL` | Trạng thái còn hoặc hết món |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị |
| `created_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin tạo món |
| `updated_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin/Nhân viên cập nhật gần nhất |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `tags`

Lưu các nhãn dùng chung trong phạm vi cửa hàng, ví dụ `Bán chạy` hoặc `Món mới`.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh nhãn |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng sở hữu nhãn |
| `name` | `VARCHAR(150) NOT NULL` | Tên nhãn |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái sử dụng nhãn |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `menu_item_tags`

Liên kết nhiều-nhiều giữa `menu_items` và `tags`. Một menu item có thể có nhiều tag và một tag có thể được gắn cho nhiều menu item.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `menu_item_id` | `BIGINT UNSIGNED NOT NULL` | Menu item được gắn nhãn |
| `tag_id` | `BIGINT UNSIGNED NOT NULL` | Nhãn được gắn |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng, dùng trong composite FK để menu item và tag phải cùng cửa hàng |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm gắn nhãn |

Hệ thống không giới hạn tag theo `category_type`; tag có thể gắn với bất kỳ bản ghi nào trong `menu_items`.
Composite FK trên `(menu_item_id, store_id)` và `(tag_id, store_id)` ngăn liên kết menu item với tag của cửa hàng khác.

#### `option_groups`

Lưu các nhóm lựa chọn của cửa hàng như `Kích thước`, `Độ ngọt`, `Topping` hoặc `Cấp độ cay`.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh nhóm lựa chọn |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng sở hữu nhóm lựa chọn |
| `name` | `VARCHAR(150) NOT NULL` | Tên nhóm lựa chọn |
| `selection_type` | `VARCHAR(20) NOT NULL` | Loại lựa chọn (`SINGLE`, `MULTIPLE`) |
| `min_select` | `SMALLINT UNSIGNED NOT NULL DEFAULT 0` | Số lượng chọn tối thiểu |
| `max_select` | `SMALLINT UNSIGNED NULL` | Số lựa chọn tối đa; `NULL` nghĩa là không giới hạn |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái sử dụng |
| `created_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin tạo nhóm option |
| `updated_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin cập nhật gần nhất |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Kiểu lựa chọn được xác định qua `selection_type` (`SINGLE` hoặc `MULTIPLE`). Với nhóm `SINGLE`, hệ thống hiển thị radio; với nhóm `MULTIPLE`, hệ thống hiển thị checkbox.

#### `option_values`

Lưu các giá trị cụ thể nằm bên trong nhóm lựa chọn (ví dụ: `Size L`, `50%`, `Trân châu`). Topping và size nằm riêng trong `option_values`, không thuộc `menu_items`.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh giá trị lựa chọn |
| `option_group_id` | `BIGINT UNSIGNED NOT NULL` | Nhóm lựa chọn chứa giá trị này |
| `name` | `VARCHAR(150) NOT NULL` | Tên giá trị (ví dụ: `Size L`, `50%`, `Trân châu`) |
| `extra_price` | `DECIMAL(15,2) NOT NULL DEFAULT 0.00` | Giá cộng thêm của lựa chọn |
| `is_default` | `BOOLEAN NOT NULL DEFAULT FALSE` | Giá trị mặc định của nhóm |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái sử dụng |
| `created_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin tạo option value |
| `updated_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin cập nhật gần nhất |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `menu_item_option_groups`

Liên kết nhiều-nhiều giữa `menu_items` và `option_groups` để xác định món ăn/đồ uống nào sử dụng những nhóm lựa chọn nào.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh liên kết |
| `menu_item_id` | `BIGINT UNSIGNED NOT NULL` | Món áp dụng |
| `option_group_id` | `BIGINT UNSIGNED NOT NULL` | Nhóm lựa chọn được áp dụng |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng, dùng trong composite FK để món và nhóm option phải cùng cửa hàng |
| `display_order` | `INT UNSIGNED NOT NULL DEFAULT 0` | Thứ tự hiển thị nhóm trong món |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm liên kết |

Ví dụ:

```text
Trà sữa (menu_items)
└── menu_item_option_groups
    ├── Kích thước (option_groups: selection_type = SINGLE, min_select = 1, max_select = 1)
    │   ├── option_values: Size M (extra_price = 0, is_default = true)
    │   └── option_values: Size L (extra_price = 10.000)
    ├── Độ ngọt (option_groups: selection_type = SINGLE, min_select = 0, max_select = 1)
    │   ├── option_values: 30% (extra_price = 0)
    │   ├── option_values: 50% (extra_price = 0)
    │   └── option_values: 100% (extra_price = 0, is_default = true)
    └── Topping (option_groups: selection_type = MULTIPLE, min_select = 0, max_select = NULL)
        ├── option_values: Trân châu (extra_price = 5.000)
        └── option_values: Pudding (extra_price = 7.000)
```

Category loại `OPTION` không hiển thị như danh mục món chính trên giao diện khách. Một option có thể được liên kết với nhiều nhóm của nhiều món. Menu item loại option không được có option group con.

`menu_items.store_id` phải khớp `categories.store_id`. Composite FK của
`menu_item_option_groups` tiếp tục bảo đảm menu item và option group cùng cửa hàng.

Ảnh món được quản lý qua CAS Backend. Backend nhận file từ giao diện admin, upload lên Cloudinary bằng authenticated API, sau đó lưu URL hiển thị vào `image_url` và khóa asset vào `image_storage_key`. Frontend không upload trực tiếp lên Cloudinary.

### 5.3. Khuyến mãi và snapshot discount

Tất cả record của mô hình khuyến mãi và snapshot discount phải có `store_id`
để dữ liệu luôn được xác định trong đúng cửa hàng khi CAS mở rộng thành chuỗi.
Backend phải kiểm tra store của promotion, table session, order, order item,
payment và code trước mọi thao tác áp dụng hoặc xác nhận redemption.

#### `promotions`

Lưu chương trình khuyến mãi gốc. Một promotion thuộc đúng một store. Điều kiện
cơ bản được lưu trực tiếp trong bảng để mô hình giai đoạn hiện tại giữ đơn giản.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh nội bộ |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài hệ thống |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng sở hữu promotion |
| `name` | `VARCHAR(150) NOT NULL` | Tên chương trình để hiển thị và snapshot |
| `promotion_type` | `VARCHAR(30) NOT NULL` | `PERCENT_OFF`, `FIXED_AMOUNT_OFF`, `ITEM_PERCENT_OFF` hoặc `ITEM_FIXED_OFF` |
| `discount_value` | `DECIMAL(15,2) NULL` | Giá trị giảm khi loại promotion sử dụng giá trị này |
| `max_discount_amount` | `DECIMAL(15,2) NULL` | Mức giảm tối đa cho `PERCENT_OFF`; `NULL` là không giới hạn |
| `min_bill_amount` | `DECIMAL(15,2) NULL` | Giá trị bill tối thiểu; `NULL` là không yêu cầu |
| `max_redemptions` | `INT UNSIGNED NULL` | Giới hạn tổng redemption `COMPLETED`; `NULL` là không giới hạn |
| `max_redemptions_per_customer` | `INT UNSIGNED NULL` | Giới hạn số bill mỗi khách dùng promotion; `NULL` là không giới hạn |
| `status` | `VARCHAR(20) NOT NULL` | `DRAFT`, `ACTIVE` hoặc `INACTIVE` |
| `start_at` | `DATETIME(3) NULL` | `NULL` nghĩa là không giới hạn thời điểm bắt đầu |
| `end_at` | `DATETIME(3) NULL` | `NULL` nghĩa là không có ngày hết hạn |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Promotion hết hạn được suy ra khi `now > end_at`; không có trạng thái `EXPIRED`
được lưu. `BUY_X_GET_Y`, `FREE_ITEM` và điều kiện phức tạp hơn không thuộc mô
hình hiện tại; chỉ tách bảng điều kiện khi cần mở rộng các rule đó.

#### `promotion_codes`

Lưu mã nhập tùy chọn của promotion. Một promotion có thể không có code (tự động
áp dụng khi thỏa điều kiện) hoặc có một hay nhiều code.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh nội bộ |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng sở hữu code |
| `promotion_id` | `BIGINT UNSIGNED NOT NULL` | Promotion của code |
| `code` | `VARCHAR(100) NOT NULL` | Mã khách nhập, unique trong store |
| `max_redemptions` | `INT UNSIGNED NULL` | Giới hạn redemption `COMPLETED` của riêng code; `NULL` là không giới hạn |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `promotion_targets`

Lưu phạm vi áp dụng của promotion. Mỗi record có `id`, `store_id`,
`promotion_id`, `target_type` (`MENU_ITEM` hoặc `CATEGORY`) và `target_id`.
Promotion không có record target áp dụng trên toàn bộ bill theo điều kiện cơ bản
của chương trình. Vì `target_id` là liên kết đa hình nên không có foreign key
vật lý: khi tạo hoặc cập nhật record, backend phải phân luồng theo
`target_type`, chỉ chấp nhận `MENU_ITEM` hoặc `CATEGORY`, rồi kiểm tra
`target_id` thực sự tồn tại lần lượt trong `menu_items` hoặc `categories` và
thuộc cùng `store_id` với promotion trước khi ghi dữ liệu.

#### `promotion_redemptions`

Lưu lịch sử sử dụng sau khi payment của table session đã chuyển `PAID`. Mỗi
record có `store_id`, `promotion_id`, `client_account_id`, `table_session_id`,
`payment_id`, `status`, `created_at` và `reversed_at` khi phù hợp. Trạng thái
gồm `COMPLETED` và `REVERSED`; redemption `REVERSED` không được tính vào quota
sử dụng. Backend kiểm tra quota theo promotion và `client_account_id` trong
transaction tạo redemption.

#### `bill_discounts`

Promotion được chọn cho toàn bộ bill của table session. Trước khi tạo payment,
backend có thể tính lại discount khi order của session thay đổi. Khi session
chuyển `PAYMENT_PENDING`, các bảng snapshot discount được khóa bất biến.

Mỗi record snapshot có `store_id` và phải lưu tối thiểu `promotion_id`,
`promotion_name`, `code`, `promotion_type`, `discount_value`, `discount_amount`,
`max_discount_amount`, các điều kiện quan trọng và `promotion_snapshot` dạng
JSON. `bill_discounts` gắn với `table_session_id` và bill/payment khi đã được
tạo; không phân bổ discount cấp bill xuống từng order hoặc từng dòng món trong
giai đoạn hiện tại.

Giá niêm yết `menu_items.price` không bị sửa khi chạy promotion. Snapshot
discount là nguồn xác định số tiền giảm của bill lịch sử khi promotion hoặc code
thay đổi sau này.

#### `system_notifications`

Lưu notification broadcast do `ADMIN` phát hành cho Operator, Customer hoặc cả hai.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh notification |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng phát hành notification |
| `title` | `VARCHAR(200) NOT NULL` | Tiêu đề |
| `content` | `TEXT NOT NULL` | Nội dung |
| `type` | `VARCHAR(20) NOT NULL DEFAULT 'INFO'` | Mức độ notification |
| `target_role` | `VARCHAR(20) NOT NULL DEFAULT 'BOTH'` | Đối tượng nhận: `OPERATOR`, `CUSTOMER` hoặc `BOTH` |
| `created_by` | `BIGINT UNSIGNED NULL` | Tài khoản Admin phát hành |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm phát hành |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `system_notification_recipients`

Lưu trạng thái notification theo từng account Operator hoặc table session Customer.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh recipient |
| `notification_id` | `BIGINT UNSIGNED NOT NULL` | Notification được nhận |
| `account_id` | `BIGINT UNSIGNED NULL` | Account Operator nhận notification |
| `table_session_id` | `BIGINT UNSIGNED NULL` | Table session Customer nhận notification |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'UNREAD'` | Trạng thái `UNREAD` hoặc `READ` |
| `read_at` | `DATETIME(3) NULL` | Thời điểm đã đọc |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo recipient |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

`CHECK` constraint bắt buộc đúng một trong `account_id` và `table_session_id` có
giá trị. Cặp `notification_id + account_id` và `notification_id + table_session_id`
là unique.

### 5.4. Phiên sử dụng bàn

#### `table_sessions`

Đại diện cho một lượt khách sử dụng bàn.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh phiên |
| `table_id` | `BIGINT UNSIGNED NOT NULL` | Bàn |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng ở giao diện khách |
| `client_account_id` | `BIGINT UNSIGNED NOT NULL` | Tài khoản khách đầu tiên mở phiên bàn |
| `opened_by_customer_name` | `VARCHAR(150) NOT NULL` | Tên khách đầu tiên mở phiên bàn |
| `opened_by_customer_phone` | `VARCHAR(20) NULL` | Số điện thoại khách đầu tiên mở phiên bàn; `NULL` khi là khách lẻ |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái phiên |
| `payment_requested_at` | `DATETIME(3) NULL` | Thời điểm khách yêu cầu thanh toán, để trống khi chưa yêu cầu |
| `closed_at` | `DATETIME(3) NULL` | Thời điểm đóng |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm phiên bắt đầu |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Table session ở trạng thái `OPEN` hoặc `PAYMENT_PENDING` được xem là đang chiếm dụng bàn. Mỗi bàn chỉ được có tối đa một session đang chiếm dụng tại cùng một thời điểm. Người đầu tiên mở phiên bàn cần nhập tên, còn số điện thoại là tùy chọn. Nếu có số điện thoại, hệ thống tạo hoặc tìm `client_accounts` theo số đó; nếu không có, hệ thống tạo một `client_accounts` khách lẻ với `phone = NULL`. Session luôn gắn `client_account_id` và lưu snapshot tên/SĐT người mở phiên; `opened_by_customer_phone` là `NULL` cho khách lẻ. Nhiều điện thoại quét cùng QR sau đó sẽ dùng chung session đang chiếm dụng, không cần nhập lại thông tin khách và nhìn thấy cùng danh sách order của phiên bàn.

Khi khách yêu cầu thanh toán, session chuyển sang `PAYMENT_PENDING`, không nhận thêm món và vẫn chiếm dụng bàn. Chỉ khi session được đóng mới có thể tạo session mới cho cùng bàn.

Table session không lưu `is_paid`. Kết quả thanh toán được xác định từ `payments.status`; `unpaid_records` ghi nhận trường hợp phiên đã đóng khi payment vẫn `PENDING`, còn `table_sessions.status` chỉ quản lý vòng đời sử dụng bàn.

### 5.5. Order

#### `orders`

Lưu một lần gửi món của một table session. Khách hoặc `OPERATOR` tạo order hộ có
thể gửi món nhiều lần trong cùng session; mỗi lần gửi tạo một order riêng cho
đến khi yêu cầu thanh toán.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh order |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài |
| `table_session_id` | `BIGINT UNSIGNED NOT NULL` | Phiên bàn |
| `created_by_account_id` | `BIGINT UNSIGNED NULL` | Tài khoản nhân viên tạo order hộ; `NULL` khi do Khách tự đặt qua QR |
| `idempotency_key` | `VARCHAR(100) NOT NULL` | Khóa chống tạo order trùng cho một lần submit trong cùng phiên bàn |
| `request_fingerprint` | `CHAR(64) NOT NULL` | SHA-256 dạng hexadecimal của payload order đã được backend chuẩn hóa |
| `order_number` | `VARCHAR(50) NOT NULL` | Mã hiển thị cho cửa hàng |
| `original_amount` | `DECIMAL(15,2) NOT NULL` | Tổng tiền order tại thời điểm khách gửi, bất biến |
| `payable_amount` | `DECIMAL(15,2) NOT NULL` | Số tiền hiện còn phải trả sau các yêu cầu hủy được duyệt |
| `note` | `VARCHAR(1000) NULL` | Ghi chú chung cho toàn bộ lần gọi món |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Một `table_session_id` có thể xuất hiện ở nhiều bản ghi trong `orders`, tương ứng một session có nhiều order theo từng lần khách gửi món.

Danh sách đơn gọi món của Operation được sắp xếp FIFO theo
`orders.created_at ASC`: order được tạo trước được ưu tiên lên món trước. Order
gọi thêm là bản ghi mới nên nằm sau các order có `created_at` sớm hơn. Quy tắc
này không bổ sung trạng thái chế biến vào `orders`; CAS chỉ cung cấp thứ tự ưu
tiên cho nhân viên xử lý. Nếu hai hoặc nhiều order có cùng `created_at` đến độ
chính xác millisecond, thứ tự giữa chúng không cần được bảo đảm và không cần
khóa sắp xếp phụ.

Dashboard Operation xác định order có `created_at` sớm nhất trong từng
`table_session_id` mà vẫn còn ít nhất một phần chưa làm xong. Thời điểm của
order đó là mốc tính thời gian chờ của bàn; order gọi thêm không làm đặt lại mốc
nếu order cũ hơn vẫn còn món cần làm. Chức năng cảnh báo này dùng dữ liệu hiện
có, không bổ sung cột trạng thái hoặc cột thời gian chờ vào database; ngưỡng
cảnh báo do `ADMIN` cấu hình tại `stores.long_wait_warning_minutes` và được
backend áp dụng.

`idempotency_key` do frontend tạo mới cho mỗi lần submit order và được lưu bền vững cùng order. Backend chuẩn hóa payload, tính SHA-256 và lưu vào `request_fingerprint`; client không được gửi hoặc quyết định fingerprint. Cặp `table_session_id + idempotency_key` là duy nhất. Request lặp lại với cùng key và cùng fingerprint trả về order đã tạo; nếu fingerprint khác, backend trả HTTP `409 Conflict`. Key không cần TTL và fingerprint không cần unique constraint.

Order do `OPERATOR` tạo hộ dùng cùng cấu trúc dữ liệu và quy tắc tính tiền với
order do Customer gửi. Cột `created_by_account_id` lưu ID tài khoản nhân viên thao tác
(với order do Khách gửi qua QR, cột này mang giá trị `NULL`). Việc truy vết nhân viên
thực hiện đồng thời được ghi trong `audit_logs` với `entity_type = ORDER`, `entity_id`
là order vừa tạo và `actor_account_id` là tài khoản đăng nhập; không lấy danh tính
nhân viên từ payload client.

#### `order_items`

Lưu các món thuộc order.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh dòng món |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài hệ thống |
| `order_id` | `BIGINT UNSIGNED NOT NULL` | Order |
| `menu_item_id` | `BIGINT UNSIGNED NOT NULL` | Tham chiếu món gốc |
| `item_name` | `VARCHAR(150) NOT NULL` | Tên món được ghi nhận trong order |
| `unit_price` | `DECIMAL(15,2) NOT NULL` | Giá gốc của một đơn vị món tại thời điểm đặt |
| `options_amount` | `DECIMAL(15,2) NOT NULL DEFAULT 0` | Tổng giá option cho một đơn vị món tại thời điểm đặt |
| `quantity` | `INT UNSIGNED NOT NULL` | Số lượng món có cùng cấu hình option |
| `prepared_quantity` | `INT UNSIGNED NOT NULL DEFAULT 0` | Số phần đã được nhân viên ghi nhận làm xong |
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
| `option_value_id` | `BIGINT UNSIGNED NOT NULL` | Liên kết tới giá trị lựa chọn tại thời điểm đặt |
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

Với nhóm `SINGLE`, tổng `quantity_per_item` trong một nhóm không vượt quá 1. Với nhóm `MULTIPLE`, `max_select` được kiểm tra trên tổng `quantity_per_item` trong nhóm khi giá trị này không phải `NULL`.

Hệ thống không lưu ghi chú riêng trong `order_items` hoặc `order_item_options`. Ghi chú tự do của khách chỉ được lưu một lần tại `orders.note`.

`prepared_quantity` mặc định bằng `0` và chỉ tăng khi nhân viên ghi nhận số phần
đã làm xong. Số lượng hiệu lực bằng `quantity` trừ tổng số lượng hủy
`APPROVED`; số lượng còn cần làm bằng số lượng hiệu lực trừ
`prepared_quantity`. Java phải bảo đảm `prepared_quantity` không vượt số lượng
hiệu lực. Order không lưu boolean hoặc status hoàn thành; trạng thái hoàn thành
được suy ra khi mọi dòng món còn hiệu lực đều không còn số lượng cần làm.

Màn tổng hợp chế biến gộp các dòng theo `menu_item_id` và tập cấu hình option
thực tế trong `order_item_options`. Chỉ các tập option giống hoàn toàn mới được
gộp chung. Khi nhân viên hoàn thành một mẻ, backend phân bổ số lượng về các
`order_items` theo `orders.created_at ASC` trong một transaction.

#### `preparation_batch_completions`

Lưu một lần hoàn thành theo mẻ của nhân viên để thao tác có idempotency bền
vững. Record được tạo trong cùng transaction với việc tăng
`order_items.prepared_quantity` theo FIFO.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh nội bộ |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài hệ thống |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng thực hiện |
| `menu_item_id` | `BIGINT UNSIGNED NOT NULL` | Món chính của nhóm chế biến |
| `option_configuration_hash` | `CHAR(64) NOT NULL` | SHA-256 của tập option chuẩn hóa, xác định đúng nhóm món được hoàn thành |
| `idempotency_key` | `VARCHAR(100) NOT NULL` | Khóa idempotency do client tạo cho một lần hoàn thành mẻ, unique trong store |
| `request_fingerprint` | `CHAR(64) NOT NULL` | SHA-256 payload đã được backend chuẩn hóa để phân biệt retry hợp lệ |
| `requested_quantity` | `INT UNSIGNED NOT NULL` | Số phần nhân viên yêu cầu ghi nhận hoàn thành |
| `allocation_snapshot` | `JSON NOT NULL` | Kết quả phân bổ FIFO bất biến theo từng order item, dùng để trả lại khi retry |
| `completed_by_account_id` | `BIGINT UNSIGNED NOT NULL` | Tài khoản Operator thực hiện |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm hoàn thành |

Cặp `store_id + idempotency_key` là unique. Khi nhận lại cùng key, backend tính
fingerprint từ payload chuẩn hóa: nếu trùng thì trả `allocation_snapshot` đã lưu;
nếu khác thì trả HTTP `409 Conflict`. Backend phải chèn record này và cập nhật
`prepared_quantity` trong cùng transaction, nên retry không thể phân bổ hoặc
cộng số phần thêm lần nữa.

#### `order_item_cancellation_requests`

Lưu yêu cầu hủy món của khách và kết quả xử lý của nhân viên.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh yêu cầu |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài hệ thống |
| `order_item_id` | `BIGINT UNSIGNED NOT NULL` | Dòng món cần hủy |
| `created_by_account_id` | `BIGINT UNSIGNED NULL` | Tài khoản nhân viên khởi tạo yêu cầu hủy (Hủy sự cố); `NULL` khi do Khách tự gửi |
| `created_by_name` | `VARCHAR(150) NULL` | Tên người khởi tạo yêu cầu tại thời điểm thao tác |
| `idempotency_key` | `VARCHAR(100) NOT NULL` | Khóa chống tạo yêu cầu hủy trùng trong cùng dòng món |
| `requested_quantity` | `INT UNSIGNED NOT NULL` | Số lượng khách yêu cầu hủy |
| `reason` | `VARCHAR(1000) NULL` | Lý do yêu cầu |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái chờ xử lý, đồng ý hoặc từ chối |
| `is_remade` | `BOOLEAN NOT NULL DEFAULT FALSE` | Cờ đánh dấu món này bị hủy do lỗi/đền bù và đã được/yêu cầu làm lại |
| `resolved_by` | `BIGINT UNSIGNED NULL` | Tài khoản xử lý |
| `resolved_by_name` | `VARCHAR(150) NULL` | Tên người xử lý tại thời điểm thao tác |
| `resolved_at` | `DATETIME(3) NULL` | Thời điểm xử lý |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm yêu cầu |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Khi yêu cầu được đồng ý, hệ thống không cập nhật `order_items.quantity`, không cập nhật `order_items.total_amount` và không xóa dòng món. Số lượng đã hủy bằng tổng `requested_quantity` của các yêu cầu trạng thái `APPROVED`; số lượng còn tính tiền bằng số lượng ban đầu trừ số lượng đã hủy. Hệ thống dùng số lượng còn lại để cập nhật `orders.payable_amount`; `orders.original_amount` không thay đổi. Yêu cầu bị từ chối không làm thay đổi số tiền.

Đặc biệt đối với **Báo cáo của Admin**, báo cáo hao hụt/nguyên liệu cần bóc tách khối lượng hủy dựa trên trường `is_remade = TRUE` (hủy do lỗi nhân viên/chế biến) để thống kê chính xác lượng thất thoát (chi phí của cửa hàng), phân biệt với các món hủy thông thường do khách hàng tự đổi ý.

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

### 5.6. Thanh toán

#### `unpaid_records`

Ghi nhận trường hợp table session được đóng khi payment vẫn chưa được nhân viên xác nhận `PAID`. Bảng này phục vụ trạng thái vận hành, không đại diện cho giao dịch ngân hàng hoặc hệ thống quản lý công nợ.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh bản ghi |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài hệ thống |
| `table_session_id` | `BIGINT UNSIGNED NOT NULL` | Phiên bàn chưa thanh toán; duy nhất trong bảng |
| `amount` | `DECIMAL(15,2) NOT NULL` | Tổng tiền chưa thanh toán tại thời điểm ghi nhận |
| `bill_snapshot` | `JSON NOT NULL` | Toàn bộ nội dung bill tại thời điểm ghi nhận chưa thanh toán |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái `OPEN` hoặc `RESOLVED` |
| `reason` | `VARCHAR(1000) NULL` | Lý do ghi nhận, nếu có |
| `reported_by` | `BIGINT UNSIGNED NOT NULL` | Tài khoản ghi nhận |
| `reported_by_name` | `VARCHAR(150) NOT NULL` | Tên người ghi nhận tại thời điểm thao tác |
| `resolution_payment_id` | `BIGINT UNSIGNED NULL` | Payment đã thu lại thành công, để trống khi chưa xử lý xong |
| `resolved_at` | `DATETIME(3) NULL` | Thời điểm xử lý xong |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Khi nhân viên ghi nhận chưa thanh toán, hệ thống bảo đảm session có một payment `PENDING`, tạo `unpaid_records` bằng cách sao chép `amount` và `bill_snapshot` từ payment, sau đó đóng table session. Snapshot là bất biến.

Nếu payment được nhân viên xác nhận sau đó, hệ thống chuyển payment sang `PAID`, chuyển `unpaid_records` sang `RESOLVED`, gán `resolution_payment_id` bằng chính payment của session và lưu `resolved_at`. CAS chỉ lưu trạng thái nghiệp vụ; không lưu hoặc xác minh dữ liệu giao dịch tài chính.

#### `payments`

Lưu yêu cầu và kết quả xác nhận thanh toán thủ công của table session. Mỗi session chỉ có một payment cho toàn bộ các order tại thời điểm khách yêu cầu thanh toán.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh payment |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài |
| `table_session_id` | `BIGINT UNSIGNED NOT NULL` | Phiên bàn; duy nhất trong bảng |
| `amount` | `DECIMAL(15,2) NOT NULL` | Tổng cần thanh toán, do backend lấy từ tổng `orders.payable_amount` |
| `bill_snapshot` | `JSON NOT NULL` | Toàn bộ nội dung bill tại thời điểm khách yêu cầu thanh toán |
| `status` | `VARCHAR(20) NOT NULL` | Trạng thái `PENDING` hoặc `PAID` |
| `confirmed_by` | `BIGINT UNSIGNED NULL` | Tài khoản xác nhận thanh toán |
| `confirmed_by_name` | `VARCHAR(150) NULL` | Tên người xác nhận tại thời điểm thao tác |
| `confirmed_at` | `DATETIME(3) NULL` | Thời điểm nhân viên xác nhận |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm khách tạo yêu cầu thanh toán |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

`bill_snapshot` là bản dữ liệu dùng để hiển thị và xác nhận bill gắn với payment. Snapshot gom toàn bộ các order của session tại thời điểm khách yêu cầu thanh toán và không thay đổi trong suốt vòng đời payment.

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

Khi tạo payment, backend tự tính `amount = SUM(orders.payable_amount)` trong table session. Client không gửi một số tiền để backend tin cậy. Payment bắt đầu ở trạng thái `PENDING` và không tự hết hạn.

CAS không tạo QR thanh toán; không lưu số tài khoản, mã ngân hàng, tên ngân hàng, tên chủ tài khoản, nội dung chuyển khoản hoặc mã tham chiếu giao dịch. Sau khi khách ra gặp nhân viên và chuyển khoản, nhân viên xác minh tiền đã vào qua loa báo giao dịch (“ting ting”) rồi bấm xác nhận payment `PAID`. CAS không tích hợp với loa hoặc tự đối soát giao dịch.

Khi payment được xác nhận:

- Lưu `confirmed_by`, `confirmed_by_name` và `confirmed_at`.
- Cập nhật table session sang `CLOSED` và lưu `closed_at`.
- Chuyển `unpaid_records` của session sang `RESOLVED` nếu bản ghi đó tồn tại và đang `OPEN`.
- Ghi thao tác xác nhận vào `audit_logs`.

Nếu nhân viên cần đóng phiên khi payment chưa được xác nhận, hệ thống tạo `unpaid_records` từ chính `amount` và `bill_snapshot` của payment rồi giữ payment ở `PENDING`. Trường hợp chưa có payment, backend tạo payment `PENDING` từ dữ liệu order trước khi tạo `unpaid_records`.

#### `service_bookings`

Lưu dịch vụ đặt trước do khách liên hệ qua Zalo hotline của cửa hàng, sau đó `OPERATOR` hoặc `ADMIN` tạo record với tên dịch vụ và giá đã chốt. Dịch vụ này độc lập với `table_sessions`, `orders`, `payments` và `unpaid_records`.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh dịch vụ đặt trước |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng bên ngoài hệ thống |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng cung cấp dịch vụ |
| `client_account_id` | `BIGINT UNSIGNED NOT NULL` | Tài khoản khách liên quan tới dịch vụ |
| `service_name` | `VARCHAR(255) NOT NULL` | Tên dịch vụ do `OPERATOR` hoặc `ADMIN` nhập sau khi thỏa thuận |
| `note` | `TEXT NULL` | Ghi chú tùy chọn kèm theo dịch vụ |
| `agreed_price` | `DECIMAL(15,2) NOT NULL` | Giá đã chốt, có thể bằng `0` với dịch vụ miễn phí; không lấy từ client |
| `payment_status` | `VARCHAR(20) NOT NULL DEFAULT 'PAY_LATER'` | `PAY_LATER`, `PENDING`, `PAID` hoặc `CANCELLED` |
| `created_by_account_id` | `BIGINT UNSIGNED NOT NULL` | Tài khoản tạo dịch vụ |
| `created_by_name` | `VARCHAR(150) NOT NULL` | Tên người tạo tại thời điểm thao tác |
| `confirmed_by_account_id` | `BIGINT UNSIGNED NULL` | Tài khoản xác nhận thanh toán |
| `confirmed_by_name` | `VARCHAR(150) NULL` | Tên người xác nhận tại thời điểm thao tác |
| `confirmed_at` | `DATETIME(3) NULL` | Thời điểm xác nhận thanh toán |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Khi tạo dịch vụ, `OPERATOR` hoặc `ADMIN` nhập tên và số điện thoại đã trao đổi qua Zalo, cùng ghi chú nếu cần. Backend tìm `client_accounts` theo số điện thoại: nếu đã có thì gắn `client_account_id` hiện có, nếu chưa có thì tạo tài khoản khách mới rồi gắn ID mới. Tên chỉ phục vụ hiển thị khi tạo tài khoản mới, không dùng để nhận diện hoặc ghép khách. Khi chọn thanh toán sau, record được tạo ở `PAY_LATER`. Khi khách thanh toán, `OPERATOR` hoặc `ADMIN` chuyển record sang `PENDING` để chờ xác minh thủ công, sau đó xác nhận `PAID`. Nếu khách không tiếp tục đặt, nhân viên chuyển record sang `CANCELLED`; record này không được xác nhận thanh toán. Không tạo `payments`, `bill_snapshot`, order món, table session hoặc yêu cầu thanh toán tại bàn cho luồng này.

### 5.7. Vận hành

#### `accounts`

Lưu tài khoản đăng nhập hệ thống. Authentication và authorization được phân chia theo role.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh tài khoản |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng |
| `firebase_uid` | `VARCHAR(128) NOT NULL` | UID của tài khoản trên Firebase Authentication, duy nhất toàn hệ thống |
| `display_name` | `VARCHAR(150) NOT NULL` | Tên hiển thị |
| `role` | `VARCHAR(20) NOT NULL` | Vai trò của tài khoản |
| `status` | `VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'` | Trạng thái tài khoản |
| `last_login_at` | `DATETIME(3) NULL` | Lần đăng nhập gần nhất |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

`accounts.email` là định danh của tài khoản vận hành, duy nhất trong toàn hệ thống và phải khớp email đã xác thực từ Firebase Authentication; dùng unique constraint `uk_accounts_email`. CAS không lưu mật khẩu nhân viên vì Firebase Authentication quản lý thông tin xác thực.

Các role cơ bản:

- `ADMIN`: thực hiện toàn bộ chức năng quản trị cấu hình hệ thống và dữ liệu.
- `OPERATOR`: chỉ xử lý nghiệp vụ vận hành như order và xác nhận trạng thái thanh toán.

Khách hàng không có tài khoản đăng nhập và không phải một giá trị của `accounts.role`. Mọi chức năng quản trị chỉ dành cho `ADMIN`; `OPERATOR` không được truy cập các chức năng này.

Authentication sử dụng Firebase Authentication:

- Khách hàng không có tài khoản đăng nhập và không sử dụng authentication.
- Tài khoản vận hành (`ADMIN`, `OPERATOR`) được nhận diện bằng email và xác thực qua Firebase Authentication.
- Client truyền Firebase ID Token trong HTTP header `Authorization: Bearer <Firebase_ID_Token>`.
- CAS Backend verify Firebase ID Token (sử dụng Firebase Admin SDK hoặc thư viện xác thực tương đương), lấy `uid` từ token để tìm `accounts.firebase_uid`, rồi kiểm tra trạng thái và phân quyền theo role (`ADMIN`, `OPERATOR`) lưu trong database.
- Chỉ `ADMIN` được tạo tài khoản vận hành.
- Backend phải kiểm tra role trên mọi API được bảo vệ; ma trận quyền chi tiết theo từng API được xác định trong API contract.

#### `client_accounts`

Lưu thông tin khách hàng mở phiên bàn hoặc đặt dịch vụ. Khách được nhận diện theo `phone` trong phạm vi cửa hàng; bảng này tách riêng với `accounts` vì khách hàng không phải tài khoản vận hành nội bộ của quán.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh tài khoản khách |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng |
| `phone` | `VARCHAR(20) NULL` | Số điện thoại khách; `NULL` khi là khách lẻ |
| `display_name` | `VARCHAR(150) NOT NULL` | Tên khách |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

Khi người đầu tiên mở phiên bàn nhập tên và số điện thoại tùy chọn:

- Nếu có `phone` và số này đã tồn tại trong `client_accounts` của cửa hàng, hệ thống dùng lại tài khoản khách đó; `display_name` không tham gia nhận diện hoặc ghép khách.
- Nếu có `phone` nhưng chưa tồn tại, hệ thống tạo `client_accounts` mới.
- Nếu không có `phone`, hệ thống tạo một `client_accounts` khách lẻ với `phone = NULL`; không dùng tên để ghép hoặc dùng lại khách lẻ giữa các phiên.
- `table_sessions` lưu `client_account_id` để biết ai là người đại diện mở phiên bàn.
- `service_bookings` cũng dùng `client_account_id`; không sao chép tên hoặc số điện thoại vào bảng dịch vụ.
- `opened_by_customer_name` và `opened_by_customer_phone` trong `table_sessions` là snapshot tại thời điểm mở phiên, không thay đổi nếu thông tin khách được cập nhật sau này.

Module tra cứu khách hàng dành cho `ADMIN` dùng lại `client_accounts` cùng các quan hệ hiện có tới `table_sessions`, `orders`, `payments`, `unpaid_records` và `service_bookings`; không cần thêm bảng CRM. Danh sách khách chỉ trả dữ liệu nhận diện tối thiểu, số lượt mở bàn và thời điểm sử dụng gần nhất; khách có `phone = NULL` hiển thị là `Khách lẻ` và không thể tìm bằng số điện thoại. Thông tin chi tiết lịch sử được truy vấn khi `ADMIN` mở một khách cụ thể. Mọi truy vấn phải giới hạn theo `store_id`.

#### `operational_incidents`

Lưu thông tin các sự cố phát sinh do nhân viên vận hành (`OPERATOR`) ghi nhận tại ca trực để gửi lên cho quản trị viên (`ADMIN`) tra cứu, theo dõi và xử lý.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh sự cố |
| `public_id` | `CHAR(36) NOT NULL` | UUID dùng ngoài hệ thống |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng phát sinh sự cố |
| `reporter_name` | `VARCHAR(150) NOT NULL` | Tên người ghi nhận sự cố tại thời điểm thao tác |
| `created_by_account_id` | `BIGINT UNSIGNED NULL` | Tài khoản nhân viên báo cáo (nếu có đăng nhập) |
| `description` | `TEXT NOT NULL` | Nội dung mô tả chi tiết sự cố |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm phát sinh sự cố |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `audit_logs`

Lưu các thao tác thay đổi quan trọng của `ADMIN` và `OPERATOR`, như thay đổi dữ liệu quản trị, nhân viên tạo order hộ khách, xử lý món và thanh toán. Không dùng bảng này cho thao tác chỉ đọc, thao tác thông thường của Customer hoặc request idempotent không tạo thay đổi mới.

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

- `entity_type` có thể là `STORE`, `ACCOUNT`, `DINING_TABLE`, `TABLE_QR_CODE`, `TABLE_SESSION`, `CATEGORY`, `MENU_ITEM`, `OPTION_GROUP`, `OPTION_VALUE`, `TAG`, `PROMOTION`, `SYSTEM_NOTIFICATION`, `ORDER`, `ORDER_ITEM`, `PAYMENT`, `UNPAID_RECORD`, `SERVICE_BOOKING`, `CANCELLATION_REQUEST` hoặc `OPERATIONAL_INCIDENT`.
- `entity_id` liên kết logic tới dữ liệu gốc. Không tạo một foreign key chung vì audit log có thể tham chiếu nhiều loại bảng.
- `entity_name` giúp nhận biết nhanh dữ liệu đã thay đổi, ví dụ `Cà phê sữa`.
- `actor_account_id` lưu ID tài khoản thực hiện thao tác.
- `actor_name` lưu tên người thực hiện tại thời điểm thao tác để lịch sử không đổi khi tài khoản được cập nhật.
- `request_id` giúp gom các audit log được tạo trong cùng một request hoặc transaction nghiệp vụ.
- `change_data` lưu toàn bộ thông tin cần thiết để xem lại thay đổi.

`action` dùng các giá trị chữ hoa ổn định: `CREATED`, `UPDATED`, `STATUS_CHANGED`, `PRICE_CHANGED`, `QR_CREATED`, `QR_REVOKED`, `ORDER_CREATED_FOR_CUSTOMER`, `PREPARED_QUANTITY_UPDATED`, `CANCELLATION_RESOLVED`, `PAYMENT_CONFIRMED`, `UNPAID_RECORDED`, `SERVICE_BOOKING_CREATED`, `SERVICE_BOOKING_UPDATED`, `SERVICE_BOOKING_PAYMENT_PENDING`, `SERVICE_BOOKING_PAYMENT_CONFIRMED`, `SERVICE_BOOKING_CANCELLED` và `SESSION_CLOSED`. Khi một use case tạo nhiều thay đổi, các log dùng cùng `request_id`.

Các thao tác bắt buộc ghi audit log:

- `STORE`: cập nhật thông tin cửa hàng hoặc tham số vận hành.
- `ACCOUNT`: tạo, cập nhật hoặc thay đổi trạng thái tài khoản vận hành.
- `DINING_TABLE` và `TABLE_QR_CODE`: tạo, thay đổi hoặc thu hồi bàn/mã QR.
- `CATEGORY`, `MENU_ITEM`, `OPTION_GROUP`, `OPTION_VALUE`, `TAG`: mọi thay đổi Catalog; riêng đổi giá dùng `PRICE_CHANGED`, thay đổi trạng thái bán dùng `STATUS_CHANGED`.
- `PROMOTION` và `SYSTEM_NOTIFICATION`: tạo, cập nhật hoặc thay đổi trạng thái/phát hành.
- `ORDER`: `OPERATOR` tạo order hộ Customer.
- `ORDER_ITEM`: cập nhật `prepared_quantity` theo mẻ.
- `CANCELLATION_REQUEST`: nhân viên đồng ý hoặc từ chối yêu cầu hủy món.
- `PAYMENT`: xác nhận payment từ `PENDING` sang `PAID`.
- `UNPAID_RECORD`: ghi nhận chưa thanh toán.
- `SERVICE_BOOKING`: tạo dịch vụ, sửa tên dịch vụ/giá đã chốt, chuyển sang chờ thanh toán, xác nhận thanh toán hoặc hủy dịch vụ.
- `TABLE_SESSION`: đóng session trong luồng ghi nhận chưa thanh toán.
- `OPERATIONAL_INCIDENT`: cập nhật hoặc ghi chú xử lý sự cố.

Không ghi audit log cho mở trang, tìm kiếm, lọc, xem dữ liệu, thao tác Customer thông thường hoặc retry không làm thay đổi dữ liệu; đặc biệt, confirm lặp trên payment đã `PAID` không tạo log mới.

#### `system_notifications`

Lưu thông báo hệ thống do `ADMIN` phát hành. `target_role` mô tả nhóm đối tượng mà Admin chọn trên giao diện; trạng thái đọc không lưu trên bảng này mà lưu theo từng người nhận ở `system_notification_recipients`.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh thông báo |
| `store_id` | `BIGINT UNSIGNED NOT NULL` | Cửa hàng phát hành thông báo |
| `title` | `VARCHAR(255) NOT NULL` | Tiêu đề thông báo |
| `content` | `TEXT NOT NULL` | Nội dung chi tiết |
| `type` | `VARCHAR(20) NOT NULL` | Mức độ: `INFO`, `WARNING` hoặc `URGENT` |
| `target_role` | `VARCHAR(20) NOT NULL` | Đối tượng UI chọn: `OPERATOR`, `CUSTOMER` hoặc `BOTH` |
| `created_by_account_id` | `BIGINT UNSIGNED NOT NULL` | Tài khoản `ADMIN` phát hành |
| `created_by_name` | `VARCHAR(150) NOT NULL` | Tên người phát hành tại thời điểm tạo |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm phát hành |
| `updated_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)` | Thời điểm cập nhật |

#### `system_notification_recipients`

Bảng trung gian lưu trạng thái đọc riêng của từng người nhận. Một record là một thông báo dành cho đúng một tài khoản vận hành hoặc một tài khoản khách; không dùng cờ `is_read` chung trên `system_notifications`.

| Cột | Kiểu dữ liệu | Ý nghĩa |
|---|---|---|
| `id` | `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT` | Định danh record người nhận |
| `system_notification_id` | `BIGINT UNSIGNED NOT NULL` | Thông báo được nhận |
| `account_id` | `BIGINT UNSIGNED NULL` | Người nhận là tài khoản vận hành |
| `client_account_id` | `BIGINT UNSIGNED NULL` | Người nhận là tài khoản khách |
| `is_read` | `BOOLEAN NOT NULL DEFAULT FALSE` | `FALSE`: chưa đọc; `TRUE`: đã đọc |
| `read_at` | `DATETIME(3) NULL` | Thời điểm đánh dấu đã đọc; để trống khi chưa đọc |
| `created_at` | `DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)` | Thời điểm tạo record người nhận |

Backend kiểm tra chính xác một trong hai cột `account_id` hoặc `client_account_id` có giá trị. Tạo unique constraint cho từng loại người nhận: `system_notification_id + account_id` và `system_notification_id + client_account_id`; không được tạo hai record trạng thái cho cùng một người nhận và cùng một thông báo. Foreign key tới `system_notifications`, `accounts` và `client_accounts` dùng `ON DELETE RESTRICT`.

## 6. Quan hệ chính

| Quan hệ | Loại |
|---|---|
| Store — Dining table | Một - nhiều |
| Dining table — QR code | Một - nhiều theo lịch sử |
| Dining table — Table session | Một - nhiều theo thời gian |
| Store — Category | Một - nhiều |
| Category — Menu item | Một - nhiều |
| Store — Tag | Một - nhiều |
| Menu item — Tag | Nhiều - nhiều qua `menu_item_tags` |
| Store — Option group | Một - nhiều |
| Option group — Option value | Một - nhiều |
| Menu item — Option group | Nhiều - nhiều qua `menu_item_option_groups` |
| Table session — Order | Một - nhiều |
| Order — Order item | Một - nhiều |
| Order item — Order item option | Một - nhiều |
| Order item — Cancellation request | Một - nhiều |
| Table session — Unpaid record | Một - không hoặc một |
| Unpaid record — Payment | Một - một payment của cùng table session dùng để xác định kết quả |
| Table session — Payment | Một - không hoặc một |
| Store — Service booking | Một - nhiều |
| Client account — Service booking | Một - nhiều |
| Account — Service booking | Một - nhiều (với vai trò người tạo hoặc xác nhận thanh toán) |
| Store — Promotion | Một - nhiều |
| Store — Bill discount | Một - nhiều |
| Promotion — Promotion target | Một - nhiều |
| Promotion — Promotion code | Một - nhiều |
| Promotion — Promotion redemption | Một - nhiều |
| Table session — Promotion redemption | Một - nhiều theo lịch sử |
| Payment — Promotion redemption | Một - nhiều theo các promotion đã áp dụng |
| Table session — Bill discount | Một - nhiều theo lịch sử |
| Store — Operational incident | Một - nhiều |
| Account — Operational incident | Một - nhiều (với vai trò người tạo báo cáo) |
| Store — Audit log | Một - nhiều |
| Account — Audit log | Một - nhiều |
| Client account — Table session | Một - nhiều |
| Store — System notification | Một - nhiều |
| System notification — System notification recipient | Một - nhiều |
| Account — System notification recipient | Một - nhiều (khi người nhận là nhân viên) |
| Client account — System notification recipient | Một - nhiều (khi người nhận là khách hàng) |

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
| Tag | `ACTIVE`, `INACTIVE` |
| Option group | `ACTIVE`, `INACTIVE` |
| Option value | `ACTIVE`, `INACTIVE` |
| Cancellation request | `PENDING`, `APPROVED`, `REJECTED` |
| Payment | `PENDING`, `PAID` |
| Service booking payment | `PAY_LATER`, `PENDING`, `PAID`, `CANCELLED` |
| Promotion | `DRAFT`, `ACTIVE`, `INACTIVE` |
| Promotion redemption | `COMPLETED`, `REVERSED` |
| Account | `ACTIVE`, `INACTIVE` |
| Account role | `ADMIN`, `OPERATOR` |

## 8. Ràng buộc và index cơ bản

### 8.1. Khóa ngoại và chính sách xóa

- Tất cả quan hệ trong mục 6 được tạo foreign key vật lý, ngoại trừ `audit_logs.entity_id` và `promotion_targets.target_id` là liên kết logic tới nhiều loại entity. `promotion_targets.target_type` xác định `target_id` tham chiếu `menu_items` hoặc `categories`.
- Tất cả foreign key dùng `ON DELETE RESTRICT` và `ON UPDATE RESTRICT`.
- Mỗi foreign key có index với tên tường minh để MySQL không tự tạo index ẩn.
- Dữ liệu đã được tham chiếu không bị xóa vật lý; các entity có trạng thái được chuyển sang `INACTIVE` hoặc `REVOKED`.

### 8.2. Unique constraint và quy tắc nghiệp vụ

- `dining_tables`: unique `store_id + code`.
- `table_qr_codes`: unique `token`.
- `categories`: unique `store_id + name`.
- `tags`: unique `store_id + name`.
- `menu_item_tags`: unique `menu_item_id + tag_id`.
- `option_groups`: unique `store_id + name`.
- `option_values`: unique `option_group_id + name`.
- `menu_item_option_groups`: unique `menu_item_id + option_group_id`.
- `menu_items.store_id` phải khớp store của category; `menu_item_tags` và `menu_item_option_groups` dùng composite foreign key với `store_id` để ngăn liên kết Catalog chéo cửa hàng.
- `orders`: unique `public_id`, `order_number` và cặp `table_session_id + idempotency_key`.
- `orders.request_fingerprint`: bắt buộc, do backend tạo từ SHA-256 của payload đã chuẩn hóa; không đặt unique constraint.
- `order_items`: unique `public_id`; `order_id + menu_item_id` chỉ khi cùng cấu hình option (kiểm tra trong Java).
- `order_item_options`: unique `order_item_id + option_value_id`.
- Catalog đã được tham chiếu bởi order chỉ được chuyển `INACTIVE`, không xóa vật lý; snapshot trong order vẫn là nguồn hiển thị lịch sử.
- `order_item_cancellation_requests`: unique `public_id` và `order_item_id + idempotency_key`.
- `preparation_batch_completions`: unique `public_id` và `store_id + idempotency_key`.
- Tạo/resolve cancellation và chuyển session sang `PAYMENT_PENDING` phải khóa session hoặc dùng transaction tương đương để không phát sinh thay đổi sau khi bill bị khóa.
- `unpaid_records`: unique `public_id`, `table_session_id` và `resolution_payment_id`.
- `payments`: unique `public_id` và `table_session_id`.
- `service_bookings`: unique `public_id`.
- Confirm lặp trên payment đã `PAID` là thao tác đọc idempotent: không cập nhật dữ liệu và không tạo audit log mới.
- Mỗi unpaid record chỉ được giải quyết bởi payment `PAID` của cùng table session; confirm payment và cập nhật unpaid record phải nằm trong cùng transaction.
- `accounts`: unique `firebase_uid`.
- `client_accounts`: unique `store_id + phone`.
- Tra cứu khách hàng dùng unique index `client_accounts(store_id, phone)` hiện có; index phục vụ tìm kiếm theo tên hoặc thống kê lịch sử chỉ được bổ sung sau khi có truy vấn triển khai và kiểm tra bằng `EXPLAIN`.
- `promotions`: unique `public_id`; index `(store_id, status, start_at, end_at)` phục vụ truy vấn promotion còn hiệu lực.
- `promotion_codes`: unique `store_id + code`.
- `promotion_targets`: unique `promotion_id + target_type + target_id`.
- `promotion_redemptions`: unique `payment_id` để confirm payment lặp không tạo redemption thứ hai; index theo `promotion_id`, `client_account_id` và `status` phục vụ kiểm tra quota.
- `bill_discounts`: unique `payment_id` vì mỗi bill hiện chỉ áp dụng tối đa một promotion.

### 8.3. Quy tắc chỉ kiểm tra trong Java

Database không tạo `CHECK` constraint cho các quy tắc nghiệp vụ dưới đây. Java phải kiểm tra trong application/domain layer trước khi ghi dữ liệu. Ngoại lệ duy nhất hiện tại là `system_notification_recipients`, dùng `CHECK` để bảo đảm cấu trúc một recipient tham chiếu chính xác một trong hai loại đích.

- Giá trị hợp lệ và quy tắc chuyển đổi của tất cả trạng thái.
- Các nhóm lựa chọn được quản lý qua `option_groups` và liên kết với món qua `menu_item_option_groups`.
- Mỗi nhóm lựa chọn chứa các giá trị lựa chọn tương ứng trong `option_values`.
- `option_groups.max_select` có thể để `NULL` (không giới hạn) hoặc số nguyên `>= 1`.
- Mỗi option group có tối đa một option mặc định và option đó phải thuộc nhóm đang hoạt động. Quy tắc này không có unique constraint trong database.
- Giá tiền không âm, số lượng lớn hơn 0 và `orders.payable_amount <= orders.original_amount`.
- `order_items.prepared_quantity` không lớn hơn `quantity` trừ tổng số lượng hủy
  `APPROVED`; cập nhật hoàn thành theo mẻ phải khóa và kiểm tra lại các dòng liên
  quan trong cùng transaction.
- `preparation_batch_completions.option_configuration_hash` phải được backend tạo
  từ đúng tập option đã chuẩn hóa của nhóm chế biến; `request_fingerprint` phải
  khớp payload retry trước khi trả lại `allocation_snapshot` đã lưu.
- `unpaid_records.amount` bằng `bill_snapshot.payableAmount`; trạng thái `OPEN` không có thông tin resolve và trạng thái `RESOLVED` có đủ thông tin resolve.
- Payment và unpaid record liên quan phải thuộc cùng table session; số tiền và bill snapshot phải khớp.
- `payments.amount` bằng tổng `orders.payable_amount` của table session tại thời điểm tạo payment.
- Payment `PENDING` không có thông tin xác nhận; payment `PAID` phải có đủ `confirmed_by`, `confirmed_by_name` và `confirmed_at`.
- Payment chỉ chuyển từ `PENDING` sang `PAID`.
- `service_bookings.agreed_price` không âm và `client_account_id` phải thuộc cùng `store_id`; giá `0` biểu thị dịch vụ miễn phí. `note` là tùy chọn. `PAY_LATER`, `PENDING` và `CANCELLED` không có thông tin xác nhận; `PAID` phải có đủ `confirmed_by_account_id`, `confirmed_by_name` và `confirmed_at`. `CANCELLED` là trạng thái cuối và không thể chuyển sang thanh toán. Chỉ `OPERATOR` hoặc `ADMIN` được tạo dịch vụ, cập nhật tên dịch vụ/ghi chú/giá đã chốt, chuyển trạng thái thanh toán, xác nhận `PAID` hoặc hủy dịch vụ; mọi thao tác làm thay đổi `service_bookings` phải ghi `audit_logs` với `entity_type = SERVICE_BOOKING`.
- Promotion phải thuộc cùng store với promotion code, target, table session, payment, client account, redemption và bill discount liên quan.
- `promotion_targets.target_type` chỉ nhận `MENU_ITEM` hoặc `CATEGORY`; backend kiểm tra `target_id` tồn tại và thuộc cùng store.
- Promotion chỉ hợp lệ khi `status = ACTIVE`, nằm trong thời gian hiệu lực và thỏa `min_bill_amount` cùng quota theo promotion/code/khách hàng.
- `stores.long_wait_warning_minutes` phải nằm trong khoảng từ `5` đến `120` phút.
- `stores.open_time` và `stores.close_time` được diễn giải theo `stores.timezone`; backend không được suy diễn giờ mở/đóng cửa khi chưa có quy tắc ngày trong tuần hoặc ngày nghỉ được thiết kế riêng.

### 8.4. Unique constraint có điều kiện

MySQL dùng generated column kết hợp unique index cho các quy tắc cần chống race condition:

- `table_qr_codes.active_table_id`: nhận `table_id` khi `status = 'ACTIVE'`, ngược lại nhận `NULL`; unique index bảo đảm mỗi bàn chỉ có một QR `ACTIVE`.
- `table_sessions.occupying_table_id`: nhận `table_id` khi `status IN ('OPEN', 'PAYMENT_PENDING')`, ngược lại nhận `NULL`; unique index bảo đảm mỗi bàn chỉ có một session đang chiếm dụng.

Java vẫn phải dùng transaction và khóa scope tương ứng khi tạo QR bàn, session hoặc payment; unique index là lớp bảo vệ cuối cùng khi có request đồng thời.

### 8.5. Index phục vụ truy vấn menu

Giai đoạn đầu chỉ tạo thêm các performance index phục vụ luồng xem menu:

- `categories(store_id, status, display_order)`.
- `menu_items(category_id, availability_status, display_order)`.
- `tags(store_id, name)`.
- `menu_item_tags` dùng primary key `(menu_item_id, tag_id)` và index `(tag_id)` để truy vấn hai chiều.
- `option_groups(store_id, status, display_order)`.
- `option_values(option_group_id, status, display_order)`.
- `menu_item_option_groups(menu_item_id, display_order)`.

Primary key, unique index và index bắt buộc cho foreign key vẫn được tạo đầy đủ. Index cho payment, unpaid record, order, cancellation request, thống kê và tìm kiếm tên món sẽ được bổ sung khi triển khai các truy vấn tương ứng và kiểm tra bằng `EXPLAIN`.

Không tạo index đơn dư thừa khi đã có composite unique index cùng tiền tố trái:
`dining_tables(store_id)` được bao phủ bởi `(store_id, code)`, `tags(store_id)`
được bao phủ bởi `(store_id, name)` và `client_accounts(store_id)` được bao phủ
bởi `(store_id, phone)`. Các truy vấn theo thời gian đã chốt dùng composite
index: `audit_logs(store_id, created_at)`,
`audit_logs(actor_account_id, created_at)`,
`table_sessions(client_account_id, created_at)`,
`system_notification_recipients(account_id, status, created_at)` và
`system_notification_recipients(table_session_id, status, created_at)`.
Index theo thời gian cho các luồng khác chỉ được thêm sau khi có API/query thực
tế và được đánh giá bằng `EXPLAIN ANALYZE`.

## 9. Các nội dung ngoài phạm vi hiện tại

Thiết kế hiện tại chưa bao gồm:

- Đổi bàn, chuyển bàn, tách bàn hoặc gộp bàn giữa các table session.
- Hồ sơ và lịch sử nhân viên.
- Dữ liệu khai báo tiền mặt đầu ca/cuối ca, đối soát quỹ theo ca và xử lý chênh lệch.
- Ma trận phân quyền chi tiết theo từng API.
- Kho và nguyên vật liệu.
- Điểm thành viên và chương trình tích điểm.
- Hồ sơ khách hàng và CRM.
- Tích hợp Zalo ngoài liên hệ dịch vụ đặt trước qua hotline và các chiến dịch marketing.
- Game và AI.
- Hóa đơn điện tử.
- Nhiều chi nhánh với dữ liệu dùng chung.
- Báo cáo phân tích chuyên sâu.

## 10. Các quyết định đã xác nhận

- Tất cả foreign key vật lý dùng `ON DELETE RESTRICT` và `ON UPDATE RESTRICT`; `audit_logs.entity_id` tiếp tục là liên kết logic và không có foreign key.
- Không dùng MySQL `CHECK` constraint cho quy tắc nghiệp vụ; Java chịu trách nhiệm validation.
- Generated column kết hợp unique index được dùng để bảo đảm một QR bàn `ACTIVE` và một session đang chiếm dụng cho mỗi bàn.
- Quy tắc mỗi option group có tối đa một option mặc định chỉ được kiểm tra trong Java, không có unique constraint trong database.
- Giai đoạn đầu chỉ tạo performance index cho truy vấn menu; index cho các luồng khác được bổ sung khi triển khai truy vấn tương ứng.
- Authentication sử dụng Firebase Authentication; Client truyền Firebase ID Token trong header request để backend verify và phân quyền.
- Chỉ `ADMIN` được tạo tài khoản vận hành; client không có tài khoản đăng nhập; mọi chức năng quản trị chỉ dành cho `ADMIN`, còn `OPERATOR` chỉ xử lý nghiệp vụ vận hành.
- Module tra cứu khách hàng chỉ dành cho `ADMIN`, dùng lại `client_accounts` và lịch sử table session/order/payment hiện có; đây là chức năng chỉ đọc, không phải CRM và không bổ sung bảng dữ liệu.
- Mỗi table session có thể có nhiều order; mỗi lần khách gửi món tạo một order riêng trong cùng session.
- `OPERATOR` được tạo order hộ vào table session `OPEN`; order này dùng cùng dữ
  liệu, validation, tính tiền, idempotency và FIFO với order do Customer gửi,
  đồng thời phải ghi audit log theo tài khoản nhân viên.
- Tất cả trường thời gian nghiệp vụ được lưu theo `Asia/Ho_Chi_Minh` (`UTC+07:00`); giá trị thời gian trao đổi qua API phải kèm offset `+07:00`.
- Mỗi order chỉ có một ghi chú chung trong `orders.note`; không lưu `note` trong `order_items`.
- Tạo order bắt buộc có `idempotency_key`; key duy nhất trong cùng table session, được lưu trong `orders` và được bảo vệ bằng unique constraint `table_session_id + idempotency_key`.
- Backend lưu `orders.request_fingerprint` từ SHA-256 của payload chuẩn hóa để phân biệt retry hợp lệ với việc tái sử dụng key cho nội dung khác.
- `orders.original_amount` là tổng tiền ban đầu và bất biến; `orders.payable_amount` là số tiền còn phải trả sau các yêu cầu hủy `APPROVED`.
- `option_groups` lưu nhóm lựa chọn (như Size, Đường, Topping); `option_values` lưu giá trị lựa chọn bên trong nhóm (như Size L, 50%, Trân châu). Topping và size nằm riêng trong `option_values`, không thuộc `menu_items`.
- `menu_item_option_groups` liên kết nhiều-nhiều giữa `menu_items` và `option_groups` để xác định món nào áp dụng nhóm lựa chọn nào.
- `order_item_options` liên kết tới `option_values` để lưu thông tin option thực tế được chọn cho từng dòng món.
- Giá món chính nằm ở `order_items.unit_price`; giá option nằm ở `order_item_options.unit_price`; `order_items.options_amount` là tổng giá option trên một đơn vị món.
- Hai món có cấu hình option khác nhau phải nằm ở hai `order_items` khác nhau.
- Thanh toán toàn bộ các order của phiên bàn, chưa hỗ trợ tách hóa đơn.
- Khi yêu cầu thanh toán, session ngừng nhận món và tiếp tục chiếm dụng bàn cho đến khi được đóng.
- `orders` không có trạng thái riêng; trạng thái xử lý được quản lý ở `table_sessions`.
- `orders` không lưu `is_completed`; hoàn thành order được suy ra từ số lượng
  còn cần làm của các `order_items`.
- `table_sessions` không lưu `is_paid`; `payments.status` là nguồn xác định kết quả thanh toán, còn `unpaid_records` ghi nhận phiên đã đóng khi payment vẫn `PENDING`.
- `table_sessions.payment_requested_at` được lưu khi session chuyển từ `OPEN` sang `PAYMENT_PENDING`.
- Size có một giá trị mặc định được cấu hình theo món.
- Topping không giới hạn số lựa chọn.
- Theo dõi số phần đã làm xong bằng `order_items.prepared_quantity`; không dùng
  enum trạng thái chế biến và chưa tách riêng mốc làm xong với mốc mang tới bàn.
- Yêu cầu hủy món phải được nhân viên đồng ý hoặc từ chối. Khi đồng ý, hệ thống tính lại tổng tiền.
- Duyệt hủy món không sửa hoặc xóa dữ liệu gốc trong `order_items`; số lượng đã hủy được tính từ các yêu cầu `APPROVED`.
- `dining_tables` không lưu trạng thái; bàn đang có khách được suy ra từ session `OPEN` hoặc `PAYMENT_PENDING`.
- Payment được tạo tự động khi khách yêu cầu thanh toán.
- `payments.amount` do backend lấy từ tổng `orders.payable_amount`; client không được nhập hoặc ghi đè.
- Khách bắt buộc ra gặp nhân viên sau khi tạo yêu cầu thanh toán.
- Nhân viên xác minh chuyển khoản thành công qua loa báo giao dịch (“ting ting”) rồi xác nhận payment thủ công trên giao diện vận hành.
- Payment `PENDING` không tự hết hạn.
- Payment chỉ có trạng thái `PENDING` hoặc `PAID`; không có trạng thái `IGNORED` và không tạo lại nhiều payment cho cùng session.
- `unpaid_records` lưu `amount` và `bill_snapshot` bất biến khi nhân viên đóng một session chưa được xác nhận thanh toán.
- Session `OPEN` và `PAYMENT_PENDING` đều chiếm dụng bàn.
- Một bàn không bao giờ được có nhiều hơn một session đang chiếm dụng tại cùng một thời điểm, kể cả khi có nhiều yêu cầu tạo session đồng thời.
- Nhiều điện thoại quét cùng QR dùng chung session và nhìn thấy cùng danh sách order.
- Người đầu tiên mở session bàn cần nhập tên; số điện thoại là tùy chọn. Nếu không có số điện thoại, hệ thống tạo `client_accounts` khách lẻ với `phone = NULL`; người quét QR sau trong cùng session không cần nhập lại.
- Order không cần bước xác nhận trước khi cửa hàng xử lý.
- Hệ thống không tách màn hình bếp và phục vụ.
- Không lưu bảng lịch sử giá món riêng.
- Mỗi món chỉ có một ảnh.
- `menu_items.image_storage_key` được dùng để quản lý asset trên dịch vụ lưu trữ; `image_url` chỉ phục vụ hiển thị.
- Nhãn của menu item được quản lý bằng `tags` và quan hệ nhiều-nhiều `menu_item_tags`; không lưu cờ nhãn riêng trong `menu_items`.
- Tag có thể gắn với bất kỳ `menu_items`, không giới hạn theo loại category.
- QR bàn là mã cố định được in và dán tại bàn; hệ thống không tạo QR thanh toán.
- CAS không lưu số tài khoản, mã hoặc tên ngân hàng, tên chủ tài khoản, nội dung chuyển khoản hay mã tham chiếu giao dịch.
- CAS không tích hợp với loa báo giao dịch; việc xác minh chuyển khoản diễn ra ngoài hệ thống và CAS chỉ ghi nhận trạng thái phục vụ vận hành.
- Ảnh món được frontend gửi qua CAS Backend; backend upload lên Cloudinary bằng authenticated API.
- Báo cáo sự cố phát sinh do nhân viên `OPERATOR` khởi tạo tại ca trực (bao gồm `created_by_name`/`created_by_account_id`, `created_at`, `description`) để quản trị viên `ADMIN` tiếp nhận, tra cứu và xử lý.
- Khuyến mãi dùng đúng 5 bảng: `promotions`, `promotion_codes`, `promotion_targets`, `promotion_redemptions` và `bill_discounts`, thay cho bảng `vouchers` đơn giản. Tất cả record promotion/redemption/discount snapshot có `store_id`. `promotions` hỗ trợ `PERCENT_OFF`, `FIXED_AMOUNT_OFF`, `ITEM_PERCENT_OFF` và `ITEM_FIXED_OFF`.
- Điều kiện cơ bản `min_bill_amount`, thời gian hiệu lực và quota nằm trực tiếp tại `promotions`. `promotion_targets` dùng `target_type` và `target_id` để giới hạn phạm vi theo món hoặc danh mục. `BUY_X_GET_Y`, `FREE_ITEM` và điều kiện phức tạp hơn sẽ được bổ sung ở giai đoạn mở rộng.
- Một promotion được chọn cho toàn bộ bill của table session; backend trả danh sách đủ điều kiện và số tiền dự kiến, không tự chọn promotion có lợi nhất. Bill chỉ áp dụng tối đa một promotion ở phiên bản hiện tại.
- Không sửa `menu_items.price` khi một chương trình chạy. Discount cấp bill được tính lại trước payment khi bill thay đổi và được lưu tại `bill_discounts`, không phân bổ xuống từng order hoặc dòng món. Các snapshot được khóa khi session chuyển `PAYMENT_PENDING`.
- `promotion_redemptions` chỉ được tạo khi payment `PAID`; redemption chuyển `REVERSED` và không tính quota nếu payment đã paid bị refund hoặc hủy toàn bộ trong tương lai.
- `system_notifications` lưu danh sách thông báo hệ thống do `ADMIN` phát hành (tiêu đề `title`, nội dung `content`, mức độ `type` IN (`INFO`, `WARNING`, `URGENT`), đối tượng nhận `target_role` IN (`OPERATOR`, `CUSTOMER`, `BOTH`)).
- `system_notification_recipients` lưu trạng thái `UNREAD` hoặc `READ` theo từng người nhận. Một record nhận gắn với đúng một `account_id` (Operator) hoặc một `table_session_id` (Customer); `CHECK` constraint bắt buộc điều kiện này. Khi phát hành, backend chỉ tạo recipient Customer cho session `OPEN` hoặc `PAYMENT_PENDING`; session đã `CLOSED` chỉ giữ lịch sử recipient có sẵn và không nhận notification mới. `read_at` chỉ có khi trạng thái là `READ`.

## 11. Bước tiếp theo

1. Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.
2. Kiểm tra migration trên MySQL 8.4 trong môi trường phát triển.

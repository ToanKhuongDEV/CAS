# CAS — Thiết kế database cơ bản

## 1. Mục đích

Tài liệu mô tả mô hình dữ liệu cơ bản cho MVP 1 của CAS, bao gồm:

- Quản lý cửa hàng, bàn và mã QR.
- Quản lý menu.
- Phiên sử dụng bàn.
- Gọi món và xử lý order.
- Thanh toán chuyển khoản bằng VietQR và xác nhận thủ công.
- Tài khoản, phân quyền theo role và nhật ký cơ bản.

Thiết kế này xác định các entity và quan hệ chính. Chi tiết migration, index, constraint và kiểu dữ liệu chính xác sẽ được hoàn thiện sau khi các câu hỏi nghiệp vụ ở cuối tài liệu được xác nhận.

## 2. Nguyên tắc thiết kế

- MySQL là nguồn dữ liệu chính của hệ thống.
- Backend truy cập MySQL bằng MyBatis và SQL tường minh, không dựa trên cơ chế quản lý entity của JPA/Hibernate.
- Dữ liệu tiền tệ sử dụng `DECIMAL`.
- Thời gian được lưu theo UTC.
- Các bảng nghiệp vụ có `created_at` và `updated_at` khi phù hợp.
- Order và payment không bị xóa vật lý.
- Thông tin order được lưu theo các cột nghiệp vụ.
- Toàn bộ nội dung bill tại thời điểm yêu cầu thanh toán hoặc ghi nhận khách chưa thanh toán được lưu trong một JSON snapshot.
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

### 3.2. Danh sách tên bảng

| Nhóm | Tên bảng | Nội dung |
|---|---|---|
| Cửa hàng | `stores` | Thông tin cửa hàng |
| Bàn | `dining_tables` | Danh sách bàn |
| QR | `table_qr_codes` | Mã QR của bàn |
| Menu | `categories` | Danh mục món |
| Menu | `menu_items` | Thông tin món |
| Menu | `option_groups` | Nhóm lựa chọn của món |
| Menu | `option_values` | Các giá trị trong nhóm lựa chọn |
| Phiên bàn | `table_sessions` | Lượt sử dụng bàn |
| Order | `orders` | Các order thuộc mỗi phiên bàn |
| Order | `order_items` | Các món trong order |
| Order | `order_item_cancellation_requests` | Yêu cầu hủy món và kết quả xử lý |
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
  │            │            └── order_item_cancellation_requests
  │            └── payments
  │
  ├── categories
  │     └── menu_items
  │            └── option_groups
  │                    └── option_values
  │
  ├── accounts
  └── client_accounts

audit_logs
```

## 5. Các nhóm dữ liệu

### 5.1. Cửa hàng và bàn

#### `stores`

Lưu thông tin cửa hàng.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh cửa hàng |
| `name` | Tên cửa hàng |
| `address` | Địa chỉ |
| `phone` | Số điện thoại |
| `timezone` | Múi giờ vận hành |
| `bank_account_number` | Số tài khoản ngân hàng nhận tiền |
| `bank_code` | Mã ngân hàng nhận tiền |
| `bank_account_name` | Tên chủ tài khoản nhận tiền |
| `status` | Trạng thái hoạt động |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

MVP 1 chỉ vận hành một cửa hàng nhưng vẫn giữ entity `stores` để dữ liệu có ngữ cảnh rõ ràng. Mỗi cửa hàng tạm thời dùng một tài khoản ngân hàng nhận tiền để tạo VietQR.

#### `dining_tables`

Lưu thông tin bàn.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh bàn |
| `store_id` | Cửa hàng |
| `code` | Mã bàn |
| `name` | Tên hiển thị |
| `capacity` | Số chỗ dự kiến |
| `status` | Trạng thái bàn |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

#### `table_qr_codes`

Lưu mã QR được gắn với bàn.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh bản ghi QR |
| `table_id` | Bàn tương ứng |
| `token` | Mã sử dụng trong đường dẫn QR |
| `status` | Trạng thái sử dụng |
| `issued_at` | Thời điểm phát hành |
| `revoked_at` | Thời điểm thu hồi |

Một bàn có thể có nhiều bản ghi QR trong lịch sử nhưng chỉ có một mã đang hoạt động.

### 5.2. Menu

#### `categories`

Lưu danh mục món.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh danh mục |
| `store_id` | Cửa hàng |
| `name` | Tên danh mục |
| `description` | Mô tả |
| `display_order` | Thứ tự hiển thị |
| `status` | Trạng thái hiển thị |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

#### `menu_items`

Lưu thông tin món.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh món |
| `category_id` | Danh mục |
| `name` | Tên món |
| `description` | Mô tả |
| `price` | Giá hiện tại |
| `image_url` | Hình ảnh |
| `availability_status` | Trạng thái còn hoặc hết món |
| `display_order` | Thứ tự hiển thị |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

#### `option_groups`

Lưu nhóm lựa chọn của món như kích thước, topping, độ ngọt hoặc cách chế biến.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh nhóm lựa chọn |
| `menu_item_id` | Món áp dụng |
| `name` | Tên nhóm lựa chọn |
| `selection_type` | Kiểu chọn một hoặc chọn nhiều |
| `is_required` | Nhóm có bắt buộc lựa chọn hay không |
| `min_select` | Số lựa chọn tối thiểu |
| `max_select` | Số lựa chọn tối đa |
| `display_order` | Thứ tự hiển thị |
| `status` | Trạng thái sử dụng |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

Với nhóm size, hệ thống chọn một giá trị mặc định được cấu hình trong `option_values`. Với nhóm topping, `max_select` có thể để trống để biểu thị không giới hạn số lựa chọn.

#### `option_values`

Lưu các giá trị thuộc một nhóm lựa chọn.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh giá trị |
| `option_group_id` | Nhóm lựa chọn |
| `name` | Tên giá trị như `Size M`, `Size L` |
| `additional_price` | Phần giá cộng thêm |
| `is_default` | Giá trị mặc định của nhóm lựa chọn |
| `display_order` | Thứ tự hiển thị |
| `status` | Trạng thái sử dụng |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

Ví dụ:

```text
Trà sữa
├── Kích thước (chọn một, bắt buộc)
│   ├── Size M: +0
│   └── Size L: +10.000
├── Độ ngọt (chọn một)
│   ├── 30%
│   ├── 50%
│   └── 100%
└── Topping (chọn nhiều)
    ├── Trân châu: +5.000
    └── Pudding: +7.000
```

### 5.3. Phiên sử dụng bàn

#### `table_sessions`

Đại diện cho một lượt khách sử dụng bàn.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh phiên |
| `table_id` | Bàn |
| `public_id` | Định danh dùng ở giao diện khách |
| `client_account_id` | Tài khoản khách đầu tiên mở phiên bàn |
| `opened_by_customer_name` | Tên khách đầu tiên mở phiên bàn |
| `opened_by_customer_phone` | Số điện thoại khách đầu tiên mở phiên bàn |
| `status` | Trạng thái phiên |
| `is_paid` | Phiên bàn đã được thanh toán hay chưa, mặc định `false` khi mở phiên |
| `closed_at` | Thời điểm đóng |
| `created_at` | Thời điểm phiên bắt đầu |
| `updated_at` | Thời điểm cập nhật |

Chỉ table session ở trạng thái `OPEN` mới được xem là đang chiếm dụng bàn. Mỗi bàn chỉ được có tối đa một session `OPEN` tại cùng một thời điểm. Session ở trạng thái `PAYMENT_PENDING` không chiếm dụng bàn và không ngăn việc tạo session `OPEN` mới cho cùng bàn. Người đầu tiên mở phiên bàn cần nhập tên và số điện thoại. Hệ thống tạo hoặc tìm `client_accounts` theo số điện thoại rồi gắn vào session qua `client_account_id`. Nhiều điện thoại quét cùng QR sau đó sẽ dùng chung session `OPEN`, không cần nhập lại thông tin khách và nhìn thấy cùng danh sách order của phiên bàn.

Khi khách yêu cầu thanh toán, session chuyển sang `PAYMENT_PENDING` và không nhận thêm món. Nếu khách tiếp tục gọi món thì hệ thống tạo session `OPEN` mới cho cùng bàn, không gộp order hoặc payment với session cũ.

### 5.4. Order

#### `orders`

Lưu một lần gửi món của một table session. Khách có thể gọi món nhiều lần trong cùng session; mỗi lần gửi tạo một order riêng cho đến khi yêu cầu thanh toán.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh order |
| `public_id` | Mã order dùng bên ngoài |
| `table_session_id` | Phiên bàn |
| `order_number` | Mã hiển thị cho cửa hàng |
| `subtotal_amount` | Tiền món |
| `total_amount` | Tổng tiền |
| `note` | Ghi chú chung |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

Một `table_session_id` có thể xuất hiện ở nhiều bản ghi trong `orders`, tương ứng một session có nhiều order theo từng lần khách gửi món.

#### `order_items`

Lưu các món thuộc order.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh dòng món |
| `order_id` | Order |
| `menu_item_id` | Tham chiếu món gốc |
| `item_name` | Tên món được ghi nhận trong order |
| `unit_price` | Đơn giá được ghi nhận trong order |
| `selected_options` | JSON chứa các tùy chọn khách đã chọn |
| `quantity` | Số lượng |
| `total_amount` | Thành tiền |
| `note` | Ghi chú cho món |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

`selected_options` là dữ liệu cấu thành dòng món, không phải snapshot của bill. Ví dụ:

```json
[
  {
    "name": "Size lớn",
    "additionalPrice": 5000,
    "quantity": 1
  }
]
```

`item_name`, `unit_price` và `selected_options` là nội dung order đã được khách gửi. Các giá trị này không thay đổi khi menu được cập nhật.

MVP 1 không theo dõi trạng thái chế biến của order hoặc từng món.

#### `order_item_cancellation_requests`

Lưu yêu cầu hủy món của khách và kết quả xử lý của nhân viên.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh yêu cầu |
| `order_item_id` | Dòng món cần hủy |
| `requested_quantity` | Số lượng khách yêu cầu hủy |
| `reason` | Lý do yêu cầu |
| `status` | Trạng thái chờ xử lý, đồng ý hoặc từ chối |
| `resolved_by` | Tài khoản xử lý |
| `resolved_by_name` | Tên người xử lý tại thời điểm thao tác |
| `resolved_at` | Thời điểm xử lý |
| `created_at` | Thời điểm yêu cầu |

Khi yêu cầu được đồng ý, hệ thống cập nhật số lượng hoặc loại bỏ dòng món khỏi phần tính tiền và tính lại tổng order. Yêu cầu bị từ chối không làm thay đổi tổng tiền.

### 5.5. Thanh toán

#### `payments`

Lưu VietQR và kết quả xác nhận thanh toán thủ công của table session. Mỗi payment thanh toán toàn bộ các order thuộc session tại thời điểm tạo bill snapshot.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh payment |
| `public_id` | Định danh dùng bên ngoài |
| `table_session_id` | Phiên bàn |
| `recreated_from_payment_id` | Payment `IGNORED` gốc nếu payment này được tạo lại |
| `reference_code` | Nội dung chuyển khoản duy nhất, sinh theo dạng `CAS_` + UUID |
| `bank_account_number` | Số tài khoản nhận tiền |
| `bank_code` | Mã ngân hàng |
| `bank_account_name` | Tên chủ tài khoản |
| `amount` | Số tiền cần thanh toán |
| `bill_snapshot` | JSON chứa toàn bộ nội dung bill tại thời điểm yêu cầu thanh toán |
| `status` | Trạng thái thanh toán |
| `qr_created_by` | Tài khoản tạo QR |
| `qr_created_at` | Thời điểm tạo QR |
| `confirmed_by` | Tài khoản xác nhận đã nhận tiền, phải trùng với `qr_created_by` |
| `confirmed_by_name` | Tên người xác nhận tại thời điểm thao tác |
| `confirmed_at` | Thời điểm xác nhận đã nhận tiền |
| `ignored_by` | Tài khoản đánh dấu bỏ qua payment |
| `ignored_by_name` | Tên người đánh dấu bỏ qua tại thời điểm thao tác |
| `ignored_reason` | Lý do bỏ qua payment, nếu có |
| `ignored_at` | Thời điểm đánh dấu bỏ qua |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

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
      "placedAt": "2026-07-28T03:00:00Z",
      "items": [
        {
          "name": "Cà phê sữa",
          "unitPrice": 30000,
          "quantity": 2,
          "options": [],
          "lineTotal": 60000
        }
      ]
    }
  ],
  "subtotalAmount": 60000,
  "totalAmount": 60000,
  "currency": "VND"
}
```

Snapshot chỉ chứa dữ liệu cần thiết của bill, không sao chép toàn bộ dữ liệu cửa hàng, menu hoặc dữ liệu kỹ thuật.

VietQR được sinh động từ tài khoản ngân hàng của quán, số tiền chính xác và nội dung chuyển khoản duy nhất. `reference_code` được sinh theo dạng `CAS_` + UUID, ví dụ `CAS_550e8400-e29b-41d4-a716-446655440000`, và không tái sử dụng cho payment khác. QR chỉ hiển thị trên web hoặc thiết bị của nhân viên, không hiển thị trực tiếp trên web khách hàng.

Sau khi khách báo đã chuyển khoản, nhân viên đã tạo QR kiểm tra ứng dụng ngân hàng. Chỉ khi nhận đúng số tiền và nội dung, chính tài khoản đã tạo QR mới được xác nhận payment là `PAID`. Nếu chưa nhận được tiền hoặc khách chuyển thiếu, payment giữ nguyên `PENDING`.

Payment `PENDING` không tự hết hạn. Nhân viên không được hủy payment, chỉ được đánh dấu payment là `IGNORED` khi cần bỏ qua giao dịch này. Payment `IGNORED` vẫn được lưu lại để admin thống kê ở một màn hình riêng.

Khi payment được xác nhận:

- Lưu `confirmed_by`, `confirmed_by_name` và `confirmed_at`, trong đó `confirmed_by` phải bằng `qr_created_by`.
- Cập nhật table session: `is_paid = true`, `status = CLOSED` và lưu `closed_at`.
- Ghi thao tác xác nhận vào `audit_logs`.

Khi payment được đánh dấu bỏ qua:

- Chuyển payment sang `IGNORED`.
- Lưu `ignored_by`, `ignored_by_name`, `ignored_reason` và `ignored_at`.
- Không xóa payment và không coi payment là đã thanh toán.
- Payment `IGNORED` được giữ lại để admin thống kê các khoản chưa thanh toán hoặc giao dịch bị bỏ qua.
- Ghi thao tác đánh dấu bỏ qua vào `audit_logs`.

Nếu sau một vài ngày khách quay lại hoặc cửa hàng cần thu hồi khoản chưa thanh toán, admin tạo một payment mới từ payment `IGNORED` gốc:

- Tạo bản ghi `payments` mới với `public_id`, `reference_code` và VietQR mới.
- Gán `recreated_from_payment_id` trỏ tới payment `IGNORED` gốc.
- Không sửa trạng thái payment `IGNORED` gốc.
- Copy hoặc tạo lại `bill_snapshot` từ payment `IGNORED` gốc theo quyết định nghiệp vụ sẽ được chốt trong `EDGE_CASES.md`.
- Khi payment mới được xác nhận `PAID`, hệ thống hoàn tất các order và đóng phiên bàn nếu phiên chưa đóng.

Trường hợp khách rời đi trước khi yêu cầu thanh toán và chưa có payment nào được tạo được ghi nhận riêng trong `EDGE_CASES.md` vì còn cần chốt cách lưu trạng thái chưa thanh toán.

### 5.6. Vận hành

#### `accounts`

Lưu tài khoản đăng nhập hệ thống. Authentication của MVP 1 chỉ cần phân quyền theo role, chưa cần permission chi tiết.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh tài khoản |
| `store_id` | Cửa hàng |
| `username` | Tên đăng nhập |
| `password_hash` | Mật khẩu đã mã hóa |
| `display_name` | Tên hiển thị |
| `role` | Vai trò của tài khoản |
| `status` | Trạng thái tài khoản |
| `last_login_at` | Lần đăng nhập gần nhất |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

Các role cơ bản:

- `ADMIN`: quản trị cấu hình hệ thống và dữ liệu vận hành.
- `OPERATOR`: xử lý order, tạo VietQR và xác nhận thanh toán.
- `USER`: tài khoản sử dụng thông thường khi cần đăng nhập vào hệ thống.

MVP 1 chưa triển khai permission chi tiết theo từng chức năng.

#### `client_accounts`

Lưu thông tin khách hàng mở phiên bàn. Bảng này tách riêng với `accounts` vì khách hàng không phải tài khoản vận hành nội bộ của quán.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh tài khoản khách |
| `store_id` | Cửa hàng |
| `phone` | Số điện thoại khách |
| `display_name` | Tên khách |
| `status` | Trạng thái tài khoản khách |
| `last_opened_session_at` | Lần gần nhất khách mở phiên bàn |
| `created_at` | Thời điểm tạo |
| `updated_at` | Thời điểm cập nhật |

Khi người đầu tiên mở phiên bàn nhập tên và số điện thoại:

- Nếu `phone` đã tồn tại trong `client_accounts` của cửa hàng, hệ thống dùng lại tài khoản khách đó và có thể cập nhật `display_name`.
- Nếu `phone` chưa tồn tại, hệ thống tạo `client_accounts` mới.
- `table_sessions` lưu `client_account_id` để biết ai là người đại diện mở phiên bàn.
- `opened_by_customer_name` và `opened_by_customer_phone` trong `table_sessions` là snapshot tại thời điểm mở phiên, không thay đổi nếu thông tin khách được cập nhật sau này.

#### `audit_logs`

Lưu các thao tác thay đổi quan trọng như đổi giá món, thay đổi trạng thái bán của món, duyệt hủy món, xác nhận thanh toán thủ công hoặc đánh dấu payment bỏ qua.

| Cột | Ý nghĩa |
|---|---|
| `id` | Định danh log |
| `action` | Loại thao tác |
| `entity_type` | Loại dữ liệu bị thay đổi |
| `entity_id` | Định danh dữ liệu |
| `entity_name` | Tên hiển thị của dữ liệu bị thay đổi |
| `change_data` | JSON chứa dữ liệu trước, sau và các field thay đổi |
| `updated_by` | ID tài khoản thực hiện thay đổi |
| `updated_by_name` | Tên người thực hiện tại thời điểm thay đổi |
| `description` | Nội dung tóm tắt, nếu cần |
| `created_at` | Thời điểm thao tác |

Trong đó:

- `entity_type` có thể là `MENU_ITEM`, `ORDER`, `PAYMENT` hoặc `DINING_TABLE`.
- `entity_id` liên kết logic tới dữ liệu gốc. Không tạo một foreign key chung vì audit log có thể tham chiếu nhiều loại bảng.
- `entity_name` giúp nhận biết nhanh dữ liệu đã thay đổi, ví dụ `Cà phê sữa`.
- `updated_by` lưu ID tài khoản thực hiện thao tác.
- `updated_by_name` lưu tên người thực hiện tại thời điểm thao tác để lịch sử không đổi khi tài khoản được cập nhật.
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
updated_by      = <account_id>
updated_by_name = Nguyễn Văn A
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
| Option group — Option value | Một - nhiều |
| Table session — Order | Một - nhiều |
| Order — Order item | Một - nhiều |
| Order item — Cancellation request | Một - nhiều |
| Table session — Payment | Một - nhiều |
| Account — Audit log | Một - nhiều |
| Client account — Table session | Một - nhiều |

## 7. Trạng thái dữ liệu dự kiến

Các giá trị dưới đây chỉ là đề xuất ban đầu và cần được xác nhận trong tài liệu nghiệp vụ.

| Entity | Trạng thái dự kiến |
|---|---|
| Store | `ACTIVE`, `INACTIVE` |
| Dining table | `AVAILABLE`, `OCCUPIED`, `INACTIVE` |
| QR code | `ACTIVE`, `REVOKED` |
| Table session | `OPEN`, `PAYMENT_PENDING`, `CLOSED` |
| Menu item | `AVAILABLE`, `SOLD_OUT`, `INACTIVE` |
| Cancellation request | `PENDING`, `APPROVED`, `REJECTED` |
| Payment | `PENDING`, `PAID`, `IGNORED` |
| Account | `ACTIVE`, `INACTIVE` |
| Account role | `ADMIN`, `USER`, `OPERATOR` |
| Client account | `ACTIVE`, `INACTIVE` |

## 8. Ràng buộc và index cơ bản

- `dining_tables`: unique `store_id + code`.
- `table_qr_codes`: unique `token`.
- Chỉ một QR hoạt động cho mỗi bàn.
- Mỗi bàn chỉ có tối đa một table session ở trạng thái `OPEN`; session `PAYMENT_PENDING` không thuộc ràng buộc độc quyền này.
- `categories`: unique `store_id + name`.
- `option_groups`: unique `menu_item_id + name`.
- `option_values`: unique `option_group_id + name`.
- Mỗi `option_group` chỉ có tối đa một `option_value` mặc định.
- `orders`: unique `public_id` và `order_number`.
- `payments`: unique `public_id` và `reference_code`.
- `payments`: khi xác nhận thanh toán, `confirmed_by` phải bằng `qr_created_by`.
- `accounts`: unique `store_id + username`.
- `client_accounts`: unique `store_id + phone`.
- Index `audit_logs` theo `entity_type + entity_id`, `updated_by` và `created_at`.
- Index các khóa ngoại và các cột trạng thái thường được dùng để lọc.
- Index thời gian tạo order, thời gian xác nhận payment và thời gian đánh dấu payment bỏ qua để phục vụ màn hình vận hành, thống kê và tra cứu.

Cách áp dụng ràng buộc “mỗi bàn chỉ có một session `OPEN`” trong MySQL sẽ được quyết định khi viết migration. Việc tạo session phải dùng constraint, lock, atomic update hoặc chiến lược tương đương để an toàn khi có xử lý đồng thời.

## 9. Các nội dung chưa thuộc MVP 1

Thiết kế hiện tại chưa bao gồm:

- Hồ sơ và lịch sử nhân viên.
- Permission chi tiết ngoài ba role cơ bản.
- Kho và nguyên vật liệu.
- Khuyến mãi, voucher và điểm thành viên.
- Hồ sơ khách hàng và CRM.
- Zalo và chiến dịch marketing.
- Game và AI.
- Hóa đơn điện tử.
- Nhiều chi nhánh với dữ liệu dùng chung.
- Báo cáo phân tích chuyên sâu.

## 10. Các quyết định đã xác nhận

- Mỗi table session có thể có nhiều order; mỗi lần khách gửi món tạo một order riêng trong cùng session.
- Thanh toán toàn bộ các order của phiên bàn, chưa hỗ trợ tách hóa đơn.
- Khi yêu cầu thanh toán, session cũ ngừng nhận món. Lượt gọi thêm sau đó thuộc một session và payment mới, không liên quan session cũ.
- `orders` không có trạng thái riêng trong MVP 1; trạng thái xử lý được quản lý ở `table_sessions`.
- `table_sessions.is_paid` mặc định là `false` khi mở phiên và chuyển thành `true` khi payment được xác nhận `PAID`.
- Size có một giá trị mặc định được cấu hình theo món.
- Topping không giới hạn số lựa chọn.
- Không theo dõi trạng thái chế biến của order hoặc từng món.
- Yêu cầu hủy món phải được nhân viên đồng ý hoặc từ chối. Khi đồng ý, hệ thống tính lại tổng tiền.
- VietQR thanh toán tự sinh theo đúng số tiền và nội dung chuyển khoản duy nhất.
- VietQR chỉ hiển thị trên web hoặc thiết bị của nhân viên.
- Nhân viên kiểm tra ứng dụng ngân hàng và xác nhận thủ công khi nhận đúng số tiền, đúng nội dung.
- Tài khoản tạo QR thanh toán phải là tài khoản xác nhận payment. Nhân viên khác không được xác nhận thay.
- Nếu chưa nhận được tiền hoặc khách chuyển thiếu, payment tiếp tục ở trạng thái `PENDING`.
- Payment `PENDING` không tự hết hạn.
- Nhân viên không được hủy payment, chỉ được đánh dấu là `IGNORED`.
- Payment `IGNORED` không bị xóa và được giữ lại để admin thống kê ở một màn hình riêng.
- Nếu cần thu lại tiền từ payment `IGNORED`, admin tạo payment mới với mã chuyển khoản và VietQR mới.
- Trường hợp khách rời đi trước khi tạo payment còn cần chốt cách đánh dấu phiên chưa thanh toán trong `EDGE_CASES.md`.
- Chỉ session `OPEN` chiếm dụng bàn; session `PAYMENT_PENDING` không ngăn việc tạo session `OPEN` mới cho cùng bàn.
- Một bàn không bao giờ được có nhiều hơn một session `OPEN` tại cùng một thời điểm, kể cả khi có nhiều yêu cầu tạo session đồng thời.
- Nhiều điện thoại quét cùng QR dùng chung session và nhìn thấy cùng danh sách order.
- Người đầu tiên mở session bàn cần nhập tên và số điện thoại; hệ thống tạo hoặc dùng lại `client_accounts`; người quét QR sau trong cùng session không cần nhập lại.
- Order không cần bước xác nhận trước khi cửa hàng xử lý.
- MVP 1 không tách màn hình bếp và phục vụ.
- Không lưu bảng lịch sử giá món riêng.
- Mỗi món chỉ có một ảnh.
- QR bàn là mã cố định được in và dán tại bàn; QR thanh toán được sinh động theo payment.
- Tạm thời mỗi cửa hàng chỉ dùng một tài khoản ngân hàng nhận tiền. MVP 1 vận hành một cửa hàng.
- Mã chuyển khoản của payment dùng `reference_code` sinh theo dạng `CAS_` + UUID và không tái sử dụng.

## 11. Câu hỏi còn cần xác nhận

1. Khi khách rời đi trước khi tạo payment, hệ thống đánh dấu chưa thanh toán bằng trạng thái trên `table_sessions` hay dùng bảng riêng?
2. Với payment tạo lại từ payment `IGNORED`, hệ thống copy `bill_snapshot` cũ hay tạo lại snapshot từ `orders/order_items`?

## 12. Bước tiếp theo

Sau khi xác nhận các thông tin thanh toán còn lại:

1. Chốt ERD.
2. Chốt danh sách trạng thái và quy tắc chuyển trạng thái.
3. Xác định kiểu dữ liệu, khóa ngoại, constraint và index chi tiết.
4. Tạo script khởi tạo schema MVP 1.
5. Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.

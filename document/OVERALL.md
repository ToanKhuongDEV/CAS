# CAS — Tổng quan sản phẩm và hệ thống

## 1. Giới thiệu

CAS là hệ thống hỗ trợ số hóa quy trình gọi món và thanh toán tại cửa hàng ăn uống.

Trong phiên bản đầu tiên, sản phẩm tập trung vào trải nghiệm gọi món tại bàn bằng mã QR và thanh toán chuyển khoản bằng VietQR do nhân viên xác nhận.

## 2. Mục tiêu sản phẩm

- Giúp khách hàng gọi món nhanh chóng bằng điện thoại.
- Giảm thời gian và sai sót trong quá trình tiếp nhận order.
- Đồng bộ quá trình xử lý món giữa khách hàng và cửa hàng.
- Hỗ trợ thanh toán và xác nhận giao dịch thuận tiện.
- Tạo nền tảng để mở rộng các chức năng quản lý trong tương lai.

## 3. Đối tượng sử dụng

| Đối tượng | Nhu cầu chính |
|---|---|
| Khách hàng | Xem menu, gọi món và thanh toán |
| Nhân viên vận hành | Tiếp nhận và xử lý order |
| Bếp/quầy chế biến | Theo dõi và cập nhật quá trình chuẩn bị món |
| Chủ cửa hàng | Quản lý menu, bàn và theo dõi hoạt động cơ bản |

## 4. Phạm vi chức năng

Hệ thống tập trung vào luồng:

```text
Quét QR
    ↓
Xem menu và gọi món
    ↓
Cửa hàng tiếp nhận và xử lý order
    ↓
Yêu cầu thanh toán
    ↓
Nhân viên tạo VietQR và xác nhận giao dịch
```

### 4.1. Các chức năng cần có

#### Quét QR và gọi món

- Quét QR tại bàn.
- Xem menu.
- Chọn món và tạo order.
- Gọi thêm món.

#### Quản lý menu

- Quản lý danh mục món.
- Quản lý thông tin và giá món.
- Quản lý trạng thái còn hoặc hết món.
- Quản lý hình ảnh món.

#### Quản lý bàn và QR

- Quản lý bàn.
- Tạo và quản lý mã QR cho bàn.

#### Xử lý order

- Tiếp nhận order.
- Xem thông tin món được gọi.
- Hoàn thành hoặc hủy order.

#### Thanh toán bằng VietQR

- Tạo yêu cầu thanh toán.
- Thông báo yêu cầu thanh toán cho nhân viên.
- Tạo VietQR với tài khoản ngân hàng, số tiền và nội dung chuyển khoản.
- Hiển thị VietQR trên web hoặc thiết bị của nhân viên.
- Nhân viên kiểm tra giao dịch và xác nhận đã nhận tiền.
- Cập nhật kết quả thanh toán và kết thúc phiên bàn.

#### Vận hành hệ thống

- Đăng nhập khu vực vận hành.
- Phân quyền đơn giản theo role gồm `ADMIN`, `USER` và `OPERATOR`.
- Cấu hình thông tin cửa hàng.
- Theo dõi lỗi và trạng thái hoạt động cơ bản.
- Sao lưu dữ liệu cần thiết.

### 4.2. Ngoài phạm vi hiện tại

- Quản lý nhân viên, ca làm và chấm công.
- Phân quyền chi tiết ngoài ba role cơ bản.
- Quản lý nhiều chi nhánh.
- Quản lý kho và nguyên vật liệu.
- Khuyến mãi, voucher và chương trình thành viên.
- CRM và chăm sóc khách hàng.
- Tích hợp Zalo.
- Game và các tính năng AI.
- Kế toán và hóa đơn điện tử.
- Báo cáo và phân tích nâng cao.

Các chức năng này sẽ được xem xét trong những phiên bản sau dựa trên nhu cầu vận hành thực tế.

## 5. Luồng nghiệp vụ chính

### 5.1. Gọi món

1. Khách hàng quét QR tại bàn.
2. Khách hàng xem menu và chọn món.
3. Hệ thống ghi nhận order.
4. Cửa hàng tiếp nhận order.

### 5.2. Gọi thêm món

1. Khách hàng tiếp tục truy cập menu tại bàn.
2. Khách hàng chọn và gửi thêm món.
3. Hệ thống tạo order mới trong cùng phiên bàn.

### 5.3. Thanh toán

1. Khách hàng yêu cầu thanh toán.
2. Hệ thống chuyển các order trong phiên bàn sang trạng thái chờ thanh toán và thông báo cho nhân viên.
3. Nhân viên tạo VietQR trên web quản lý.
4. Nhân viên đưa màn hình QR cho khách quét và chuyển khoản.
5. Nhân viên kiểm tra ứng dụng ngân hàng.
6. Nhân viên xác nhận khi đã nhận đúng số tiền và nội dung chuyển khoản.
7. Hệ thống hoàn tất các order và phiên sử dụng bàn.

## 6. Kiến trúc tổng thể

Hệ thống sử dụng kiến trúc modular monolith để đơn giản hóa quá trình phát triển, triển khai và vận hành.

```text
Giao diện khách hàng ───┐
                       ├── Core Backend ── Database
Giao diện vận hành ─────┘         │
                                  └── VietQR
```

### 6.1. Các thành phần chính

| Thành phần | Trách nhiệm |
|---|---|
| Giao diện khách hàng | Menu, gọi món và thanh toán |
| Giao diện vận hành | Quản lý menu, bàn, order và thanh toán |
| Core Backend | Xử lý nghiệp vụ và tích hợp hệ thống |
| Database | Lưu trữ dữ liệu nghiệp vụ |
| VietQR | Tạo mã chuyển khoản theo tài khoản, số tiền và nội dung |
| Dịch vụ lưu trữ ảnh | Lưu trữ hình ảnh menu |

### 6.2. Các module nghiệp vụ

| Module | Phạm vi |
|---|---|
| Store & Table | Cửa hàng, bàn và QR |
| Catalog | Danh mục và món |
| Ordering | Phiên bàn, order, gọi thêm và yêu cầu hủy món |
| Payment | Tạo VietQR và xác nhận thanh toán thủ công |
| Operation | Hoạt động vận hành cơ bản |

Các module được tổ chức trong cùng một backend và có thể tách hoặc mở rộng khi hệ thống phát triển.

## 7. Công nghệ

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Java 21, Spring Boot |
| Build và quản lý dependency | Maven |
| Truy cập dữ liệu | MyBatis |
| Database | MySQL |
| Cache và dữ liệu tạm thời | Redis |
| Database migration | Flyway |
| Hỗ trợ phát triển backend | Lombok, Jakarta Bean Validation |
| Lưu trữ hình ảnh | Cloudinary hoặc dịch vụ tương đương |
| Kiểm thử | JUnit 5, Mockito, Testcontainers, Vitest, Playwright |
| Triển khai | Docker, GitHub Actions |

## 8. Dữ liệu tổng quan

Các nhóm dữ liệu chính:

```text
Cửa hàng và bàn
Menu và món
Phiên sử dụng bàn
Các order và món trong order
Thanh toán và giao dịch
Tài khoản và dữ liệu vận hành cơ bản
```

Thiết kế database, cấu trúc bảng và quy tắc lưu trữ sẽ được trình bày trong tài liệu chuyên biệt.

## 9. Thanh toán bằng VietQR

Hệ thống tạo VietQR chứa tài khoản ngân hàng của quán, số tiền chính xác và nội dung chuyển khoản duy nhất.

VietQR chỉ hiển thị trên web hoặc thiết bị của nhân viên. Sau khi khách chuyển khoản, nhân viên kiểm tra ứng dụng ngân hàng và xác nhận thủ công.

Hệ thống không nhận webhook hoặc tự động xác nhận giao dịch. Nếu chưa nhận đủ tiền hoặc nội dung không chính xác, các order trong phiên bàn tiếp tục chờ thanh toán.

## 10. Yêu cầu hệ thống tổng quan

- Giao diện khách hàng phù hợp với thiết bị di động.
- Menu và quá trình gọi món có tốc độ phản hồi tốt.
- Trạng thái thanh toán được cập nhật kịp thời.
- Dữ liệu order và thanh toán được lưu trữ an toàn.
- Hệ thống có khả năng theo dõi lỗi và sao lưu dữ liệu.
- Kiến trúc cho phép bổ sung chức năng trong các giai đoạn sau.

Các chỉ tiêu kỹ thuật chi tiết sẽ được xác định trong tài liệu yêu cầu phi chức năng.

## 11. Lộ trình phát triển

### Giai đoạn 1 — Nền tảng cốt lõi

- Nền tảng frontend, backend và database.
- Quản lý menu, bàn và QR.
- Quét QR và gọi món.
- Màn hình tiếp nhận và xử lý order.
- Thanh toán bằng VietQR và xác nhận thủ công.
- Kiểm thử và triển khai thử nghiệm tại cửa hàng.

### Giai đoạn 2 — Hoàn thiện vận hành

- Cải thiện quy trình xử lý order.
- Báo cáo vận hành cơ bản.
- Tinh chỉnh phạm vi thao tác theo ba role cơ bản nếu cần.
- Tối ưu trải nghiệm và hiệu năng.

### Giai đoạn 3 — Mở rộng sản phẩm

- Quản lý nhân viên.
- Quản lý kho.
- Khuyến mãi và chương trình thành viên.
- CRM và tích hợp Zalo.
- Nhiều chi nhánh.
- Game và tính năng AI.
- Báo cáo nâng cao.

Thứ tự triển khai các giai đoạn tiếp theo sẽ được điều chỉnh theo phản hồi và nhu cầu thực tế.

## 12. Tài liệu chi tiết liên quan

Các nội dung triển khai chi tiết nên được tách thành tài liệu riêng:

```text
document/
├── OVERALL.md
├── PRODUCT_REQUIREMENTS.md
├── FEATURES.md
├── BUSINESS_FLOWS.md
├── EDGE_CASES.md
├── ARCHITECTURE.md
├── DATABASE_DESIGN.md
├── API_GUIDELINES.md
├── PAYMENT_FLOW.md
├── SECURITY.md
├── DEPLOYMENT.md
└── ROADMAP.md
```
## 13. Kết luận

CAS tập trung vào hai năng lực cốt lõi:

1. Quét QR để gọi món tại bàn.
2. Thanh toán chuyển khoản bằng VietQR do nhân viên xác nhận.

Các chức năng quản trị và mở rộng khác sẽ được phát triển sau khi luồng cốt lõi được hoàn thiện và đưa vào vận hành ổn định.

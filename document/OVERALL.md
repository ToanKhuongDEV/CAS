# CAS — Tổng quan sản phẩm và hệ thống

## 1. Giới thiệu

CAS là hệ thống hỗ trợ số hóa quy trình gọi món và thanh toán tại cửa hàng ăn uống.

Trong phiên bản đầu tiên, sản phẩm tập trung vào trải nghiệm gọi món tại bàn bằng mã QR và luồng yêu cầu thanh toán do nhân viên xác nhận.

## 2. Mục tiêu sản phẩm

- Giúp khách hàng gọi món nhanh chóng bằng điện thoại.
- Giảm thời gian và sai sót trong quá trình tiếp nhận order.
- Đồng bộ quá trình xử lý món giữa khách hàng và cửa hàng.
- Hỗ trợ gửi yêu cầu và ghi nhận trạng thái thanh toán thuận tiện.
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
Nhân viên xác nhận kết quả thanh toán
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
- Cho phép `OPERATOR` dùng các chức năng chọn món của giao diện Customer để tạo
  order hộ khách tại bàn khi khách yêu cầu gọi món trực tiếp, gồm xem menu, chọn
  option, quản lý giỏ món, nhập ghi chú chung, gửi order và gọi thêm món.
- Danh sách đơn gọi món ưu tiên theo nguyên tắc gọi trước lên món trước: order có
  `created_at` sớm hơn được xếp trước.
- Tổng hợp số phần còn cần làm của các món có cùng món chính và cùng cấu hình
  option để nhân viên có thể chế biến nhiều order theo mẻ.
- Cho phép nhân viên ghi nhận số phần đã làm xong; hệ thống tự phân bổ số lượng
  hoàn thành về các dòng món theo FIFO.
- Cảnh báo cho nhân viên về các bàn có order cũ còn món chưa làm xong.
- Ghi nhận số lượng món đã làm xong và xử lý yêu cầu hủy món.

Mỗi lần gọi món là một order riêng trong hàng ưu tiên chung. Khi khách gọi thêm,
order mới được xếp sau các order đã được tạo trước đó. CAS sắp xếp thứ tự ưu
tiên FIFO và theo dõi số lượng đã làm xong, nhưng không lưu enum trạng thái chế
biến hay tự xác nhận món đã được lên. Nếu nhiều order có cùng `created_at`, thứ
tự giữa các order đó không cần được bảo đảm.

Mức hoàn thành được lưu bằng `order_items.prepared_quantity`, không dùng boolean
hoàn thành ở `orders`. Số phần còn cần làm của một dòng món bằng số lượng gốc
trừ số lượng hủy đã được duyệt và số lượng đã làm xong. Một order được xem là
hoàn thành theo giá trị suy ra khi mọi dòng món còn hiệu lực đều không còn phần
cần làm.

Thời gian chờ của một bàn được tính từ `orders.created_at` của order cũ nhất vẫn
còn ít nhất một phần chưa làm xong trong table session đang phục vụ. Một bàn
được cảnh báo khi thời gian chờ lớn hơn hoặc bằng ngưỡng do `ADMIN` cấu hình.
Trong giai đoạn UI chưa kết nối cấu hình backend, giá trị tạm thời là `25` phút.

Order do `OPERATOR` tạo hộ vẫn thuộc đúng table session của khách và tuân theo
cùng quy tắc giá, kiểm tra món/option, idempotency và FIFO như order do Customer
gửi. Backend không tin giá hoặc tổng tiền từ giao diện vận hành. Thao tác tạo hộ
phải được ghi `audit_logs` với tài khoản nhân viên thực hiện.

#### Yêu cầu và xác nhận thanh toán

- Tạo yêu cầu thanh toán.
- Thông báo yêu cầu thanh toán cho nhân viên.
- Tự động tạo payment `PENDING` với số tiền bằng tổng phải trả của các order trong phiên bàn.
- Yêu cầu khách ra gặp nhân viên để hoàn tất thanh toán.
- Sau khi xác minh chuyển khoản thành công qua loa báo giao dịch (“ting ting”), nhân viên xác nhận payment thành `PAID`.
- Cập nhật kết quả thanh toán và kết thúc phiên bàn.

#### Vận hành hệ thống

- Đăng nhập khu vực vận hành.
- Client sử dụng giao diện khách hàng mà không cần tài khoản đăng nhập.
- Tài khoản vận hành sử dụng hai role `ADMIN` và `OPERATOR`. Mọi chức năng quản trị chỉ dành cho `ADMIN`; `OPERATOR` chỉ xử lý nghiệp vụ vận hành.
- `ADMIN` có chức năng xem danh sách `report`.
- `ADMIN` cấu hình ngưỡng số phút dùng để cảnh báo bàn chờ lâu.
- JWT là cơ chế xác thực chính cho tài khoản vận hành và không được lưu trong `localStorage`.
- Cấu hình thông tin cửa hàng.
- Theo dõi lỗi và trạng thái hoạt động cơ bản.
- Sao lưu dữ liệu cần thiết.

Chức năng danh sách `report` hiện mới được chốt ở mức phạm vi và quyền truy
cập. Loại report, nguồn tạo report, dữ liệu hiển thị, trạng thái, bộ lọc, phân
trang và thao tác xử lý là các nội dung `Cần chốt`. Chưa được suy diễn chức năng
này thành báo cáo phân tích nâng cao, chưa bổ sung endpoint hoặc mô hình dữ liệu
khi chưa có quyết định tiếp theo.

### 4.2. Ngoài phạm vi hiện tại

- Quản lý nhân viên, ca làm và chấm công.
- Ma trận phân quyền chi tiết theo từng API.
- Quản lý nhiều chi nhánh.
- Quản lý kho và nguyên vật liệu.
- Khuyến mãi, voucher và chương trình thành viên.
- CRM và chăm sóc khách hàng.
- Tích hợp Zalo.
- Game và các tính năng AI.
- Kế toán và hóa đơn điện tử.
- Báo cáo và phân tích nâng cao ngoài chức năng Admin xem danh sách `report` đã
  được ghi nhận ở phạm vi hiện tại.

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
2. Hệ thống tính tổng phải trả từ `orders.payable_amount`, tạo payment `PENDING`, chuyển phiên bàn sang chờ thanh toán và thông báo cho nhân viên.
3. Giao diện yêu cầu khách ra gặp nhân viên để hoàn tất thanh toán.
4. Nhân viên mở yêu cầu thanh toán trên giao diện vận hành.
5. Khách thực hiện chuyển khoản; nhân viên xác minh chuyển khoản thành công qua loa báo giao dịch (“ting ting”).
6. Nhân viên bấm xác nhận thanh toán thành công.
7. Hệ thống chuyển payment sang `PAID` và hoàn tất phiên sử dụng bàn.
8. Giao diện Customer nhận trạng thái `PAID` qua polling và chuyển sang màn
   “Thanh toán thành công”.
9. Màn hoàn tất hiển thị bàn, tổng tiền đã xác nhận, thời gian hoàn tất, lời cảm
   ơn và thao tác tiếp tục tạo đơn mới. Thao tác này dùng lại QR token cố định
   của chính bàn đó để trở về màn nhập thông tin như một khách mới; Customer
   không còn thao tác trên session vừa đóng.

CAS chỉ ghi nhận trạng thái nghiệp vụ `PENDING` hoặc `PAID`; hệ thống không tạo QR thanh toán, không lưu thông tin ngân hàng và không tích hợp với loa báo giao dịch. Việc xác minh chuyển khoản diễn ra ngoài CAS và do nhân viên chịu trách nhiệm.

## 6. Kiến trúc tổng thể

Hệ thống sử dụng kiến trúc modular monolith để đơn giản hóa quá trình phát triển, triển khai và vận hành.

```text
Giao diện khách hàng ───┐
                       ├── Core Backend ── Database
Giao diện vận hành ─────┘
```

### 6.1. Các thành phần chính

| Thành phần | Trách nhiệm |
|---|---|
| Giao diện khách hàng | Menu, gọi món và thanh toán |
| Giao diện vận hành | Quản lý menu, bàn, order và thanh toán |
| Core Backend | Xử lý nghiệp vụ và tích hợp hệ thống |
| Database | Lưu trữ dữ liệu nghiệp vụ |
| Cloudinary | Lưu trữ hình ảnh menu |

Giao diện khách hàng, giao diện nhân viên vận hành và giao diện admin được xây dựng trong cùng một ứng dụng Next.js, tổ chức thành ba khu vực route và layout riêng:

```text
CAS Frontend
├── Customer — không đăng nhập
├── Operation — JWT, role OPERATOR
└── Admin — JWT, role ADMIN
```

Luồng route Customer bắt đầu tại `/table/{qrToken}` khi khách quét QR. Route
này chỉ dùng để backend xác minh QR, xác định bàn và tìm hoặc mở table session.
Sau khi có session hợp lệ, frontend chuyển sang các route ngắn `/menu`, `/cart`
và `/orders`; QR token không tiếp tục xuất hiện trong URL. Cơ chế vận chuyển và
lưu ngữ cảnh session giữa frontend và backend phải được chốt trong API contract.
Backend không được tin table ID hoặc session ID do client tự suy diễn.

Thanh điều hướng Customer mặc định gồm bốn tab theo thứ tự: Trang chủ, Thực đơn,
Đơn hàng và Cài đặt. Thanh toán không phải tab truy cập thường trực; Customer chỉ
đi vào `/payment` bằng thao tác “Yêu cầu thanh toán” tại trang Đơn hàng. Trong
luồng này, tab Thanh toán được hiển thị để phản ánh màn hiện tại. Cùng một cấu
trúc điều hướng được hiển thị dạng thanh tab dưới trên mobile. Trên web, các tab
được đặt bên trái thành những khối chữ nhật có border và khoảng cách riêng, nổi
trực tiếp trên nền trang thay vì nằm trong một thanh sidebar liền khối.

Định hướng giao diện theo từng khu vực:

- Customer phát triển theo hướng mobile-first vì khách hàng thao tác chủ yếu trên điện thoại sau khi quét QR tại bàn.
- Operation dành cho nhân viên ưu tiên giao diện web trên desktop hoặc laptop để xử lý thông tin vận hành; giao diện vẫn phải responsive cho thiết bị di động.
- Admin ưu tiên giao diện web trên desktop hoặc laptop để quản lý dữ liệu và thực hiện các tác vụ vận hành có mật độ thông tin cao.
- Cả ba khu vực vẫn phải responsive; mobile-first hoặc desktop-first chỉ xác định kích thước ưu tiên khi thiết kế và triển khai.

### 6.2. Các module nghiệp vụ

| Module | Phạm vi |
|---|---|
| Store & Table | Cửa hàng, bàn và QR |
| Catalog | Danh mục và món |
| Ordering | Phiên bàn, order, gọi thêm và yêu cầu hủy món |
| Payment | Tạo yêu cầu và ghi nhận xác nhận thanh toán |
| Operation | Hoạt động vận hành cơ bản |

Các module được tổ chức trong cùng một backend và có thể tách hoặc mở rộng khi hệ thống phát triển.

### 6.3. Giao tiếp và đồng bộ trạng thái

- Frontend gọi REST API để thực hiện các thao tác và nhận kết quả trực tiếp.
- Các màn hình Customer, Operation và Admin dùng polling để lấy thay đổi phát sinh từ thiết bị khác, gồm order mới, yêu cầu hủy, yêu cầu thanh toán, trạng thái payment và khoản chưa thanh toán.
- Dashboard Operation dùng polling để cập nhật danh sách bàn chờ lâu; thời gian chờ được backend tính từ `orders.created_at` của order cũ nhất còn món chưa làm xong trong session bàn.
- Menu không polling liên tục; backend luôn kiểm tra lại trạng thái món và option khi khách submit order.
- Giai đoạn đầu không dùng SSE, WebSocket hoặc Redis Pub/Sub.
- Chu kỳ polling là cấu hình kỹ thuật được xác định khi triển khai và kiểm thử thực tế.

### 6.4. Tích hợp dịch vụ ngoài

- Frontend chỉ giao tiếp với CAS Backend, không gọi trực tiếp Cloudinary.
- Khi admin quản lý ảnh món, CAS Backend nhận file, kiểm tra quyền và upload ảnh lên Cloudinary bằng authenticated API. Backend lưu `image_url` và `image_storage_key` vào MySQL.
- Số tiền của payment được CAS Backend tính từ tổng `orders.payable_amount`; frontend không được gửi một số tiền để backend tin cậy.
- CAS không tích hợp VietQR, dịch vụ ngân hàng hoặc loa báo giao dịch. Nhân viên dùng tín hiệu “ting ting” bên ngoài CAS để xác minh chuyển khoản trước khi bấm xác nhận; CAS chỉ cập nhật trạng thái nghiệp vụ.
- Cloudinary được cô lập trong infrastructure adapter; domain không phụ thuộc trực tiếp vào SDK hoặc provider.

## 7. Công nghệ và thư viện

Danh sách dưới đây phản ánh các công nghệ đã được chốt và các dependency trực tiếp đang được khai báo trong `backend/pom.xml`, `frontend/package.json` và `compose.yaml`. Phiên bản không ghi riêng được quản lý bởi Spring Boot hoặc tệp khóa dependency tương ứng. Công nghệ đã chốt nhưng chưa được cài đặt phải được ghi rõ trạng thái. Các dependency gián tiếp thuần nội bộ không được liệt kê riêng.

### 7.1. Nền tảng và công cụ

| Thành phần | Công nghệ/phiên bản | Mục đích |
|---|---|---|
| Backend runtime | Java 21 | Chạy ứng dụng backend |
| Backend framework | Spring Boot 3.5.9 | Khởi tạo, cấu hình và vận hành backend |
| Backend build | Maven, Spring Boot Maven Plugin | Build, kiểm thử và đóng gói backend |
| Frontend runtime | Node.js >= 20.9.0 | Chạy công cụ phát triển và ứng dụng frontend |
| Frontend framework | Next.js ^16.0.0 (App Router) | Xây dựng ứng dụng web và routing |
| Giao diện | React ^19.2.0, React DOM ^19.2.0 | Xây dựng và render giao diện |
| Styling frontend | Tailwind CSS ^4.3.3 | Xây dựng giao diện bằng utility class |
| Ngôn ngữ frontend | TypeScript ^5.9.0 | Kiểm tra kiểu tĩnh cho frontend |
| Quản lý package frontend | npm, package-lock v3 | Cài đặt và khóa phiên bản dependency |
| Cơ sở dữ liệu | MySQL 8.4 | Lưu dữ liệu nghiệp vụ bền vững |
| Cache/dữ liệu tạm thời | Redis 7.4 Alpine | Cache và dữ liệu tạm thời; không phải nguồn dữ liệu bền vững |
| Môi trường phát triển | Docker Compose | Khởi chạy MySQL và Redis cục bộ |
| Lưu trữ hình ảnh | Cloudinary (đã chốt, chưa cấu hình) | Lưu trữ hình ảnh menu |
| CI/CD | GitHub Actions (đã chốt, chưa cấu hình workflow) | Tự động kiểm tra và triển khai ứng dụng |
| Môi trường production | Một VPS, Docker Compose (đã chốt, chưa cấu hình) | Frontend và backend chạy trong cùng Docker Compose network |

### 7.2. Thư viện backend

| Dependency/thư viện | Phiên bản | Mục đích |
|---|---|---|
| `spring-boot-starter-web` | Theo Spring Boot 3.5.9 | REST API với Spring MVC, Jackson và embedded server |
| `spring-boot-starter-validation` | Theo Spring Boot 3.5.9 | Jakarta Bean Validation tại biên API, dùng Hibernate Validator |
| `spring-boot-starter-actuator` | Theo Spring Boot 3.5.9 | Health check và thông tin vận hành |
| `spring-boot-starter-data-redis` | Theo Spring Boot 3.5.9 | Tích hợp Redis qua Spring Data Redis |
| `mybatis-spring-boot-starter` | 3.0.5 | Truy cập MySQL bằng MyBatis và tích hợp với Spring Boot |
| `flyway-core` | Theo Spring Boot 3.5.9 | Quản lý và chạy database migration |
| `flyway-mysql` | Theo Spring Boot 3.5.9 | Hỗ trợ MySQL cho Flyway |
| `mysql-connector-j` | Theo Spring Boot 3.5.9 | JDBC driver kết nối MySQL |
| `lombok` | Theo Spring Boot 3.5.9 | Giảm mã lặp trong Java tại thời điểm biên dịch |
| `spring-boot-configuration-processor` | Theo Spring Boot 3.5.9 | Sinh metadata cho cấu hình tùy chỉnh |
| HikariCP | Do Spring Boot JDBC stack cung cấp | Connection pool cho MySQL |

### 7.3. Thư viện frontend

| Dependency/thư viện | Phiên bản khai báo | Mục đích |
|---|---|---|
| `next` | ^16.0.0 | Framework frontend |
| `react` | ^19.2.0 | Xây dựng component giao diện |
| `react-dom` | ^19.2.0 | Render React trên web |
| `tailwindcss` | ^4.3.3 | Utility-first CSS framework |
| `@tailwindcss/postcss` | ^4.3.3 | Tích hợp Tailwind CSS vào pipeline PostCSS |
| `postcss` | ^8.5.18 | Chuyển đổi CSS bằng plugin trong quá trình build |
| `typescript` | ^5.9.0 | Biên dịch và kiểm tra kiểu |
| `@types/node` | ^22.0.0 | Kiểu TypeScript cho Node.js |
| `@types/react` | ^19.2.0 | Kiểu TypeScript cho React |
| `@types/react-dom` | ^19.2.0 | Kiểu TypeScript cho React DOM |
| `eslint` | ^9.39.4 | Phân tích tĩnh mã nguồn |
| `eslint-config-next` | ^16.0.0 | Bộ quy tắc ESLint dành cho Next.js |

`package.json` đang khóa bổ sung các package `brace-expansion` ^5.0.8, `minimatch` ^10.2.4, `postcss` ^8.5.18 và `sharp` ^0.35.0 bằng `overrides`.

### 7.4. Thư viện kiểm thử

| Phạm vi | Dependency/thư viện | Phiên bản khai báo | Mục đích |
|---|---|---|---|
| Backend | `spring-boot-starter-test` | Theo Spring Boot 3.5.9 | Cung cấp Spring Test, JUnit Jupiter, AssertJ, Mockito và các tiện ích kiểm thử backend |
| Backend | `org.testcontainers:junit-jupiter` | 1.21.4 | Tích hợp Testcontainers với JUnit Jupiter |
| Backend | `org.testcontainers:mysql` | 1.21.4 | Chạy MySQL container cho integration test |
| Frontend | `vitest` | ^3.2.0 | Test runner cho unit/component test |
| Frontend | `@vitejs/plugin-react` | ^5.0.0 | Hỗ trợ React trong môi trường Vitest/Vite |
| Frontend | `@testing-library/react` | ^16.3.0 | Kiểm thử component React theo hành vi người dùng |
| Frontend | `@testing-library/jest-dom` | ^6.9.0 | Matcher DOM mở rộng cho test |
| Frontend | `jsdom` | ^27.0.0 | Mô phỏng môi trường trình duyệt cho component test |
| End-to-end | `@playwright/test` | ^1.55.0 | Kiểm thử luồng người dùng trên trình duyệt |

Cloudinary, GitHub Actions và phương án triển khai production trên một VPS đã được chốt ở mức công nghệ. Frontend và backend được đóng gói thành các service trong cùng một Docker Compose network trên VPS. Repository hiện chưa có cấu hình tích hợp Cloudinary, workflow GitHub Actions hoặc cấu hình triển khai VPS. Reverse proxy, TLS, domain, quản lý secret, vị trí chạy database và chiến lược backup cần được xác nhận riêng trước khi triển khai.

## 8. Dữ liệu tổng quan

Các nhóm dữ liệu chính:

```text
Cửa hàng và bàn
Menu và món
Phiên sử dụng bàn
Các order và món trong order
Yêu cầu và trạng thái thanh toán
Tài khoản và dữ liệu vận hành cơ bản
```

Thiết kế database, cấu trúc bảng và quy tắc lưu trữ sẽ được trình bày trong tài liệu chuyên biệt.

## 9. Yêu cầu và xác nhận thanh toán

Khi khách yêu cầu thanh toán, CAS tạo một payment `PENDING` cho toàn bộ phiên bàn. `payments.amount` luôn được backend lấy từ tổng `orders.payable_amount` tại thời điểm yêu cầu; client không được nhập hoặc ghi đè số tiền này.

Sau khi gửi yêu cầu, khách bắt buộc ra gặp nhân viên. Khách thực hiện chuyển khoản và nhân viên xác minh tiền đã vào qua loa báo giao dịch (“ting ting”), sau đó nhân viên bấm xác nhận trên giao diện vận hành để chuyển payment sang `PAID` và đóng phiên bàn. Nếu chưa xác nhận, payment giữ trạng thái `PENDING`.

CAS không tạo QR thanh toán, không lưu số tài khoản, tên ngân hàng, tên chủ tài khoản, nội dung chuyển khoản hoặc dữ liệu giao dịch. CAS cũng không tích hợp với loa báo giao dịch; nhân viên xác minh chuyển khoản ngoài hệ thống và CAS chỉ ghi nhận kết quả phục vụ vận hành.

## 10. Yêu cầu hệ thống tổng quan

- Giao diện Customer phát triển theo hướng mobile-first.
- Giao diện Operation và Admin ưu tiên web trên desktop hoặc laptop; cả hai vẫn phải responsive trên thiết bị di động.
- Cả ba khu vực giao diện phải responsive trên các kích thước màn hình được hỗ trợ.
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
- Yêu cầu thanh toán và xác nhận thủ công bởi nhân viên.
- Kiểm thử và triển khai thử nghiệm tại cửa hàng.

### Giai đoạn 2 — Hoàn thiện vận hành

- Cải thiện quy trình xử lý order.
- Báo cáo vận hành cơ bản.
- Tinh chỉnh ma trận phân quyền theo từng API nếu cần.
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
├── SECURITY.md
├── DEPLOYMENT.md
└── ROADMAP.md
```
## 13. Kết luận

CAS tập trung vào hai năng lực cốt lõi:

1. Quét QR để gọi món tại bàn.
2. Yêu cầu thanh toán và ghi nhận kết quả do nhân viên xác nhận.

Các chức năng quản trị và mở rộng khác sẽ được phát triển sau khi luồng cốt lõi được hoàn thiện và đưa vào vận hành ổn định.

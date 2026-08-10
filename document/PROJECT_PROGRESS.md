# CAS — Theo dõi tiến độ dự án

Ngày cập nhật gần nhất: 2026-08-09

## Quy ước

- `[x]`: Đã hoàn thành và đã được xác nhận.
- `[ ]`: Chưa hoàn thành.
- Mỗi khi phạm vi hoặc thiết kế thay đổi, cập nhật checklist này trong cùng pull request hoặc commit.

## 1. Phân tích và tài liệu

- [x] Xác định mục tiêu và phạm vi chức năng của CAS.
- [x] Mô tả luồng gọi món bằng QR tại bàn.
- [x] Mô tả luồng gọi thêm món.
- [x] Mô tả luồng yêu cầu hủy món.
- [x] Mô tả luồng yêu cầu thanh toán.
- [x] Mô tả luồng tạo payment và xác nhận trạng thái thanh toán thủ công.
- [x] Mô tả luồng ghi nhận khách rời đi chưa thanh toán.
- [x] Mô tả luồng xác nhận payment sau khi đã ghi nhận chưa thanh toán.
- [x] Tổng hợp các trường hợp biên nghiệp vụ.
- [x] Chuẩn hóa cách diễn đạt phạm vi trong tài liệu chính thức.
- [x] Rà soát lại toàn bộ tài liệu nguồn của dự án ngày 2026-08-05.

## 2. Các quyết định nghiệp vụ đã chốt

- [x] Mỗi lần gửi món tạo một `orders` riêng trong cùng `table_sessions`.
- [x] `OPERATOR` được dùng luồng chọn món của Customer để tạo order hộ khách vào
      table session `OPEN`; order dùng cùng validation, giá, idempotency, FIFO và
      phải ghi audit log theo tài khoản nhân viên.
- [x] Danh sách đơn gọi món ưu tiên theo FIFO: order có `created_at` sớm hơn được xếp lên món trước; order gọi thêm xếp sau các order đã tạo trước. Các order trùng `created_at` không cần bảo đảm thứ tự và không cần khóa sắp xếp phụ.
- [x] Tiến độ làm món được quản lý bằng `order_items.prepared_quantity`; không lưu `orders.is_completed`. Nhân viên hoàn thành số lượng theo mẻ, backend phân bổ về các dòng món theo FIFO và trạng thái hoàn thành order được suy ra.
- [x] Chống gửi order trùng bằng `idempotency_key` và `request_fingerprint`.
- [x] Order chỉ có ghi chú chung tại `orders.note`, không ghi chú theo từng món.
- [x] Giá món chính và giá option được lưu riêng tại thời điểm đặt.
- [x] Option (size, topping, đường/đá...) được quản lý độc lập trong bảng `option_values`, thuộc nhóm `option_groups`, không nằm trong `menu_items`.
- [x] Quản lý nhãn món bằng `tags` và bảng trung gian nhiều-nhiều `menu_item_tags`.
- [x] `dining_tables` dùng `code` kiểu `INT UNSIGNED`, duy nhất toàn hệ thống và không còn lưu `name`.
- [x] Dùng `option_groups`, `option_values`, `menu_item_option_groups` và `order_item_options` để quản lý nhóm lựa chọn và liên kết size/topping với món.
- [x] Hai món có cấu hình option khác nhau được lưu thành hai `order_items` khác nhau.
- [x] Yêu cầu hủy món không sửa hoặc xóa dữ liệu order gốc.
- [x] Bàn đang có khách được suy ra từ `table_sessions` trạng thái `OPEN` hoặc `PAYMENT_PENDING`.
- [x] `dining_tables` không lưu cột trạng thái; bàn không có trạng thái `ACTIVE` hoặc `INACTIVE`.
- [x] Khoản chưa thanh toán được quản lý trong bảng riêng `unpaid_records`.
- [x] `unpaid_records` và `payments` đều lưu `bill_snapshot`.
- [x] Mỗi table session có tối đa một payment với trạng thái `PENDING` hoặc `PAID`.
- [x] Payment được tạo khi khách yêu cầu; số tiền do backend lấy từ tổng `orders.payable_amount`.
- [x] CAS không tạo QR thanh toán, không lưu thông tin ngân hàng và không tự theo dõi luồng tiền thực tế.
- [x] Sau khi gửi yêu cầu, khách bắt buộc gặp nhân viên; nhân viên xác minh chuyển khoản qua loa “ting ting” rồi mới xác nhận payment `PAID`.
- [x] Thời gian nghiệp vụ dùng `Asia/Ho_Chi_Minh` (`UTC+07:00`).
- [x] Thời gian chờ của bàn trên dashboard Operation được tính từ `orders.created_at` của order cũ nhất còn ít nhất một phần chưa làm xong trong table session; bàn được cảnh báo khi thời gian chờ lớn hơn hoặc bằng ngưỡng do `ADMIN` cấu hình. UI tạm dùng `25` phút.
- [x] Hệ thống **không có chức năng đổi bàn, chuyển bàn hoặc gộp bàn** trong phạm vi hiện tại; mỗi table session gắn cố định với một bàn từ khi `OPEN` đến khi `CLOSED`.
- [x] Chốt việc tách bàn, gộp bàn hay chuyển bàn được giải quyết toàn bộ qua thẻ QR di động (khách cầm đi bàn khác) nên hệ thống không cần phát triển tính năng này.
- [x] Chốt nhân viên có giao diện Hủy món (như khách), cờ `is_remade` được lưu khi món bị hỏng/khách chê; Backend sinh đơn mới kèm nhãn `[LÀM LẠI]` để bù trừ tiền chính xác.
- [x] Chốt tất cả khách hàng và nhân viên đều được phép Hủy phiên bàn (đóng session ngay) miễn là chưa có order nào được gửi xuống bếp.

## 3. Các quyết định kỹ thuật đã chốt

- [x] Backend sử dụng Java 21, Spring Boot, Maven, MyBatis, MySQL, Redis và Flyway.
- [x] Frontend sử dụng Next.js, React, TypeScript và Tailwind CSS.
- [x] Hình ảnh menu được lưu trên Cloudinary.
- [x] CI/CD sử dụng GitHub Actions.
- [x] Môi trường production được triển khai trên một VPS.
- [x] Chốt frontend và backend chạy trong cùng Docker Compose network trên VPS.
- [x] Chốt authentication sử dụng Firebase Authentication.
- [x] Chốt Firebase Authentication là cơ chế xác thực chính cho tài khoản vận hành (ADMIN và OPERATOR); Client gửi Firebase ID Token và Backend verify token để phân quyền.
- [x] Chốt một Next.js app cho ba khu vực Customer, Operation và Admin.
- [x] Tổ chức App Router theo ba route group `(customer)`, `(operator)` và `(admin)` với layout riêng.
- [x] Bổ sung nested route group `(ordering)` dùng chung Header và Bottom Navigation cho Menu/Cart; tách bộ điều khiển số lượng món dùng chung.
- [x] Chốt QR token chỉ dùng tại `/table/{qrToken}`; sau khi có session hợp lệ, Customer tiếp tục tại `/menu`, `/cart` và `/orders`.
- [x] Chốt Customer theo hướng mobile-first; Operation và Admin ưu tiên web desktop, đồng thời responsive cho mobile.
- [x] Chốt client không đăng nhập; account role chỉ gồm `ADMIN` và `OPERATOR`.
- [x] Chốt mọi chức năng quản trị chỉ dành cho `ADMIN`; `OPERATOR` chỉ xử lý nghiệp vụ vận hành.
- [x] Chốt REST + polling để đồng bộ order và payment; chưa dùng SSE/WebSocket.
- [x] Chốt CAS Backend upload ảnh lên Cloudinary bằng authenticated API.
- [x] Chốt CAS Backend chỉ quản lý yêu cầu và trạng thái thanh toán, không tích hợp VietQR/ngân hàng.

## 4. Thiết kế database

- [x] Xác định danh sách 19 bảng nghiệp vụ.
- [x] Mô tả quan hệ giữa các bảng.
- [x] Xác định các trạng thái nghiệp vụ chính.
- [x] Bổ sung kiểu dữ liệu MySQL cho toàn bộ các cột.
- [x] Xác định `NULL`, `NOT NULL`, `DEFAULT` và `AUTO_INCREMENT` ở mức thiết kế.
- [x] Xác định các unique constraint và index nghiệp vụ cơ bản.
- [x] Hoàn thiện mô hình 19 bảng và quan hệ tổng quan.
- [x] Chốt đầy đủ foreign key với `ON DELETE RESTRICT` và `ON UPDATE RESTRICT`.
- [x] Chốt không dùng `CHECK` constraint nghiệp vụ, chốt default và các index menu triển khai trước.
- [x] Chốt generated column kết hợp unique index cho các unique constraint có điều kiện cần thiết.
- [x] Bổ sung trường người thao tác (`created_by_account_id` trong `orders` & `order_item_cancellation_requests`, `created_by`/`updated_by` trong Master Data Menu & Bàn) vào tài liệu thiết kế cơ sở dữ liệu.
- [x] Tạo Flyway migration khởi tạo schema.
- [x] Bổ sung `order_items.prepared_quantity` trực tiếp vào migration khởi tạo do schema chưa được áp dụng ở môi trường nào.
- [ ] Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.

## 5. Backend

- [x] Khởi tạo dự án Java 21, Spring Boot và Maven.
- [x] Thêm Maven Wrapper cho backend.
- [x] Cấu hình MySQL, Redis, MyBatis và Flyway.
- [ ] Xây dựng module Store & Table.
- [ ] Xây dựng module Catalog.
- [ ] Xây dựng module Ordering.
- [ ] Xây dựng use case `OPERATOR` chọn bàn và tạo order hộ khách, tái sử dụng
      quy tắc tạo order hiện có và ghi audit log.
- [ ] Xây dựng truy vấn tổng hợp món còn cần làm và use case hoàn thành theo mẻ trong transaction, có idempotency bền vững và phân bổ FIFO.
- [ ] Xây dựng module Payment.
- [ ] Xây dựng authentication và phân quyền theo role.
- [ ] Xây dựng audit log.
- [ ] Chuẩn hóa API error và validation.
- [ ] Viết unit test và integration test.

## 6. Frontend

- [x] Khởi tạo Next.js, React và TypeScript.
- [x] Tích hợp Tailwind CSS với PostCSS.
- [x] Xây dựng trang chào mừng CAS cho quán ăn vặt/mỳ cay bằng Tailwind CSS theo thiết kế Stitch, có giao diện sáng/tối.
- [x] Xây dựng UI màn thực đơn Customer mobile-first theo thiết kế Stitch, hiển thị 15 món trong danh sách dài theo từng nhóm, có divider và thanh category sticky hỗ trợ vuốt cảm ứng hoặc nhấn-giữ-kéo bằng chuột, liên kết đến từng nhóm; ảnh category tại Khám phá thực đơn dẫn đến đúng nhóm tương ứng.
- [x] Xây dựng UI chi tiết sản phẩm động tại `/menu/[slug]` theo thiết kế Stitch; mỳ cay chọn cấp độ 0–7, đồ uống chọn size và nhiều topping.
- [x] Điều chỉnh vị trí badge sản phẩm trong màn chi tiết để không bị khối nội dung chồng lấp.
- [x] Xây dựng UI giỏ hàng Customer mobile-first theo thiết kế Stitch, gồm món đang chọn, option, số lượng, ghi chú chung và tổng tiền.
- [x] Xây dựng UI màn gửi món thành công tại `/orders` theo thiết kế Stitch, gồm xác nhận quán đã nhận món, thông tin bàn, thời gian gửi, chi tiết lần gọi, thao tác gọi thêm món và liên kết tới bước yêu cầu thanh toán.
- [x] Xây dựng UI nhập tên và số điện thoại tại route QR động `/table/[token]` cho khách đầu tiên mở bàn.
- [x] Hoàn thiện form mở phiên bàn với validation bắt buộc, thông báo lỗi accessible và điều hướng UI sang thực đơn.
- [x] Bổ sung thao tác nhấn-giữ-kéo dọc bằng chuột và ẩn scrollbar ở cấp root cho toàn bộ các màn hình mobile-first.
- [x] Đồng bộ cursor kéo dạng bàn tay: màu xám ở theme sáng và màu trắng ở theme tối.
- [x] Kiểm tra regression đổi theme: xác nhận click, reload và chuyển route hoạt động trên `localhost`/production; ghi nhận dev server qua `127.0.0.1` không hydrate do WebSocket HMR bị từ chối.
- [x] Dọn các file log tạm sinh ra khi kiểm tra dev server và production test server của frontend.
- [x] Dọn các file cấu hình và lock pnpm phát sinh ngoài package manager chính thức của frontend.
- [x] Bổ sung scroll-spy cho category bar của trang Menu: tự làm nổi bật category theo section đang đọc, tự đưa tab active vào vùng nhìn thấy và xử lý category cuối ngắn khi đã cuộn tới đáy trang.
- [x] Tối ưu tải sớm toàn bộ ảnh có khả năng nằm trong viewport đầu ở Welcome, Menu, Cart và màn nhập thông tin; khai báo smooth-scroll route transition cho Next.js.
- [ ] Xây dựng giao diện khách quét QR và mở phiên bàn.
- [ ] Xây dựng giao diện menu và chọn option.
- [ ] Xây dựng giao diện gửi order và gọi thêm món.
- [ ] Xây dựng giao diện yêu cầu hủy món.
- [x] Bổ sung UI Customer gửi yêu cầu hủy món tại trang đơn hàng: chọn số lượng, lý do tùy chọn, trạng thái chờ xác nhận, khả năng chỉnh sửa yêu cầu và liên kết món về thực đơn.
- [x] Bổ sung popup chọn option khi thêm món từ danh sách thực đơn, gồm dropdown cấp độ cay, kích thước, độ ngọt và topping tùy theo món.
- [x] Điều chỉnh tag món trên Menu xếp hàng ngang và tự xuống dòng khi không đủ chỗ.
- [x] Xây dựng giao diện yêu cầu thanh toán Customer theo thiết kế Stitch đã điều chỉnh đúng phạm vi CAS, gồm bill, trạng thái `PENDING`, hướng dẫn đến quầy thu ngân và lớp thông báo chặn thao tác khác.
- [x] Bổ sung màn Customer “Thanh toán thành công” khi trạng thái payment chuyển
      từ `PENDING` sang `PAID`, hiển thị bàn, tổng tiền, thời gian hoàn tất, lời cảm
      ơn và nút tiếp tục tạo đơn mới bằng QR token của chính bàn để trở về màn nhập
      thông tin khách mới; không hiển thị nhãn hoặc thông báo bàn đã đóng.
- [x] Điều chỉnh thanh tab Customer mặc định theo thứ tự Trang chủ, Thực đơn,
      Đơn hàng, Cài đặt; bỏ tab Thanh toán thường trực và chỉ hiển thị tab này khi
      Customer đi từ thao tác yêu cầu thanh toán trong Đơn hàng; bổ sung trang Cài
      đặt giao diện tại `/settings`; hiển thị dạng thanh dưới trên mobile và các khối
      tab chữ nhật có border, tách rời bên trái trên web.
- [x] Hiển thị bảng giá theo từng món tại màn đơn hàng và thanh toán: giá món gốc, topping tính thêm và tổng món.
- [x] Xây dựng UI dashboard nhân viên tại `/operator/dashboard` theo màn Stitch
      “Bảng điều khiển nhân viên - Tổng quan”, ưu tiên web desktop và responsive
      mobile; `/operator` chuyển hướng tương thích sang dashboard; ba thống kê lượt
      gọi món, bàn đang phục vụ và payment chờ xác nhận dùng dạng nhãn-số nhỏ gọn;
      bổ sung cảnh báo bàn chờ lâu với ngưỡng UI `25` phút, danh sách khiếu nại rút
      gọn có hộp thoại xem đầy đủ và sơ đồ bàn mini chỉ hiển thị bàn `Đang hoạt
động` hoặc `Trống`; bàn đang hoạt động cho phép mở đơn tương ứng.
- [x] Tách khu vực Operator thành năm tab route độc lập: `/operator/dashboard`, `/operator/orders`, `/operator/cancellations`, `/operator/payments` và `/operator/unpaid`; không hiển thị toàn bộ nghiệp vụ thành một trang cuộn dài.
- [x] Xây dựng UI tab `/operator/orders` tổng hợp số phần còn cần làm theo món
      và cấu hình option, cho phép nhân viên ghi nhận số phần hoàn thành và cập nhật
      phân bổ theo bàn ngay trên giao diện; các nhóm món hiển thị dạng cây gọn, có
      thể xổ/đóng danh sách bàn và không dùng icon trang trí trong từng nhánh.
- [x] Chia màn `/operator/orders` thành hai cột: tổng hợp số lượng theo món ở
      bên trái và cây món còn cần làm theo từng bàn ở bên phải; hai cột cập nhật
      đồng thời khi nhân viên ghi nhận số phần hoàn thành.
- [x] Xây dựng trang động `/operator/orders/[orderNumber]` để nhân viên xem
      thông tin bàn, thời gian gửi, ghi chú chung, từng món và option, tiến độ số
      lượng đã làm/còn lại cùng tổng tiền của một order.
- [ ] Xây dựng giao diện vận hành cho menu, bàn và order.
- [x] Xây dựng giao diện `OPERATOR` chọn bàn, xem menu, chọn option, quản lý giỏ
      món và tạo/gọi thêm order hộ khách tại `/operator/orders/new` và `/operator/orders/create`; tối ưu cho cả desktop dạng POS 2 cột và mobile có floating cart drawer.
- [x] Xây dựng giao diện đăng nhập nhân viên tại `/operator/login` bằng số điện thoại và mật khẩu, có validation bắt buộc ở frontend và chuyển UI sang `/operator/dashboard` khi nhập hợp lệ.
- [x] Xây dựng giao diện danh sách payment chờ xác nhận tại
      `/operator/payments`; nhân viên dùng hành động “Xác nhận đã thanh toán” và
      phải xác nhận lại trong popup có bàn, số tiền cùng nhắc nhở kiểm tra loa báo
      giao dịch thành công.
- [x] Xây dựng giao diện xem và xử lý các Yêu cầu hủy món tại `/operator/cancellations` với Form Modal xác nhận Đồng ý / Từ chối hủy món.
- [x] Xây dựng trang Hủy món do sự cố tại `/operator/cancellations/new` hiển thị danh sách món đã gọi theo bàn, bóc tách giá gốc, topping, tổng tiền và bộ nút trừ/cộng chọn số lượng hủy bên phải cùng ô nhập nguyên nhân dạng text và cờ `is_remade`.
- [x] Xây dựng chức năng Báo cáo sự cố phát sinh trên trang Tổng quan (`/operator/dashboard`) cho phép nhân viên `OPERATOR` tạo và ghi nhận các sự cố trong ca (lưu tên người tạo, thời gian tạo và nội dung sự cố) để gửi lên cho `ADMIN`.
- [x] Cập nhật hệ thống tài liệu thiết kế (`OVERALL.md`, `BUSINESS_FLOWS.md`, `DATABASE_DESIGN.md`, `PROJECT_PROGRESS.md`) phân định rõ: `OPERATOR` tạo báo cáo sự cố phát sinh, `ADMIN` có quyền xem và tra cứu danh sách báo cáo sự cố.
- [x] Bổ sung badge số nhỏ (counter badge) hiển thị số lượng yêu cầu/thông tin chờ xử lý trên thanh điều hướng `OperatorTabNavigation` cho các tab Đơn gọi món (8), Hủy món (3), Thanh toán (3), và Chưa thanh toán (1).
- [x] Xây dựng UI bộ giao diện Admin hoàn chỉnh tại `/admin` theo đúng thiết kế Stitch và tài liệu dự án, bao gồm Admin Header & AdminTabNavigation (`/admin/layout.tsx`), Dashboard Tổng quan (`/admin/page.tsx`), Quản lý Thực đơn & Catalog (`/admin/catalog/page.tsx`), Quản lý Bàn & Mã QR (`/admin/tables/page.tsx`), Quản lý Nhân viên OPERATOR (`/admin/operators/page.tsx`), Báo cáo Sự cố ca trực (`/admin/incidents/page.tsx`), Cấu hình & Nhật ký Audit Logs (`/admin/settings/page.tsx`).
- [x] Sửa menu Admin hai cấp: popup submenu không còn bị cắt bởi vùng cuộn ngang; thanh điều hướng tự xuống hàng trên màn hình hẹp và bổ sung trạng thái truy cập cho dropdown.
- [x] Tổ chức lại UI Admin: tách Catalog thành các trang danh mục, món ăn, option và nhãn món; tách Audit Logs thành trang tra cứu riêng; báo cáo sự cố chỉ còn chức năng xem/tra cứu theo phạm vi đã chốt.
- [x] Bổ sung UI `/admin/reports` với bộ lọc ngày/loại báo cáo và thao tác xuất Excel tạm thời; bổ sung điều hướng đến Reports và Audit Logs.
- [x] Tăng kích thước font chữ cấp 1 của thanh điều hướng AdminTabNavigation lên text-base (tăng 2 cấp font), giữ nguyên kích thước text-xs cho menu cấp 2 trong popup dropdown; đổi nhãn menu nhóm từ "Vận hành & Nhân sự" thành "Sự cố và Nhân sự"; bảo đảm duy nhất tab "Sự cố và Nhân sự" hiển thị badge đếm số thông báo.
- [x] Cập nhật bộ tài liệu dự án (`OVERALL.md`, `BUSINESS_FLOWS.md`, `DATABASE_DESIGN.md`) bổ sung phạm vi chức năng, luồng nghiệp vụ 16 & 17 & 18 và quy tắc dữ liệu cho Mã giảm giá (Vouchers), Thông báo hệ thống (Notifications), Cấu hình Banner/Popup Khuyến mãi và Biểu tượng Chuông thông báo góc trên bên phải cho Customer & Operator.
- [x] Xây dựng UI Quản lý Mã giảm giá (`/admin/vouchers`).
- [x] Xây dựng UI Quản lý Thông báo hệ thống (`/admin/notifications`) hỗ trợ Admin cấu hình chọn đối tượng nhận thông báo: Chỉ Nhân viên (`OPERATOR`), Chỉ Khách hàng (`CUSTOMER`), hoặc Cả 2 (`BOTH`), đi kèm bộ lọc theo đối tượng linh hoạt.
- [x] Cập nhật tất cả các form tạo mới trong giao diện Admin (Thông báo, Vouchers, Tài khoản Nhân viên, Bàn ăn & QR Code, Danh mục món, Nhóm Option) sang dạng Modal Popup đè lên toàn bộ màn hình (`fixed inset-0 z-50 backdrop-blur-sm bg-black/55`), loại bỏ việc chèn form làm xô lệch bố cục trang.
- [x] Cập nhật hiệu ứng hover chữ trên các menu cha của giao diện Admin (`AdminTabNavigation` gồm "Tổng quan", "Báo cáo", "Quản lý Quán", "Sự cố và Nhân sự", "Hệ thống & Cấu hình") sang màu xanh lá thương hiệu (`hover:text-cas-secondary`), giữ nguyên thiết kế font và kích thước ban đầu.
- [x] Loại bỏ bảng trùng lặp "2. Nhật ký Thao tác (Audit Logs)" trên trang Cấu hình (`/admin/settings`), chỉ giữ lại phần Cấu hình Tham số Vận hành Cửa hàng (Audit Logs đã có route chuyên biệt tại `/admin/audit-logs`).
- [x] Xây dựng UI Admin Cấu hình Thông báo Khuyến mãi & Banner (`/admin/promotions`).
- [x] Tích hợp nút chuông thông báo (bell icon) ở góc trên bên phải cho giao diện Khách hàng (`CustomerHeader`) và Nhân viên (`OperatorWorkspaceLayout`) kèm popup xem nhanh thông báo & ưu đãi.
- [x] Tinh chỉnh Admin Dashboard (Tổng quan): bổ sung bộ lọc thời gian chuyên sâu ở đầu trang hỗ trợ ô chọn Ngày (`input type="date"`), ô chọn Tháng (`input type="month"`), chọn Năm (`select year`) và chọn Khoảng ngày (Từ ngày - Đến ngày); loại bỏ chữ "cụ thể" trong menu, chuẩn hóa nhãn "Lọc theo:" thường và hiển thị 7 chỉ số dạng bảng 2 cột gọn nhẹ với màu đen đồng nhất.
- [x] Tinh chỉnh thanh điều hướng Admin (`AdminTabNavigation`): hỗ trợ trượt ngang mượt mà (`overflow-x-auto`, `whitespace-nowrap`, `shrink-0`) trên mobile; đồng thời xử lý hiển thị popup menu con bằng `fixed` positioning giúp menu xổ ra tự do bên ngoài box, không bị cắt mép hay bắt người dùng kéo cuộn bên trong.
- [x] Xây dựng giao diện quản lý khoản chưa thanh toán tại `/operator/unpaid`, bao gồm danh sách các bản ghi `unpaid_records`, bộ lọc trạng thái (`ALL`, `OPEN`, `RESOLVED`), nút chuyển đổi trạng thái đã thu tiền và Modal xem `bill_snapshot` chi tiết (hỗ trợ chuyển đổi giữa tab Hóa đơn và tab dữ liệu thô JSON).
- [x] Xây dựng UI tạm thời Admin xem danh sách `report` tại `/admin/reports`, có bộ lọc ngày/loại báo cáo và thao tác xuất Excel chưa kết nối API.
- [ ] Xây dựng chức năng Admin cấu hình ngưỡng cảnh báo bàn chờ lâu; vị trí lưu, giới hạn validation, API contract và fallback backend vẫn `Cần chốt`.
- [ ] Viết component test và end-to-end test.

- [x] Căn chỉnh popup submenu của `AdminTabNavigation` bám ngay dưới thanh điều hướng, loại bỏ khoảng hở do `fixed` positioning bị ảnh hưởng bởi backdrop blur.
- [x] Xây dựng UI Cấu hình Thông tin Cửa hàng tại `/admin/settings` (mô tả phụ: "Quản lý thông tin cửa hàng và tham số vận hành") hỗ trợ Admin thiết lập Tên quán, Số điện thoại Hotline, Email liên hệ, Địa chỉ, Link/Tọa độ vị trí quán trên Google Maps (tích hợp nút **`?`** Popover Tooltip hướng dẫn 3 bước trực quan), Giờ mở/đóng cửa (sử dụng bộ chọn `TimePicker12H` Popover hiện đại hỗ trợ chuyển AM/PM nhanh), Slogan chào mừng, Trạng thái hoạt động (`ACTIVE`/`INACTIVE`) cùng nút chuyển đổi giao diện **Sáng / Tối** (`ThemeToggle`) đồng bộ trên Admin & Operator Header.
- [x] Sửa lỗi active route trùng lặp ở `AdminTabNavigation`: áp dụng thuật toán so khớp tiền tố chính xác nhất (`isRouteActive`), khắc phục triệt để tình trạng mục "Món ăn" (`/admin/catalog`) luôn bị tô xanh đồng thời khi chọn các submenu như "Danh mục", "Nhóm & giá trị Option", "Nhãn món".
- [x] Gỡ bỏ hoàn toàn phần Cấu hình Banner & Thông báo Khuyến mãi (Popup Banner, Header Ticker, Gợi ý giỏ hàng) khỏi trang `/admin/vouchers`, tối ưu hóa trang thành giao diện chuyên biệt cho **Quản lý Mã giảm giá (Voucher)**.
- [x] Chuyển đổi giao diện Quản lý Bàn ăn & Thẻ Mã QR tại `/admin/tables` sang dạng **Danh sách (Table View)** hiện đại, hỗ trợ các chức năng: Thêm bàn mới, Xóa bàn (kèm Modal xác nhận), Xem Mã QR Token trực quan và Quản lý Trạng thái bàn (Bàn trống, Đang có khách, Chờ thanh toán) kèm bộ lọc và tìm kiếm nhanh.
- [x] Sửa tương tác click trên `AdminTabNavigation`: Đảm bảo khi người dùng click vào mục menu chính có submenu thì menu con sẽ mở ra và giữ hiển thị ổn định, không bị ẩn đi do xung đột trạng thái rê chuột (hover).
- [x] Cấu trúc lại danh mục điều hướng `AdminTabNavigation`: Đưa các mục "Món ăn", "Danh mục", "Option", "Nhãn món" thuộc nhóm **Menu & Voucher** vào nhóm con cấp 2 **Catalog** trực quan.
- [x] Điều chỉnh menu Admin ba cấp: giữ "Món ăn", "Danh mục" và "Option" ở cấp 3 dưới "Catalog"; đưa "Nhãn món" lên cấp 2 trong nhóm **Menu & Voucher**.
- [x] Hoàn thiện tương tác menu Admin ba cấp: rê chuột hoặc nhấn "Catalog" ở cấp 2 sẽ mở submenu cấp 3 ở bên phải.
- [x] Đồng bộ trạng thái hiển thị "Catalog" với các mục cấp 2 khác: chỉ đổi màu khi mở submenu, không tự tô nền theo route con đang chọn.
- [x] Đóng submenu cấp 3 của "Catalog" khi rê chuột sang một mục cấp 2 khác, đồng thời giữ menu mở khi đi qua khoảng hở để chọn submenu bên phải.
- [x] Đồng bộ hiệu ứng hover của tab cấp 1 Admin với thanh điều hướng Operator: nền bo tròn nhẹ và màu chữ tương ứng.
- [x] Đồng nhất hiệu ứng hover cho tab Admin có submenu: mở dropdown không tự kích hoạt kiểu tab đang chọn.
- [x] Đồng bộ hiệu ứng hover cho các submenu Admin với thanh Operator: nền xanh nhạt và chữ tối, không dùng nền xanh đậm/chữ trắng khi rê chuột.

- [x] Hoàn thiện UI quản lý món tại `/admin/catalog`: popup thêm/sửa món, thiết lập danh mục, giá, nhãn, nhóm option và trạng thái; xác nhận ẩn món bằng `INACTIVE` để giữ lịch sử order.
- [x] Rút gọn bộ lọc món tại `/admin/catalog` thành Tất cả, Đồ ăn và Đồ uống.
- [x] Cập nhật dữ liệu mẫu Catalog theo thực đơn quán: bỏ món ốc, thêm Gà rán và Đồ ăn vặt; bộ lọc dùng dropdown loại món/trạng thái cùng nút xóa lọc.
- [x] Lược bỏ nút chuyển nhanh trạng thái bán trong bảng Catalog; trạng thái được chỉnh trong popup sửa món.
- [x] Đổi trường Nhãn món trong popup Catalog sang dropdown thực sự, hỗ trợ tick chọn nhiều nhãn có sẵn.
- [x] Bổ sung đóng dropdown Nhãn món khi click bên ngoài và dùng `CasIcon` cho mũi tên xổ xuống.
- [x] Loại bỏ ghi chú kỹ thuật về API Catalog khỏi popup quản lý món.
- [x] Bổ sung UI chọn ảnh món và thiết lập thứ tự hiển thị trong popup Catalog, sẵn sàng để ghép API sau.
- [x] Đổi Nhóm option áp dụng sang dropdown tick chọn nhiều, đồng bộ với Nhãn món.
- [x] Chuyển lệnh phát triển Frontend sang Webpack để tránh lỗi cache/compaction của Turbopack khi format ghi nhiều file.
- [x] Bổ sung cột Thứ tự hiển thị trong bảng danh sách Thực đơn tại `/admin/catalog`.
- [x] Tối ưu hóa tải ảnh LCP: bổ sung thuộc tính `loading="eager"` và `priority` cho ảnh `/images/welcome/street-snacks.jpg` tại trang Welcome Khách hàng (`/`).
- [x] Bổ sung tính năng xem trước ảnh món (Image Preview) khi chọn file mới hoặc sửa món ăn tại `/admin/catalog`, kèm thumbnail trực quan trong bảng danh sách.
- [x] Bổ sung tính năng Cập nhật trạng thái hàng loạt (Bulk Status Update) cho nhiều món ăn tại `/admin/catalog` kèm thanh thao tác nhanh và thông báo tức thì.
- [x] Bổ sung bộ lọc Sắp xếp (Sorting dropdown) theo Thứ tự hiển thị, Giá niêm yết và Ngày tạo tại `/admin/catalog`.
- [x] Hoàn thiện tính năng Sửa tên và Xóa nhóm option, xóa thẻ giá trị option tại `/admin/catalog/options` và Sửa/Xửa danh mục món tại `/admin/catalog/categories`.
- [x] Tích hợp thư viện `qrcode.react` để hiển thị ảnh mã QR thực tế và hỗ trợ tải ảnh QR (PNG) cho từng bàn ăn tại `/admin/tables`.

## 7. Hạ tầng và triển khai

- [x] Tạo cấu hình Docker cho môi trường phát triển.
- [x] Chốt Cloudinary làm dịch vụ lưu trữ hình ảnh.
- [x] Chốt GitHub Actions làm nền tảng CI/CD.
- [x] Chốt triển khai production trên một VPS.
- [ ] Tích hợp upload và quản lý hình ảnh với Cloudinary.
- [ ] Tạo pipeline CI kiểm tra build, test và migration.
- [ ] Chốt chi tiết và cấu hình môi trường triển khai VPS.
- [ ] Cấu hình logging, theo dõi lỗi và health check.
- [ ] Thiết lập sao lưu và khôi phục MySQL.
- [ ] Kiểm thử triển khai thử nghiệm tại cửa hàng.

## 8. Việc tiếp theo

1. Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.
2. Xây dựng API contract và ma trận phân quyền chi tiết theo từng API.
3. ~~Hoàn thiện cách xử lý các edge case còn lại.~~ (Đã hoàn thiện)
4. Chốt định nghĩa và phạm vi dữ liệu cho chức năng Admin xem danh sách `report` (lưu ý bóc tách khối lượng hao hụt dựa trên cờ `is_remade`).
5. Xây dựng các module backend và frontend theo luồng nghiệp vụ đã chốt.

## 9. Tài liệu liên quan

- [Tổng quan hệ thống](OVERALL.md)
- [Luồng nghiệp vụ](BUSINESS_FLOWS.md)
- [Thiết kế database](DATABASE_DESIGN.md)
- [Các trường hợp biên](EDGE_CASES.md)

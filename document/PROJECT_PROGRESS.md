# CAS — Theo dõi tiến độ dự án

Ngày cập nhật gần nhất: 2026-08-07

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
- [x] Option được quản lý như `menu_items` thuộc category loại `OPTION`.
- [x] Quản lý nhãn món bằng `tags` và bảng trung gian nhiều-nhiều `menu_item_tags`.
- [x] `dining_tables` dùng `code` kiểu `INT UNSIGNED`, duy nhất toàn hệ thống và không còn lưu `name`.
- [x] Dùng `option_groups`, `option_group_items` và `order_item_options` để liên kết size/topping với đúng món.
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

## 3. Các quyết định kỹ thuật đã chốt

- [x] Backend sử dụng Java 21, Spring Boot, Maven, MyBatis, MySQL, Redis và Flyway.
- [x] Frontend sử dụng Next.js, React, TypeScript và Tailwind CSS.
- [x] Hình ảnh menu được lưu trên Cloudinary.
- [x] CI/CD sử dụng GitHub Actions.
- [x] Môi trường production được triển khai trên một VPS.
- [x] Chốt frontend và backend chạy trong cùng Docker Compose network trên VPS.
- [x] Chốt authentication dùng access JWT 15 phút, refresh JWT 10 ngày và BCrypt.
- [x] Chốt JWT là cơ chế xác thực chính và không lưu token trong `localStorage`.
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
- [ ] Xây dựng giao diện `OPERATOR` chọn bàn, xem menu, chọn option, quản lý giỏ
  món và tạo/gọi thêm order hộ khách.
- [x] Xây dựng giao diện đăng nhập nhân viên tại `/operator/login` bằng số điện thoại và mật khẩu, có validation bắt buộc ở frontend và chuyển UI sang `/operator/dashboard` khi nhập hợp lệ.
- [x] Xây dựng giao diện danh sách payment chờ xác nhận tại
  `/operator/payments`; nhân viên dùng hành động “Xác nhận đã thanh toán” và
  phải xác nhận lại trong popup có bàn, số tiền cùng nhắc nhở kiểm tra loa báo
  giao dịch thành công.
- [ ] Xây dựng giao diện quản lý khoản chưa thanh toán.
- [ ] Xây dựng giao diện Admin xem danh sách `report`; loại report, dữ liệu hiển thị, trạng thái, bộ lọc, phân trang, API contract và mô hình dữ liệu vẫn `Cần chốt`.
- [ ] Xây dựng chức năng Admin cấu hình ngưỡng cảnh báo bàn chờ lâu; vị trí lưu, giới hạn validation, API contract và fallback backend vẫn `Cần chốt`.
- [ ] Viết component test và end-to-end test.

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
3. Hoàn thiện cách xử lý các edge case còn lại.
4. Chốt định nghĩa và phạm vi dữ liệu cho chức năng Admin xem danh sách `report`.
5. Xây dựng các module backend và frontend theo luồng nghiệp vụ đã chốt.

## 9. Tài liệu liên quan

- [Tổng quan hệ thống](OVERALL.md)
- [Luồng nghiệp vụ](BUSINESS_FLOWS.md)
- [Thiết kế database](DATABASE_DESIGN.md)
- [Các trường hợp biên](EDGE_CASES.md)

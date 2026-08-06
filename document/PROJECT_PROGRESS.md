# CAS — Theo dõi tiến độ dự án

Ngày cập nhật gần nhất: 2026-08-06

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
- [x] Chốt Customer và Operation theo hướng mobile-first; Admin ưu tiên web desktop.
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
- [ ] Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.

## 5. Backend

- [x] Khởi tạo dự án Java 21, Spring Boot và Maven.
- [x] Thêm Maven Wrapper cho backend.
- [x] Cấu hình MySQL, Redis, MyBatis và Flyway.
- [ ] Xây dựng module Store & Table.
- [ ] Xây dựng module Catalog.
- [ ] Xây dựng module Ordering.
- [ ] Xây dựng module Payment.
- [ ] Xây dựng authentication và phân quyền theo role.
- [ ] Xây dựng audit log.
- [ ] Chuẩn hóa API error và validation.
- [ ] Viết unit test và integration test.

## 6. Frontend

- [x] Khởi tạo Next.js, React và TypeScript.
- [x] Tích hợp Tailwind CSS với PostCSS.
- [x] Xây dựng trang chào mừng CAS cho quán ăn vặt/mỳ cay bằng Tailwind CSS theo thiết kế Stitch, có giao diện sáng/tối.
- [x] Xây dựng UI màn thực đơn Customer mobile-first theo thiết kế Stitch, hiển thị 15 món trong danh sách dài theo từng nhóm, có divider và thanh category sticky hỗ trợ vuốt cảm ứng hoặc nhấn-giữ-kéo bằng chuột, liên kết đến từng nhóm.
- [x] Xây dựng UI chi tiết sản phẩm động tại `/menu/[slug]` theo thiết kế Stitch; mỳ cay chọn cấp độ 0–7, đồ uống chọn size và nhiều topping.
- [x] Điều chỉnh vị trí badge sản phẩm trong màn chi tiết để không bị khối nội dung chồng lấp.
- [x] Xây dựng UI giỏ hàng Customer mobile-first theo thiết kế Stitch, gồm món đang chọn, option, số lượng, ghi chú chung và tổng tiền.
- [x] Xây dựng UI màn gửi món thành công tại `/orders` theo thiết kế Stitch, gồm xác nhận quán đã nhận món, thông tin bàn, thời gian gửi, chi tiết lần gọi và thao tác gọi thêm món.
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
- [x] Xây dựng giao diện yêu cầu thanh toán Customer theo thiết kế Stitch đã điều chỉnh đúng phạm vi CAS, gồm bill, trạng thái `PENDING` và hướng dẫn gặp nhân viên.
- [ ] Xây dựng giao diện vận hành cho menu, bàn và order.
- [ ] Xây dựng giao diện danh sách yêu cầu và xác nhận thanh toán.
- [ ] Xây dựng giao diện quản lý khoản chưa thanh toán.
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
4. Xây dựng các module backend và frontend theo luồng nghiệp vụ đã chốt.

## 9. Tài liệu liên quan

- [Tổng quan hệ thống](OVERALL.md)
- [Luồng nghiệp vụ](BUSINESS_FLOWS.md)
- [Thiết kế database](DATABASE_DESIGN.md)
- [Các trường hợp biên](EDGE_CASES.md)

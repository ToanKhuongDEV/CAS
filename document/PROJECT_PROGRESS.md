# CAS — Theo dõi tiến độ dự án

Ngày cập nhật gần nhất: 2026-07-30

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
- [x] Mô tả luồng tạo VietQR và xác nhận thanh toán thủ công.
- [x] Mô tả luồng ghi nhận khách rời đi chưa thanh toán.
- [x] Mô tả luồng tạo lại payment cho khoản còn phải thu.
- [x] Tổng hợp các trường hợp biên nghiệp vụ.
- [x] Chuẩn hóa cách diễn đạt phạm vi trong tài liệu chính thức.

## 2. Các quyết định nghiệp vụ đã chốt

- [x] Mỗi lần gửi món tạo một `orders` riêng trong cùng `table_sessions`.
- [x] Chống gửi order trùng bằng `idempotency_key` và `request_fingerprint`.
- [x] Order chỉ có ghi chú chung tại `orders.note`, không ghi chú theo từng món.
- [x] Giá món chính và giá option được lưu riêng tại thời điểm đặt.
- [x] Option được quản lý như `menu_items` thuộc category loại `OPTION`.
- [x] Dùng `option_groups`, `option_group_items` và `order_item_options` để liên kết size/topping với đúng món.
- [x] Hai món có cấu hình option khác nhau được lưu thành hai `order_items` khác nhau.
- [x] Yêu cầu hủy món không sửa hoặc xóa dữ liệu order gốc.
- [x] Bàn đang có khách được suy ra từ `table_sessions` trạng thái `OPEN`.
- [x] `dining_tables` không lưu cột trạng thái.
- [x] Khoản chưa thanh toán được quản lý trong bảng riêng `unpaid_records`.
- [x] `unpaid_records` và `payments` đều lưu `bill_snapshot`.
- [x] Payment `IGNORED` chỉ lưu lịch sử lần thử thanh toán; `unpaid_records` là nguồn dữ liệu công nợ.
- [x] Người tạo VietQR phải là người xác nhận payment.
- [x] Thời gian nghiệp vụ dùng `Asia/Ho_Chi_Minh` (`UTC+07:00`).

## 3. Thiết kế database

- [x] Xác định danh sách 17 bảng nghiệp vụ.
- [x] Mô tả quan hệ giữa các bảng.
- [x] Xác định các trạng thái nghiệp vụ chính.
- [x] Bổ sung kiểu dữ liệu MySQL cho toàn bộ các cột.
- [x] Xác định `NULL`, `NOT NULL`, `DEFAULT` và `AUTO_INCREMENT` ở mức thiết kế.
- [x] Xác định các unique constraint và index nghiệp vụ cơ bản.
- [ ] Hoàn thiện ERD.
- [ ] Chốt đầy đủ foreign key và chính sách `ON DELETE`/`ON UPDATE`.
- [ ] Chốt toàn bộ `CHECK` constraint, default và index vật lý.
- [ ] Xử lý chi tiết các unique constraint có điều kiện trên MySQL.
- [ ] Tạo Flyway migration khởi tạo schema.
- [ ] Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.

## 4. Backend

- [x] Khởi tạo dự án Java 21, Spring Boot và Maven.
- [x] Cấu hình MySQL, Redis, MyBatis và Flyway.
- [ ] Xây dựng module Store & Table.
- [ ] Xây dựng module Catalog.
- [ ] Xây dựng module Ordering.
- [ ] Xây dựng module Payment.
- [ ] Xây dựng authentication và phân quyền theo role.
- [ ] Xây dựng audit log.
- [ ] Chuẩn hóa API error và validation.
- [ ] Viết unit test và integration test.

## 5. Frontend

- [x] Khởi tạo Next.js, React và TypeScript.
- [ ] Xây dựng giao diện khách quét QR và mở phiên bàn.
- [ ] Xây dựng giao diện menu và chọn option.
- [ ] Xây dựng giao diện gửi order và gọi thêm món.
- [ ] Xây dựng giao diện yêu cầu hủy món.
- [ ] Xây dựng giao diện yêu cầu thanh toán.
- [ ] Xây dựng giao diện vận hành cho menu, bàn và order.
- [ ] Xây dựng giao diện tạo và xác nhận VietQR.
- [ ] Xây dựng giao diện quản lý khoản chưa thanh toán.
- [ ] Viết component test và end-to-end test.

## 6. Hạ tầng và triển khai

- [x] Tạo cấu hình Docker cho môi trường phát triển.
- [ ] Tạo pipeline CI kiểm tra build, test và migration.
- [ ] Cấu hình môi trường triển khai.
- [ ] Cấu hình logging, theo dõi lỗi và health check.
- [ ] Thiết lập sao lưu và khôi phục MySQL.
- [ ] Kiểm thử triển khai thử nghiệm tại cửa hàng.

## 7. Việc tiếp theo

1. Hoàn thiện ERD từ thiết kế database hiện tại.
2. Chốt foreign key, constraint và index chi tiết.
3. Tạo Flyway migration khởi tạo schema.
4. Tạo dữ liệu mẫu.
5. Khởi tạo backend và frontend.

## 8. Tài liệu liên quan

- [Tổng quan hệ thống](OVERALL.md)
- [Luồng nghiệp vụ](BUSINESS_FLOWS.md)
- [Thiết kế database](DATABASE_DESIGN.md)
- [Các trường hợp biên](EDGE_CASES.md)

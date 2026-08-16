# CAS — Theo dõi tiến độ dự án

Ngày cập nhật gần nhất: 2026-08-16

## Quy ước

- `[x]`: Đã hoàn thành và đã được xác nhận.
- `[ ]`: Chưa hoàn thành.
- Mỗi khi phạm vi hoặc thiết kế thay đổi, cập nhật checklist này trong cùng pull request hoặc commit.
- Commit sử dụng định dạng `<prefix>(<scope>): <description>`; chỉ dùng prefix
  `add`, `update`, `chore`, hoặc `delete`, và scope là `be`, `fe`, hoặc `docs`.

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
- [x] Rà soát lại toàn bộ tài liệu nguồn và đối chiếu nền mã backend ngày 2026-08-13.
- [x] Rà soát tài liệu nguồn và nền mã backend để chuẩn bị kế hoạch triển khai ngày 2026-08-14.
- [x] Bổ sung mô tả ngắn cấu trúc thư mục backend và vai trò các nhóm file trong tài liệu tổng quan.
- [x] Chốt phạm vi module Admin tra cứu khách hàng: chỉ đọc `client_accounts` và lịch sử sử dụng bàn, không mở rộng thành CRM hoặc thay đổi schema.
- [x] Bổ sung yêu cầu in hóa đơn thanh toán và phiếu bếp qua máy in kết nối nội bộ (LAN/USB) vào `OVERALL.md` và `EDGE_CASES.md`.
- [x] Bổ sung yêu cầu chế độ offline-first cho giao diện vận hành (Operation) với hàng đợi đồng bộ cục bộ vào `OVERALL.md` và `EDGE_CASES.md`. Các thao tác tài chính (PAID, đóng bill, voucher quota, hoàn tiền) vẫn bắt buộc online.

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
- [x] Mọi record khuyến mãi, redemption và discount snapshot có `store_id`; promotion chỉ áp dụng cho bill cùng store.
- [x] Promotion thuộc một store, có `DRAFT`/`ACTIVE`/`INACTIVE`, hiệu lực qua `start_at`/`end_at` có thể `NULL`; `promotion_targets` giới hạn phạm vi theo `MENU_ITEM` hoặc `CATEGORY` khi cần.
- [x] Promotion không tự áp dụng; backend trả các lựa chọn hợp lệ và số tiền dự kiến để khách chọn tối đa một promotion cho toàn bộ bill của table session.
- [x] Discount được tính lại khi bill thay đổi, được khóa khi session chuyển `PAYMENT_PENDING`, và redemption chỉ được tạo khi payment `PAID`; redemption chuyển `REVERSED` nếu payment đã paid bị refund hoặc hủy toàn bộ trong tương lai.
- [x] Discount làm tròn tới đơn vị đồng bằng `RoundingMode.HALF_UP`.
- [x] Mô hình promotion giai đoạn hiện tại chỉ dùng `promotions`, `promotion_codes`, `promotion_targets`, `promotion_redemptions` và `bill_discounts`; điều kiện cơ bản nằm trực tiếp tại `promotions`.
- [x] Discount cấp bill được lưu tại `bill_discounts`, không phân bổ xuống từng order hoặc dòng món.
- [x] Quota hỗ trợ đồng thời theo promotion, code và khách hàng; mỗi khách dùng tối đa một voucher/promotion cho một bill.
- [x] `ADMIN` được tra cứu khách đã mở bàn theo cửa hàng, xem lịch sử session/order/payment/khoản chưa thanh toán; `OPERATOR` không được truy cập và module không cho sửa hoặc xóa dữ liệu.

## 3. Các quyết định kỹ thuật đã chốt

- [x] Backend sử dụng Java 21, Spring Boot, Maven, MyBatis, MySQL, Redis và Flyway.
- [x] Frontend sử dụng Next.js, React, TypeScript và Tailwind CSS.
- [x] Hình ảnh menu được lưu trên Cloudinary.
- [x] CI/CD sử dụng GitHub Actions.
- [x] Môi trường production được triển khai trên một VPS.
- [x] Chốt frontend và backend chạy trong cùng Docker Compose network trên VPS.
- [x] Chốt môi trường phát triển chạy backend, frontend và MySQL local; Redis dùng Redis Cloud. Docker Compose chỉ dùng khi triển khai production.
- [x] Chốt authentication sử dụng Firebase Authentication.
- [x] Bổ sung role `SUPER_ADMIN`; role này có quyền tạo account `ADMIN` qua API.
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

- [x] Xác định danh sách bảng nghiệp vụ.
- [x] Mô tả quan hệ giữa các bảng.
- [x] Xác định các trạng thái nghiệp vụ chính.
- [x] Bổ sung kiểu dữ liệu MySQL cho các cột của mô hình dữ liệu nền tảng.
- [x] Xác định `NULL`, `NOT NULL`, `DEFAULT` và `AUTO_INCREMENT` ở mức thiết kế.
- [x] Xác định các unique constraint và index nghiệp vụ cơ bản.
- [x] Hoàn thiện mô hình dữ liệu nền tảng và quan hệ tổng quan.
- [x] Chốt đầy đủ foreign key với `ON DELETE RESTRICT` và `ON UPDATE RESTRICT`.
- [x] Chốt không dùng `CHECK` constraint nghiệp vụ, chốt default và các index menu triển khai trước.
- [x] Chốt generated column kết hợp unique index cho các unique constraint có điều kiện cần thiết.
- [x] Bổ sung trường người thao tác (`created_by_account_id` trong `orders` & `order_item_cancellation_requests`, `created_by`/`updated_by` trong Master Data Menu & Bàn) vào tài liệu thiết kế cơ sở dữ liệu.
- [x] Tạo Flyway migration khởi tạo schema nền tảng.
- [x] Cập nhật trực tiếp V1 DDL khi schema chưa được áp dụng ở bất kỳ môi trường nào: cập nhật bảng `promotions` (`code VARCHAR(50)`, `uk_promotions_store_code`, loại bỏ `min_quantity`, `priority` và `is_stackable`), bổ sung bảng `system_notifications` cùng foreign keys & unique constraints; không tạo migration V2.
- [x] Rà soát và cập nhật trực tiếp V1 DDL khi chưa áp dụng: bổ sung `categories.category_type`; chuyển `accounts` sang định danh `firebase_uid` và loại bỏ dữ liệu mật khẩu nội bộ; chuẩn hóa `dining_tables` unique theo `store_id + code`; đồng bộ notification broadcast theo `OPERATOR`, `CUSTOMER`, `BOTH` và bỏ cờ `is_read` toàn cục.
- [x] Bổ sung trực tiếp V1 DDL khi chưa áp dụng: `preparation_batch_completions` cho idempotency bền vững của hoàn thành theo mẻ, và `system_notification_recipients` để lưu trạng thái `UNREAD`/`READ` theo từng Operator hoặc table session đang nhận notification.
- [x] Bổ sung `CHECK` constraint cho `system_notification_recipients`, bảo đảm mỗi recipient tham chiếu đúng một `account` hoặc `table_session`.
- [x] Bổ sung `store_id` và composite foreign key trong Catalog (`menu_items`, `menu_item_tags`, `menu_item_option_groups`) để database chặn liên kết món, tag hoặc option group chéo cửa hàng.
- [x] Loại bỏ `promotions.code` và unique constraint liên quan khỏi V1; `promotion_codes` là nguồn duy nhất của mã khuyến mãi, cho phép promotion không cần mã hoặc có nhiều mã.
- [x] Đồng bộ `DATABASE_DESIGN.md` theo V1 DDL: bổ sung các cột audit/status/public ID còn thiếu, mô tả đầy đủ bảng notification và recipient, cùng unique constraint, trạng thái và quan hệ liên quan.
- [x] Loại bỏ các index đơn dư thừa đã được composite unique index bao phủ: `dining_tables(store_id)`, `tags(store_id)` và `client_accounts(store_id)`; index theo `created_at` sẽ được quyết định bằng `EXPLAIN ANALYZE` khi có query thực tế.
- [x] Làm rõ quy tắc `promotion_targets`: backend phân luồng `target_type` và kiểm tra `target_id` tồn tại trong `menu_items` hoặc `categories`, đồng thời thuộc cùng store với promotion, trước khi ghi dữ liệu.
- [x] Thay index đơn bằng composite index theo thời gian cho audit log, lịch sử table session của khách hàng và notification recipient để hỗ trợ truy vấn mới nhất trước.
- [x] Bổ sung `order_items.prepared_quantity` trực tiếp vào migration khởi tạo do schema chưa được áp dụng ở môi trường nào.
- [x] Cập nhật tài liệu sang mô hình khuyến mãi 5 bảng `promotions`,
      `promotion_codes`, `promotion_targets`, `promotion_redemptions` và
      `bill_discounts`; không sửa giá niêm yết `menu_items.price` khi áp dụng
      khuyến mãi.
- [x] Chốt mô hình logic của 5 bảng promotion/bill và quota theo
      promotion/code/khách hàng.
- [x] Thiết kế migration V1 chi tiết, unique constraint và index cho các bảng
      promotion, redemption và discount snapshot.
- [x] Rà soát `DATABASE_DESIGN.md` và `V1__create_base_20260701.sql` ngày
      2026-08-12; ghi nhận các điểm lệch cần chốt trước khi áp dụng migration.
- [x] Cho phép Customer và OPERATOR mở phiên bàn với số điện thoại tùy chọn;
      khách không có số điện thoại được lưu là khách lẻ (`client_accounts.phone`
      và `table_sessions.opened_by_customer_phone` bằng `NULL`).
- [x] Đồng bộ V1 với thiết kế database đã chốt trước khi migration được áp dụng:
      Firebase `accounts`, `categories.category_type`, `service_bookings` và
      `system_notification_recipients`.
- [x] Đồng bộ cấu hình `stores` vào V1: thông tin liên hệ/vị trí, giờ hoạt động,
      slogan và `long_wait_warning_minutes`.
- [x] Chốt API contract, giới hạn validation và fallback backend cho cấu hình
      ngưỡng cảnh báo chờ lâu: `GET`/`PUT
      /api/v1/admin/store/settings/long-wait-warning`, chỉ
      `ADMIN`, `0` tắt cảnh báo, giá trị bật trong khoảng `1`–`1440` phút và
      fallback backend là `25` phút khi không đọc được cấu hình hợp lệ; response
      success dùng `ApiResponse` với `data.longWaitWarningMinutes`.
- [ ] Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.

## 5. Backend

- [x] Refactor cấu trúc nội bộ các module backend đang triển khai (`store`,
      `operation`) theo các package `controller`, `service`, `mapper`, `model`,
      `dto` và `exception`; cập nhật tài liệu kiến trúc; giữ nguyên API contract,
      schema và hành vi nghiệp vụ.
### Các API đã làm

- [x] `GET /api/v1/status`: trả trạng thái hoạt động và thời điểm hiện tại của CAS.
- [x] `POST /api/v1/admin/admins`: tạo tài khoản `ADMIN` từ Firebase UID và tên hiển thị.
- [x] `POST /api/v1/admin/operators`: `ADMIN` tạo tài khoản `OPERATOR` qua Firebase Authentication, lưu email và số điện thoại.
- [x] `DELETE /api/v1/admin/operators/{operatorId}`: `ADMIN` vô hiệu hóa tài khoản `OPERATOR` và ghi audit log.
- [x] `POST /api/v1/admin/tables`: `ADMIN` tạo bàn ăn, đồng thời nhận QR token đang hoạt động của bàn.
- [x] `GET /api/v1/admin/store/settings/long-wait-warning`: `ADMIN` xem ngưỡng cảnh báo bàn chờ lâu.
- [x] `PUT /api/v1/admin/store/settings/long-wait-warning`: `ADMIN` cập nhật ngưỡng cảnh báo từ `0` đến `1440` phút và ghi audit log.

#### Danh sách API theo luồng nghiệp vụ

Danh sách này được đối chiếu từ tài liệu nghiệp vụ, thiết kế dữ liệu và các màn hình frontend đang dùng dữ liệu mẫu. `[x]` là API đã làm; `[ ]` là API chưa làm và chưa tự gán method/path, trừ các route đã được chốt ở trên. Mỗi dòng tương ứng một chức năng API.

- [ ] **Store:** xem thông tin cửa hàng.
- [ ] **Store:** cập nhật toàn bộ thông tin cửa hàng (tên, liên hệ, vị trí, giờ hoạt động, slogan và trạng thái) từ một form.
- [x] **Store:** xem ngưỡng cảnh báo bàn chờ lâu.
- [x] **Store:** cập nhật ngưỡng cảnh báo từ `0` đến `1440` phút và ghi audit log.
- [ ] **Bàn và QR:** xem danh sách bàn.
- [ ] **Bàn và QR:** xem QR đang hoạt động của bàn.
- [ ] **Bàn và QR:** tải QR của bàn để in hoặc lưu.
- [ ] **Bàn và QR:** xóa bàn.
- [ ] **Category:** xem danh sách category.
- [ ] **Category:** thêm category.
- [ ] **Category:** sửa category.
- [ ] **Category:** xóa category.
- [ ] **Tag:** xem danh sách tag.
- [ ] **Tag:** thêm tag.
- [ ] **Tag:** sửa tag.
- [ ] **Tag:** xóa tag.
- [ ] **Món:** xem danh sách món.
- [ ] **Món:** xem chi tiết món.
- [ ] **Món:** thêm món.
- [ ] **Món:** sửa món, gồm category, tag, nhóm option, giá, trạng thái, thứ tự hiển thị và ảnh Cloudinary, từ một form.
- [ ] **Món:** cập nhật hàng loạt trạng thái `ACTIVE`, `INACTIVE` hoặc `SOLD_OUT`.
- [ ] **Nhóm option:** xem danh sách nhóm option.
- [ ] **Nhóm option:** xem chi tiết nhóm option.
- [ ] **Nhóm option:** thêm nhóm option.
- [ ] **Nhóm option:** sửa nhóm option.
- [ ] **Nhóm option:** xóa nhóm option.
- [ ] **Option value:** thêm option value.
- [ ] **Option value:** xóa option value.
- [ ] **Catalog gọi món:** xem category hiển thị cho Customer/`OPERATOR`.
- [ ] **Catalog gọi món:** xem tag hiển thị cho Customer/`OPERATOR`.
- [ ] **Catalog gọi món:** xem danh sách món còn bán cho Customer/`OPERATOR`.
- [ ] **Catalog gọi món:** xem chi tiết món và option hợp lệ cho Customer/`OPERATOR`.
- [ ] **Table session:** xác thực QR và mở session mới hoặc dùng chung session `OPEN` hiện có.
- [ ] **Table session:** lấy ngữ cảnh session hiện tại của Customer.
- [ ] **Table session:** xem trạng thái session hiện tại của Customer.
- [ ] **Table session:** hủy session chưa có order.
- [ ] **Order:** tạo order bởi Customer.
- [ ] **Order:** tạo order hộ bởi `OPERATOR`.
- [ ] **Order:** xem danh sách order của session.
- [ ] **Order:** xem chi tiết order.
- [ ] **Bill:** xem bill hiện tại của session.
- [ ] **Chế biến:** xem danh sách bàn chờ lâu.
- [ ] **Chế biến:** xem danh sách món còn phải làm đã tổng hợp theo món và option.
- [ ] **Chế biến:** ghi nhận số lượng hoàn thành theo mẻ.
- [ ] **Yêu cầu hủy món:** tạo yêu cầu hủy món.
- [ ] **Yêu cầu hủy món:** xem danh sách yêu cầu hủy món.
- [ ] **Yêu cầu hủy món:** xem chi tiết yêu cầu hủy món.
- [ ] **Yêu cầu hủy món:** xử lý yêu cầu bằng quyết định từ chối, hủy hoàn toàn hoặc làm lại (`is_remade`).
- [ ] **Payment:** tạo payment `PENDING` từ bill do server tính.
- [ ] **Payment:** xem trạng thái payment của session.
- [ ] **Payment:** xem danh sách payment chờ xác nhận.
- [ ] **Payment:** xem chi tiết payment và bill snapshot.
- [ ] **Payment:** xác nhận payment thành `PAID`.
- [ ] **Khoản chưa thanh toán:** ghi nhận khoản chưa thanh toán và đóng session.
- [ ] **Khoản chưa thanh toán:** xem danh sách khoản chưa thanh toán.
- [ ] **Khoản chưa thanh toán:** xem chi tiết khoản chưa thanh toán.
- [ ] **Khoản chưa thanh toán:** chuyển khoản chưa thanh toán sang `RESOLVED` khi payment được xác nhận.
- [ ] **Promotion:** xem danh sách promotion.
- [ ] **Promotion:** xem chi tiết promotion.
- [ ] **Promotion:** thêm promotion, gồm điều kiện, code và phạm vi áp dụng theo món/category, từ một form.
- [ ] **Promotion:** sửa promotion, gồm điều kiện, code và phạm vi áp dụng theo món/category, từ một form.
- [ ] **Promotion:** đổi trạng thái `DRAFT`, `ACTIVE` hoặc `INACTIVE`.
- [ ] **Promotion áp dụng bill:** xem promotion hợp lệ và discount dự kiến.
- [ ] **Promotion áp dụng bill:** chọn promotion cho bill.
- [ ] **Promotion áp dụng bill:** bỏ promotion khỏi bill.
- [ ] **Dịch vụ đặt trước:** xem danh sách booking.
- [ ] **Dịch vụ đặt trước:** tạo booking với trạng thái ban đầu `PAY_LATER` hoặc `PENDING`.
- [ ] **Dịch vụ đặt trước:** xác nhận booking thành `PAID`.
- [ ] **Dịch vụ đặt trước:** hủy booking thành `CANCELLED`.
- [ ] **Tài khoản `OPERATOR`:** xem danh sách tài khoản.
- [ ] **Sự cố vận hành:** `OPERATOR` tạo báo cáo sự cố.
- [ ] **Sự cố vận hành:** `ADMIN` xem danh sách báo cáo sự cố.
- [ ] **Thông báo hệ thống:** `ADMIN` tạo thông báo.
- [ ] **Thông báo hệ thống:** `ADMIN` xóa thông báo.
- [ ] **Thông báo hệ thống:** Customer/Operator xem danh sách notification của mình, gồm số chưa đọc.
- [ ] **Thông báo hệ thống:** Customer/Operator đánh dấu một notification là đã đọc.
- [ ] **Thông báo hệ thống:** Customer/Operator đánh dấu tất cả notification là đã đọc.
- [ ] **Audit log:** `ADMIN` xem danh sách audit log.
- [ ] **Tra cứu khách hàng:** `ADMIN` tìm kiếm và xem danh sách khách trong store.
- [ ] **Tra cứu khách hàng:** `ADMIN` xem chi tiết khách, gồm lịch sử session, order, payment và khoản chưa thanh toán.
- [ ] **Ngoài danh sách:** API danh sách `report` chưa được liệt kê vì loại report, dữ liệu, bộ lọc và API contract đều đang `Cần chốt`.

### Kế hoạch triển khai

#### Giai đoạn 0 — Nền tảng đã có

- [x] Khởi tạo dự án Java 21, Spring Boot và Maven.
- [x] Thêm Maven Wrapper cho backend.
- [x] Cấu hình MySQL, Redis, MyBatis và Flyway.

#### Giai đoạn 1 — Thành phần dùng chung và bảo mật

- [x] Chuẩn hóa API error, request ID và Jakarta Bean Validation tại API boundary.
- [x] Chuẩn hóa wrapper response: success gồm `status`, `message`, `data`, `requestId`; error dùng cùng metadata nhưng không có `data`.
- [x] Chuẩn hóa thành phần dùng chung theo `common.config`, `common.exception`,
      `common.response`, `common.constants`, `common.persistence`,
      `common.security` và `common.web`.
- [x] Xây dựng authentication Firebase ID Token, nạp `accounts` và phân quyền `ADMIN`/`OPERATOR`.
- [x] Xây dựng audit log dùng chung cho các thao tác vận hành quan trọng.
- [x] Đăng ký MyBatis UUID type handler cho các cột `CHAR(36)` như `audit_logs.request_id`.
- [x] Tự nạp cấu hình local từ `backend/.env` khi chạy Spring Boot trong thư mục backend.
- [x] Tạo thư mục dự phòng `backend/worker/` cho worker tác vụ nền trong tương lai; chưa tạo Maven module hoặc cấu hình runtime.
- [x] Chuẩn hóa cURL/Postman cho kiểm thử thủ công API; Firebase ID Token chỉ dùng trong môi trường local và không lưu repository.
- [x] Loại bỏ Bruno collection theo quyết định dùng Postman/cURL.
- [x] Bổ sung Postman Native Git collection và local environment template để kiểm thử API thủ công.
- [x] Sắp xếp Postman Native Git collection theo resource (`Auth`, `Accounts`, `Store`, `System`) thay vì theo role.
- [x] Cập nhật API tạo `OPERATOR`: backend tự gán mật khẩu mặc định, không nhận `initialPassword` từ client; cập nhật test, cURL/Postman và luồng nghiệp vụ liên quan.
- [x] Thêm Flyway V2 cho `accounts.email` và `accounts.phone` (`NOT NULL`, unique); backfill account cũ bằng giá trị placeholder duy nhất và cập nhật luồng tạo account mới để lưu đủ hai trường.
- [x] Bổ sung `backend/Agents.md` với quy ước triển khai, bảo mật, MyBatis,
      Flyway, audit log, Bruno và kiểm thử dành riêng cho backend.

#### Giai đoạn 2 — Dữ liệu cửa hàng và thực đơn

- [ ] Xây dựng module Store & Table.
- [x] Xây dựng API `GET`/`PUT /api/v1/admin/store/settings/long-wait-warning`: chỉ
      `ADMIN`, validation `0`–`1440`, fallback đọc `25`, ghi audit log và test
      service/controller.
- [ ] Xây dựng module Catalog.

#### Giai đoạn 3 — Phiên bàn, gọi món và chế biến

- [ ] Xây dựng luồng QR, mở/dùng chung/hủy table session khi chưa có order.
- [ ] Xây dựng module Ordering.
- [ ] Xây dựng use case `OPERATOR` chọn bàn và tạo order hộ khách, tái sử dụng
      quy tắc tạo order hiện có và ghi audit log.
- [ ] Xây dựng truy vấn tổng hợp món còn cần làm và use case hoàn thành theo mẻ trong transaction, có idempotency bền vững và phân bổ FIFO.

#### Giai đoạn 4 — Thanh toán và khuyến mãi

- [ ] Xây dựng module Payment.
- [ ] Xây dựng áp dụng khuyến mãi, snapshot `bill_discounts` và redemption khi payment `PAID`.

#### Giai đoạn 5 — Vận hành và tra cứu

- [x] Xây dựng API `POST /api/v1/admin/operators` và `DELETE /api/v1/admin/operators/{operatorId}` cho `ADMIN`; tạo Operator qua Firebase Admin SDK bằng email và mật khẩu ban đầu, xóa chuyển account `OPERATOR` sang `INACTIVE` và ghi audit log.
- [ ] Xây dựng báo cáo sự cố vận hành cho `OPERATOR` và danh sách xem cho `ADMIN`.
- [ ] Xây dựng thông báo hệ thống và trạng thái đọc theo từng recipient.
- [ ] Viết unit test và integration test.
- [ ] Xây dựng module Admin tra cứu khách hàng, dùng lại `client_accounts` và lịch sử nghiệp vụ hiện có.
- [ ] Xây dựng module danh sách `report` cho `ADMIN` sau cùng, sau khi phạm vi và API contract được chốt.

#### Ngoài kế hoạch cho đến khi chốt yêu cầu

- [ ] Module danh sách `report` được thực hiện sau cùng, sau khi phạm vi và API contract được chốt.

## 6. Frontend

- [x] Bổ sung trang Admin `/admin/services` quản lý Dịch vụ thêm, dùng chung UI và quyền thao tác tương ứng với Operator.
- [x] Đặt Dịch vụ thêm trong dropdown Menu & Promotion của Admin.
- [x] Bổ sung nút In bill trong popup xác nhận thanh toán của Operator; hiện mở hộp in của trình duyệt.
- [x] Thiết kế bản in bill nhiệt 80 mm cho popup xác nhận thanh toán: khổ nội dung 72 mm, thông tin cửa hàng/bill/bàn, món, topping, đơn giá, số lượng, thành tiền và tổng thanh toán.
- [x] Bổ sung khoảng đệm cuối danh sách Menu Customer để nút “Xem món đã chọn” cố định không che món cuối.
- [x] Bổ sung section “Dịch vụ thêm” cuối Menu Customer: giá thỏa thuận và nhãn hotline liên hệ, không đi vào giỏ hàng hoặc chuyển hướng sang Zalo.
- [x] Bổ sung category “Khác” cuối thanh điều hướng Menu Customer, cuộn tới section Dịch vụ thêm.
- [x] Đổi thumbnail cố định của card Dịch vụ thêm trên Menu Customer sang biểu tượng ngôi sao.
- [x] Tăng vùng cuộn cuối Menu Customer để scroll-spy lần lượt kích hoạt đúng tab Ăn vặt và Khác.
- [x] Sửa scroll-spy Menu Customer không ép active sang category cuối khi chạm đáy, giữ đúng category section đang xem.
- [x] Đồng bộ vùng cuộn cuối Menu Customer trên desktop để các category cuối vẫn có thể đi qua vị trí kích hoạt scroll-spy.
- [x] Đặt card Dịch vụ thêm trong cùng lưới 2/3 cột với card món ở desktop, giữ icon ngôi sao kích thước tiêu chuẩn.

- [x] Khởi tạo Next.js, React và TypeScript.
- [x] Tích hợp Tailwind CSS với PostCSS.
- [x] Xây dựng trang chào mừng CAS cho quán ăn vặt/mỳ cay bằng Tailwind CSS theo thiết kế Stitch, có giao diện sáng/tối.
- [x] Xây dựng UI màn thực đơn Customer mobile-first theo thiết kế Stitch, hiển thị 15 món trong danh sách dài theo từng nhóm, có divider và thanh category sticky hỗ trợ vuốt cảm ứng hoặc nhấn-giữ-kéo bằng chuột, liên kết đến từng nhóm; ảnh category tại Khám phá thực đơn dẫn đến đúng nhóm tương ứng.
- [x] Xây dựng UI chi tiết sản phẩm động tại `/menu/[slug]` theo thiết kế Stitch; mỳ cay chọn cấp độ 0–7, đồ uống chọn size và nhiều topping.
- [x] Điều chỉnh vị trí badge sản phẩm trong màn chi tiết để không bị khối nội dung chồng lấp.
- [x] Xây dựng UI giỏ hàng Customer mobile-first theo thiết kế Stitch, gồm món đang chọn, option, số lượng, ghi chú chung và tổng tiền.
- [x] Xây dựng UI màn gửi món thành công tại `/orders` theo thiết kế Stitch, gồm xác nhận quán đã nhận món, thông tin bàn, thời gian gửi, chi tiết lần gọi, thao tác gọi thêm món và liên kết tới bước yêu cầu thanh toán.
- [x] Xây dựng UI nhập tên và số điện thoại tùy chọn tại route QR động `/table/[token]` cho khách đầu tiên mở bàn.
- [x] Hoàn thiện form mở phiên bàn với validation bắt buộc cho tên, số điện thoại tùy chọn, thông báo lỗi accessible và điều hướng UI sang thực đơn.
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
- [x] Xây dựng giao diện đăng nhập nhân viên tại `/operator/login` bằng email và mật khẩu, có validation bắt buộc ở frontend và chuyển UI sang `/operator/dashboard` khi nhập hợp lệ.
- [ ] Đồng bộ giao diện đăng nhập nhân viên từ số điện thoại/mật khẩu sang email qua Firebase Authentication.
- [x] Xây dựng giao diện danh sách payment chờ xác nhận tại
      `/operator/payments`; nhân viên dùng hành động “Xác nhận đã thanh toán” và
      phải xác nhận lại trong popup có bàn, số tiền cùng nhắc nhở kiểm tra loa báo
      giao dịch thành công.
- [x] Xây dựng giao diện xem và xử lý các Yêu cầu hủy món tại `/operator/cancellations` với Form Modal xác nhận Đồng ý / Từ chối hủy món, hiển thị đầy đủ món gốc, option, đơn giá, số lượng và thành tiền cần đối chiếu.
- [x] Xây dựng trang Hủy món do sự cố tại `/operator/cancellations/new` hiển thị danh sách món đã gọi theo bàn, bóc tách giá gốc, topping, tổng tiền và bộ nút trừ/cộng chọn số lượng hủy bên phải cùng ô nhập nguyên nhân dạng text và cờ `is_remade`.
- [x] Xây dựng chức năng Báo cáo sự cố phát sinh trên trang Tổng quan (`/operator/dashboard`) cho phép nhân viên `OPERATOR` tạo và ghi nhận các sự cố trong ca (lưu tên người tạo, thời gian tạo và nội dung sự cố) để gửi lên cho `ADMIN`.
- [x] Cập nhật hệ thống tài liệu thiết kế (`OVERALL.md`, `BUSINESS_FLOWS.md`, `DATABASE_DESIGN.md`, `PROJECT_PROGRESS.md`) phân định rõ: `OPERATOR` tạo báo cáo sự cố phát sinh, `ADMIN` có quyền xem và tra cứu danh sách báo cáo sự cố.
- [x] Bổ sung badge số nhỏ (counter badge) hiển thị số lượng yêu cầu/thông tin chờ xử lý trên thanh điều hướng `OperatorTabNavigation` cho các tab Đơn gọi món (8), Hủy món (3), Thanh toán (3), Chưa thanh toán (1) và Dịch vụ thêm (1).
- [x] Xây dựng UI bộ giao diện Admin hoàn chỉnh tại `/admin` theo đúng thiết kế Stitch và tài liệu dự án, bao gồm Admin Header & AdminTabNavigation (`/admin/layout.tsx`), Dashboard Tổng quan (`/admin/page.tsx`), Quản lý Thực đơn & Catalog (`/admin/catalog/page.tsx`), Quản lý Bàn & Mã QR (`/admin/tables/page.tsx`), Quản lý Nhân viên OPERATOR (`/admin/operators/page.tsx`), Báo cáo Sự cố ca trực (`/admin/incidents/page.tsx`), Cấu hình & Nhật ký Audit Logs (`/admin/settings/page.tsx`).
- [x] Sửa menu Admin hai cấp: popup submenu không còn bị cắt bởi vùng cuộn ngang; thanh điều hướng tự xuống hàng trên màn hình hẹp và bổ sung trạng thái truy cập cho dropdown.
- [x] Tổ chức lại UI Admin: tách Catalog thành các trang danh mục, món ăn, option và nhãn món; tách Audit Logs thành trang tra cứu riêng; báo cáo sự cố chỉ còn chức năng xem/tra cứu theo phạm vi đã chốt.
- [x] Bổ sung UI `/admin/reports` với bộ lọc ngày/loại báo cáo và thao tác xuất Excel tạm thời; bổ sung điều hướng đến Reports và Audit Logs.
- [x] Tăng kích thước font chữ cấp 1 của thanh điều hướng AdminTabNavigation lên text-base (tăng 2 cấp font), giữ nguyên kích thước text-xs cho menu cấp 2 trong popup dropdown; đổi nhãn menu nhóm từ "Vận hành & Nhân sự" thành "Sự cố và Nhân sự"; bảo đảm duy nhất tab "Sự cố và Nhân sự" hiển thị badge đếm số thông báo.
- [x] Cập nhật bộ tài liệu dự án (`OVERALL.md`, `BUSINESS_FLOWS.md`, `DATABASE_DESIGN.md`) bổ sung phạm vi chức năng, luồng nghiệp vụ và quy tắc dữ liệu cho khuyến mãi và Thông báo hệ thống (Notifications).
- [x] Xây dựng UI Quản lý Mã giảm giá (`/admin/vouchers`) theo mô hình cũ.
- [x] Rà soát và hoàn thiện UI `/admin/promotions` đúng và đủ các field theo tài liệu & DB design: nhập số tiền tự động có dấu phân cách hàng nghìn (`1,000,000`), thời gian chuẩn `datetime-local` (`start_at`/`end_at`), cảnh báo loại giảm `ITEM_...` chưa chọn target, và tích hợp Modal xem lịch sử lượt sử dụng (`PromotionRedemption`).
- [x] Xây dựng UI Quản lý Thông báo hệ thống (`/admin/notifications`) hỗ trợ Admin cấu hình chọn đối tượng nhận thông báo: Chỉ Nhân viên (`OPERATOR`), Chỉ Khách hàng (`CUSTOMER`), hoặc Cả 2 (`BOTH`), đi kèm bộ lọc theo đối tượng linh hoạt.
- [x] Cập nhật tất cả các form tạo mới trong giao diện Admin (Thông báo, Vouchers, Tài khoản Nhân viên, Bàn ăn & QR Code, Danh mục món, Nhóm Option) sang dạng Modal Popup đè lên toàn bộ màn hình (`fixed inset-0 z-50 backdrop-blur-sm bg-black/55`), loại bỏ việc chèn form làm xô lệch bố cục trang.
- [x] Cập nhật hiệu ứng hover chữ trên các menu cha của giao diện Admin (`AdminTabNavigation` gồm "Tổng quan", "Báo cáo", "Quản lý Quán", "Sự cố và Nhân sự", "Hệ thống & Cấu hình") sang màu xanh lá thương hiệu (`hover:text-cas-secondary`), giữ nguyên thiết kế font và kích thước ban đầu.
- [x] Loại bỏ bảng trùng lặp "2. Nhật ký Thao tác (Audit Logs)" trên trang Cấu hình (`/admin/settings`), chỉ giữ lại phần Cấu hình Tham số Vận hành Cửa hàng (Audit Logs đã có route chuyên biệt tại `/admin/audit-logs`).
- [x] Đã từng xây dựng UI Admin Cấu hình Thông báo Khuyến mãi & Banner (`/admin/promotions`); chức năng hiện đã bị loại khỏi phạm vi.
- [x] Loại Banner chào mừng, Header Ticker và gợi ý mã khuyến mãi khỏi phạm vi CAS; không còn dùng `promotion_configs`.
- [x] Tích hợp nút chuông thông báo (bell icon) ở góc trên bên phải cho giao diện Khách hàng (`CustomerHeader`) và Nhân viên (`OperatorWorkspaceLayout`) kèm popup xem nhanh thông báo & ưu đãi.
- [x] Tinh chỉnh Admin Dashboard (Tổng quan): bổ sung bộ lọc thời gian chuyên sâu ở đầu trang hỗ trợ ô chọn Ngày (`input type="date"`), ô chọn Tháng (`input type="month"`), chọn Năm (`select year`) và chọn Khoảng ngày (Từ ngày - Đến ngày); loại bỏ chữ "cụ thể" trong menu, chuẩn hóa nhãn "Lọc theo:" thường và hiển thị 7 chỉ số dạng bảng 2 cột gọn nhẹ với màu đen đồng nhất.
- [x] Thay biểu đồ chính Admin Dashboard bằng line chart doanh thu theo thời gian, có bộ chọn Hôm nay/7 ngày/30 ngày/Tháng này và dữ liệu theo giờ từ 09h đến 22h cho chế độ Hôm nay.
- [x] Tinh chỉnh thanh điều hướng Admin (`AdminTabNavigation`): hỗ trợ trượt ngang mượt mà (`overflow-x-auto`, `whitespace-nowrap`, `shrink-0`) trên mobile; đồng thời xử lý hiển thị popup menu con bằng `fixed` positioning giúp menu xổ ra tự do bên ngoài box, không bị cắt mép hay bắt người dùng kéo cuộn bên trong.
- [x] Xây dựng giao diện quản lý khoản chưa thanh toán tại `/operator/unpaid`, bao gồm danh sách các bản ghi `unpaid_records`, bộ lọc trạng thái (`ALL`, `OPEN`, `RESOLVED`), Modal xem `bill_snapshot` chi tiết, thao tác kết thúc phiên bàn và ghi nhận chưa thanh toán với lý do bắt buộc, cùng nút chuyển đổi trạng thái đã thu tiền.
- [x] Lược bỏ mô tả kỹ thuật về tạo payment và snapshot khỏi form ghi nhận chưa thanh toán.
- [x] Bổ sung popup xác nhận trước khi đánh dấu khoản chưa thanh toán là đã thu tiền.
- [x] Xây dựng UI `OPERATOR` quản lý dịch vụ đặt trước tại `/operator/services` (tab “Dịch vụ thêm”): nhập tên/SĐT sau khi chốt qua Zalo, tìm hoặc tạo `client_account` theo SĐT, nhập giá đã thỏa thuận và cập nhật trạng thái thanh toán.
- [x] Bổ sung popup xác nhận trước khi chuyển dịch vụ thêm sang trạng thái đã thanh toán.
- [x] Bổ sung thao tác hủy dịch vụ thêm khi khách không tiếp tục đặt, kèm popup xác nhận.
- [x] Bổ sung validation hiển thị tại form tạo dịch vụ thêm: dữ liệu bắt buộc, giới hạn độ dài, SĐT và giá đã thỏa thuận hợp lệ (cho phép giá `0` với dịch vụ miễn phí).
- [x] Bổ sung trường ghi chú tùy chọn khi tạo dịch vụ thêm, hiển thị trên card dịch vụ và dùng chung cho giao diện `ADMIN` và `OPERATOR`; cập nhật thiết kế `service_bookings`.
- [x] Đồng bộ giao diện chi tiết món trong Giỏ hàng Customer với Đơn hàng, giữ thao tác điều chỉnh số lượng và xóa món.
- [x] Đồng bộ giỏ món trong luồng `OPERATOR` tạo order hộ với giao diện chi tiết món Customer, bao gồm giá món gốc và từng option đã chọn.
- [x] Hiển thị ghi chú chung của order trên trang Đơn hàng Customer.
- [x] Giữ luồng Customer chuyển tới `/payment` để kiểm tra và gửi yêu cầu thanh toán; không hiển thị Thanh toán như một tab điều hướng riêng.
- [x] Bổ sung dropdown chọn một voucher/promotion trên trang Đơn hàng Customer và tính tạm thời giá gốc, số tiền giảm, giá trị cần thanh toán ở frontend.
- [x] Bổ sung tab Admin `/admin/unpaid` trong nhóm “Sự cố và Nhân sự” để theo dõi số lượng, tổng tiền và chi tiết các khoản chưa thanh toán; cả `ADMIN` và `OPERATOR` có thể kết thúc phiên bàn, nhập lý do và ghi nhận khoản chưa thanh toán.
- [x] Xây dựng UI tạm thời Admin xem danh sách `report` tại `/admin/reports`, có bộ lọc ngày/loại báo cáo và thao tác xuất Excel chưa kết nối API.
- [ ] Xây dựng chức năng Admin cấu hình ngưỡng cảnh báo bàn chờ lâu theo contract đã chốt.
- [ ] Viết component test và end-to-end test.
- [x] Xây dựng giao diện Admin tra cứu khách hàng tại `/admin/customers`, gồm tìm kiếm theo tên/SĐT, che số điện thoại ở danh sách và xem lịch sử phiên bàn dạng chỉ đọc bằng dữ liệu mẫu.
- [x] Bổ sung section định hướng phát triển cuối trang `/admin/audit-logs`: chăm sóc khách hàng qua Zalo, trò chơi và tính năng AI.

- [x] Căn chỉnh popup submenu của `AdminTabNavigation` bám ngay dưới thanh điều hướng, loại bỏ khoảng hở do `fixed` positioning bị ảnh hưởng bởi backdrop blur.
- [x] Xây dựng UI Cấu hình Thông tin Cửa hàng tại `/admin/settings` (mô tả phụ: "Quản lý thông tin cửa hàng và tham số vận hành") hỗ trợ Admin thiết lập Tên quán, Số điện thoại Hotline, Email liên hệ, Địa chỉ, Link/Tọa độ vị trí quán trên Google Maps (tích hợp nút **`?`** Popover Tooltip hướng dẫn 3 bước trực quan), Giờ mở/đóng cửa (sử dụng bộ chọn `TimePicker12H` Popover hiện đại hỗ trợ chuyển AM/PM nhanh), Slogan chào mừng, Trạng thái hoạt động (`ACTIVE`/`INACTIVE`) cùng nút chuyển đổi giao diện **Sáng / Tối** (`ThemeToggle`) đồng bộ trên Admin & Operator Header.
- [x] Cập nhật form tạo `OPERATOR` tại `/admin/operators`: bắt buộc họ tên, email đăng nhập và số điện thoại liên hệ; validation khớp các cột `NOT NULL` của `accounts` và giới hạn độ dài DDL.
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
- [x] Chuẩn hóa các ô nhập giá trong Catalog và Dịch vụ thêm theo định dạng dấu phẩy hàng nghìn (ví dụ `1,200,000`).
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

- [x] Tạo cấu hình Docker Compose phục vụ triển khai production.
- [x] Chốt Cloudinary làm dịch vụ lưu trữ hình ảnh.
- [x] Chốt GitHub Actions làm nền tảng CI/CD.
- [x] Chốt triển khai production trên một VPS.
- [x] Bổ sung health indicator Firebase Authentication cho Actuator; endpoint `/actuator/health/firebase` kiểm tra service account và khả năng gọi Firebase Auth.
- [ ] Tích hợp upload và quản lý hình ảnh với Cloudinary.
- [ ] Tạo pipeline CI kiểm tra build, test và migration.
- [ ] Chốt chi tiết và cấu hình môi trường triển khai VPS.
- [ ] Cấu hình logging, theo dõi lỗi và health check.
- [ ] Thiết lập sao lưu và khôi phục MySQL.
- [ ] Kiểm thử triển khai thử nghiệm tại cửa hàng.

## 8. Việc tiếp theo

- [x] Chuẩn hóa phạm vi audit log: bổ sung entity type, action và các thao tác Admin/Operator bắt buộc phải ghi nhận.
- [x] Đồng bộ thiết kế `stores` với UI Admin Settings: thông tin liên hệ, vị trí Google Maps, giờ hoạt động, slogan và ngưỡng cảnh báo bàn chờ lâu.
- [x] Bổ sung footer trang Welcome Customer hiển thị các thông tin công khai của cửa hàng theo dữ liệu `stores`: tên, địa chỉ/vị trí, hotline, email và giờ hoạt động, kèm icon ngữ cảnh và dòng bản quyền.
- [x] Điều chỉnh khoảng đệm cuối trang giỏ hàng Customer để thanh gửi món cố định không che khu vực ghi chú chung.
- [x] Rà soát lại tài liệu nguồn: tổng quan, luồng nghiệp vụ, thiết kế database và các trường hợp biên.
- [x] Bổ sung nhãn phân biệt dưới logo CAS trên header khu vực Admin và Vận hành.
- [x] Cố định toàn bộ panel giỏ món bên phải trong màn Operator tạo order hộ và cho phép panel tự cuộn độc lập với menu.
- [x] Đồng bộ UI xác nhận gửi món của Operator với trang Đơn hàng Customer: hiển thị bàn, thời gian và danh sách món vừa gửi, gồm option, số lượng và thành tiền.
- [x] Bổ sung UI chọn voucher cho luồng Operator tạo order hộ; giỏ món và màn xác nhận hiển thị số tiền giảm cùng giá trị cần thanh toán tạm thời.
- [x] Cho phép Operator chọn bàn trống tại màn tạo order hộ và xác nhận tạo phiên bàn mới trước khi chọn món.
- [x] Tái sử dụng form thông tin khách (tên và SĐT) từ luồng quét QR khi Operator tạo phiên bàn mới trước khi tạo order hộ.
- [x] Đổi card dịch vụ trong menu Customer thành “Đặt dịch vụ theo yêu cầu” và tách ghi chú chốt giá qua Zalo khỏi nút liên hệ.
- [x] Bổ sung mục “Khác” và card “Đặt dịch vụ theo yêu cầu” vào menu tạo order hộ của Operator, tách biệt khỏi giỏ món tại bàn.
- [x] Giữ thanh category cố định khi cuộn cho menu Customer và menu tạo order hộ của Operator, với offset phù hợp từng header và cập nhật đúng danh mục cuối trang.

1. Tạo dữ liệu mẫu phục vụ phát triển và kiểm thử.
2. Xây dựng API contract và ma trận phân quyền chi tiết theo từng API.
3. ~~Hoàn thiện cách xử lý các edge case còn lại.~~ (Đã hoàn thiện)
4. Chốt định nghĩa và phạm vi dữ liệu cho chức năng Admin xem danh sách `report` (lưu ý bóc tách khối lượng hao hụt dựa trên cờ `is_remade`).
5. Xây dựng các module backend và frontend theo luồng nghiệp vụ đã chốt.
6. Chốt phạm vi khai báo tiền mặt đầu ca/cuối ca, dữ liệu đối soát và quy trình xử lý chênh lệch trước khi bổ sung module vận hành theo ca.

## 9. Tài liệu liên quan

- [Tổng quan hệ thống](OVERALL.md)
- [Luồng nghiệp vụ](BUSINESS_FLOWS.md)
- [Thiết kế database](DATABASE_DESIGN.md)
- [Các trường hợp biên](EDGE_CASES.md)

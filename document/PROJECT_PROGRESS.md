# CAS — Theo dõi tiến độ dự án

Ngày cập nhật gần nhất: 2026-10-28

## Quy ước

- `[x]`: Đã hoàn thành.
- `[ ]`: Chưa hoàn thành hoặc chưa chốt phạm vi.
- Tài liệu chi tiết là nguồn tham chiếu chính: `OVERALL.md`, `BUSINESS_FLOWS.md`, `DATABASE_DESIGN.md` và `EDGE_CASES.md`.

## 1. Phân tích và tài liệu

- [x] Hoàn thiện phạm vi sản phẩm, luồng QR tại bàn, gọi món, hủy món, thanh toán, khoản chưa thanh toán và các trường hợp biên.
- [x] Chốt phạm vi tra cứu khách hàng Admin, in hóa đơn/phiếu bếp nội bộ và định hướng offline-first cho Operation; thao tác tài chính vẫn yêu cầu online.
- [x] Chuẩn hóa tài liệu kiến trúc, quy tắc nghiệp vụ, thiết kế dữ liệu và cấu trúc dự án.
- [x] Mở rộng `TEST_CASES.md` thành 151 kịch bản kiểm thử thủ công trong 18 cụm chức năng; bổ sung timeout sau commit, xóa bù Firebase khi lưu CAS lỗi, biên thời gian và bất biến hủy/chế biến đồng thời. Các case chưa thực thi, trạng thái ban đầu `NOT RUN`; ghi riêng phạm vi chưa chốt/chưa triển khai.

## 2. Quyết định nghiệp vụ đã chốt

- [x] Mỗi lần gửi món tạo một `order` trong `sales_session`; giá món và option được snapshot tại thời điểm đặt, chống trùng bằng idempotency key.
- [x] Chế biến theo FIFO; tiến độ nằm ở `order_items.prepared_quantity`, hoàn thành theo mẻ và suy ra trạng thái order.
- [x] Một bàn có khách được suy ra từ sales session `OPEN`/`PAYMENT_PENDING`; không hỗ trợ đổi, gộp hoặc tách bàn.
- [x] Hủy món không sửa dữ liệu order gốc; nhân viên có thể ghi nhận món làm lại qua `is_remade`.
- [x] Thanh toán do nhân viên xác nhận thủ công; CAS không tạo QR thanh toán, không lưu thông tin ngân hàng và không theo dõi dòng tiền thực tế.
- [x] Khoản chưa thanh toán có bản ghi và bill snapshot riêng; payment cũng có bill snapshot.
- [x] Khuyến mãi thuộc store, được chọn tối đa một cho bill, tính lại theo bill hiện hành và khóa khi chuyển `PAYMENT_PENDING`; redemption chỉ phát sinh khi payment `PAID`.
- [x] Customer và Operator chỉ hủy session chưa có order; Admin có thể tra cứu khách hàng theo store ở chế độ chỉ đọc.

## 3. Quyết định kỹ thuật đã chốt

- [x] Backend: Java 21, Spring Boot, Maven, MyBatis, MySQL, Redis và Flyway; tiền tệ dùng `DECIMAL`/`BigDecimal`.
- [x] Frontend: Next.js, React, TypeScript và Tailwind CSS, tổ chức theo ba khu vực Customer, Operator và Admin.
- [x] Xác thực tài khoản vận hành dùng Firebase ID Token; backend phân quyền `SUPER_ADMIN`, `ADMIN` và `OPERATOR`.
- [x] Đồng bộ dùng REST và polling; CORS chỉ cho frontend origin cấu hình.
- [x] Ảnh upload trực tiếp Cloudinary bằng chữ ký ngắn hạn do backend cấp; production dùng Docker Compose trên VPS.

## 4. Thiết kế database

- [x] Hoàn thiện baseline Flyway, foreign key, unique/composite index, audit fields và seed demo.
- [x] Hoàn thiện mô hình store, bàn, catalog/options/tags, sales session, order, chế biến, payment, unpaid record, promotion, notification và audit log.
- [x] Chuẩn hóa ràng buộc theo store để ngăn tham chiếu catalog/promotion chéo cửa hàng.
- [x] Đồng bộ `DATABASE_DESIGN.md` với schema và các trạng thái nghiệp vụ đang áp dụng.

## 5. Backend

- [x] Rà soát API phụ thuộc bàn và sales session: ghi nhận các điểm cần xử lý cho hoàn thành order mang về, dashboard, thông báo và giao diện thanh toán Operator.

### Nền tảng và bảo mật

- [x] Chuẩn hóa response/error, request ID, validation, logging an toàn, audit log và kiểm thử thủ công cURL/Postman.
- [x] Xác thực Firebase, quản lý tài khoản vận hành và phân quyền theo store/role.

### API và nghiệp vụ đã hoàn thành

- [x] `POST /api/v1/operator/preparation/sessions/{sessionId}/completions`: hoàn thành các món còn lại của một sales session; lưu idempotency theo session và giữ lịch sử thao tác theo bàn.
- [x] `GET /api/v1/operator/sales-sessions/tables`: trả danh sách bàn và các session mang về đang hoạt động để Operator chọn phiên.
- [x] `POST /api/v1/admin/notifications`: thông báo Customer được gửi tới cả phiên tại bàn và mang về đang hoạt động trong cơ sở.
- [x] `GET /api/v1/operator/dashboard/summary`: tính order và payment mang về theo sales session; đếm mỗi bàn đang phục vụ một lần.
- [x] Các API yêu cầu hủy, chi tiết order và nhóm chế biến Operator hỗ trợ phiên mang về theo `sales_sessions.store_id`; `tableCode` có thể là null và kết quả hủy gửi đúng phiên.
- [x] `POST /api/v1/operator/cancellation-requests/{id}/resolution`: bắt buộc `rejectionReason` khi từ chối; tạo thông báo kết quả cho phiên khách của order trong cùng transaction.
- [x] `GET /api/v1/customer/orders/bill`: trả trạng thái yêu cầu hủy gần nhất của từng món qua `latestCancellationStatus`.
- [x] `DELETE /api/v1/admin/admins/{id}` và `POST /api/v1/admin/admins/{id}/activate`: Super Admin khóa hoặc kích hoạt Admin trong cơ sở đang chọn; ghi audit log.
- [x] `GET /api/v1/admin/admins`: chỉ Super Admin xem danh sách Admin thuộc cơ sở đang chọn.
- [x] `POST /api/v1/customer/sales-sessions/logout`: đóng phiên chưa có order và xóa cookie; phiên có order chỉ được thoát sau khi thanh toán thành công.
- [x] Store, bàn, QR, cài đặt cửa hàng và ngưỡng cảnh báo bàn chờ lâu.
- [x] Catalog: category, menu item, tag, option group/value, ảnh Cloudinary và trạng thái bán.
- [x] Sales session, order Customer/Operator, bill, hủy session chưa có món và yêu cầu hủy món.
- [x] Chế biến: bàn chờ lâu, danh sách món cần làm và hoàn thành theo mẻ có idempotency.
- [x] Lưu `order_items.served_at` khi món được ghi nhận làm xong toàn bộ số lượng hiệu lực để phục vụ thống kê thời gian chờ ra món.
- [x] `GET /api/v1/customer/payments`: trả payment của phiên đang hoạt động hoặc payment PAID của chính phiên đã đóng để hiển thị kết quả thanh toán.
- [x] Payment, khoản chưa thanh toán, bill snapshot và xác nhận thanh toán thủ công.
- [x] Promotion: quản trị chương trình/code/target/quota, chọn promotion cho bill, discount snapshot và redemption.
- [x] Vận hành: dashboard Operator, service booking, sự cố vận hành, thông báo, audit log và tra cứu khách hàng Admin.
- [x] `GET /api/v1/admin/dashboard?from&to`: báo cáo doanh thu, session đã thanh toán, thời gian chờ ra món, sản lượng món bán và hao hụt làm lại theo store Admin; khoảng thời gian không có dữ liệu vẫn trả dashboard rỗng.
- [x] `GET /api/v1/admin/stores`: `SUPER_ADMIN` lấy danh sách cơ sở hiện có để chọn phạm vi quản trị; backend xác thực `X-CAS-Store-Id` trước khi dùng cơ sở đã chọn cho request Admin/Operator.
- [x] `GET`/`PUT /api/v1/admin/brand/settings`: chỉ `SUPER_ADMIN` quản lý tên, logo và slogan thương hiệu chung; từng cơ sở chỉ còn thông tin liên hệ, vị trí và giờ hoạt động.
- [x] `POST /api/v1/admin/admins`: Super Admin tạo Firebase user và tài khoản Admin cho cơ sở đang chọn bằng email, số điện thoại và họ tên; mật khẩu ban đầu giống Operator.

### Chưa hoàn thành

- [x] Dashboard Admin dùng một API báo cáo theo khoảng ngày cho doanh thu, khách hàng, menu/order và khuyến mãi; discount lấy từ snapshot `bill_discounts` của payment `PAID`.
- [x] Bổ sung integration test MySQL Testcontainers (cần Docker) chạy Flyway và kiểm tra mapper store/brand: dữ liệu cơ sở riêng, thương hiệu chung, public chỉ trả cơ sở `ACTIVE` và update theo `store_id`.
- [ ] Bổ sung/hoàn thiện unit test và integration test theo các luồng nghiệp vụ còn lại.

## 6. Frontend

- [x] Màn thanh toán thành công phân biệt đơn mang về và đơn tại bàn.

- [x] Nhóm chế biến Operator theo sales session; nút hoàn thành dùng được cho đơn tại bàn và mang về.

- [x] Ẩn trạng thái từ chối hủy trên dòng món Customer; kết quả vẫn được gửi qua thông báo.

- [x] Customer và Operator phân biệt đơn mang về trong luồng hủy món và chế biến; hoàn thành món theo từng sales session.

- [x] Operator nhập lý do từ chối hủy món; Customer tiếp tục thấy dòng món đã hủy và số lượng hủy, kể cả khi hủy một phần.

- [x] Trang đơn hàng Customer tiếp tục cập nhật hóa đơn khi tab không được chọn để nhận kết quả xử lý hủy món.

- [x] Admin chỉ xem thương hiệu chung với các trường bị khóa; Super Admin có thể sửa tên và slogan, API từ chối vai trò khác cập nhật.

- [x] Dropdown chọn cơ sở của Super Admin cập nhật sau đăng nhập, hiển thị cả khi chỉ có một cơ sở và báo lỗi tải danh sách.

- [x] Header Admin cập nhật đúng nhãn Super Admin sau khi đăng nhập, kể cả khi header đã được tạo trước đó.

- [x] Ổn định chuyển về trang đăng nhập sau đăng xuất Admin/Operator và bỏ qua kết quả kiểm tra phiên đã cũ.

- [x] Điều chỉnh vị trí thanh danh mục và khoảng cuộn trang thực đơn theo chiều cao header Customer `h-19`.

- [x] Hiển thị tên cơ sở bên dưới tên thương hiệu trong header Customer và Operator.

- [x] Header Customer, Operator và Admin dùng logo chữ SVG Bambu Garden và nền primary.

- [x] Dùng logo Bambu Garden cố định trên giao diện; tạm khóa tải và bỏ logo trong cài đặt thương hiệu, giữ dữ liệu logo đã lưu.

- [x] Làm mới dữ liệu quản trị khi Super Admin đổi cơ sở; khóa lưu cấu hình khi tải lỗi và báo lỗi tải thương hiệu chung.

- [x] Rà soát quyền và màn hình thông tin thương hiệu, cơ sở và Welcome của Admin/Super Admin; ghi nhận các sai lệch cần xử lý.

- [x] Thêm skeleton khi chuyển đến giỏ hàng, cài đặt, quét QR và thông tin bàn Customer.

- [x] Bỏ nút “Bắt đầu gọi món” trên header Customer; vẫn hiển thị số bàn khi có phiên tại bàn.

- [x] Super Admin có thể khóa và kích hoạt tài khoản Admin trong danh sách quản lý tài khoản.
- [x] Danh sách quản lý tài khoản của Super Admin hiển thị Admin cùng Operator theo cơ sở.
- [x] Nút tại trang đơn hàng Customer hiển thị “Xem hóa đơn và thanh toán”.
- [x] Chỉnh vùng cuộn và viền focus của ô nhập mã voucher để không bị cắt, lệch viền.
- [x] Header Customer ẩn tên chi nhánh khi chưa chọn cơ sở hoặc sau khi đăng xuất.
- [x] Cài đặt Customer có nút đăng xuất thay nút hủy phiên: đóng phiên chưa gọi món, chỉ thoát phiên có order khi đã thanh toán; xóa dữ liệu tạm và trở về trang chủ.
- [x] Màn quét QR hiển thị tên chi nhánh đúng trong danh sách và lựa chọn cơ sở.
- [x] Màn thanh toán Customer thành công có nút về trang chủ bên cạnh lựa chọn tạo đơn mới.
- [x] Trang quản lý tài khoản dùng toast chung cho kết quả tạo, khóa, kích hoạt và lỗi tải danh sách.
- [x] Dropdown chọn cơ sở của Super Admin chỉ hiển thị tên chi nhánh.
- [x] Header Customer và Operator hiển thị tên chi nhánh nhỏ bên phải tên thương hiệu theo cơ sở hiện tại.
- [x] Giao diện quản trị hiển thị Super Admin theo vai trò, cho phép chọn cơ sở trên màn hình nhỏ và chọn tạo Admin hoặc Operator tại trang quản lý nhân viên cho cơ sở được chọn.
- [x] Hoàn thiện ba khu vực Customer, Operator và Admin với Firebase route guard cho khu vực vận hành.
- [x] Customer: vào quán bằng QR/chọn chi nhánh, mở session, menu, giỏ hàng, order, hủy món, voucher, bill, thanh toán và thông báo.
- [x] Operator: dashboard, tạo order hộ, chế biến, xử lý yêu cầu hủy, thanh toán, khoản chưa thanh toán, service booking và catalog availability.
- [x] Admin: quản lý cửa hàng/bàn/QR, catalog, nhân sự, promotion, notification, audit log, khách hàng, sự cố và service booking.
- [x] Chi tiết khách hàng Admin hiển thị cả phiên mang về (`tableCode = null`), ghi nhãn “Mang về” và có empty state khi khách chưa có lịch sử phiên bàn.
- [x] Lịch sử khách hàng Admin ẩn UUID kỹ thuật, chỉ hiển thị trạng thái phiên tiếng Việt trong bảng.
- [x] Lịch sử khách hàng Admin nhóm theo từng phiên, hiển thị rõ số “Lần gửi order” cùng payment và khoản chưa thanh toán.
- [x] Lịch sử phiên khách hàng Admin dùng một header bảng nổi bật và các row dữ liệu hoàn chỉnh theo từng phiên.
- [x] Phiên chưa có order trong lịch sử khách hàng Admin hiển thị “Chưa gọi món” thay cho `0 lần`.
- [x] Danh sách khách hàng Admin dùng API tìm kiếm/phân trang theo server (`query`, `page`, `size`) và component `Pagination` dùng chung.
- [x] Dashboard `/admin`: UI bốn nhóm Doanh thu, Khách hàng, Menu & Order, Khuyến mãi; dùng dữ liệu minh họa cục bộ và có ghi chú về giới hạn `served_at`.
- [x] Bộ lọc ngày của dashboard Admin kiểm tra đủ ngày và thứ tự khoảng ngày ở frontend; chỉ tải lại báo cáo sau 250ms khi người dùng dừng chỉnh ngày, hủy request dashboard đang chạy khi khoảng ngày sai, giữ `period`, `from`, `to` trong URL và quay lại Dashboard từ menu vẫn dùng bộ lọc gần nhất trong phiên trình duyệt.
- [x] Tab Khách hàng của dashboard Admin dùng biểu đồ đường hai chuỗi cho thời gian chờ và sử dụng dịch vụ theo giờ.
- [x] Chuẩn hóa thiết kế dùng token màu global, font `Inter` qua `next/font/google`, toast dùng chung và panel Admin `rounded-sm`.
- [x] Nút `CasButton` primary dùng gradient theo theme: primary đến đen ở giao diện sáng và primary đến mint sáng hơn ở giao diện tối.
- [x] CTA chuẩn trong các luồng Customer dùng `CasButton`; control số lượng, lựa chọn và action gắn với input vẫn giữ giao diện chuyên biệt.
- [x] Đồng nhất font weight cho tab điều hướng dạng link và button bằng cách chỉ kế thừa `font-family` cho form control, không ghi đè utility `font-bold`.
- [x] Bỏ các dòng mô tả phụ ngay dưới tiêu đề trên toàn bộ page Admin; giữ nguyên hướng dẫn trong form, modal và section chức năng.
- [x] Hoàn thiện responsive, polling cần thiết, form validation, empty/loading/error state chính cho các luồng đã ghép API.
- [x] Giảm độ dày viền trạng thái bàn được chọn trong popup chọn bàn Operator: bỏ `ring-2`, giữ viền màu và nền nhạt.
- [x] Bỏ focus ring dư thừa ở hai ô đăng nhập Operator, giữ một viền primary khi focus.
- [x] Hiển thị tên cửa hàng cạnh logo ở form đăng nhập Operator và Admin; không hiển thị subtitle.
- [x] Chuyển lỗi tạo order, mở/hủy phiên của Operator và lỗi hủy phiên Customer sang toast dùng chung; không giữ thông báo lỗi inline sau thao tác thất bại.
- [x] Gửi món Customer khóa đồng bộ ngay từ lần bấm đầu để bỏ qua các lần nhấp liên tiếp; idempotency key được giữ lại khi gửi lỗi để lần thử lại an toàn.
- [x] Sau khi Customer gửi yêu cầu thanh toán, trang `/payment` chuyển sang trạng thái chờ nhân viên xác nhận và tự polling để hiện kết quả `PAID`.
- [x] Luồng Customer chọn loại đơn và nhập bàn/QR có nút quay lại rõ ràng, gồm quay lại trang chủ, bước chọn loại đơn và form đơn mang về.
- [x] CustomerHeader được đưa vào layout dùng chung để giữ tên/logo cửa hàng và trạng thái header khi chuyển giữa các trang Customer, tránh mount và tải lại không cần thiết.
- [x] Header Operator lấy tên/logo theo `storeId` được gán cho tài khoản vận hành, không dùng cơ sở khách hàng đã chọn trước đó.
- [x] Logo, tên và slogan hiển thị chung lấy từ thương hiệu hệ thống; Super Admin chỉnh một lần trong Settings, còn Admin chỉnh dữ liệu riêng của cơ sở được chọn.
- [x] Đổi `stores.name` thành `branch_name`; dữ liệu cơ sở được hiển thị cùng tên thương hiệu chung.
- [x] Catalog Customer luôn kiểm tra lại khi mở màn hình, đồng thời giỏ hàng tự bỏ món/tùy chọn không có trong thực đơn cơ sở hiện tại để không gửi ID từ cơ sở cũ sang phiên mới.

- [x] Bắt đầu rollout React Query cho GET: chuẩn hóa query key/hook cho catalog item, order, payment và table session Customer; bill Customer dùng cache RAM kèm polling, mutation tạo order invalidates bill/order cache, logout xóa cache tài khoản.

## 7. Hạ tầng và triển khai

- [x] Có Docker Compose production, Cloudinary, Firebase health indicator, cấu hình Next Image và formatter chung (`scripts/format.ps1`).
- [x] Chốt GitHub Actions làm nền tảng CI/CD và VPS là mục tiêu triển khai production.
- [ ] Tạo pipeline CI chạy build, test và migration.
- [ ] Chốt cấu hình VPS, logging/monitoring, backup/restore MySQL và thử nghiệm triển khai tại cửa hàng.

## 8. Việc tiếp theo

1. Chốt định nghĩa báo cáo Admin, dữ liệu nguồn, bộ lọc và API contract; phân tách hao hụt dựa trên `is_remade`.
2. Ghép dashboard Admin và các phần còn dùng mock với API/dữ liệu production.
3. Hoàn thiện kiểm thử đơn vị, tích hợp, regression và luồng triển khai CI/CD.
4. Chốt nghiệp vụ đầu/cuối ca, đối soát tiền mặt và xử lý chênh lệch trước khi xây module vận hành theo ca.
5. Chuẩn bị cấu hình production, quan sát hệ thống, sao lưu và pilot tại cửa hàng.

### React Query cache rollout

- [ ] Roll out React Query for every frontend GET in phases: Customer/catalog/order/payment/table session first, then Operator and Admin. Standardize query keys, invalidate after mutations, retain polling only for live screens, and clear user-scoped cache on logout or store change.
- [x] Chuyển các GET live của Operator (dashboard, cảnh báo bàn chờ lâu, sơ đồ bàn/bill, chi tiết order, catalog availability, tạo order hộ, payment/unpaid, chế biến và service booking) cùng Dashboard, sự cố, Catalog, quản lý Operator và Customers của Admin sang React Query; mutation liên quan invalidates cache dùng chung.
- [x] Super Admin gắn `X-CAS-Store-Id` từ scope cơ sở đã chọn ngay từ request Admin/Operator đầu tiên sau khi tải lại trang; khi đăng xuất hoặc đăng nhập không phải Super Admin, scope này được xóa.

## 9. Tài liệu liên quan

- [Tổng quan hệ thống](OVERALL.md)
- [Luồng nghiệp vụ](BUSINESS_FLOWS.md)
- [Thiết kế database](DATABASE_DESIGN.md)
- [Các trường hợp biên](EDGE_CASES.md)

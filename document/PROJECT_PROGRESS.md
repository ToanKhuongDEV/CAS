# CAS — Theo dõi tiến độ dự án


- 2026-11-11: Đồng bộ kiểm thử giỏ hàng với khoảng an toàn cho thanh điều hướng Android.
- 2026-11-11: Đổi các tiêu đề và nội dung hiển thị CAS sang Bambu Garden, giữ nguyên tên kỹ thuật.
- 2026-11-11: Đổi tên PWA và tiêu đề mặc định thành Bambu Garden.
- 2026-11-11: Hoàn tất duyệt Splash và khôi phục tự chuyển vào ứng dụng khi trang tải xong.
- 2026-11-11: Tăng nhẹ kích thước và nâng dấu tích cạnh logo Splash.
- 2026-11-11: Cập nhật dòng giới thiệu trên cùng của màn Splash.
- 2026-11-11: Khôi phục dấu tích nét viền bo mềm tự vẽ trên màn Splash.
- 2026-11-11: Dùng biểu tượng dấu tích viền có sẵn của Phosphor cho màn Splash.
- 2026-11-11: Làm mềm các góc dấu tích nét viền cạnh logo Splash.
- 2026-11-11: Đổi dấu tích cạnh logo Splash thành nét viền, trong suốt bên trong.
- 2026-11-11: Điều chỉnh dấu tích cạnh logo Splash thành nét bo đậm, không có nền.
- 2026-11-11: Bỏ dấu ngoặc kép ở slogan và đổi biểu tượng cạnh logo Splash thành dấu tích.
- 2026-11-11: Rà soát convention màn Splash và bổ sung thông tin tiến độ cho trình đọc màn hình.
- 2026-11-11: Bỏ dòng “Ẩm thực hương sắc Việt” khỏi màn Splash.
- 2026-11-11: Cập nhật các nhãn giới thiệu trên màn Splash.
- 2026-11-11: Bỏ dòng giới thiệu đồng bộ thực đơn khỏi màn Splash.
- 2026-11-11: Đồng bộ kiểu chữ, cỡ chữ và màu của tên Bambu Garden trên Splash.
- 2026-11-11: Tạm giữ màn Splash ở 100% để xem trước giao diện.
- 2026-11-11: Cập nhật giao diện Splash theo thiết kế Bambu Garden và bổ sung token màu dùng chung.
- 2026-11-11: Đổi tên thương hiệu dự phòng thành Bambu Garden và bỏ email CAS mẫu khi thiếu dữ liệu cửa hàng.
- 2026-11-11: Thêm màn hình chờ khi mở web và PWA, hoàn tất tiến trình sau khi trang tải xong.
- 2026-11-11: Chuyển tên cơ sở trên header khách hàng vào biểu tượng địa chỉ; slogan hiển thị tối đa hai dòng.
- 2026-11-11: Update PWA system bar colors and safe-area spacing.
Ngày cập nhật gần nhất: 2026-11-10

- 2026-11-10: Thống nhất viền focus cho các ô nhập và lựa chọn, giữ chỉ báo focus khi dùng bàn phím.
- 2026-11-10: Super Admin tạo chi nhánh trống, sao chép thực đơn vào chi nhánh chưa có thực đơn; sửa luồng nhập mã QR bàn không hỏi lại hình thức dùng bữa.
- 2026-11-10: Đồng bộ seed demo với schema Flyway, giữ thông tin thương hiệu.
- 2026-11-10: Cấu hình rewrite Vercel cho API /api/v1 và sửa lỗi build Next.js khi đọc tham số URL.
- 2026-11-06: Chuẩn bị Docker multi-stage và cổng chạy backend cho Render.
- 2026-11-06: Đưa cấu trúc cuối cùng vào các lệnh tạo bảng của baseline Flyway.
- 2026-11-06: Sửa lỗi trùng khóa ngoại khi tạo baseline Flyway.
- 2026-11-06: Hợp nhất migration Flyway V1–V10 thành một baseline cho cơ sở dữ liệu mới.
- 2026-11-06: Badge thông báo và số việc chờ trên header/menu Operator dùng số đỏ và nhấp nháy nhẹ.
- 2026-11-06: Đồng bộ màu nút thông báo, tài khoản và đổi giao diện trên header Operator với Admin.
- 2026-11-06: Badge thông báo Customer dùng màu và hiệu ứng giống badge giỏ hàng.
- 2026-11-06: Số trên badge giỏ hàng Customer dùng màu lỗi có sẵn.
- 2026-11-06: Badge số lượng giỏ hàng trên header Customer nhấp nháy nhẹ khi có món.
- 2026-11-06: Thay hai hình nền Customer lớn bằng nhiều hình nhỏ di chuyển nhẹ.
- 2026-11-06: Đồng bộ mục đang chọn trên menu ngang Customer với vị trí cuộn tới danh mục món.
- 2026-11-06: Thêm các hình xanh mờ chuyển động nhẹ trên nền các trang Customer; tôn trọng cài đặt giảm chuyển động.
- 2026-11-06: Áp dụng nền kẻ ô của trang chủ cho các trang Customer qua layout chung.
- 2026-11-06: Ô nhập giá trị option và giá thêm dùng một viền khi focus.
- 2026-11-06: Lỗi thao tác tạo, sửa và xóa nhóm/giá trị option Admin dùng toast; không chèn lỗi trùng tên vào trang.
- 2026-11-06: Đồng bộ toast lỗi Admin/Operator với Customer; chuyển lỗi thao tác hủy món, thanh toán, điều chỉnh hóa đơn và báo cáo sự cố Operator sang toast.
- 2026-11-06: Báo rõ tên option bị trùng trong cùng nhóm khi Admin tạo hoặc sửa giá trị option.
- 2026-11-06: Toast lỗi Customer chỉ hiển thị nội dung lỗi, bỏ dòng tiêu đề “Có lỗi xảy ra”.
- 2026-11-06: Xóa thông báo cũ trên header Customer khi phiên bàn không còn hợp lệ; tránh toast yêu cầu đăng nhập khi đánh dấu thông báo của phiên đã kết thúc.
- 2026-11-06: Form tạo nhóm option chỉ hiển thị giới hạn tối thiểu và tối đa khi chọn nhiều; chọn một dùng giới hạn mặc định 0–1.
- 2026-11-06: Đổi thông báo kết quả hủy có làm lại trên màn Customer thành “Đồng ý hủy, món đang được làm lại”.
- 2026-11-06: Bill Customer cho biết yêu cầu hủy gần nhất có làm lại; màn order hiển thị rõ kết quả làm lại. Form tạo nhóm option dùng một viền khi focus.
- 2026-11-06: Chuyển phản hồi duyệt/từ chối hủy món Operator sang toast; thông báo Customer nêu rõ khi món được làm lại. Trạng thái trên dòng món Customer chưa phân biệt làm lại.
- 2026-11-05: Cho phép Operator ghi nhận hủy hoặc làm lại món đã chế biến do sự cố trong phiên OPEN; số lượng đang chờ hủy không thể hủy trùng.
- 2026-11-05: Chốt không hỗ trợ đổi ưu tiên chế biến, giữ cách hiển thị nguồn order và chấp nhận cơ chế idempotency hiện tại; vận hành theo ca chưa triển khai. Các loại report vẫn chờ quyết định.
- 2026-11-05: Đối chiếu các nghiệp vụ còn cần chốt với mã: màn Báo cáo dùng dữ liệu mẫu; chế biến có FIFO và lưu idempotency trong database; duyệt yêu cầu hủy cho phép xử lý phần đã làm, còn hủy sự cố chỉ cho số lượng chưa làm. Chưa thấy chức năng đổi ưu tiên hoặc vận hành theo ca; chi tiết order chưa hiển thị nguồn tạo.
- 2026-11-04: Rà soát tài liệu tiến độ, các mục chưa hoàn thành và quyết định nghiệp vụ còn cần chốt; ghi nhận cần đối chiếu các mô tả dashboard và hạ tầng chưa đồng bộ giữa các tài liệu.
- 2026-11-04: Cho phép Admin/Super Admin chọn ngày thanh toán, sửa hoặc xóa điều chỉnh sau thanh toán, ghi audit trước/sau và giữ tổng tối thiểu 0. Unit test backend và frontend đạt; integration test MySQL bị bỏ qua do không có Docker.

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

### Các api đã làm

- [x] Các GET `/api/v1/customer/catalog` nhận `storeId` tùy chọn để xem menu công khai theo cơ sở; phiên khách hợp lệ luôn được ưu tiên.

- [x] `POST /api/v1/admin/stores`: Super Admin tạo chi nhánh trống với thông tin liên hệ và giờ hoạt động.
- [x] `POST /api/v1/admin/stores/{targetStoreId}/menu-copy`: Super Admin sao chép danh mục, món, nhãn và tùy chọn vào chi nhánh chưa có thực đơn, dùng chung ảnh.
- [x] `POST /api/v1/admin/catalog/option-groups/{id}/values` và `PUT /api/v1/admin/catalog/option-values/{id}`: trả 409 kèm tên option khi trùng trong cùng nhóm.
- [x] `GET /api/v1/customer/orders/bill`: mỗi món trả thêm `latestCancellationIsRemade` của yêu cầu hủy gần nhất.
- [x] `POST /api/v1/operator/cancellation-requests/incidents`: hỗ trợ món đã chế biến trong phiên OPEN và kiểm tra số lượng đã hủy hoặc đang chờ hủy.
- [x] Danh sách payment Operator và Admin trả tên khách mở phiên và số điện thoại đã che theo snapshot của phiên.

- [x] `GET /api/v1/admin/payments?from=YYYY-MM-DD&to=YYYY-MM-DD`: Admin/Super Admin xem payment đã thanh toán theo khoảng ngày xác nhận và cơ sở đang chọn; Operator chỉ xem ngày hiện tại qua API riêng.

- [x] `PUT /api/v1/admin/payments/{id}/adjustments`: Admin/Super Admin thêm, sửa hoặc xóa điều chỉnh của payment đã thanh toán; cập nhật tổng, snapshot và audit trước/sau trong cùng transaction.

- [x] `GET /api/v1/admin/dashboard`: đếm sales session có order theo ngày tạo cho báo cáo khách hàng, không phụ thuộc thanh toán; giữ số phiên đã thanh toán hiện có.

- [x] API `GET /api/v1/operator/preparation/pending-table-count` đếm phiên còn món chờ, gồm tại bàn và mang về, phục vụ badge Đơn gọi món.

- [x] `GET /api/v1/operator/sales-sessions/{sessionId}/bill-adjustments`: xem các điều chỉnh đã lưu.
- [x] `GET /api/v1/customer/bill-adjustments`: lấy điều chỉnh của phiên khách.
- [x] `POST /api/v1/operator/payments/{id}/confirm`: nhận `billSnapshot` đang xem và các thay đổi điều chỉnh; lưu cùng xác nhận trong một transaction, từ chối khi snapshot đã đổi.

### API và nghiệp vụ đã hoàn thành

- [x] `POST /api/v1/customer/payments` và `POST /api/v1/operator/sales-sessions/{sessionId}/payments`: trả 409 và bỏ lựa chọn khuyến mãi không còn khả dụng trước khi tạo payment.
- [x] `POST /api/v1/admin/promotions`, `PUT /api/v1/admin/promotions/{id}`: kiểm tra mã trùng theo cơ sở và trả tên mã bị trùng, kể cả khi phát sinh đồng thời.
- [x] `PUT /api/v1/admin/promotions/{id}`: cập nhật hạn mức giữ nguyên ID mã, không giảm dưới lượt đã dùng/giữ chỗ; xóa mềm mã và giữ lịch sử kể cả khi đã sử dụng.

- [x] API chế biến Operator tiếp tục hiển thị và hoàn thành món chưa làm của phiên chờ thanh toán hoặc đã đóng; dashboard Admin tính thời gian chờ theo ngày gọi món, không phụ thuộc thanh toán.

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

- Điều chỉnh hóa đơn: Operator được thêm nhiều khoản trước khi xác nhận; Admin/Super Admin được thêm, sửa, xóa điều chỉnh sau thanh toán. Điều chỉnh là bước cuối sau khuyến mãi, tổng được giữ tối thiểu 0 đồng. Luồng Operator tạo yêu cầu thanh toán hộ nằm tại màn hình Kiểm soát thanh toán.

- [x] Điều chỉnh hóa đơn tạm thời khi xác nhận payment; tính tiền sau khuyến mãi, cập nhật snapshot payment, ghi audit và từ chối xác nhận với snapshot cũ.

- [ ] Chạy integration test MySQL cho cập nhật hạn mức và xóa mềm mã voucher khi Docker sẵn sàng.

- [ ] Chạy integration test MySQL cho điều chỉnh tăng/giảm, snapshot payment và xác nhận hóa đơn đã thay đổi khi Docker sẵn sàng.

- [x] Món chưa chế biến xong vẫn xuất hiện và có thể hoàn thành sau khi yêu cầu hoặc xác nhận thanh toán.
- [x] Dashboard Admin dùng một API báo cáo theo khoảng ngày cho doanh thu, khách hàng, menu/order và khuyến mãi; discount lấy từ snapshot `bill_discounts` của payment `PAID`.
- [x] Bổ sung integration test MySQL Testcontainers (cần Docker) chạy Flyway và kiểm tra mapper store/brand: dữ liệu cơ sở riêng, thương hiệu chung, public chỉ trả cơ sở `ACTIVE` và update theo `store_id`.
- [ ] Bổ sung/hoàn thiện unit test và integration test theo các luồng nghiệp vụ còn lại.

## 6. Frontend

- [x] Màn hình kiểm soát thanh toán tự làm mới danh sách phiên và hóa đơn đang chọn mỗi 10 giây, giữ dữ liệu gần nhất khi tải lỗi.

- [x] Phân tách cache menu Customer theo cơ sở và phiên; gửi mã cơ sở khi tải menu công khai.

- [x] Đồng bộ danh sách yêu cầu hủy Operator mỗi 10 giây, giữ dữ liệu gần nhất khi tải lỗi; dừng polling thanh toán Customer sau khi hoàn tất và chỉ polling bill khi có phiên.

- [x] Sửa tab danh mục thực đơn bị chọn nhầm mục trước khi cuộn xuống danh mục đã nhấn.

- [x] Căn popup cơ sở của Operator theo cạnh phải biểu tượng vị trí, giống Customer.

- [x] Cập nhật biểu tượng thùng rác dùng chung với kiểu bo tròn, đồng bộ trên các màn hình.

- [x] Căn kích thước biểu tượng tài khoản và thu hẹp khoảng cách nút trên header Operator.

- [x] Thêm biểu tượng vị trí trên header Operator, hiển thị chi nhánh gắn với tài khoản như giao diện Customer.

- [x] Bỏ nền và viền mặc định của nút thông báo và tài khoản trên header Operator, đồng bộ với giao diện Customer.

- [x] Thêm tab Cài đặt cho Operator và chuyển nút đổi giao diện sáng/tối vào trang này; giữ giao diện đã chọn khi chuyển trang.

- [x] Đồng bộ màu nút đổi giao diện và tài khoản ở header Admin với mẫu Stitch bằng token màu hiện có.

- [x] Bộ lọc ngày màn Thanh toán Admin có lựa chọn nhanh như Dashboard và lưu khoảng ngày trên URL.

- [x] Card payment hiển thị tên và số điện thoại đã che cạnh nhãn bàn hoặc mang về; đơn mang về dùng màu secondary.

- [x] Làm mới nội dung màn Thanh toán Admin theo Stitch: nhóm bộ lọc, khoảng ngày và thẻ payment; giữ header, menu và các thao tác hiện có.

- [x] Dòng thương hiệu, cơ sở và số bàn trên hóa đơn dùng cỡ chữ, độ đậm như tiêu đề hóa đơn.

- [x] Hóa đơn in tên thương hiệu viết hoa cùng tên cơ sở; số bàn căn giữa và in đậm.

- [x] Hóa đơn thanh toán hiển thị tên thương hiệu và chi nhánh từ thông tin cửa hàng.

- [x] Nút Sửa điều chỉnh hóa đơn đóng form khi bấm lại; mở form thêm mới không giữ dữ liệu sửa trước đó.

- [x] Admin/Super Admin có thể thêm điều chỉnh cho payment đã thanh toán, kể cả khi hóa đơn chưa có điều chỉnh.

- [x] Màn Thanh toán Admin/Super Admin chọn khoảng ngày để xem và điều chỉnh payment đã thanh toán.

- [x] Đưa Thanh toán thành tab riêng trên menu ngang của Admin và Super Admin.

- [x] Căn số tiền điều chỉnh về cột phải của hóa đơn, đặt thao tác sửa/xóa cạnh lý do.

- [x] Tự thu gọn form sau khi thêm điều chỉnh hóa đơn; bấm lại nút điều chỉnh để nhập thêm.

- [x] Dùng helper định dạng tiền chung `10.000 ₫` cho các giá trị tiền hiển thị trên Customer, Operator và Admin.

- [x] Đồng bộ định dạng tiền giảm giá trên màn thanh toán, không có khoảng trắng trước ký hiệu `đ`.

- [x] Ẩn dòng giảm giá bằng 0 trên màn thanh toán Customer và hóa đơn Operator.

- [x] Hiển thị số tiền promotion được giảm với dấu trừ và màu lỗi trên màn thanh toán.

- [x] Căn cột tên món, số lượng × đơn giá, thành tiền và giá topping trên màn xác nhận thanh toán và bill in.

- [x] Thêm khoảng cách phía trên chi tiết thanh toán trong form tạo yêu cầu thanh toán Operator.

- [x] Đưa điều chỉnh hóa đơn Operator vào ngay trước tổng thanh toán, thu gọn và mở bằng nút.

- [x] Đặt giá trị giảm mặc định theo đơn vị khi chuyển loại promotion: 20% hoặc 20.000đ.

- [x] Nút bắt đầu gọi món ở trang chủ tiếp tục phiên Customer đang mở hoặc chuyển tới thanh toán nếu phiên đang chờ thanh toán.

- [x] Giới hạn mô tả món trong menu Customer tối đa hai dòng.

- [x] Thu hẹp khoảng cách giữa mô tả và giá món trong menu Customer.

- [x] Giảm bo góc ảnh món và khoảng cách giữa hai cột menu Customer.

- [x] Menu Customer hiển thị hai món mỗi hàng và giữ từng danh mục trong lưới riêng.

- [x] Thẻ món trong menu Customer bỏ nền, dùng ảnh vuông toàn chiều rộng và đưa thông tin, thao tác xuống dưới ảnh.

- [x] Khi yêu cầu thanh toán gặp khuyến mãi không còn khả dụng, thông báo và tải lại danh sách khuyến mãi để chọn lại.

- [x] Thêm hướng dẫn giới hạn lượt chung và lượt riêng từng mã trong form khuyến mãi.

- [x] Bỏ viền focus chồng lớp trên các ô trong form khuyến mãi, giữ viền primary khi được chọn.

- [x] Form khuyến mãi dùng ô mã và số lượt để thêm từng mã hoặc nhóm mã phân tách bằng dấu phẩy; báo rõ mã trùng và giữ dữ liệu khi lưu thất bại.

- [x] Voucher công khai hết lượt sử dụng hiển thị “Hết mã” thay cho “Chưa đủ điều kiện”.

- [x] Thêm hiệu ứng viền đỏ chuyển động cho lựa chọn voucher trên trang thanh toán Customer.

- [x] Thêm họa tiết nhẹ cùng tông màu vào header Customer, không cản thao tác.

- [x] Phân biệt thông báo số phần chế biến vượt mức còn lại và số phần nhỏ hơn 1.

- [x] Hiển thị thông báo tiếng Việt khi Operator nhập số phần chế biến vượt số lượng còn lại.

- [x] Sau khi Operator tạo yêu cầu thanh toán, đóng form và cập nhật danh sách phiên đang mở để tiếp tục thao tác.

- [x] Bổ sung khung góc và vệt sáng chuyển động cho camera quét QR; tôn trọng cài đặt giảm chuyển động.

- [x] Trang Scan hiển thị liên hệ phục vụ theo số điện thoại cơ sở đang chọn.

- [x] Đặt ô số bàn và mã QR cạnh nhau trên trang Scan, kể cả màn hình mobile.

- [x] Chỉnh lại trang Scan theo thiết kế Stitch: chuyển chế độ quét hoặc nhập thủ công, khung camera và khối nhập chi tiết dùng màu, font và header hiện có.

- [x] Trang Start yêu cầu chọn chi nhánh trước khi tiếp tục chọn bàn.

- [x] Số bước trên trang Start hiển thị 1/2 khi ăn tại quán và 1/1 khi mang về.

- [x] Bỏ thông báo trình duyệt không hỗ trợ quét QR tự động trên trang Scan.

- [x] Menu tài khoản vận hành hiển thị tên và vai trò từ tài khoản CAS hiện tại; bỏ tên mặc định ADMIN Master.

- [x] Lời chào trang bắt đầu gọi món dùng tên thương hiệu trả về từ API, không dùng tên thương hiệu mặc định khi chưa tải được dữ liệu.

- [x] Bổ sung nội dung hướng dẫn, bước thực hiện và thông tin cơ sở thực tế trên màn bắt đầu gọi món và xác nhận bàn.

- [x] Làm mới bố cục chọn hình thức phục vụ và xác nhận bàn theo thiết kế Stitch, giữ header, font và màu hiện có.

- [x] Trang bắt đầu gọi món Customer hiển thị slogan thương hiệu từ dữ liệu cửa hàng như header Customer.

- [x] Giao diện xác nhận payment giữ điều chỉnh tạm, cho xóa trước khi xác nhận và gửi toàn bộ thay đổi cùng request xác nhận; Customer thấy điều chỉnh đã lưu trước tổng thanh toán.

- [x] Đồng bộ header Operator, Admin và Super Admin với logo, slogan và cơ sở tương ứng; không hiển thị số bàn.

- [x] Ưu tiên tải các ảnh món đầu tiên trong danh mục hiển thị của thực đơn để tránh tải trễ ảnh LCP.

- [x] Thêm nhãn “Cơ sở” trước tên chi nhánh trong header Customer.

- [x] Tăng cỡ chữ Customer trên mobile cho menu, điều hướng, giỏ hàng, hóa đơn, thông báo và biểu mẫu; cho các khu vực hẹp co giãn, xuống dòng.

- [x] Header Customer hiển thị slogan thương hiệu thay tên và số bàn đang dùng bên trái chuông thông báo.

- [x] Tăng độ đậm chữ GARDEN trong SVG logo Bambu Garden.

- [x] Tăng kích thước logo header lên cao 66px và giữ tỷ lệ khung logo.

- [x] Hiển thị logo Bambu Garden màu trắng trên nền header, không thêm nền riêng cho logo.

- [x] Cập nhật logo Bambu Garden và favicon theo tệp thương hiệu mới cho web, Android và iOS.

- [x] Bỏ nhãn “Món đã gọi” khỏi tiêu đề trang đơn hàng Customer.

- [x] Bỏ nhãn “Tùy chỉnh” khỏi tiêu đề trang cài đặt Customer.

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
- [x] Dashboard Admin và Super Admin báo lỗi và khôi phục ngày đã chọn trước đó khi khoảng ngày không hợp lệ; không gọi API cho khoảng sai.
- [x] Tab Khách hàng của dashboard Admin dùng biểu đồ đường hai chuỗi cho thời gian chờ và số phiên theo ngày; khoảng lề và độ rộng trục dọc đồng nhất với biểu đồ doanh thu.
- [x] Biểu đồ thời gian chờ nối các ngày có dữ liệu khi xen giữa là ngày không có món hoàn thành.
- [x] Dashboard hiển thị thời gian chờ với một chữ số thập phân trong chỉ số tổng và tooltip biểu đồ.
- [x] Dashboard Admin dùng nhãn “phiên khách” thay cho “session”.
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

- Rà soát ngày 2026-11-02: ưu tiên kiểm thử các luồng cốt lõi và hoàn thiện điều chỉnh bill sau khi chốt nghiệp vụ; cần đối chiếu lại mục dashboard dùng mock vì frontend hiện gọi API dashboard.

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

- 2026-11-03: Điều chỉnh dữ liệu mock MySQL dev cho 24 dòng món chờ quá 60 phút; đối chiếu thời gian hoàn tất, yêu cầu hủy và phiên liên quan. Sau điều chỉnh không còn dòng chờ âm hoặc quá 60 phút.

- 2026-11-03: Điều chỉnh thời gian phục vụ mock ngày 30/10 cho phiên 24 và lần hoàn tất liên quan; các dòng món trong ngày không còn thời gian chờ âm hoặc quá 60 phút.

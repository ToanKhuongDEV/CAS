# CAS

CAS là ứng dụng giúp quán ăn, quán nước số hóa việc gọi món tại bàn và ghi nhận trạng thái thanh toán.

Khách chỉ cần quét QR ở bàn, xem menu trên điện thoại, chọn món và gửi order. Khi tạo yêu cầu thanh toán, khách bắt buộc ra gặp nhân viên. Nhân viên nhìn thấy yêu cầu trên màn hình vận hành, xác minh chuyển khoản thành công qua loa báo giao dịch (“ting ting”), sau đó bấm xác nhận thanh toán thành công.

## Công nghệ

- Backend: Java 21, Spring Boot và Maven.
- Truy cập dữ liệu: MyBatis.
- Dữ liệu và hạ tầng: MySQL, Redis và Flyway.
- Hỗ trợ phát triển: Lombok và Jakarta Bean Validation.
- Frontend: Next.js, React và TypeScript.

## Khởi chạy môi trường phát triển

Môi trường phát triển chạy backend, frontend và MySQL cục bộ. Redis dùng Redis
Cloud; cấu hình kết nối chỉ đặt trong `backend/.env` local và không được commit.

Chạy backend:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

Chạy frontend trong terminal khác:

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend status: `http://localhost:8080/api/v1/status`
- Backend health: `http://localhost:8080/actuator/health`

## Format code

Run the shared formatter from the project root:

```powershell
.\scripts\format.ps1
```

Validate formatting without modifying files:

```powershell
.\scripts\format.ps1 -Check
```

## CAS giúp quán giải quyết gì?

- Giảm việc ghi order bằng giấy hoặc nhập tay nhiều lần.
- Hạn chế nhầm món, sai bàn, sai giá.
- Khách gọi món nhanh hơn bằng điện thoại cá nhân.
- Nhân viên theo dõi được bàn nào đã gọi món, bàn nào đang chờ thanh toán.
- Theo dõi rõ yêu cầu nào đang chờ và đã được nhân viên xác nhận thanh toán.
- Lưu lại lịch sử order và thanh toán để kiểm tra khi có vấn đề.

## Các chức năng chính

### Gọi món bằng QR tại bàn

Mỗi bàn có một mã QR cố định. Khách quét QR để mở menu đúng bàn của mình.

Người đầu tiên mở bàn cần nhập tên và số điện thoại để quán biết ai là người đại diện phiên bàn. Thông tin này được lưu riêng cho khách hàng, tách khỏi tài khoản nhân viên/admin của quán. Những người quét QR sau ở cùng bàn sẽ vào thẳng menu, không cần nhập lại thông tin.

Khách có thể:

- Xem danh mục món.
- Xem giá, hình ảnh và trạng thái còn/hết món.
- Chọn món, chọn size/topping nếu có.
- Gửi order.
- Gọi thêm món nhiều lần trong cùng phiên ngồi.

Mỗi lần khách gửi món sẽ được lưu thành một order riêng, giúp quán dễ theo dõi từng lần gọi.

### Quản lý menu

Quán có thể quản lý:

- Danh mục món.
- Tên món, mô tả, giá.
- Hình ảnh món.
- Trạng thái còn món, hết món hoặc tạm ẩn.
- Các lựa chọn như size, topping, độ ngọt.

Size, topping và các lựa chọn có tính tiền cũng được quản lý như `menu_items` thuộc category loại `OPTION`. Món chính liên kết tới các option được phép chọn thông qua nhóm lựa chọn.

Giá gốc của món và giá từng option đã chọn được giữ lại theo thời điểm khách đặt. Nếu sau đó quán đổi giá menu, order cũ vẫn không bị thay đổi.

### Quản lý bàn và QR

Quán có thể tạo và quản lý danh sách bàn. Mỗi bàn có QR riêng để khách gọi món đúng bàn.

Nếu nhiều người cùng bàn quét QR, tất cả vẫn dùng chung một phiên bàn và nhìn thấy cùng danh sách order. Chỉ người đầu tiên mở phiên bàn cần nhập tên và số điện thoại.

### Xử lý order

Nhân viên có thể xem các order khách gửi lên, biết món nào được gọi, số lượng bao nhiêu và ghi chú chung của lần gọi món.

Phạm vi hiện tại tập trung vào tiếp nhận order và thanh toán; hệ thống chưa tách riêng màn hình bếp/phục vụ và chưa theo dõi trạng thái chế biến từng món.

### Yêu cầu hủy món

Nếu khách muốn hủy món, hệ thống ghi nhận yêu cầu hủy. Nhân viên sẽ đồng ý hoặc từ chối.

Nếu đồng ý, hệ thống tính lại tiền từ số lượng còn lại nhưng không sửa hoặc xóa dòng món gốc. Nếu từ chối, tổng tiền không thay đổi.

### Yêu cầu và xác nhận thanh toán

Khi khách yêu cầu thanh toán, backend tạo một payment `PENDING`. Số tiền được backend tính từ tổng `orders.payable_amount` của phiên bàn, không lấy từ dữ liệu client. Giao diện thông báo khách bắt buộc ra gặp nhân viên để hoàn tất thanh toán.

Nhân viên mở yêu cầu trên màn hình vận hành. Sau khi khách chuyển khoản và loa báo giao dịch (“ting ting”) xác nhận tiền đã vào, nhân viên bấm xác nhận thanh toán thành công. Hệ thống chuyển payment sang `PAID` và đóng phiên bàn.

CAS không tạo QR thanh toán, không lưu thông tin ngân hàng hoặc dữ liệu giao dịch và không tích hợp với loa báo giao dịch. Việc xác minh chuyển khoản do nhân viên thực hiện ngoài CAS; hệ thống chỉ ghi nhận payment `PENDING` hoặc `PAID` phục vụ vận hành.

## Tài liệu dự án

- [Theo dõi tiến độ](document/PROJECT_PROGRESS.md)
- [Tổng quan hệ thống](document/OVERALL.md)
- [Luồng nghiệp vụ](document/BUSINESS_FLOWS.md)
- [Thiết kế database](document/DATABASE_DESIGN.md)
- [Các trường hợp biên](document/EDGE_CASES.md)

## Các tình huống đặc biệt

### Khách gọi thêm món

Khách có thể gọi thêm món trong khi phiên bàn còn mở. Mỗi lần gọi thêm sẽ tạo một order mới trong cùng phiên bàn.

### Khách yêu cầu thanh toán rồi muốn gọi thêm

Khi đã yêu cầu thanh toán, phiên bàn không nhận thêm món và vẫn chiếm dụng bàn. Chỉ sau khi phiên được đóng mới có thể tạo phiên mới cho cùng bàn.

### Yêu cầu chưa được xác nhận

Nếu nhân viên chưa xác nhận, payment vẫn ở trạng thái `PENDING` và phiên bàn giữ trạng thái `PAYMENT_PENDING`.

Nếu cần đóng bàn khi chưa xác nhận payment, nhân viên ghi nhận chưa thanh toán. Hệ thống giữ payment `PENDING`, tạo `unpaid_records` và đóng phiên bàn.

### Khách rời đi trước khi thanh toán

Nếu khách đã gọi món nhưng rời đi trước khi tạo yêu cầu thanh toán, hệ thống vẫn còn dữ liệu order và giá món đã gọi.

Backend tạo một payment `PENDING` với số tiền lấy từ tổng đơn hàng, đồng thời lưu `unpaid_records` cùng bill snapshot để ghi nhận phiên chưa thanh toán rồi đóng bàn.

### Xác nhận sau khi đã ghi nhận chưa thanh toán

Nhân viên xác nhận chính payment `PENDING` của phiên, không tạo payment mới. Hệ thống chuyển payment sang `PAID` và `unpaid_records` sang `RESOLVED`.

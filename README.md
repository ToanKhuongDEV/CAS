# CAS

CAS là ứng dụng giúp quán ăn, quán nước số hóa việc gọi món tại bàn và thanh toán chuyển khoản.

Khách chỉ cần quét QR ở bàn, xem menu trên điện thoại, chọn món và gửi order. Nhân viên nhìn thấy order ở màn hình vận hành, xử lý món, tạo mã VietQR để khách chuyển khoản và xác nhận khi đã nhận đúng tiền.

## Công nghệ

- Backend: Java 21, Spring Boot và Maven.
- Truy cập dữ liệu: MyBatis.
- Dữ liệu và hạ tầng: MySQL, Redis và Flyway.
- Hỗ trợ phát triển: Lombok và Jakarta Bean Validation.
- Frontend: Next.js, React và TypeScript.

## Khởi chạy môi trường phát triển

Khởi động MySQL và Redis:

```bash
docker compose up -d mysql redis
```

Chạy backend:

```bash
cd backend
mvn spring-boot:run
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

## CAS giúp quán giải quyết gì?

- Giảm việc ghi order bằng giấy hoặc nhập tay nhiều lần.
- Hạn chế nhầm món, sai bàn, sai giá.
- Khách gọi món nhanh hơn bằng điện thoại cá nhân.
- Nhân viên theo dõi được bàn nào đã gọi món, bàn nào đang chờ thanh toán.
- Thanh toán chuyển khoản rõ ràng hơn nhờ mã chuyển khoản riêng cho từng lần thanh toán.
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

### Thanh toán bằng VietQR

Khi khách yêu cầu thanh toán, nhân viên tạo mã VietQR trên màn hình vận hành.

VietQR có:

- Tài khoản ngân hàng của quán.
- Số tiền cần thanh toán.
- Nội dung chuyển khoản riêng cho lần thanh toán đó.

Khách chuyển khoản xong, nhân viên kiểm tra app ngân hàng. Chỉ khi đúng số tiền và đúng nội dung chuyển khoản, nhân viên mới xác nhận đã thanh toán.

Hệ thống chưa tự động nhận tiền qua ngân hàng và chưa dùng webhook. Việc xác nhận vẫn do nhân viên kiểm tra thủ công.

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

Khi đã yêu cầu thanh toán, phiên bàn cũ không nhận thêm món nữa. Nếu khách vẫn muốn gọi thêm, hệ thống sẽ tạo phiên mới để tránh gộp nhầm bill.

### Khách chuyển thiếu tiền hoặc sai nội dung

Nhân viên không xác nhận thanh toán. Payment vẫn ở trạng thái chờ xử lý.

Nếu không tiếp tục xử lý payment đó, nhân viên đánh dấu payment là bỏ qua. Payment cũ được giữ lại như lịch sử của một lần thanh toán không thành công; khoản còn phải thu được quản lý duy nhất trong `unpaid_records`.

### Người tạo QR phải là người xác nhận

Nhân viên nào tạo QR thanh toán thì chính nhân viên đó phải xác nhận đã nhận tiền. Nhân viên khác không được xác nhận thay.

### Khách rời đi trước khi thanh toán

Nếu khách đã gọi món nhưng rời đi trước khi tạo mã thanh toán, hệ thống vẫn còn dữ liệu order và giá món đã gọi.

Trường hợp này được lưu trong `unpaid_records` cùng tổng tiền và bill snapshot để admin xử lý sau. Khi cần thu lại tiền, admin tạo payment mới từ khoản chưa thanh toán đã chốt.

### Khách quay lại trả tiền sau khi payment bị bỏ qua

Payment `IGNORED` cũ vẫn được giữ lại để truy vết lần thanh toán không thành công. Khoản phải thu nằm trong `unpaid_records`; admin tạo payment mới với mã chuyển khoản mới từ khoản này. Không sửa payment cũ thành đã thanh toán và không cộng payment `IGNORED` riêng vào công nợ.

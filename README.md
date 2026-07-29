# CAS

CAS là ứng dụng giúp quán ăn, quán nước số hóa việc gọi món tại bàn và thanh toán chuyển khoản.

Khách chỉ cần quét QR ở bàn, xem menu trên điện thoại, chọn món và gửi order. Nhân viên nhìn thấy order ở màn hình vận hành, xử lý món, tạo mã VietQR để khách chuyển khoản và xác nhận khi đã nhận đúng tiền.

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

Giá món đã gọi sẽ được giữ lại theo thời điểm khách đặt. Nếu sau đó quán đổi giá menu, order cũ vẫn không bị thay đổi.

### Quản lý bàn và QR

Quán có thể tạo và quản lý danh sách bàn. Mỗi bàn có QR riêng để khách gọi món đúng bàn.

Nếu nhiều người cùng bàn quét QR, tất cả vẫn dùng chung một phiên bàn và nhìn thấy cùng danh sách order. Chỉ người đầu tiên mở phiên bàn cần nhập tên và số điện thoại.

### Xử lý order

Nhân viên có thể xem các order khách gửi lên, biết món nào được gọi, số lượng bao nhiêu và ghi chú của khách.

MVP hiện tại tập trung vào tiếp nhận order và thanh toán, chưa tách riêng màn hình bếp/phục vụ và chưa theo dõi trạng thái chế biến từng món.

### Yêu cầu hủy món

Nếu khách muốn hủy món, hệ thống ghi nhận yêu cầu hủy. Nhân viên sẽ đồng ý hoặc từ chối.

Nếu đồng ý, hệ thống tính lại tiền. Nếu từ chối, tổng tiền không thay đổi.

### Thanh toán bằng VietQR

Khi khách yêu cầu thanh toán, nhân viên tạo mã VietQR trên màn hình vận hành.

VietQR có:

- Tài khoản ngân hàng của quán.
- Số tiền cần thanh toán.
- Nội dung chuyển khoản riêng cho lần thanh toán đó.

Khách chuyển khoản xong, nhân viên kiểm tra app ngân hàng. Chỉ khi đúng số tiền và đúng nội dung chuyển khoản, nhân viên mới xác nhận đã thanh toán.

MVP chưa tự động nhận tiền qua ngân hàng và chưa dùng webhook. Việc xác nhận vẫn do nhân viên kiểm tra thủ công.

## Các tình huống đặc biệt

### Khách gọi thêm món

Khách có thể gọi thêm món trong khi phiên bàn còn mở. Mỗi lần gọi thêm sẽ tạo một order mới trong cùng phiên bàn.

### Khách yêu cầu thanh toán rồi muốn gọi thêm

Khi đã yêu cầu thanh toán, phiên bàn cũ không nhận thêm món nữa. Nếu khách vẫn muốn gọi thêm, hệ thống sẽ tạo phiên mới để tránh gộp nhầm bill.

### Khách chuyển thiếu tiền hoặc sai nội dung

Nhân viên không xác nhận thanh toán. Payment vẫn ở trạng thái chờ xử lý.

Nếu không tiếp tục xử lý payment đó, nhân viên chỉ được đánh dấu là bỏ qua. Dữ liệu vẫn được giữ lại để admin xem và thống kê.

### Người tạo QR phải là người xác nhận

Nhân viên nào tạo QR thanh toán thì chính nhân viên đó phải xác nhận đã nhận tiền. Nhân viên khác không được xác nhận thay.

### Khách rời đi trước khi thanh toán

Nếu khách đã gọi món nhưng rời đi trước khi tạo mã thanh toán, hệ thống vẫn còn dữ liệu order và giá món đã gọi.

Trường hợp này cần được đưa vào danh sách chưa thanh toán để admin xử lý sau. Khi cần thu lại tiền, admin có thể tạo payment mới từ các order cũ. Cách xử lý chi tiết đang được chốt trong tài liệu edge cases.

### Khách quay lại trả tiền sau khi payment bị bỏ qua

Payment cũ vẫn được giữ lại để thống kê. Admin tạo payment mới với mã chuyển khoản mới để thu tiền. Không sửa payment cũ thành đã thanh toán.

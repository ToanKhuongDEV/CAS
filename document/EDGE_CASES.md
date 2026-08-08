# CAS — Edge cases và cách xử lý

## 1. Mục đích

Tài liệu này lưu lại các trường hợp biên của hệ thống và hướng xử lý nghiệp vụ.

Các trường hợp đã chốt sẽ được đánh dấu `Đã chốt`. Các trường hợp còn cần xác nhận sẽ được đánh dấu `Cần chốt` để tránh tự ý biến giả định thành thiết kế chính thức.

## 2. Nguyên tắc chung

- Không làm mất dữ liệu order, payment hoặc audit log.
- Không xóa vật lý order và payment.
- Dữ liệu tính tiền phải dựa trên giá đã ghi nhận trong `order_items`, không lấy lại giá menu hiện tại.
- Các thao tác quan trọng của nhân viên/admin phải ghi `audit_logs`.
- Backend không tin dữ liệu nhạy cảm do client gửi lên như role, account xác nhận payment hoặc tổng tiền.

## 3. QR bàn không hợp lệ

**Trạng thái:** Đã chốt

### Tình huống

Khách quét QR nhưng token không tồn tại, đã bị thu hồi hoặc không còn `ACTIVE`.

### Cách xử lý

- Không tạo table session.
- Hiển thị thông báo QR không hợp lệ.
- Ghi log lỗi nếu cần theo dõi vận hành.

## 5. Nhiều thiết bị cùng quét một QR

**Trạng thái:** Đã chốt

### Tình huống

Nhiều khách tại cùng bàn quét cùng QR.

### Cách xử lý

- Tất cả dùng chung table session đang `OPEN`.
- Tất cả nhìn thấy cùng danh sách order của session.
- Chỉ người đầu tiên mở session bàn cần nhập tên và số điện thoại.
- Người quét QR sau trong cùng session không cần nhập lại thông tin.
- Thông tin người đầu tiên được lưu trong `client_accounts` và gắn với session.
- Khi tạo session cần chống race condition để một bàn không bao giờ có nhiều hơn một session `OPEN` tại cùng một thời điểm.

## 5.1. Khách đầu tiên không nhập tên hoặc số điện thoại

**Trạng thái:** Đã chốt

### Tình huống

Bàn chưa có session đang mở, khách đầu tiên quét QR nhưng bỏ qua hoặc nhập thiếu tên/SĐT.

### Cách xử lý

- Không tạo session mới nếu thiếu tên hoặc số điện thoại.
- Hiển thị form yêu cầu nhập đủ thông tin.
- Chỉ sau khi có đủ tên và số điện thoại mới tạo hoặc tìm `client_accounts`, tạo session và mở menu.

## 6. Khách gửi order nhiều lần

**Trạng thái:** Đã chốt

### Tình huống

Khách gọi món lần đầu, sau đó gọi thêm.

### Cách xử lý

- Mỗi lần khách bấm gửi món tạo một `orders` mới.
- Các món của lần gửi đó nằm trong `order_items`.
- Không cộng món mới vào order cũ.

## 7. Khách bấm gửi order lặp do mạng chậm

**Trạng thái:** Đã chốt

### Tình huống

Khách bấm gửi order nhiều lần vì mạng chậm, hoặc frontend retry request.

### Cách xử lý

- Frontend bắt buộc gửi kèm một `idempotency_key` cho mỗi lần submit order.
- Phạm vi duy nhất của key là trong cùng một table session.
- Backend lưu `idempotency_key` bền vững trong `orders`; Redis không phải nguồn dữ liệu chính cho cơ chế này.
- Backend chuẩn hóa payload order, tính SHA-256 và lưu kết quả vào `orders.request_fingerprint`; client không gửi fingerprint.
- Database đặt unique constraint cho `table_session_id + idempotency_key` để chống tạo order trùng khi có request đồng thời.
- Nếu request lặp lại với cùng key và cùng fingerprint, backend trả về order đã tạo trước đó.
- Nếu request dùng lại cùng key nhưng fingerprint khác, backend từ chối với HTTP `409 Conflict`.
- Key gắn với order và không cần TTL.

## 8. Món hết hàng sau khi khách đã mở menu

**Trạng thái:** Đã chốt

### Tình huống

Khách mở menu thấy món còn bán, nhưng trước khi gửi order thì nhân viên chuyển món sang `SOLD_OUT` hoặc `INACTIVE`.

### Cách xử lý

- Backend kiểm tra lại trạng thái món tại thời điểm submit order.
- Nếu món không còn được bán, từ chối dòng món đó.
- Frontend thông báo khách chọn món khác.

## 9. Giá menu thay đổi sau khi khách đã gọi món

**Trạng thái:** Đã chốt

### Tình huống

Admin đổi giá món sau khi khách đã đặt.

### Cách xử lý

- Không cập nhật lại giá trong order cũ.
- Bill/payment về sau dùng giá gốc và tổng tiền đã lưu trong `order_items`, cùng các snapshot option trong `order_item_options`.
- Giá mới chỉ áp dụng cho order tạo sau thời điểm đổi giá.

## 10. Option không hợp lệ

**Trạng thái:** Đã chốt

### Tình huống

Khách gửi option thiếu lựa chọn bắt buộc, vượt `max_select`, hoặc option đã bị inactive.

### Cách xử lý

- Backend validate option khi submit order.
- Backend kiểm tra `option_group_item_id` thuộc option group của đúng món chính, liên kết và menu item option đều đang hoạt động.
- Nếu option không hợp lệ, không tạo order.
- Frontend yêu cầu khách chọn lại.

## 11. Yêu cầu hủy món vượt quá số lượng

**Trạng thái:** Đã chốt

### Tình huống

Khách yêu cầu hủy số lượng lớn hơn số lượng còn lại của dòng món.

### Cách xử lý

- Không tạo hoặc không duyệt yêu cầu hủy không hợp lệ.
- Nếu yêu cầu hợp lệ, tạo `order_item_cancellation_requests` với `public_id` và `idempotency_key`.
- Nhân viên duyệt hoặc từ chối.
- Khi duyệt, hệ thống giữ nguyên số lượng và thành tiền gốc trong `order_items`.
- Số lượng đã hủy được tính từ tổng `requested_quantity` của các yêu cầu `APPROVED`; hệ thống dùng số lượng còn lại để tính lại tổng tiền order.
- Việc kiểm tra và duyệt phải chạy trong transaction để tổng số lượng hủy đã duyệt không vượt quá `order_items.quantity` khi có xử lý đồng thời.
- Chỉ tạo hoặc xử lý yêu cầu hủy khi session còn `OPEN`; không cho yêu cầu thanh toán nếu còn yêu cầu hủy `PENDING`.

## 12. Khách yêu cầu thanh toán rồi muốn gọi thêm

**Trạng thái:** Đã chốt

### Tình huống

Session đã chuyển sang `PAYMENT_PENDING` nhưng khách muốn gọi thêm món.

### Cách xử lý

- Không nhận thêm order vào session cũ.
- Session `PAYMENT_PENDING` vẫn chiếm dụng bàn.
- Không tạo session mới cho cùng bàn cho đến khi nhân viên xác nhận payment `PAID` hoặc ghi nhận phiên là chưa thanh toán và đóng session.

## 13. Nhân viên khác người tiếp nhận yêu cầu xác nhận thanh toán

**Trạng thái:** Đã chốt

### Tình huống

Nhân viên A nhìn thấy yêu cầu trước, nhưng nhân viên B là người bấm xác nhận payment.

### Cách xử lý

- Cho phép tài khoản vận hành hợp lệ xác nhận.
- Backend lấy account xác nhận từ Firebase ID Token đã verify.
- Không nhận `confirmed_by` từ client.
- Lưu `confirmed_by`, `confirmed_by_name`, `confirmed_at` và audit log.

## 14. Payment chưa được nhân viên xác nhận

**Trạng thái:** Đã chốt

### Tình huống

Khách đã tạo yêu cầu thanh toán nhưng nhân viên chưa bấm xác nhận.

### Cách xử lý

- Payment giữ trạng thái `PENDING`.
- Payment `PENDING` không tự hết hạn.
- Session giữ `PAYMENT_PENDING` và vẫn chiếm dụng bàn.
- Giao diện Customer tiếp tục hướng dẫn khách ra gặp nhân viên.
- Nhân viên không xác nhận `PAID` nếu chưa nghe loa báo giao dịch (“ting ting”) xác nhận chuyển khoản thành công.
- Nếu cần đóng bàn mà chưa xác nhận `PAID`, nhân viên dùng luồng ghi nhận chưa thanh toán; payment vẫn `PENDING` và hệ thống tạo `unpaid_records`.

## 14.1. Customer đang chờ khi payment được xác nhận

**Trạng thái:** Đã chốt

### Tình huống

Customer đang mở màn chờ nhân viên xác nhận trên một hoặc nhiều thiết bị. Nhân
viên xác nhận payment `PAID` và table session được đóng.

### Cách xử lý

- Customer tiếp tục hiển thị trạng thái chờ cho đến khi polling nhận payment
  `PAID` từ backend.
- Khi nhận `PAID`, giao diện thay toàn bộ trạng thái chờ bằng màn “Thanh toán
  thành công”.
- Màn hoàn tất hiển thị bàn, số tiền backend đã xác nhận, `confirmed_at`, lời
  cảm ơn và nút “Tiếp tục tạo đơn mới”; không hiển thị nhãn hoặc thông báo bàn
  đã đóng.
- Nút tiếp tục dùng lại QR token cố định của chính bàn để trở về màn nhập thông
  tin tại `/table/{qrToken}` như một khách mới, không tái sử dụng session cũ.
- Không cho gọi thêm món, yêu cầu hủy hoặc gửi lại yêu cầu thanh toán sau khi
  session đã `CLOSED`.
- Tất cả thiết bị đang mở cùng session cập nhật theo cùng quy tắc.
- Nếu polling lỗi hoặc thiết bị mất kết nối, giữ trạng thái chờ gần nhất và thử
  đồng bộ lại; không tự chuyển sang thành công.
- Không hiển thị thông tin ngân hàng, mã giao dịch, QR thanh toán hoặc dữ liệu
  từ loa báo giao dịch.

## 15. Khách trốn về trước khi tạo payment

**Trạng thái:** Đã chốt

### Tình huống

Khách đã gọi món, hệ thống đã có `orders` và `order_items`, nhưng khách rời đi trước khi yêu cầu thanh toán.

### Vấn đề

Chưa có `payments`, nên nếu thiết kế chỉ lưu `bill_snapshot` trong payment thì chưa có snapshot tại thời điểm khách rời đi.

Tuy nhiên, dữ liệu tính tiền vẫn còn trong `order_items`:

- `item_name`
- `unit_price`
- `options_amount`
- `quantity`
- `total_amount`

Chi tiết option của từng dòng món vẫn còn trong `order_item_options`.

### Cách xử lý đã chốt

- Backend tạo một payment `PENDING` liên kết duy nhất với table session.
- `payments.amount` được lấy từ tổng `orders.payable_amount`; không nhận số tiền từ client.
- Tạo `bill_snapshot` từ dữ liệu order đã chốt và lưu cùng payment.
- Tạo một `unpaid_records` liên kết duy nhất với session, sao chép `amount` và `bill_snapshot` từ payment.
- `bill_snapshot` trong `unpaid_records` là bất biến.
- Đóng table session để giải phóng bàn với `status = CLOSED` và lưu `closed_at`.
- Bản ghi `unpaid_records` bắt đầu ở trạng thái `OPEN` và được đưa vào màn hình theo dõi riêng cho admin.
- Ghi người thực hiện, thời điểm, lý do và audit log khi ghi nhận khoản chưa thanh toán.
- Nếu payment được xác nhận sau đó, dùng chính payment của session, không tạo payment mới; đồng thời chuyển `unpaid_records` sang `RESOLVED`.
- Không tính lại theo giá menu hiện tại.

## 16. Xác nhận payment sau khi đã ghi nhận chưa thanh toán

**Trạng thái:** Đã chốt

### Tình huống

Session đã đóng và có `unpaid_records` trạng thái `OPEN`, sau đó nhân viên xác nhận payment.

### Cách xử lý đã chốt

- Không tạo payment mới.
- Trong cùng transaction, chuyển payment `PENDING` sang `PAID`, lưu thông tin người xác nhận và chuyển `unpaid_records` sang `RESOLVED`.
- Không mở lại session đã `CLOSED`.
- Confirm lặp phải idempotent.

## 17. Client gửi số tiền khác tổng đơn hàng

**Trạng thái:** Đã chốt

### Tình huống

Client gửi thêm trường số tiền hoặc dữ liệu hiển thị phía client đã cũ.

### Cách xử lý

- Backend bỏ qua hoặc từ chối trường số tiền do client cung cấp.
- `payments.amount` luôn được tính từ tổng `orders.payable_amount` trong transaction tạo payment.
- Nếu dữ liệu cấu thành bill thay đổi đồng thời, khóa session hoặc dùng cơ chế transaction tương đương trước khi tạo snapshot.

## 18. Hai nhân viên cùng xác nhận payment

**Trạng thái:** Đã chốt

### Tình huống

Hai nhân viên bấm xác nhận gần như đồng thời.

### Cách xử lý

- Chuyển trạng thái bằng transaction hoặc conditional update từ `PENDING` sang `PAID`.
- Chỉ request thắng đầu tiên ghi `confirmed_by`, `confirmed_at` và audit log.
- Request còn lại nhận trạng thái `PAID` hiện tại và không ghi đè người xác nhận.

## 18.1. Khách báo đã chuyển khoản nhưng loa chưa báo

**Trạng thái:** Đã chốt

### Tình huống

Khách cho biết đã chuyển khoản nhưng nhân viên chưa nghe loa báo giao dịch phát tín hiệu “ting ting”.

### Cách xử lý

- Nhân viên chưa bấm xác nhận thanh toán thành công.
- Payment giữ trạng thái `PENDING`.
- CAS không tự kiểm tra ngân hàng hoặc loa báo giao dịch.
- Nhân viên xử lý việc xác minh ngoài CAS; chỉ xác nhận khi loa đã báo chuyển khoản thành công.

## 19. Mất kết nối khi gửi yêu cầu thanh toán

**Trạng thái:** Đã chốt

### Tình huống

Client không nhận được response và gửi lại yêu cầu thanh toán.

### Cách xử lý

- `payments.table_session_id` là duy nhất nên mỗi session chỉ có một payment.
- Request lặp trả lại payment hiện tại, không tạo bản ghi thứ hai.
- Không tạo lại `bill_snapshot` hoặc thay đổi `amount` của payment đã tồn tại.

## 20. Payment đã paid nhưng thao tác confirm bị bấm lại

**Trạng thái:** Đã chốt

### Tình huống

Nhân viên bấm xác nhận nhiều lần hoặc request bị retry.

### Cách xử lý

- Confirm payment cần idempotent.
- Nếu payment đã `PAID`, backend trả về trạng thái hiện tại, không tạo audit log trùng.
- Không cập nhật lại `confirmed_at`.

## 21. Session đã đóng nhưng khách quét lại QR

**Trạng thái:** Đã chốt

### Tình huống

Khách hoặc lượt khách mới quét lại QR sau khi session cũ đã `CLOSED`.

### Cách xử lý

- Không mở lại session cũ.
- Nếu bàn không có session `OPEN`, hệ thống tạo session mới.
- QR bàn vẫn là QR cố định.

## 21.1. Cảnh báo bàn chờ lâu từ order cũ nhất chưa hoàn thành

**Trạng thái:** Đã chốt một phần

### Tình huống

Dashboard Operation cần cảnh báo các bàn đã chờ lâu. Một table session có thể
có nhiều order và mỗi order có thể đã hoàn thành một phần hoặc toàn bộ số lượng.

### Cách xử lý đã chốt

- Chỉ xét table session đang `OPEN` và đã có ít nhất một order.
- Mốc tính thời gian chờ là `created_at` của order cũ nhất còn ít nhất một phần
  chưa làm xong trong session.
- Order đã hết số lượng cần làm không tham gia tính cảnh báo.
- Kết quả hoàn thành được suy ra từ `order_items.prepared_quantity`, không lưu
  trạng thái riêng trong `orders`.
- Frontend không tự phân loại bàn chờ lâu; backend là nguồn quyết định.
- Ngưỡng cảnh báo do `ADMIN` cấu hình.
- Bàn được cảnh báo khi thời gian chờ lớn hơn hoặc bằng ngưỡng.
- UI dùng tạm ngưỡng `25` phút cho đến khi tích hợp cấu hình từ backend.

### Nội dung cần chốt

- Vị trí lưu bền vững giá trị cấu hình và API contract quản lý cấu hình.
- Giá trị nhỏ nhất, lớn nhất và cách validation khi `ADMIN` cập nhật ngưỡng.
- Hành vi khi cấu hình chưa tồn tại hoặc không đọc được; giá trị fallback phía
  backend chưa được chốt.

## 21.2. Admin xem danh sách report

**Trạng thái:** Cần chốt

### Tình huống

`ADMIN` cần xem danh sách `report`, nhưng định nghĩa report và vòng đời dữ liệu
chưa được xác định.

### Nội dung đã chốt

- Chỉ `ADMIN` được truy cập chức năng.
- Phạm vi hiện tại chỉ yêu cầu xem danh sách.
- `OPERATOR` không được truy cập.
- Chưa bao gồm báo cáo phân tích nâng cao.

### Nội dung cần chốt

- Report đại diện cho nội dung gì và được tạo từ đâu.
- Các trạng thái, trường bắt buộc và dữ liệu nhạy cảm cần che giấu.
- Cách xử lý report trùng lặp, đã mất nguồn tham chiếu hoặc người dùng không còn
  quyền xem.
- Hành vi khi danh sách trống, dữ liệu lớn hoặc report không còn tồn tại.
- Có cần bảng dữ liệu mới hay chỉ là kết quả tổng hợp từ dữ liệu hiện có.

## 21.3. Hai order có cùng thời điểm trong hàng ưu tiên lên món

**Trạng thái:** Đã chốt một phần

### Tình huống

Hai bàn hoặc hai thiết bị có thể tạo order với cùng giá trị `created_at` đến độ
chính xác millisecond.

### Cách xử lý đã chốt

- Nguyên tắc chung là FIFO: order có `created_at` sớm hơn được ưu tiên lên món
  trước.
- Order gọi thêm được tạo sau và không được chen trước các order có
  `created_at` sớm hơn.
- Nếu nhiều order có cùng `created_at`, hệ thống không cần bảo đảm order nào
  đứng trước; mọi thứ tự giữa các order đồng thời đều được chấp nhận.
- Không cần khóa sắp xếp phụ chỉ để phân định các order có cùng `created_at`.
- CAS chỉ hiển thị thứ tự ưu tiên cho nhân viên; chưa theo dõi trạng thái chế
  biến dạng enum; số lượng đã làm xong nằm ở `order_items.prepared_quantity`.

### Nội dung cần chốt

- Có cho phép nhân viên ưu tiên ngoại lệ hay không và trường hợp nào được phép.
- Nếu có ngoại lệ, hệ thống có cần ghi audit log cho việc đổi thứ tự hay không.

## 21.4. Hoàn thành món theo mẻ đồng thời với hủy món

**Trạng thái:** Cần chốt một phần

### Tình huống

Một nhân viên ghi nhận hoàn thành một mẻ trong khi nhân viên khác đang duyệt yêu
cầu hủy của một dòng món thuộc cùng nhóm chế biến.

### Cách xử lý đã chốt

- Hoàn thành theo mẻ và duyệt hủy phải khóa các dòng order liên quan hoặc dùng
  transaction tương đương.
- Backend luôn tính lại số lượng hiệu lực và số lượng còn cần làm trước khi ghi.
- Không cho `prepared_quantity` vượt số lượng hiệu lực.
- Retry thao tác hoàn thành không được cộng số lượng hai lần.
- Nếu dữ liệu đã thay đổi, backend từ chối thao tác không còn hợp lệ và trả dữ
  liệu mới nhất để nhân viên kiểm tra lại.

### Nội dung cần chốt

- Có cho duyệt hủy khi một phần hoặc toàn bộ số lượng yêu cầu hủy đã được ghi
  nhận làm xong hay không.
- Cơ chế lưu idempotency bền vững cho thao tác hoàn thành theo mẻ.

## 21.5. Nhân viên tạo order hộ khách

**Trạng thái:** Đã chốt một phần

### Tình huống

Khách gọi món trực tiếp với nhân viên thay vì tự thao tác trên điện thoại.
`OPERATOR` cần chọn bàn và tạo order hộ khách.

### Cách xử lý đã chốt

- `OPERATOR` được dùng các chức năng xem menu, chọn món/option, giỏ món, ghi chú
  chung, gửi order và gọi thêm món để tạo order hộ.
- Chỉ cho phép tạo order khi bàn thuộc đúng cửa hàng và có table session
  `OPEN`.
- Backend áp dụng cùng validation menu, option, giá, idempotency và FIFO như
  order do Customer gửi.
- Order tạo hộ xuất hiện trong cùng danh sách order và hóa đơn của table
  session; không tạo luồng tính tiền riêng.
- Backend lấy danh tính nhân viên từ Firebase ID Token đã verify và ghi audit log; không nhận
  `actor_account_id` từ request.
- Nếu Customer và nhân viên đồng thời gửi hai order hợp lệ, hệ thống tạo hai
  order riêng; thứ tự FIFO dựa trên `created_at`.

### Nội dung cần chốt

- Nhân viên có được mở table session hộ khi bàn chưa có session `OPEN` hay
  không.
- Nếu có, yêu cầu thông tin khách và cách gắn `client_account_id`.
- Có cần hiển thị nguồn “Khách tự gọi” hoặc “Nhân viên tạo hộ” trong lịch sử hay
  không; nếu cần truy vấn trực tiếp thì phải chốt thay đổi mô hình dữ liệu.

## 21.1. Khách yêu cầu đổi bàn hoặc gộp bàn

**Trạng thái:** Đã chốt

### Tình huống

Khách đang sử dụng một thẻ bàn và muốn chuyển sang vị trí ngồi khác hoặc gộp với một nhóm bạn (ghép bàn).

### Quy tắc đã chốt

- Mã QR được gắn với một **thẻ bàn di động**, không dán cố định xuống mặt bàn vật lý.
- Khi khách chuyển bàn thực tế, khách chỉ cần mang theo thẻ bàn di động đó đi.
- Mỗi `table_sessions` vẫn gắn cố định với thẻ bàn `dining_tables` đó từ lúc `OPEN` đến khi `CLOSED`.
- Hệ thống trên phần mềm không cần xử lý gộp/tách, quản lý việc di chuyển do đã được giải quyết bằng việc di chuyển tấm thẻ vật lý.

## 21.6. `option_values` bị Inactive hoặc hết hàng khi món chính còn bán

**Trạng thái:** Đã chốt

### Tình huống

Món chính (ví dụ: Trà sữa) đang ở trạng thái `AVAILABLE`, nhưng một `option_values` thuộc nhóm lựa chọn (ví dụ: Trân châu đen hoặc Size L) bị chuyển sang `INACTIVE` hoặc hết hàng.

### Cách xử lý

- Backend kiểm tra lại trạng thái của món chính lẫn tất cả `option_values` được chọn tại thời điểm submit order.
- Nếu có bất kỳ `option_values` nào bị `INACTIVE` hoặc không thuộc `option_groups` được liên kết với món qua `menu_item_option_groups`, backend từ chối order.
- Frontend thông báo cho khách hàng biết option tương ứng đã hết hàng để chọn lại.

## 21.7. Vi phạm giới hạn lựa chọn option (`min_select`, `max_select`)

**Trạng thái:** Đã chốt

### Tình huống

Khách hàng gửi order thiếu option bắt buộc (`min_select > 0`) hoặc chọn số lượng option vượt quá giới hạn tối đa (`max_select`).

### Cách xử lý

- Backend validate số lượng `option_values` được chọn đối với từng nhóm lựa chọn `option_groups`.
- Nếu chọn thiếu nhóm bắt buộc hoặc vượt quá `max_select`, backend từ chối order và trả lỗi HTTP `400 Bad Request`.
- Frontend bắt buộc hiển thị cảnh báo và khóa nút gửi đơn cho đến khi khách chọn đúng số lượng option quy định.

## 21.8. Giá option/topping thay đổi sau khi khách đã gửi order

**Trạng thái:** Đã chốt

### Tình huống

Admin hoặc quản lý thay đổi giá cộng thêm (`extra_price`) của `option_values` sau khi khách đã đặt món thành công.

### Cách xử lý

- Giá của option tại thời điểm đặt được chụp lại và lưu cố định vào `order_item_options.unit_price`.
- Bill và tổng tiền của order sử dụng giá snapshot trong `order_item_options`, không bị thay đổi bởi việc cập nhật giá menu/topping sau đó.

## 21.9. Các món trong cùng một order hoàn thành chế biến ở thời điểm khác nhau

**Trạng thái:** Đã chốt

### Tình huống

Một order gồm nhiều món (hoặc 1 món nhiều phần), bếp/quầy pha chế làm xong từng món/từng phần rải rác tại các thời điểm khác nhau.

### Cách xử lý

- Tiến độ làm món được theo dõi chi tiết theo từng dòng món qua `order_items.prepared_quantity`, không lưu trạng thái hoàn thành chung ở cấp `orders`.
- Nhân viên cập nhật số phần làm xong theo mẻ, hệ thống phân bổ theo FIFO vào `order_items.prepared_quantity` của các order cũ nhất.
- Một order được xem là hoàn thành hoàn toàn khi mọi dòng món trong order đó đều có `prepared_quantity >= quantity - approved_cancelled_quantity`.

## 21.10. Khách yêu cầu hủy món sau khi bếp đã chế biến một phần hoặc toàn bộ

**Trạng thái:** Đã chốt

### Tình huống

Khách gửi yêu cầu hủy món khi dòng món đó đã được nhân viên ghi nhận làm xong một phần hoặc toàn bộ (`prepared_quantity > 0`).

### Cách xử lý

- Giao diện Operator hiển thị rõ số lượng đã làm xong (`prepared_quantity`) của dòng món khi nhân viên xem xét yêu cầu hủy.
- Nhân viên vận hành linh hoạt quyết định `APPROVED` hoặc `REJECTED` dựa trên thực tế tại quán.
- Nếu `APPROVED`, backend kiểm tra trong transaction để bảo đảm tổng số lượng hủy đã duyệt không làm số lượng còn lại nhỏ hơn số lượng đã làm xong (`quantity - approved_cancelled_quantity >= prepared_quantity`). Nếu vi phạm, request duyệt bị từ chối.

## 21.11. Khách muốn sửa số lượng hoặc đổi topping sau khi đã gửi order

**Trạng thái:** Đã chốt

### Tình huống

Khách đã gửi order thành công nhưng sau đó muốn đổi size, bớt topping hoặc đổi sang món khác.

### Cách xử lý

- Hệ thống không hỗ trợ thao tác "chỉnh sửa" trực tiếp trên order/dòng món đã gửi.
- Muốn đổi topping hoặc giảm số lượng, khách/nhân viên phải tạo **yêu cầu hủy món** cho dòng món cũ.
- Sau khi nhân viên duyệt hủy, khách/nhân viên gửi **order mới** chứa đúng cấu hình món và option mong muốn.

## 21.12. Tương tác đồng thời từ nhiều thiết bị trên cùng order/session

**Trạng thái:** Đã chốt

### Tình huống

2 khách cùng bàn hoặc 1 khách và 1 nhân viên đồng thời gửi order, gửi yêu cầu hủy hoặc duyệt hoàn thành món.

### Cách xử lý

- Tất cả thao tác ghi dữ liệu (tạo order, duyệt hủy, ghi nhận hoàn thành theo mẻ, xác nhận thanh toán) được thực thi trong transaction có khóa phù hợp (pessimistic locking hoặc conditional update).
- Thao tác gửi order dùng `idempotency_key` + `request_fingerprint` để xử lý duplicate (Mục 7).
- Thao tác duyệt hủy hoặc làm món theo mẻ nếu tới sau và dữ liệu không còn thỏa mãn điều kiện sẽ bị từ chối và thông báo dữ liệu mới nhất cho người dùng.

## 21.13. Phát hiện sai sót/hủy món sau khi đã xác nhận thanh toán

**Trạng thái:** Đã chốt

### Tình huống

Payment đã ở trạng thái `PAID` và session đã `CLOSED`, sau đó mới phát hiện tính nhầm tiền hoặc cần hủy món đền bù cho khách.

### Cách xử lý

- Khi session đã `CLOSED`, thông tin hóa đơn và `bill_snapshot` đã chốt bất biến để phục vụ đối soát. CAS không cho phép mở lại session hoặc sửa đổi bill đã đóng.
- Việc hoàn tiền hoặc đền bù cho khách được xử lý thủ công ngoài hệ thống CAS.
- Quản lý/Admin có thể ghi chép ghi chú vào `audit_logs` để phục vụ giải trình cuối ca nếu cần.

## 21.14. Xử lý sự cố mạng, Timeout và Request lặp (Retry)

**Trạng thái:** Đã chốt

### Tình huống

Client mất mạng, frontend timeout hoặc POS reload trang khi đang gửi request (submit order, tạo payment, confirm payment).

### Cách xử lý

- **Gửi Order**: Sử dụng `idempotency_key` (phạm vi session) + `request_fingerprint` (SHA-256 payload). Nếu retry trùng key và payload, backend trả lại kết quả order đã tạo mà không tạo đơn trùng (Mục 7).
- **Yêu cầu Thanh toán**: `payments.table_session_id` có unique constraint. Request gửi lặp chỉ trả về thông tin payment `PENDING` hiện tại, không tạo payment mới (Mục 19).
- **Xác nhận Thanh toán (`PAID`)**: Thao tác confirm là idempotent. Nếu request bị gửi lặp, backend trả về kết quả `PAID` hiện tại mà không cập nhật lại thời gian hay tạo audit log trùng (Mục 20).

## 21.15. Hủy phiên bàn khi chưa gọi món (Chưa gửi order vào bếp)

**Trạng thái:** Đã chốt

### Tình huống

Phiên bàn (session) đã được mở do khách quét QR hoặc nhân viên ấn tạo, nhưng phát hiện nhầm lẫn, hoặc khách đổi ý rời đi ngay mà chưa báo bếp món nào.

### Cách xử lý

- **Tất cả mọi người** (Customer và Operator/Admin) đều có quyền **Hủy phiên bàn** nếu chưa gửi đồ ăn gì xuống bếp.
- Backend kiểm tra nếu phiên bàn chưa có bản ghi `orders` nào, session sẽ được đóng ngay lập tức (chuyển sang `CLOSED`), không cần qua luồng thanh toán tạm tính hay hủy đơn.
- Nếu đã gửi món thành công (đã có order), thao tác này sẽ bị từ chối; lúc này phải thực hiện luồng hủy món đã gửi hoặc thanh toán.

## 21.16. Món làm xong nhưng bị hỏng hoặc khách trả lại (Hủy / Làm lại)

**Trạng thái:** Đã chốt

### Tình huống

Món đã được nhân viên ghi nhận làm xong (`prepared_quantity` đã tăng), nhưng làm đổ, bếp làm sai yêu cầu, hoặc khách chê và trả lại. Khách có thể chỉ muốn hủy luôn (không ăn nữa) hoặc yêu cầu làm lại phần mới.

### Cách xử lý

- Nhân viên vào mục **Hủy món** (tạo Cancellation Request) trên thiết bị Operator.
- Tại đây, nhân viên nhập **Lý do** và số lượng, sau đó chọn 1 trong 2 nút: **Hủy hoàn toàn** hoặc **Làm lại**.
- **Nếu chọn Hủy hoàn toàn:**
  - Backend `APPROVED` yêu cầu hủy, số lượng tính tiền giảm đi (khách sẽ không phải trả tiền cho món bị hỏng này).
- **Nếu chọn Hủy và Làm lại:**
  - Backend `APPROVED` yêu cầu hủy cho phần bị hỏng (giảm tiền).
  - Thuận lợi: Backend tự động sinh ra một `orders` mới (tương đương nhân viên tạo order hộ) chứa chính xác số lượng món và option vừa bị hủy. Do thêm order mới, số tiền của phần làm lại được tự cộng lại vào bill, giúp tổng tiền bill của khách không bị tính đúp.
  - Nhận biết món làm lại: Hệ thống tự động mượn tính năng ghi chú chung, gắn tiền tố vào `orders.note` của order mới (Ví dụ: `[LÀM LẠI] - {Lý do hủy}`).
  - Bếp/pha chế khi thấy order đi kèm chữ `[LÀM LẠI]` sẽ tự hiểu đây là món cần làm lại và cần ưu tiên.
  - Đồng thời, bản ghi yêu cầu hủy sẽ được đánh cờ `is_remade = TRUE` trong Database để phục vụ báo cáo hao hụt, phân biệt với việc khách tự đổi ý hủy.

## 22. Các chức năng thuộc phạm vi nâng cấp (Ngoài phạm vi Phase 1)

Các trường hợp dưới đây được xác định rõ là **Ngoài phạm vi của Phase 1** theo tài liệu tổng quan sản phẩm ([OVERALL.md](file:///D:/Intern_job/CAS/document/OVERALL.md)). Hệ thống CAS tập trung xử lý luồng cốt lõi (Gọi món QR & Xác nhận thanh toán thủ công), không triển khai các tính năng này trong giai đoạn hiện tại:

1. **Bàn & Session**:
   - Đổi bàn, chuyển bàn, gộp bàn giữa các phiên, tách bàn (Mục 21.1).
   - _Hướng xử lý tạm thời_: Nhân viên đóng session cũ và mở session mới theo quy trình thủ công.
2. **Phân chia Bếp / Bar**:
   - Tách riêng màn hình hiển thị Bếp và Bar, chuyển món giữa Bếp và Bar, luồng trả món/làm lại chi tiết.
   - _Hướng xử lý tạm thời_: Nhân viên theo dõi danh sách món chung trên màn hình Operator.
3. **Thanh toán nâng cao**:
   - Tách bill, chia bill cho từng người, thanh toán kết hợp nhiều hình thức (tiền mặt + chuyển khoản), tự động tích hợp Webhook/API VietQR/Ngân hàng.
   - _Hướng xử lý tạm thời_: Nhân viên tự tính toán và xác minh chuyển khoản qua loa báo giao dịch ("ting ting") bên ngoài CAS trước khi nhấn xác nhận.
4. **Khuyến mãi & Giá**:
   - Áp dụng Voucher, mã giảm giá, giảm giá thủ công theo %, phụ phí tự động/thủ công.
   - _Hướng xử lý tạm thời_: Chỉ áp dụng đúng bảng giá menu được cấu hình sẵn.
5. **Quản lý Nhân viên & Ca làm**:
   - Đổi ca, giao ca, nghỉ giữa ca, chốt ca, kiểm kê lệch quỹ tiền mặt/chuyển khoản cuối ca.
   - _Hướng xử lý tạm thời_: Phân quyền đơn giản theo role `ADMIN` và `OPERATOR`; xác thực qua Firebase Authentication.
6. **Quản lý Kho & Tồn kho**:
   - Quản lý định lượng nguyên liệu, tồn kho âm, tự động trừ kho khi chế biến hoặc hoàn kho khi hủy món.
   - _Hướng xử lý tạm thời_: Nhân viên chủ động cập nhật trạng thái món/topping sang `SOLD_OUT` hoặc `INACTIVE` trên giao diện quản lý khi hết hàng.

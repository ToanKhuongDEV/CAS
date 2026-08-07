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
- Backend lấy account xác nhận từ access JWT.
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
- Backend lấy danh tính nhân viên từ JWT và ghi audit log; không nhận
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

**Trạng thái:** Đã chốt — Ngoài phạm vi hiện tại

### Tình huống

Khách đang ngồi ở bàn hiện tại và muốn chuyển sang bàn khác hoặc gộp hai bàn lại.

### Quy tắc đã chốt

- Hệ thống CAS **không có chức năng đổi bàn, chuyển bàn hoặc gộp bàn** trong phạm vi hiện tại.
- Mỗi `table_sessions` gắn cố định với duy nhất một `dining_tables` từ lúc `OPEN` đến khi `CLOSED`.
- Nếu khách đổi chỗ thực tế, nhân viên và khách tiếp tục phục vụ theo session của bàn ban đầu cho đến khi hoàn tất thanh toán, hoặc đóng session cũ và mở session mới theo quy trình thủ công.

## 22. Các edge case cần bổ sung sau

- Mất kết nối khi đang submit order.
- Nhân viên đổi trạng thái món trong lúc khách đang chọn option.
- Nhân viên ghi nhận chưa thanh toán đồng thời với một nhân viên khác đang xác nhận payment.
- Loa báo giao dịch mất kết nối hoặc báo chậm.

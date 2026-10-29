# CAS — Kịch bản kiểm thử dự án

Ngày cập nhật: 2026-10-28. Bộ kiểm thử thủ công gồm 151 test case trong 18 cụm chức năng, dựa trên nghiệp vụ đã chốt và implementation hiện tại. Bao gồm luồng thành công, validation, phân quyền, trạng thái, snapshot tiền, retry và một số tình huống đồng thời quan trọng. Số lượng case không thay thế việc đánh giá độ bao phủ sau mỗi thay đổi.

## Hướng dẫn sử dụng

- Mỗi test case có đủ 8 trường. Thực hiện qua giao diện; dùng API/Postman/DevTools cho trường hợp không thể tạo qua UI hoặc cần bỏ qua validation frontend.
- Chuẩn bị dữ liệu riêng cho từng case; không phụ thuộc việc case trước đã chạy. Chỉ thực hiện thay đổi dữ liệu, upload hoặc tạo Firebase user trên môi trường test.
- Dùng hai store A/B `ACTIVE` có dữ liệu khác nhau; `ADMIN_A`, `OPERATOR_A` thuộc A; Super Admin có store mặc định A. Chuẩn bị Operator thứ hai cho ca đồng thời. A/B là ký hiệu: thay bằng ID thực tế khi gọi API.
- Dùng QR, món, option, khách và tài khoản test hợp lệ. Các mức giá trong case là fixture cần tạo, không giả định dữ liệu seed đã có sẵn. Cloudinary/Firebase phải cấu hình trên môi trường test cho case cần tích hợp.
- Với nhiều giá trị đầu vào/role, chạy từng biến thể trên fixture độc lập và ghi kết quả từng biến thể trong Actual Result. Chỉ PASS nếu mọi biến thể đạt.
- Giữ token, mật khẩu và cookie trong môi trường local/Postman; không ghi vào tài liệu. Khi kiểm tra snapshot, audit hoặc số bản ghi, dùng API đọc sẵn có hoặc truy vấn DB chỉ đọc trên môi trường test.
- Actual Result ban đầu là **Chưa chạy**. Status: `PASS` = đạt; `FAIL` = khác mong đợi; `BLOCKED` = thiếu điều kiện chạy; `NOT RUN` = chưa chạy. Khi FAIL/BLOCKED, ghi bước lỗi, kết quả thực tế và bằng chứng đã che thông tin nhạy cảm.
- Giữ nguyên mã `TC_001`–`TC_030` từ bản đầu; bổ sung từ `TC_031`. Case được xếp theo cụm nên ID không tăng liên tục trong từng phần.

Tham chiếu: [Phạm vi](OVERALL.md), [Nghiệp vụ](BUSINESS_FLOWS.md), [Dữ liệu](DATABASE_DESIGN.md), [Trường hợp biên](EDGE_CASES.md), [cURL/API](../backend/README.md).

## Danh mục cụm

1. Đăng nhập và phân quyền — 11 case.
2. Super Admin và phạm vi store — 8 case.
3. Cài đặt store, brand và Welcome — 9 case.
4. Quản lý bàn và QR — 6 case.
5. Catalog, option, tag và ảnh — 10 case.
6. Customer — vào quán, thông tin khách và session — 11 case.
7. Customer — menu, giỏ hàng và order — 12 case.
8. Operator — tạo order, chế biến và cảnh báo — 9 case.
9. Hủy món, làm lại và chuyển phần đã làm — 10 case.
10. Yêu cầu và xác nhận thanh toán — 11 case.
11. Khoản chưa thanh toán — 5 case.
12. Khuyến mãi và redemption — 15 case.
13. Thông báo và người nhận — 6 case.
14. Quản lý tài khoản Admin và Operator — 7 case.
15. Dịch vụ đặt trước — 5 case.
16. Sự cố vận hành — 2 case.
17. Dashboard, tra cứu khách hàng và audit log — 9 case.
18. Giao diện, lỗi mạng và luồng xuyên suốt — 5 case.

## Cụm 1. Đăng nhập và phân quyền

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/common/security/FirebaseAuthenticationFilter.java).

### TC_001 — Đăng nhập Admin

- **Test Case ID:** TC_001
- **Test Case Name:** Đăng nhập Admin
- **Preconditions:** Tài khoản hoạt động
- **Test Data:** `ADMIN_A`

**Test Steps:**

1. Mở `/admin/login`.
2. Đăng nhập.

- **Expected Result:** Vào khu vực Admin; dữ liệu thuộc A.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_002 — Đăng nhập Operator

- **Test Case ID:** TC_002
- **Test Case Name:** Đăng nhập Operator
- **Preconditions:** Tài khoản hoạt động
- **Test Data:** `OPERATOR_A`

**Test Steps:**

1. Mở `/operator/login`.
2. Đăng nhập.

- **Expected Result:** Vào khu vực Operator; dữ liệu thuộc A.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_003 — Đăng nhập Super Admin

- **Test Case ID:** TC_003
- **Test Case Name:** Đăng nhập Super Admin
- **Preconditions:** Tài khoản hoạt động; màn hình desktop
- **Test Data:** `SUPER_ADMIN`

**Test Steps:**

1. Đăng nhập qua `/admin/login`.
2. Xem header và cài đặt.

- **Expected Result:** Dùng chung khu vực Admin; có bộ chọn A/B và phần thương hiệu chung.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_004 — Gọi API khi chưa xác thực

- **Test Case ID:** TC_004
- **Test Case Name:** Gọi API khi chưa xác thực
- **Preconditions:** Chưa đăng nhập
- **Test Data:** Không có token hoặc token không hợp lệ

**Test Steps:**

1. Gọi API Admin/Operator với từng trường hợp.
2. Kiểm tra mã lỗi và response; xác nhận không có dữ liệu vận hành trong body.

- **Expected Result:** Bị từ chối; không trả dữ liệu vận hành.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_005 — Operator truy cập API Admin

- **Test Case ID:** TC_005
- **Test Case Name:** Operator truy cập API Admin
- **Preconditions:** Operator đã đăng nhập
- **Test Data:** Token `OPERATOR_A`

**Test Steps:**

1. Gọi `GET /api/v1/admin/dashboard` với khoảng ngày hợp lệ.
2. Kiểm tra mã HTTP và nội dung response bằng token Operator.

- **Expected Result:** Trả `403`; không trả dashboard Admin.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_006 — Admin/Operator tự đổi store

- **Test Case ID:** TC_006
- **Test Case Name:** Admin/Operator tự đổi store
- **Preconditions:** Tài khoản thuộc A
- **Test Data:** Token Admin/Operator; header `X-CAS-Store-Id: B`

**Test Steps:**

1. Gọi API quản trị tương ứng với từng role và header B.
2. Đối chiếu response và dữ liệu B trước/sau request; chạy riêng cho Admin và Operator.

- **Expected Result:** Bị từ chối; không đọc hoặc cập nhật dữ liệu B.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_031 — Sai thông tin đăng nhập

- **Test Case ID:** TC_031
- **Test Case Name:** Sai thông tin đăng nhập
- **Preconditions:** Tài khoản test đã tồn tại.
- **Test Data:** Email đúng, mật khẩu sai.

**Test Steps:**

1. Mở trang đăng nhập Admin hoặc Operator.
2. Nhập mật khẩu sai và gửi form.

- **Expected Result:** Hiển thị lỗi đăng nhập; không vào workspace và không tải dữ liệu quản trị.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_032 — Firebase hợp lệ nhưng chưa có tài khoản CAS

- **Test Case ID:** TC_032
- **Test Case Name:** Firebase hợp lệ nhưng chưa có tài khoản CAS
- **Preconditions:** Có Firebase user chưa được ánh xạ vào accounts.
- **Test Data:** Firebase ID Token của user đó.

**Test Steps:**

1. Đăng nhập bằng user này.
2. Gọi API xác thực tài khoản vận hành.

- **Expected Result:** Backend từ chối quyền vận hành; frontend không cho vào workspace.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_033 — Tài khoản CAS bị vô hiệu hóa

- **Test Case ID:** TC_033
- **Test Case Name:** Tài khoản CAS bị vô hiệu hóa
- **Preconditions:** Operator đang đăng nhập, còn token hợp lệ; Admin có quyền khóa.
- **Test Data:** OPERATOR_A chuyển INACTIVE.

**Test Steps:**

1. Admin vô hiệu hóa Operator.
2. Operator gọi lại API bằng token cũ.

- **Expected Result:** Request mới bị từ chối dù Firebase token chưa hết hạn.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_034 — Đăng xuất và truy cập lại trang được bảo vệ

- **Test Case ID:** TC_034
- **Test Case Name:** Đăng xuất và truy cập lại trang được bảo vệ
- **Preconditions:** Đã đăng nhập Admin hoặc Operator.
- **Test Data:** Trang workspace đã mở.

**Test Steps:**

1. Đăng xuất.
2. Nhập lại URL workspace hoặc nhấn Back và thử thao tác.

- **Expected Result:** Yêu cầu đăng nhập lại; không thực hiện được API cần xác thực.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_035 — Customer không có cookie phiên

- **Test Case ID:** TC_035
- **Test Case Name:** Customer không có cookie phiên
- **Preconditions:** Trình duyệt mới, không có ngữ cảnh Customer.
- **Test Data:** Request tạo order hoặc xem bill.

**Test Steps:**

1. Gọi API Customer cần session khi chưa quét/chọn phiên.
2. Kiểm tra response và dữ liệu.

- **Expected Result:** Bị từ chối; không lộ bill, không tạo order cho một phiên bất kỳ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 2. Super Admin và phạm vi store

Đối chiếu: [nguồn triển khai/nghiệp vụ](../frontend/src/components/admin/admin-store-selector.tsx).

### TC_007 — Super Admin đổi store

- **Test Case ID:** TC_007
- **Test Case Name:** Super Admin đổi store
- **Preconditions:** Đã đăng nhập; màn hình desktop
- **Test Data:** Store B

**Test Steps:**

1. Chọn B.
2. Mở dashboard và cài đặt store.

- **Expected Result:** Request Admin mang `X-CAS-Store-Id: B`; hiển thị dữ liệu B.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_008 — Giữ store sau reload

- **Test Case ID:** TC_008
- **Test Case Name:** Giữ store sau reload
- **Preconditions:** Super Admin đã chọn B trong cùng tab
- **Test Data:** Store B

**Test Steps:**

1. Reload trang Admin.
2. Kiểm tra request đầu tiên và dữ liệu.

- **Expected Result:** Request quản trị đầu tiên mang header B; dữ liệu vẫn thuộc B.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_009 — Store mặc định khi chưa chọn

- **Test Case ID:** TC_009
- **Test Case Name:** Store mặc định khi chưa chọn
- **Preconditions:** Phiên trình duyệt mới; chưa lưu lựa chọn
- **Test Data:** Super Admin có `accounts.store_id = A`

**Test Steps:**

1. Đăng nhập.
2. Mở cài đặt store.

- **Expected Result:** Mặc định dùng A; có thể chọn B sau đó.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_010 — Store được chọn không hợp lệ

- **Test Case ID:** TC_010
- **Test Case Name:** Store được chọn không hợp lệ
- **Preconditions:** Super Admin đã đăng nhập
- **Test Data:** Header store: `abc`, `0`, ID không tồn tại

**Test Steps:**

1. Gọi API Admin lần lượt với từng giá trị.
2. Kiểm tra từng response; không tiếp tục thao tác bằng dữ liệu store mặc định khi lựa chọn sai.

- **Expected Result:** Bị từ chối; không tự chuyển sang store khác.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_036 — Đổi store rồi gọi API Operator trong Admin

- **Test Case ID:** TC_036
- **Test Case Name:** Đổi store rồi gọi API Operator trong Admin
- **Preconditions:** Super Admin đang quản trị A; A/B có dịch vụ riêng.
- **Test Data:** Store B và trang dịch vụ Admin.

**Test Steps:**

1. Chọn B.
2. Mở dịch vụ và kiểm tra request /api/v1/operator/ phát sinh từ trang Admin.

- **Expected Result:** Request mang header B; dữ liệu trả về và thay đổi thuộc B.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_037 — Đăng nhập Admin sau Super Admin

- **Test Case ID:** TC_037
- **Test Case Name:** Đăng nhập Admin sau Super Admin
- **Preconditions:** Cùng tab từng lưu lựa chọn B của Super Admin.
- **Test Data:** ADMIN_A.

**Test Steps:**

1. Đăng xuất Super Admin.
2. Đăng nhập ADMIN_A và mở cài đặt, catalog.

- **Expected Result:** Xóa scope lưu từ Super Admin; không gắn header B; dùng store A của Admin.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_038 — Lấy ID tài nguyên của store khác

- **Test Case ID:** TC_038
- **Test Case Name:** Lấy ID tài nguyên của store khác
- **Preconditions:** Admin A hoặc Super Admin đã chọn A; biết ID tài nguyên B.
- **Test Data:** ID món, khách hàng, payment và dịch vụ của B.

**Test Steps:**

1. Gọi các API đọc/sửa/xác nhận tương ứng bằng từng ID B.
2. Đối chiếu dữ liệu B trước và sau.

- **Expected Result:** Không đọc được dữ liệu vận hành B, không sửa hoặc xác nhận chéo store; lỗi không tiết lộ chi tiết tài nguyên B.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_039 — Đổi store khi còn cache giao diện

- **Test Case ID:** TC_039
- **Test Case Name:** Đổi store khi còn cache giao diện
- **Preconditions:** Super Admin đã mở catalog và danh sách dịch vụ A.
- **Test Data:** Store B có tên món/dịch vụ khác A.

**Test Steps:**

1. Chọn B.
2. Mở lại các trang đã xem và đợi request hoàn tất.
3. Tạo một thay đổi thử ở B.

- **Expected Result:** Không trộn dữ liệu A/B; thao tác mới lưu ở B, không ảnh hưởng A.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 3. Cài đặt store, brand và Welcome

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/store/controller/StoreWelcomeConfigController.java).

### TC_011 — Cập nhật riêng từng store

- **Test Case ID:** TC_011
- **Test Case Name:** Cập nhật riêng từng store
- **Preconditions:** Admin A đã đăng nhập; đã ghi nhận dữ liệu B
- **Test Data:** Địa chỉ và giờ mở cửa mới của A

**Test Steps:**

1. Lưu cài đặt A.
2. Tải lại A.
3. Dùng Super Admin kiểm tra B.

- **Expected Result:** A lưu đúng; B giữ nguyên; tên/logo thương hiệu không đổi.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_012 — Thương hiệu dùng chung

- **Test Case ID:** TC_012
- **Test Case Name:** Thương hiệu dùng chung
- **Preconditions:** Super Admin đã đăng nhập; có logo upload hợp lệ
- **Test Data:** Tên, logo và slogan mới

**Test Steps:**

1. Lưu cài đặt thương hiệu.
2. Tải lại giao diện Customer của A và B.

- **Expected Result:** Hai store hiển thị cùng tên/logo/slogan mới; thông tin riêng từng store giữ nguyên.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_013 — Admin không được sửa brand

- **Test Case ID:** TC_013
- **Test Case Name:** Admin không được sửa brand
- **Preconditions:** Admin A đã đăng nhập
- **Test Data:** Payload thương hiệu hợp lệ

**Test Steps:**

1. Mở cài đặt.
2. Gọi `PUT /api/v1/admin/brand/settings`.

- **Expected Result:** Không hiển thị form sửa brand; API trả `403`; brand không đổi.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_040 — Validation thông tin store

- **Test Case ID:** TC_040
- **Test Case Name:** Validation thông tin store
- **Preconditions:** Admin A đã ghi nhận cài đặt hiện tại.
- **Test Data:** Tên chi nhánh trống; email sai; trạng thái không hỗ trợ.

**Test Steps:**

1. Gửi từng payload sai qua UI/API, các trường còn lại hợp lệ.
2. Tải lại cài đặt.

- **Expected Result:** Báo lỗi tương ứng; không ghi payload sai hoặc thay đổi một phần cài đặt.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_041 — Public chỉ liệt kê store hoạt động

- **Test Case ID:** TC_041
- **Test Case Name:** Public chỉ liệt kê store hoạt động
- **Preconditions:** Có A ACTIVE và một store test INACTIVE.
- **Test Data:** API danh sách và chi tiết store công khai.

**Test Steps:**

1. Gọi danh sách store không kèm token.
2. Gọi chi tiết store INACTIVE.

- **Expected Result:** Danh sách chỉ chứa store ACTIVE; store INACTIVE không trả chi tiết công khai như store đang hoạt động.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_042 — Welcome riêng từng cơ sở

- **Test Case ID:** TC_042
- **Test Case Name:** Welcome riêng từng cơ sở
- **Preconditions:** Có ảnh Cloudinary hợp lệ của A/B; Admin A đăng nhập.
- **Test Data:** Cấu hình ảnh Welcome ACTIVE của A.

**Test Steps:**

1. Lưu cấu hình Welcome A.
2. Tải trang giới thiệu A và B.

- **Expected Result:** A hiển thị ảnh đúng vị trí cấu hình; Welcome B giữ nguyên.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_043 — Tắt và xóa Welcome

- **Test Case ID:** TC_043
- **Test Case Name:** Tắt và xóa Welcome
- **Preconditions:** A đã có Welcome ACTIVE.
- **Test Data:** Status INACTIVE; sau đó thao tác xóa.

**Test Steps:**

1. Chuyển Welcome A sang INACTIVE và xem public.
2. Xóa cấu hình rồi tải lại public.

- **Expected Result:** Không trả nội dung Welcome không hoạt động/đã xóa; trang public xử lý trạng thái thiếu cấu hình.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_044 — Ảnh không thuộc store hoặc sai nguồn

- **Test Case ID:** TC_044
- **Test Case Name:** Ảnh không thuộc store hoặc sai nguồn
- **Preconditions:** Admin A đã có cấu hình hợp lệ.
- **Test Data:** Ảnh/key B; URL ngoài Cloudinary; cặp URL/key không khớp.

**Test Steps:**

1. Thử lưu Welcome hoặc ảnh món A với từng cặp ảnh sai.
2. Tải lại dữ liệu.

- **Expected Result:** Từ chối ảnh sai; giữ dữ liệu đã lưu và không xóa ảnh hợp lệ của B.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_045 — Quyền cấp chữ ký upload logo

- **Test Case ID:** TC_045
- **Test Case Name:** Quyền cấp chữ ký upload logo
- **Preconditions:** Có token Admin A và Super Admin; Cloudinary cấu hình trên test.
- **Test Data:** Purpose BRAND_LOGO.

**Test Steps:**

1. Admin gọi API cấp chữ ký logo.
2. Super Admin gọi cùng API, upload rồi lưu logo.

- **Expected Result:** Admin bị từ chối; Super Admin upload được vào phạm vi brand chung; response không lộ API secret.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 4. Quản lý bàn và QR

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/store/service/DiningTableService.java).

### TC_015 — QR đã bị thu hồi

- **Test Case ID:** TC_015
- **Test Case Name:** QR đã bị thu hồi
- **Preconditions:** Admin có quyền quản lý bàn A
- **Test Data:** QR cũ của bàn

**Test Steps:**

1. Admin cấp lại QR.
2. Quét QR cũ.
3. Quét QR mới.

- **Expected Result:** QR cũ bị từ chối; QR mới dùng được; session đang có không bị xóa.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_046 — Tạo bàn và cấp QR lần đầu

- **Test Case ID:** TC_046
- **Test Case Name:** Tạo bàn và cấp QR lần đầu
- **Preconditions:** Admin A đăng nhập; chưa có mã bàn 99 ở A.
- **Test Data:** Code 99; capacity 4.

**Test Steps:**

1. Tạo bàn.
2. Mở danh sách và lấy QR của bàn mới.

- **Expected Result:** Bàn thuộc A; có một QR ACTIVE dùng được; lưu người tạo và audit.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_047 — Mã bàn trùng trong cùng store

- **Test Case ID:** TC_047
- **Test Case Name:** Mã bàn trùng trong cùng store
- **Preconditions:** A đã có bàn 99; B chưa có bàn 99.
- **Test Data:** Code 99.

**Test Steps:**

1. Tạo thêm bàn 99 tại A.
2. Super Admin chọn B rồi tạo bàn 99.

- **Expected Result:** A từ chối trùng mã; B cho phép cùng mã vì khác store.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_048 — Mã bàn và sức chứa không hợp lệ

- **Test Case ID:** TC_048
- **Test Case Name:** Mã bàn và sức chứa không hợp lệ
- **Preconditions:** Admin đăng nhập.
- **Test Data:** Code 0 hoặc âm; capacity âm.

**Test Steps:**

1. Gửi từng trường hợp qua API tạo bàn.
2. Kiểm tra danh sách bàn và QR.

- **Expected Result:** Bị validation từ chối; không tạo bàn/QR dở dang.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_049 — Xóa bàn chưa sử dụng

- **Test Case ID:** TC_049
- **Test Case Name:** Xóa bàn chưa sử dụng
- **Preconditions:** Bàn test có QR, chưa có session hoặc lịch sử tham chiếu.
- **Test Data:** ID bàn test.

**Test Steps:**

1. Xóa bàn.
2. Tải lại danh sách và thử quét QR vừa xóa.

- **Expected Result:** Bàn và QR không còn sử dụng được; có audit xóa.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_050 — Xóa bàn đã có lịch sử

- **Test Case ID:** TC_050
- **Test Case Name:** Xóa bàn đã có lịch sử
- **Preconditions:** Bàn có session/order được lưu; ghi lại QR hiện tại.
- **Test Data:** ID bàn đang được tham chiếu.

**Test Steps:**

1. Thử xóa bàn.
2. Kiểm tra bàn, QR và lịch sử sau request.

- **Expected Result:** Báo bàn đang được sử dụng/tham chiếu; rollback, không mất QR hoặc lịch sử.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 5. Catalog, option, tag và ảnh

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/catalog/service/CatalogService.java).

### TC_051 — Tạo và sửa danh mục

- **Test Case ID:** TC_051
- **Test Case Name:** Tạo và sửa danh mục
- **Preconditions:** Admin A đăng nhập.
- **Test Data:** Danh mục REGULAR ACTIVE, tên và thứ tự mới.

**Test Steps:**

1. Tạo danh mục.
2. Đổi tên/thứ tự rồi tải menu Customer A.

- **Expected Result:** Lưu đúng store A; menu hiển thị danh mục theo cấu hình hiện hành.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_052 — Ẩn danh mục khỏi menu public

- **Test Case ID:** TC_052
- **Test Case Name:** Ẩn danh mục khỏi menu public
- **Preconditions:** Danh mục ACTIVE chứa món đang bán.
- **Test Data:** Status INACTIVE.

**Test Steps:**

1. Admin ẩn danh mục.
2. Customer tải lại menu.

- **Expected Result:** Món thuộc danh mục ẩn không còn được public như món đang bán; dữ liệu quản trị vẫn còn.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_053 — Tạo món kèm tag và nhóm option

- **Test Case ID:** TC_053
- **Test Case Name:** Tạo món kèm tag và nhóm option
- **Preconditions:** Danh mục, tag và option group đều thuộc A.
- **Test Data:** Món 50.000đ, liên kết tag và nhóm option.

**Test Steps:**

1. Tạo món ACTIVE và mở lại form.
2. Mở chi tiết món Customer.

- **Expected Result:** Giá, tag, nhóm option lưu đúng; Customer chọn được các option hợp lệ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_054 — Chặn liên kết catalog chéo store

- **Test Case ID:** TC_054
- **Test Case Name:** Chặn liên kết catalog chéo store
- **Preconditions:** Admin A đăng nhập; biết ID category/tag/group B.
- **Test Data:** Payload món A lần lượt tham chiếu category, tag hoặc group B.

**Test Steps:**

1. Gửi từng payload qua API tạo/sửa món.
2. Kiểm tra món và liên kết sau request.

- **Expected Result:** Từ chối toàn bộ thao tác sai; không lưu món hoặc liên kết chéo store.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_055 — Validation giá món và phụ thu

- **Test Case ID:** TC_055
- **Test Case Name:** Validation giá món và phụ thu
- **Preconditions:** Admin đăng nhập; có món/option hợp lệ.
- **Test Data:** Giá món -1; phụ thu option -1; giá hợp lệ 50.000.

**Test Steps:**

1. Thử lưu từng giá âm.
2. Lưu giá hợp lệ rồi tải lại.

- **Expected Result:** Giá âm bị từ chối; tiền hợp lệ được lưu chính xác, không sai số số thực.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_056 — Cấu hình giới hạn nhóm option

- **Test Case ID:** TC_056
- **Test Case Name:** Cấu hình giới hạn nhóm option
- **Preconditions:** Admin có quyền catalog.
- **Test Data:** min_select 2, max_select 1; cấu hình MULTIPLE min 1 max 2.

**Test Steps:**

1. Thử lưu min lớn hơn max.
2. Lưu cấu hình hợp lệ và mở lại.

- **Expected Result:** Cấu hình sai bị từ chối; cấu hình hợp lệ được lưu và áp dụng.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_057 — Quản lý tag và option value

- **Test Case ID:** TC_057
- **Test Case Name:** Quản lý tag và option value
- **Preconditions:** Admin có tag/group chưa được dùng trong order.
- **Test Data:** Tag Test; option Test phụ thu 10.000đ.

**Test Steps:**

1. Tạo tag và option value.
2. Đổi tên, phụ thu và trạng thái rồi tải lại.

- **Expected Result:** Lưu đúng thay đổi trong A; option public chỉ hiển thị khi trạng thái phù hợp.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_058 — Xóa tài nguyên catalog đang được tham chiếu

- **Test Case ID:** TC_058
- **Test Case Name:** Xóa tài nguyên catalog đang được tham chiếu
- **Preconditions:** Danh mục có món; group/value đã được liên kết hoặc dùng trong order.
- **Test Data:** ID tài nguyên đang có FK tham chiếu.

**Test Steps:**

1. Thử xóa từng tài nguyên đang được tham chiếu.
2. Kiểm tra dữ liệu và order cũ.

- **Expected Result:** Trả lỗi đang được sử dụng khi FK ngăn xóa; không mất một phần liên kết hoặc lịch sử order.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_059 — Operator đổi trạng thái bán

- **Test Case ID:** TC_059
- **Test Case Name:** Operator đổi trạng thái bán
- **Preconditions:** Operator A đăng nhập; có món ACTIVE và món INACTIVE.
- **Test Data:** ACTIVE → SOLD_OUT → ACTIVE; ID món INACTIVE.

**Test Steps:**

1. Đổi trạng thái món đang bán sang hết hàng rồi bán lại.
2. Thử bật món Admin đã ẩn.

- **Expected Result:** Hai thao tác availability hợp lệ thành công; Operator không bật lại món INACTIVE.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_060 — Upload và thay ảnh món

- **Test Case ID:** TC_060
- **Test Case Name:** Upload và thay ảnh món
- **Preconditions:** Cloudinary test hoạt động; món A có ảnh cũ riêng.
- **Test Data:** File ảnh hợp lệ của A.

**Test Steps:**

1. Lấy chữ ký, upload ảnh mới và lưu món.
2. Tải lại chi tiết món.

- **Expected Result:** Ảnh mới hiển thị, URL/key khớp; ảnh cũ được xử lý sau commit, không làm ảnh hưởng store khác.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 6. Customer — vào quán, thông tin khách và session

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/store/service/SalesSessionService.java).

### TC_014 — Mở phiên từ QR bàn

- **Test Case ID:** TC_014
- **Test Case Name:** Mở phiên từ QR bàn
- **Preconditions:** Bàn chưa có session
- **Test Data:** QR A; tên `Khách Test`; SĐT để trống

**Test Steps:**

1. Quét QR.
2. Chọn ăn tại bàn và tạo phiên.
3. Nhập tên.

- **Expected Result:** Tạo session `OPEN` đúng store/bàn; vào menu; chấp nhận SĐT trống.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_016 — Hai thiết bị dùng chung phiên

- **Test Case ID:** TC_016
- **Test Case Name:** Hai thiết bị dùng chung phiên
- **Preconditions:** Thiết bị 1 đã mở session và có order
- **Test Data:** Cùng QR; thiết bị 2 chưa có cookie session

**Test Steps:**

1. Thiết bị 2 quét QR.
2. Chọn chung session hiện có.

- **Expected Result:** Không tạo phiên mới; hai thiết bị xem cùng order/bill.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_061 — Nhập số bàn thay cho QR

- **Test Case ID:** TC_061
- **Test Case Name:** Nhập số bàn thay cho QR
- **Preconditions:** Store A ACTIVE có bàn số 1.
- **Test Data:** Số bàn 01 và 1.

**Test Steps:**

1. Chọn chi nhánh A và nhập 01.
2. Lặp lại trong phiên trình duyệt mới với số 1.

- **Expected Result:** Cả hai xác định cùng bàn 1; không nhầm chi nhánh.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_062 — QR và số bàn không tồn tại

- **Test Case ID:** TC_062
- **Test Case Name:** QR và số bàn không tồn tại
- **Preconditions:** Chưa có session Customer.
- **Test Data:** QR giả; số bàn không có tại A.

**Test Steps:**

1. Thử vào bằng QR giả.
2. Thử chọn A và số bàn không tồn tại.

- **Expected Result:** Báo không tìm thấy/QR không hợp lệ; không tạo session.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_063 — Tên khách bắt buộc, SĐT tùy chọn tại bàn

- **Test Case ID:** TC_063
- **Test Case Name:** Tên khách bắt buộc, SĐT tùy chọn tại bàn
- **Preconditions:** Chuẩn bị tạo session DINE_IN.
- **Test Data:** Tên trống; tên có chữ; SĐT trống.

**Test Steps:**

1. Thử tạo phiên không nhập tên.
2. Nhập tên rồi để trống SĐT và gửi.

- **Expected Result:** Tên trống bị chặn; tên hợp lệ với SĐT trống tạo được khách lẻ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_064 — SĐT được nhập nhưng sai định dạng

- **Test Case ID:** TC_064
- **Test Case Name:** SĐT được nhập nhưng sai định dạng
- **Preconditions:** Customer đang ở form thông tin khách.
- **Test Data:** SĐT chứa chữ hoặc chuỗi không đúng validation hiện hành.

**Test Steps:**

1. Nhập tên hợp lệ, lần lượt thử SĐT sai.
2. Thử lại với SĐT hợp lệ.

- **Expected Result:** Thông báo lỗi cho giá trị sai; không âm thầm lưu SĐT sai.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_065 — Nhận diện khách theo SĐT trong store

- **Test Case ID:** TC_065
- **Test Case Name:** Nhận diện khách theo SĐT trong store
- **Preconditions:** Có khách tại A với SĐT test; B chưa có khách cùng SĐT.
- **Test Data:** Cùng SĐT, tên hiển thị mới.

**Test Steps:**

1. Tạo phiên A bằng SĐT cũ.
2. Tạo phiên B cùng SĐT.

- **Expected Result:** A dùng lại client_account của A; B không dùng ID khách của A; snapshot tên phiên được lưu đúng.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_066 — Tạo phiên độc lập cùng bàn

- **Test Case ID:** TC_066
- **Test Case Name:** Tạo phiên độc lập cùng bàn
- **Preconditions:** Bàn A có một session OPEN và order.
- **Test Data:** Tên Khách 2; lựa chọn Không chung bàn.

**Test Steps:**

1. Thiết bị mới quét QR.
2. Chọn Không chung bàn và nhập tên.

- **Expected Result:** Tạo session riêng tại cùng bàn; bill/order không trộn với session trước.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_067 — Customer tạo phiên mang về

- **Test Case ID:** TC_067
- **Test Case Name:** Customer tạo phiên mang về
- **Preconditions:** Store A hoạt động; trình duyệt chưa có phiên.
- **Test Data:** TAKEAWAY; tên và SĐT test hợp lệ.

**Test Steps:**

1. Chọn A và Mang về.
2. Thử thiếu SĐT, sau đó nhập đầy đủ và tạo phiên.

- **Expected Result:** Thiếu SĐT bị chặn; phiên hợp lệ là TAKEAWAY, không gắn bàn.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_068 — Hủy phiên chưa có order

- **Test Case ID:** TC_068
- **Test Case Name:** Hủy phiên chưa có order
- **Preconditions:** Customer đang có session OPEN không có order.
- **Test Data:** Session hiện tại.

**Test Steps:**

1. Chọn hủy phiên.
2. Đọc lại current session và kiểm tra danh sách phiên vận hành.

- **Expected Result:** Phiên bị hủy, không còn là phiên đang phục vụ; cookie cũ không dùng tiếp để đặt món.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_069 — Chặn hủy phiên đã có order

- **Test Case ID:** TC_069
- **Test Case Name:** Chặn hủy phiên đã có order
- **Preconditions:** Session OPEN có ít nhất một order.
- **Test Data:** Session đã đặt món.

**Test Steps:**

1. Customer thử hủy phiên.
2. Operator thử hủy cùng phiên qua API.

- **Expected Result:** Cả hai bị từ chối; order và phiên còn nguyên.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 7. Customer — menu, giỏ hàng và order

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/ordering/service/CustomerOrderingService.java).

### TC_017 — Gọi món có option

- **Test Case ID:** TC_017
- **Test Case Name:** Gọi món có option
- **Preconditions:** Session `OPEN`; món và option đang bán; nhóm cho chọn 1 option
- **Test Data:** Món 50.000đ; option 10.000đ; số lượng 2

**Test Steps:**

1. Chọn món, option và số lượng.
2. Gửi order.
3. Xem bill.

- **Expected Result:** Một order mới; tổng 120.000đ; giá món/option được snapshot.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_018 — Món hết hàng khi gửi order

- **Test Case ID:** TC_018
- **Test Case Name:** Món hết hàng khi gửi order
- **Preconditions:** Khách đã thêm món vào giỏ
- **Test Data:** Món vừa chuyển `SOLD_OUT`

**Test Steps:**

1. Operator đánh dấu hết hàng.
2. Khách gửi order từ giỏ cũ.

- **Expected Result:** Báo món hết hàng; không tạo order chứa món đó.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_019 — Gửi order lặp

- **Test Case ID:** TC_019
- **Test Case Name:** Gửi order lặp
- **Preconditions:** Session `OPEN`; payload hợp lệ
- **Test Data:** Cùng payload và `idempotency_key`

**Test Steps:**

1. Gửi request tạo order.
2. Gửi lại nguyên request.

- **Expected Result:** Trả cùng order; không nhân đôi số lượng hoặc tổng tiền.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_070 — Xem menu công khai

- **Test Case ID:** TC_070
- **Test Case Name:** Xem menu công khai
- **Preconditions:** Trình duyệt mới, chưa chọn session; có catalog public.
- **Test Data:** Không token, không cookie.

**Test Steps:**

1. Mở menu và xem chi tiết món.
2. Thử gửi order khi chưa có session.

- **Expected Result:** Xem được catalog public; gửi order vẫn yêu cầu ngữ cảnh phiên hợp lệ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_071 — Giỏ hàng cập nhật số lượng và option

- **Test Case ID:** TC_071
- **Test Case Name:** Giỏ hàng cập nhật số lượng và option
- **Preconditions:** Customer có session A; món và option hợp lệ.
- **Test Data:** Món 50.000đ; option 10.000đ.

**Test Steps:**

1. Thêm 2 phần, đổi số lượng và option.
2. Xóa một dòng; gửi phần còn lại.

- **Expected Result:** Tổng giỏ tính đúng; request gửi đúng cấu hình và số lượng đang hiển thị.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_072 — Gọi thêm tạo order mới cùng phiên

- **Test Case ID:** TC_072
- **Test Case Name:** Gọi thêm tạo order mới cùng phiên
- **Preconditions:** Session OPEN đã có một order.
- **Test Data:** Món mới; idempotency key mới.

**Test Steps:**

1. Gửi một lần gọi thêm.
2. Xem lịch sử order và bill.

- **Expected Result:** Tạo order thứ hai trong cùng session; bill cộng cả hai order, không sửa order trước.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_073 — Cùng key nhưng nội dung order khác

- **Test Case ID:** TC_073
- **Test Case Name:** Cùng key nhưng nội dung order khác
- **Preconditions:** Đã tạo order với key K.
- **Test Data:** K; số lượng đổi từ 1 thành 2.

**Test Steps:**

1. Gửi lại request cùng K nhưng payload khác.
2. Đọc lại order/bill.

- **Expected Result:** Trả lỗi xung đột; không sửa order cũ, không tạo order mới.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_074 — Số lượng order không hợp lệ

- **Test Case ID:** TC_074
- **Test Case Name:** Số lượng order không hợp lệ
- **Preconditions:** Session OPEN; món đang bán.
- **Test Data:** quantity 0, -1; danh sách món rỗng.

**Test Steps:**

1. Gửi từng payload sai qua API.
2. Kiểm tra số order và tổng bill.

- **Expected Result:** Bị validation từ chối; không tạo order hoặc dòng món dở dang.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_075 — Option không thuộc món hoặc đã ẩn

- **Test Case ID:** TC_075
- **Test Case Name:** Option không thuộc món hoặc đã ẩn
- **Preconditions:** Món A đang bán, đã ghi nhận bill.
- **Test Data:** Option của món khác; option INACTIVE; option của B.

**Test Steps:**

1. Gửi order lần lượt với từng option sai.
2. Đọc lại bill.

- **Expected Result:** Từ chối order sai; không tính tiền hoặc liên kết option trái phép.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_076 — Vi phạm min/max option

- **Test Case ID:** TC_076
- **Test Case Name:** Vi phạm min/max option
- **Preconditions:** Món có nhóm MULTIPLE min 1 max 2.
- **Test Data:** Không chọn option; chọn 3 option.

**Test Steps:**

1. Thử submit bằng UI.
2. Gửi API trực tiếp bỏ qua kiểm tra UI.

- **Expected Result:** Cả UI/API bảo vệ giới hạn; không tạo order không hợp lệ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_077 — Giữ giá snapshot sau khi menu đổi

- **Test Case ID:** TC_077
- **Test Case Name:** Giữ giá snapshot sau khi menu đổi
- **Preconditions:** Đã đặt 2 phần món 50.000đ và option 10.000đ.
- **Test Data:** Giá mới món 70.000đ, option 20.000đ.

**Test Steps:**

1. Admin đổi giá.
2. Khách đọc order/bill cũ; sau đó đặt 1 phần mới cùng cấu hình.

- **Expected Result:** Order cũ vẫn 120.000đ; order mới 90.000đ, dùng giá server tại lúc tạo.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_078 — Không tin giá do client sửa

- **Test Case ID:** TC_078
- **Test Case Name:** Không tin giá do client sửa
- **Preconditions:** Session OPEN; món trên server giá 50.000đ.
- **Test Data:** Request bị sửa thêm giá/tổng tiền thành 1đ.

**Test Steps:**

1. Chặn request bằng công cụ trình duyệt và sửa giá/tổng.
2. Gửi rồi đọc bill.

- **Expected Result:** Backend dùng giá tin cậy hoặc từ chối trường sai; không tạo bill 1đ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 8. Operator — tạo order, chế biến và cảnh báo

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/ordering/service/PreparationService.java).

### TC_021 — Tạo order hộ khách

- **Test Case ID:** TC_021
- **Test Case Name:** Tạo order hộ khách
- **Preconditions:** Operator A đã đăng nhập; có session `OPEN` ở A
- **Test Data:** Session A; món A; số lượng 1

**Test Steps:**

1. Mở tạo order.
2. Chọn session, món và gửi.

- **Expected Result:** Order thuộc đúng session A; Customer nhìn thấy order mới.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_022 — Hoàn thành món theo FIFO

- **Test Case ID:** TC_022
- **Test Case Name:** Hoàn thành món theo FIFO
- **Preconditions:** Hai order cùng món/option, chưa làm; thời điểm tạo khác nhau
- **Test Data:** Order cũ 2 phần; order mới 2 phần; hoàn thành 3

**Test Steps:**

1. Mở nhóm chế biến.
2. Ghi nhận làm xong 3 phần.

- **Expected Result:** Order cũ được 2, order mới được 1; còn 1 phần cần làm.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_079 — Operator tạo order mang về

- **Test Case ID:** TC_079
- **Test Case Name:** Operator tạo order mang về
- **Preconditions:** Operator A đăng nhập; catalog A hoạt động.
- **Test Data:** Tên, SĐT test; TAKEAWAY; món A.

**Test Steps:**

1. Mở tạo order và chọn Mang về.
2. Nhập khách, món và gửi.

- **Expected Result:** Tạo session TAKEAWAY/order đúng A, không gắn bàn; có thể tiếp tục chế biến/thanh toán.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_080 — Gộp nhóm theo món và option

- **Test Case ID:** TC_080
- **Test Case Name:** Gộp nhóm theo món và option
- **Preconditions:** Có nhiều order OPEN cùng store.
- **Test Data:** Hai dòng cùng option; một dòng khác option.

**Test Steps:**

1. Mở danh sách chế biến.
2. Đối chiếu số lượng từng nhóm với order gốc.

- **Expected Result:** Chỉ gộp đúng cùng món và toàn bộ cấu hình option; option khác nằm nhóm riêng.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_081 — Hoàn thành mẻ vượt số còn cần làm

- **Test Case ID:** TC_081
- **Test Case Name:** Hoàn thành mẻ vượt số còn cần làm
- **Preconditions:** Nhóm còn 2 phần; chưa có thao tác khác.
- **Test Data:** Ghi nhận 3 phần.

**Test Steps:**

1. Gửi hoàn thành 3 phần qua API.
2. Đọc lại prepared_quantity và audit.

- **Expected Result:** Từ chối; prepared_quantity không vượt số lượng hiệu lực; không ghi nhận một phần.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_082 — Retry hoàn thành mẻ

- **Test Case ID:** TC_082
- **Test Case Name:** Retry hoàn thành mẻ
- **Preconditions:** Nhóm còn đủ phần; có payload hoàn thành hợp lệ.
- **Test Data:** Cùng payload và idempotency key.

**Test Steps:**

1. Gửi mẻ hoàn thành.
2. Gửi lại nguyên request và đọc số lượng.

- **Expected Result:** Trả kết quả đã lưu; không cộng prepared_quantity hoặc audit thêm lần nữa.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_083 — Hai nhân viên hoàn thành cùng nhóm

- **Test Case ID:** TC_083
- **Test Case Name:** Hai nhân viên hoàn thành cùng nhóm
- **Preconditions:** Hai Operator cùng store, cùng thấy còn 2 phần.
- **Test Data:** Hai request khác key, mỗi request 2 phần.

**Test Steps:**

1. Gửi hai request gần đồng thời.
2. Đọc lại tổng số đã làm và response mỗi request.

- **Expected Result:** Không hoàn thành quá 2 phần; thao tác mất điều kiện bị từ chối; dữ liệu cuối nhất quán.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_084 — Cảnh báo bàn chờ lâu

- **Test Case ID:** TC_084
- **Test Case Name:** Cảnh báo bàn chờ lâu
- **Preconditions:** Store A có order chưa hoàn thành; thời gian fixture kiểm soát được.
- **Test Data:** Ngưỡng 10 phút; order chờ 11 phút; sau đó ngưỡng 0.

**Test Steps:**

1. Admin đặt ngưỡng 10 và kiểm tra cảnh báo.
2. Hoàn thành order rồi kiểm tra lại; thử ngưỡng 0.

- **Expected Result:** Bàn chờ 11 phút được cảnh báo; hết phần cần làm thì mất cảnh báo; ngưỡng 0 tắt cảnh báo.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_085 — Validation ngưỡng chờ lâu

- **Test Case ID:** TC_085
- **Test Case Name:** Validation ngưỡng chờ lâu
- **Preconditions:** Admin đăng nhập; ghi lại ngưỡng hiện hành.
- **Test Data:** -1, 1441, 0, 1440.

**Test Steps:**

1. Gửi từng giá trị vào API cấu hình ngưỡng.
2. Đọc lại cấu hình sau mỗi lần.

- **Expected Result:** Từ chối ngoài 0–1440; hai biên hợp lệ được lưu đúng store.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 9. Hủy món, làm lại và chuyển phần đã làm

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/ordering/service/CancellationService.java).

### TC_020 — Hủy món đang chờ duyệt

- **Test Case ID:** TC_020
- **Test Case Name:** Hủy món đang chờ duyệt
- **Preconditions:** Session `OPEN`; dòng món còn đủ số lượng
- **Test Data:** Hủy 1 phần

**Test Steps:**

1. Gửi yêu cầu hủy.
2. Thử yêu cầu thanh toán trước khi được xử lý.

- **Expected Result:** Yêu cầu hủy `PENDING`; chưa giảm bill; chưa tạo payment.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_023 — Duyệt yêu cầu hủy

- **Test Case ID:** TC_023
- **Test Case Name:** Duyệt yêu cầu hủy
- **Preconditions:** Session `OPEN`; yêu cầu hủy 1 phần `PENDING`; món chưa chế biến
- **Test Data:** Dòng 2 phần × 50.000đ, không option/promotion

**Test Steps:**

1. Operator duyệt hủy, không chọn làm lại/chuyển món.
2. Xem bill.

- **Expected Result:** Yêu cầu `APPROVED`; bill dòng còn 50.000đ; số lượng gốc vẫn là 2.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_086 — Từ chối yêu cầu hủy

- **Test Case ID:** TC_086
- **Test Case Name:** Từ chối yêu cầu hủy
- **Preconditions:** Session OPEN; có yêu cầu PENDING.
- **Test Data:** Decision REJECT.

**Test Steps:**

1. Operator từ chối yêu cầu.
2. Customer đọc trạng thái và bill.

- **Expected Result:** Yêu cầu REJECTED; bill không giảm, số phần cần chế biến không bị trừ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_087 — Hủy quá số lượng còn lại

- **Test Case ID:** TC_087
- **Test Case Name:** Hủy quá số lượng còn lại
- **Preconditions:** Dòng gốc 2 phần, đã duyệt hủy 1.
- **Test Data:** Yêu cầu hủy thêm 2 phần.

**Test Steps:**

1. Gửi yêu cầu hủy qua API.
2. Kiểm tra yêu cầu và bill.

- **Expected Result:** Từ chối vì vượt số còn lại; không làm bill âm hoặc tạo yêu cầu không hợp lệ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_088 — Retry yêu cầu hủy

- **Test Case ID:** TC_088
- **Test Case Name:** Retry yêu cầu hủy
- **Preconditions:** Dòng còn đủ số lượng; session OPEN.
- **Test Data:** Cùng key, số lượng và lý do.

**Test Steps:**

1. Gửi yêu cầu hủy.
2. Gửi lại nguyên request và đếm yêu cầu.

- **Expected Result:** Trả cùng yêu cầu; không nhân đôi số lượng đang chờ hủy.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_089 — Xử lý lại yêu cầu đã giải quyết

- **Test Case ID:** TC_089
- **Test Case Name:** Xử lý lại yêu cầu đã giải quyết
- **Preconditions:** Yêu cầu đã APPROVED hoặc REJECTED.
- **Test Data:** Cùng ID yêu cầu.

**Test Steps:**

1. Gửi lại thao tác xử lý.
2. Đọc bill và lịch sử.

- **Expected Result:** Từ chối trạng thái không còn PENDING; không giảm bill lần hai.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_090 — Hủy và làm lại món hỏng

- **Test Case ID:** TC_090
- **Test Case Name:** Hủy và làm lại món hỏng
- **Preconditions:** Dòng 2 phần đã làm xong; session OPEN.
- **Test Data:** Hủy/làm lại 1 phần; lý do Làm đổ.

**Test Steps:**

1. Operator tạo hủy do sự cố và chọn Làm lại.
2. Xem order mới, bill và hàng chế biến.

- **Expected Result:** Hủy được APPROVED, is_remade=true; tạo order làm lại đúng món/option/số lượng; không tính tiền đúp.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_091 — Chuyển phần đã làm sang dòng phù hợp

- **Test Case ID:** TC_091
- **Test Case Name:** Chuyển phần đã làm sang dòng phù hợp
- **Preconditions:** Hai dòng cùng món/option; nguồn đã làm đủ và cần hủy 1; đích còn cần 1.
- **Test Data:** transferQuantity=1; ID dòng đích hợp lệ.

**Test Steps:**

1. Duyệt hủy và chuyển 1 phần đã làm.
2. Đọc nguồn, đích và bill từng phiên.

- **Expected Result:** Số đã làm chuyển đúng 1 phần, không vượt số hiệu lực; không đổi món/option hoặc chuyển bill giữa các phiên.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_092 — Chặn chuyển món khác option hoặc khác store

- **Test Case ID:** TC_092
- **Test Case Name:** Chặn chuyển món khác option hoặc khác store
- **Preconditions:** Yêu cầu hủy có phần đã làm có thể chuyển.
- **Test Data:** Đích khác option; đích B; số chuyển vượt số có thể chuyển.

**Test Steps:**

1. Gửi từng payload sai.
2. Kiểm tra yêu cầu, prepared_quantity nguồn/đích và bill.

- **Expected Result:** Từ chối toàn bộ; không chuyển nhầm phần đã làm hoặc ghi trạng thái hủy một phần.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_151 — Duyệt hủy đồng thời với hoàn thành mẻ

- **Test Case ID:** TC_151
- **Test Case Name:** Duyệt hủy đồng thời với hoàn thành mẻ
- **Preconditions:** Session OPEN có dòng 2 phần chưa làm, yêu cầu hủy 1 phần PENDING; hai Operator cùng store, có công cụ gửi đồng thời trên môi trường test.
- **Test Data:** Request duyệt hủy 1 phần; request hoàn thành mẻ 2 phần với idempotency key K.

**Test Steps:**

1. Gửi hai request gần đồng thời; ghi lại response và thứ tự hoàn tất quan sát được.
2. Đọc trạng thái hủy, số lượng gốc, số hủy APPROVED và prepared_quantity sau cả hai request; retry request hoàn thành với cùng key K.
3. Lặp lại trên fixture độc lập với thời điểm gửi đảo chiều.

- **Expected Result:** Transaction nhất quán; prepared_quantity không vượt số lượng hiệu lực sau hủy và retry không cộng trùng. Thao tác không còn hợp lệ phải bị từ chối; không yêu cầu một thao tác cụ thể luôn thắng hoặc tự đặt quy tắc cho phần chưa chốt.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 10. Yêu cầu và xác nhận thanh toán

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/payment/service/PaymentService.java).

### TC_024 — Tạo yêu cầu thanh toán

- **Test Case ID:** TC_024
- **Test Case Name:** Tạo yêu cầu thanh toán
- **Preconditions:** Session `OPEN`; có order; không còn yêu cầu hủy chờ duyệt
- **Test Data:** Bill 120.000đ, không promotion

**Test Steps:**

1. Customer yêu cầu thanh toán.
2. Thử gọi thêm món.

- **Expected Result:** Payment `PENDING` 120.000đ; session `PAYMENT_PENDING`; chặn gọi thêm; hướng dẫn gặp nhân viên.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_025 — Xác nhận PAID thủ công

- **Test Case ID:** TC_025
- **Test Case Name:** Xác nhận PAID thủ công
- **Preconditions:** Payment `PENDING`; nhân viên đã xác minh thanh toán bên ngoài CAS
- **Test Data:** Payment cùng store

**Test Steps:**

1. Operator xác nhận thanh toán.
2. Tải lại hai thiết bị Customer.

- **Expected Result:** Payment `PAID`, lưu người/thời điểm xác nhận; session `CLOSED`; Customer bỏ dữ liệu phiên cũ và cần quét QR để bắt đầu lượt mới.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_026 — Xác nhận payment lặp

- **Test Case ID:** TC_026
- **Test Case Name:** Xác nhận payment lặp
- **Preconditions:** Payment đã `PAID`; đã ghi nhận thời điểm và audit log
- **Test Data:** Cùng payment

**Test Steps:**

1. Gọi lại API xác nhận.
2. Đối chiếu dữ liệu.

- **Expected Result:** Vẫn `PAID`; giữ thời điểm xác nhận; không tạo audit log trùng.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_093 — Operator yêu cầu thanh toán hộ

- **Test Case ID:** TC_093
- **Test Case Name:** Operator yêu cầu thanh toán hộ
- **Preconditions:** Operator A có session OPEN chứa order; không có yêu cầu hủy chờ.
- **Test Data:** Session A.

**Test Steps:**

1. Tạo yêu cầu thanh toán từ Operator.
2. Customer tải lại bill và trạng thái.

- **Expected Result:** Một payment PENDING đúng bill; session PAYMENT_PENDING; hai giao diện cùng kết quả.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_094 — Thanh toán khi chưa có món

- **Test Case ID:** TC_094
- **Test Case Name:** Thanh toán khi chưa có món
- **Preconditions:** Session OPEN chưa có order.
- **Test Data:** Session rỗng.

**Test Steps:**

1. Customer và Operator lần lượt thử tạo payment.
2. Kiểm tra session và payments.

- **Expected Result:** Báo chưa có món cần thanh toán; không tạo payment cho phiên rỗng.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_095 — Yêu cầu thanh toán lặp

- **Test Case ID:** TC_095
- **Test Case Name:** Yêu cầu thanh toán lặp
- **Preconditions:** Session có order, chưa có payment, không có hủy PENDING.
- **Test Data:** Hai request cùng session.

**Test Steps:**

1. Gửi yêu cầu thanh toán.
2. Gửi lại và đối chiếu ID, amount, snapshot.

- **Expected Result:** Chỉ một payment; retry trả cùng payment, không tạo snapshot khác.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_096 — Hai nhân viên xác nhận cùng payment

- **Test Case ID:** TC_096
- **Test Case Name:** Hai nhân viên xác nhận cùng payment
- **Preconditions:** Payment PENDING của A; hai Operator A có quyền.
- **Test Data:** Cùng payment ID.

**Test Steps:**

1. Hai nhân viên gửi confirm gần đồng thời.
2. Kiểm tra payment và audit.

- **Expected Result:** Payment PAID một lần; chỉ một lần ghi người/thời điểm xác nhận và audit xác nhận.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_097 — Khóa thay đổi khi chờ thanh toán

- **Test Case ID:** TC_097
- **Test Case Name:** Khóa thay đổi khi chờ thanh toán
- **Preconditions:** Session PAYMENT_PENDING; snapshot đã lưu.
- **Test Data:** Request gọi thêm, hủy món và đổi promotion.

**Test Steps:**

1. Gọi lần lượt các API thay đổi bill.
2. Đối chiếu amount/snapshot.

- **Expected Result:** Các thay đổi bị chặn; bill/payment đã chốt không bị sửa.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_098 — Customer dùng lại phiên đã đóng

- **Test Case ID:** TC_098
- **Test Case Name:** Customer dùng lại phiên đã đóng
- **Preconditions:** Session vừa được xác nhận PAID; lưu cookie cũ ở thiết bị thứ hai.
- **Test Data:** Cookie phiên cũ; QR còn ACTIVE.

**Test Steps:**

1. Dùng cookie cũ để đọc bill/order và gửi món.
2. Sau đó quét QR, tạo phiên mới.

- **Expected Result:** Cookie cũ không cấp quyền thao tác phiên đóng; lượt mới tạo/chọn phiên hợp lệ và không tái sử dụng bill cũ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_099 — Không tự xác nhận khi khách báo đã chuyển

- **Test Case ID:** TC_099
- **Test Case Name:** Không tự xác nhận khi khách báo đã chuyển
- **Preconditions:** Payment PENDING; chưa có thao tác confirm vận hành.
- **Test Data:** Khách bấm/hiển thị yêu cầu thanh toán.

**Test Steps:**

1. Customer chờ và tải lại trang thanh toán.
2. Kiểm tra trạng thái khi chưa có nhân viên xác nhận.

- **Expected Result:** Payment vẫn PENDING; CAS không tự đánh PAID dựa trên lời báo hoặc thao tác Customer.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_147 — Mất response sau khi confirm đã commit

- **Test Case ID:** TC_147
- **Test Case Name:** Mất response sau khi confirm đã commit
- **Preconditions:** Payment PENDING; nhân viên đã xác minh thanh toán; proxy test có thể bỏ response sau khi backend commit.
- **Test Data:** Một payment thuộc store A; request xác nhận hợp lệ.

**Test Steps:**

1. Gửi confirm và chặn response sau khi DB đã commit; dùng kết nối độc lập kiểm tra payment đã PAID, session CLOSED và ghi lại confirmed_at, người xác nhận, số audit.
2. Khôi phục kết nối, gửi lại confirm cùng payment và tải lại giao diện.
3. Đối chiếu payment, session, audit và redemption nếu fixture có promotion.

- **Expected Result:** Retry trả PAID; không đổi người/thời điểm xác nhận, không tạo audit hoặc redemption trùng; session vẫn CLOSED. Nếu không chứng minh được response bị mất sau commit, ghi BLOCKED thay vì suy đoán.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 11. Khoản chưa thanh toán

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/payment/service/PaymentService.java).

### TC_027 — Ghi nhận và thu khoản chưa thanh toán

- **Test Case ID:** TC_027
- **Test Case Name:** Ghi nhận và thu khoản chưa thanh toán
- **Preconditions:** Session có order; chưa thanh toán; không còn yêu cầu hủy chờ duyệt
- **Test Data:** Session A; lý do `Khách chưa trả`

**Test Steps:**

1. Ghi nhận chưa thanh toán.
2. Sau đó xác nhận thu tiền.

- **Expected Result:** Bước 1: session `CLOSED`, payment `PENDING`, unpaid `OPEN`, bill không khuyến mãi. Bước 2: payment `PAID`, unpaid `RESOLVED`.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_100 — Ghi unpaid trước khi có payment

- **Test Case ID:** TC_100
- **Test Case Name:** Ghi unpaid trước khi có payment
- **Preconditions:** Session OPEN có order; chưa có payment.
- **Test Data:** Bill gốc 100.000đ; lý do test.

**Test Steps:**

1. Operator ghi nhận chưa thanh toán.
2. Xem payment, unpaid và session.

- **Expected Result:** Tạo payment PENDING và một unpaid OPEN cùng snapshot 100.000đ; session CLOSED.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_101 — Ghi unpaid khi bill có khuyến mãi

- **Test Case ID:** TC_101
- **Test Case Name:** Ghi unpaid khi bill có khuyến mãi
- **Preconditions:** Session có bill gốc 100.000đ, payment PENDING 90.000đ.
- **Test Data:** Promotion giảm 10%.

**Test Steps:**

1. Ghi nhận chưa thanh toán.
2. Xác nhận thu sau và kiểm tra redemption.

- **Expected Result:** Payment/unpaid về 100.000đ không discount; thu sau chuyển PAID/RESOLVED và không tạo redemption.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_102 — Không tạo unpaid trùng hoặc cho payment đã trả

- **Test Case ID:** TC_102
- **Test Case Name:** Không tạo unpaid trùng hoặc cho payment đã trả
- **Preconditions:** Một session đã ghi unpaid; một session đã PAID.
- **Test Data:** ID của hai session.

**Test Steps:**

1. Thử ghi unpaid lại cho từng session.
2. Đếm unpaid và kiểm tra payment.

- **Expected Result:** Không tạo unpaid thứ hai hoặc unpaid cho khoản đã PAID; trạng thái gốc được giữ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_103 — Giữ snapshot unpaid khi menu đổi giá

- **Test Case ID:** TC_103
- **Test Case Name:** Giữ snapshot unpaid khi menu đổi giá
- **Preconditions:** Có unpaid OPEN lưu bill 100.000đ.
- **Test Data:** Giá menu mới cao hơn.

**Test Steps:**

1. Admin đổi giá menu.
2. Mở lại khoản chưa trả rồi xác nhận thu.

- **Expected Result:** Vẫn thu theo snapshot 100.000đ; không tính lại theo giá hiện hành.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 12. Khuyến mãi và redemption

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/promotion/service/PromotionService.java).

### TC_028 — Áp dụng khuyến mãi

- **Test Case ID:** TC_028
- **Test Case Name:** Áp dụng khuyến mãi
- **Preconditions:** Admin đã tạo promotion `ACTIVE`, đúng store/thời hạn, còn quota; bill đủ điều kiện
- **Test Data:** Bill 100.000đ; giảm 10%, không giới hạn mức giảm

**Test Steps:**

1. Chọn promotion.
2. Yêu cầu thanh toán.
3. Operator xác nhận `PAID`.

- **Expected Result:** Payment 90.000đ; lưu discount snapshot; chỉ tạo redemption khi `PAID`.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_104 — Tạo và sửa chương trình khuyến mãi

- **Test Case ID:** TC_104
- **Test Case Name:** Tạo và sửa chương trình khuyến mãi
- **Preconditions:** Admin A đăng nhập.
- **Test Data:** Promotion FIXED_AMOUNT_OFF 10.000đ, DRAFT rồi ACTIVE.

**Test Steps:**

1. Tạo chương trình và mở lại chi tiết.
2. Sửa tên, thời gian/quota; bật ACTIVE.

- **Expected Result:** Lưu đúng cấu hình tại A; chương trình đủ điều kiện được dùng sau khi bật.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_105 — Cấu hình promotion sai

- **Test Case ID:** TC_105
- **Test Case Name:** Cấu hình promotion sai
- **Preconditions:** Admin đăng nhập.
- **Test Data:** Giảm 0; phần trăm 101; endAt trước startAt; quota 0; ITEM_* không target.

**Test Steps:**

1. Gửi từng cấu hình sai, giữ trường còn lại hợp lệ.
2. Đọc lại danh sách.

- **Expected Result:** Từ chối từng trường hợp; không lưu chương trình hoặc code/target dở dang.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_106 — Phạm vi món và danh mục

- **Test Case ID:** TC_106
- **Test Case Name:** Phạm vi món và danh mục
- **Preconditions:** Bill 100.000đ gồm món mục tiêu 60.000đ và món ngoài phạm vi 40.000đ.
- **Test Data:** ITEM_PERCENT_OFF 10%; ITEM_FIXED_OFF 10.000đ.

**Test Steps:**

1. Thử từng promotion riêng trên bill đã chuẩn bị.
2. Xem discount dự kiến và snapshot lúc payment.

- **Expected Result:** Giảm lần lượt 6.000đ và 10.000đ; món ngoài phạm vi không bị tính vào cơ sở giảm.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_107 — Không nhận target hoặc promotion chéo store

- **Test Case ID:** TC_107
- **Test Case Name:** Không nhận target hoặc promotion chéo store
- **Preconditions:** Session A OPEN; biết promotion và món B.
- **Test Data:** Promotion B; payload target món/category B.

**Test Steps:**

1. Customer A thử chọn promotion B.
2. Admin A thử tạo promotion với target B.

- **Expected Result:** Từ chối; không gắn promotion hoặc target sai store.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_108 — Chưa đến hạn, hết hạn hoặc tắt

- **Test Case ID:** TC_108
- **Test Case Name:** Chưa đến hạn, hết hạn hoặc tắt
- **Preconditions:** Session có bill đủ mức tối thiểu.
- **Test Data:** Promotion tương lai, hết hạn, DRAFT, INACTIVE.

**Test Steps:**

1. Thử chọn từng chương trình qua API, không chỉ kiểm tra có hiển thị trên UI.
2. Đọc lại bill và lựa chọn hiện tại để xác nhận không lưu discount từ chương trình không đủ hiệu lực.

- **Expected Result:** Không áp dụng được; bill hiện tại không giảm theo chương trình không đủ hiệu lực.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_109 — Mức tối thiểu và mã khuyến mãi

- **Test Case ID:** TC_109
- **Test Case Name:** Mức tối thiểu và mã khuyến mãi
- **Preconditions:** Promotion yêu cầu code và bill tối thiểu 100.000đ.
- **Test Data:** Bill 90.000đ; bill 100.000đ; code sai và code đúng.

**Test Steps:**

1. Thử dưới mức tối thiểu với code đúng.
2. Thử bill đủ với code sai, rồi code đúng.

- **Expected Result:** Hai trường hợp sai không được chọn; bill đủ/code đúng áp dụng được.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_110 — Giới hạn giảm và bill 0đ

- **Test Case ID:** TC_110
- **Test Case Name:** Giới hạn giảm và bill 0đ
- **Preconditions:** Hai fixture độc lập, không tích lũy promotion.
- **Test Data:** Bill 100.000đ: giảm 50% trần 20.000đ; giảm cố định 150.000đ.

**Test Steps:**

1. Áp dụng lần lượt trên từng fixture.
2. Tạo payment và xác nhận cho bill 0đ.

- **Expected Result:** Trường hợp một còn 80.000đ; trường hợp hai còn 0đ, không âm; bill 0đ vẫn PENDING rồi xác nhận PAID thủ công.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_111 — Làm tròn discount

- **Test Case ID:** TC_111
- **Test Case Name:** Làm tròn discount
- **Preconditions:** Session OPEN; bill đủ điều kiện.
- **Test Data:** Bill 10.005đ; giảm 10%, không trần.

**Test Steps:**

1. Chọn promotion.
2. So sánh số giảm trên UI, API và payment.

- **Expected Result:** HALF_UP tới đồng: giảm 1.001đ, phải trả 9.004đ; các nơi hiển thị nhất quán.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_112 — Quota chương trình, code và khách

- **Test Case ID:** TC_112
- **Test Case Name:** Quota chương trình, code và khách
- **Preconditions:** Có dữ liệu PAID đã dùng hết từng quota; chuẩn bị riêng mỗi trường hợp.
- **Test Data:** maxRedemptions=1; code quota=1; perCustomer=1.

**Test Steps:**

1. Thử chọn/thanh toán bill mới khi đã dùng hết từng quota.
2. Đối chiếu redemption.

- **Expected Result:** Không cho vượt quota tương ứng; không tạo thêm redemption thành công ngoài giới hạn.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_113 — Hai payment tranh lượt khuyến mãi cuối

- **Test Case ID:** TC_113
- **Test Case Name:** Hai payment tranh lượt khuyến mãi cuối
- **Preconditions:** Chương trình còn 1 lượt; hai khách có bill đủ điều kiện.
- **Test Data:** Hai session riêng, hai yêu cầu thanh toán gần đồng thời.

**Test Steps:**

1. Hai khách chọn cùng promotion và gửi yêu cầu thanh toán.
2. Hoàn tất các payment được chấp nhận rồi đếm redemption.

- **Expected Result:** Tối đa một lượt tiêu thụ thành công; request mất điều kiện báo lỗi; không có hai redemption vượt quota.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_114 — Bill thay đổi sau khi chọn promotion

- **Test Case ID:** TC_114
- **Test Case Name:** Bill thay đổi sau khi chọn promotion
- **Preconditions:** Session OPEN; đã chọn promotion yêu cầu tối thiểu 100.000đ.
- **Test Data:** Bill 120.000đ; sau hủy còn 80.000đ.

**Test Steps:**

1. Duyệt hủy làm bill xuống dưới mức tối thiểu.
2. Customer yêu cầu thanh toán.

- **Expected Result:** Backend đánh giá lại, không dùng discount hết điều kiện; không khóa snapshot giảm sai.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_115 — Một promotion cho mỗi bill

- **Test Case ID:** TC_115
- **Test Case Name:** Một promotion cho mỗi bill
- **Preconditions:** Session OPEN có ít nhất hai promotion hợp lệ.
- **Test Data:** Promotion P1 và P2.

**Test Steps:**

1. Chọn P1 và kiểm tra bill.
2. Bỏ P1 rồi chọn P2 và kiểm tra lại.

- **Expected Result:** Mỗi thời điểm tối đa một promotion, không cộng dồn giảm giá P1/P2.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_116 — Giữ lịch sử discount sau sửa promotion

- **Test Case ID:** TC_116
- **Test Case Name:** Giữ lịch sử discount sau sửa promotion
- **Preconditions:** Payment đã PAID có discount snapshot.
- **Test Data:** Đổi giá trị, tên hoặc tắt promotion hiện tại.

**Test Steps:**

1. Admin sửa/tắt chương trình.
2. Mở bill lịch sử và redemption của payment cũ.

- **Expected Result:** Không tính lại số tiền đã trả; snapshot discount lịch sử giữ nguyên.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_149 — Biên thời gian hiệu lực khuyến mãi

- **Test Case ID:** TC_149
- **Test Case Name:** Biên thời gian hiệu lực khuyến mãi
- **Preconditions:** Promotion ACTIVE, bill đủ điều kiện, còn quota; môi trường test kiểm soát được thời gian backend chính xác. Nếu không kiểm soát được, ghi BLOCKED.
- **Test Data:** startAt T1, endAt T2; lần lượt kiểm tra T1−1 ms, T1, T2 và T2+1 ms; các thời điểm theo múi giờ cấu hình test.

**Test Steps:**

1. Với từng mốc, cố định thời gian backend bằng công cụ test/debugger hoặc test harness; dùng fixture session độc lập chưa tạo payment.
2. Gọi API kiểm tra eligible và thử chọn promotion; ghi thời gian thực tế và response từng mốc.

- **Expected Result:** Không đủ điều kiện trước T1 và sau T2; tại đúng T1 và T2 được chọn khi các điều kiện khác hợp lệ. Không suy diễn kết quả đúng biên từ request chỉ gửi gần biên.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 13. Thông báo và người nhận

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/notification/service/SystemNotificationService.java).

### TC_029 — Phát hành và đọc thông báo

- **Test Case ID:** TC_029
- **Test Case Name:** Phát hành và đọc thông báo
- **Preconditions:** Operator A hoạt động; Customer A có session `OPEN`
- **Test Data:** Thông báo `INFO`, đối tượng `BOTH`

**Test Steps:**

1. Admin A phát hành.
2. Customer/Operator A mở chuông và đọc.

- **Expected Result:** Cả hai nhận qua polling; số chưa đọc giảm; người nhận chuyển `READ`.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_117 — Đúng đối tượng nhận và store

- **Test Case ID:** TC_117
- **Test Case Name:** Đúng đối tượng nhận và store
- **Preconditions:** A/B có Operator ACTIVE; A có Customer OPEN và session CLOSED.
- **Test Data:** Thông báo OPERATOR rồi CUSTOMER, từng fixture riêng.

**Test Steps:**

1. Admin A phát hành theo từng target.
2. Đọc notification của Operator/Customer A và B.

- **Expected Result:** Chỉ người nhận phù hợp của A tại lúc phát hành nhận được; session CLOSED và store B không nhận.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_118 — Đọc lại thông báo không đổi thời điểm

- **Test Case ID:** TC_118
- **Test Case Name:** Đọc lại thông báo không đổi thời điểm
- **Preconditions:** Người nhận có một thông báo UNREAD.
- **Test Data:** ID notification của mình.

**Test Steps:**

1. Đánh dấu đã đọc, ghi read_at.
2. Đánh dấu lại và đọc unreadCount.

- **Expected Result:** Trạng thái READ, unreadCount không âm; read_at không đổi ở lần đọc lặp.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_119 — Không đánh dấu thông báo người khác

- **Test Case ID:** TC_119
- **Test Case Name:** Không đánh dấu thông báo người khác
- **Preconditions:** Có thông báo không được phát cho tài khoản/phiên đang test.
- **Test Data:** ID notification của người nhận khác.

**Test Steps:**

1. Operator/Customer gọi API đánh dấu đọc bằng ID đó.
2. Dùng người nhận hợp lệ hoặc truy vấn DB chỉ đọc để đối chiếu trạng thái recipient trước/sau request.

- **Expected Result:** Bị từ chối; không thay đổi recipient hoặc số chưa đọc của người khác.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_120 — Đọc tất cả và xóa thông báo

- **Test Case ID:** TC_120
- **Test Case Name:** Đọc tất cả và xóa thông báo
- **Preconditions:** Có nhiều notification UNREAD của người nhận; Admin cùng store.
- **Test Data:** Hai notification thử nghiệm.

**Test Steps:**

1. Người nhận đánh dấu tất cả đã đọc.
2. Admin xóa một notification và tải lại danh sách.

- **Expected Result:** Các notification của người nhận chuyển READ; unreadCount về 0; notification đã xóa và recipient liên quan không còn.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_121 — Validation nội dung và quyền phát hành

- **Test Case ID:** TC_121
- **Test Case Name:** Validation nội dung và quyền phát hành
- **Preconditions:** Admin và Operator đăng nhập riêng.
- **Test Data:** Tiêu đề trống; type sai; target_role sai; payload đúng.

**Test Steps:**

1. Admin gửi từng payload sai.
2. Operator thử gọi API tạo thông báo Admin bằng payload đúng.

- **Expected Result:** Payload sai bị từ chối; Operator không có quyền phát hành; không tạo notification/recipient dở dang.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 14. Quản lý tài khoản Admin và Operator

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/operation/service/OperatorManagementService.java).

### TC_122 — Super Admin tạo Admin cho store đã chọn

- **Test Case ID:** TC_122
- **Test Case Name:** Super Admin tạo Admin cho store đã chọn
- **Preconditions:** Có Firebase user test chưa thuộc CAS; Super Admin đã chọn B.
- **Test Data:** UID, email, SĐT và tên hợp lệ.

**Test Steps:**

1. Tạo Admin qua trang quản lý Admin.
2. Đăng nhập tài khoản vừa tạo và đọc /auth/me.

- **Expected Result:** Account mới role ADMIN, thuộc B; có thể quản trị B và không tự đổi sang A.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_123 — Admin thường không được tạo Admin

- **Test Case ID:** TC_123
- **Test Case Name:** Admin thường không được tạo Admin
- **Preconditions:** ADMIN_A đăng nhập; có payload user test hợp lệ.
- **Test Data:** Payload tạo Admin.

**Test Steps:**

1. Gọi API tạo Admin trực tiếp bằng token ADMIN_A.
2. Kiểm tra accounts.

- **Expected Result:** Trả lỗi thiếu quyền; không tạo Admin mới.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_124 — Từ chối Admin trùng Firebase UID

- **Test Case ID:** TC_124
- **Test Case Name:** Từ chối Admin trùng Firebase UID
- **Preconditions:** UID đã thuộc một tài khoản CAS.
- **Test Data:** Cùng UID, các trường khác hợp lệ.

**Test Steps:**

1. Super Admin gửi tạo Admin với UID đã tồn tại.
2. Đếm account theo UID.

- **Expected Result:** Báo trùng; không đổi role/store của account cũ hoặc tạo account thứ hai.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_125 — Tạo Operator từ Admin

- **Test Case ID:** TC_125
- **Test Case Name:** Tạo Operator từ Admin
- **Preconditions:** Firebase test cho phép provisioning; email chưa tồn tại.
- **Test Data:** Email test mới, SĐT và tên hợp lệ.

**Test Steps:**

1. Admin A tạo Operator.
2. Xem danh sách và đăng nhập tài khoản mới theo cấu hình hiện hành.

- **Expected Result:** Có Firebase user và account OPERATOR ACTIVE thuộc A; đăng nhập được khu vực Operator.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_126 — Kích hoạt lại Operator

- **Test Case ID:** TC_126
- **Test Case Name:** Kích hoạt lại Operator
- **Preconditions:** Operator A đang INACTIVE; Admin A đăng nhập.
- **Test Data:** ID Operator bị khóa.

**Test Steps:**

1. Admin kích hoạt lại.
2. Operator đăng nhập và gọi API vận hành.

- **Expected Result:** Account ACTIVE; được dùng lại API đúng store A; có audit thay đổi.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_127 — Tạo Operator bị lỗi Firebase

- **Test Case ID:** TC_127
- **Test Case Name:** Tạo Operator bị lỗi Firebase
- **Preconditions:** Môi trường test mô phỏng provisioning thất bại, hoặc email đã tồn tại.
- **Test Data:** Email test gây lỗi provisioning.

**Test Steps:**

1. Admin gửi tạo Operator.
2. Kiểm tra danh sách account CAS.

- **Expected Result:** Báo lỗi rõ ràng; không tạo account CAS không có Firebase user tương ứng.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_148 — Firebase tạo thành công nhưng lưu CAS thất bại

- **Test Case ID:** TC_148
- **Test Case Name:** Firebase tạo thành công nhưng lưu CAS thất bại
- **Preconditions:** Firebase project và database test cách ly; có khả năng fault-injection tại insert account hoặc audit sau khi Firebase tạo user; tài khoản Admin test có quyền tạo Operator.
- **Test Data:** Email duy nhất chưa tồn tại; một lần lỗi DB integrity và một lần lỗi runtime, mỗi lần dùng email riêng.

**Test Steps:**

1. Gửi tạo Operator, xác nhận Firebase đã tạo user, sau đó gây lỗi tại bước ghi account/audit trước commit.
2. Đợi request thất bại; kiểm tra Firebase test, account CAS và audit bằng công cụ có quyền đọc.
3. Lặp lại cho loại lỗi còn lại; không thực hiện fault-injection trên production.

- **Expected Result:** Request báo lỗi; transaction CAS rollback, không còn account/audit dở dang; Firebase user vừa tạo được xóa bù khi lệnh xóa thành công. Nếu không thể tạo lỗi đúng thời điểm hoặc kiểm tra Firebase, ghi BLOCKED.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 15. Dịch vụ đặt trước

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/operation/service/ServiceBookingService.java).

### TC_030 — Dịch vụ đặt trước

- **Test Case ID:** TC_030
- **Test Case Name:** Dịch vụ đặt trước
- **Preconditions:** Operator/Admin A đã đăng nhập; đã thỏa thuận giá ngoài CAS
- **Test Data:** Khách Test; SĐT test hợp lệ; dịch vụ 200.000đ

**Test Steps:**

1. Tạo dịch vụ trả sau.
2. Chuyển chờ thanh toán.
3. Xác minh và xác nhận đã trả.

- **Expected Result:** `PAY_LATER` → `PENDING` → `PAID`; lưu người xác nhận; không tạo session/order/payment của luồng gọi món.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_128 — Sửa giá và thông tin dịch vụ chưa thanh toán

- **Test Case ID:** TC_128
- **Test Case Name:** Sửa giá và thông tin dịch vụ chưa thanh toán
- **Preconditions:** Có service booking PAY_LATER hoặc PENDING.
- **Test Data:** Tên dịch vụ mới; agreedPrice 250.000đ.

**Test Steps:**

1. Operator/Admin sửa tên, note và giá.
2. Mở lại dịch vụ.

- **Expected Result:** Lưu đúng giá và thông tin mới, còn cùng client/store; có audit cập nhật.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_129 — Hủy dịch vụ và chặn thanh toán lại

- **Test Case ID:** TC_129
- **Test Case Name:** Hủy dịch vụ và chặn thanh toán lại
- **Preconditions:** Có dịch vụ PAY_LATER/PENDING.
- **Test Data:** ID dịch vụ.

**Test Steps:**

1. Hủy dịch vụ.
2. Gửi request-payment, confirm và update sau khi hủy.

- **Expected Result:** Dịch vụ CANCELLED; các thao tác sau bị chặn; không có xác nhận PAID.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_130 — Dịch vụ đã trả và confirm lặp

- **Test Case ID:** TC_130
- **Test Case Name:** Dịch vụ đã trả và confirm lặp
- **Preconditions:** Dịch vụ PAID; đã ghi confirmed_at và audit.
- **Test Data:** ID dịch vụ.

**Test Steps:**

1. Confirm lại.
2. Thử sửa giá hoặc hủy dịch vụ đã PAID.

- **Expected Result:** Confirm lặp giữ nguyên người/thời điểm và không ghi audit trùng; không cho sửa/hủy dịch vụ PAID.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_131 — Validation và dịch vụ miễn phí

- **Test Case ID:** TC_131
- **Test Case Name:** Validation và dịch vụ miễn phí
- **Preconditions:** Operator có quyền tạo dịch vụ.
- **Test Data:** Giá -1; giá 0; tên trống; SĐT có chữ.

**Test Steps:**

1. Gửi các payload sai riêng.
2. Tạo dịch vụ đủ thông tin với giá 0.

- **Expected Result:** Từ chối giá âm/tên trống/SĐT sai; giá 0 được chấp nhận là dịch vụ miễn phí.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 16. Sự cố vận hành

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/operation/controller/OperationalIncidentController.java).

### TC_132 — Operator báo sự cố, Admin tiếp nhận

- **Test Case ID:** TC_132
- **Test Case Name:** Operator báo sự cố, Admin tiếp nhận
- **Preconditions:** Operator A và Admin A đăng nhập; Admin B riêng.
- **Test Data:** Người báo Test, mô tả Máy hỏng.

**Test Steps:**

1. Operator A gửi sự cố.
2. Admin A và B mở danh sách.

- **Expected Result:** Sự cố lưu người báo, account tạo và thời điểm; Admin A thấy, B không thấy.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_133 — Validation sự cố

- **Test Case ID:** TC_133
- **Test Case Name:** Validation sự cố
- **Preconditions:** Operator A đăng nhập.
- **Test Data:** ReporterName trống; description trống.

**Test Steps:**

1. Gửi từng payload thiếu trường qua UI/API.
2. Admin tải danh sách.

- **Expected Result:** Không tạo sự cố thiếu thông tin; báo lỗi trường tương ứng.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 17. Dashboard, tra cứu khách hàng và audit log

Đối chiếu: [nguồn triển khai/nghiệp vụ](../backend/src/main/java/vn/cas/operation/service/AdminLookupService.java).

### TC_134 — Tìm kiếm và phân trang khách hàng

- **Test Case ID:** TC_134
- **Test Case Name:** Tìm kiếm và phân trang khách hàng
- **Preconditions:** A có hơn 10 khách và B có khách riêng.
- **Test Data:** Tên/SĐT test; page 0/1; size 10.

**Test Steps:**

1. Admin A tìm theo tên/SĐT.
2. Chuyển trang và đối chiếu total.

- **Expected Result:** Chỉ trả khách A phù hợp; số dòng và tổng đếm theo cùng bộ lọc, không trộn trang/store.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_135 — Chi tiết lịch sử khách và khách lẻ

- **Test Case ID:** TC_135
- **Test Case Name:** Chi tiết lịch sử khách và khách lẻ
- **Preconditions:** A có khách phone=NULL và khách có phiên DINE_IN/TAKEAWAY.
- **Test Data:** ID khách A.

**Test Steps:**

1. Mở khách lẻ và khách có lịch sử.
2. Xem từng phiên/order/payment/unpaid.

- **Expected Result:** Khách lẻ không hiển thị SĐT giả; phiên takeaway ghi Mang về; lịch sử nhóm đúng phiên, chỉ đọc.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_136 — Validation phân trang và không có dữ liệu

- **Test Case ID:** TC_136
- **Test Case Name:** Validation phân trang và không có dữ liệu
- **Preconditions:** Admin A đăng nhập.
- **Test Data:** page=-1; size=0 hoặc 101; query không khớp.

**Test Steps:**

1. Gọi từng tham số sai.
2. Tìm tên không tồn tại với tham số đúng.

- **Expected Result:** Tham số sai bị từ chối; query không khớp trả danh sách rỗng/total 0, không báo lỗi hệ thống.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_137 — Doanh thu theo PAID và khoảng ngày

- **Test Case ID:** TC_137
- **Test Case Name:** Doanh thu theo PAID và khoảng ngày
- **Preconditions:** A có payment PAID 100.000đ trong kỳ, PENDING 200.000đ và PAID ngoài kỳ; B có dữ liệu riêng.
- **Test Data:** Khoảng ngày chứa đúng payment 100.000đ.

**Test Steps:**

1. Mở dashboard A và chọn khoảng ngày.
2. Đối chiếu payment.confirmed_at và tổng doanh thu.

- **Expected Result:** Doanh thu A trong kỳ là 100.000đ; không tính PENDING, ngoài kỳ hoặc store B.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_138 — Khoảng ngày sai và kỳ trống

- **Test Case ID:** TC_138
- **Test Case Name:** Khoảng ngày sai và kỳ trống
- **Preconditions:** Admin A đăng nhập.
- **Test Data:** from sau to; khoảng ngày không có payment.

**Test Steps:**

1. Thử chọn khoảng ngày đảo ngược và gọi API trực tiếp.
2. Chọn kỳ trống hợp lệ.

- **Expected Result:** Khoảng sai bị chặn; kỳ trống trả dashboard rỗng/giá trị 0 phù hợp, không lỗi chia cho 0.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_139 — Thống kê discount và món làm lại

- **Test Case ID:** TC_139
- **Test Case Name:** Thống kê discount và món làm lại
- **Preconditions:** Fixture A đã PAID, có bill_discounts và một yêu cầu làm lại; đã ghi dữ liệu nguồn.
- **Test Data:** Kỳ chứa fixture.

**Test Steps:**

1. Mở tab Menu/Order và Khuyến mãi.
2. Đối chiếu snapshot discount và is_remade.

- **Expected Result:** Discount lấy từ snapshot payment PAID; số phần làm lại được thống kê, không nhân đôi sản lượng bán của order làm lại.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_140 — Lọc và phân trang audit log

- **Test Case ID:** TC_140
- **Test Case Name:** Lọc và phân trang audit log
- **Preconditions:** A có audit tạo món, duyệt hủy và xác nhận payment; B có log riêng.
- **Test Data:** query, action và entityType phù hợp.

**Test Steps:**

1. Admin A lọc từng loại rồi chuyển trang.
2. Đối chiếu account, request và entity của một thao tác.

- **Expected Result:** Chỉ có log A đúng bộ lọc; ghi đúng người thực hiện và tài nguyên, tổng đếm khớp; không lộ Firebase token.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_141 — Operator dashboard cập nhật sau thao tác

- **Test Case ID:** TC_141
- **Test Case Name:** Operator dashboard cập nhật sau thao tác
- **Preconditions:** Có order chưa làm và payment PENDING thuộc A.
- **Test Data:** Fixture order/payment A.

**Test Steps:**

1. Đọc dashboard Operator.
2. Hoàn thành order hoặc confirm payment rồi đợi tải lại.

- **Expected Result:** Số đếm/danh sách tương ứng cập nhật đúng dữ liệu thực tế của A; không giữ khoản đã PAID trong pending.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_150 — Biên ngày dashboard và múi giờ

- **Test Case ID:** TC_150
- **Test Case Name:** Biên ngày dashboard và múi giờ
- **Preconditions:** Database và backend test dùng múi giờ Asia/Ho_Chi_Minh theo cấu hình dự án; có thể chuẩn bị payment PAID với confirmed_at chính xác và không có dữ liệu khác trong kỳ test.
- **Test Data:** Ngày D; payment A 100.000đ lúc D 00:00:00, B 200.000đ lúc D 23:59:59.999, C 400.000đ lúc D+1 00:00:00; tất cả thuộc cùng store.

**Test Steps:**

1. Chuẩn bị ba payment/snapshot trên database test cách ly; kiểm tra confirmed_at sau khi lưu bằng truy vấn chỉ đọc và xác nhận độ chính xác mili giây.
2. Gọi dashboard với from=D và to=D; đối chiếu tổng và số session PAID với dữ liệu nguồn.
3. Gọi lại với from=D+1 và to=D+1; kiểm tra payment C chỉ xuất hiện trong ngày kế tiếp.

- **Expected Result:** Ngày D gồm A và B (300.000đ, 2 session), không gồm C; ngày D+1 gồm C (400.000đ, 1 session). Điều kiện là từ đầu D inclusive tới đầu D+1 exclusive; nếu môi trường không tái tạo được mốc chính xác, ghi BLOCKED.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Cụm 18. Giao diện, lỗi mạng và luồng xuyên suốt

Đối chiếu: [nguồn triển khai/nghiệp vụ](BUSINESS_FLOWS.md).

### TC_142 — Màn hình nhỏ và nội dung rỗng

- **Test Case ID:** TC_142
- **Test Case Name:** Màn hình nhỏ và nội dung rỗng
- **Preconditions:** Có mobile viewport và desktop; store test có thể không có dữ liệu.
- **Test Data:** Menu rỗng; danh sách order/payment rỗng.

**Test Steps:**

1. Mở Customer trên mobile, Operator/Admin trên desktop.
2. Kiểm tra menu, form và empty state.

- **Expected Result:** Không mất nút thao tác chính; nội dung đọc được; danh sách rỗng có trạng thái phù hợp, không hiển thị dữ liệu store cũ.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_143 — Mất mạng lúc xác nhận thanh toán

- **Test Case ID:** TC_143
- **Test Case Name:** Mất mạng lúc xác nhận thanh toán
- **Preconditions:** Payment PENDING; có thể chặn request bằng DevTools.
- **Test Data:** Request confirm bị chặn trước khi tới backend.

**Test Steps:**

1. Ngắt mạng rồi bấm xác nhận.
2. Đọc lại payment từ thiết bị online, khôi phục mạng và tải lại UI.

- **Expected Result:** UI báo thất bại/không thành công giả; backend vẫn PENDING nếu chưa nhận request; chỉ PAID sau confirm thực sự thành công.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_144 — Timeout sau khi backend nhận order

- **Test Case ID:** TC_144
- **Test Case Name:** Timeout sau khi backend nhận order
- **Preconditions:** Session OPEN; có thể giữ/chặn response sau khi request đã được gửi.
- **Test Data:** Một order với key K.

**Test Steps:**

1. Gửi order rồi mô phỏng mất response.
2. Kiểm tra backend, retry cùng key K sau khi kết nối lại.

- **Expected Result:** Nếu backend đã tạo thì retry trả order đó; nếu chưa tạo thì tạo một lần; cuối cùng chỉ một order, giỏ/lịch sử đồng bộ lại.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_145 — Luồng tại bàn xuyên suốt

- **Test Case ID:** TC_145
- **Test Case Name:** Luồng tại bàn xuyên suốt
- **Preconditions:** Store test có QR/catalog; Customer và Operator dùng hai trình duyệt riêng.
- **Test Data:** Hai phần món, option hợp lệ; không promotion.

**Test Steps:**

1. Quét QR, mở phiên, đặt món.
2. Operator hoàn thành món; Customer yêu cầu thanh toán; nhân viên xác minh rồi xác nhận.
3. Đợi polling Customer.

- **Expected Result:** Order, chế biến, bill và payment nhất quán; kết thúc PAID/CLOSED, phiên cũ được dọn khỏi Customer.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

### TC_146 — Luồng mang về xuyên suốt

- **Test Case ID:** TC_146
- **Test Case Name:** Luồng mang về xuyên suốt
- **Preconditions:** Store có catalog; hai trình duyệt Customer/Operator.
- **Test Data:** TAKEAWAY, tên/SĐT hợp lệ và món.

**Test Steps:**

1. Customer chọn Mang về, gửi món.
2. Operator chế biến, tạo payment hộ và confirm sau xác minh.

- **Expected Result:** Không gán bàn; vẫn đi qua cùng quy tắc chế biến/payment; kết thúc PAID/CLOSED đúng store.
- **Actual Result:** Chưa chạy
- **Status:** NOT RUN

## Phạm vi chưa đưa vào bộ thực thi

- Report tổng quát tại `/admin/reports` chưa chốt định nghĩa, contract và hành động xử lý; khác với dashboard đã có API.
- Hàng đợi offline-first, đồng bộ sau offline, in hóa đơn/phiếu bếp và kiểm thử pipeline/deploy cần bộ riêng khi implementation/môi trường tương ứng sẵn sàng. Ca lỗi mạng ở trên chỉ kiểm tra luồng online hiện có.
- Không gán quy tắc mới cho ngoại lệ FIFO, thứ tự các order trùng thời điểm, hoặc ưu tiên giữa hủy và hoàn thành mẻ đồng thời khi tài liệu còn cần chốt. Case đồng thời chỉ kiểm tra các bất biến đã chốt, không áp đặt thứ tự thắng.
- Load test, phục hồi backup và kiểm thử bảo mật chuyên sâu cần tiêu chí/môi trường riêng trước pilot; bộ này tập trung kiểm thử chức năng và các ranh giới dữ liệu chính.

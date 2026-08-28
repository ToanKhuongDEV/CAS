# CAS Backend

Backend modular monolith sử dụng Java 21, Spring Boot, Maven, MyBatis, MySQL, Redis và Flyway.

## Chạy local

Môi trường phát triển dùng MySQL local và Redis Cloud. Cấu hình `DB_*` và
`REDIS_*` được đặt trong `backend/.env` local, không được commit.

Chạy backend:

```bash
.\mvnw.cmd spring-boot:run
```

API kiểm tra trạng thái:

```text
GET http://localhost:8080/api/v1/status
GET http://localhost:8080/actuator/health
```

## Kiểm thử thủ công với Postman

Với Postman Native Git, mở thư mục gốc repository trong Local View; Postman đọc
collection từ `postman/collections/` và environment template từ
`postman/environments/`. Chỉ nhập Firebase token vào Current Value trong
Postman; không commit token.

Điền `firebaseWebApiKey`, `firebaseEmail` và `firebasePassword`, sau đó chạy
request `Auth/Firebase email/password login`. Request tự lưu Firebase
`idToken` vào `firebaseIdToken` để dùng cho các API CAS.

Đặt Firebase ID Token trong biến shell local, không commit token vào repository:

```powershell
$env:CAS_FIREBASE_ID_TOKEN = "<Firebase ID Token>"
```

Ví dụ tạo bàn:

```powershell
curl.exe -X POST http://localhost:8080/api/v1/admin/tables -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"code\":5,\"capacity\":4}"
curl.exe http://localhost:8080/api/v1/admin/tables -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
curl.exe http://localhost:8080/api/v1/admin/tables/1/qr -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
curl.exe -X DELETE http://localhost:8080/api/v1/admin/tables/1 -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
```

Postman có thể import trực tiếp lệnh cURL này.

Ví dụ quản lý Catalog và xin chữ ký upload ảnh Cloudinary dùng chung. Request nhận
`purpose`: `MENU_ITEM`, `STORE_LOGO` hoặc `WELCOME`. Response của endpoint
chứa `cloudName`, `apiKey`, `timestamp`, `signature`, `folder`, `publicId` và
`uploadPreset`; Frontend dùng các giá trị này để upload trực tiếp ảnh lên
Cloudinary, rồi gửi `secure_url` và `public_id` khi tạo hoặc sửa món:

```powershell
curl.exe -X POST http://localhost:8080/api/v1/admin/catalog/categories -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Đồ uống\",\"categoryType\":\"REGULAR\",\"displayOrder\":1,\"status\":\"ACTIVE\"}"
curl.exe http://localhost:8080/api/v1/admin/catalog/items -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
curl.exe -X POST http://localhost:8080/api/v1/admin/images/upload-signature -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"purpose\":\"MENU_ITEM\"}"
curl.exe -X PUT http://localhost:8080/api/v1/admin/store/settings -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"CAS Mì Cay\",\"address\":\"123 Đường Ẩm Thực\",\"phone\":\"0900000000\",\"email\":\"hello@cas.local\",\"logoUrl\":\"https://res.cloudinary.com/<cloud>/image/upload/...\",\"logoStorageKey\":\"<Cloudinary public_id>\",\"googleMapsLocation\":\"https://maps.google.com/?q=10.7769,106.7009\",\"openTime\":\"09:00:00\",\"closeTime\":\"22:00:00\",\"welcomeSlogan\":\"Món ngon gọi nhanh\",\"status\":\"ACTIVE\"}"
curl.exe -X PUT http://localhost:8080/api/v1/admin/store/welcome -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"heroPrimaryImageUrl\":null,\"heroPrimaryImageStorageKey\":null,\"heroSecondaryImageUrl\":null,\"heroSecondaryImageStorageKey\":null,\"menuPreview1ImageUrl\":null,\"menuPreview1ImageStorageKey\":null,\"menuPreview2ImageUrl\":null,\"menuPreview2ImageStorageKey\":null,\"menuPreview3ImageUrl\":null,\"menuPreview3ImageStorageKey\":null,\"menuPreview4ImageUrl\":null,\"menuPreview4ImageStorageKey\":null,\"menuPreview5ImageUrl\":null,\"menuPreview5ImageStorageKey\":null,\"bannerImageUrl\":null,\"bannerImageStorageKey\":null,\"status\":\"ACTIVE\"}"
curl.exe http://localhost:8080/api/v1/public/stores/1/welcome
curl.exe -X DELETE http://localhost:8080/api/v1/admin/store/welcome -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
```

Ví dụ quét QR để lấy hoặc tham gia phiên bàn Customer. Chỉ gửi `customerName`
khi chưa có phiên `OPEN` tại bàn; các thiết bị quét sau chỉ gửi `qrToken`:

```powershell
curl.exe -X POST http://localhost:8080/api/v1/customer/table-sessions/resolve-qr -H "Content-Type: application/json" -d "{\"qrToken\":\"<QR token>\"}" -c customer-session-cookie.txt
curl.exe -X POST http://localhost:8080/api/v1/customer/table-sessions/resolve-qr -H "Content-Type: application/json" -d "{\"qrToken\":\"<QR token>\",\"customerName\":\"Nguyen Van A\",\"customerPhone\":\"0901234567\"}" -c customer-session-cookie.txt
curl.exe http://localhost:8080/api/v1/customer/table-sessions/current -b customer-session-cookie.txt
curl.exe -X DELETE http://localhost:8080/api/v1/customer/table-sessions/current -b customer-session-cookie.txt
```

Ví dụ gửi order Customer. Dùng lại cookie nhận từ bước quét QR; giữ nguyên
`idempotencyKey` khi cần retry cùng một request:

```powershell
curl.exe -X POST http://localhost:8080/api/v1/customer/orders -H "Content-Type: application/json" -b customer-session-cookie.txt -d "{\"idempotencyKey\":\"<uuid-moi-cho-moi-lan-gui>\",\"note\":\"Ít đá\",\"items\":[{\"menuItemId\":1,\"quantity\":2,\"optionValueIds\":[1]}]}"
curl.exe http://localhost:8080/api/v1/customer/orders -b customer-session-cookie.txt
curl.exe http://localhost:8080/api/v1/customer/orders/<order-public-id> -b customer-session-cookie.txt
curl.exe http://localhost:8080/api/v1/customer/orders/bill -b customer-session-cookie.txt
curl.exe -X POST http://localhost:8080/api/v1/customer/orders/items/<order-item-public-id>/cancellation-requests -H "Content-Type: application/json" -b customer-session-cookie.txt -d "{\"idempotencyKey\":\"<uuid-moi-cho-moi-lan-gui>\",\"requestedQuantity\":1,\"reason\":\"Gọi nhầm món\"}"
```

Ví dụ `OPERATOR` mở hoặc dùng lại phiên của bàn, sau đó tạo order hộ khách. Khi
bàn đã có session `OPEN`, có thể bỏ `customerName` và `customerPhone`:

```powershell
curl.exe -X POST http://localhost:8080/api/v1/operator/table-sessions -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"tableId\":1,\"customerName\":\"Nguyen Van A\",\"customerPhone\":\"0901234567\"}"
curl.exe http://localhost:8080/api/v1/operator/table-sessions/tables -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
curl.exe -X POST http://localhost:8080/api/v1/operator/table-sessions/<session-public-id>/orders -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"idempotencyKey\":\"<uuid-moi-cho-moi-lan-gui>\",\"note\":\"Ít đá\",\"items\":[{\"menuItemId\":1,\"quantity\":2,\"optionValueIds\":[1]}]}"
```

Các lệnh khác:

```powershell
curl.exe http://localhost:8080/actuator/health
curl.exe http://localhost:8080/actuator/health/db
curl.exe http://localhost:8080/actuator/health/redis
curl.exe http://localhost:8080/actuator/health/firebase
curl.exe http://localhost:8080/api/v1/auth/me -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
curl.exe -X POST http://localhost:8080/api/v1/admin/admins -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"firebaseUid\":\"firebase-admin-uid\",\"email\":\"admin@example.com\",\"phone\":\"0901234567\",\"displayName\":\"Admin Two\"}"
curl.exe -X POST http://localhost:8080/api/v1/admin/operators -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"email\":\"operator@example.com\",\"phone\":\"0901234567\",\"displayName\":\"Cashier One\"}"
curl.exe -X DELETE http://localhost:8080/api/v1/admin/operators/1 -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
```

## Kiểm thử

```bash
mvn test
```

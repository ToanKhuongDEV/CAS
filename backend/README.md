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
request `Authentication/Firebase email/password login`. Request tự lưu Firebase
`idToken` vào `firebaseIdToken` để dùng cho các API CAS.

Đặt Firebase ID Token trong biến shell local, không commit token vào repository:

```powershell
$env:CAS_FIREBASE_ID_TOKEN = "<Firebase ID Token>"
```

Ví dụ tạo bàn:

```powershell
curl.exe -X POST http://localhost:8080/api/v1/admin/tables -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"code\":5,\"capacity\":4}"
```

Postman có thể import trực tiếp lệnh cURL này.

Các lệnh khác:

```powershell
curl.exe http://localhost:8080/actuator/health
curl.exe http://localhost:8080/actuator/health/db
curl.exe http://localhost:8080/actuator/health/redis
curl.exe http://localhost:8080/actuator/health/firebase
curl.exe -X POST http://localhost:8080/api/v1/admin/operators -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN" -H "Content-Type: application/json" -d "{\"email\":\"operator@example.com\",\"displayName\":\"Cashier One\"}"
curl.exe -X DELETE http://localhost:8080/api/v1/admin/operators/1 -H "Authorization: Bearer $env:CAS_FIREBASE_ID_TOKEN"
```

## Kiểm thử

```bash
mvn test
```

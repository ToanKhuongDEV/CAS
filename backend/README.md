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

## Kiểm thử thủ công với Bruno

Mở thư mục `bruno/` bằng Bruno. Chọn environment `local`, sau đó nhập
Firebase ID Token của tài khoản `ADMIN` vào biến cục bộ `firebaseIdToken` để gọi
các request trong `bruno/requests/admin`. Không lưu token vào collection.

## Kiểm thử

```bash
mvn test
```

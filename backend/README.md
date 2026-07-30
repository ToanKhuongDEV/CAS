# CAS Backend

Backend modular monolith sử dụng Java 21, Spring Boot, Maven, MyBatis, MySQL, Redis và Flyway.

## Chạy local

Khởi động MySQL và Redis từ thư mục gốc:

```bash
docker compose up -d mysql redis
```

Chạy backend:

```bash
mvn spring-boot:run
```

API kiểm tra trạng thái:

```text
GET http://localhost:8080/api/v1/status
GET http://localhost:8080/actuator/health
```

## Kiểm thử

```bash
mvn test
```

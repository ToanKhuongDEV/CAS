# CAS — Đề xuất Tech Stack và Kiến trúc hệ thống

## 1. Mục tiêu sản phẩm

CAS là nền tảng quản lý quán ăn gồm hai nhóm người dùng:

- **Khách hàng/User**
  - Quét QR tại bàn để xem menu và tạo order.
  - Theo dõi trạng thái món và gọi nhân viên.
  - Chơi các trò chơi có tích hợp AI như thần số học, bói vui, trắc nghiệm tính cách.
  - Danh sách trò chơi có thể được thêm, bật/tắt hoặc xóa thường xuyên.
- **Admin/Nhân viên**
  - Quản lý chi nhánh, khu vực, bàn, QR, menu, tồn kho cơ bản và đơn hàng.
  - Quản lý trò chơi và nội dung/prompt AI.
  - Quản lý khách hàng và lịch sử tương tác.
  - Gửi tin nhắn chăm sóc khách hàng qua Zalo theo lịch hoặc theo sự kiện.

## 2. Kiến trúc khuyến nghị

Giai đoạn đầu nên dùng **modular monolith** thay vì microservices. Backend vẫn là một ứng dụng Spring Boot nhưng được chia module nghiệp vụ rõ ràng. Cách này dễ phát triển, deploy và debug, đồng thời vẫn có thể tách dịch vụ khi lưu lượng tăng.

```text
Khách quét QR / Admin
          |
          v
     Next.js Web
          |
       HTTPS/REST
          |
          v
 Spring Boot Modular Monolith
   |       |       |       |
 MySQL   Redis   AI API   Zalo API
                   |
             Object Storage
```

Các module backend đề xuất:

```text
identity       Tài khoản, vai trò, phân quyền
restaurant     Chi nhánh, khu vực, bàn, QR
catalog        Danh mục, món ăn, giá, topping
ordering       Giỏ hàng, order, order item, trạng thái
payment        Thanh toán và đối soát
game           Danh mục game, phiên chơi, cấu hình động
ai             Prompt, provider, kiểm soát chi phí và nội dung
customer       Hồ sơ và lịch sử khách hàng
messaging      Template, chiến dịch, lịch gửi, Zalo webhook
notification   Realtime/SSE, thông báo nội bộ
audit          Nhật ký thao tác quản trị
```

### Convention cấu trúc source backend

Backend CAS áp dụng cùng convention với `D:\Logistics-Control-Hub\backend`: package theo
feature, sau đó chia technical layer bên trong từng feature.

```text
src/main/java/com/cas/
├── CasApplication.java
├── common/
│   ├── base/
│   ├── constant/
│   ├── exception/
│   ├── specification/
│   └── util/
├── config/
│   └── security/
└── feature/
    ├── auth/
    │   ├── constant/
    │   ├── controller/
    │   ├── dto/
    │   │   ├── request/
    │   │   └── response/
    │   ├── entity/
    │   ├── repository/
    │   ├── security/
    │   ├── service/
    │   │   └── impl/
    │   └── util/
    ├── restaurant/
    ├── table/
    ├── catalog/
    ├── order/
    ├── payment/
    ├── game/
    ├── customer/
    ├── messaging/
    ├── audit/
    └── redis/
```

Mỗi feature chỉ tạo các thư mục thực sự cần dùng. Tên class tuân theo mẫu của project
tham chiếu: `XxxController`, `XxxService`, `XxxServiceImpl`, `XxxRepository`,
`XxxEntity`, `XxxMapper`, `XxxRequest` và `XxxResponse`.

## 3. Frontend

### Stack chính

- **Next.js 15+**, App Router, TypeScript.
- **React 19+**.
- **Tailwind CSS** và **shadcn/ui** cho UI nhất quán, dễ tùy biến.
- **TanStack Query** cho server state, cache và retry request.
- **React Hook Form + Zod** cho form và validation.
- **Zustand** chỉ dùng cho client state nhỏ như giỏ hàng chưa đăng nhập.
- **next-intl** nếu cần đa ngôn ngữ.
- **PWA** cho giao diện khách tại bàn, giúp tải nhanh và có thể thêm vào màn hình chính.

### Tổ chức ứng dụng

Có thể dùng một Next.js app với route group:

```text
app/
  (customer)/      Menu, giỏ hàng, order, game
  (admin)/         Dashboard quản trị
  api/             Chỉ dùng BFF/proxy khi thật sự cần
```

Nếu hai đội phát triển độc lập hoặc admin khác hẳn về vòng đời release, có thể chuyển thành monorepo:

```text
apps/customer-web
apps/admin-web
packages/ui
packages/api-client
packages/config
```

Khuyến nghị dùng **pnpm workspace + Turborepo** khi chọn mô hình monorepo.

## 4. Backend

### Backend tech stack chính thức

Đây là các công nghệ được sử dụng trong Spring Boot backend của CAS:

| Nhóm | Công nghệ | Mục đích |
|---|---|---|
| Ngôn ngữ | Java 21 LTS | Runtime chính của backend |
| Framework | Spring Boot 3.x | Xây dựng ứng dụng và quản lý dependency/configuration |
| API | Spring Web MVC | REST API cho frontend và webhook |
| Validation | Spring Validation, Jakarta Validation | Kiểm tra request DTO |
| Authentication | Spring Security, JWT | Đăng nhập, access token và refresh token |
| Authorization | Spring Security method authorization | RBAC cho admin và nhân viên |
| ORM | Spring Data JPA, Hibernate | Persistence và transaction |
| Database | MySQL 8.4 LTS | Nguồn dữ liệu nghiệp vụ chính |
| Migration | Flyway | Version hóa database schema |
| Cache | Spring Data Redis, Redis | Cache, session tạm, rate limit và idempotency |
| DTO mapping | MapStruct | Mapping entity/request/response |
| Boilerplate | Lombok | Getter, setter, constructor và builder |
| HTTP client | Spring WebClient | Gọi Python AI service, Zalo và payment API |
| Fault tolerance | Resilience4j | Timeout, retry và circuit breaker |
| API documentation | springdoc-openapi, Swagger UI | OpenAPI contract và kiểm thử API |
| Realtime | Server-Sent Events | Cập nhật trạng thái order cho khách/bếp |
| Scheduling | Spring Scheduling | Worker gửi tin và tác vụ định kỳ ở MVP |
| Object storage | AWS SDK for Java (S3 API) | Upload hình món ăn; local dùng MinIO |
| Health/metrics | Spring Boot Actuator, Micrometer | Health check và application metrics |
| Tracing | OpenTelemetry | Theo dõi request qua Spring Boot và Python AI |
| Logging | SLF4J, Logback | Application log có cấu trúc |
| Unit test | JUnit 5, Mockito, AssertJ | Kiểm thử service và business rule |
| Integration test | Testcontainers, REST Assured | Kiểm thử với MySQL/Redis thật trong container |
| Build | Maven, Maven Wrapper | Build và quản lý dependency |
| Local runtime | Docker, Docker Compose | Chạy backend, MySQL, Redis và MinIO |
| CI/CD | GitHub Actions | Build, test và đóng gói Docker image |

Backend được tổ chức theo **package-by-feature**, tương tự
`D:\Logistics-Control-Hub\backend`. Đây là modular monolith theo convention source
code của dự án; không bắt buộc thêm dependency Spring Modulith ở giai đoạn đầu.

### Công nghệ chưa dùng ở MVP

- **RabbitMQ**: chỉ bổ sung khi database-backed job không còn đáp ứng.
- **Kafka**: chưa có nhu cầu event streaming đủ lớn.
- **Keycloak**: chưa cần khi CAS tự quản lý một hệ thống tài khoản.
- **Kubernetes**: chưa cần cho số lượng service và lưu lượng ban đầu.
- **WebSocket**: SSE đã đủ cho cập nhật order một chiều.
- **Spring AI**: không dùng vì AI chạy trong Python service riêng.
- **Spring Modulith dependency**: chưa cần; ranh giới module được giữ bằng package
  convention và quy tắc dependency.

### API

- REST JSON, prefix `/api/v1`.
- Sinh TypeScript client từ OpenAPI để frontend và backend đồng bộ kiểu dữ liệu.
- Dùng cursor pagination cho dữ liệu tăng nhanh; page/size cho màn hình quản trị đơn giản.
- Dùng idempotency key cho tạo order, thanh toán và gửi tin nhắn.
- SSE phù hợp cho trạng thái order realtime ở giai đoạn đầu; chuyển WebSocket khi cần giao tiếp hai chiều nhiều.

### Xác thực và phân quyền

- Admin/nhân viên: access token ngắn hạn + refresh token đặt trong cookie `HttpOnly`, `Secure`, `SameSite`.
- Phân quyền theo RBAC: `OWNER`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN`.
- Khách quét QR không bắt buộc đăng nhập; backend tạo anonymous session gắn với bàn.
- Mọi thay đổi nhạy cảm phải ghi audit log.
- Nếu cần SSO hoặc nhiều hệ thống dùng chung danh tính, có thể bổ sung Keycloak sau; MVP chưa cần.

## 5. Database và cache

### MySQL

- **MySQL 8.4 LTS**, charset `utf8mb4`, timezone lưu UTC.
- ID nên dùng UUIDv7/ULID để khó đoán và vẫn sắp xếp tương đối theo thời gian.
- Tiền tệ lưu kiểu `DECIMAL`, không dùng `float/double`.
- Các bảng quan trọng nên có `created_at`, `updated_at`, `version` để optimistic locking.
- Không hard-delete dữ liệu nghiệp vụ như order/payment; dùng trạng thái hoặc `deleted_at`.

Nhóm bảng chính:

```text
users, roles, user_roles
restaurants, branches, areas, tables, table_qr_tokens
categories, menu_items, menu_item_options, price_histories
orders, order_items, order_events, payments
games, game_versions, game_configs, game_sessions, game_results
ai_prompts, ai_usage_logs
customers, customer_consents
message_templates, campaigns, message_jobs, message_deliveries
audit_logs
```

### Redis

Dùng Redis cho:

- Cache menu theo chi nhánh.
- Anonymous table session và shopping cart tạm.
- Rate limit cho QR, game AI, login và API public.
- Distributed lock cho các tác vụ nhạy cảm.
- Idempotency key.
- Pub/Sub cho sự kiện realtime nhẹ.

Không dùng Redis làm nguồn dữ liệu duy nhất cho order, payment hoặc kết quả cần lưu lâu dài.

## 6. QR order tại bàn

Không đặt trực tiếp `table_id` dễ đoán trong QR. QR nên chứa URL dạng:

```text
https://cas.example.com/t/{opaqueToken}
```

Luồng xử lý:

1. Khách quét QR.
2. Backend kiểm tra token, trạng thái bàn, chi nhánh và thời hạn/cấu hình.
3. Tạo table session ngắn hạn trong Redis, đồng thời lưu thông tin cần audit vào MySQL.
4. Khách chọn món và gửi order.
5. Backend kiểm tra lại giá/menu từ database, không tin dữ liệu giá từ frontend.
6. Order được chuyển tới màn hình bếp/nhân viên.

Nên hỗ trợ rotate/revoke QR token khi mã bị lộ. QR chỉ xác định bàn, không tự cấp quyền quản trị hoặc quyền xem order của phiên khác.

## 7. Nền tảng game AI có thể thay đổi liên tục

### Mô hình game

Không hard-code từng game thành một luồng riêng trên frontend. Dùng **game registry + versioned configuration**:

```text
Game
  id
  code
  name
  type
  status: DRAFT | ACTIVE | INACTIVE | ARCHIVED
  renderer_key
  current_version

GameVersion
  input_schema_json
  ui_schema_json
  rules_json
  prompt_template_id
  result_schema_json
  published_at
```

- `input_schema_json`: dữ liệu game cần, ví dụ họ tên/ngày sinh.
- `ui_schema_json`: cấu hình form và cách hiển thị.
- `renderer_key`: chọn component frontend đã được cho phép.
- `rules_json`: luật tính toán không cần AI.
- `prompt_template_id`: prompt AI đã version hóa.

Admin có thể tạo, publish, tạm dừng hoặc archive game bằng cấu hình. Không nên cho admin tải JavaScript tùy ý vì có rủi ro XSS và chiếm quyền hệ thống. Game có UI hoàn toàn mới vẫn cần release thêm renderer/component đã được review.

### AI service riêng

AI được triển khai thành Python service độc lập bằng FastAPI. Spring Boot sở hữu dữ
liệu nghiệp vụ, xác thực, quota và lịch sử game; frontend không gọi trực tiếp Python.
Feature `game` của Spring Boot gọi AI service qua một internal client có timeout,
service authentication và circuit breaker.

Python service chịu trách nhiệm tính toán/diễn giải AI, quản lý prompt/model và trả
structured output. Python không truy cập trực tiếp entity/repository hoặc MySQL của
Spring Boot.

### AI gateway trong Python service

Tạo một lớp `AiProvider` trong Python service để không phụ thuộc cứng vào một nhà cung cấp:

```python
class AiProvider(Protocol):
    async def generate(self, request: AiRequest) -> AiResult: ...
```

AI gateway chịu trách nhiệm:

- Chọn model/provider theo game.
- Version hóa system prompt và template.
- Timeout, retry có giới hạn, circuit breaker.
- Rate limit và quota theo session/game/chi nhánh.
- Ghi token usage, độ trễ và chi phí ước tính.
- Structured output theo JSON Schema.
- Lọc dữ liệu cá nhân trước khi gửi ra provider nếu có thể.
- Moderation đầu vào/đầu ra.
- Cache kết quả chỉ khi dữ liệu và chính sách riêng tư cho phép.

Với thần số học, phần tính toán deterministic nên viết bằng code và unit test; AI chỉ dùng để diễn giải kết quả. Điều này giảm chi phí và tránh AI tính sai.

## 8. Tích hợp Zalo

Chỉ tích hợp qua API chính thức và theo đúng loại tài khoản/ứng dụng được Zalo phê duyệt. Hệ thống cần lưu consent và trạng thái cho phép nhận tin của khách hàng; không xây cơ chế gửi hàng loạt vượt chính sách nền tảng.

Kiến trúc gửi tin:

```text
Campaign/Event
      |
      v
 message_jobs (MySQL)
      |
 Scheduled worker
      |
      v
 Zalo adapter ----> Zalo API
      |
      v
 delivery status + webhook
```

MVP có thể dùng **database-backed job queue**:

- Ghi job và thay đổi nghiệp vụ trong cùng transaction.
- Worker lấy job theo lô bằng locking.
- Retry với exponential backoff.
- Dead-letter status sau số lần retry tối đa.
- Idempotency key tránh gửi trùng.
- Webhook phải kiểm tra chữ ký, chống replay và xử lý idempotent.

Khi lưu lượng lớn, thay job queue bằng **RabbitMQ**. Kafka chỉ phù hợp khi hệ thống đã có nhu cầu event streaming lớn, chưa cần ở MVP.

Lưu ý nghiệp vụ:

- Phân biệt tin giao dịch và tin marketing.
- Template phải có version và quy trình duyệt.
- Hỗ trợ unsubscribe/opt-out.
- Không log access token hoặc toàn bộ dữ liệu nhạy cảm.
- Secrets lưu trong secret manager hoặc biến môi trường của nền tảng deploy.

## 9. Thanh toán

Thiết kế `PaymentProvider` tương tự AI/Zalo adapter để có thể tích hợp VNPay, MoMo hoặc provider khác:

- Tạo payment intent ở backend.
- Xác minh chữ ký callback/webhook.
- Xử lý webhook idempotent.
- Không đánh dấu đã thanh toán chỉ dựa trên redirect từ trình duyệt.
- Có job đối soát các giao dịch chưa rõ trạng thái.

## 10. Hạ tầng triển khai

### Môi trường phát triển

- Docker Compose: MySQL, Redis, backend, frontend.
- Mailpit cho email test nếu có.
- MinIO giả lập object storage.
- `.env.example`, tuyệt đối không commit secret thật.

### Production khuyến nghị ban đầu

- Frontend: Vercel hoặc container trên cloud.
- Backend: Docker container trên AWS ECS/Fargate, Google Cloud Run, Azure Container Apps hoặc VPS có quản trị tốt.
- MySQL: dịch vụ managed database.
- Redis: managed Redis.
- Ảnh món ăn: S3-compatible object storage + CDN.
- Reverse proxy/WAF: Cloudflare hoặc dịch vụ tương đương.
- CI/CD: GitHub Actions.
- Error tracking: Sentry.
- Logs/metrics/traces: OpenTelemetry + Grafana stack hoặc dịch vụ managed.

Không cần Kubernetes ở giai đoạn MVP. Chỉ cân nhắc khi có nhiều service, nhiều đội vận hành hoặc nhu cầu scale/availability đủ lớn.

## 11. Bảo mật và vận hành

- TLS mọi môi trường có dữ liệu thật.
- CORS allowlist, CSP, CSRF protection phù hợp với cơ chế cookie.
- Rate limit ở gateway và tại các API tốn chi phí như AI/Zalo.
- Validate file upload, giới hạn dung lượng, lưu ngoài application server.
- Mã hóa secret và dữ liệu nhạy cảm; mask PII trong log.
- Backup MySQL tự động và định kỳ kiểm thử restore.
- Retention policy cho log AI, game session và dữ liệu khách hàng.
- Audit thao tác admin, đặc biệt là thay đổi giá, hoàn tiền, campaign và prompt.
- SAST, dependency scan và container scan trong CI.

## 12. Bộ công cụ đề xuất

| Khu vực | Công nghệ |
|---|---|
| Customer/Admin Web | Next.js, TypeScript, React, Tailwind, shadcn/ui |
| Data fetching | TanStack Query |
| Form/validation | React Hook Form, Zod |
| Backend | Java 21, Spring Boot, package-by-feature modular monolith |
| API contract | OpenAPI, generated TypeScript client |
| Database | MySQL 8.4 LTS, Flyway |
| Cache/session/rate limit | Redis |
| Background jobs MVP | MySQL job table + Spring scheduled worker |
| Queue khi scale | RabbitMQ |
| Realtime MVP | Server-Sent Events |
| File/image | S3-compatible storage + CDN |
| AI service | Python 3.12+, FastAPI, Pydantic, provider adapter |
| Testing | JUnit, Testcontainers, REST Assured, Vitest, Playwright |
| Observability | OpenTelemetry, Micrometer, Sentry, Grafana |
| CI/CD | GitHub Actions, Docker |

## 13. Lộ trình triển khai

### Giai đoạn 1 — Nền tảng

- Khởi tạo frontend/backend, auth và RBAC.
- Chi nhánh, khu vực, bàn, QR.
- Menu, topping, giá và trạng thái còn/hết.
- Docker Compose, migration, OpenAPI và CI.

### Giai đoạn 2 — Order

- Table session, giỏ hàng, tạo order.
- Màn hình bếp/nhân viên và cập nhật trạng thái realtime.
- Payment abstraction và một cổng thanh toán.
- Audit log và dashboard cơ bản.

### Giai đoạn 3 — Game AI

- Game registry, version và publish workflow.
- Một game mẫu thần số học: code tính toán + AI diễn giải.
- Quota, rate limit, usage/cost tracking và moderation.

### Giai đoạn 4 — CRM và Zalo

- Hồ sơ khách hàng, consent và segment.
- Template, campaign, scheduler, retry và webhook.
- Báo cáo delivery, opt-out và audit.

### Giai đoạn 5 — Scale và tối ưu

- Đo tải thực tế, tối ưu index/cache.
- Tách worker hoặc service khi có bằng chứng cần thiết.
- RabbitMQ nếu database queue không còn đáp ứng.
- Tăng cường DR, autoscaling và observability.

## 14. Các quyết định nên chốt trước khi code

1. Một quán hay mô hình nhiều quán/multi-tenant.
2. Khách có bắt buộc đăng nhập hay chỉ dùng anonymous table session.
3. Order thanh toán tại quầy, online hay cả hai.
4. Quy trình bếp: một màn hình chung hay theo station.
5. Loại tài khoản/API Zalo đã được cấp và loại tin được phép gửi.
6. Nhà cung cấp AI, yêu cầu lưu trữ dữ liệu và ngân sách theo tháng.
7. Game do admin cấu hình đến mức nào; game UI mới có cần developer release hay không.

## 15. Kết luận

Stack phù hợp nhất cho CAS ở giai đoạn đầu là **Next.js + Spring Boot modular monolith + MySQL + Redis**, deploy bằng container và dùng các adapter riêng cho AI, Zalo, thanh toán. Điểm quan trọng nhất là giữ order/payment trong MySQL, thiết kế game theo registry có version, và xử lý gửi Zalo bằng job bất đồng bộ có consent, retry và idempotency.

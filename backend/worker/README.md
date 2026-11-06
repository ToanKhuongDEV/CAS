# Worker (reserved)

Thư mục này được dành trước cho Spring Boot worker xử lý tác vụ nền của CAS.

Worker chưa phải Maven module, chưa có application, dependency, queue, scheduler
hoặc cấu hình runtime. Backend API hiện tại vẫn là ứng dụng duy nhất được build và
chạy.

Khi yêu cầu tác vụ nền đã được chốt, worker sẽ dùng lại các module nghiệp vụ hiện
có; không sao chép business logic từ API sang worker.

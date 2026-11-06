# CAS Frontend

Frontend sử dụng Next.js App Router, React và TypeScript.

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

Sao chép `.env.example` thành `.env.local` và đặt `NEXT_PUBLIC_WEB_URL` là URL công khai
của Frontend (ví dụ `https://order.example.com`). URL này được nhúng vào QR cửa hàng và QR bàn.

## Kiểm tra

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

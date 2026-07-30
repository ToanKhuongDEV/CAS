import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAS | Gọi món tại bàn",
  description: "Nền tảng gọi món bằng QR và thanh toán VietQR cho cửa hàng.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "CAS | Chào mừng bạn",
  description: "Khám phá mỳ cay, món ăn vặt, cà phê, trà sữa và gà rán ngay tại bàn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="scroll-smooth motion-reduce:scroll-auto"
      data-scroll-behavior="smooth"
      lang="vi"
      suppressHydrationWarning
    >
      <body className="min-h-screen min-w-80 bg-cas-surface font-sans text-cas-on-surface antialiased">
        {children}
      </body>
    </html>
  );
}

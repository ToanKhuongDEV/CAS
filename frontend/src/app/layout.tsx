import type { Metadata } from "next";

import { ToastProvider } from "../components/ui/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAS | Chào mừng bạn",
  description: "Khám phá mỳ cay, món ăn vặt, cà phê, trà sữa và gà rán ngay tại bàn.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/cas-logo.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

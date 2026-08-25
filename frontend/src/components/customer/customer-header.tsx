"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

import { CasIcon } from "../ui/cas-icon";
import { ThemeToggle } from "../ui/theme-toggle";
import { loadPublicStore } from "../../lib/api/store/public-store.api";

type CustomerHeaderProps = {
  cartCount?: number;
  showThemeToggle?: boolean;
  tableName: string;
};

type CustomerNotification = {
  id: number;
  title: string;
  desc: string;
  time: string;
  badge?: string;
  isRead: boolean;
};

const mockCustomerNotifications: CustomerNotification[] = [
  {
    id: 1,
    title: "Ưu đãi Summer50K",
    desc: "Nhập mã SUMMER50K để giảm ngay 50.000đ cho đơn hàng từ 200.000đ!",
    time: "Vừa xong",
    badge: "KM Hot",
    isRead: false,
  },
  {
    id: 2,
    title: "Trà Trái Cây Mùa Hè",
    desc: "Thực đơn vừa cập nhật bộ sưu tập Trà Trái Cây tươi mát. Đặt ngay!",
    time: "10 phút trước",
    badge: "Món mới",
    isRead: false,
  },
];

export function CustomerHeader({
  cartCount,
  showThemeToggle = true,
  tableName,
}: CustomerHeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(mockCustomerNotifications);
  const [storeName, setStoreName] = useState("CAS");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    void loadPublicStore()
      .then((store) => {
        setStoreName(store.name);
        setLogoUrl(store.logoUrl);
      })
      .catch(() => undefined);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 bg-cas-header shadow-[0_2px_12px_var(--cas-shadow-color)] backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[85rem] items-center justify-between px-4 md:px-8">
        <Link
          className="inline-flex items-center gap-3 text-xl font-bold text-cas-primary focus-visible:rounded-full focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
          href="/"
          aria-label="CAS - Trang chào mừng"
        >
          <span className="grid size-10 place-items-center overflow-hidden rounded-full shadow-[0_4px_12px_var(--cas-shadow-color)]">
            <img
              alt="Logo cửa hàng"
              className="size-full object-cover"
              src={
                logoUrl ??
                "https://www.clipartmax.com/png/middle/9-92296_red-restaurant-3-icon-restaurant.png"
              }
            />
          </span>
          <span>{storeName}</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cas-secondary-container/20 px-3 py-1.5 text-xs font-semibold text-cas-secondary">
            <CasIcon className="size-4" name="table" />
            {tableName}
          </span>

          {showThemeToggle ? <ThemeToggle /> : null}

          {/* Customer Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotif(!showNotif);
                if (!showNotif) markAllRead();
              }}
              className="relative grid size-10 place-items-center rounded-full text-cas-on-surface-variant transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              aria-label="Thông báo khuyến mãi và hệ thống"
            >
              <CasIcon className="size-5.5" name="bell" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-cas-primary text-[0.6rem] font-bold text-cas-on-primary animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-2.5">
                  <h4 className="text-xs font-black uppercase text-cas-on-surface flex items-center gap-1.5">
                    <CasIcon className="size-4 text-cas-primary" name="sparkle" />
                    Thông báo & Khuyến mãi
                  </h4>
                  <button
                    onClick={markAllRead}
                    className="text-[0.65rem] font-bold text-cas-primary hover:underline"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`rounded-2xl p-3 text-xs transition ${
                        n.isRead ? "bg-cas-glass" : "bg-cas-primary/10 border border-cas-primary/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-cas-on-surface">{n.title}</span>
                        {n.badge && (
                          <span className="rounded-md bg-cas-secondary/20 px-1.5 py-0.5 text-[0.6rem] font-black text-cas-secondary uppercase">
                            {n.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-[0.7rem] text-cas-on-surface-variant leading-relaxed">
                        {n.desc}
                      </p>
                      <span className="mt-2 block text-[0.65rem] font-medium text-cas-on-surface-variant/80">
                        {n.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {cartCount !== undefined ? (
            <Link
              className="relative grid size-10 place-items-center rounded-full text-cas-on-surface-variant transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              href="/cart"
              aria-label={`Giỏ hàng có ${cartCount} món`}
            >
              <CasIcon className="size-5.5" name="cart" />
              <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-cas-primary text-[0.6rem] font-bold text-cas-on-primary">
                {cartCount}
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

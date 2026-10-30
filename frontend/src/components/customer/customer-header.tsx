"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

import { CasIcon } from "../ui/cas-icon";
import { getCurrentCustomerSalesSession } from "../../lib/customer/sales-session";
import { readCustomerCart } from "../../lib/customer/cart";
import { getRememberedPublicStoreId, loadPublicStore } from "../../lib/api/store/public-store.api";
import {
  loadCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
} from "../../lib/api/notification/notification.api";

type CustomerHeaderProps = {
  cartCount?: number;
};

export function CustomerHeader({ cartCount }: CustomerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState<
    Awaited<ReturnType<typeof loadCustomerNotifications>>["notifications"]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [slogan, setSlogan] = useState<string | null>(null);
  const [branchName, setBranchName] = useState<string | null>(null);
  const [tableCode, setTableCode] = useState<number | null>(null);
  const [liveCartCount, setLiveCartCount] = useState(cartCount ?? 0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function clearCustomerHeader() {
      setNotifications([]);
      setUnreadCount(0);
      setShowNotif(false);
      setTableCode(null);
      setBranchName(null);
    }
    window.addEventListener("cas-customer-logout", clearCustomerHeader);
    return () => window.removeEventListener("cas-customer-logout", clearCustomerHeader);
  }, []);

  const loadNotifications = async () => {
    const result = await loadCustomerNotifications();
    setNotifications(result.notifications);
    setUnreadCount(result.unreadCount);
  };

  const markAllRead = async () => {
    await markAllCustomerNotificationsRead();
    await loadNotifications();
  };

  const markNotificationRead = async (notificationId: number) => {
    const notification = notifications.find((item) => item.id === notificationId);
    if (!notification || notification.status === "READ") return;

    await markCustomerNotificationRead(notificationId);
    setNotifications((current) =>
      current.map((item) => (item.id === notificationId ? { ...item, status: "READ" } : item)),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
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
    const timer = window.setInterval(() => void loadNotifications().catch(() => undefined), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncCart = () =>
      setLiveCartCount(readCustomerCart().reduce((sum, item) => sum + item.quantity, 0));
    syncCart();
    window.addEventListener("cas-cart-updated", syncCart);
    window.addEventListener("storage", syncCart);
    return () => {
      window.removeEventListener("cas-cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  useEffect(() => {
    let active = true;
    void getCurrentCustomerSalesSession()
      .then((session) => {
        if (!active) return;
        setTableCode(session.tableCode);
        if (session.sessionStatus === "PAYMENT_PENDING" && pathname !== "/payment") {
          router.replace("/payment");
        }
      })
      .catch(() => {
        if (active) setTableCode(null);
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    let active = true;
    const selectedStoreId = getRememberedPublicStoreId();
    void loadPublicStore(selectedStoreId ?? 1)
      .then((store) => {
        if (!active) return;
        setSlogan(store.welcomeSlogan);
        setBranchName(
          selectedStoreId !== null &&
            getRememberedPublicStoreId() === selectedStoreId &&
            store.brandName
            ? (store.branchName ?? store.name ?? null)
            : null,
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-19 bg-cas-primary shadow-[0_2px_12px_var(--cas-shadow-color)]">
      <div className="mx-auto flex h-full w-full max-w-[85rem] items-center justify-between gap-1 px-2 sm:px-4 md:px-8">
        <Link
          className="inline-flex min-w-0 items-center gap-2 text-xl font-bold text-cas-on-primary focus-visible:rounded-full focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
          href="/"
          aria-label="CAS - Trang chào mừng"
        >
          <img
            alt="Logo cửa hàng"
            className="h-16.5 w-[113px] shrink-0 object-contain brightness-0 invert"
            src="/images/bambu-garden-wordmark.svg"
          />
          <span className="flex min-w-0 flex-col">
            {slogan ? <span className="truncate text-sm">{slogan}</span> : null}
            {branchName ? (
              <span className="truncate text-xs font-semibold text-cas-on-primary">
                Cơ sở {branchName}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2.5">
          {tableCode !== null ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cas-on-primary/15 px-2 py-1.5 text-sm font-semibold whitespace-nowrap text-cas-on-primary sm:px-3">
              {/* <CasIcon className="size-4" name="table" /> */}
              {`Bàn ${String(tableCode).padStart(2, "0")}`}
            </span>
          ) : null}

          {/* Customer Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotif(!showNotif);
                if (!showNotif) void loadNotifications().catch(() => undefined);
              }}
              className="relative grid size-10 place-items-center rounded-full text-cas-on-primary transition hover:bg-cas-on-primary/15 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              aria-label="Thông báo khuyến mãi và hệ thống"
            >
              <CasIcon className="size-5.5" name="bell" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-cas-surface text-[0.6rem] font-bold text-cas-primary animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="fixed inset-x-3 top-19 mt-2 overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:w-80">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cas-outline-variant/20 pb-2.5">
                  <h4 className="text-sm font-black uppercase text-cas-on-surface flex items-center gap-1.5">
                    <CasIcon className="size-4 text-cas-primary" name="sparkle" />
                    Thông báo & Khuyến mãi
                  </h4>
                  <button
                    onClick={() => void markAllRead()}
                    className="text-sm font-bold text-cas-primary hover:underline"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <button
                      aria-label={
                        n.status === "UNREAD"
                          ? `Đánh dấu thông báo ${n.title} là đã đọc`
                          : undefined
                      }
                      disabled={n.status === "READ"}
                      key={n.id}
                      className={`rounded-2xl p-3 text-sm transition ${
                        n.status === "READ"
                          ? "w-full cursor-default bg-cas-glass text-left"
                          : "w-full border border-cas-primary/20 bg-cas-primary/10 text-left hover:bg-cas-primary/15 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                      }`}
                      onClick={() => void markNotificationRead(n.id)}
                      type="button"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-cas-on-surface">{n.title}</span>
                        {n.type && (
                          <span
                            className={`rounded-md border px-1.5 py-0.5 text-[0.6rem] font-black uppercase ${
                              n.type === "URGENT"
                                ? "border-cas-error text-cas-error"
                                : n.type === "WARNING"
                                  ? "border-cas-tertiary text-cas-tertiary"
                                  : "border-cas-on-surface text-cas-on-surface"
                            }`}
                          >
                            {n.type}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-cas-on-surface-variant leading-relaxed break-words">
                        {n.content}
                      </p>
                      <span className="mt-2 block text-sm font-medium text-cas-on-surface-variant/80">
                        {new Date(n.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {liveCartCount > 0 ? (
            <Link
              className="relative grid size-10 place-items-center rounded-full text-cas-on-primary transition hover:bg-cas-on-primary/15 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              href="/cart"
              aria-label={`Giỏ hàng có ${liveCartCount} món`}
            >
              <CasIcon className="size-5.5" name="cart" />
              <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-cas-surface text-[0.6rem] font-bold text-cas-primary">
                {liveCartCount}
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { CasIcon } from "../ui/cas-icon";

type OperatorNotification = {
  id: number;
  title: string;
  desc: string;
  time: string;
  type: "URGENT" | "WARNING" | "INFO";
  isRead: boolean;
};

const mockOperatorNotifications: OperatorNotification[] = [
  {
    id: 1,
    title: "Thông báo bảo trì hệ thống",
    desc: "Hệ thống CAS Backend sẽ bảo trì nhẹ từ 02:00 - 02:15 đêm nay.",
    time: "30 phút trước",
    type: "WARNING",
    isRead: false,
  },
  {
    id: 2,
    title: "Ưu đãi mới phát hành",
    desc: "Mã SUMMER50K vừa được ADMIN kích hoạt cho khách gọi món.",
    time: "1 giờ trước",
    type: "INFO",
    isRead: false,
  },
];

export function OperatorHeaderNotifications() {
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(mockOperatorNotifications);
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

  return (
    <div className="relative" ref={notifRef}>
      <button
        type="button"
        onClick={() => {
          setShowNotif(!showNotif);
          if (!showNotif) markAllRead();
        }}
        className="relative grid size-10 place-items-center rounded-xl bg-cas-glass border border-cas-outline-variant/20 text-cas-on-surface transition hover:bg-cas-surface-container focus-visible:outline-none"
        aria-label="Thông báo vận hành"
      >
        <CasIcon className="size-5" name="bell" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-cas-primary text-[0.65rem] font-black text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotif && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150 z-50">
          <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-2.5">
            <h4 className="text-xs font-black uppercase text-cas-on-surface flex items-center gap-1.5">
              <CasIcon className="size-4 text-cas-primary" name="bill" />
              Thông báo Vận hành Ca trực
            </h4>
            <button
              onClick={markAllRead}
              className="text-[0.65rem] font-bold text-cas-primary hover:underline"
            >
              Đã đọc
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
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[0.6rem] font-black uppercase ${
                      n.type === "URGENT"
                        ? "bg-rose-500/20 text-rose-600"
                        : n.type === "WARNING"
                        ? "bg-amber-500/20 text-amber-600"
                        : "bg-sky-500/20 text-sky-600"
                    }`}
                  >
                    {n.type}
                  </span>
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
  );
}

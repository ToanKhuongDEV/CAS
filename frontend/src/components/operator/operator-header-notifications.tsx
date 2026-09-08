"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import {
  loadOperatorNotifications,
  markAllOperatorNotificationsRead,
  markOperatorNotificationRead,
  type RecipientNotification,
} from "../../lib/api/notification/notification.api";
import { CasIcon } from "../ui/cas-icon";

const notificationQueryKey = ["operator", "notifications"] as const;

export function OperatorHeaderNotifications({
  pollIntervalMs = 30_000,
}: {
  pollIntervalMs?: number;
}) {
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { data, isError } = useQuery({
    queryKey: notificationQueryKey,
    queryFn: loadOperatorNotifications,
    refetchInterval: pollIntervalMs,
    refetchIntervalInBackground: false,
  });
  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotif(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const refresh = () => queryClient.invalidateQueries({ queryKey: notificationQueryKey });
  const markRead = async (notification: RecipientNotification) => {
    if (notification.status === "READ") return;
    await markOperatorNotificationRead(notification.id);
    await refresh();
  };
  const markAllRead = async () => {
    await markAllOperatorNotificationsRead();
    await refresh();
  };

  return (
    <div className="relative z-30" ref={notifRef}>
      <button
        aria-label="Thông báo vận hành"
        className="relative grid size-10 place-items-center rounded-xl border border-cas-outline-variant/20 bg-cas-glass text-cas-on-surface transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
        onClick={() => setShowNotif((value) => !value)}
        type="button"
      >
        <CasIcon className="size-5" name="bell" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-cas-primary text-[0.65rem] font-black text-cas-on-primary">
            {unreadCount}
          </span>
        ) : null}
      </button>
      {showNotif ? (
        <div className="absolute right-0 top-full z-100 mt-2 w-80 overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-2.5">
            <h4 className="flex items-center gap-1.5 text-xs font-black uppercase text-cas-on-surface">
              <CasIcon className="size-4 text-cas-primary" name="bell" />
              Thông báo vận hành
            </h4>
            {unreadCount ? (
              <button
                className="text-[0.68rem] font-bold text-cas-primary hover:underline"
                onClick={() => void markAllRead()}
                type="button"
              >
                Đọc tất cả
              </button>
            ) : null}
          </div>
          <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto">
            {isError ? (
              <p className="py-6 text-center text-xs text-cas-error">Không thể tải thông báo.</p>
            ) : notifications.length ? (
              notifications.map((notification) => (
                <button
                  className={`w-full rounded-2xl border p-3 text-left text-xs transition ${notification.status === "READ" ? "border-cas-outline-variant/15 bg-cas-glass/60" : "border-cas-primary/30 bg-cas-primary/10"}`}
                  key={notification.id}
                  onClick={() => void markRead(notification)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-extrabold text-cas-on-surface">{notification.title}</span>
                    <span
                      className={`rounded-md border px-1.5 py-0.5 text-[0.6rem] font-black uppercase ${
                        notification.type === "URGENT"
                          ? "border-cas-error text-cas-error"
                          : notification.type === "WARNING"
                            ? "border-cas-tertiary text-cas-tertiary"
                            : "border-cas-on-surface text-cas-on-surface"
                      }`}
                    >
                      {notification.type}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.7rem] leading-relaxed text-cas-on-surface-variant">
                    {notification.content}
                  </p>
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-cas-on-surface-variant">
                Không có thông báo nào.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

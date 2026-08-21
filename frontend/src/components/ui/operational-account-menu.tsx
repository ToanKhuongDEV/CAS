"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getFirebaseAuth } from "../../lib/auth/firebase";
import { signOutOperationalUser } from "../../lib/auth/operational-auth";
import { CasIcon } from "./cas-icon";
import { useToast } from "./toast-provider";

type OperationalAccountMenuProps = {
  area: "ADMIN" | "OPERATOR";
  fallbackName: string;
  loginPath: string;
};

export function OperationalAccountMenu({
  area,
  fallbackName,
  loginPath,
}: OperationalAccountMenuProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const menuReference = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(getFirebaseAuth(), setUser);
      return unsubscribe;
    } catch {}
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuReference.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOutOperationalUser();
    } catch {
      showToast({
        message: "Phiên Firebase chưa được cấu hình; bạn đã được chuyển về trang đăng nhập.",
        type: "info",
      });
    }

    router.replace(loginPath);
    router.refresh();
  }

  const accountName = user?.displayName || fallbackName;
  const phone = user?.phoneNumber || "Chưa cập nhật";
  const avatarClasses =
    area === "ADMIN"
      ? "bg-cas-primary/20 text-cas-primary"
      : "bg-cas-secondary-container/30 text-cas-secondary";

  return (
    <div className="relative" ref={menuReference}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-xl bg-cas-glass px-3 py-2 text-left transition hover:bg-cas-on-surface/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        type="button"
      >
        <span className={`grid size-8 place-items-center rounded-lg ${avatarClasses}`}>
          <CasIcon className="size-4.5" name="user" />
        </span>
        <span className="hidden sm:block">
          <span className="block text-xs font-extrabold">{accountName}</span>
          <span className="block text-[0.68rem] text-cas-on-surface-variant">
            {area === "ADMIN" ? "Quản trị viên" : "Nhân viên đang trực"}
          </span>
        </span>
        <CasIcon
          className={`hidden size-4 text-cas-on-surface-variant transition-transform sm:block ${isOpen ? "rotate-90" : ""}`}
          name="arrow"
        />
      </button>

      {isOpen ? (
        <section
          aria-label="Thông tin tài khoản"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-76 rounded-2xl border border-cas-outline-variant/50 bg-cas-surface-container p-4 shadow-[0_16px_36px_var(--cas-shadow-color)]"
          role="menu"
        >
          <div className="flex items-center gap-3">
            <span className={`grid size-10 place-items-center rounded-xl ${avatarClasses}`}>
              <CasIcon className="size-5" name="user" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{accountName}</p>
              <p className="text-xs text-cas-on-surface-variant">{area}</p>
            </div>
          </div>

          <dl className="mt-4 space-y-3 border-y border-cas-outline-variant/40 py-4 text-xs">
            <div className="flex items-start gap-2.5">
              <CasIcon className="mt-0.5 size-4 shrink-0 text-cas-on-surface-variant" name="mail" />
              <div className="min-w-0">
                <dt className="text-cas-on-surface-variant">Email</dt>
                <dd className="mt-0.5 break-all font-semibold">{user?.email || "Chưa cập nhật"}</dd>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <CasIcon
                className="mt-0.5 size-4 shrink-0 text-cas-on-surface-variant"
                name="phone"
              />
              <div className="min-w-0">
                <dt className="text-cas-on-surface-variant">Số điện thoại</dt>
                <dd className="mt-0.5 font-semibold">{phone}</dd>
              </div>
            </div>
          </dl>

          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cas-error-container/45 px-4 py-2.5 text-xs font-extrabold text-cas-on-error-container transition hover:bg-cas-error-container/70 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring disabled:pointer-events-none disabled:opacity-50"
            disabled={isSigningOut}
            onClick={handleSignOut}
            role="menuitem"
            type="button"
          >
            <CasIcon className="size-4" name="arrow" />
            {isSigningOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </section>
      ) : null}
    </div>
  );
}

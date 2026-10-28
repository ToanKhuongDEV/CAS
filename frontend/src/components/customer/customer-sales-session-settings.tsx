"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { logoutCustomer } from "../../lib/customer/sales-session";
import { clearCustomerCart } from "../../lib/customer/cart";
import { clearRememberedPublicStoreId } from "../../lib/api/store/public-store.api";
import { CasButton } from "../ui/cas-button";
import { useToast } from "../ui/toast-provider";

export function CustomerSalesSessionSettings() {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
      await queryClient.cancelQueries({ queryKey: ["customer"] });
      queryClient.removeQueries({ queryKey: ["customer"] });
      clearCustomerCart();
      clearRememberedPublicStoreId();
      window.sessionStorage.removeItem("cas.tableQrToken");
      window.dispatchEvent(new Event("cas-customer-logout"));
      router.replace("/");
      router.refresh();
    } catch (cause) {
      showToast({
        type: "error",
        message: cause instanceof Error ? cause.message : "Không thể thoát phiên.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <section className="mt-5 flex items-center justify-between gap-5 rounded-2xl bg-cas-surface-container p-5 shadow-[0_8px_24px_var(--cas-shadow-color)]">
        <div>
          <h2 className="font-extrabold">Thoát phiên khách</h2>
          <p className="mt-1 text-sm leading-relaxed text-cas-on-surface-variant">
            Đăng xuất để bắt đầu lượt mới. Phiên chưa gọi món sẽ được đóng; phiên đã gọi món cần
            thanh toán đầy đủ.
          </p>
        </div>
        <CasButton variant="outline" disabled={isLoggingOut} onClick={() => void logout()}>
          {isLoggingOut ? "Đang thoát..." : "Đăng xuất"}
        </CasButton>
      </section>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";

import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";
import { getCurrentCustomerTableSession } from "../../lib/customer/table-session";
import { clearCustomerCart, readCustomerCart } from "../../lib/customer/cart";
import { createCustomerOrder } from "../../lib/api/ordering/ordering.api";

const tableQrTokenKey = "cas.tableQrToken";

export function CustomerCartSubmitButton() {
  const router = useRouter();
  const { showToast } = useToast();

  async function handleSubmitOrder() {
    const tableQrToken = window.sessionStorage.getItem(tableQrTokenKey);
    if (tableQrToken) {
      try {
        await getCurrentCustomerTableSession();
      } catch {
        router.push(`/table/${encodeURIComponent(tableQrToken)}?returnTo=%2Fcart`);
        return;
      }

      const items = readCustomerCart();
      if (items.length === 0) return;
      try {
        await createCustomerOrder({
          note: null,
          items: items.map(({ menuItemId, quantity, optionValueIds }) => ({
            menuItemId,
            quantity,
            optionValueIds,
          })),
        });
        clearCustomerCart();
        router.push("/orders");
      } catch (cause) {
        showToast({
          type: "error",
          message: cause instanceof Error ? cause.message : "Không thể gửi món xuống bếp.",
        });
      }
      return;
    }

    router.push("/");
  }

  return (
    <button
      className="mt-2 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
      onClick={handleSubmitOrder}
      type="button"
    >
      <CasIcon className="size-5" name="restaurant" />
      Gửi món xuống bếp
    </button>
  );
}

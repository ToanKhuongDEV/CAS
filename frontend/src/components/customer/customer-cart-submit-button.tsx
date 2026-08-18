"use client";

import { useRouter } from "next/navigation";

import { CasIcon } from "../ui/cas-icon";
import { getCurrentCustomerTableSession } from "../../lib/customer/table-session";

const tableQrTokenKey = "cas.tableQrToken";

export function CustomerCartSubmitButton() {
  const router = useRouter();

  async function handleSubmitOrder() {
    const tableQrToken = window.sessionStorage.getItem(tableQrTokenKey);
    if (tableQrToken) {
      try {
        await getCurrentCustomerTableSession();
        router.push("/orders");
      } catch {
        router.push(`/table/${encodeURIComponent(tableQrToken)}?returnTo=%2Fcart`);
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

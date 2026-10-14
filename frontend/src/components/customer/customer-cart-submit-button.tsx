"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { CasIcon } from "../ui/cas-icon";
import { CasButton } from "../ui/cas-button";
import { useToast } from "../ui/toast-provider";
import { getCurrentCustomerSalesSession } from "../../lib/customer/sales-session";
import { clearCustomerCart, readCustomerCart } from "../../lib/customer/cart";
import { createCustomerOrder } from "../../lib/api/ordering/ordering.api";
import {
  customerBillQueryKey,
  customerOrdersQueryKey,
} from "../../lib/api/ordering/ordering.query";

const tableQrTokenKey = "cas.tableQrToken";

export function CustomerCartSubmitButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const idempotencyKeyRef = useRef<string | null>(null);

  async function handleSubmitOrder() {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    const tableQrToken = window.sessionStorage.getItem(tableQrTokenKey);
    if (tableQrToken) {
      try {
        await getCurrentCustomerSalesSession();
      } catch {
        isSubmittingRef.current = false;
        setSubmitting(false);
        router.push(`/table/${encodeURIComponent(tableQrToken)}?returnTo=%2Fcart`);
        return;
      }

      const items = readCustomerCart();
      if (items.length === 0) {
        isSubmittingRef.current = false;
        setSubmitting(false);
        return;
      }
      try {
        await createCustomerOrder({
          idempotencyKey: (idempotencyKeyRef.current ??= crypto.randomUUID()),
          note: null,
          items: items.map(({ menuItemId, quantity, optionValueIds }) => ({
            menuItemId,
            quantity,
            optionValueIds,
          })),
        });
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: customerOrdersQueryKey }),
          queryClient.invalidateQueries({ queryKey: customerBillQueryKey }),
        ]);
        clearCustomerCart();
        showToast({ type: "success", message: "Đã gửi món xuống bếp." });
        router.push("/orders");
      } catch (cause) {
        showToast({
          type: "error",
          message: cause instanceof Error ? cause.message : "Không thể gửi món xuống bếp.",
        });
        isSubmittingRef.current = false;
        setSubmitting(false);
      }
      return;
    }

    isSubmittingRef.current = false;
    setSubmitting(false);
    router.push("/start?returnTo=%2Fcart");
  }

  return (
    <CasButton
      className="mt-2 min-h-13 w-full rounded-xl shadow-[0_8px_20px_var(--cas-shadow-color)]"
      disabled={submitting}
      onClick={handleSubmitOrder}
      type="button"
    >
      <CasIcon className="size-5" name="restaurant" />
      Gửi món xuống bếp
    </CasButton>
  );
}

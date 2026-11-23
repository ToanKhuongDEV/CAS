"use client";

import { formatMoney } from "../../../lib/format-money";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";
import { PaymentRequestForm } from "../../../components/payment/payment-request-form";
import {
  customerBillQueryKey,
  useCustomerBillQuery,
} from "../../../lib/api/ordering/ordering.query";
import {
  customerPaymentSessionQueryKey,
  useCustomerPaymentQuery,
} from "../../../lib/api/payment/payment.query";
import {
  createCustomerPayment,
  promotionUnavailableMessage,
  type BillAdjustment,
  type Payment,
} from "../../../lib/api/payment/payment.api";

function paymentAdjustments(payment: Payment): BillAdjustment[] {
  try {
    const snapshot: unknown = JSON.parse(payment.billSnapshot);
    if (!snapshot || typeof snapshot !== "object" || !("adjustments" in snapshot)) return [];
    const items = snapshot.adjustments;
    return Array.isArray(items)
      ? items.filter(
          (item): item is BillAdjustment =>
            item &&
            typeof item === "object" &&
            typeof item.publicId === "string" &&
            typeof item.reason === "string" &&
            typeof item.amount === "number" &&
            (item.adjustmentType === "INCREASE" || item.adjustmentType === "DECREASE"),
        )
      : [];
  } catch {
    return [];
  }
}

function formatConfirmedAt(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(date);
}

const defaultPaymentPollIntervalMs = 10_000;
const customerSalesSessionRequiredMessage = "Vui lòng quét mã QR của bàn để tiếp tục.";

export function PaymentRequestPanel({
  pollIntervalMs = defaultPaymentPollIntervalMs,
}: {
  pollIntervalMs?: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: payment, error: paymentError } = useCustomerPaymentQuery(pollIntervalMs);
  const hasActiveSession = paymentError?.message !== customerSalesSessionRequiredMessage;
  const { data: bill, error: billError } = useCustomerBillQuery(
    pollIntervalMs,
    hasActiveSession && payment?.status !== "PAID",
  );
  const [error, setError] = useState<string | null>(null);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [voucherRefreshKey, setVoucherRefreshKey] = useState(0);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const isPending = payment?.status === "PENDING";

  function createNewOrder() {
    const token = window.sessionStorage.getItem("cas.tableQrToken");
    router.push(token ? `/table/${encodeURIComponent(token)}` : "/");
  }

  async function requestPayment() {
    if (isRequestingPayment || isPending) return;

    setError(null);
    setPromotionError(null);
    setIsRequestingPayment(true);
    try {
      const createdPayment = await createCustomerPayment();
      await queryClient.cancelQueries({ queryKey: customerPaymentSessionQueryKey() });
      queryClient.setQueryData(customerPaymentSessionQueryKey(), createdPayment);
      void queryClient.invalidateQueries({ queryKey: customerBillQueryKey });
    } catch (cause) {
      if (cause instanceof Error && cause.message === promotionUnavailableMessage) {
        setPromotionError(cause.message);
        setVoucherRefreshKey((value) => value + 1);
      } else {
        setError(cause instanceof Error ? cause.message : "Không thể gửi yêu cầu thanh toán.");
      }
    } finally {
      setIsRequestingPayment(false);
    }
  }

  if (!hasActiveSession) return null;

  if (isPending) {
    return (
      <section
        className="rounded-3xl border border-cas-secondary/25 bg-cas-surface-container p-7 text-center shadow-[0_8px_24px_var(--cas-shadow-color)]"
        aria-labelledby="payment-pending-title"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-cas-secondary-container/25 text-cas-secondary">
          <CasIcon className="size-8" name="clock" />
        </span>
        <p className="mt-5 text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          Đã gửi yêu cầu
        </p>
        <h2 className="mt-2 text-2xl font-extrabold" id="payment-pending-title">
          Chờ nhân viên xác nhận
        </h2>
        <p className="mt-3 text-sm leading-6 text-cas-on-surface-variant">
          Vui lòng gặp nhân viên để hoàn tất thanh toán. Màn hình sẽ tự cập nhật khi thanh toán được
          xác nhận.
        </p>
        {paymentAdjustments(payment).map((item) => (
          <p
            className="mt-2 flex justify-between gap-3 text-sm text-cas-on-surface-variant"
            key={item.publicId}
          >
            <span>{item.reason}</span>
            <span>
              {item.adjustmentType === "INCREASE" ? "+" : "−"}
              {formatMoney(item.amount)}
            </span>
          </p>
        ))}
        <p className="mt-6 text-2xl font-extrabold text-cas-primary">
          {formatMoney(payment.amount)}
        </p>
      </section>
    );
  }

  if (payment?.status === "PAID") {
    return (
      <div className="fixed inset-0 z-100 overflow-y-auto bg-cas-surface text-cas-on-surface">
        <main className="grid min-h-full place-items-center px-5 py-10">
          <section className="w-full max-w-md text-center" aria-labelledby="payment-success-title">
            <span className="mx-auto grid size-24 place-items-center rounded-full border-4 border-cas-secondary bg-cas-secondary-container/25 text-cas-secondary shadow-[0_12px_30px_var(--cas-shadow-color)]">
              <CasIcon className="size-12" name="check" />
            </span>
            <p className="mt-7 text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
              Đã hoàn tất
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight" id="payment-success-title">
              Thanh toán thành công
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-cas-on-surface-variant">
              Cảm ơn bạn đã sử dụng dịch vụ tại Bambu Garden.
            </p>
            <dl className="mt-7 overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass text-left shadow-[0_8px_24px_var(--cas-shadow-color)]">
              <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4">
                <dt className="text-sm text-cas-on-surface-variant">Hình thức</dt>
                <dd className="font-extrabold">
                  {payment.tableCode === null
                    ? "Mang về"
                    : `Bàn ${String(payment.tableCode).padStart(2, "0")}`}
                </dd>
              </div>
              {paymentAdjustments(payment).map((item) => (
                <div
                  className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4"
                  key={item.publicId}
                >
                  <dt className="text-sm text-cas-on-surface-variant">{item.reason}</dt>
                  <dd>
                    {item.adjustmentType === "INCREASE" ? "+" : "−"}
                    {formatMoney(item.amount)}
                  </dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4">
                <dt className="text-sm text-cas-on-surface-variant">Tổng thanh toán</dt>
                <dd className="text-lg font-extrabold text-cas-primary">
                  {formatMoney(payment.amount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-cas-on-surface-variant">Hoàn tất lúc</dt>
                <dd className="font-extrabold">{formatConfirmedAt(payment.confirmedAt)}</dd>
              </div>
            </dl>
            <CasButton
              className="mt-6 w-full shadow-[0_8px_20px_var(--cas-shadow-color)]"
              size="lg"
              onClick={createNewOrder}
            >
              Tiếp tục tạo đơn mới
            </CasButton>
            <CasButton
              className="mt-3 w-full"
              size="lg"
              variant="outline"
              onClick={() => router.replace("/")}
            >
              Về trang chủ
            </CasButton>
          </section>
        </main>
      </div>
    );
  }

  if (!bill)
    return (
      <p className="text-cas-on-surface-variant">
        {error ?? billError?.message ?? "Đang tải hóa đơn…"}
      </p>
    );

  return (
    <PaymentRequestForm
      bill={bill}
      error={promotionError ?? error ?? billError?.message ?? null}
      isRequesting={isRequestingPayment || isPending}
      onRequest={() => void requestPayment()}
      voucherRefreshKey={voucherRefreshKey}
    />
  );
}

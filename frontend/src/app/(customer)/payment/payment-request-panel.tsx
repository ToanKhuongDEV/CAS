"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";
import { PaymentRequestForm } from "../../../components/payment/payment-request-form";
import { loadCustomerBill, type CustomerBill } from "../../../lib/api/ordering/ordering.api";
import {
  createCustomerPayment,
  loadCustomerPayment,
  type Payment,
} from "../../../lib/api/payment/payment.api";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

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
  const [bill, setBill] = useState<CustomerBill | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(true);

  useEffect(() => {
    if (!hasActiveSession) return;

    let isActive = true;
    let isPolling = false;

    async function load() {
      if (isPolling) return;

      isPolling = true;
      try {
        const [billResult, paymentResult] = await Promise.allSettled([
          loadCustomerBill(),
          loadCustomerPayment(),
        ]);
        if (!isActive) return;

        const sessionIsClosed = [billResult, paymentResult].some(
          (result) =>
            result.status === "rejected" &&
            result.reason instanceof Error &&
            result.reason.message === customerSalesSessionRequiredMessage,
        );
        if (sessionIsClosed) {
          setBill(null);
          setPayment(null);
          setError(null);
          setHasActiveSession(false);
          return;
        }

        if (billResult.status === "fulfilled") {
          setBill(billResult.value);
          setError(null);
        } else {
          setError(
            billResult.reason instanceof Error
              ? billResult.reason.message
              : "Không thể tải hóa đơn.",
          );
        }
        if (paymentResult.status === "fulfilled") setPayment(paymentResult.value);
      } finally {
        isPolling = false;
      }
    }

    void load();
    const timer = window.setInterval(() => void load(), pollIntervalMs);
    return () => {
      isActive = false;
      window.clearInterval(timer);
    };
  }, [hasActiveSession, pollIntervalMs]);

  const isPending = payment?.status === "PENDING";

  function createNewOrder() {
    const token = window.sessionStorage.getItem("cas.tableQrToken");
    router.push(token ? `/table/${encodeURIComponent(token)}` : "/");
  }

  async function requestPayment() {
    if (isRequestingPayment || isPending) return;

    setError(null);
    setIsRequestingPayment(true);
    try {
      setPayment(await createCustomerPayment());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi yêu cầu thanh toán.");
    } finally {
      setIsRequestingPayment(false);
    }
  }

  if (!hasActiveSession) return null;

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
              Cảm ơn bạn đã sử dụng dịch vụ tại CAS.
            </p>
            <dl className="mt-7 overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass text-left shadow-[0_8px_24px_var(--cas-shadow-color)]">
              <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4">
                <dt className="text-sm text-cas-on-surface-variant">Bàn</dt>
                <dd className="font-extrabold">Bàn {String(payment.tableCode).padStart(2, "0")}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4">
                <dt className="text-sm text-cas-on-surface-variant">Tổng thanh toán</dt>
                <dd className="text-lg font-extrabold text-cas-primary">
                  {money.format(payment.amount)}
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
          </section>
        </main>
      </div>
    );
  }

  if (!bill) return <p className="text-cas-on-surface-variant">{error ?? "Đang tải hóa đơn…"}</p>;

  return (
    <PaymentRequestForm
      bill={bill}
      error={error}
      isRequesting={isRequestingPayment || isPending}
      onRequest={() => void requestPayment()}
    />
  );
}

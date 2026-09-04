"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";
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
const customerTableSessionRequiredMessage = "Vui lòng quét mã QR của bàn để tiếp tục.";

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
  const isPolling = useRef(false);

  useEffect(() => {
    if (!hasActiveSession) return;

    let isActive = true;

    async function load() {
      if (isPolling.current) return;

      isPolling.current = true;
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
            result.reason.message === customerTableSessionRequiredMessage,
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
        isPolling.current = false;
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
    <>
      <section
        className="rounded-[1.4rem] bg-cas-surface-container p-5 shadow-[0_10px_28px_var(--cas-shadow-color)] md:p-7"
        aria-labelledby="payment-summary-title"
      >
        <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/40 pb-4">
          <div>
            <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
              Phiên bàn hiện tại
            </p>
            <h2 className="mt-1 text-lg font-extrabold" id="payment-summary-title">
              Chi tiết thanh toán
            </h2>
          </div>
          <span className="rounded-full bg-cas-secondary-container/20 px-3 py-1 text-xs font-extrabold text-cas-secondary">
            {bill.orders.reduce(
              (total, order) =>
                total + order.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0),
              0,
            )}{" "}
            món
          </span>
        </div>
        <ul className="divide-y divide-cas-outline-variant/35">
          {bill.orders
            .flatMap((order) => order.items)
            .map((item) => (
              <li className="flex items-start gap-3 py-4" key={item.orderItemId}>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cas-surface text-xs font-extrabold text-cas-primary">
                  {item.quantity}×
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold">{item.itemName}</h3>
                  <div className="mt-2 space-y-1 text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
                    <p className="flex justify-between gap-3">
                      <span>Giá món gốc</span>
                      <span>{money.format(item.unitPrice)}</span>
                    </p>
                    {item.options.map((option) => (
                      <p
                        className="flex justify-between gap-3"
                        key={`${item.orderItemId}-${option.optionName}`}
                      >
                        <span>+ {option.optionName}</span>
                        <span>+{money.format(option.unitPrice)}</span>
                      </p>
                    ))}
                  </div>
                </div>
                <strong className="shrink-0 text-sm text-cas-primary">
                  {money.format(item.totalAmount)}
                </strong>
              </li>
            ))}
        </ul>
        <div className="border-t border-cas-outline-variant/40 pt-4 text-sm">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
                Tổng cần thanh toán
              </p>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                Toàn bộ order của phiên bàn
              </p>
            </div>
            <strong className="text-2xl text-cas-primary">
              {money.format(bill.payableAmount)}
            </strong>
          </div>
        </div>
      </section>
      <section className="mt-4 rounded-2xl border border-cas-secondary/20 bg-cas-secondary-container/20 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cas-secondary text-cas-on-primary">
            <CasIcon className="size-5" name="info" />
          </span>
          <div>
            <p className="text-sm font-extrabold">Kiểm tra hóa đơn trước khi gửi</p>
            <p className="mt-1 text-xs leading-relaxed text-cas-on-surface-variant">
              Yêu cầu thanh toán áp dụng cho toàn bộ order trong phiên bàn và bạn sẽ không thể gọi
              thêm món sau khi gửi.
            </p>
          </div>
        </div>
      </section>
      {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
      <div className="mt-5">
        <CasButton
          className="w-full shadow-[0_8px_20px_var(--cas-shadow-color)]"
          disabled={isPending || isRequestingPayment}
          icon={isPending || isRequestingPayment ? "clock" : "payment"}
          size="lg"
          onClick={() => void requestPayment()}
        >
          {isPending
            ? "Đã gửi yêu cầu thanh toán"
            : isRequestingPayment
              ? "Đang gửi yêu cầu..."
              : "Gửi yêu cầu thanh toán"}
        </CasButton>
        <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
          Tổng tiền sẽ được hệ thống xác nhận lại khi gửi yêu cầu.
        </p>
      </div>
      {isPending ? (
        <div
          className="fixed inset-0 z-100 grid place-items-center bg-cas-on-surface/55 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-pending-title"
        >
          <section className="w-full max-w-sm rounded-[1.4rem] bg-cas-surface-container p-6 text-center shadow-[0_16px_36px_var(--cas-shadow-color)]">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-cas-tertiary text-cas-on-primary">
              <CasIcon className="size-7" name="payment" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold" id="payment-pending-title">
              Yêu cầu thanh toán đã được gửi
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-cas-on-surface-variant">
              Vui lòng đến quầy thu ngân để thanh toán và chờ nhân viên xác nhận.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}

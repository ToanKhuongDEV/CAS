"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CasIcon } from "../../../../../components/ui/cas-icon";
import { getFirebaseAuth } from "../../../../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../../../../lib/auth/operational-auth";
import {
  confirmOperatorPayment,
  loadOperatorPayments,
  operatorPendingPaymentCountQueryKey,
  type Payment,
} from "../../../../../lib/api/payment/payment.api";
import { loadPublicStore } from "../../../../../lib/api/store/public-store.api";
import type { StoreSettings } from "../../../../../lib/api/store/store-settings.api";

type ReceiptItem = {
  name: string;
  options?: Array<{ name: string; price: string }>;
  quantity: number;
  total: string;
  unitPrice: string;
};

type PendingPayment = {
  amount: string;
  billNumber: string;
  discountAmount: string;
  id: string;
  items: ReceiptItem[];
  originalAmount: string;
  payableAmount: string;
  requestedAt: string;
  table: string;
};

const currency = new Intl.NumberFormat("vi-VN");
const defaultPaymentPollIntervalMs = 10_000;

function formatRequestedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
      }).format(date);
}

function toPendingPayment(payment: Payment): PendingPayment {
  let snapshot: {
    orders?: Array<{
      items?: Array<{
        itemName: string;
        quantity: number;
        unitPrice: number;
        optionsAmount: number;
        totalAmount: number;
        options?: Array<{ optionName: string; unitPrice: number }>;
      }>;
    }>;
    originalAmount?: number;
  } = {};
  try {
    snapshot = JSON.parse(payment.billSnapshot) as typeof snapshot;
  } catch {
    // A malformed historical snapshot must not make the payment queue unusable.
  }
  const items = snapshot.orders?.flatMap((order) => order.items ?? []) ?? [];
  const originalAmount = snapshot.originalAmount ?? payment.amount;
  const discountAmount = Math.max(0, originalAmount - payment.amount);
  const formatCurrency = (amount: number) => `${currency.format(amount)}đ`;
  return {
    id: payment.publicId,
    table: `Bàn ${String(payment.tableCode).padStart(2, "0")}`,
    amount: formatCurrency(payment.amount),
    requestedAt: formatRequestedAt(payment.createdAt),
    billNumber: payment.publicId,
    originalAmount: formatCurrency(originalAmount),
    discountAmount: formatCurrency(discountAmount),
    payableAmount: formatCurrency(payment.amount),
    items: items.map((item) => ({
      name: item.itemName,
      quantity: item.quantity,
      unitPrice: formatCurrency(item.unitPrice + item.optionsAmount),
      total: formatCurrency(item.totalAmount),
      options: item.options?.map((option) => ({
        name: option.optionName,
        price: formatCurrency(option.unitPrice),
      })),
    })),
  };
}

export function OperatorPaymentConfirmationList({
  pollIntervalMs = defaultPaymentPollIntervalMs,
}: {
  pollIntervalMs?: number;
}) {
  const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const pendingLoad = useRef<Promise<Payment[]> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let isActive = true;

    async function load() {
      const request = pendingLoad.current ?? loadOperatorPayments();
      pendingLoad.current = request;
      try {
        const items = await request;
        if (!isActive) return;
        setPayments(items.map(toPendingPayment));
        setLoadError(null);
      } catch (error) {
        if (!isActive) return;
        setLoadError(
          error instanceof Error ? error.message : "Không thể tải payment chờ xác nhận.",
        );
      } finally {
        if (isActive) setIsLoading(false);
        if (pendingLoad.current === request) pendingLoad.current = null;
      }
    }

    function refreshWhenVisible() {
      if (!document.hidden) void load();
    }

    void load();
    const timer = window.setInterval(() => void load(), pollIntervalMs);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      isActive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [pollIntervalMs]);

  useEffect(() => {
    let isActive = true;
    const user = getFirebaseAuth().currentUser;
    if (!user) return;

    void getCurrentOperationalAccount(user)
      .then(async (account) => {
        const storeSettings = await loadPublicStore(account.storeId);
        if (!isActive) return;
        setOperatorName(account.displayName);
        setStore(storeSettings);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);

  useEffect(() => {
    if (!selectedPayment) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedPayment(null);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPayment]);

  async function handleConfirmPayment() {
    if (!selectedPayment) {
      return;
    }

    setConfirmError(null);
    setIsConfirming(true);
    try {
      await confirmOperatorPayment(selectedPayment.id);
      setPayments((currentPayments) =>
        currentPayments.filter((payment) => payment.id !== selectedPayment.id),
      );
      queryClient.setQueryData<number>(operatorPendingPaymentCountQueryKey, (currentCount) =>
        Math.max(0, (currentCount ?? 1) - 1),
      );
      setConfirmedMessage(
        `Đã xác nhận ${selectedPayment.table} thanh toán ${selectedPayment.amount}.`,
      );
      setSelectedPayment(null);
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : "Không thể xác nhận thanh toán.");
    } finally {
      setIsConfirming(false);
    }
  }

  function handlePrintBill() {
    window.print();
  }

  return (
    <>
      <header>
        <h1 className="text-3xl font-extrabold">Thanh toán chờ xác nhận</h1>
      </header>

      {confirmedMessage ? (
        <div
          className="mt-5 flex items-start gap-3 rounded-xl border border-cas-secondary/25 bg-cas-secondary-container/20 p-4 text-sm font-bold text-cas-secondary"
          role="status"
        >
          <CasIcon className="mt-0.5 size-5 shrink-0" name="check" />
          <p>{confirmedMessage}</p>
        </div>
      ) : null}

      {loadError ? (
        <div
          className="mt-5 rounded-xl border border-cas-error/25 bg-cas-error-container/20 p-4 text-sm font-bold text-cas-error"
          role="alert"
        >
          {loadError}
        </div>
      ) : isLoading ? (
        <p className="mt-7 text-sm text-cas-on-surface-variant">Đang tải payment chờ xác nhận...</p>
      ) : payments.length > 0 ? (
        <ul
          className="mt-7 overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]"
          aria-label="Danh sách thanh toán chờ xác nhận"
        >
          {payments.map((payment) => (
            <li
              className="grid gap-3 border-b border-cas-outline-variant/25 p-5 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
              key={payment.id}
            >
              <p className="font-extrabold">{payment.table}</p>
              <p className="text-sm text-cas-on-surface-variant">
                Yêu cầu lúc {payment.requestedAt}
              </p>
              <p className="font-extrabold text-cas-primary">{payment.amount}</p>
              <button
                className="w-fit rounded-xl bg-cas-primary px-4 py-2 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedPayment(payment)}
                type="button"
              >
                Xác nhận đã thanh toán
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-7 grid min-h-56 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-8 text-center">
          <div>
            <h2 className="text-lg font-extrabold">Không còn thanh toán chờ xác nhận</h2>
            <p className="mt-1 text-sm text-cas-on-surface-variant">
              Tất cả yêu cầu thanh toán đã được xử lý.
            </p>
          </div>
        </div>
      )}

      {selectedPayment ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPayment(null);
            }
          }}
        >
          <section
            className="w-full max-w-md rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl sm:p-6"
            aria-labelledby="payment-confirmation-title"
            aria-modal="true"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
                  {selectedPayment.table}
                </p>
                <h2 className="mt-1 text-xl font-extrabold" id="payment-confirmation-title">
                  Xác nhận thanh toán
                </h2>
              </div>
              <button
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-cas-outline-variant/35 text-cas-on-surface-variant transition hover:border-cas-primary/30 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedPayment(null)}
                type="button"
                aria-label="Đóng xác nhận thanh toán"
              >
                <CasIcon className="size-5 rotate-45" name="plus" />
              </button>
            </div>

            <section aria-label="Bản in bill" className="print-bill">
              <header className="print-bill__header">
                <strong>{store?.name ?? "Thông tin cửa hàng"}</strong>
                <span>{store?.address ?? "—"}</span>
                <span>Hotline: {store?.phone ?? "—"}</span>
              </header>

              <h1>HÓA ĐƠN THANH TOÁN</h1>
              <div className="print-bill__meta">
                <span>{selectedPayment.billNumber}</span>
                <span>{selectedPayment.table}</span>
                <span>Yêu cầu lúc: {selectedPayment.requestedAt}</span>
                <span>Người xác nhận: {operatorName ?? "—"}</span>
              </div>

              <div className="print-bill__divider" />
              <div className="print-bill__columns">
                <span>MÓN / TOPPING</span>
                <span>SL × Đ.GIÁ</span>
                <span>THÀNH TIỀN</span>
              </div>
              <div className="print-bill__divider" />

              <div className="print-bill__items">
                {selectedPayment.items.map((item, index) => (
                  <div className="print-bill__item" key={`${item.name}-${index}`}>
                    <strong>{item.name}</strong>
                    <div className="print-bill__item-price">
                      <span>
                        {item.quantity} × {item.unitPrice}
                      </span>
                      <strong>{item.total}</strong>
                    </div>
                    {item.options?.map((option) => (
                      <div className="print-bill__option" key={option.name}>
                        <span>+ {option.name}</span>
                        <span>{option.price}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="print-bill__divider" />
              <div className="print-bill__total">
                <span>Tạm tính</span>
                <strong>{selectedPayment.originalAmount}</strong>
                <span>Giảm giá</span>
                <strong>{selectedPayment.discountAmount}</strong>
                <span>TỔNG THANH TOÁN</span>
                <strong className="print-bill__grand-total">{selectedPayment.payableAmount}</strong>
              </div>
              <div className="print-bill__divider" />
              <p>Trạng thái: Xác nhận thanh toán thủ công</p>
              <footer>Cảm ơn quý khách. Hẹn gặp lại!</footer>
            </section>

            <div className="mt-5 rounded-xl bg-cas-surface-container/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-cas-on-surface-variant">Số tiền</span>
                <strong className="text-xl text-cas-primary">{selectedPayment.amount}</strong>
              </div>
              <p className="mt-4 border-t border-cas-outline-variant/25 pt-4 text-sm leading-6 text-cas-on-surface">
                Bạn chỉ xác nhận khi đã kiểm tra loa bên ngoài CAS báo giao dịch thành công.
              </p>
            </div>

            {confirmError ? (
              <p className="mt-4 text-sm font-bold text-cas-error" role="alert">
                {confirmError}
              </p>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <button
                className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-extrabold transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setSelectedPayment(null)}
                type="button"
              >
                Quay lại
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cas-primary/35 px-4 text-sm font-extrabold text-cas-primary transition hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={handlePrintBill}
                type="button"
              >
                <CasIcon className="size-4" name="bill" />
                In bill
              </button>
              <button
                className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                disabled={isConfirming}
                onClick={handleConfirmPayment}
                type="button"
              >
                {isConfirming ? "Đang xác nhận..." : "Xác nhận đã thanh toán"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style jsx global>{`
        .print-bill {
          display: none;
        }

        @media print {
          @page {
            margin: 2mm 4mm;
            size: 80mm auto;
          }

          body * {
            visibility: hidden;
          }

          .print-bill,
          .print-bill * {
            visibility: visible;
          }

          .print-bill {
            box-sizing: border-box;
            color: var(--cas-on-surface);
            display: block;
            font-family: var(--font-cas);
            font-size: 10px;
            left: 0;
            line-height: 1.35;
            position: absolute;
            top: 0;
            width: 72mm;
          }

          .print-bill__header,
          .print-bill h1,
          .print-bill footer {
            display: grid;
            gap: 2px;
            text-align: center;
          }

          .print-bill__header strong,
          .print-bill h1,
          .print-bill__grand-total {
            font-size: 12px;
          }

          .print-bill h1 {
            font-size: 13px;
            margin: 12px 0 8px;
          }

          .print-bill__meta {
            display: grid;
            gap: 2px;
          }

          .print-bill__divider {
            border-top: 1px dashed var(--cas-on-surface);
            margin: 8px 0;
          }

          .print-bill__columns,
          .print-bill__item-price,
          .print-bill__option,
          .print-bill__total {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto auto;
            gap: 8px;
          }

          .print-bill__columns {
            font-size: 9px;
            font-weight: 700;
          }

          .print-bill__columns span:last-child,
          .print-bill__item-price strong,
          .print-bill__option span:last-child,
          .print-bill__total strong {
            text-align: right;
          }

          .print-bill__item + .print-bill__item {
            margin-top: 8px;
          }

          .print-bill__item-price,
          .print-bill__option {
            margin-top: 2px;
          }

          .print-bill__option {
            color: var(--cas-on-surface-variant);
            grid-template-columns: minmax(0, 1fr) auto;
            padding-left: 8px;
          }

          .print-bill__total {
            grid-template-columns: minmax(0, 1fr) auto;
            row-gap: 4px;
          }

          .print-bill__total span:nth-of-type(3),
          .print-bill__total strong:last-child {
            font-weight: 800;
            margin-top: 4px;
          }

          .print-bill > p {
            margin: 0;
          }

          .print-bill footer {
            margin-top: 16px;
          }
        }
      `}</style>
    </>
  );
}

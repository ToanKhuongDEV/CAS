"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { CasIcon } from "../../../../../components/ui/cas-icon";
import { getFirebaseAuth } from "../../../../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../../../../lib/auth/operational-auth";
import {
  confirmOperatorPayment,
  loadOperatorPaidTodayPayments,
  loadOperatorPayments,
  operatorPendingPaymentCountQueryKey,
  type Payment,
} from "../../../../../lib/api/payment/payment.api";
import { loadPublicStore } from "../../../../../lib/api/store/public-store.api";
import type { StoreSettings } from "../../../../../lib/api/store/store-settings.api";

type ReceiptItem = {
  name: string;
  options?: Array<{ groupName?: string; name: string; price: string }>;
  quantity: number;
  total: string;
  unitPrice: string;
};

type ReceiptOrder = {
  items: ReceiptItem[];
  note: string | null;
  orderNumber: string;
  requestedAt: string;
};

type SnapshotBill = {
  orders?: Array<{
    createdAt?: string;
    items?: Array<{
      itemName: string;
      options?: Array<{ groupName?: string; optionName: string; unitPrice: number }>;
      optionsAmount: number;
      quantity: number;
      totalAmount: number;
      unitPrice: number;
    }>;
    note?: string | null;
    orderNumber?: string;
  }>;
  originalAmount?: number;
};

type PaymentListMode = "PENDING" | "PAID";

type OperatorPayment = {
  amount: string;
  discountLabel: string | null;
  discountAmount: string;
  id: string;
  orders: ReceiptOrder[];
  originalAmount: string;
  payableAmount: string;
  requestedAt: string;
  status: PaymentListMode;
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

function toOperatorPayment(payment: Payment): OperatorPayment {
  let snapshot: SnapshotBill & {
    bill?: SnapshotBill;
    discount?: { code?: string | null; name?: string; discountAmount?: number } | null;
  } = {};
  try {
    snapshot = JSON.parse(payment.billSnapshot) as typeof snapshot;
  } catch {
    // A malformed historical snapshot must not make the payment queue unusable.
  }
  const bill = snapshot.bill ?? snapshot;
  const originalAmount = bill.originalAmount ?? payment.amount;
  const discountAmount = Math.max(0, originalAmount - payment.amount);
  const formatCurrency = (amount: number) => `${currency.format(amount)}đ`;
  return {
    id: payment.publicId,
    table: `Bàn ${String(payment.tableCode).padStart(2, "0")}`,
    amount: formatCurrency(payment.amount),
    requestedAt: formatRequestedAt(
      payment.status === "PAID" ? (payment.confirmedAt ?? payment.createdAt) : payment.createdAt,
    ),
    originalAmount: formatCurrency(originalAmount),
    discountAmount: formatCurrency(snapshot.discount?.discountAmount ?? discountAmount),
    discountLabel: snapshot.discount
      ? (snapshot.discount.code ?? snapshot.discount.name ?? null)
      : null,
    payableAmount: formatCurrency(payment.amount),
    status: payment.status,
    orders: (bill.orders ?? []).map((order) => ({
      orderNumber: order.orderNumber ?? "Đơn gọi món",
      note: order.note ?? null,
      requestedAt: order.createdAt ? formatRequestedAt(order.createdAt) : "—",
      items: (order.items ?? []).map((item) => ({
        name: item.itemName,
        quantity: item.quantity,
        unitPrice: formatCurrency(item.unitPrice + item.optionsAmount),
        total: formatCurrency(item.totalAmount),
        options: item.options?.map((option) => ({
          groupName: option.groupName,
          name: option.optionName,
          price: formatCurrency(option.unitPrice),
        })),
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
  const [mode, setMode] = useState<PaymentListMode>("PENDING");
  const [payments, setPayments] = useState<OperatorPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const paymentLoads = useRef<Partial<Record<PaymentListMode, Promise<Payment[]>>>>({});
  const queryClient = useQueryClient();

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    async function load() {
      const request =
        paymentLoads.current[mode] ??
        (mode === "PENDING" ? loadOperatorPayments() : loadOperatorPaidTodayPayments());
      paymentLoads.current[mode] = request;
      try {
        const items = await request;
        if (!isActive) return;
        setPayments(items.map(toOperatorPayment));
        setLoadError(null);
      } catch (error) {
        if (!isActive) return;
        setLoadError(
          error instanceof Error ? error.message : "Không thể tải payment chờ xác nhận.",
        );
      } finally {
        if (isActive) setIsLoading(false);
        if (paymentLoads.current[mode] === request) delete paymentLoads.current[mode];
      }
    }

    function refreshWhenVisible() {
      if (!document.hidden) void load();
    }

    void load();
    const timer =
      mode === "PENDING" ? window.setInterval(() => void load(), pollIntervalMs) : undefined;
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      isActive = false;
      if (timer !== undefined) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [mode, pollIntervalMs]);

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
  const [selectedPayment, setSelectedPayment] = useState<OperatorPayment | null>(null);
  const [viewedPayment, setViewedPayment] = useState<OperatorPayment | null>(null);
  const activePayment = selectedPayment ?? viewedPayment;

  useEffect(() => {
    if (!activePayment) {
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
  }, [activePayment]);

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

  function handlePrintBill(payment: OperatorPayment) {
    setViewedPayment(payment);
    window.setTimeout(() => {
      window.print();
      setViewedPayment(null);
    }, 0);
  }

  return (
    <>
      <header>
        <div
          aria-label="Bộ lọc trạng thái thanh toán"
          className="inline-flex rounded-xl border border-cas-outline-variant/35 bg-cas-surface-container/50 p-1"
        >
          <button
            aria-pressed={mode === "PENDING"}
            className={`rounded-lg px-4 py-2 text-sm font-extrabold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${
              mode === "PENDING"
                ? "bg-cas-primary text-cas-on-primary"
                : "text-cas-on-surface-variant hover:bg-cas-primary/10 hover:text-cas-on-surface"
            }`}
            onClick={() => {
              setMode("PENDING");
              setSelectedPayment(null);
              setViewedPayment(null);
            }}
            type="button"
          >
            Chưa thanh toán
          </button>
          <button
            aria-pressed={mode === "PAID"}
            className={`rounded-lg px-4 py-2 text-sm font-extrabold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${
              mode === "PAID"
                ? "bg-cas-primary text-cas-on-primary"
                : "text-cas-on-surface-variant hover:bg-cas-primary/10 hover:text-cas-on-surface"
            }`}
            onClick={() => {
              setMode("PAID");
              setSelectedPayment(null);
              setViewedPayment(null);
            }}
            type="button"
          >
            Đã thanh toán hôm nay
          </button>
        </div>
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
          aria-label={
            mode === "PENDING"
              ? "Danh sách thanh toán chờ xác nhận"
              : "Danh sách thanh toán đã xác nhận trong ngày"
          }
        >
          {payments.map((payment) => (
            <li
              className="grid gap-3 border-b border-cas-outline-variant/25 p-5 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
              key={payment.id}
            >
              <p className="font-extrabold">{payment.table}</p>
              <p className="text-sm text-cas-on-surface-variant">
                {mode === "PENDING" ? "Yêu cầu lúc" : "Xác nhận lúc"} {payment.requestedAt}
              </p>
              <p className="font-extrabold text-cas-primary">{payment.amount}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  className="w-fit rounded-xl border border-cas-primary/35 px-4 py-2 text-sm font-extrabold text-cas-primary transition hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                  onClick={() => setViewedPayment(payment)}
                  type="button"
                >
                  Xem hóa đơn
                </button>
                <button
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-cas-primary/35 px-4 py-2 text-sm font-extrabold text-cas-primary transition hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                  onClick={() => handlePrintBill(payment)}
                  type="button"
                >
                  <CasIcon className="size-4" name="bill" />
                  In bill
                </button>
                <button
                  className={`w-fit rounded-xl bg-cas-primary px-4 py-2 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${mode === "PENDING" ? "" : "hidden"}`}
                  disabled={mode !== "PENDING"}
                  onClick={() => setSelectedPayment(payment)}
                  type="button"
                >
                  Xác nhận đã thanh toán
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-7 grid min-h-56 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-8 text-center">
          <div>
            <h2 className="text-lg font-extrabold">
              {mode === "PENDING"
                ? "Không còn thanh toán chờ xác nhận"
                : "Chưa có thanh toán đã xác nhận hôm nay"}
            </h2>
            <p className="mt-1 text-sm text-cas-on-surface-variant">
              {mode === "PENDING"
                ? "Tất cả yêu cầu thanh toán đã được xử lý."
                : "Các hóa đơn được xác nhận hôm nay sẽ hiển thị tại đây."}
            </p>
          </div>
        </div>
      )}

      {activePayment ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPayment(null);
              setViewedPayment(null);
            }
          }}
        >
          <section
            className="payment-bill-dialog max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl sm:p-6"
            aria-labelledby="payment-dialog-title"
            aria-modal="true"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
                  {activePayment.table}
                </p>
                <h2 className="mt-1 text-xl font-extrabold" id="payment-dialog-title">
                  {selectedPayment ? "Xác nhận thanh toán" : "Xem hóa đơn"}
                </h2>
              </div>
              <button
                className="grid size-10 shrink-0 place-items-center rounded-xl border border-cas-outline-variant/35 text-cas-on-surface-variant transition hover:border-cas-primary/30 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => {
                  setSelectedPayment(null);
                  setViewedPayment(null);
                }}
                type="button"
                aria-label={selectedPayment ? "Đóng xác nhận thanh toán" : "Đóng hóa đơn"}
              >
                <CasIcon className="size-5 rotate-45" name="plus" />
              </button>
            </div>

            <div className="mt-5">
              <section aria-label="Bản in bill" className="print-bill !block space-y-3 text-sm">
                <header className="print-bill__header grid gap-1 text-center text-xs text-cas-on-surface-variant">
                  <strong>{store?.name ?? "Thông tin cửa hàng"}</strong>
                  <span>{store?.address ?? "—"}</span>
                  <span>Hotline: {store?.phone ?? "—"}</span>
                </header>

                <h1 className="text-center text-base font-extrabold">HÓA ĐƠN THANH TOÁN</h1>
                <div className="print-bill__meta grid gap-1 text-xs text-cas-on-surface-variant">
                  <span>{activePayment.table}</span>
                  <span>
                    {activePayment.status === "PENDING" ? "Yêu cầu lúc" : "Xác nhận lúc"}:{" "}
                    {activePayment.requestedAt}
                  </span>
                  <span>Người xác nhận: {operatorName ?? "—"}</span>
                </div>

                <div className="print-bill__divider border-t border-dashed border-cas-outline-variant/50" />
                <div className="print-bill__columns grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2 text-xs font-bold text-cas-on-surface-variant">
                  <span>MÓN / TOPPING</span>
                  <span>SL × Đ.GIÁ</span>
                  <span>THÀNH TIỀN</span>
                </div>
                <div className="print-bill__divider border-t border-dashed border-cas-outline-variant/50" />

                <div className="print-bill__items space-y-4">
                  {activePayment.orders.map((order) => (
                    <section key={order.orderNumber}>
                      <p className="mt-1 text-xs text-cas-on-surface-variant">
                        {order.requestedAt}
                      </p>
                      {order.note ? (
                        <p className="mt-1 text-xs text-cas-on-surface-variant">
                          Ghi chú: {order.note}
                        </p>
                      ) : null}
                      <div className="mt-2 space-y-2">
                        {order.items.map((item, index) => (
                          <div className="print-bill__item" key={`${item.name}-${index}`}>
                            <strong>{item.name}</strong>
                            <div className="print-bill__item-price grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                              <span>
                                {item.quantity} × {item.unitPrice}
                              </span>
                              <strong>{item.total}</strong>
                            </div>
                            {item.options?.map((option) => (
                              <div
                                className="print-bill__option grid grid-cols-[minmax(0,1fr)_auto] gap-2 pl-2 text-cas-on-surface-variant"
                                key={`${option.groupName ?? ""}-${option.name}`}
                              >
                                <span>
                                  + {option.groupName ? `${option.groupName}: ` : ""}
                                  {option.name}
                                </span>
                                <span>{option.price}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <div className="print-bill__divider border-t border-dashed border-cas-outline-variant/50" />
                <div className="print-bill__total grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1">
                  <span>Tạm tính</span>
                  <strong>{activePayment.originalAmount}</strong>
                  <span>
                    {activePayment.discountLabel
                      ? `Giảm giá (${activePayment.discountLabel})`
                      : "Giảm giá"}
                  </span>
                  <strong>{activePayment.discountAmount}</strong>
                  <span>TỔNG THANH TOÁN</span>
                  <strong className="print-bill__grand-total">{activePayment.payableAmount}</strong>
                </div>
                <div className="print-bill__divider border-t border-dashed border-cas-outline-variant/50" />
                <p className="text-xs text-cas-on-surface-variant">
                  Trạng thái:{" "}
                  {activePayment.status === "PENDING" ? "Chờ xác nhận thanh toán" : "Đã thanh toán"}
                </p>
                <footer className="text-center text-xs text-cas-on-surface-variant">
                  Cảm ơn quý khách. Hẹn gặp lại!
                </footer>
              </section>

              <div className="mt-5 rounded-xl bg-cas-surface-container/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-cas-on-surface-variant">Số tiền</span>
                  <strong className="text-xl text-cas-primary">{activePayment.amount}</strong>
                </div>
                {selectedPayment ? (
                  <p className="mt-4 border-t border-cas-outline-variant/25 pt-4 text-sm leading-6 text-cas-on-surface">
                    Bạn chỉ xác nhận khi đã kiểm tra loa bên ngoài CAS báo giao dịch thành công.
                  </p>
                ) : null}
              </div>

              {selectedPayment && confirmError ? (
                <p className="mt-4 text-sm font-bold text-cas-error" role="alert">
                  {confirmError}
                </p>
              ) : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-extrabold transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => {
                  setSelectedPayment(null);
                  setViewedPayment(null);
                }}
                type="button"
              >
                Quay lại
              </button>
              {selectedPayment ? (
                <button
                  className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                  disabled={isConfirming}
                  onClick={handleConfirmPayment}
                  type="button"
                >
                  {isConfirming ? "Đang xác nhận..." : "Xác nhận đã thanh toán"}
                </button>
              ) : activePayment.status === "PENDING" ? (
                <button
                  className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                  onClick={() => {
                    setSelectedPayment(activePayment);
                    setViewedPayment(null);
                  }}
                  type="button"
                >
                  Xác nhận thanh toán
                </button>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      <style jsx global>{`
        .print-bill {
          display: none;
        }

        .payment-bill-dialog {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .payment-bill-dialog::-webkit-scrollbar {
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

"use client";

import { useEffect, useState } from "react";

import {
  type CustomerBill,
  loadOperatorBill,
  loadOperatorTables,
} from "../../lib/api/ordering/ordering.api";
import { createOperatorPayment, recordOperatorUnpaid } from "../../lib/api/payment/payment.api";
import {
  CustomerOrderVoucherSummary,
  type VoucherSummary,
} from "../customer/customer-order-voucher-summary";
import { PaymentRequestForm } from "../payment/payment-request-form";
import {
  clearOperatorPromotion,
  loadOperatorEligiblePromotions,
  selectOperatorPromotion,
  type EligiblePromotion,
} from "../../lib/api/promotion/promotion.api";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";

const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

type ActiveTable = { sessionId: string; tableCode: number };

export function OperatorPaymentControlView({
  onPaymentRequested,
}: {
  onPaymentRequested: () => void;
}) {
  const [tables, setTables] = useState<ActiveTable[]>([]);
  const [selected, setSelected] = useState<ActiveTable | null>(null);
  const [bill, setBill] = useState<CustomerBill | null>(null);
  const [voucherSummary, setVoucherSummary] = useState<VoucherSummary | null>(null);
  const [vouchers, setVouchers] = useState<EligiblePromotion[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<EligiblePromotion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [unpaidTable, setUnpaidTable] = useState<ActiveTable | null>(null);

  async function refresh() {
    setIsLoading(true);
    try {
      const result = await loadOperatorTables();
      setTables(
        result.flatMap((table) =>
          table.sessions
            .filter((session) => session.status === "OPEN")
            .map((session) => ({ sessionId: session.sessionId, tableCode: table.tableCode })),
        ),
      );
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải các bàn đang hoạt động.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function openPaymentRequest(table: ActiveTable) {
    setSelected(table);
    setBill(null);
    setVoucherSummary(null);
    setError(null);
    try {
      const nextBill = await loadOperatorBill(table.sessionId);
      setBill(nextBill);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải hóa đơn.");
    }
  }

  async function chooseVoucher(voucher: EligiblePromotion | null) {
    if (!selected) return;
    setIsSaving(true);
    try {
      if (voucher)
        await selectOperatorPromotion(selected.sessionId, voucher.promotionId, voucher.code);
      else await clearOperatorPromotion(selected.sessionId);
      setSelectedVoucher(voucher);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể áp dụng voucher.");
    } finally {
      setIsSaving(false);
    }
  }

  async function requestPayment() {
    if (!selected) return;
    setIsSaving(true);
    try {
      await createOperatorPayment(selected.sessionId);
      setSelected(null);
      onPaymentRequested();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tạo yêu cầu thanh toán.");
    } finally {
      setIsSaving(false);
    }
  }

  async function markUnpaid() {
    if (!unpaidTable) return;
    setIsSaving(true);
    try {
      await recordOperatorUnpaid({ sessionId: unpaidTable.sessionId, reason: null });
      setUnpaidTable(null);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể ghi nhận chưa thanh toán.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-cas-on-surface">Kiểm soát thanh toán</h1>
        <p className="mt-1 text-sm text-cas-on-surface-variant">
          Chọn bàn đang phục vụ để tạo yêu cầu thanh toán hộ hoặc ghi nhận chưa thanh toán.
        </p>
      </header>
      {error ? (
        <p className="rounded-xl border border-cas-error/25 bg-cas-error-container/20 p-4 text-sm font-bold text-cas-error">
          {error}
        </p>
      ) : null}
      {isLoading ? (
        <p className="text-sm text-cas-on-surface-variant">Đang tải bàn đang hoạt động...</p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass">
          {tables.map((table) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 border-b border-cas-outline-variant/25 p-4 last:border-0"
              key={table.sessionId}
            >
              <p className="font-extrabold">Bàn {String(table.tableCode).padStart(2, "0")}</p>
              <div className="flex flex-wrap gap-2">
                <CasButton size="sm" variant="outline" onClick={() => setUnpaidTable(table)}>
                  Đánh dấu không thanh toán
                </CasButton>
                <CasButton size="sm" onClick={() => void openPaymentRequest(table)}>
                  <CasIcon className="size-4" name="payment" /> Tạo yêu cầu thanh toán
                </CasButton>
              </div>
            </li>
          ))}
          {tables.length === 0 ? (
            <li className="p-8 text-center text-sm text-cas-on-surface-variant">
              Không có bàn đang hoạt động.
            </li>
          ) : null}
        </ul>
      )}
      {selected ? (
        <div className="fixed inset-0 z-100 overflow-y-auto bg-cas-on-surface/60 p-4 backdrop-blur-sm">
          <section
            className="mx-auto my-6 w-full max-w-2xl rounded-[1.6rem] bg-cas-surface p-5 shadow-2xl sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="operator-payment-request-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
                  Bàn {String(selected.tableCode).padStart(2, "0")}
                </p>
                <h2 className="mt-1 text-xl font-extrabold" id="operator-payment-request-title">
                  Tạo yêu cầu thanh toán
                </h2>
              </div>
              <button
                className="text-sm font-bold text-cas-on-surface-variant hover:text-cas-primary"
                onClick={() => setSelected(null)}
                type="button"
              >
                Đóng
              </button>
            </div>
            {!bill ? (
              <p className="mt-6 text-sm text-cas-on-surface-variant">Đang tải hóa đơn...</p>
            ) : (
              <>
                <PaymentRequestForm
                  bill={bill}
                  error={error}
                  isRequesting={isSaving}
                  onRequest={() => void requestPayment()}
                  operatorSessionId={selected.sessionId}
                />
                <div className="hidden">
                  <ul className="mt-5 divide-y divide-cas-outline-variant/35">
                    {bill.orders
                      .flatMap((order) => order.items)
                      .map((item) => (
                        <li
                          className="flex justify-between gap-4 py-3 text-sm"
                          key={item.orderItemId}
                        >
                          <span>
                            <strong className="block">
                              {item.quantity}× {item.itemName}
                            </strong>
                            {item.options.map((option) => (
                              <span
                                className="mt-1 block text-xs text-cas-on-surface-variant"
                                key={option.optionName}
                              >
                                + {option.optionName}
                              </span>
                            ))}
                          </span>
                          <strong className="shrink-0 text-cas-primary">
                            {money(item.totalAmount)}
                          </strong>
                        </li>
                      ))}
                  </ul>
                  <div className="mt-5">
                    <CustomerOrderVoucherSummary
                      operatorSessionId={selected.sessionId}
                      originalAmount={bill.payableAmount}
                      onSummaryChange={setVoucherSummary}
                    />
                  </div>
                  <div className="hidden">
                    <p className="text-sm font-extrabold">Voucher / khuyến mãi</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="rounded-lg border border-cas-outline-variant/40 px-3 py-2 text-xs font-bold"
                        disabled={isSaving}
                        onClick={() => void chooseVoucher(null)}
                        type="button"
                      >
                        Không áp dụng
                      </button>
                      {vouchers.map((voucher) => (
                        <button
                          className={`rounded-lg border px-3 py-2 text-xs font-bold ${selectedVoucher?.promotionId === voucher.promotionId ? "border-cas-primary bg-cas-primary/10 text-cas-primary" : "border-cas-outline-variant/40"}`}
                          disabled={isSaving}
                          key={voucher.promotionId}
                          onClick={() => void chooseVoucher(voucher)}
                          type="button"
                        >
                          {voucher.name} · -{money(voucher.discountAmount)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 flex items-end justify-between border-t border-cas-outline-variant/40 pt-4">
                    <span className="text-sm text-cas-on-surface-variant">Tổng cần thanh toán</span>
                    <strong className="text-2xl text-cas-primary">
                      {money(
                        voucherSummary?.payableAmount ??
                          selectedVoucher?.payableAmount ??
                          bill.payableAmount,
                      )}
                    </strong>
                  </div>
                  <CasButton
                    className="mt-5 w-full"
                    disabled={isSaving}
                    size="lg"
                    onClick={() => void requestPayment()}
                  >
                    {isSaving ? "Đang tạo yêu cầu..." : "Gửi yêu cầu thanh toán"}
                  </CasButton>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
      {unpaidTable ? (
        <div className="fixed inset-0 z-100 grid place-items-center bg-cas-on-surface/60 p-4 backdrop-blur-sm">
          <section
            className="w-full max-w-md rounded-2xl bg-cas-surface p-6 shadow-2xl"
            role="alertdialog"
          >
            <h2 className="text-xl font-extrabold">Đánh dấu không thanh toán?</h2>
            <p className="mt-3 text-sm text-cas-on-surface-variant">
              Bàn {String(unpaidTable.tableCode).padStart(2, "0")} sẽ được đóng và ghi nhận khoản
              chưa thu.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <CasButton disabled={isSaving} variant="outline" onClick={() => setUnpaidTable(null)}>
                Hủy
              </CasButton>
              <CasButton disabled={isSaving} onClick={() => void markUnpaid()}>
                {isSaving ? "Đang ghi nhận..." : "Xác nhận"}
              </CasButton>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

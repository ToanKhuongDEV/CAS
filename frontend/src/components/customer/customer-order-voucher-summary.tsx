"use client";

import { formatMoney } from "../../lib/format-money";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./customer-order-voucher-summary.module.css";
import {
  loadCustomerBillAdjustments,
  type BillAdjustment,
} from "../../lib/api/payment/payment.api";
import {
  clearCustomerPromotion,
  loadCustomerEligiblePromotions,
  loadCustomerPromotions,
  clearOperatorPromotion,
  loadOperatorEligiblePromotions,
  loadOperatorPromotions,
  selectOperatorPromotion,
  selectCustomerPromotion,
  type CustomerPromotion,
  type EligiblePromotion,
} from "../../lib/api/promotion/promotion.api";

export type VoucherSummary = {
  discountAmount: number;
  originalAmount: number;
  payableAmount: number;
  voucherCode?: string;
};

type Props = {
  adjustmentDelta?: number;
  beforePayable?: ReactNode;
  onSummaryChange?: (summary: VoucherSummary) => void;
  originalAmount: number;
  operatorSessionId?: string;
};

type VoucherDisplay = Pick<
  EligiblePromotion,
  | "promotionType"
  | "discountValue"
  | "maxDiscountAmount"
  | "minBillAmount"
  | "scope"
  | "discountAmount"
>;

export function CustomerOrderVoucherSummary({
  adjustmentDelta = 0,
  beforePayable,
  onSummaryChange,
  operatorSessionId,
  originalAmount,
}: Props) {
  const [codeVouchers, setCodeVouchers] = useState<EligiblePromotion[]>([]);
  const [publicVouchers, setPublicVouchers] = useState<CustomerPromotion[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<EligiblePromotion | null>(null);
  const [refreshRevision, setRefreshRevision] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<BillAdjustment[]>([]);
  const [adjustmentsUnavailable, setAdjustmentsUnavailable] = useState(true);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const availablePublicVouchers = publicVouchers.filter((voucher) => voucher.eligible);
  const unavailablePublicVouchers = publicVouchers.filter((voucher) => !voucher.eligible);
  const vouchers = [...availablePublicVouchers, ...codeVouchers];
  const selected =
    vouchers.find((voucher) => voucher.promotionId === selectedVoucherId) ?? selectedVoucher;
  const selectedCode = selected && "code" in selected ? selected.code : null;
  const discountAmount = selected?.discountAmount ?? 0;
  const payableAmount = selected?.payableAmount ?? originalAmount;

  useEffect(() => {
    if (operatorSessionId) return;
    let active = true;
    const refresh = () => {
      void loadCustomerBillAdjustments()
        .then((items) => {
          if (active) {
            setAdjustments(items);
            setAdjustmentsUnavailable(false);
          }
        })
        .catch(() => {
          if (active) setAdjustmentsUnavailable(true);
        });
    };
    refresh();
    const timer = window.setInterval(refresh, 10_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [operatorSessionId, originalAmount]);

  useEffect(() => {
    let active = true;
    setIsRefreshing(true);
    setListError(null);
    const request = operatorSessionId
      ? loadOperatorPromotions(operatorSessionId)
      : loadCustomerPromotions();
    void request
      .then((items) => {
        if (active) setPublicVouchers(items);
      })
      .catch(() => {
        if (active) setListError("Không thể tải danh sách khuyến mãi. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) setIsRefreshing(false);
      });
    return () => {
      active = false;
    };
  }, [operatorSessionId, originalAmount, refreshRevision]);

  useEffect(() => {
    onSummaryChange?.({
      discountAmount,
      originalAmount,
      payableAmount,
      voucherCode: selectedCode ?? undefined,
    });
  }, [discountAmount, onSummaryChange, originalAmount, payableAmount, selectedCode]);

  const selectVoucher = async (promotionId: string, selectedCode?: string | null) => {
    setError(null);
    try {
      if (!promotionId) {
        if (operatorSessionId) await clearOperatorPromotion(operatorSessionId);
        else await clearCustomerPromotion();
        setSelectedVoucherId("");
        setSelectedVoucher(null);
        setIsVoucherModalOpen(false);
        return;
      }

      const applied = operatorSessionId
        ? await selectOperatorPromotion(operatorSessionId, promotionId, selectedCode)
        : await selectCustomerPromotion(promotionId, selectedCode);
      setCodeVouchers((current) =>
        current.map((item) => (item.promotionId === promotionId ? applied : item)),
      );
      setSelectedVoucherId(promotionId);
      setSelectedVoucher(applied);
      setIsVoucherModalOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể áp dụng mã giảm giá.");
    }
  };

  const applyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;

    setError(null);
    try {
      const available = operatorSessionId
        ? await loadOperatorEligiblePromotions(operatorSessionId, code)
        : await loadCustomerEligiblePromotions(code);
      setCodeVouchers(available.filter((voucher) => voucher.code !== null));
      const matched = available.find(
        (voucher) => voucher.code?.toLowerCase() === code.trim().toLowerCase(),
      );
      if (!matched) {
        setError("Mã giảm giá không hợp lệ hoặc chưa đủ điều kiện áp dụng.");
        return;
      }
      await selectVoucher(matched.promotionId, matched.code);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể kiểm tra mã giảm giá.");
    }
  };

  const promotionValueLabel = (voucher: VoucherDisplay) => {
    if (!voucher.promotionType.includes("PERCENT"))
      return `Giảm ${formatMoney(voucher.discountValue)}`;
    return voucher.maxDiscountAmount === null
      ? `Giảm ${voucher.discountValue}%`
      : `Giảm ${voucher.discountValue}% tối đa ${formatMoney(voucher.maxDiscountAmount)}`;
  };
  const promotionConditionLabel = (voucher: VoucherDisplay) =>
    voucher.minBillAmount === null
      ? "Không yêu cầu đơn tối thiểu"
      : `Đơn tối thiểu ${formatMoney(voucher.minBillAmount)}`;

  return (
    <div className="border-t border-cas-outline-variant/40 pt-5">
      <div className={operatorSessionId ? undefined : styles.voucherBorder}>
        <button
          className="relative flex w-full items-center justify-between gap-4 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-3 text-left hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
          onClick={() => setIsVoucherModalOpen(true)}
          type="button"
        >
          <span>
            <span className="block text-sm font-bold text-cas-on-surface">
              Voucher / khuyến mãi
            </span>
            <span className="mt-0.5 block text-sm text-cas-on-surface-variant">
              {selected ? (selectedCode ?? selected.name) : "Chọn hoặc nhập voucher"}
            </span>
          </span>
          <span className="shrink-0 text-sm font-extrabold text-cas-primary">
            {selected ? `Đã giảm ${formatMoney(discountAmount)}` : "Chọn"}
          </span>
        </button>
      </div>

      {isVoucherModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-110 grid place-items-center bg-cas-on-surface/45 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setIsVoucherModalOpen(false);
            }}
          >
            <section
              aria-labelledby="voucher-dialog-title"
              aria-modal="true"
              className="flex max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-md flex-col rounded-3xl bg-cas-surface p-6 shadow-[0_16px_36px_var(--cas-shadow-color)]"
              role="dialog"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-extrabold" id="voucher-dialog-title">
                  Chọn voucher
                </h2>
                <button
                  className="text-sm font-bold text-cas-on-surface-variant hover:text-cas-primary"
                  onClick={() => setIsVoucherModalOpen(false)}
                  type="button"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto p-1">
                <form className="flex gap-2" onSubmit={applyCode}>
                  <input
                    className="min-w-0 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-base text-cas-on-surface outline-none focus:border-cas-primary focus:ring-2 focus:ring-cas-primary focus-visible:outline-none"
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá"
                    value={code}
                  />
                  <button
                    className="rounded-xl bg-cas-primary px-4 py-2 text-sm font-bold text-cas-on-primary hover:bg-cas-primary-hover"
                    type="submit"
                  >
                    Áp dụng
                  </button>
                </form>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-cas-on-surface-variant">
                      Khuyến mãi dành cho bạn
                    </p>
                    <button
                      className="rounded-lg px-2 py-1 text-xs font-bold text-cas-primary hover:bg-cas-primary/10 disabled:opacity-50"
                      type="button"
                      disabled={isRefreshing}
                      onClick={() => setRefreshRevision((current) => current + 1)}
                    >
                      {isRefreshing ? "Đang tải..." : "Làm mới"}
                    </button>
                  </div>
                  {listError && (
                    <p role="alert" className="mt-2 text-sm text-cas-error">
                      {listError}
                    </p>
                  )}
                  {!isRefreshing && !listError && availablePublicVouchers.length === 0 ? (
                    <p className="mt-2 rounded-xl border border-dashed border-cas-outline-variant/50 px-3 py-4 text-center text-sm text-cas-on-surface-variant">
                      Hiện chưa có voucher phù hợp với đơn hàng này.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {availablePublicVouchers.map((voucher) => {
                        const isSelected = voucher.promotionId === selectedVoucherId;
                        return (
                          <li key={voucher.promotionId}>
                            <button
                              aria-pressed={isSelected}
                              className={`w-full rounded-xl border p-3 text-left transition-colors ${
                                isSelected
                                  ? "border-cas-primary bg-cas-primary/10"
                                  : "border-cas-outline-variant/40 hover:bg-cas-primary/10"
                              }`}
                              onClick={() => void selectVoucher(voucher.promotionId)}
                              type="button"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-cas-on-surface-variant">
                                    {voucher.name}
                                  </p>
                                  <p className="mt-1 font-extrabold text-cas-on-surface">
                                    {promotionValueLabel(voucher)}
                                  </p>
                                  <p className="mt-1 text-sm text-cas-on-surface-variant">
                                    {voucher.scope}
                                  </p>
                                  <p className="mt-1 text-sm text-cas-on-surface-variant">
                                    {promotionConditionLabel(voucher)}
                                  </p>
                                </div>
                                <span className="shrink-0 text-sm font-extrabold text-cas-secondary">
                                  {isSelected ? "Đã chọn" : "Chọn"}
                                </span>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {unavailablePublicVouchers.length > 0 && (
                  <div className="mt-5 border-t border-cas-outline-variant/40 pt-5">
                    <p className="text-sm font-bold text-cas-on-surface-variant">
                      Chưa thể áp dụng
                    </p>
                    <ul aria-label="Voucher chưa thể áp dụng" className="mt-2 space-y-2">
                      {unavailablePublicVouchers.map((voucher) => (
                        <li key={voucher.promotionId}>
                          <button
                            aria-label={`${voucher.name}: ${voucher.unavailableReason === "Khuyến mãi đã hết lượt sử dụng." ? "Hết mã" : "Chưa đủ điều kiện áp dụng"}`}
                            className="w-full cursor-not-allowed rounded-xl border border-cas-outline-variant/40 p-3 text-left opacity-55"
                            disabled
                            type="button"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-cas-on-surface-variant">
                                  {voucher.name}
                                </p>
                                <p className="mt-1 font-extrabold text-cas-on-surface">
                                  {promotionValueLabel(voucher)}
                                </p>
                                <p className="mt-1 text-sm text-cas-on-surface-variant">
                                  {voucher.scope}
                                </p>
                                <p className="mt-1 text-sm text-cas-on-surface-variant">
                                  {promotionConditionLabel(voucher)}
                                </p>
                              </div>
                              <span className="shrink-0 text-sm font-extrabold text-cas-on-surface-variant">
                                {voucher.unavailableReason === "Khuyến mãi đã hết lượt sử dụng."
                                  ? "Hết mã"
                                  : "Chưa đủ điều kiện"}
                              </span>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected && (
                  <button
                    className="mt-4 text-sm font-bold text-cas-primary hover:underline"
                    onClick={() => void selectVoucher("")}
                    type="button"
                  >
                    Bỏ voucher đang chọn
                  </button>
                )}
                {error && <p className="mt-3 text-sm font-semibold text-cas-error">{error}</p>}
              </div>
            </section>
          </div>,
          document.body,
        )}

      <dl className="mt-4 space-y-2 border-t border-cas-outline-variant/40 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4 text-cas-on-surface-variant">
          <dt>Giá gốc</dt>
          <dd>{formatMoney(originalAmount)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between gap-4 text-cas-on-surface-variant">
            <dt className="flex items-center gap-2">
              <span>{selected ? `Giảm giá (${selectedCode ?? selected.name})` : "Giảm giá"}</span>
              {selected && (
                <button
                  className="font-bold text-cas-primary hover:underline"
                  onClick={() => setIsVoucherModalOpen(true)}
                  type="button"
                >
                  Thay đổi
                </button>
              )}
            </dt>
            <dd className="font-bold text-cas-error">-{formatMoney(discountAmount)}</dd>
          </div>
        )}
        {beforePayable && <div>{beforePayable}</div>}
        {!operatorSessionId &&
          adjustments.map((item) => (
            <div
              className="flex justify-between gap-4 text-cas-on-surface-variant"
              key={item.publicId}
            >
              <dt>{item.reason}</dt>
              <dd>
                {item.adjustmentType === "INCREASE" ? "+" : "−"}
                {formatMoney(item.amount)}
              </dd>
            </div>
          ))}
        <div className="flex items-end justify-between gap-4 border-t border-cas-outline-variant/40 pt-4">
          <div>
            <dt className="text-sm font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
              Giá trị cần thanh toán
            </dt>
            <dd className="mt-1 text-sm text-cas-on-surface-variant">
              Giá trị tạm tính từ máy chủ
            </dd>
          </div>
          <dd className="text-xl font-extrabold text-cas-primary md:text-3xl">
            {adjustmentsUnavailable && !operatorSessionId
              ? "Không thể tải số tiền"
              : formatMoney(
                  Math.max(
                    0,
                    payableAmount +
                      adjustmentDelta +
                      adjustments.reduce(
                        (sum, item) =>
                          sum + (item.adjustmentType === "INCREASE" ? item.amount : -item.amount),
                        0,
                      ),
                  ),
                )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

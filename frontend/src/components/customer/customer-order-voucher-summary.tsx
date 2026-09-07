"use client";

import { useEffect, useState } from "react";
import {
  clearCustomerPromotion,
  loadCustomerEligiblePromotions,
  loadCustomerPromotions,
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

const formatMoney = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

type Props = {
  onSummaryChange?: (summary: VoucherSummary) => void;
  originalAmount: number;
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

export function CustomerOrderVoucherSummary({ onSummaryChange, originalAmount }: Props) {
  const [codeVouchers, setCodeVouchers] = useState<EligiblePromotion[]>([]);
  const [publicVouchers, setPublicVouchers] = useState<CustomerPromotion[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const availablePublicVouchers = publicVouchers.filter((voucher) => voucher.eligible);
  const unavailablePublicVouchers = publicVouchers.filter((voucher) => !voucher.eligible);
  const vouchers = [...availablePublicVouchers, ...codeVouchers];
  const selected = vouchers.find((voucher) => voucher.promotionId === selectedVoucherId);
  const selectedCode = selected && "code" in selected ? selected.code : null;
  const discountAmount = selected?.discountAmount ?? 0;
  const payableAmount = selected?.payableAmount ?? originalAmount;

  useEffect(() => {
    void loadCustomerPromotions()
      .then(setPublicVouchers)
      .catch(() => setPublicVouchers([]));
  }, [originalAmount]);

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
        await clearCustomerPromotion();
        setSelectedVoucherId("");
        setIsVoucherModalOpen(false);
        return;
      }

      const applied = await selectCustomerPromotion(promotionId, selectedCode);
      setCodeVouchers((current) =>
        current.map((item) => (item.promotionId === promotionId ? applied : item)),
      );
      setSelectedVoucherId(promotionId);
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
      const available = await loadCustomerEligiblePromotions(code);
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
      <button
        className="flex w-full items-center justify-between gap-4 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-3 text-left hover:bg-cas-primary/10"
        onClick={() => setIsVoucherModalOpen(true)}
        type="button"
      >
        <span>
          <span className="block text-sm font-bold text-cas-on-surface">Voucher / khuyến mãi</span>
          <span className="mt-0.5 block text-xs text-cas-on-surface-variant">
            {selected ? (selectedCode ?? selected.name) : "Chọn hoặc nhập voucher"}
          </span>
        </span>
        <span className="shrink-0 text-sm font-extrabold text-cas-primary">
          {selected ? `Đã giảm ${formatMoney(discountAmount)}` : "Chọn"}
        </span>
      </button>

      {isVoucherModalOpen && (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-cas-on-surface/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsVoucherModalOpen(false);
          }}
        >
          <section
            aria-labelledby="voucher-dialog-title"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl bg-cas-surface p-6 shadow-[0_16px_36px_var(--cas-shadow-color)]"
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

            <form className="mt-4 flex gap-2" onSubmit={applyCode}>
              <input
                className="min-w-0 flex-1 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-sm text-cas-on-surface outline-none focus:border-cas-primary focus:ring-2 focus:ring-cas-primary"
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
              <p className="text-xs font-bold text-cas-on-surface-variant">
                Khuyến mãi dành cho bạn
              </p>
              {availablePublicVouchers.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-cas-outline-variant/50 px-3 py-4 text-center text-sm text-cas-on-surface-variant">
                  Hiện chưa có voucher phù hợp với đơn hàng này.
                </p>
              ) : (
                <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
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
                              <p className="text-xs font-bold text-cas-on-surface-variant">
                                {voucher.name}
                              </p>
                              <p className="mt-1 font-extrabold text-cas-on-surface">
                                {promotionValueLabel(voucher)}
                              </p>
                              <p className="mt-1 text-xs text-cas-on-surface-variant">
                                {voucher.scope}
                              </p>
                              <p className="mt-1 text-xs text-cas-on-surface-variant">
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
                <p className="text-xs font-bold text-cas-on-surface-variant">Chưa thể áp dụng</p>
                <ul className="mt-2 space-y-2">
                  {unavailablePublicVouchers.map((voucher) => (
                    <li key={voucher.promotionId}>
                      <button
                        aria-label={`${voucher.name}: Chưa đủ điều kiện áp dụng`}
                        className="w-full cursor-not-allowed rounded-xl border border-cas-outline-variant/40 p-3 text-left opacity-55"
                        disabled
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-cas-on-surface-variant">
                              {voucher.name}
                            </p>
                            <p className="mt-1 font-extrabold text-cas-on-surface">
                              {promotionValueLabel(voucher)}
                            </p>
                            <p className="mt-1 text-xs text-cas-on-surface-variant">
                              {voucher.scope}
                            </p>
                            <p className="mt-1 text-xs text-cas-on-surface-variant">
                              {promotionConditionLabel(voucher)}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm font-extrabold text-cas-on-surface-variant">
                            Chưa đủ điều kiện
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
            {error && <p className="mt-3 text-xs font-semibold text-cas-error">{error}</p>}
          </section>
        </div>
      )}

      <dl className="mt-4 space-y-2 border-t border-cas-outline-variant/40 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4 text-cas-on-surface-variant">
          <dt>Giá gốc</dt>
          <dd>{formatMoney(originalAmount)}</dd>
        </div>
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
          <dd className="font-bold text-cas-secondary">-{formatMoney(discountAmount)}</dd>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-cas-outline-variant/40 pt-4">
          <div>
            <dt className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase md:text-xs">
              Giá trị cần thanh toán
            </dt>
            <dd className="mt-1 text-xs text-cas-on-surface-variant md:text-sm">
              Giá trị tạm tính từ máy chủ
            </dd>
          </div>
          <dd className="text-xl font-extrabold text-cas-primary md:text-3xl">
            {formatMoney(payableAmount)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  clearCustomerPromotion,
  loadCustomerEligiblePromotions,
  selectCustomerPromotion,
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

export function CustomerOrderVoucherSummary({ onSummaryChange, originalAmount }: Props) {
  const [codeVouchers, setCodeVouchers] = useState<EligiblePromotion[]>([]);
  const [publicVouchers, setPublicVouchers] = useState<EligiblePromotion[]>([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const vouchers = [...publicVouchers, ...codeVouchers];
  const selected = vouchers.find((voucher) => voucher.promotionId === selectedVoucherId);
  const discountAmount = selected?.discountAmount ?? 0;
  const payableAmount = selected?.payableAmount ?? originalAmount;

  useEffect(() => {
    void loadCustomerEligiblePromotions()
      .then(setPublicVouchers)
      .catch(() => setPublicVouchers([]));
  }, [originalAmount]);

  useEffect(() => {
    onSummaryChange?.({
      discountAmount,
      originalAmount,
      payableAmount,
      voucherCode: selected?.code ?? undefined,
    });
  }, [discountAmount, onSummaryChange, originalAmount, payableAmount, selected?.code]);

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
      setPublicVouchers((current) =>
        current.map((item) => (item.promotionId === promotionId ? applied : item)),
      );
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

  const promotionValueLabel = (voucher: EligiblePromotion) =>
    voucher.promotionType.includes("PERCENT")
      ? `Giảm ${voucher.discountValue}%`
      : `Giảm ${formatMoney(voucher.discountValue)}`;
  const promotionDescription = (voucher: EligiblePromotion) => {
    const scope = voucher.scope === "Toàn bộ hóa đơn" ? "toàn bill" : voucher.scope?.toLowerCase();
    const description = scope
      ? `${promotionValueLabel(voucher)} ${scope}`
      : promotionValueLabel(voucher);
    return voucher.minBillAmount === null
      ? description
      : `${description} · Bill tối thiểu ${formatMoney(voucher.minBillAmount)}`;
  };
  const promotionReductionLabel = (voucher: EligiblePromotion) => {
    if (voucher.promotionType.includes("PERCENT")) return `-${voucher.discountValue}%`;
    return voucher.discountValue % 1000 === 0
      ? `-${voucher.discountValue / 1000}k`
      : `-${formatMoney(voucher.discountValue)}`;
  };

  return (
    <div className="border-t border-cas-outline-variant/40 pt-5">
      <span className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase md:text-xs">
        Voucher / khuyến mãi
      </span>
      <button
        className="mt-2 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-left text-sm font-bold text-cas-primary hover:bg-cas-primary/10"
        onClick={() => setIsVoucherModalOpen(true)}
        type="button"
      >
        {selected ? `Đã chọn: ${selected.code ?? selected.name}` : "Chọn hoặc nhập voucher"}
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
              {publicVouchers.length === 0 ? (
                <p className="mt-2 rounded-xl border border-dashed border-cas-outline-variant/50 px-3 py-4 text-center text-sm text-cas-on-surface-variant">
                  Hiện chưa có voucher phù hợp với đơn hàng này.
                </p>
              ) : (
                <ul className="mt-2 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {publicVouchers.map((voucher) => {
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
                          onClick={() => void selectVoucher(voucher.promotionId, voucher.code)}
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-cas-on-surface">{voucher.name}</p>
                            </div>
                            <span className="shrink-0 text-sm font-extrabold text-cas-secondary">
                              {promotionReductionLabel(voucher)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-start justify-between gap-3 text-xs">
                            <p className="min-w-0 text-cas-on-surface-variant">
                              {promotionDescription(voucher)}
                            </p>
                            <span className="shrink-0 font-extrabold text-cas-on-surface-variant">
                              -{formatMoney(voucher.discountAmount)}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

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
          <dt>{selected ? `Giảm giá (${selected.code ?? selected.name})` : "Giảm giá"}</dt>
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

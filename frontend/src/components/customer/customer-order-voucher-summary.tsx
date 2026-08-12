"use client";

import { useEffect, useMemo, useState } from "react";

type Voucher = {
  code: string;
  discountValue: number;
  id: string;
  label: string;
  type: "FIXED_AMOUNT_OFF" | "PERCENT_OFF";
};

export type VoucherSummary = {
  discountAmount: number;
  originalAmount: number;
  payableAmount: number;
  voucherCode?: string;
};

const availableVouchers: Voucher[] = [
  {
    id: "summer-10",
    code: "SUMMER10",
    label: "Giảm 10% tổng hóa đơn",
    type: "PERCENT_OFF",
    discountValue: 10,
  },
  {
    id: "cas-20k",
    code: "CAS20K",
    label: "Giảm trực tiếp 20.000đ",
    type: "FIXED_AMOUNT_OFF",
    discountValue: 20000,
  },
];

function formatMoney(value: number) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

type CustomerOrderVoucherSummaryProps = {
  onSummaryChange?: (summary: VoucherSummary) => void;
  originalAmount: number;
};

export function CustomerOrderVoucherSummary({
  onSummaryChange,
  originalAmount,
}: CustomerOrderVoucherSummaryProps) {
  const [selectedVoucherId, setSelectedVoucherId] = useState("");

  const selectedVoucher = availableVouchers.find((voucher) => voucher.id === selectedVoucherId);
  const discountAmount = useMemo(() => {
    if (!selectedVoucher) return 0;

    const calculatedDiscount =
      selectedVoucher.type === "PERCENT_OFF"
        ? Math.round((originalAmount * selectedVoucher.discountValue) / 100)
        : selectedVoucher.discountValue;

    return Math.min(calculatedDiscount, originalAmount);
  }, [originalAmount, selectedVoucher]);
  const payableAmount = originalAmount - discountAmount;

  function publishSummary(voucherId: string) {
    const voucher = availableVouchers.find((candidate) => candidate.id === voucherId);
    const calculatedDiscount = voucher
      ? voucher.type === "PERCENT_OFF"
        ? Math.round((originalAmount * voucher.discountValue) / 100)
        : voucher.discountValue
      : 0;
    const nextDiscountAmount = Math.min(calculatedDiscount, originalAmount);

    onSummaryChange?.({
      discountAmount: nextDiscountAmount,
      originalAmount,
      payableAmount: originalAmount - nextDiscountAmount,
      voucherCode: voucher?.code,
    });
  }

  useEffect(() => {
    publishSummary(selectedVoucherId);
  }, [originalAmount, selectedVoucherId]);

  return (
    <div className="border-t border-cas-outline-variant/40 pt-5">
      <label className="block" htmlFor="order-voucher">
        <span className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase md:text-xs">
          Voucher / khuyến mãi
        </span>
        <select
          className="mt-2 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 text-sm font-medium text-cas-on-surface outline-none focus:border-cas-primary focus:ring-2 focus:ring-cas-primary"
          id="order-voucher"
          onChange={(event) => {
            const voucherId = event.target.value;
            setSelectedVoucherId(voucherId);
            publishSummary(voucherId);
          }}
          value={selectedVoucherId}
        >
          <option value="">Không áp dụng voucher</option>
          {availableVouchers.map((voucher) => (
            <option key={voucher.id} value={voucher.id}>
              {voucher.code} · {voucher.label}
            </option>
          ))}
        </select>
      </label>

      <dl className="mt-4 space-y-2 border-t border-cas-outline-variant/40 pt-4 text-sm">
        <div className="flex items-center justify-between gap-4 text-cas-on-surface-variant">
          <dt>Giá gốc</dt>
          <dd>{formatMoney(originalAmount)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 text-cas-on-surface-variant">
          <dt>{selectedVoucher ? `Giảm giá (${selectedVoucher.code})` : "Giảm giá"}</dt>
          <dd className="font-bold text-cas-secondary">-{formatMoney(discountAmount)}</dd>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-cas-outline-variant/40 pt-4">
          <div>
            <dt className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase md:text-xs">
              Giá trị cần thanh toán
            </dt>
            <dd className="mt-1 text-xs text-cas-on-surface-variant md:text-sm">
              Giá trị tạm tính trước khi gửi yêu cầu
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

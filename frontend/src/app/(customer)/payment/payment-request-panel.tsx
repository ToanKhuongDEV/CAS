"use client";

import { useState } from "react";

import { CasIcon } from "../../../components/ui/cas-icon";

const billItems = [
  {
    name: "Mỳ cay đặc biệt 7 cấp độ",
    options: "Cấp độ 2, thêm xúc xích",
    quantity: 1,
    total: "55.000đ",
  },
  {
    name: "Gà rán giòn rụm",
    options: "Sốt cay, phần vừa",
    quantity: 2,
    total: "70.000đ",
  },
  {
    name: "Trà sữa Trân châu Đường đen",
    options: "50% đường, ít đá",
    quantity: 1,
    total: "45.000đ",
  },
];

export function PaymentRequestPanel() {
  const [isPaymentPending, setIsPaymentPending] = useState(false);

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
            4 món
          </span>
        </div>

        <ul className="divide-y divide-cas-outline-variant/35">
          {billItems.map((item) => (
            <li className="flex items-start gap-3 py-4" key={item.name}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cas-surface text-xs font-extrabold text-cas-primary">
                {item.quantity}×
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold">{item.name}</h3>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
                  {item.options}
                </p>
              </div>
              <strong className="shrink-0 text-sm">{item.total}</strong>
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
            <strong className="text-2xl text-cas-primary">170.000đ</strong>
          </div>
        </div>
      </section>

      <section
        className={`mt-4 rounded-2xl border p-4 ${
          isPaymentPending
            ? "border-cas-tertiary/25 bg-cas-tertiary-container/18"
            : "border-cas-secondary/20 bg-cas-secondary-container/20"
        }`}
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-full ${
              isPaymentPending
                ? "bg-cas-tertiary text-cas-on-primary"
                : "bg-cas-secondary text-cas-on-primary"
            }`}
          >
            <CasIcon
              className="size-5"
              name={isPaymentPending ? "clock" : "info"}
            />
          </span>
          <div>
            <p className="text-sm font-extrabold">
              {isPaymentPending
                ? "Đang chờ nhân viên xác nhận"
                : "Kiểm tra hóa đơn trước khi gửi"}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-cas-on-surface-variant">
              {isPaymentPending
                ? "Vui lòng ra gặp nhân viên để hoàn tất thanh toán. CAS chỉ cập nhật kết quả sau khi nhân viên xác nhận."
                : "Yêu cầu thanh toán áp dụng cho toàn bộ order trong phiên bàn và bạn sẽ không thể gọi thêm món sau khi gửi."}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-5">
        <button
          className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover disabled:cursor-not-allowed disabled:bg-cas-on-surface-variant/25 disabled:text-cas-on-surface-variant focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
          type="button"
          disabled={isPaymentPending}
          onClick={() => setIsPaymentPending(true)}
        >
          <CasIcon
            className="size-5"
            name={isPaymentPending ? "clock" : "payment"}
          />
          {isPaymentPending
            ? "Đã gửi yêu cầu thanh toán"
            : "Gửi yêu cầu thanh toán"}
        </button>
        <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
          Tổng tiền sẽ được hệ thống xác nhận lại khi gửi yêu cầu.
        </p>
      </div>
    </>
  );
}

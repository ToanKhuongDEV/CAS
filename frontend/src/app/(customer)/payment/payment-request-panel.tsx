"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

const billItems = [
  {
    name: "Mỳ cay đặc biệt 7 cấp độ",
    options: "Cấp độ 2",
    quantity: 1,
    basePrice: "45.000đ",
    toppings: [{ name: "Thêm xúc xích", price: "10.000đ" }],
    total: "55.000đ",
  },
  {
    name: "Gà rán giòn rụm",
    options: "Sốt cay, phần vừa",
    quantity: 2,
    basePrice: "35.000đ × 2",
    toppings: [],
    total: "70.000đ",
  },
  {
    name: "Trà sữa Trân châu Đường đen",
    options: "50% đường, ít đá",
    quantity: 1,
    basePrice: "35.000đ",
    toppings: [{ name: "Thêm trân châu", price: "10.000đ" }],
    total: "45.000đ",
  },
];

type PaymentRequestPanelProps = {
  confirmedAt?: string;
  paymentStatus?: "NONE" | "PENDING" | "PAID";
  tableQrToken?: string;
};

export function PaymentRequestPanel({
  confirmedAt = "20:05",
  paymentStatus = "NONE",
  tableQrToken,
}: PaymentRequestPanelProps) {
  const router = useRouter();
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const isWaitingForConfirmation = isPaymentPending || paymentStatus === "PENDING";

  const handleCreateNewOrder = () => {
    const activeTableQrToken = tableQrToken ?? window.sessionStorage.getItem("cas.tableQrToken");

    router.push(activeTableQrToken ? `/table/${encodeURIComponent(activeTableQrToken)}` : "/");
  };

  if (paymentStatus === "PAID") {
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
                <dd className="font-extrabold">Bàn 05</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4">
                <dt className="text-sm text-cas-on-surface-variant">Tổng thanh toán</dt>
                <dd className="text-lg font-extrabold text-cas-primary">170.000đ</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm text-cas-on-surface-variant">Hoàn tất lúc</dt>
                <dd className="font-extrabold">{confirmedAt}</dd>
              </div>
            </dl>

            <CasButton
              className="mt-6 w-full shadow-[0_8px_20px_var(--cas-shadow-color)]"
              size="lg"
              onClick={handleCreateNewOrder}
            >
              Tiếp tục tạo đơn mới
            </CasButton>
          </section>
        </main>
      </div>
    );
  }

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
                <div className="mt-2 space-y-1 text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
                  <p className="flex justify-between gap-3">
                    <span>Giá món gốc</span>
                    <span>{item.basePrice}</span>
                  </p>
                  {item.toppings.map((topping) => (
                    <p className="flex justify-between gap-3" key={topping.name}>
                      <span>+ {topping.name}</span>
                      <span>+{topping.price}</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <strong className="text-sm text-cas-primary">{item.total}</strong>
              </div>
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

      <div className="mt-5">
        <CasButton
          className="w-full shadow-[0_8px_20px_var(--cas-shadow-color)]"
          size="lg"
          disabled={isWaitingForConfirmation}
          onClick={() => setIsPaymentPending(true)}
          icon={isWaitingForConfirmation ? "clock" : "payment"}
        >
          {isWaitingForConfirmation ? "Đã gửi yêu cầu thanh toán" : "Gửi yêu cầu thanh toán"}
        </CasButton>
        <p className="mt-3 text-center text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
          Tổng tiền sẽ được hệ thống xác nhận lại khi gửi yêu cầu.
        </p>
      </div>

      {isWaitingForConfirmation ? (
        <div
          className="fixed inset-0 z-100 grid place-items-center bg-cas-on-surface/55 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-pending-title"
          aria-describedby="payment-pending-description"
        >
          <section className="w-full max-w-sm rounded-[1.4rem] bg-cas-surface-container p-6 text-center shadow-[0_16px_36px_var(--cas-shadow-color)]">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-cas-tertiary text-cas-on-primary">
              <CasIcon className="size-7" name="payment" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold" id="payment-pending-title">
              Yêu cầu thanh toán đã được gửi
            </h2>
            <p
              className="mt-3 text-sm leading-relaxed text-cas-on-surface-variant"
              id="payment-pending-description"
            >
              Vui lòng đến quầy thu ngân để thanh toán và chờ nhân viên xác nhận.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}

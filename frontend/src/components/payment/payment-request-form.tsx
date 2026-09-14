"use client";

import { CustomerOrderVoucherSummary } from "../customer/customer-order-voucher-summary";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";
import type { CustomerBill } from "../../lib/api/ordering/ordering.api";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function PaymentRequestForm({
  bill,
  error,
  isRequesting,
  onRequest,
  operatorSessionId,
}: {
  bill: CustomerBill;
  error?: string | null;
  isRequesting?: boolean;
  onRequest: () => void;
  operatorSessionId?: string;
}) {
  return (
    <>
      <section className="rounded-[1.4rem] bg-cas-surface-container p-5 shadow-[0_10px_28px_var(--cas-shadow-color)] md:p-7">
        <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/40 pb-4">
          <div>
            <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
              Phiên bàn hiện tại
            </p>
            <h2 className="mt-1 text-lg font-extrabold">Chi tiết thanh toán</h2>
          </div>
          <span className="rounded-full bg-cas-secondary-container/20 px-3 py-1 text-xs font-extrabold text-cas-secondary">
            {bill.orders
              .flatMap((order) => order.items)
              .reduce((total, item) => total + item.quantity, 0)}{" "}
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
                  <div className="mt-2 space-y-1 text-[0.68rem] text-cas-on-surface-variant">
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
      </section>
      <div className="mt-4">
        <CustomerOrderVoucherSummary
          operatorSessionId={operatorSessionId}
          originalAmount={bill.payableAmount}
        />
      </div>
      <section className="mt-4 rounded-2xl border border-cas-secondary/20 bg-cas-secondary-container/20 p-4">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cas-secondary text-cas-on-primary">
            <CasIcon className="size-5" name="info" />
          </span>
          <p className="text-sm leading-relaxed text-cas-on-surface-variant">
            Kiểm tra hóa đơn trước khi gửi yêu cầu thanh toán.
          </p>
        </div>
      </section>
      {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
      <CasButton
        className="mt-5 w-full"
        disabled={isRequesting}
        icon={isRequesting ? "clock" : "payment"}
        size="lg"
        onClick={onRequest}
      >
        {isRequesting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu thanh toán"}
      </CasButton>
    </>
  );
}

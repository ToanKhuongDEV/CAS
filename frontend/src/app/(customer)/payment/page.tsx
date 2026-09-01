import type { Metadata } from "next";

import { CustomerBottomNavigation } from "../../../components/customer/customer-bottom-navigation";
import { CustomerHeader } from "../../../components/customer/customer-header";
import { CasIcon } from "../../../components/ui/cas-icon";
import { PaymentRequestPanel } from "./payment-request-panel";

export const metadata: Metadata = {
  title: "Thanh toán | CAS",
  description: "Kiểm tra hóa đơn và gửi yêu cầu thanh toán tại CAS.",
};

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-cas-surface text-cas-on-surface transition-colors duration-200">
      <CustomerHeader />

      <div className="mx-auto flex w-full max-w-[85rem] items-start gap-8 px-4 pt-20 pb-28 md:gap-12 md:px-8 md:pt-24 md:pb-16 lg:gap-14">
        <CustomerBottomNavigation activeItem="orders" />

        <main className="mx-auto w-full max-w-[38rem] min-w-0 flex-1">
          <header className="text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-[1.4rem] border border-cas-primary/20 bg-cas-primary/8 text-cas-primary shadow-[0_10px_26px_var(--cas-shadow-color)]">
              <CasIcon className="size-10" name="bill" />
            </span>
            <p className="mt-6 text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
              Yêu cầu thanh toán
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
              Kiểm tra hóa đơn
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cas-on-surface-variant">
              Xem lại toàn bộ món đã gọi trước khi gửi yêu cầu cho nhân viên.
            </p>
          </header>

          <div className="mt-7">
            <PaymentRequestPanel />
          </div>
        </main>
      </div>
    </div>
  );
}

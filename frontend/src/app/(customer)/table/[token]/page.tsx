import type { Metadata } from "next";
import Image from "next/image";

import { CustomerHeader } from "../../../../components/customer/customer-header";
import { CasIcon } from "../../../../components/ui/cas-icon";
import { CustomerInformationForm } from "./customer-information-form";

export const metadata: Metadata = {
  title: "Thông tin bàn | CAS",
  description: "Nhập thông tin khách hàng để bắt đầu gọi món tại CAS.",
};

export default function CustomerInformationPage() {
  return (
    <div className="min-h-screen bg-cas-surface text-cas-on-surface transition-colors duration-200">
      <CustomerHeader tableName="Bàn 05" />

      <main className="mx-auto flex w-full max-w-[75rem] flex-col px-5 pt-24 pb-12 md:px-10 md:pt-28">
        <header className="mx-auto max-w-[30rem] text-center">
          <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
            Chào mừng đến CAS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            Mở phiên gọi món
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-cas-on-surface-variant">
            Bạn là người đầu tiên quét mã của bàn này. Vui lòng nhập thông tin
            người đại diện để bắt đầu gọi món.
          </p>
        </header>

        <section
          className="mx-auto mt-7 w-full max-w-[32rem] rounded-[1.4rem] bg-cas-surface-container p-5 shadow-[0_10px_28px_var(--cas-shadow-color)] md:p-7"
          aria-labelledby="customer-form-title"
        >
          <h2 className="sr-only" id="customer-form-title">
            Thông tin khách hàng
          </h2>

          <CustomerInformationForm />

          <div className="mt-6 flex items-start justify-center gap-2 border-t border-cas-outline-variant/45 pt-5 text-xs leading-relaxed text-cas-on-surface-variant">
            <CasIcon className="mt-0.5 size-4 shrink-0" name="info" />
            <span>
              Thông tin này được dùng để xác định người đại diện mở phiên bàn.
            </span>
          </div>
        </section>

        <aside className="relative mx-auto mt-7 min-h-44 w-full max-w-[32rem] overflow-hidden rounded-[1.4rem] shadow-[0_10px_26px_var(--cas-shadow-color)]">
          <Image
            className="object-cover"
            src="/images/welcome/street-snacks.jpg"
            alt="Các món ăn vặt nổi bật tại CAS"
            fill
            loading="eager"
            priority
            sizes="(max-width: 767px) calc(100vw - 2.5rem), 32rem"
          />
          <span className="absolute inset-0 bg-linear-to-r from-black/75 via-black/40 to-black/10" />
          <div className="relative z-10 flex min-h-44 max-w-[19rem] flex-col justify-end p-5 text-white">
            <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-amber-300 uppercase">
              Gợi ý hôm nay
            </p>
            <strong className="mt-1 text-lg leading-snug">
              Mỳ cay nóng hổi và đồ ăn vặt giòn ngon!
            </strong>
          </div>
        </aside>
      </main>
    </div>
  );
}

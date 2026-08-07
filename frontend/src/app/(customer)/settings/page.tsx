import type { Metadata } from "next";

import { CustomerBottomNavigation } from "../../../components/customer/customer-bottom-navigation";
import { CustomerHeader } from "../../../components/customer/customer-header";
import { ThemeToggle } from "../../../components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Cài đặt | CAS",
  description: "Điều chỉnh giao diện sử dụng CAS.",
};

export default function CustomerSettingsPage() {
  return (
    <div className="min-h-screen bg-cas-surface pb-28 text-cas-on-surface transition-colors duration-200 md:pb-12 md:pl-56">
      <CustomerHeader showThemeToggle={false} tableName="Bàn 05" />

      <main className="mx-auto w-full max-w-[34rem] px-5 pt-24 md:px-10 md:pt-28">
        <header>
          <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
            Tùy chỉnh
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
            Cài đặt
          </h1>
        </header>

        <section
          className="mt-7 flex items-center justify-between gap-5 rounded-2xl bg-cas-surface-container p-5 shadow-[0_8px_24px_var(--cas-shadow-color)]"
          aria-labelledby="appearance-setting-title"
        >
          <div>
            <h2 className="font-extrabold" id="appearance-setting-title">
              Giao diện
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-cas-on-surface-variant">
              Chuyển đổi giữa chế độ sáng và tối.
            </p>
          </div>
          <ThemeToggle />
        </section>
      </main>

      <CustomerBottomNavigation activeItem="settings" />
    </div>
  );
}

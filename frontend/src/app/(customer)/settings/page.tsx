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
    <div className="min-h-screen bg-cas-surface text-cas-on-surface transition-colors duration-200">
      <CustomerHeader showThemeToggle={false} tableName="Bàn 05" />

      <div className="mx-auto flex w-full max-w-[85rem] items-start gap-8 px-4 pt-20 pb-28 md:gap-12 md:px-8 md:pt-24 md:pb-16 lg:gap-14">
        <CustomerBottomNavigation activeItem="settings" />

        <main className="mx-auto w-full max-w-[38rem] min-w-0 flex-1">
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
      </div>
    </div>
  );
}

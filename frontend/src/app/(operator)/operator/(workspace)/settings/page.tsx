import type { Metadata } from "next";

import { ThemeToggle } from "../../../../../components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Cài đặt | Bambu Garden",
};

export default function OperatorSettingsPage() {
  return (
    <div className="max-w-[38rem]">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Cài đặt</h1>
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
    </div>
  );
}

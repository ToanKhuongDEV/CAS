import type { ReactNode } from "react";

import { AdminTabNavigation } from "../../components/admin/admin-tab-navigation";
import { CasIcon } from "../../components/ui/cas-icon";
import { ThemeToggle } from "../../components/ui/theme-toggle";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <main className="min-h-screen bg-cas-surface text-cas-on-surface">
      <div className="sticky top-0 z-40 shadow-xs">
        <header className="bg-cas-header px-4 py-4 backdrop-blur-xl sm:px-8 xl:px-12 border-b border-cas-outline-variant/15">
          <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-cas-primary text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)]">
                <CasIcon className="size-5.5" name="restaurant" />
              </span>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-cas-primary">CAS</span>
                <span className="text-[0.68rem] font-semibold leading-none text-cas-on-surface-variant">Admin</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <div className="flex items-center gap-3 rounded-xl bg-cas-glass px-3 py-2">
                <span className="grid size-8 place-items-center rounded-lg bg-cas-primary/20 text-cas-primary">
                  <CasIcon className="size-4.5" name="user" />
                </span>
                <div className="hidden sm:block">
                  <p className="text-xs font-extrabold">ADMIN Master</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <AdminTabNavigation />
      </div>

      <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-8 sm:py-9 xl:px-12">{children}</div>
    </main>
  );
}

import type { ReactNode } from "react";

import { AdminTabNavigation } from "../../components/admin/admin-tab-navigation";
import { OperationalRouteGuard } from "../../components/auth/operational-route-guard";
import { CasIcon } from "../../components/ui/cas-icon";
import { OperationalAccountMenu } from "../../components/ui/operational-account-menu";
import { ThemeToggle } from "../../components/ui/theme-toggle";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <OperationalRouteGuard area="ADMIN">
      <main className="min-h-screen bg-cas-surface text-cas-on-surface">
      <div className="sticky top-0 z-40 shadow-xs">
        <header className="relative z-50 bg-cas-header px-4 py-4 backdrop-blur-xl sm:px-8 xl:px-12 border-b border-cas-outline-variant/15">
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

              <OperationalAccountMenu
                area="ADMIN"
                fallbackName="ADMIN Master"
                loginPath="/admin/login"
              />
            </div>
          </div>
        </header>

        <AdminTabNavigation />
      </div>

      <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-8 sm:py-9 xl:px-12">{children}</div>
      </main>
    </OperationalRouteGuard>
  );
}

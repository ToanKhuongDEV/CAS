import type { ReactNode } from "react";

import { AdminTabNavigation } from "../../components/admin/admin-tab-navigation";
import { OperationalRouteGuard } from "../../components/auth/operational-route-guard";
import { StoreIdentity } from "../../components/ui/store-identity";
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
              <StoreIdentity subtitle="Admin" />

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

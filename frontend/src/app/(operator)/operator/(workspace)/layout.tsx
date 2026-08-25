import type { ReactNode } from "react";

import { OperationalRouteGuard } from "../../../../components/auth/operational-route-guard";
import { OperatorHeaderNotifications } from "../../../../components/operator/operator-header-notifications";
import { OperatorTabNavigation } from "../../../../components/operator/operator-tab-navigation";
import { StoreIdentity } from "../../../../components/ui/store-identity";
import { OperationalAccountMenu } from "../../../../components/ui/operational-account-menu";
import { ThemeToggle } from "../../../../components/ui/theme-toggle";

type OperatorWorkspaceLayoutProps = {
  children: ReactNode;
};

export default function OperatorWorkspaceLayout({ children }: OperatorWorkspaceLayoutProps) {
  return (
    <OperationalRouteGuard area="OPERATOR">
      <main className="min-h-screen bg-cas-surface text-cas-on-surface">
        <div className="sticky top-0 z-40 shadow-xs">
          <header className="relative z-50 bg-cas-header px-4 py-4 backdrop-blur-xl sm:px-8 xl:px-12 border-b border-cas-outline-variant/15">
            <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-4">
              <StoreIdentity subtitle="Vận hành" />

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <OperatorHeaderNotifications />

                <OperationalAccountMenu
                  area="OPERATOR"
                  fallbackName="Nhân viên CAS"
                  loginPath="/operator/login"
                />
              </div>
            </div>
          </header>

          <OperatorTabNavigation />
        </div>

        <div className="mx-auto max-w-[100rem] px-4 py-7 sm:px-8 sm:py-9 xl:px-12">{children}</div>
      </main>
    </OperationalRouteGuard>
  );
}

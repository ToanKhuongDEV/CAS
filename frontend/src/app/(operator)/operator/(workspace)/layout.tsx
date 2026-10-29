import type { ReactNode } from "react";

import { OperationalRouteGuard } from "../../../../components/auth/operational-route-guard";
import { OperatorHeaderNotifications } from "../../../../components/operator/operator-header-notifications";
import { OperatorStoreIdentity } from "../../../../components/operator/operator-store-identity";
import { OperatorTabNavigation } from "../../../../components/operator/operator-tab-navigation";
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
          <header className="relative z-50 bg-cas-primary px-4 py-2 sm:px-8 xl:px-12">
            <div className="mx-auto flex max-w-[100rem] items-center justify-between gap-4">
              <OperatorStoreIdentity inHeader subtitle="Vận hành" />

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

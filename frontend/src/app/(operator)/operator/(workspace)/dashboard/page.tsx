import type { Metadata } from "next";

import { OperatorDashboardSummaryCards } from "../../../../../components/operator/operator-dashboard-summary-cards";
import { OperatorIncidentsPanel } from "../../../../../components/operator/operator-incidents-panel";
import { OperatorLongWaitTableAlerts } from "../../../../../components/operator/operator-long-wait-table-alerts";
import { OperatorMiniTableMap } from "../../../../../components/operator/operator-mini-table-map";
import { CasButton } from "../../../../../components/ui/cas-button";
import { CasIcon } from "../../../../../components/ui/cas-icon";

export const metadata: Metadata = {
  title: "Tổng quan | CAS",
  description: "Theo dõi tổng quan và bàn chờ lâu tại CAS.",
};

export default function OperatorDashboardPage() {
  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tổng quan</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <CasButton href="/operator/cancellations/new" variant="outline">
            <CasIcon className="size-4" name="trash" />
            <span>Hủy món do sự cố</span>
          </CasButton>
          <OperatorIncidentsPanel />
          <CasButton href="/operator/orders/new">
            <CasIcon className="size-4" name="plus" />
            <span>Tạo order hộ</span>
          </CasButton>
        </div>
      </header>
      <OperatorDashboardSummaryCards />
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-6">
          <OperatorLongWaitTableAlerts />
        </div>
        <OperatorMiniTableMap />
      </div>
    </>
  );
}

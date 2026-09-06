import type { Metadata } from "next";

import { OperatorComplaintsPanel } from "../../../../../components/operator/operator-complaints-panel";
import { OperatorIncidentsPanel } from "../../../../../components/operator/operator-incidents-panel";
import { OperatorLongWaitTableAlerts } from "../../../../../components/operator/operator-long-wait-table-alerts";
import { OperatorMiniTableMap } from "../../../../../components/operator/operator-mini-table-map";
import { CasButton } from "../../../../../components/ui/cas-button";
import { CasIcon } from "../../../../../components/ui/cas-icon";

export const metadata: Metadata = {
  title: "Tổng quan | CAS",
  description: "Theo dõi tổng quan, bàn chờ lâu và khiếu nại tại CAS.",
};

const summaryCards = [
  { label: "Lượt gọi món hôm nay", value: "08" },
  { label: "Bàn đang phục vụ", supportingValue: "/20", value: "12" },
  { label: "Yêu cầu thanh toán", value: "03" },
];

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
          <CasButton href="/operator/orders/new">
            <CasIcon className="size-4" name="plus" />
            <span>Tạo order hộ</span>
          </CasButton>
        </div>
      </header>
      <section aria-label="Tổng quan hoạt động hôm nay" className="mt-6 grid gap-3 md:grid-cols-3">
        {summaryCards.map((card) => (
          <article
            className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-cas-outline-variant/25 bg-cas-glass px-4 py-3"
            key={card.label}
          >
            <p className="text-sm font-bold text-cas-on-surface-variant">{card.label}</p>
            <p className="shrink-0 text-lg font-extrabold tracking-tight text-cas-primary">
              {card.value}
              {card.supportingValue && (
                <span className="ml-0.5 text-xs text-cas-on-surface-variant/60">
                  {card.supportingValue}
                </span>
              )}
            </p>
          </article>
        ))}
      </section>
      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-6">
          <OperatorLongWaitTableAlerts />
          <OperatorComplaintsPanel />
          <OperatorIncidentsPanel />
        </div>
        <OperatorMiniTableMap />
      </div>
    </>
  );
}

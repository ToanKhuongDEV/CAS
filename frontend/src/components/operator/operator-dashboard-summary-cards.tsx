"use client";

import { useOperatorDashboardSummaryQuery } from "../../lib/api/operation/operation.query";

export function OperatorDashboardSummaryCards() {
  const { data: summary, error } = useOperatorDashboardSummaryQuery();

  const cards = [
    { label: "Lượt gọi món hôm nay", value: summary?.ordersToday ?? "—" },
    {
      label: "Bàn đang phục vụ",
      supportingValue: summary ? `/${summary.totalTableCount}` : undefined,
      value: summary?.activeTableCount ?? "—",
    },
    { label: "Yêu cầu thanh toán", value: summary?.pendingPaymentCount ?? "—" },
  ];

  return (
    <section aria-label="Tổng quan hoạt động hôm nay" className="mt-6 grid gap-3 md:grid-cols-3">
      {cards.map((card) => (
        <article
          className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-cas-outline-variant/25 bg-cas-glass px-4 py-3"
          key={card.label}
        >
          <p className="text-sm font-bold text-cas-on-surface-variant">{card.label}</p>
          <p className="shrink-0 text-lg font-extrabold tracking-tight text-cas-primary">
            {card.value}
            {card.supportingValue ? (
              <span className="ml-0.5 text-xs text-cas-on-surface-variant/60">
                {card.supportingValue}
              </span>
            ) : null}
          </p>
        </article>
      ))}
      {error ? (
        <p className="text-sm font-bold text-cas-error md:col-span-3">{error.message}</p>
      ) : null}
    </section>
  );
}

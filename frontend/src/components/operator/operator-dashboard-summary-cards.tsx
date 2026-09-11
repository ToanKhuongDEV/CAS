"use client";

import { useEffect, useState } from "react";

import {
  loadOperatorDashboardSummary,
  type OperatorDashboardSummary,
} from "../../lib/api/operation/operator-dashboard.api";

const refreshIntervalMs = 10_000;

export function OperatorDashboardSummaryCards() {
  const [summary, setSummary] = useState<OperatorDashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const value = await loadOperatorDashboardSummary();
        if (!active) return;
        setSummary(value);
        setError(null);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải tổng quan.");
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), refreshIntervalMs);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

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
      {error ? <p className="text-sm font-bold text-cas-error md:col-span-3">{error}</p> : null}
    </section>
  );
}

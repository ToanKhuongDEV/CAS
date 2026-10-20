"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CasIcon } from "../../components/ui/cas-icon";
import type { AdminDashboard } from "../../lib/api/operation/admin-dashboard.api";
import { useAdminDashboardQuery } from "../../lib/api/operation/operation.query";

type Period = "threeDays" | "oneWeek" | "oneMonth" | "custom";
type ReportTab = "revenue" | "customers" | "menu" | "promotions";
type IconName = "bill" | "cart" | "payment" | "users" | "clock" | "fire" | "sparkle" | "close";

const periodLabels: Record<Exclude<Period, "custom">, string> = {
  threeDays: "3 ngày",
  oneWeek: "1 tuần",
  oneMonth: "1 tháng",
};
const reportTabs: { id: ReportTab; label: string }[] = [
  { id: "revenue", label: "Doanh thu" },
  { id: "customers", label: "Khách hàng" },
  { id: "menu", label: "Menu & Order" },
  { id: "promotions", label: "Khuyến mãi" },
];

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("oneWeek");
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [startDate, setStartDate] = useState(() => rangeFor(7).from);
  const [endDate, setEndDate] = useState(() => rangeFor(7).to);
  const invalidRange = startDate > endDate;
  const {
    data: dashboard,
    error: queryError,
    isLoading,
  } = useAdminDashboardQuery(startDate, endDate, !invalidRange);
  const error = invalidRange
    ? "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc."
    : (queryError?.message ?? null);

  function selectPeriod(next: Period) {
    setPeriod(next);
    if (next === "custom") return;
    const range = rangeFor(next === "threeDays" ? 3 : next === "oneWeek" ? 7 : 30);
    setStartDate(range.from);
    setEndDate(range.to);
  }

  return (
    <div className="space-y-7">
      <header className="flex items-center gap-3">
        <span className="grid size-7 place-items-center text-cas-primary">
          <CasIcon className="size-5" name="sparkle" />
        </span>
        <h1 className="text-xl font-black tracking-tight text-cas-on-surface sm:text-2xl">
          Báo cáo hoạt động
        </h1>
      </header>
      <section className="border-b border-cas-outline-variant/70 pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex overflow-hidden rounded-sm border border-cas-outline-variant/60 bg-cas-surface">
            {(Object.keys(periodLabels) as Exclude<Period, "custom">[]).map((item) => (
              <button
                className={`cursor-pointer px-3 py-2 text-xs font-bold transition ${period === item ? "bg-cas-primary/10 text-cas-primary" : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"}`}
                key={item}
                onClick={() => selectPeriod(item)}
                type="button"
              >
                {periodLabels[item]}
              </button>
            ))}
            <button
              className={`cursor-pointer border-l border-cas-outline-variant/40 px-3 py-2 text-xs font-bold transition ${period === "custom" ? "bg-cas-primary/10 text-cas-primary" : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"}`}
              onClick={() => selectPeriod("custom")}
              type="button"
            >
              Tùy chỉnh
            </button>
          </div>
          <DateInput
            label="Ngày bắt đầu"
            onChange={(value) => {
              setPeriod("custom");
              setStartDate(value);
            }}
            value={startDate}
          />
          <span className="text-xs font-bold text-cas-on-surface-variant">đến</span>
          <DateInput
            label="Ngày kết thúc"
            onChange={(value) => {
              setPeriod("custom");
              setEndDate(value);
            }}
            value={endDate}
          />
        </div>
      </section>
      <nav
        aria-label="Nhóm báo cáo"
        className="grid grid-cols-2 border-b border-cas-outline-variant/70 sm:grid-cols-4"
      >
        {reportTabs.map((tab) => (
          <button
            className={`cursor-pointer border-b-2 px-3 py-3 text-center text-sm font-bold transition ${activeTab === tab.id ? "border-cas-primary text-cas-primary" : "border-transparent text-cas-on-surface-variant hover:text-cas-on-surface"}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {isLoading ? (
        <p className="text-sm text-cas-on-surface-variant">Đang tải báo cáo...</p>
      ) : null}
      {error ? <p className="text-sm font-bold text-cas-error">{error}</p> : null}
      {dashboard && activeTab === "revenue" ? <RevenueReport dashboard={dashboard} /> : null}
      {dashboard && activeTab === "customers" ? <CustomerReport dashboard={dashboard} /> : null}
      {dashboard && activeTab === "menu" ? <MenuReport dashboard={dashboard} /> : null}
      {dashboard && activeTab === "promotions" ? <PromotionReport dashboard={dashboard} /> : null}
    </div>
  );
}

function RevenueReport({ dashboard }: { dashboard: AdminDashboard }) {
  const average = dashboard.revenue.paidSessionCount
    ? dashboard.revenue.total / dashboard.revenue.paidSessionCount
    : 0;
  const trend = dashboard.revenue.series.map((item) => ({
    label: shortDate(item.date),
    value: item.revenue,
  }));
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          ["payment", "Doanh thu", money(dashboard.revenue.total), "Chỉ gồm phiên đã thanh toán"],
          [
            "users",
            "Số session đã thanh toán",
            `${dashboard.revenue.paidSessionCount} phiên`,
            "Bao gồm đơn mang về",
          ],
          [
            "bill",
            "Giá trị session trung bình",
            money(average),
            "Doanh thu / session đã thanh toán",
          ],
        ]}
      />
      <ChartPanel title="Xu hướng doanh thu" subtitle="Đơn vị: đồng">
        <ResponsiveContainer height="100%" width="100%">
          <AreaChart data={trend} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="admin-revenue-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--cas-primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--cas-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--cas-outline-variant)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis axisLine={false} dataKey="label" tick={axisTick} tickLine={false} />
            <YAxis
              axisLine={false}
              tick={axisTick}
              tickFormatter={compactMoney}
              tickLine={false}
              width={42}
            />
            <Tooltip {...tooltipProps} formatter={(value) => [money(Number(value)), "Doanh thu"]} />
            <Area
              dataKey="value"
              fill="url(#admin-revenue-area)"
              stroke="var(--cas-primary)"
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}

function CustomerReport({ dashboard }: { dashboard: AdminDashboard }) {
  const series = dashboard.customers.series.map((item) => ({
    label: shortDate(item.date),
    sessions: item.paidSessionCount,
    wait: item.averageWaitMinutes,
  }));
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          [
            "users",
            "Tổng số session",
            `${dashboard.customers.paidSessionCount} phiên`,
            "Chỉ tính session đã thanh toán",
          ],
          [
            "clock",
            "Thời gian chờ trung bình",
            minutes(dashboard.customers.averageWaitMinutes),
            "Từ gọi món đến phục vụ",
          ],
        ]}
      />
      <ChartPanel title="Thời gian chờ và session theo ngày" subtitle="Phút / session">
        <ResponsiveContainer height="100%" width="100%">
          <LineChart data={series} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid
              stroke="var(--cas-outline-variant)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis axisLine={false} dataKey="label" tick={axisTick} tickLine={false} />
            <YAxis axisLine={false} tick={axisTick} tickLine={false} width={35} />
            <Tooltip {...tooltipProps} />
            <Line
              dataKey="wait"
              name="Chờ món (phút)"
              stroke="var(--cas-tertiary)"
              strokeWidth={2}
              type="monotone"
            />
            <Line
              dataKey="sessions"
              name="Session đã thanh toán"
              stroke="var(--cas-primary)"
              strokeWidth={2}
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
}

function MenuReport({ dashboard }: { dashboard: AdminDashboard }) {
  const topItem = dashboard.menu.topItems[0];
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          [
            "cart",
            "Tổng số phần đã bán",
            `${dashboard.menu.soldQuantity} phần`,
            "Không tính món làm lại",
          ],
          [
            "fire",
            "Món bán nhiều nhất",
            topItem?.name ?? "Chưa có dữ liệu",
            topItem ? `${topItem.soldQuantity} phần` : "",
          ],
          [
            "close",
            "Hao hụt làm lại",
            `${dashboard.menu.remadeQuantity} phần`,
            "Món có cờ làm lại",
          ],
        ]}
      />
      <section className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-5 shadow-xs">
        <SectionHeading icon="cart" title="Chi tiết Menu & Order" />
        <div className="mt-4 overflow-x-auto border-t border-cas-outline-variant/50">
          <table className="w-full min-w-150 text-left text-xs">
            <thead className="border-b border-cas-outline-variant/50 text-cas-on-surface-variant">
              <tr>
                <th className="px-3 py-3">Món</th>
                <th className="px-3 py-3">Số phần bán</th>
                <th className="px-3 py-3">Doanh thu</th>
                <th className="px-3 py-3">Làm lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cas-outline-variant/40 text-cas-on-surface">
              {dashboard.menu.topItems.map((item, index) => (
                <tr key={item.menuItemId}>
                  <td className="px-3 py-3 font-black">
                    {index + 1}. {item.name}
                  </td>
                  <td className="px-3 py-3">{item.soldQuantity}</td>
                  <td className="px-3 py-3 font-bold text-cas-primary">{money(item.revenue)}</td>
                  <td className="px-3 py-3">{item.remadeQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PromotionReport({ dashboard }: { dashboard: AdminDashboard }) {
  const statuses = [
    ["Đang hoạt động", dashboard.promotions.statusCounts.active, "text-cas-primary"],
    ["Sắp diễn ra", dashboard.promotions.statusCounts.upcoming, "text-cas-secondary"],
    ["Hết hạn", dashboard.promotions.statusCounts.expired, "text-cas-on-surface-variant"],
    ["Tạm dừng", dashboard.promotions.statusCounts.inactive, "text-cas-tertiary"],
  ] as const;
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          [
            "payment",
            "Tổng giá trị khuyến mãi",
            money(dashboard.promotions.totalDiscountAmount),
            "Chỉ tính session đã thanh toán",
          ],
          [
            "bill",
            "Tỷ lệ sử dụng khuyến mãi",
            `${dashboard.promotions.usageRate}%`,
            `${dashboard.promotions.discountedSessionCount} session có khuyến mãi`,
          ],
        ]}
      />
      <section className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-5 shadow-xs">
        <SectionHeading icon="sparkle" title="Tình trạng chương trình khuyến mãi" />
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {statuses.map(([label, value, valueClassName]) => (
            <div className="rounded-sm border border-cas-outline-variant/60 p-4" key={label}>
              <p className="text-xs text-cas-on-surface-variant">{label}</p>
              <strong className={`mt-2 block text-2xl font-black ${valueClassName}`}>
                {value}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
function MetricGrid({ metrics }: { metrics: [IconName, string, string, string][] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map(([icon, label, value, hint]) => (
        <article
          className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-4 shadow-xs"
          key={label}
        >
          <div className="flex items-center gap-2 text-cas-on-surface-variant">
            <CasIcon className="size-4 text-cas-primary" name={icon} />
            <span className="text-xs font-bold">{label}</span>
          </div>
          <strong className="mt-3 block text-xl font-black text-cas-on-surface">{value}</strong>
          <p className="mt-1 text-[0.68rem] leading-4 text-cas-on-surface-variant">{hint}</p>
        </article>
      ))}
    </div>
  );
}
function ChartPanel({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-5 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <SectionHeading icon="sparkle" title={title} />
        <span className="text-[0.68rem] text-cas-on-surface-variant">{subtitle}</span>
      </div>
      <div className="mt-4 h-78">{children}</div>
    </section>
  );
}
function SectionHeading({ icon, title }: { icon: IconName; title: string }) {
  return (
    <div className="flex items-center gap-2 text-cas-on-surface">
      <CasIcon className="size-4 text-cas-primary" name={icon} />
      <h2 className="text-sm font-black">{title}</h2>
    </div>
  );
}
function DateInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="rounded-sm border border-cas-outline-variant/60 bg-cas-surface px-2.5 py-1.5 text-xs font-semibold text-cas-on-surface">
      <span className="sr-only">{label}</span>
      <input
        className="min-w-30 bg-transparent outline-none"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}
function rangeFor(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - days + 1);
  return { from: dateInputValue(from), to: dateInputValue(to) };
}
function dateInputValue(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
function shortDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}
function money(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}
function minutes(value: number | null) {
  return value == null
    ? "Chưa có dữ liệu"
    : `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(value)} phút`;
}
function compactMoney(value: number) {
  return value >= 1_000_000 ? `${value / 1_000_000}tr` : `${value / 1_000}k`;
}
const axisTick = { fill: "var(--cas-on-surface-variant)", fontSize: 11 };
const tooltipProps = {
  contentStyle: {
    backgroundColor: "var(--cas-surface)",
    border: "1px solid var(--cas-outline-variant)",
    borderRadius: "0.125rem",
    color: "var(--cas-on-surface)",
    fontSize: "0.75rem",
  },
};

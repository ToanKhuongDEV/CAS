import type { Metadata } from "next";

import { CasIcon } from "../../../../../components/ui/cas-icon";

export const metadata: Metadata = {
  title: "Tổng quan vận hành | CAS",
  description: "Theo dõi tổng quan hoạt động và các bàn đang chờ lâu tại CAS.",
};

type SummaryCard = {
  label: string;
  supportingValue?: string;
  value: string;
};

const summaryCards: SummaryCard[] = [
  {
    label: "Lượt gọi món hôm nay",
    value: "08",
  },
  {
    label: "Bàn đang phục vụ",
    supportingValue: "/20",
    value: "12",
  },
  {
    label: "Yêu cầu thanh toán",
    value: "03",
  },
];

const temporaryWaitingThresholdMinutes = 25;

const waitingTables = [
  {
    oldestPendingOrderAt: "19:05",
    oldestPendingOrderNumber: "ORD-0821",
    table: "Bàn 05",
    waitingTime: "37 phút",
  },
  {
    oldestPendingOrderAt: "19:11",
    oldestPendingOrderNumber: "ORD-0824",
    table: "Bàn 12",
    waitingTime: "31 phút",
  },
  {
    oldestPendingOrderAt: "19:17",
    oldestPendingOrderNumber: "ORD-0826",
    table: "Bàn 03",
    waitingTime: "25 phút",
  },
];

const recentActivities = [
  {
    description: "Ốc hương rang muối (x2)",
    summary: "Bàn 12 vừa gọi thêm món",
    time: "2 phút trước",
    tone: "primary",
  },
  {
    description: "Payment đã được nhân viên xác nhận",
    summary: "Bàn 08 đã thanh toán xong",
    time: "10 phút trước",
    tone: "secondary",
  },
  {
    description: "Phiên bàn mới đã được mở",
    summary: "Bàn 02 có khách mới",
    time: "15 phút trước",
    tone: "tertiary",
  },
] as const;

const tables = [
  { code: "B.01", status: "Đang dùng", tone: "occupied" },
  { code: "B.02", status: "Trống", tone: "empty" },
  { code: "B.05", status: "Chờ lâu", tone: "attention" },
  { code: "B.06", status: "Trống", tone: "empty" },
] as const;

const activityToneClasses = {
  primary: "bg-cas-primary",
  secondary: "bg-cas-secondary",
  tertiary: "bg-cas-tertiary",
};

const tableToneClasses = {
  attention: "border-cas-primary bg-cas-primary/8",
  empty: "border-dashed border-cas-outline-variant bg-cas-glass",
  occupied: "border-cas-secondary bg-cas-secondary-container/20",
};

export default function OperatorDashboardPage() {
  return (
    <>
      <header>
        <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          Bảng điều khiển nhân viên
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Tổng quan
        </h1>
        <p className="mt-2 text-sm text-cas-on-surface-variant">
          Theo dõi nhanh hoạt động và các bàn cần chú ý trong ca.
        </p>
      </header>

      <section
        className="mt-6 grid gap-3 md:grid-cols-3"
        aria-label="Tổng quan hoạt động hôm nay"
      >
        {summaryCards.map((card) => (
          <article
            className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-cas-outline-variant/25 bg-cas-glass px-4 py-3"
            key={card.label}
          >
            <p className="text-sm font-bold text-cas-on-surface-variant">
              {card.label}
            </p>
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
      </section>

      <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.8fr)]">
        <div className="flex flex-col gap-6">
          <section
            className="rounded-2xl border border-cas-primary/25 bg-cas-primary/5 p-5"
            aria-labelledby="waiting-table-alerts-title"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
                <CasIcon className="size-5" name="clock" />
              </span>
              <div>
                <h2
                  className="text-xl font-extrabold text-cas-primary"
                  id="waiting-table-alerts-title"
                >
                  Cảnh báo bàn chờ lâu
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-cas-on-surface-variant">
                  Thời gian chờ được tính từ `createdAt` của order cũ nhất còn
                  món chưa làm xong. Ngưỡng cảnh báo hiện tại:{" "}
                  <strong>{temporaryWaitingThresholdMinutes} phút</strong>.
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-3">
              {waitingTables.map((table) => (
                <li
                  className="grid gap-3 rounded-xl border border-cas-primary/15 bg-cas-glass p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  key={table.table}
                >
                  <div>
                    <p className="font-extrabold">{table.table}</p>
                    <p className="mt-1 text-xs text-cas-on-surface-variant">
                      Order chờ lâu nhất {table.oldestPendingOrderNumber} ·{" "}
                      {table.oldestPendingOrderAt}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-cas-primary px-3 py-1.5 text-xs font-extrabold text-cas-on-primary">
                    Đã chờ {table.waitingTime}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            className="rounded-2xl border border-cas-outline-variant/20 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
            aria-labelledby="recent-activity-title"
          >
            <h2 className="text-xl font-extrabold" id="recent-activity-title">
              Hoạt động gần đây
            </h2>
            <ul className="mt-3 divide-y divide-cas-outline-variant/25">
              {recentActivities.map((activity) => (
                <li
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                  key={`${activity.summary}-${activity.time}`}
                >
                  <span
                    className={`mt-2 size-2 rounded-full ${activityToneClasses[activity.tone]}`}
                  />
                  <div>
                    <p className="text-sm font-bold">{activity.summary}</p>
                    <p className="mt-1 text-xs text-cas-on-surface-variant">
                      {activity.description}
                    </p>
                  </div>
                  <time className="col-start-2 text-xs text-cas-on-surface-variant sm:col-start-auto">
                    {activity.time}
                  </time>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          className="rounded-2xl border border-cas-outline-variant/20 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
          aria-labelledby="table-overview-title"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold" id="table-overview-title">
              Sơ đồ bàn mini
            </h2>
            <span className="text-xs font-extrabold text-cas-primary">
              12/20 đang dùng
            </span>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-cas-outline-variant/25 bg-cas-surface p-4">
            {tables.map((table) => (
              <li
                className={`grid min-h-20 place-items-center rounded-xl border-2 p-3 text-center ${tableToneClasses[table.tone]}`}
                key={table.code}
              >
                <div>
                  <p className="font-extrabold">{table.code}</p>
                  <p
                    className={`mt-1 text-[0.68rem] font-bold ${
                      table.tone === "attention"
                        ? "text-cas-primary"
                        : table.tone === "occupied"
                          ? "text-cas-secondary"
                          : "text-cas-on-surface-variant"
                    }`}
                  >
                    {table.status}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.68rem] text-cas-on-surface-variant">
            <span>○ Trống</span>
            <span className="text-cas-secondary">● Đang dùng</span>
            <span className="text-cas-primary">● Chờ lâu</span>
          </div>
        </section>
      </div>

      <section
        className="mt-7 rounded-2xl border border-cas-outline-variant/25 bg-cas-surface-container/65 p-5"
        aria-label="Thông tin dữ liệu dashboard"
      >
        <div className="flex gap-3">
          <CasIcon
            className="mt-0.5 size-5 shrink-0 text-cas-secondary"
            name="info"
          />
          <p className="text-sm leading-relaxed text-cas-on-surface-variant">
            Dữ liệu hiện tại là dữ liệu mẫu. Khi API sẵn sàng, backend sẽ trả
            danh sách bàn chờ theo ngưỡng do Admin cấu hình. UI đang tạm hiển thị
            ngưỡng {temporaryWaitingThresholdMinutes} phút.
          </p>
        </div>
      </section>
    </>
  );
}

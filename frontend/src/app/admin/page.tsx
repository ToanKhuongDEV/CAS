"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CasIcon } from "../../components/ui/cas-icon";

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

const revenueTrend = [
  { label: "01/10", value: 13.8 },
  { label: "02/10", value: 14.5 },
  { label: "03/10", value: 15.3 },
  { label: "04/10", value: 16.1 },
  { label: "05/10", value: 16.9 },
  { label: "06/10", value: 17.8 },
  { label: "07/10", value: 18.6 },
  { label: "08/10", value: 19.3 },
  { label: "09/10", value: 16.2 },
  { label: "10/10", value: 18.1 },
];

const categoryRevenue = [
  { color: "var(--cas-primary)", name: "Mỳ cay", value: 43 },
  { color: "var(--cas-secondary)", name: "Nước uống", value: 31 },
  { color: "var(--cas-tertiary)", name: "Topping", value: 16 },
  { color: "var(--cas-outline-variant)", name: "Khác", value: 10 },
];

const customerTimeByHour = [
  { hour: "10h", service: 29, wait: 9 },
  { hour: "12h", service: 42, wait: 17 },
  { hour: "14h", service: 35, wait: 12 },
  { hour: "16h", service: 31, wait: 10 },
  { hour: "18h", service: 48, wait: 19 },
  { hour: "20h", service: 40, wait: 14 },
];

const menuRanking = [
  { name: "Mỳ cay hải sản", parts: "86 phần", revenue: "4,3 triệu" },
  { name: "Cà phê sữa đá", parts: "72 phần", revenue: "2,5 triệu" },
  { name: "Trà đào cam sả", parts: "58 phần", revenue: "2,6 triệu" },
  { name: "Topping bò Mỹ", parts: "51 phần", revenue: "1,5 triệu" },
];

const promotionStatuses = [
  { label: "Đang hoạt động", value: "6", valueClassName: "text-cas-primary" },
  { label: "Sắp diễn ra", value: "2", valueClassName: "text-cas-secondary" },
  { label: "Hết hạn", value: "3", valueClassName: "text-cas-on-surface-variant" },
  { label: "Tạm dừng", value: "1", valueClassName: "text-cas-tertiary" },
];

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("oneWeek");
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [startDate, setStartDate] = useState("2026-10-01");
  const [endDate, setEndDate] = useState("2026-10-10");

  return (
    <div className="space-y-7">
      <header className="flex items-center gap-3">
        <span className="grid size-7 place-items-center text-cas-primary">
          <CasIcon className="size-5" name="sparkle" />
        </span>
        <div>
          <h1 className="text-xl font-black tracking-tight text-cas-on-surface sm:text-2xl">
            Báo cáo hoạt động
          </h1>
        </div>
      </header>

      <section className="border-b border-cas-outline-variant/70 pb-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex overflow-hidden rounded-sm border border-cas-outline-variant/60 bg-cas-surface">
            {(Object.keys(periodLabels) as Exclude<Period, "custom">[]).map((item) => (
              <button
                className={`cursor-pointer px-3 py-2 text-xs font-bold transition ${
                  period === item
                    ? "bg-cas-primary/10 text-cas-primary"
                    : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"
                }`}
                key={item}
                onClick={() => setPeriod(item)}
                type="button"
              >
                {periodLabels[item]}
              </button>
            ))}
            <button
              className={`cursor-pointer border-l border-cas-outline-variant/40 px-3 py-2 text-xs font-bold transition ${
                period === "custom"
                  ? "bg-cas-primary/10 text-cas-primary"
                  : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"
              }`}
              onClick={() => setPeriod("custom")}
              type="button"
            >
              Tùy chỉnh
            </button>
          </div>
          <DateInput label="Ngày bắt đầu" onChange={setStartDate} value={startDate} />
          <span className="text-xs font-bold text-cas-on-surface-variant">đến</span>
          <DateInput label="Ngày kết thúc" onChange={setEndDate} value={endDate} />
        </div>
      </section>

      <nav
        aria-label="Nhóm báo cáo"
        className="grid grid-cols-2 border-b border-cas-outline-variant/70 sm:grid-cols-4"
      >
        {reportTabs.map((tab) => (
          <button
            className={`cursor-pointer border-b-2 px-3 py-3 text-center text-sm font-bold transition ${
              activeTab === tab.id
                ? "border-cas-primary text-cas-primary"
                : "border-transparent text-cas-on-surface-variant hover:text-cas-on-surface"
            }`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "revenue" && <RevenueReport />}
      {activeTab === "customers" && <CustomerReport />}
      {activeTab === "menu" && <MenuOrderReport />}
      {activeTab === "promotions" && <PromotionReport />}
    </div>
  );
}

function RevenueReport() {
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          ["payment", "Doanh thu thuần", "28,1 triệu", "Sau giảm giá, hoàn tiền và giảm trừ"],
          ["bill", "Doanh thu theo món", "24 món", "Xem xếp hạng theo doanh thu"],
          ["cart", "Doanh thu theo danh mục", "4 nhóm", "Mỳ cay, nước uống, topping và khác"],
          ["bill", "Tổng giá trị hóa đơn", "31,6 triệu", "Trước giảm giá; không tính hóa đơn hủy"],
          [
            "payment",
            "Giá trị hóa đơn trung bình",
            "186.000 đ",
            "Doanh thu thuần / hóa đơn đã thanh toán",
          ],
          [
            "users",
            "Chi tiêu trung bình/người",
            "139.000 đ",
            "Doanh thu thuần / lượt khách phục vụ",
          ],
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ChartPanel title="Xu hướng doanh thu" subtitle="Đơn vị: triệu đồng">
          <ResponsiveContainer height="100%" width="100%">
            <AreaChart data={revenueTrend} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
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
                tickFormatter={(value) => `${value}tr`}
                tickLine={false}
                width={42}
              />
              <Tooltip
                {...tooltipProps}
                formatter={(value) => [`${value} triệu đồng`, "Doanh thu"]}
              />
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
        <section className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-5 shadow-xs">
          <SectionHeading icon="cart" title="Tỷ trọng theo danh mục" />
          <div className="mt-3 h-48">
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  dataKey="value"
                  innerRadius={45}
                  outerRadius={74}
                  paddingAngle={3}
                >
                  {categoryRevenue.map((item) => (
                    <Cell fill={item.color} key={item.name} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} formatter={(value) => [`${value}%`, "Tỷ trọng"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {categoryRevenue.map((item) => (
              <div className="flex items-center justify-between text-xs" key={item.name}>
                <span className="flex items-center gap-2 text-cas-on-surface-variant">
                  <i className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <strong className="text-cas-on-surface">{item.value}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <RankingPanel title="Xếp hạng doanh thu món" />
    </div>
  );
}

function CustomerReport() {
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          ["users", "Tổng số lượt khách", "202 lượt", "Người được ghi nhận trong các phiên bàn"],
          ["clock", "Thời gian chờ đợi trung bình", "13 phút", "Từ gọi món đến phục vụ"],
          [
            "users",
            "Tỷ lệ khách hàng quay lại",
            "32,4%",
            "Khách định danh đã từng mua / tổng khách định danh",
          ],
          ["clock", "Thời gian sử dụng dịch vụ", "58 phút", "Từ mở phiên bàn đến đóng phiên"],
        ]}
      />
      <ChartPanel title="Thời gian chờ và sử dụng dịch vụ theo giờ" subtitle="Đơn vị: phút">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={customerTimeByHour} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid
              stroke="var(--cas-outline-variant)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis axisLine={false} dataKey="hour" tick={axisTick} tickLine={false} />
            <YAxis axisLine={false} tick={axisTick} tickLine={false} width={35} />
            <Tooltip {...tooltipProps} />
            <Bar dataKey="wait" fill="var(--cas-tertiary)" name="Chờ món" radius={2} />
            <Bar dataKey="service" fill="var(--cas-primary)" name="Sử dụng dịch vụ" radius={2} />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>
      <p className="rounded-sm border border-cas-tertiary/30 bg-cas-tertiary/10 p-4 text-xs leading-5 text-cas-on-surface-variant">
        <strong className="text-cas-tertiary">Lưu ý dữ liệu:</strong> Chỉ thống kê được thời gian
        khách nhận món khi có sự kiện <code>served_at</code>. Nếu hệ thống chỉ lưu bếp hoàn thành,
        báo cáo thể hiện thời gian ra món.
      </p>
    </div>
  );
}

function MenuOrderReport() {
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          ["cart", "Tổng số món trong menu", "48 món", "36 đang bán · 12 ngừng bán"],
          ["fire", "Món chạy nhất", "Mỳ cay hải sản", "86 phần · 4,3 triệu doanh thu"],
          ["close", "Tỷ lệ hủy món", "3,8%", "Phần bị hủy / tổng phần từng được đặt"],
          ["bill", "Tổng số phần đã bán", "612 phần", "Sản lượng, khác với tổng số món trong menu"],
        ]}
      />
      <section className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeading icon="cart" title="Chi tiết Menu & Order" />
          <div className="flex gap-2">
            <select className="rounded-sm border border-cas-outline-variant/60 bg-cas-surface px-3 py-2 text-xs font-semibold text-cas-on-surface">
              <option>Tất cả danh mục</option>
              <option>Mỳ cay</option>
              <option>Nước uống</option>
            </select>
            <select className="rounded-sm border border-cas-outline-variant/60 bg-cas-surface px-3 py-2 text-xs font-semibold text-cas-on-surface">
              <option>Tất cả trạng thái</option>
              <option>Đang bán</option>
              <option>Ngừng bán</option>
            </select>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto border-t border-cas-outline-variant/50">
          <table className="w-full min-w-150 text-left text-xs">
            <thead className="border-b border-cas-outline-variant/50 text-cas-on-surface-variant">
              <tr>
                <th className="px-3 py-3">Món</th>
                <th className="px-3 py-3">Danh mục</th>
                <th className="px-3 py-3">Số phần bán</th>
                <th className="px-3 py-3">Doanh thu</th>
                <th className="px-3 py-3">Tỷ lệ hủy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cas-outline-variant/40 text-cas-on-surface">
              {menuRanking.map((item, index) => (
                <tr key={item.name}>
                  <td className="px-3 py-3 font-black">
                    {index + 1}. {item.name}
                  </td>
                  <td className="px-3 py-3 text-cas-on-surface-variant">Món bán chạy</td>
                  <td className="px-3 py-3">{item.parts}</td>
                  <td className="px-3 py-3 font-bold text-cas-primary">{item.revenue}</td>
                  <td className="px-3 py-3">{index === 0 ? "2,1%" : "3,4%"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PromotionReport() {
  return (
    <div className="space-y-6">
      <MetricGrid
        metrics={[
          [
            "payment",
            "Tổng giá trị khuyến mãi",
            "2,4 triệu",
            "Tổng tiền giảm của khuyến mãi áp dụng thành công",
          ],
          [
            "bill",
            "Tỷ lệ sử dụng khuyến mãi",
            "18,6%",
            "Hóa đơn có khuyến mãi / hóa đơn thanh toán",
          ],
          [
            "sparkle",
            "Tổng số khuyến mãi",
            "12 chương trình",
            "6 hoạt động · 2 sắp diễn ra · 3 hết hạn · 1 tạm dừng",
          ],
        ]}
      />
      <section className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-5 shadow-xs">
        <SectionHeading icon="sparkle" title="Tình trạng chương trình khuyến mãi" />
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {promotionStatuses.map((status) => (
            <div className="rounded-sm border border-cas-outline-variant/60 p-4" key={status.label}>
              <p className="text-xs text-cas-on-surface-variant">{status.label}</p>
              <strong className={`mt-2 block text-2xl font-black ${status.valueClassName}`}>
                {status.value}
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

function RankingPanel({ title }: { title: string }) {
  return (
    <section className="rounded-sm border border-cas-outline-variant/70 bg-cas-surface p-5 shadow-xs">
      <SectionHeading icon="fire" title={title} />
      <div className="mt-4 divide-y divide-cas-outline-variant/40 border-t border-cas-outline-variant/40">
        {menuRanking.map((item, index) => (
          <div className="flex items-center justify-between gap-4 py-3" key={item.name}>
            <div className="flex items-center gap-3">
              <span className="w-4 text-center text-xs font-black text-cas-primary">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-black text-cas-on-surface">{item.name}</p>
                <p className="mt-0.5 text-[0.68rem] text-cas-on-surface-variant">{item.parts}</p>
              </div>
            </div>
            <strong className="text-xs text-cas-primary">{item.revenue}</strong>
          </div>
        ))}
      </div>
    </section>
  );
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { CasIcon } from "../../components/ui/cas-icon";

type FilterMode = "date" | "month" | "year" | "range";
type RevenueChartPeriod = "today" | "sevenDays" | "thirtyDays" | "thisMonth";

const revenueChartData: Record<RevenueChartPeriod, { label: string; value: number }[]> = {
  today: [
    { label: "09h", value: 1.2 },
    { label: "10h", value: 2.4 },
    { label: "11h", value: 4.8 },
    { label: "12h", value: 7.2 },
    { label: "13h", value: 5.5 },
    { label: "14h", value: 2.8 },
    { label: "15h", value: 1.9 },
    { label: "16h", value: 3.4 },
    { label: "17h", value: 6.8 },
    { label: "18h", value: 8 },
    { label: "19h", value: 7.6 },
    { label: "20h", value: 4.2 },
    { label: "21h", value: 2.9 },
    { label: "22h", value: 1.4 },
  ],
  sevenDays: [
    { label: "03/08", value: 31.2 },
    { label: "04/08", value: 36.8 },
    { label: "05/08", value: 29.4 },
    { label: "06/08", value: 42.1 },
    { label: "07/08", value: 38.6 },
    { label: "08/08", value: 45.2 },
    { label: "09/08", value: 42.85 },
  ],
  thirtyDays: [
    { label: "11/07", value: 28.6 },
    { label: "16/07", value: 34.2 },
    { label: "21/07", value: 39.5 },
    { label: "26/07", value: 31.8 },
    { label: "31/07", value: 43.1 },
    { label: "05/08", value: 36.4 },
    { label: "09/08", value: 42.85 },
  ],
  thisMonth: [
    { label: "Tuần 1", value: 245.6 },
    { label: "Tuần 2", value: 281.4 },
    { label: "Tuần 3", value: 268.2 },
    { label: "Tuần 4", value: 314.7 },
  ],
};

const revenueChartPeriodLabels: Record<RevenueChartPeriod, string> = {
  today: "Hôm nay",
  sevenDays: "7 ngày",
  thirtyDays: "30 ngày",
  thisMonth: "Tháng này",
};

export default function AdminDashboardPage() {
  // State quản lý chế độ và thời gian chọn
  const [filterMode, setFilterMode] = useState<FilterMode>("date");
  const [selectedDate, setSelectedDate] = useState("2026-08-09");
  const [selectedMonth, setSelectedMonth] = useState("2026-08");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-09");
  const [revenueChartPeriod, setRevenueChartPeriod] = useState<RevenueChartPeriod>("today");

  // Đưa ra nhãn mô tả khoảng thời gian đang lọc
  const getDisplayLabel = () => {
    switch (filterMode) {
      case "date":
        return `Ngày ${selectedDate.split("-").reverse().join("/")}`;
      case "month": {
        const [year, month] = selectedMonth.split("-");
        return `Tháng ${month}/${year}`;
      }
      case "year":
        return `Năm ${selectedYear}`;
      case "range":
        return `Từ ${startDate.split("-").reverse().join("/")} đến ${endDate.split("-").reverse().join("/")}`;
    }
  };

  // Tính toán dữ liệu chỉ số mock theo chế độ thời gian được chọn
  const getMetricsByFilter = () => {
    switch (filterMode) {
      case "month":
        return {
          revenue: "1.250.000.000 đ",
          orders: "5.480 đơn",
          remade: "85 món (16.500.000 đ)",
          openTables: "12 / 20 bàn",
          pendingPayments: "3 bàn",
          unpaidRecords: "8 khoản",
          cancellations: "92 yêu cầu",
        };
      case "year":
        return {
          revenue: "14.800.000.000 đ",
          orders: "64.200 đơn",
          remade: "980 món (185.000.000 đ)",
          openTables: "12 / 20 bàn",
          pendingPayments: "3 bàn",
          unpaidRecords: "24 khoản",
          cancellations: "410 yêu cầu",
        };
      case "range":
        return {
          revenue: "385.200.000 đ",
          orders: "1.650 đơn",
          remade: "28 món (5.400.000 đ)",
          openTables: "12 / 20 bàn",
          pendingPayments: "3 bàn",
          unpaidRecords: "4 khoản",
          cancellations: "24 yêu cầu",
        };
      case "date":
      default:
        return {
          revenue: "42.850.000 đ",
          orders: "186 đơn",
          remade: "4 món (850.000 đ)",
          openTables: "12 / 20 bàn",
          pendingPayments: "3 bàn",
          unpaidRecords: "1 khoản",
          cancellations: "2 yêu cầu",
        };
    }
  };

  const currentMetrics = getMetricsByFilter();
  const chartData = revenueChartData[revenueChartPeriod];
  const chartWidth = 680;
  const chartHeight = 250;
  const chartPadding = { top: 18, right: 16, bottom: 38, left: 42 };
  const chartMax = Math.ceil(Math.max(...chartData.map((item) => item.value)) / 2) * 2;
  const chartDrawableWidth = chartWidth - chartPadding.left - chartPadding.right;
  const chartDrawableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const chartPoints = chartData.map((item, index) => {
    const x = chartPadding.left + (index / Math.max(chartData.length - 1, 1)) * chartDrawableWidth;
    const y = chartPadding.top + (1 - item.value / chartMax) * chartDrawableHeight;
    return { ...item, x, y };
  });
  const linePoints = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = `${chartPadding.left},${chartHeight - chartPadding.bottom} ${linePoints} ${chartWidth - chartPadding.right},${chartHeight - chartPadding.bottom}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Bảng điều khiển Quản trị CAS</h1>
        </div>
      </div>

      {/* Ô chọn điều kiện lọc ở đầu (Hỗ trợ chọn theo ngày, theo tháng, theo năm, theo khoảng ngày) */}
      <div className="flex flex-col gap-4 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Nhóm bộ lọc lựa chọn */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cas-on-surface-variant">Lọc theo:</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as FilterMode)}
              className="cursor-pointer rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container px-3 py-1.5 text-xs font-bold text-cas-on-surface shadow-2xs focus:outline-hidden"
            >
              <option value="date">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
              <option value="range">Theo khoảng ngày</option>
            </select>
          </div>

          {/* Ô chọn ngày */}
          {filterMode === "date" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-cas-on-surface-variant">Chọn ngày:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container px-3 py-1 text-xs font-bold text-cas-on-surface focus:outline-hidden"
              />
            </div>
          )}

          {/* Ô chọn tháng */}
          {filterMode === "month" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-cas-on-surface-variant">Chọn tháng:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container px-3 py-1 text-xs font-bold text-cas-on-surface focus:outline-hidden"
              />
            </div>
          )}

          {/* Ô chọn năm */}
          {filterMode === "year" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-cas-on-surface-variant">Chọn năm:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="cursor-pointer rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container px-3 py-1 text-xs font-bold text-cas-on-surface focus:outline-hidden"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          )}

          {/* Ô chọn khoảng ngày (Từ ngày - Đến ngày) */}
          {filterMode === "range" && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cas-on-surface-variant">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container px-2.5 py-1 text-xs font-bold text-cas-on-surface focus:outline-hidden"
              />
              <span className="text-xs font-bold text-cas-on-surface-variant">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container px-2.5 py-1 text-xs font-bold text-cas-on-surface focus:outline-hidden"
              />
            </div>
          )}
        </div>

        <span className="text-xs font-semibold text-cas-on-surface-variant">
          Đang hiển thị dữ liệu: <strong className="text-cas-primary">{getDisplayLabel()}</strong>
        </span>
      </div>

      {/* Bảng biểu diễn 7 giá trị chỉ số theo bộ lọc */}
      <div className="overflow-hidden rounded-2xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/20 bg-cas-surface-container/50 font-bold text-cas-on-surface">
            <tr>
              <th className="px-4 py-3">Chỉ số thống kê</th>
              <th className="px-4 py-3">Giá trị ({getDisplayLabel()})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cas-outline-variant/15 text-cas-on-surface">
            <tr className="transition hover:bg-cas-surface-container/30">
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">1. Doanh thu</td>
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                {currentMetrics.revenue}
              </td>
            </tr>
            <tr className="transition hover:bg-cas-surface-container/30">
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">2. Tổng đơn hàng</td>
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                {currentMetrics.orders}
              </td>
            </tr>
            <tr className="transition hover:bg-cas-surface-container/30">
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                3. Món hỏng / Bù tiền (is_remade)
              </td>
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                {currentMetrics.remade}
              </td>
            </tr>
            <tr className="transition hover:bg-cas-surface-container/30">
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">4. Bàn đang mở</td>
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                {currentMetrics.openTables}
              </td>
            </tr>
            <tr className="transition hover:bg-cas-surface-container/30">
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                5. Bàn chờ thanh toán
              </td>
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                {currentMetrics.pendingPayments}
              </td>
            </tr>
            <tr className="transition hover:bg-cas-surface-container/30">
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                6. Khoản chưa thanh toán
              </td>
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                {currentMetrics.unpaidRecords}
              </td>
            </tr>
            <tr className="transition hover:bg-cas-surface-container/30">
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                7. Yêu cầu hủy món
              </td>
              <td className="px-4 py-3 text-xs font-bold text-cas-on-surface">
                {currentMetrics.cancellations}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Nội dung chính 2 cột */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Cột trái (7 columns): Biểu đồ Doanh thu & Báo cáo Sự cố ca trực */}
        <div className="space-y-8 lg:col-span-7">
          {/* Biểu đồ doanh thu theo thời gian */}
          <div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs">
            <div className="flex flex-col gap-4 border-b border-cas-outline-variant/20 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-cas-on-surface">Doanh thu theo thời gian</h2>
              </div>
              <select
                aria-label="Khoảng thời gian biểu đồ doanh thu"
                className="cursor-pointer rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container px-3 py-1.5 text-xs font-bold text-cas-on-surface focus:outline-hidden"
                onChange={(event) =>
                  setRevenueChartPeriod(event.target.value as RevenueChartPeriod)
                }
                value={revenueChartPeriod}
              >
                {(Object.keys(revenueChartPeriodLabels) as RevenueChartPeriod[]).map((period) => (
                  <option key={period} value={period}>
                    {revenueChartPeriodLabels[period]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6">
              <svg
                aria-label={`Biểu đồ doanh thu ${revenueChartPeriodLabels[revenueChartPeriod].toLowerCase()}`}
                className="h-auto w-full overflow-visible"
                role="img"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              >
                <defs>
                  <linearGradient id="revenue-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--cas-primary)" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="var(--cas-primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = chartPadding.top + ratio * chartDrawableHeight;
                  const value = Math.round(chartMax * (1 - ratio));
                  return (
                    <g key={ratio}>
                      <line
                        x1={chartPadding.left}
                        x2={chartWidth - chartPadding.right}
                        y1={y}
                        y2={y}
                        className="stroke-cas-outline-variant/45"
                        strokeDasharray={ratio === 1 ? "0" : "4 4"}
                      />
                      <text
                        x={chartPadding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-cas-on-surface-variant text-[11px] font-medium"
                      >
                        {value}
                      </text>
                    </g>
                  );
                })}
                <polygon fill="url(#revenue-area)" points={areaPoints} />
                <polyline
                  fill="none"
                  points={linePoints}
                  className="stroke-cas-primary"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                />
                {chartPoints.map((point) => (
                  <g key={point.label} className="group">
                    <title>{`${point.label}: ${point.value} triệu đồng`}</title>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      className="fill-cas-surface stroke-cas-primary"
                      strokeWidth="2.5"
                    />
                    <text
                      x={point.x}
                      y={chartHeight - 14}
                      textAnchor="middle"
                      className="fill-cas-on-surface-variant text-[11px] font-bold"
                    >
                      {point.label}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="mt-3 flex items-center justify-between text-xs font-medium text-cas-on-surface-variant">
                <span>Đơn vị: triệu VNĐ</span>
                <span className="font-bold text-cas-primary">
                  {revenueChartPeriod === "today" ? "Doanh thu theo giờ" : "Xu hướng doanh thu"}
                </span>
              </div>
            </div>
          </div>

          {/* Báo cáo Sự cố ca trực mới nhất */}
          <div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <CasIcon className="size-5" name="info" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-cas-on-surface">
                    Báo cáo Sự cố ca trực mới nhất
                  </h2>
                  <p className="text-xs font-medium text-cas-on-surface-variant">
                    Sự cố phát sinh do nhân viên OPERATOR ghi nhận trong ca
                  </p>
                </div>
              </div>
              <Link
                href="/admin/incidents"
                className="text-xs font-extrabold text-cas-primary hover:underline"
              >
                Xem tất cả ➔
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {[
                {
                  id: 1,
                  author: "Nhân viên Nguyễn Văn A",
                  time: "17:35 hôm nay",
                  table: "Bàn 08",
                  title: "Khách chê Mỳ cay quá mặn, đã làm lại",
                  content: "Đã cho bếp nấu lại tô mới có cờ is_remade = TRUE, khách hài lòng.",
                  status: "Chưa duyệt",
                },
                {
                  id: 2,
                  author: "Nhân viên Trần Thị B",
                  time: "15:20 hôm nay",
                  table: "Bàn 03",
                  title: "Vỡ 1 ly nước ngọt khi bưng đồ",
                  content: "Ghi nhận hao hụt ly thủy tinh và bù 1 lon Coca mới cho khách.",
                  status: "Đã tiếp nhận",
                },
              ].map((incident) => (
                <div
                  key={incident.id}
                  className="rounded-2xl border border-cas-outline-variant/20 bg-cas-surface-container/50 p-4 transition hover:bg-cas-surface-container"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-lg bg-cas-primary/10 px-2 py-0.5 text-xs font-black text-cas-primary">
                        {incident.table}
                      </span>
                      <span className="text-xs font-extrabold text-cas-on-surface">
                        {incident.author}
                      </span>
                      <span className="text-[0.7rem] text-cas-on-surface-variant">
                        • {incident.time}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-black ${incident.status === "Chưa duyệt" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"}`}
                    >
                      {incident.status}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-black text-cas-on-surface">{incident.title}</h4>
                  <p className="mt-1 text-xs text-cas-on-surface-variant">{incident.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải (5 columns): Top Món bán chạy & Món tạm hết hàng */}
        <div className="space-y-8 lg:col-span-5">
          {/* Top món bán chạy trong ngày */}
          <div className="space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-cas-secondary/15 text-cas-secondary">
                  <CasIcon className="size-5" name="fire" />
                </span>
                <div>
                  <h2 className="text-base font-black text-cas-on-surface">
                    Top Món bán chạy Hôm nay
                  </h2>
                  <p className="text-xs font-medium text-cas-on-surface-variant">
                    Xếp hạng theo tổng số phần đã gọi
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  rank: 1,
                  name: "Cà phê sữa đá",
                  category: "Cà phê",
                  count: 68,
                  total: "2.380.000 đ",
                },
                {
                  rank: 2,
                  name: "Bạc xỉu Sài Gòn",
                  category: "Cà phê",
                  count: 45,
                  total: "1.800.000 đ",
                },
                {
                  rank: 3,
                  name: "Mỳ cay hải sản",
                  category: "Món ăn chính",
                  count: 32,
                  total: "2.240.000 đ",
                },
                {
                  rank: 4,
                  name: "Trà đào cam sả",
                  category: "Trà trái cây",
                  count: 29,
                  total: "1.305.000 đ",
                },
              ].map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between rounded-2xl border border-cas-outline-variant/15 bg-cas-surface-container/40 p-3 transition hover:bg-cas-surface-container/80"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-7 place-items-center rounded-xl text-xs font-black ${
                        item.rank === 1
                          ? "bg-amber-500 text-white shadow-xs"
                          : item.rank === 2
                            ? "bg-slate-300 text-slate-800"
                            : item.rank === 3
                              ? "bg-amber-700/30 text-amber-800 dark:text-amber-200"
                              : "bg-cas-outline-variant/30 text-cas-on-surface-variant"
                      }`}
                    >
                      #{item.rank}
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-cas-on-surface">{item.name}</h4>
                      <p className="text-[0.68rem] font-medium text-cas-on-surface-variant">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-cas-primary">{item.count} phần</span>
                    <p className="text-[0.68rem] font-semibold text-cas-on-surface-variant">
                      {item.total}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Món đang tạm hết hàng (SOLD_OUT) */}
          <div className="space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <CasIcon className="size-5" name="info" />
                </span>
                <div>
                  <h2 className="text-base font-black text-cas-on-surface">
                    Món đang tạm hết hàng
                  </h2>
                  <p className="text-xs font-medium text-cas-on-surface-variant">
                    Trạng thái SOLD_OUT trên thực đơn
                  </p>
                </div>
              </div>
              <Link
                href="/admin/catalog"
                className="text-xs font-extrabold text-cas-primary hover:underline"
              >
                Quản lý menu ➔
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: "Sinh tố Bơ sáp",
                  category: "Sinh tố",
                  price: "45.000 đ",
                  time: "Bật lúc 14:10",
                },
                {
                  name: "Bánh Tiramisu",
                  category: "Tráng miệng",
                  price: "38.000 đ",
                  time: "Bật lúc 16:30",
                },
              ].map((soldOutItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-lg bg-rose-500/15 px-2 py-0.5 text-[0.65rem] font-black uppercase text-rose-600 dark:text-rose-400">
                      SOLD OUT
                    </span>
                    <div>
                      <h4 className="text-xs font-black text-cas-on-surface">{soldOutItem.name}</h4>
                      <p className="text-[0.68rem] font-medium text-cas-on-surface-variant">
                        {soldOutItem.category} • {soldOutItem.price}
                      </p>
                    </div>
                  </div>
                  <span className="text-[0.68rem] font-semibold text-cas-on-surface-variant">
                    {soldOutItem.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

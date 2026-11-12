"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { AdminDateRangeFilter } from "../../../components/admin/admin-date-range-filter";
import { CasButton } from "../../../components/ui/cas-button";
import { CasRoundedButton } from "../../../components/ui/cas-rounded-button";
import { CompactPagination } from "../../../components/ui/compact-pagination";
import {
  adminDashboardFilterStorageKey,
  adminDashboardFilterUpdatedEvent,
  filterFromSearchParams,
  rangeFor,
  validateDateRange,
  type Period,
} from "../../../lib/admin/dashboard-filter";
import { formatMoney } from "../../../lib/format-money";
import {
  downloadAdminReports,
  loadAdminReport,
  type ReportFilter,
  type ReportRow,
  type ReportType,
} from "../../../lib/api/operation/admin-reports.api";

const reportTypes: { type: ReportType; title: string; headings: string[] }[] = [
  {
    type: "REVENUE",
    title: "Tổng hợp doanh thu",
    headings: [
      "Ngày thanh toán",
      "Số phiên đã thanh toán",
      "Doanh thu bán hàng",
      "Doanh thu dịch vụ",
      "Tổng doanh thu",
    ],
  },
  {
    type: "ORDERS",
    title: "Lịch sử order",
    headings: [
      "Thời điểm tạo",
      "Mã order",
      "Bàn / Mang về",
      "Khách mở phiên",
      "Tổng tiền gốc",
      "Số tiền order sau hủy",
    ],
  },
  {
    type: "REMADE",
    title: "Món làm lại",
    headings: [
      "Thời điểm xử lý",
      "Mã order",
      "Bàn / Mang về",
      "Tên món",
      "Số lượng làm lại",
      "Lý do",
      "Người xử lý",
    ],
  },
];

function date(value?: string) {
  if (!value) return "—";
  if (value.length === 10) return value.split("-").reverse().join("/");
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(parsed);
}

function destination(code?: number | null) {
  return code == null ? "Mang về" : "Bàn " + String(code).padStart(2, "0");
}

function cells(type: ReportType, row: ReportRow): (string | number)[] {
  if (type === "REVENUE")
    return [
      date(row.date),
      row.paidSessionCount ?? 0,
      formatMoney(row.salesRevenue ?? 0),
      formatMoney(row.serviceRevenue ?? 0),
      formatMoney(row.revenue ?? 0),
    ];
  if (type === "ORDERS")
    return [
      date(row.createdAt),
      row.orderNumber ?? "—",
      destination(row.tableCode),
      row.customerName ?? "—",
      formatMoney(row.originalAmount ?? 0),
      formatMoney(row.payableAmount ?? 0),
    ];
  return [
    date(row.resolvedAt),
    row.orderNumber ?? "—",
    destination(row.tableCode),
    row.itemName ?? "—",
    row.quantity ?? 0,
    row.reason || "—",
    row.resolvedByName || "—",
  ];
}

function ReportSection({
  filter,
  config,
}: {
  filter: ReportFilter;
  config: (typeof reportTypes)[number];
}) {
  const [page, setPage] = useState(0);
  const { data, error, isLoading } = useQuery({
    queryKey: ["admin", "reports", config.type, filter.from, filter.to, page],
    queryFn: () => loadAdminReport(filter, config.type, page),
  });
  return (
    <section className="space-y-3" aria-label={config.title}>
      <h2 className="text-lg font-extrabold text-cas-on-surface">{config.title}</h2>
      {error ? (
        <p role="alert" className="text-sm text-cas-error">
          {error.message}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-sm border border-cas-outline-variant/30 bg-cas-glass">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 font-extrabold text-cas-on-surface-variant">
            <tr>
              {config.headings.map((heading) => (
                <th className="px-5 py-4" key={heading}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-cas-outline-variant/15">
            {data?.items.map((item, index) => (
              <tr key={index}>
                {cells(config.type, item).map((value, column) => (
                  <td className="px-5 py-4" key={column}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading ? (
          <p className="p-5 text-sm text-cas-on-surface-variant">Đang tải báo cáo...</p>
        ) : null}
        {!isLoading && !error && data?.items.length === 0 ? (
          <p className="p-5 text-sm text-cas-on-surface-variant">Không có dữ liệu phù hợp.</p>
        ) : null}
      </div>
      {data ? (
        <div className="space-y-2">
          {page > 0 && page * data.size >= data.total ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="rounded-lg bg-cas-surface-container px-3 py-2 text-sm font-semibold text-cas-on-surface-variant">
                {data.total} kết quả
              </span>
              <CasButton
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.max(0, Math.ceil(data.total / data.size) - 1))}
              >
                Về trang còn dữ liệu
              </CasButton>
            </div>
          ) : (
            <CompactPagination
              onPageChange={setPage}
              page={data.page}
              size={data.size}
              total={data.total}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}

export default function AdminReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialFilter] = useState(() => filterFromSearchParams(searchParams));
  const [from, setFrom] = useState(initialFilter.from);
  const [to, setTo] = useState(initialFilter.to);
  const [period, setPeriod] = useState<Period>(initialFilter.period);
  const [type, setType] = useState<ReportType>(() => {
    const value = searchParams.get("type");
    return value === "REVENUE" || value === "ORDERS" || value === "REMADE" ? value : "REVENUE";
  });
  const [filter, setFilter] = useState<ReportFilter>(() => ({
    from: initialFilter.from,
    to: initialFilter.to,
    type: type,
  }));
  const [searchRevision, setSearchRevision] = useState(0);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");
  const [exporting, setExporting] = useState(false);
  const isDebouncing = filter.from !== from || filter.to !== to || filter.type !== type;

  useEffect(() => {
    if (rangeError) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    params.set("from", from);
    params.set("to", to);
    params.set("type", type);
    const dateParams = new URLSearchParams({ period, from, to });
    window.sessionStorage.setItem(adminDashboardFilterStorageKey, dateParams.toString());
    window.dispatchEvent(new Event(adminDashboardFilterUpdatedEvent));
    if (params.toString() !== searchParams.toString()) {
      router.replace(`/admin/reports?${params}`, { scroll: false });
    }
  }, [from, to, period, type, rangeError, router, searchParams]);

  useEffect(() => {
    if (rangeError) return;
    const timer = window.setTimeout(() => setFilter({ from, to, type }), 250);
    return () => window.clearTimeout(timer);
  }, [from, to, type, rangeError]);

  function selectPeriod(next: Period) {
    setRangeError(null);
    setPeriod(next);
    if (next === "custom") return;
    const range = rangeFor(next === "threeDays" ? 3 : next === "oneWeek" ? 7 : 30);
    setFrom(range.from);
    setTo(range.to);
  }

  function search(event: FormEvent) {
    event.preventDefault();
    if (rangeError) return;
    setExportError("");
    setFilter({ from, to, type });
    setSearchRevision((current) => current + 1);
  }

  async function exportReport() {
    if (rangeError || isDebouncing || exporting) return;
    setExporting(true);
    setExportError("");
    try {
      await downloadAdminReports(filter);
    } catch (cause) {
      setExportError(cause instanceof Error ? cause.message : "Không thể xuất báo cáo.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-cas-on-surface">Báo cáo</h1>
      <form
        className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-5"
        onSubmit={search}
      >
        <AdminDateRangeFilter
          period={period}
          from={from}
          to={to}
          onPeriodChange={selectPeriod}
          onFromChange={(value) => {
            const error = validateDateRange(value, to);
            setRangeError(error);
            if (error) return;
            setPeriod("custom");
            setFrom(value);
          }}
          onToChange={(value) => {
            const error = validateDateRange(from, value);
            setRangeError(error);
            if (error) return;
            setPeriod("custom");
            setTo(value);
          }}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-cas-outline-variant/20 pt-4">
          <label className="flex flex-wrap items-center gap-3 text-xs font-semibold text-cas-on-surface-variant">
            Loại báo cáo:
            <select
              aria-label="Loại báo cáo"
              className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface sm:w-auto"
              value={type}
              onChange={(event) => {
                setType(event.target.value as ReportType);
              }}
            >
              {reportTypes.map((report) => (
                <option key={report.type} value={report.type}>
                  {report.title}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <CasRoundedButton type="submit" size="sm" icon="search" className="flex-1">
              Tìm kiếm
            </CasRoundedButton>
            <CasRoundedButton
              type="button"
              size="sm"
              variant="outline-primary"
              icon="download"
              disabled={Boolean(rangeError) || isDebouncing || exporting}
              onClick={() => void exportReport()}
            >
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </CasRoundedButton>
          </div>
        </div>
        {rangeError || exportError ? (
          <p role="alert" className="mt-4 text-sm font-semibold text-cas-error">
            {rangeError ?? exportError}
          </p>
        ) : null}
      </form>
      {reportTypes
        .filter((report) => report.type === filter.type)
        .map((report) => (
          <ReportSection
            key={report.type + "-" + filter.from + "-" + filter.to + "-" + searchRevision}
            config={report}
            filter={filter}
          />
        ))}
    </div>
  );
}

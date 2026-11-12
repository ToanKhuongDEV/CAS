"use client";

import { formatMoney } from "../../../lib/format-money";
import { useEffect, useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { AdminDateRangeFilter } from "../../../components/admin/admin-date-range-filter";
import { CompactPagination } from "../../../components/ui/compact-pagination";
import { type CustomerPage, type CustomerSort } from "../../../lib/api/operation/admin-lookup.api";
import { rangeFor, validateDateRange, type Period } from "../../../lib/admin/dashboard-filter";
import {
  useAdminCustomerQuery,
  useAdminCustomersQuery,
} from "../../../lib/api/operation/operation.query";

const customerPageSize = 20;
const sessionStatusLabels: Record<string, string> = {
  CLOSED: "Đã đóng",
  OPEN: "Đang mở",
  PAYMENT_PENDING: "Chờ thanh toán",
};

const money = (value: number | null) => (value === null ? "—" : formatMoney(value));
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(value),
      )
    : "—";

export default function AdminCustomersPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [initialRange] = useState(() => rangeFor(7));
  const [from, setFrom] = useState(initialRange.from);
  const [to, setTo] = useState(initialRange.to);
  const [period, setPeriod] = useState<Period>("oneWeek");
  const [sort, setSort] = useState<CustomerSort>("RECENT");
  const rangeError = validateDateRange(from, to);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const emptyCustomerPage: CustomerPage = {
    items: [],
    page: 0,
    size: customerPageSize,
    total: 0,
  };
  const {
    data: customerPage = emptyCustomerPage,
    error: customersError,
    isLoading,
  } = useAdminCustomersQuery(page, debouncedQuery, customerPageSize, from, to, sort, !rangeError);
  const { data: detail, error: detailError } = useAdminCustomerQuery(selectedCustomerId);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  const error = customersError ?? detailError;
  const errorMessage = error instanceof Error ? error.message : null;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-cas-on-surface">Khách hàng</h1>
      </header>
      <div className="space-y-4 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface-container p-5">
        <p className="text-sm font-semibold text-cas-on-surface-variant">Ngày mở phiên</p>
        <AdminDateRangeFilter
          period={period}
          from={from}
          to={to}
          onPeriodChange={(next) => {
            setPeriod(next);
            setPage(0);
            if (next !== "custom") {
              const range = rangeFor(next === "threeDays" ? 3 : next === "oneWeek" ? 7 : 30);
              setFrom(range.from);
              setTo(range.to);
            }
          }}
          onFromChange={(value) => {
            setFrom(value);
            setPeriod("custom");
            setPage(0);
          }}
          onToChange={(value) => {
            setTo(value);
            setPeriod("custom");
            setPage(0);
          }}
        />
        {rangeError && (
          <p role="alert" className="text-sm text-cas-error">
            {rangeError}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="w-full max-w-xl rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo tên hoặc số điện thoại"
            type="search"
          />
          <label className="text-sm font-semibold text-cas-on-surface-variant">
            Sắp xếp
            <select
              aria-label="Sắp xếp khách hàng"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as CustomerSort);
                setPage(0);
              }}
              className="ml-2 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm text-cas-on-surface"
            >
              <option value="RECENT">Gần nhất</option>
              <option value="AMOUNT_DESC">Tổng tiền cao nhất</option>
              <option value="AMOUNT_ASC">Tổng tiền thấp nhất</option>
              <option value="SESSIONS_DESC">Mở phiên nhiều nhất</option>
              <option value="SESSIONS_ASC">Mở phiên ít nhất</option>
            </select>
          </label>
        </div>
      </div>
      <div className="space-y-6 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface-container p-5">
        {errorMessage ? <p className="text-sm font-bold text-cas-error">{errorMessage}</p> : null}
        <div className="overflow-x-auto rounded-sm border border-cas-outline-variant/30">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-cas-on-surface-variant">
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Số phiên</th>
                <th className="p-4">Tổng đã thanh toán</th>
                <th className="p-4">Gần nhất</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {customerPage.items.map((item) => (
                <tr key={item.id} className="border-t border-cas-outline-variant/20">
                  <td className="p-4 font-bold">{item.displayName}</td>
                  <td className="p-4">{item.maskedPhone ?? "Khách lẻ"}</td>
                  <td className="p-4">{item.sessionCount}</td>
                  <td className="p-4">{formatMoney(item.totalPaid)}</td>
                  <td className="p-4">{date(item.lastVisitedAt)}</td>
                  <td className="p-4">
                    <CasButton
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCustomerId(item.id)}
                    >
                      Xem chi tiết
                    </CasButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading ? (
            <p className="p-5 text-sm text-cas-on-surface-variant">Đang tải...</p>
          ) : customerPage.items.length === 0 ? (
            <p className="p-5 text-sm text-cas-on-surface-variant">Không có khách hàng phù hợp.</p>
          ) : null}
        </div>
        <CompactPagination
          onPageChange={setPage}
          page={customerPage.page}
          size={customerPage.size}
          total={customerPage.total}
        />
      </div>
      {detail ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cas-on-surface/60 p-4">
          <section className="mx-auto my-8 max-w-3xl rounded-sm bg-cas-surface p-6">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{detail.displayName}</h2>
                <p className="text-sm text-cas-on-surface-variant">{detail.phone ?? "Khách lẻ"}</p>
              </div>
              <CasButton size="sm" variant="outline" onClick={() => setSelectedCustomerId(null)}>
                Đóng
              </CasButton>
            </div>
            <div className="mt-5 overflow-x-auto rounded-sm border border-cas-outline-variant/50">
              <table className="w-full min-w-[44rem] text-left text-xs">
                <thead className="bg-cas-surface-container text-cas-on-surface">
                  <tr>
                    <th className="px-3 py-3 font-black">Phiên</th>
                    <th className="px-3 py-3 font-black">Trạng thái</th>
                    <th className="px-3 py-3 font-black">Mở phiên</th>
                    <th className="px-3 py-3 font-black">Lần gửi order</th>
                    <th className="px-3 py-3 font-black">Payment</th>
                    <th className="px-3 py-3 font-black">Chưa thanh toán</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cas-outline-variant/30">
                  {detail.sessions.map((session) => (
                    <tr className="text-cas-on-surface" key={session.publicId}>
                      <td className="px-3 py-3 font-bold">
                        {session.tableCode === null ? "Mang về" : `Bàn ${session.tableCode}`}
                      </td>
                      <td className="px-3 py-3">
                        <span className="rounded-sm bg-cas-primary-container px-2 py-1 font-bold text-cas-on-primary-container">
                          {sessionStatusLabels[session.status] ?? session.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-cas-on-surface-variant">
                        {date(session.openedAt)}
                      </td>
                      <td className="px-3 py-3 font-bold">
                        {session.orderCount === 0 ? "Chưa gọi món" : `${session.orderCount} lần`}
                      </td>
                      <td className="px-3 py-3">
                        {session.paymentStatus ?? "—"} · {money(session.paymentAmount)}
                      </td>
                      <td className="px-3 py-3">
                        {session.unpaidStatus ?? "—"} · {money(session.unpaidAmount)}
                      </td>
                    </tr>
                  ))}
                  {detail.sessions.length === 0 ? (
                    <tr>
                      <td className="px-3 py-5 text-center text-cas-on-surface-variant" colSpan={6}>
                        Chưa có lịch sử phiên bàn.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

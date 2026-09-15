"use client";

import { useEffect, useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import {
  loadCustomer,
  loadCustomers,
  type CustomerDetail,
  type CustomerSummary,
} from "../../../lib/api/operation/admin-lookup.api";

const money = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);
const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(value),
      )
    : "—";

export default function AdminCustomersPage() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CustomerSummary[]>([]);
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  async function refresh(nextQuery = query) {
    setLoading(true);
    try {
      setItems(await loadCustomers(nextQuery));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải khách hàng.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);
  async function open(id: number) {
    try {
      setDetail(await loadCustomer(id));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tải chi tiết khách hàng.");
    }
  }
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black text-cas-on-surface">Khách hàng</h1>
        <p className="text-xs text-cas-on-surface-variant">
          Tra cứu lịch sử sử dụng bàn trong phạm vi cửa hàng.
        </p>
      </header>
      <input
        className="w-full max-w-xl rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm theo tên hoặc số điện thoại"
        type="search"
      />
      {error ? <p className="text-sm font-bold text-cas-error">{error}</p> : null}
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-cas-on-surface-variant">
              <th className="p-4">Khách hàng</th>
              <th className="p-4">Số điện thoại</th>
              <th className="p-4">Lượt mở bàn</th>
              <th className="p-4">Gần nhất</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-cas-outline-variant/20">
                <td className="p-4 font-bold">{item.displayName}</td>
                <td className="p-4">{item.maskedPhone ?? "Khách lẻ"}</td>
                <td className="p-4">{item.sessionCount}</td>
                <td className="p-4">{date(item.lastVisitedAt)}</td>
                <td className="p-4">
                  <CasButton size="sm" variant="outline" onClick={() => void open(item.id)}>
                    Xem chi tiết
                  </CasButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading ? (
          <p className="p-5 text-sm text-cas-on-surface-variant">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="p-5 text-sm text-cas-on-surface-variant">Không có khách hàng phù hợp.</p>
        ) : null}
      </div>
      {detail ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cas-on-surface/60 p-4">
          <section className="mx-auto my-8 max-w-3xl rounded-3xl bg-cas-surface p-6">
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">{detail.displayName}</h2>
                <p className="text-sm text-cas-on-surface-variant">{detail.phone ?? "Khách lẻ"}</p>
              </div>
              <CasButton size="sm" variant="outline" onClick={() => setDetail(null)}>
                Đóng
              </CasButton>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th className="p-2">Phiên bàn</th>
                    <th className="p-2">Bàn</th>
                    <th className="p-2">Order</th>
                    <th className="p-2">Payment</th>
                    <th className="p-2">Chưa thanh toán</th>
                    <th className="p-2">Mở bàn</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.sessions.map((session) => (
                    <tr key={session.publicId} className="border-t border-cas-outline-variant/20">
                      <td className="p-2">{session.publicId}</td>
                      <td className="p-2">{session.tableCode}</td>
                      <td className="p-2">{session.orderCount}</td>
                      <td className="p-2">
                        {session.paymentStatus ?? "—"} · {money(session.paymentAmount)}
                      </td>
                      <td className="p-2">
                        {session.unpaidStatus ?? "—"} · {money(session.unpaidAmount)}
                      </td>
                      <td className="p-2">{date(session.openedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

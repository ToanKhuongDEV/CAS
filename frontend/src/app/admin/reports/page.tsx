"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";

const reportRows = [
  {
    id: "RP-0008",
    date: "08/08/2026",
    type: "Tổng hợp doanh thu",
    scope: "Toàn cửa hàng",
    status: "Sẵn sàng",
  },
  {
    id: "RP-0007",
    date: "07/08/2026",
    type: "Lịch sử order",
    scope: "Toàn cửa hàng",
    status: "Sẵn sàng",
  },
  {
    id: "RP-0006",
    date: "06/08/2026",
    type: "Món làm lại",
    scope: "is_remade = TRUE",
    status: "Sẵn sàng",
  },
];

export default function AdminReportsPage() {
  const [fromDate, setFromDate] = useState("2026-08-01");
  const [toDate, setToDate] = useState("2026-08-08");
  const [reportType, setReportType] = useState("ALL");
  const [notice, setNotice] = useState("");
  const exportReport = () =>
    setNotice(`Đã xếp hàng xuất Excel tạm thời cho dữ liệu từ ${fromDate} đến ${toDate}.`);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-cas-on-surface">Báo cáo</h1>
        <p className="text-xs text-cas-on-surface-variant">
          Lọc và xuất dữ liệu quản trị. Xuất Excel đang là thao tác UI tạm thời, chưa kết nối API.
        </p>
      </div>
      <section className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-bold text-cas-on-surface">
            Từ ngày
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2"
            />
          </label>
          <label className="text-xs font-bold text-cas-on-surface">
            Đến ngày
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2"
            />
          </label>
          <label className="text-xs font-bold text-cas-on-surface">
            Loại báo cáo
            <select
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className="mt-1.5 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2"
            >
              <option value="ALL">Tất cả</option>
              <option value="REVENUE">Tổng hợp doanh thu</option>
              <option value="ORDERS">Lịch sử order</option>
              <option value="REMADE">Món làm lại</option>
            </select>
          </label>
          <div className="flex items-end">
            <CasButton onClick={exportReport} icon="download" className="w-full">
              Xuất Excel
            </CasButton>
          </div>
        </div>
        {notice && (
          <p role="status" className="mt-4 text-xs font-bold text-cas-secondary">
            {notice}
          </p>
        )}
      </section>
      <section className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 font-extrabold uppercase text-cas-on-surface-variant">
            <tr>
              <th className="px-5 py-4">Mã</th>
              <th className="px-5 py-4">Ngày</th>
              <th className="px-5 py-4">Loại</th>
              <th className="px-5 py-4">Phạm vi</th>
              <th className="px-5 py-4">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cas-outline-variant/15">
            {reportRows
              .filter(
                (row) =>
                  reportType === "ALL" ||
                  (reportType === "REVENUE" && row.type === "Tổng hợp doanh thu") ||
                  (reportType === "ORDERS" && row.type === "Lịch sử order") ||
                  (reportType === "REMADE" && row.type === "Món làm lại"),
              )
              .map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-black text-cas-primary">{row.id}</td>
                  <td className="px-5 py-4">{row.date}</td>
                  <td className="px-5 py-4 font-bold">{row.type}</td>
                  <td className="px-5 py-4 text-cas-on-surface-variant">{row.scope}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-black text-emerald-600">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

const logs = [
  {
    id: 1,
    time: "17:42 08/08/2026",
    actor: "ADMIN Master",
    action: "XÁC NHẬN THANH TOÁN",
    target: "Payment P-9082 (Bàn 12)",
  },
  {
    id: 2,
    time: "17:15 08/08/2026",
    actor: "Nguyễn Văn A",
    action: "DUYỆT HỦY MÓN",
    target: "Request R-102 (Bàn 05)",
  },
  {
    id: 3,
    time: "16:50 08/08/2026",
    actor: "ADMIN Master",
    action: "CẬP NHẬT CATALOG",
    target: "Ốc Hương: SOLD_OUT",
  },
];
export default function AdminAuditLogsPage() {
  const [query, setQuery] = useState("");
  const visibleLogs = useMemo(
    () =>
      logs.filter((log) =>
        `${log.actor} ${log.action} ${log.target}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-cas-on-surface">Nhật ký Audit Logs</h1>
        <p className="text-xs text-cas-on-surface-variant">
          Tra cứu các thao tác quan trọng để quy trách nhiệm.
        </p>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm theo tài khoản, hành động hoặc đối tượng"
        className="w-full max-w-xl rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold"
      />
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 font-extrabold uppercase text-cas-on-surface-variant">
            <tr>
              <th className="px-5 py-4">Thời gian</th>
              <th className="px-5 py-4">Tài khoản</th>
              <th className="px-5 py-4">Hành động</th>
              <th className="px-5 py-4">Đối tượng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cas-outline-variant/15">
            {visibleLogs.map((log) => (
              <tr key={log.id}>
                <td className="px-5 py-4 text-cas-on-surface-variant">{log.time}</td>
                <td className="px-5 py-4 font-black">{log.actor}</td>
                <td className="px-5 py-4 font-black text-cas-primary">{log.action}</td>
                <td className="px-5 py-4 text-cas-on-surface-variant">{log.target}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="rounded-3xl border border-cas-secondary/30 p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cas-secondary">
          Định hướng phát triển
        </p>
        <h2 className="mt-2 text-lg font-black text-cas-on-surface">
          Các tính năng sẽ phát triển trong tương lai
        </h2>
        <ul className="mt-4 grid gap-3 text-sm text-cas-on-surface-variant md:grid-cols-3">
          <li className="rounded-2xl border border-cas-outline-variant/30 p-4">
            <p className="font-black text-cas-on-surface">Chăm sóc khách hàng qua Zalo</p>
            <p className="mt-1 text-xs">Kết nối CRM và các hoạt động hỗ trợ khách hàng.</p>
          </li>
          <li className="rounded-2xl border border-cas-outline-variant/30 p-4">
            <p className="font-black text-cas-on-surface">Tích hợp trò chơi</p>
            <p className="mt-1 text-xs">Bổ sung các trải nghiệm tương tác cho khách hàng.</p>
          </li>
          <li className="rounded-2xl border border-cas-outline-variant/30 p-4">
            <p className="font-black text-cas-on-surface">Tính năng AI</p>
            <p className="mt-1 text-xs">Mở rộng các tiện ích thông minh theo nhu cầu vận hành.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}

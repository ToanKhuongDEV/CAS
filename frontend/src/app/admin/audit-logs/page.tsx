"use client";

import { useEffect, useState } from "react";
import { loadAuditLogs, type AuditLogPage } from "../../../lib/api/operation/admin-lookup.api";

export default function AdminAuditLogsPage() {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AuditLogPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void loadAuditLogs({ query, action, entityType, page })
      .then((result) => {
        if (active) {
          setData(result);
          setError(null);
        }
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải audit log.");
      });
    return () => {
      active = false;
    };
  }, [action, entityType, page, query]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-black">Nhật ký Audit Logs</h1>
        <p className="text-xs text-cas-on-surface-variant">
          Tra cứu toàn bộ thao tác quan trọng trong cửa hàng.
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm md:col-span-1"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          placeholder="Tìm tài khoản, hành động hoặc đối tượng"
        />
        <input
          className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm"
          value={action}
          onChange={(event) => {
            setAction(event.target.value);
            setPage(0);
          }}
          placeholder="Lọc hành động, ví dụ: UPDATE"
        />
        <input
          className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-sm"
          value={entityType}
          onChange={(event) => {
            setEntityType(event.target.value);
            setPage(0);
          }}
          placeholder="Lọc đối tượng, ví dụ: PAYMENT"
        />
      </div>
      {error ? <p className="text-cas-error">{error}</p> : null}
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30">
        <table className="w-full text-left text-xs">
          <thead>
            <tr>
              <th className="p-4">Thời gian</th>
              <th className="p-4">Tài khoản</th>
              <th className="p-4">Hành động</th>
              <th className="p-4">Đối tượng</th>
              <th className="p-4">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((log) => (
              <tr key={log.id} className="border-t border-cas-outline-variant/20">
                <td className="p-4">{new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                <td className="p-4">{log.actorName}</td>
                <td className="p-4 font-bold text-cas-primary">{log.action}</td>
                <td className="p-4">
                  {log.entityType} · {log.entityName ?? log.entityId}
                </td>
                <td className="p-4">{log.description ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3">
        <button
          disabled={page === 0}
          onClick={() => setPage((current) => current - 1)}
          type="button"
        >
          ← Trước
        </button>
        <span className="text-sm">
          Trang {page + 1} / {data ? Math.max(1, Math.ceil(data.total / data.size)) : 1}
        </span>
        <button
          disabled={!data || (page + 1) * data.size >= data.total}
          onClick={() => setPage((current) => current + 1)}
          type="button"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadOperatorTables, type OperatorTable } from "../../lib/api/ordering/ordering.api";

const statusLabel: Record<NonNullable<OperatorTable["sessionStatus"]> | "EMPTY", string> = {
  EMPTY: "Trống",
  OPEN: "Đang hoạt động",
  PAYMENT_PENDING: "Chờ thanh toán",
};

function tone(status: OperatorTable["sessionStatus"]) {
  if (status === "OPEN") return "border-cas-secondary bg-cas-secondary-container/20";
  if (status === "PAYMENT_PENDING") return "border-cas-tertiary bg-cas-tertiary-container/25";
  return "border-dashed border-cas-outline-variant bg-cas-glass";
}

export function OperatorMiniTableMap() {
  const [tables, setTables] = useState<OperatorTable[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const value = await loadOperatorTables();
        if (active) {
          setTables(value);
          setError(null);
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Không thể tải sơ đồ bàn.");
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 10_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);
  const inUse = tables.filter((table) => table.sessionStatus !== null).length;
  return (
    <section
      aria-labelledby="table-overview-title"
      className="rounded-2xl border border-cas-outline-variant/20 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-extrabold" id="table-overview-title">
          Sơ đồ bàn mini
        </h2>
        <span className="text-xs font-extrabold text-cas-primary">
          {inUse}/{tables.length} đang dùng
        </span>
      </div>
      {error ? (
        <p className="mt-4 text-sm text-cas-error" role="alert">
          {error}
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-cas-outline-variant/25 bg-cas-surface p-4">
          {tables.map((table) => {
            const status = table.sessionStatus ?? "EMPTY";
            const content = (
              <div>
                <p className="font-extrabold">Bàn {String(table.tableCode).padStart(2, "0")}</p>
                <p
                  className={`mt-1 text-[0.68rem] font-bold ${status === "OPEN" ? "text-cas-secondary" : status === "PAYMENT_PENDING" ? "text-cas-tertiary" : "text-cas-on-surface-variant"}`}
                >
                  {statusLabel[status]}
                </p>
              </div>
            );
            return (
              <li key={table.tableId}>
                {table.sessionPublicId ? (
                  <Link
                    aria-label={`Mở thao tác cho bàn ${table.tableCode}`}
                    className={`grid min-h-20 place-items-center rounded-xl border-2 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${tone(table.sessionStatus)}`}
                    href={`/operator/orders/new?table=${table.tableCode}`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    className={`grid min-h-20 place-items-center rounded-xl border-2 p-3 text-center ${tone(null)}`}
                  >
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {!error && tables.length === 0 && (
        <p className="mt-4 text-sm text-cas-on-surface-variant">Chưa có bàn nào.</p>
      )}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.68rem] text-cas-on-surface-variant">
        <span>○ Trống</span>
        <span className="text-cas-secondary">● Đang hoạt động</span>
        <span className="text-cas-tertiary">● Chờ thanh toán</span>
      </div>
    </section>
  );
}

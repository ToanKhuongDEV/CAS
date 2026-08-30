"use client";

import { useEffect, useState } from "react";

import { loadLongWaitTables, type LongWaitTable } from "../../lib/api/ordering/preparation.api";
import { CasIcon } from "../ui/cas-icon";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

export function OperatorLongWaitTableAlerts() {
  const [tables, setTables] = useState<LongWaitTable[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await loadLongWaitTables();
        if (active) {
          setTables(response);
          setError(null);
        }
      } catch (cause) {
        if (active)
          setError(cause instanceof Error ? cause.message : "Không thể tải cảnh báo bàn chờ lâu.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const threshold = tables[0]?.thresholdMinutes;
  return (
    <section
      className="rounded-2xl border border-cas-primary/25 bg-cas-primary/5 p-5"
      aria-labelledby="waiting-table-alerts-title"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
          <CasIcon className="size-5" name="clock" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-cas-primary" id="waiting-table-alerts-title">
            Cảnh báo bàn chờ lâu
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-cas-on-surface-variant">
            Thời gian được tính từ order cũ nhất còn món chưa hoàn thành.
            {threshold !== undefined ? (
              <>
                {" "}
                Ngưỡng cảnh báo hiện tại: <strong>{threshold} phút</strong>.
              </>
            ) : null}
          </p>
        </div>
      </div>
      {isLoading ? (
        <p className="mt-4 text-sm text-cas-on-surface-variant">Đang tải cảnh báo…</p>
      ) : error ? (
        <p className="mt-4 text-sm text-cas-error" role="alert">
          {error}
        </p>
      ) : tables.length === 0 ? (
        <p className="mt-4 rounded-xl border border-cas-outline-variant/25 bg-cas-glass p-4 text-sm text-cas-on-surface-variant">
          Hiện không có bàn chờ lâu.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {tables.map((table) => (
            <li
              className="grid gap-3 rounded-xl border border-cas-primary/15 bg-cas-glass p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
              key={table.tableId}
            >
              <div>
                <p className="font-extrabold">Bàn {String(table.tableCode).padStart(2, "0")}</p>
                <p className="mt-1 text-xs text-cas-on-surface-variant">
                  Chờ món từ {formatTime(table.oldestPendingOrderCreatedAt)}
                </p>
              </div>
              <span className="w-fit rounded-full bg-cas-primary px-3 py-1.5 text-xs font-extrabold text-cas-on-primary">
                Đã chờ {table.waitingMinutes} phút
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

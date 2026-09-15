"use client";

import { useEffect, useState } from "react";
import {
  loadOperatorBill,
  loadOperatorTables,
  type CustomerBill,
  type OperatorTable,
} from "../../lib/api/ordering/ordering.api";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";

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
  const [selectedTable, setSelectedTable] = useState<OperatorTable | null>(null);
  const [bill, setBill] = useState<CustomerBill | null>(null);
  const [billError, setBillError] = useState<string | null>(null);
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

  async function openTable(table: OperatorTable) {
    if (!table.sessionPublicId) return;
    setSelectedTable(table);
    setBill(null);
    setBillError(null);
    try {
      setBill(await loadOperatorBill(table.sessionPublicId));
    } catch (cause) {
      setBillError(cause instanceof Error ? cause.message : "Không thể tải các món đã gọi.");
    }
  }

  function closeTableDialog() {
    setSelectedTable(null);
    setBill(null);
    setBillError(null);
  }
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
                  <button
                    aria-label={`Mở thao tác cho bàn ${table.tableCode}`}
                    className={`grid min-h-20 w-full place-items-center rounded-xl border-2 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${tone(table.sessionStatus)}`}
                    onClick={() => void openTable(table)}
                    type="button"
                  >
                    {content}
                  </button>
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
      {selectedTable ? (
        <div className="fixed inset-0 z-100 overflow-y-auto bg-cas-on-surface/60 p-4 backdrop-blur-sm">
          <section
            aria-labelledby="operator-table-detail-title"
            aria-modal="true"
            className="mx-auto my-6 w-full max-w-xl rounded-[1.6rem] bg-cas-surface p-5 shadow-2xl sm:p-6"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
                  Bàn {String(selectedTable.tableCode).padStart(2, "0")}
                </p>
                <h2 className="mt-1 text-xl font-extrabold" id="operator-table-detail-title">
                  Món đã gọi
                </h2>
              </div>
              <button
                aria-label="Đóng chi tiết bàn"
                className="rounded-lg p-2 text-cas-on-surface-variant hover:bg-cas-surface-container hover:text-cas-primary"
                onClick={closeTableDialog}
                type="button"
              >
                <CasIcon className="size-5" name="close" />
              </button>
            </div>
            {billError ? <p className="mt-5 text-sm text-cas-error">{billError}</p> : null}
            {!bill && !billError ? (
              <p className="mt-5 text-sm text-cas-on-surface-variant">Đang tải món đã gọi...</p>
            ) : null}
            {bill ? (
              <>
                <ul className="mt-5 divide-y divide-cas-outline-variant/35">
                  {bill.orders
                    .flatMap((order) => order.items)
                    .map((item) => (
                      <li
                        className="flex items-start justify-between gap-4 py-3"
                        key={item.orderItemId}
                      >
                        <div>
                          <p className="text-sm font-extrabold">
                            {item.quantity}× {item.itemName}
                          </p>
                          {item.options.map((option) => (
                            <p
                              className="mt-1 text-xs text-cas-on-surface-variant"
                              key={option.optionName}
                            >
                              + {option.optionName}
                            </p>
                          ))}
                        </div>
                        <strong className="shrink-0 text-sm text-cas-primary">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(item.totalAmount)}
                        </strong>
                      </li>
                    ))}
                </ul>
                <div className="mt-4 flex items-center justify-between border-t border-cas-outline-variant/35 pt-4">
                  <span className="text-sm font-bold text-cas-on-surface-variant">
                    Tổng tạm tính
                  </span>
                  <strong className="text-lg text-cas-primary">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                      bill.payableAmount,
                    )}
                  </strong>
                </div>
              </>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              {selectedTable.sessionStatus === "OPEN" ? (
                <>
                  <CasButton
                    href={`/operator/orders/new?table=${selectedTable.tableCode}`}
                    variant="outline"
                  >
                    <CasIcon className="size-4" name="plus" /> Gọi thêm món hộ
                  </CasButton>
                  <CasButton href="/operator/payments">
                    <CasIcon className="size-4" name="payment" /> Kiểm soát thanh toán
                  </CasButton>
                </>
              ) : (
                <CasButton href="/operator/payments">
                  <CasIcon className="size-4" name="check" /> Xác nhận thanh toán
                </CasButton>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

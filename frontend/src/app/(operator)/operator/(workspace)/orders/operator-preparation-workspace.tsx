"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import {
  completePreparationBatch,
  loadPreparationGroups,
  type PreparationGroup,
} from "../../../../../lib/api/ordering/preparation.api";
import { CasIcon } from "../../../../../components/ui/cas-icon";

type ActionFeedback = { message: string; tone: "error" | "success" };

type TablePreparationGroup = {
  items: {
    id: string;
    itemName: string;
    optionSummary: string;
    remainingQuantity: number;
    requestedAt: string;
  }[];
  table: string;
  totalRemainingQuantity: number;
};

function optionSummary(group: PreparationGroup) {
  return group.options.length === 0
    ? "Không có option"
    : group.options
        .map((option) =>
          option.quantityPerItem > 1
            ? `${option.groupName}: ${option.optionName} ×${option.quantityPerItem}`
            : `${option.groupName}: ${option.optionName}`,
        )
        .join(" · ");
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

function buildTablePreparationGroups(groups: PreparationGroup[]): TablePreparationGroup[] {
  const byTable = new Map<string, TablePreparationGroup>();
  groups.forEach((group) => {
    group.allocations.forEach((allocation) => {
      const table = `Bàn ${String(allocation.tableCode).padStart(2, "0")}`;
      const current = byTable.get(table) ?? { items: [], table, totalRemainingQuantity: 0 };
      current.items.push({
        id: `${group.groupKey}-${allocation.orderItemId}`,
        itemName: group.itemName,
        optionSummary: optionSummary(group),
        remainingQuantity: allocation.remainingQuantity,
        requestedAt: formatTime(allocation.orderCreatedAt),
      });
      current.totalRemainingQuantity += allocation.remainingQuantity;
      byTable.set(table, current);
    });
  });
  return [...byTable.values()].sort((first, second) =>
    first.table.localeCompare(second.table, "vi"),
  );
}

export function OperatorPreparationWorkspace() {
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [groups, setGroups] = useState<PreparationGroup[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submittingGroupKey, setSubmittingGroupKey] = useState<string | null>(null);

  async function refreshGroups() {
    setIsLoading(true);
    try {
      setGroups(await loadPreparationGroups());
    } catch (error) {
      setFeedback({
        message:
          error instanceof Error ? error.message : "Không thể tải danh sách món cần chế biến.",
        tone: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshGroups();
  }, []);

  const totalRemainingQuantity = groups.reduce(
    (total, group) => total + group.remainingQuantity,
    0,
  );
  const tableGroups = buildTablePreparationGroups(groups);

  async function handlePreparedQuantitySubmit(event: FormEvent<HTMLFormElement>, groupKey: string) {
    event.preventDefault();
    const group = groups.find((item) => item.groupKey === groupKey);
    const quantity = Number(inputValues[groupKey]);
    if (
      !group ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > group.remainingQuantity
    ) {
      setFeedback({
        message: `Vui lòng nhập số phần từ 1 đến ${group?.remainingQuantity ?? 1}.`,
        tone: "error",
      });
      return;
    }

    setSubmittingGroupKey(groupKey);
    try {
      const completion = await completePreparationBatch(groupKey, {
        idempotencyKey: crypto.randomUUID(),
        quantity,
      });
      setInputValues((values) => ({ ...values, [groupKey]: "" }));
      setFeedback({
        message: `Đã ghi nhận ${completion.requestedQuantity} phần ${group.itemName} hoàn thành.`,
        tone: "success",
      });
      await refreshGroups();
    } catch (error) {
      setFeedback({
        message: error instanceof Error ? error.message : "Không thể ghi nhận hoàn thành món.",
        tone: "error",
      });
    } finally {
      setSubmittingGroupKey(null);
    }
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Đơn gọi món</h1>
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-cas-primary px-4 py-3 text-xs font-extrabold text-cas-on-primary shadow-md transition hover:bg-cas-primary-hover sm:text-sm"
            href="/operator/orders/new"
          >
            <CasIcon className="size-4" name="plus" />
            Tạo order hộ
          </Link>
          <div className="rounded-xl border border-cas-outline-variant/25 bg-cas-glass px-4 py-2.5 text-right">
            <p className="text-xs font-bold text-cas-on-surface-variant">Tổng còn cần làm</p>
            <p className="mt-0.5 text-lg font-extrabold text-cas-primary">
              {totalRemainingQuantity} phần
            </p>
          </div>
        </div>
      </header>

      {feedback && (
        <p
          className={`mt-5 rounded-xl border p-4 text-sm font-bold ${feedback.tone === "success" ? "border-cas-secondary/25 bg-cas-secondary-container/20 text-cas-secondary" : "border-cas-error/25 bg-cas-error-container/20 text-cas-on-error-container"}`}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </p>
      )}

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-2">
        <section aria-labelledby="preparation-groups-title">
          <h2 className="text-lg font-extrabold" id="preparation-groups-title">
            Tổng hợp theo món
          </h2>
          <p className="mt-1 text-xs text-cas-on-surface-variant">
            Các món cùng cấu hình được gộp thành một nhóm.
          </p>
          {isLoading ? (
            <p className="mt-4 text-sm text-cas-on-surface-variant">Đang tải món cần chế biến…</p>
          ) : groups.length === 0 ? (
            <EmptyPreparation />
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-cas-outline-variant/30 bg-cas-glass">
              {groups.map((group, index) => (
                <details
                  className="group border-b border-cas-outline-variant/25 last:border-b-0"
                  key={group.groupKey}
                  open={index === 0}
                >
                  <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 px-4 py-3.5 hover:bg-cas-primary/5 [&::-webkit-details-marker]:hidden">
                    <span className="text-lg font-bold text-cas-on-surface-variant group-open:rotate-90">
                      ›
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-extrabold">{group.itemName}</h3>
                      <p className="mt-0.5 truncate text-xs text-cas-on-surface-variant">
                        {optionSummary(group)} · {group.allocations.length} bàn
                      </p>
                    </div>
                    <span className="rounded-lg bg-cas-primary/8 px-2.5 py-1 text-xs font-extrabold text-cas-primary">
                      {group.remainingQuantity} phần
                    </span>
                  </summary>
                  <div className="border-t border-cas-outline-variant/20 bg-cas-surface-container/35 px-4 py-3 sm:pl-14">
                    <ol className="border-l-2 border-cas-outline-variant/35">
                      {group.allocations.map((allocation) => (
                        <li
                          className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-cas-outline-variant/20 py-3 pr-1 pl-5 last:border-b-0"
                          key={allocation.orderItemId}
                        >
                          <div>
                            <p className="text-sm font-extrabold">
                              Bàn {String(allocation.tableCode).padStart(2, "0")}
                            </p>
                            <p className="mt-0.5 text-xs text-cas-on-surface-variant">
                              Gửi lúc {formatTime(allocation.orderCreatedAt)}
                            </p>
                          </div>
                          <p className="text-sm font-extrabold text-cas-primary">
                            {allocation.remainingQuantity} phần
                          </p>
                        </li>
                      ))}
                    </ol>
                    <form
                      className="mt-3 flex flex-wrap items-end gap-2 border-t border-cas-outline-variant/25 pt-3"
                      onSubmit={(event) => void handlePreparedQuantitySubmit(event, group.groupKey)}
                    >
                      <label className="min-w-40 flex-1" htmlFor={`prepared-${group.groupKey}`}>
                        <span className="text-xs font-bold text-cas-on-surface-variant">
                          Số phần vừa làm xong
                        </span>
                        <input
                          className="mt-1.5 h-10 w-full rounded-lg border border-cas-outline-variant/45 bg-cas-glass px-3 text-sm outline-none focus:border-cas-primary"
                          disabled={submittingGroupKey === group.groupKey}
                          id={`prepared-${group.groupKey}`}
                          max={group.remainingQuantity}
                          min="1"
                          onChange={(event) =>
                            setInputValues((values) => ({
                              ...values,
                              [group.groupKey]: event.target.value,
                            }))
                          }
                          required
                          step="1"
                          type="number"
                          value={inputValues[group.groupKey] ?? ""}
                        />
                      </label>
                      <button
                        className="h-10 rounded-lg bg-cas-primary px-3.5 text-sm font-extrabold text-cas-on-primary disabled:opacity-60"
                        disabled={submittingGroupKey === group.groupKey}
                        type="submit"
                      >
                        {submittingGroupKey === group.groupKey
                          ? "Đang lưu…"
                          : "Xác nhận hoàn thành"}
                      </button>
                    </form>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="table-preparation-title">
          <h2 className="text-lg font-extrabold" id="table-preparation-title">
            Món theo bàn
          </h2>
          <p className="mt-1 text-xs text-cas-on-surface-variant">
            Xem các món còn cần làm của từng bàn.
          </p>
          {tableGroups.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-xl border border-cas-outline-variant/30 bg-cas-glass">
              {tableGroups.map((table) => (
                <div
                  className="border-b border-cas-outline-variant/25 p-4 last:border-b-0"
                  key={table.table}
                >
                  <div className="flex justify-between">
                    <h3 className="font-extrabold">{table.table}</h3>
                    <span className="text-sm font-extrabold text-cas-primary">
                      {table.totalRemainingQuantity} phần
                    </span>
                  </div>
                  {table.items.map((item) => (
                    <p className="mt-2 text-xs text-cas-on-surface-variant" key={item.id}>
                      {item.itemName} · {item.optionSummary} · {item.remainingQuantity} phần · Gửi
                      lúc {item.requestedAt}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-dashed border-cas-outline-variant/50 p-6 text-center text-sm text-cas-on-surface-variant">
              Không còn bàn nào đang chờ món.
            </p>
          )}
        </section>
      </div>
    </>
  );
}

function EmptyPreparation() {
  return (
    <div className="mt-4 grid min-h-64 place-items-center rounded-xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-8 text-center">
      <div>
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-cas-secondary-container/30 text-cas-secondary">
          <CasIcon className="size-6" name="check" />
        </span>
        <h3 className="mt-4 text-lg font-extrabold">Đã hoàn thành tất cả món</h3>
        <p className="mt-1 text-sm text-cas-on-surface-variant">
          Hiện không còn món nào đang chờ chế biến.
        </p>
      </div>
    </div>
  );
}

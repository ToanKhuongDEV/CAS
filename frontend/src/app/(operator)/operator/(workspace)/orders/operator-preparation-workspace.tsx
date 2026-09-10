"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import {
  completePreparationBatch,
  completePreparationTable,
  loadPreparationGroups,
  type PreparationGroup,
} from "../../../../../lib/api/ordering/preparation.api";
import { CasIcon } from "../../../../../components/ui/cas-icon";
import { useToast } from "../../../../../components/ui/toast-provider";

type TablePreparationItem = {
  id: string;
  itemName: string;
  optionSummary: string | null;
  remainingQuantity: number;
  requestedAt: string;
};

type TablePreparationGroup = {
  items: TablePreparationItem[];
  table: string;
  tableCode: number;
  totalRemainingQuantity: number;
};

function optionSummary(group: PreparationGroup) {
  return group.options.length === 0
    ? null
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
      const current = byTable.get(table) ?? {
        items: [],
        table,
        tableCode: allocation.tableCode,
        totalRemainingQuantity: 0,
      };
      current.items.push({
        id: `${group.groupKey}-${allocation.orderItemId}`,
        itemName: group.itemName,
        optionSummary: optionSummary(group),
        remainingQuantity: allocation.remainingQuantity,
        requestedAt: allocation.orderCreatedAt,
      });
      current.totalRemainingQuantity += allocation.remainingQuantity;
      byTable.set(table, current);
    });
  });
  return [...byTable.values()]
    .map((table) => ({
      ...table,
      items: [...table.items].sort(
        (first, second) => Date.parse(first.requestedAt) - Date.parse(second.requestedAt),
      ),
    }))
    .sort(
      (first, second) =>
        Date.parse(first.items[0].requestedAt) - Date.parse(second.items[0].requestedAt),
    );
}

function groupTableItemsByRequestedAt(items: TablePreparationItem[]) {
  const groups = new Map<string, TablePreparationItem[]>();
  items.forEach((item) => {
    const current = groups.get(item.requestedAt) ?? [];
    current.push(item);
    groups.set(item.requestedAt, current);
  });
  return [...groups.entries()]
    .sort(([firstRequestedAt], [secondRequestedAt]) =>
      firstRequestedAt.localeCompare(secondRequestedAt),
    )
    .map(([requestedAt, groupedItems]) => ({
      items: groupedItems,
      requestedAt,
    }));
}

export function OperatorPreparationWorkspace() {
  const { showToast } = useToast();
  const [groups, setGroups] = useState<PreparationGroup[]>([]);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submittingGroupKey, setSubmittingGroupKey] = useState<string | null>(null);
  const [submittingTableCode, setSubmittingTableCode] = useState<number | null>(null);

  async function refreshGroups(showError = true) {
    setIsLoading(true);
    try {
      setGroups(await loadPreparationGroups());
    } catch (error) {
      if (!showError) return;
      showToast({
        message:
          error instanceof Error ? error.message : "Không thể tải danh sách món cần chế biến.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshGroups();
    const timer = window.setInterval(() => void refreshGroups(false), 10_000);
    return () => window.clearInterval(timer);
  }, [showToast]);

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
      showToast({
        message: `Vui lòng nhập số phần từ 1 đến ${group?.remainingQuantity ?? 1}.`,
        type: "error",
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
      showToast({
        message: `Đã ghi nhận ${completion.requestedQuantity} phần ${group.itemName} hoàn thành.`,
        type: "success",
      });
      await refreshGroups();
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể ghi nhận hoàn thành món.",
        type: "error",
      });
    } finally {
      setSubmittingGroupKey(null);
    }
  }

  async function handleCompleteTable(table: TablePreparationGroup) {
    setSubmittingTableCode(table.tableCode);
    try {
      const completion = await completePreparationTable(table.tableCode, crypto.randomUUID());
      showToast({
        message: `Đã hoàn thành ${completion.completedQuantity} phần của ${table.table}.`,
        type: "success",
      });
      await refreshGroups();
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể hoàn thành món của bàn.",
        type: "error",
      });
    } finally {
      setSubmittingTableCode(null);
    }
  }

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Đơn gọi món</h1>
        <div className="flex items-center gap-3">
          <Link
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-cas-primary px-4 text-xs font-extrabold text-cas-on-primary shadow-md transition hover:bg-cas-primary-hover sm:text-sm"
            href="/operator/orders/new"
          >
            <CasIcon className="size-4" name="plus" />
            Tạo order hộ
          </Link>
          <div className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-cas-outline-variant/25 bg-cas-glass px-4">
            <span className="whitespace-nowrap text-xs font-bold text-cas-on-surface-variant">
              Tổng còn cần làm:
            </span>
            <strong className="whitespace-nowrap text-sm font-extrabold text-cas-primary">
              {totalRemainingQuantity} phần
            </strong>
          </div>
        </div>
      </header>

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
                        {optionSummary(group) && `${optionSummary(group)} · `}
                        {group.allocations.length} bàn
                      </p>
                    </div>
                    <span className="px-2.5 py-1 text-sm font-extrabold text-cas-on-surface">
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold" id="table-preparation-title">
                Món theo bàn
              </h2>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                Theo dõi phần còn chờ theo từng bàn để ưu tiên phục vụ đúng lượt.
              </p>
            </div>
            {tableGroups.length > 0 && (
              <p className="rounded-lg bg-cas-secondary-container/25 px-3 py-1.5 text-xs font-extrabold text-cas-secondary">
                {tableGroups.length} bàn đang chờ
              </p>
            )}
          </div>
          {tableGroups.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 items-start gap-3">
              {[0, 1].map((columnIndex) => (
                <div className="space-y-3" key={columnIndex}>
                  {tableGroups
                    .filter((_, index) => index % 2 === columnIndex)
                    .map((table) => (
                      <article
                        className="block w-full overflow-hidden bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]"
                        key={table.table}
                      >
                        <header className="flex items-center justify-between gap-3 border-b border-cas-outline-variant/20 bg-cas-surface-container/45 px-4 py-3">
                          <div className="min-w-0">
                            <div>
                              <h3 className="font-extrabold">{table.table}</h3>
                              <p className="text-xs text-cas-on-surface-variant">
                                {table.items.length} món đang chờ
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className="px-2.5 py-1 text-sm font-extrabold text-cas-on-surface">
                              {table.totalRemainingQuantity} phần
                            </span>
                            <button
                              aria-label={`Hoàn thành toàn bộ món của ${table.table}`}
                              className="grid size-8 place-items-center rounded-lg text-cas-secondary transition hover:bg-cas-secondary-container/40 disabled:opacity-60"
                              disabled={submittingTableCode === table.tableCode}
                              onClick={() => void handleCompleteTable(table)}
                              type="button"
                            >
                              <CasIcon className="size-5" name="check" />
                            </button>
                          </div>
                        </header>
                        <div className="px-4" aria-label={`Món chờ tại ${table.table}`} role="list">
                          {groupTableItemsByRequestedAt(table.items).map((timeGroup, index) => (
                            <section
                              className={
                                index === 0 ? "" : "border-t border-cas-outline-variant/20"
                              }
                              key={timeGroup.requestedAt}
                            >
                              <div className="flex items-center gap-2 py-3 text-xs font-bold text-cas-on-surface-variant">
                                <span className="h-px min-w-3 flex-1 bg-cas-outline-variant/40" />
                                <CasIcon className="size-3.5" name="clock" />
                                <span>Gửi lúc {formatTime(timeGroup.requestedAt)}</span>
                                <span className="h-px min-w-3 flex-1 bg-cas-outline-variant/40" />
                              </div>
                              <ul className="pb-3" role="list">
                                {timeGroup.items.map((item) => (
                                  <li className="py-2 first:pt-0 last:pb-0" key={item.id}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold">
                                          {item.itemName}
                                        </p>
                                        {item.optionSummary && (
                                          <p className="mt-1 text-xs leading-5 text-cas-on-surface-variant">
                                            {item.optionSummary}
                                          </p>
                                        )}
                                      </div>
                                      <span className="shrink-0 rounded-lg bg-cas-secondary-container/25 px-2 py-1 text-xs font-extrabold text-cas-secondary">
                                        ×{item.remainingQuantity}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </section>
                          ))}
                        </div>
                      </article>
                    ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 grid min-h-52 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-6 text-center">
              <div>
                <span className="mx-auto grid size-11 place-items-center rounded-full bg-cas-secondary-container/30 text-cas-secondary">
                  <CasIcon className="size-5" name="check" />
                </span>
                <p className="mt-3 text-sm font-extrabold">Không còn bàn nào đang chờ món</p>
                <p className="mt-1 text-xs text-cas-on-surface-variant">
                  Các món mới gửi sẽ xuất hiện ở đây theo từng bàn.
                </p>
              </div>
            </div>
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

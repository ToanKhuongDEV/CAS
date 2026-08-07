"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { CasIcon } from "../../../../../components/ui/cas-icon";

type PreparationAllocation = {
  id: string;
  orderNumber: string;
  remainingQuantity: number;
  requestedAt: string;
  table: string;
};

type PreparationGroup = {
  allocations: PreparationAllocation[];
  id: string;
  itemName: string;
  optionSummary: string;
  remainingQuantity: number;
};

type ActionFeedback = {
  message: string;
  tone: "error" | "success";
};

type TablePreparationItem = {
  id: string;
  itemName: string;
  optionSummary: string;
  orderNumber: string;
  remainingQuantity: number;
  requestedAt: string;
};

type TablePreparationGroup = {
  items: TablePreparationItem[];
  table: string;
  totalRemainingQuantity: number;
};

const initialPreparationGroups: PreparationGroup[] = [
  {
    allocations: [
      {
        id: "ord-0819-beef",
        orderNumber: "ORD-0819",
        remainingQuantity: 4,
        requestedAt: "18:55",
        table: "Bàn 03",
      },
      {
        id: "ord-0821-beef",
        orderNumber: "ORD-0821",
        remainingQuantity: 8,
        requestedAt: "19:05",
        table: "Bàn 05",
      },
      {
        id: "ord-0824-beef",
        orderNumber: "ORD-0824",
        remainingQuantity: 7,
        requestedAt: "19:11",
        table: "Bàn 12",
      },
    ],
    id: "beef-medium",
    itemName: "Bò sốt tiêu đen",
    optionSummary: "Chín vừa",
    remainingQuantity: 19,
  },
  {
    allocations: [
      {
        id: "ord-0820-chicken",
        orderNumber: "ORD-0820",
        remainingQuantity: 2,
        requestedAt: "19:00",
        table: "Bàn 01",
      },
      {
        id: "ord-0825-chicken",
        orderNumber: "ORD-0825",
        remainingQuantity: 3,
        requestedAt: "19:16",
        table: "Bàn 08",
      },
    ],
    id: "chicken-not-spicy",
    itemName: "Gà chiên mắm",
    optionSummary: "Không cay",
    remainingQuantity: 5,
  },
  {
    allocations: [
      {
        id: "ord-0822-noodle",
        orderNumber: "ORD-0822",
        remainingQuantity: 3,
        requestedAt: "19:07",
        table: "Bàn 06",
      },
      {
        id: "ord-0826-noodle",
        orderNumber: "ORD-0826",
        remainingQuantity: 5,
        requestedAt: "19:17",
        table: "Bàn 03",
      },
    ],
    id: "seafood-noodle-level-3",
    itemName: "Mỳ cay hải sản",
    optionSummary: "Cấp 3 · Không topping",
    remainingQuantity: 8,
  },
];

function buildTablePreparationGroups(
  preparationGroups: PreparationGroup[],
): TablePreparationGroup[] {
  const groupsByTable = new Map<string, TablePreparationGroup>();

  preparationGroups.forEach((group) => {
    group.allocations.forEach((allocation) => {
      const tableGroup = groupsByTable.get(allocation.table) ?? {
        items: [],
        table: allocation.table,
        totalRemainingQuantity: 0,
      };

      tableGroup.items.push({
        id: `${allocation.id}-table`,
        itemName: group.itemName,
        optionSummary: group.optionSummary,
        orderNumber: allocation.orderNumber,
        remainingQuantity: allocation.remainingQuantity,
        requestedAt: allocation.requestedAt,
      });
      tableGroup.totalRemainingQuantity += allocation.remainingQuantity;
      groupsByTable.set(allocation.table, tableGroup);
    });
  });

  return [...groupsByTable.values()].sort((first, second) =>
    first.table.localeCompare(second.table, "vi", { numeric: true }),
  );
}

function TablePreparationTree({
  tableGroups,
}: {
  tableGroups: TablePreparationGroup[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-cas-outline-variant/30 bg-cas-glass">
      {tableGroups.map((tableGroup, tableIndex) => (
        <details
          className="group border-b border-cas-outline-variant/25 last:border-b-0"
          key={tableGroup.table}
          open={tableIndex === 0}
        >
          <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 px-4 py-3.5 transition hover:bg-cas-primary/5 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-cas-focus-ring [&::-webkit-details-marker]:hidden">
            <span
              className="text-lg leading-none font-bold text-cas-on-surface-variant transition-transform group-open:rotate-90"
              aria-hidden="true"
            >
              ›
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-extrabold">
                {tableGroup.table}
              </h3>
              <p className="mt-0.5 truncate text-xs text-cas-on-surface-variant">
                {tableGroup.items.length} loại món
              </p>
            </div>
            <span className="shrink-0 rounded-lg bg-cas-secondary-container/25 px-2.5 py-1 text-xs font-extrabold text-cas-secondary">
              {tableGroup.totalRemainingQuantity} phần
            </span>
          </summary>

          <ul className="ml-7 border-t border-l-2 border-cas-outline-variant/30 bg-cas-surface-container/35 py-1">
            {tableGroup.items.map((item) => (
              <li
                className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-cas-outline-variant/20 py-3 pr-4 pl-5 last:border-b-0"
                key={item.id}
              >
                <span className="absolute top-1/2 -left-1.5 size-2.5 -translate-y-1/2 rounded-full border-2 border-cas-surface-container bg-cas-secondary" />
                <div className="min-w-0">
                  <Link
                    className="block truncate text-sm font-extrabold text-cas-secondary underline decoration-cas-secondary/35 underline-offset-2 transition hover:text-cas-primary focus-visible:rounded-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                    href={`/operator/orders/${item.orderNumber}`}
                  >
                    {item.itemName}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-cas-on-surface-variant">
                    {item.optionSummary} · Gửi lúc {item.requestedAt}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-cas-primary">
                  {item.remainingQuantity} phần
                </span>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  );
}

export function OperatorPreparationWorkspace() {
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [preparationGroups, setPreparationGroups] = useState(
    initialPreparationGroups,
  );

  const totalRemainingQuantity = preparationGroups.reduce(
    (total, group) => total + group.remainingQuantity,
    0,
  );
  const tablePreparationGroups =
    buildTablePreparationGroups(preparationGroups);

  function handlePreparedQuantitySubmit(
    event: FormEvent<HTMLFormElement>,
    groupId: string,
  ) {
    event.preventDefault();

    const group = preparationGroups.find((item) => item.id === groupId);
    const preparedQuantity = Number(inputValues[groupId]);

    if (
      !group ||
      !Number.isInteger(preparedQuantity) ||
      preparedQuantity < 1 ||
      preparedQuantity > group.remainingQuantity
    ) {
      setFeedback({
        message: `Vui lòng nhập số phần từ 1 đến ${group?.remainingQuantity ?? 1}.`,
        tone: "error",
      });
      return;
    }

    let quantityToAllocate = preparedQuantity;
    const allocatedTables: string[] = [];
    const nextAllocations = group.allocations
      .map((allocation) => {
        const allocatedQuantity = Math.min(
          allocation.remainingQuantity,
          quantityToAllocate,
        );
        quantityToAllocate -= allocatedQuantity;

        if (allocatedQuantity > 0) {
          allocatedTables.push(`${allocation.table}: ${allocatedQuantity}`);
        }

        return {
          ...allocation,
          remainingQuantity:
            allocation.remainingQuantity - allocatedQuantity,
        };
      })
      .filter((allocation) => allocation.remainingQuantity > 0);

    const nextRemainingQuantity =
      group.remainingQuantity - preparedQuantity;

    setPreparationGroups((currentGroups) =>
      currentGroups
        .map((currentGroup) =>
          currentGroup.id === groupId
            ? {
                ...currentGroup,
                allocations: nextAllocations,
                remainingQuantity: nextRemainingQuantity,
              }
            : currentGroup,
        )
        .filter((currentGroup) => currentGroup.remainingQuantity > 0),
    );
    setInputValues((currentValues) => ({
      ...currentValues,
      [groupId]: "",
    }));
    setFeedback({
      message: `Đã ghi nhận ${preparedQuantity} phần ${group.itemName}. Đã cập nhật: ${allocatedTables.join(", ")}.`,
      tone: "success",
    });
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
            Vận hành món
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">Đơn gọi món</h1>
          <p className="mt-2 max-w-3xl text-sm text-cas-on-surface-variant">
            Theo dõi món cần làm theo món hoặc theo từng bàn.
          </p>
        </div>
        <div className="rounded-xl border border-cas-outline-variant/25 bg-cas-glass px-4 py-3 text-right">
          <p className="text-xs font-bold text-cas-on-surface-variant">
            Tổng còn cần làm
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-cas-primary">
            {totalRemainingQuantity} phần
          </p>
        </div>
      </header>

      {feedback ? (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border p-4 text-sm font-bold ${
            feedback.tone === "success"
              ? "border-cas-secondary/25 bg-cas-secondary-container/20 text-cas-secondary"
              : "border-cas-primary/25 bg-cas-primary/8 text-cas-primary"
          }`}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          <CasIcon
            className="mt-0.5 size-5 shrink-0"
            name={feedback.tone === "success" ? "check" : "info"}
          />
          <p>{feedback.message}</p>
        </div>
      ) : null}

      <div className="mt-7 grid items-start gap-6 xl:grid-cols-2">
        <section aria-labelledby="preparation-groups-title">
          <div className="mb-3">
            <h2 className="text-lg font-extrabold" id="preparation-groups-title">
              Tổng hợp theo món
            </h2>
            <p className="mt-1 text-xs text-cas-on-surface-variant">
              Các món cùng cấu hình được gộp thành một nhóm.
            </p>
          </div>

          {preparationGroups.length === 0 ? (
            <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-8 text-center">
              <div>
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-cas-secondary-container/30 text-cas-secondary">
                  <CasIcon className="size-6" name="check" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold">
                  Đã hoàn thành tất cả món
                </h3>
                <p className="mt-1 text-sm text-cas-on-surface-variant">
                  Hiện không còn món nào đang chờ chế biến.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-cas-outline-variant/30 bg-cas-glass">
            {preparationGroups.map((group, groupIndex) => (
              <details
                className="group border-b border-cas-outline-variant/25 last:border-b-0"
                key={group.id}
                open={groupIndex === 0}
              >
                <summary className="grid cursor-pointer list-none grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 px-4 py-3.5 transition hover:bg-cas-primary/5 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-cas-focus-ring [&::-webkit-details-marker]:hidden">
                  <span
                    className="text-lg leading-none font-bold text-cas-on-surface-variant transition-transform group-open:rotate-90"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-extrabold">
                      {group.itemName}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-cas-on-surface-variant">
                      {group.optionSummary} · {group.allocations.length} bàn
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-cas-primary/8 px-2.5 py-1 text-xs font-extrabold text-cas-primary">
                    {group.remainingQuantity} phần
                  </span>
                </summary>

                <div className="border-t border-cas-outline-variant/20 bg-cas-surface-container/35 px-4 py-3 sm:pl-14">
                  <ol className="ml-3 border-l-2 border-cas-outline-variant/35">
                    {group.allocations.map((allocation) => (
                      <li
                        className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-cas-outline-variant/20 py-3 pr-1 pl-5 last:border-b-0"
                        key={allocation.id}
                      >
                        <span className="absolute top-1/2 -left-1.5 size-2.5 -translate-y-1/2 rounded-full border-2 border-cas-surface-container bg-cas-secondary" />
                        <div>
                          <Link
                            className="text-sm font-extrabold text-cas-secondary underline decoration-cas-secondary/35 underline-offset-2 transition hover:text-cas-primary focus-visible:rounded-sm focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                            href={`/operator/orders/${allocation.orderNumber}`}
                          >
                            {allocation.table}
                          </Link>
                          <p className="mt-0.5 text-xs text-cas-on-surface-variant">
                            Gửi lúc {allocation.requestedAt}
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
                    onSubmit={(event) =>
                      handlePreparedQuantitySubmit(event, group.id)
                    }
                  >
                    <label
                      className="min-w-40 flex-1"
                      htmlFor={`prepared-${group.id}`}
                    >
                      <span className="text-xs font-bold text-cas-on-surface-variant">
                        Số phần vừa làm xong
                      </span>
                      <input
                        className="mt-1.5 h-10 w-full rounded-lg border border-cas-outline-variant/45 bg-cas-glass px-3 text-sm outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
                        id={`prepared-${group.id}`}
                        max={group.remainingQuantity}
                        min="1"
                        name="preparedQuantity"
                        onChange={(event) =>
                          setInputValues((currentValues) => ({
                            ...currentValues,
                            [group.id]: event.target.value,
                          }))
                        }
                        placeholder={`Tối đa ${group.remainingQuantity}`}
                        required
                        step="1"
                        type="number"
                        value={inputValues[group.id] ?? ""}
                      />
                    </label>
                    <button
                      className="h-10 rounded-lg bg-cas-primary px-3.5 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring active:translate-y-px"
                      type="submit"
                    >
                      Xác nhận hoàn thành
                    </button>
                  </form>
                </div>
              </details>
            ))}
            </div>
          )}
        </section>

        <section aria-labelledby="table-preparation-title">
          <div className="mb-3">
            <h2 className="text-lg font-extrabold" id="table-preparation-title">
              Món theo bàn
            </h2>
            <p className="mt-1 text-xs text-cas-on-surface-variant">
              Xem các món còn cần làm của từng bàn.
            </p>
          </div>

          {tablePreparationGroups.length > 0 ? (
            <TablePreparationTree tableGroups={tablePreparationGroups} />
          ) : (
            <div className="grid min-h-32 place-items-center rounded-xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-6 text-center text-sm text-cas-on-surface-variant">
              Không còn bàn nào đang chờ món.
            </div>
          )}
        </section>
      </div>
    </>
  );
}

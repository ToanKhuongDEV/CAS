import type { Metadata } from "next";

import { CasIcon } from "../../../../../components/ui/cas-icon";

export const metadata: Metadata = {
  title: "Tổng hợp món cần làm | CAS",
};

type PreparationAllocation = {
  orderNumber: string;
  quantity: number;
  requestedAt: string;
  table: string;
};

type PreparationGroup = {
  allocations: PreparationAllocation[];
  itemName: string;
  optionSummary: string;
  remainingQuantity: number;
};

const preparationGroups: PreparationGroup[] = [
  {
    allocations: [
      {
        orderNumber: "ORD-0819",
        quantity: 4,
        requestedAt: "18:55",
        table: "Bàn 03",
      },
      {
        orderNumber: "ORD-0821",
        quantity: 8,
        requestedAt: "19:05",
        table: "Bàn 05",
      },
      {
        orderNumber: "ORD-0824",
        quantity: 7,
        requestedAt: "19:11",
        table: "Bàn 12",
      },
    ],
    itemName: "Bò sốt tiêu đen",
    optionSummary: "Chín vừa",
    remainingQuantity: 19,
  },
  {
    allocations: [
      {
        orderNumber: "ORD-0820",
        quantity: 2,
        requestedAt: "19:00",
        table: "Bàn 01",
      },
      {
        orderNumber: "ORD-0825",
        quantity: 3,
        requestedAt: "19:16",
        table: "Bàn 08",
      },
    ],
    itemName: "Gà chiên mắm",
    optionSummary: "Không cay",
    remainingQuantity: 5,
  },
  {
    allocations: [
      {
        orderNumber: "ORD-0822",
        quantity: 3,
        requestedAt: "19:07",
        table: "Bàn 06",
      },
      {
        orderNumber: "ORD-0826",
        quantity: 5,
        requestedAt: "19:17",
        table: "Bàn 03",
      },
    ],
    itemName: "Mỳ cay hải sản",
    optionSummary: "Cấp 3 · Không topping",
    remainingQuantity: 8,
  },
];

export default function OperatorOrdersPage() {
  const totalRemainingQuantity = preparationGroups.reduce(
    (total, group) => total + group.remainingQuantity,
    0,
  );

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
            Vận hành · FIFO
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">
            Tổng hợp món cần làm
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-cas-on-surface-variant">
            Các món có cùng cấu hình được gộp để làm theo mẻ. Khi hoàn thành,
            backend sẽ phân bổ số phần về từng bàn theo order gọi trước.
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

      <section className="mt-7" aria-labelledby="preparation-groups-title">
        <h2 className="sr-only" id="preparation-groups-title">
          Các nhóm món đang chờ
        </h2>
        <div className="space-y-4">
          {preparationGroups.map((group, groupIndex) => (
            <details
              className="group overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]"
              key={`${group.itemName}-${group.optionSummary}`}
              open={groupIndex === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-cas-focus-ring">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-secondary-container/30 text-cas-secondary">
                    <CasIcon className="size-5" name="restaurant" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-extrabold">
                      {group.itemName}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-cas-on-surface-variant">
                      {group.optionSummary} · {group.allocations.length} bàn
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-extrabold text-cas-primary">
                    {group.remainingQuantity}
                  </p>
                  <p className="text-[0.68rem] font-bold text-cas-on-surface-variant">
                    phần còn lại
                  </p>
                </div>
              </summary>

              <div className="border-t border-cas-outline-variant/25 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-extrabold">Phân bổ theo FIFO</p>
                    <p className="mt-1 text-xs text-cas-on-surface-variant">
                      Bàn gọi trước được nhận số phần hoàn thành trước.
                    </p>
                  </div>
                  <span className="rounded-full bg-cas-secondary-container/25 px-3 py-1 text-xs font-extrabold text-cas-secondary">
                    Cũ nhất trước
                  </span>
                </div>

                <ol className="mt-4 divide-y divide-cas-outline-variant/25">
                  {group.allocations.map((allocation, index) => (
                    <li
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3"
                      key={`${allocation.orderNumber}-${allocation.table}`}
                    >
                      <span className="grid size-7 place-items-center rounded-full bg-cas-surface-container text-xs font-extrabold text-cas-on-surface-variant">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-extrabold">
                          {allocation.table}
                        </p>
                        <p className="mt-0.5 text-xs text-cas-on-surface-variant">
                          {allocation.orderNumber} ·{" "}
                          {allocation.requestedAt}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-cas-primary">
                        {allocation.quantity} phần
                      </p>
                    </li>
                  ))}
                </ol>

                <form className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-cas-surface-container/65 p-4">
                  <label className="min-w-40 flex-1" htmlFor={`prepared-${groupIndex}`}>
                    <span className="text-xs font-extrabold">
                      Số phần vừa làm xong
                    </span>
                    <input
                      className="mt-2 h-11 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-glass px-3 text-sm outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
                      id={`prepared-${groupIndex}`}
                      max={group.remainingQuantity}
                      min="1"
                      name="preparedQuantity"
                      placeholder={`Tối đa ${group.remainingQuantity}`}
                      type="number"
                    />
                  </label>
                  <button
                    className="h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary opacity-55"
                    type="button"
                    disabled
                    title="Chờ API hoàn thành món theo mẻ"
                  >
                    Chờ API
                  </button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section
        className="mt-6 rounded-2xl border border-cas-outline-variant/25 bg-cas-surface-container/65 p-5"
        aria-label="Thông tin dữ liệu tổng hợp"
      >
        <div className="flex gap-3">
          <CasIcon
            className="mt-0.5 size-5 shrink-0 text-cas-secondary"
            name="info"
          />
          <p className="text-sm leading-relaxed text-cas-on-surface-variant">
            Dữ liệu hiện tại là dữ liệu mẫu. Nút hoàn thành được khóa cho đến
            khi backend có transaction phân bổ FIFO và idempotency bền vững.
          </p>
        </div>
      </section>
    </>
  );
}

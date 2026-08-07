import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CasIcon } from "../../../../../../components/ui/cas-icon";

type OrderItemOption = {
  name: string;
  price: number;
};

type OperatorOrderItem = {
  id: string;
  name: string;
  options: OrderItemOption[];
  preparedQuantity: number;
  quantity: number;
  unitPrice: number;
};

type OperatorOrderDetail = {
  items: OperatorOrderItem[];
  note: string | null;
  requestedAt: string;
  table: string;
};

const operatorOrders: Record<string, OperatorOrderDetail> = {
  "ORD-0819": {
    items: [
      {
        id: "ord-0819-beef",
        name: "Bò sốt tiêu đen",
        options: [{ name: "Chín vừa", price: 0 }],
        preparedQuantity: 0,
        quantity: 4,
        unitPrice: 59000,
      },
      {
        id: "ord-0819-fries",
        name: "Khoai tây chiên",
        options: [],
        preparedQuantity: 1,
        quantity: 1,
        unitPrice: 39000,
      },
    ],
    note: "Bò làm chín vừa, mang khoai ra trước nếu xong.",
    requestedAt: "18:55",
    table: "Bàn 03",
  },
  "ORD-0820": {
    items: [
      {
        id: "ord-0820-chicken",
        name: "Gà chiên mắm",
        options: [{ name: "Không cay", price: 0 }],
        preparedQuantity: 0,
        quantity: 2,
        unitPrice: 49000,
      },
    ],
    note: null,
    requestedAt: "19:00",
    table: "Bàn 01",
  },
  "ORD-0821": {
    items: [
      {
        id: "ord-0821-beef",
        name: "Bò sốt tiêu đen",
        options: [{ name: "Chín vừa", price: 0 }],
        preparedQuantity: 0,
        quantity: 8,
        unitPrice: 59000,
      },
    ],
    note: "Chia thành hai đĩa.",
    requestedAt: "19:05",
    table: "Bàn 05",
  },
  "ORD-0822": {
    items: [
      {
        id: "ord-0822-noodle",
        name: "Mỳ cay hải sản",
        options: [
          { name: "Cấp 3", price: 0 },
          { name: "Không topping", price: 0 },
        ],
        preparedQuantity: 0,
        quantity: 3,
        unitPrice: 55000,
      },
    ],
    note: null,
    requestedAt: "19:07",
    table: "Bàn 06",
  },
  "ORD-0824": {
    items: [
      {
        id: "ord-0824-beef",
        name: "Bò sốt tiêu đen",
        options: [{ name: "Chín vừa", price: 0 }],
        preparedQuantity: 0,
        quantity: 7,
        unitPrice: 59000,
      },
    ],
    note: null,
    requestedAt: "19:11",
    table: "Bàn 12",
  },
  "ORD-0825": {
    items: [
      {
        id: "ord-0825-chicken",
        name: "Gà chiên mắm",
        options: [{ name: "Không cay", price: 0 }],
        preparedQuantity: 0,
        quantity: 3,
        unitPrice: 49000,
      },
    ],
    note: "Để nước sốt riêng.",
    requestedAt: "19:16",
    table: "Bàn 08",
  },
  "ORD-0826": {
    items: [
      {
        id: "ord-0826-noodle",
        name: "Mỳ cay hải sản",
        options: [
          { name: "Cấp 3", price: 0 },
          { name: "Không topping", price: 0 },
        ],
        preparedQuantity: 0,
        quantity: 5,
        unitPrice: 55000,
      },
    ],
    note: null,
    requestedAt: "19:17",
    table: "Bàn 03",
  },
};

type OperatorOrderDetailPageProps = {
  params: Promise<{ orderNumber: string }>;
};

const formatPrice = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

const getItemUnitPrice = (item: OperatorOrderItem) =>
  item.unitPrice +
  item.options.reduce((total, option) => total + option.price, 0);

export async function generateMetadata({
  params,
}: OperatorOrderDetailPageProps): Promise<Metadata> {
  const { orderNumber } = await params;
  const order = operatorOrders[decodeURIComponent(orderNumber).toUpperCase()];

  return {
    title: order
      ? `Đơn của ${order.table} · ${order.requestedAt} | CAS`
      : "Không tìm thấy đơn gọi món | CAS",
  };
}

export default async function OperatorOrderDetailPage({
  params,
}: OperatorOrderDetailPageProps) {
  const { orderNumber } = await params;
  const order = operatorOrders[decodeURIComponent(orderNumber).toUpperCase()];

  if (!order) {
    notFound();
  }

  const totalQuantity = order.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const preparedQuantity = order.items.reduce(
    (total, item) => total + item.preparedQuantity,
    0,
  );
  const remainingQuantity = totalQuantity - preparedQuantity;
  const originalAmount = order.items.reduce(
    (total, item) => total + getItemUnitPrice(item) * item.quantity,
    0,
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cas-outline-variant/40 bg-cas-glass px-4 text-sm font-extrabold text-cas-on-surface-variant transition hover:border-cas-primary/30 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
          href="/operator/orders"
        >
          <CasIcon className="size-4 rotate-180" name="arrow" />
          Quay lại danh sách
        </Link>
        <span className="rounded-full bg-cas-secondary-container/25 px-3 py-1.5 text-xs font-extrabold text-cas-secondary">
          {remainingQuantity > 0
            ? `${remainingQuantity} phần chưa làm`
            : "Đã làm xong"}
        </span>
      </div>

      <header className="mt-6">
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Đơn của {order.table}
          </h1>
        </div>
        <p className="mt-2 text-sm text-cas-on-surface-variant">
          Gửi lúc {order.requestedAt} · {totalQuantity} phần ·{" "}
          {order.items.length} loại món
        </p>
      </header>

      <section
        className="mt-6 grid gap-3 sm:grid-cols-3"
        aria-label="Tóm tắt đơn gọi món"
      >
        <article className="flex min-h-20 items-center gap-3 rounded-xl border border-cas-outline-variant/25 bg-cas-glass p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-secondary-container/30 text-cas-secondary">
            <CasIcon className="size-5" name="table" />
          </span>
          <div>
            <p className="text-xs font-bold text-cas-on-surface-variant">Bàn</p>
            <p className="mt-0.5 font-extrabold">{order.table}</p>
          </div>
        </article>
        <article className="flex min-h-20 items-center gap-3 rounded-xl border border-cas-outline-variant/25 bg-cas-glass p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-tertiary/12 text-cas-tertiary">
            <CasIcon className="size-5" name="clock" />
          </span>
          <div>
            <p className="text-xs font-bold text-cas-on-surface-variant">
              Thời gian gửi
            </p>
            <p className="mt-0.5 font-extrabold">{order.requestedAt}</p>
          </div>
        </article>
        <article className="flex min-h-20 items-center gap-3 rounded-xl border border-cas-outline-variant/25 bg-cas-glass p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
            <CasIcon className="size-5" name="restaurant" />
          </span>
          <div>
            <p className="text-xs font-bold text-cas-on-surface-variant">
              Tiến độ
            </p>
            <p className="mt-0.5 font-extrabold">
              {preparedQuantity}/{totalQuantity} phần
            </p>
          </div>
        </article>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.7fr)]">
        <section
          className="overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]"
          aria-labelledby="order-items-title"
        >
          <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4">
            <h2 className="text-lg font-extrabold" id="order-items-title">
              Món trong đơn
            </h2>
            <span className="text-xs font-extrabold text-cas-on-surface-variant">
              {totalQuantity} phần
            </span>
          </div>

          <ul className="divide-y divide-cas-outline-variant/25">
            {order.items.map((item) => {
              const itemUnitPrice = getItemUnitPrice(item);
              const itemRemainingQuantity =
                item.quantity - item.preparedQuantity;
              const completionPercentage = Math.round(
                (item.preparedQuantity / item.quantity) * 100,
              );

              return (
                <li className="p-5" key={item.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="font-extrabold">{item.name}</h3>
                      <p className="mt-1 text-xs text-cas-on-surface-variant">
                        Số lượng: {item.quantity} · Đơn giá:{" "}
                        {formatPrice(itemUnitPrice)}
                      </p>
                    </div>
                    <strong className="shrink-0 text-cas-primary">
                      {formatPrice(itemUnitPrice * item.quantity)}
                    </strong>
                  </div>

                  {item.options.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.options.map((option) => (
                        <span
                          className="rounded-lg bg-cas-surface-container px-2.5 py-1 text-xs font-bold text-cas-on-surface-variant"
                          key={option.name}
                        >
                          {option.name}
                          {option.price > 0
                            ? ` +${formatPrice(option.price)}`
                            : ""}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-cas-on-surface-variant">
                      Không có option
                    </p>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold">
                      <span className="text-cas-on-surface-variant">
                        Đã làm {item.preparedQuantity}/{item.quantity} phần
                      </span>
                      <span
                        className={
                          itemRemainingQuantity > 0
                            ? "text-cas-primary"
                            : "text-cas-secondary"
                        }
                      >
                        {itemRemainingQuantity > 0
                          ? `Còn ${itemRemainingQuantity} phần`
                          : "Hoàn thành"}
                      </span>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-cas-surface-container"
                      aria-label={`Tiến độ ${item.name}: ${completionPercentage}%`}
                      role="progressbar"
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={completionPercentage}
                    >
                      <span
                        className="block h-full rounded-full bg-cas-secondary"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-4">
          <section
            className="rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-5"
            aria-labelledby="order-note-title"
          >
            <div className="flex items-center gap-2">
              <CasIcon className="size-5 text-cas-secondary" name="info" />
              <h2 className="font-extrabold" id="order-note-title">
                Ghi chú chung
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-cas-on-surface-variant">
              {order.note ?? "Không có ghi chú cho order này."}
            </p>
          </section>

          <section
            className="rounded-2xl border border-cas-primary/20 bg-cas-primary/5 p-5"
            aria-labelledby="order-total-title"
          >
            <h2 className="font-extrabold" id="order-total-title">
              Tổng đơn
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-cas-on-surface-variant">Tổng ban đầu</dt>
                <dd className="font-bold">{formatPrice(originalAmount)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-cas-primary/15 pt-3">
                <dt className="font-extrabold">Còn phải trả</dt>
                <dd className="text-xl font-extrabold text-cas-primary">
                  {formatPrice(originalAmount)}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  loadOperatorOrderDetail,
  type OperatorOrderDetail,
} from "../../lib/api/ordering/ordering.api";
import { CasIcon } from "../ui/cas-icon";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function OperatorOrderDetailView({ orderId }: { orderId: string }) {
  const [detail, setDetail] = useState<OperatorOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void loadOperatorOrderDetail(orderId)
      .then((value) => {
        if (!active) return;
        setDetail(value);
        setError(null);
      })
      .catch((cause) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Không thể tải chi tiết order.");
      });
    return () => {
      active = false;
    };
  }, [orderId]);

  if (error) {
    return (
      <section className="rounded-2xl border border-cas-error/25 bg-cas-error-container/20 p-5">
        <p className="font-extrabold text-cas-error">Không thể mở chi tiết order</p>
        <p className="mt-1 text-sm text-cas-on-surface-variant">{error}</p>
        <Link
          className="mt-4 inline-flex text-sm font-extrabold text-cas-primary"
          href="/operator/orders"
        >
          Quay lại danh sách
        </Link>
      </section>
    );
  }

  if (!detail)
    return <p className="text-sm text-cas-on-surface-variant">Đang tải chi tiết order...</p>;

  const { customerName, customerPhone, order, tableCode } = detail;
  const effectiveQuantity = order.items.reduce(
    (total, item) => total + item.quantity - item.cancelledQuantity,
    0,
  );
  const preparedQuantity = order.items.reduce((total, item) => total + item.preparedQuantity, 0);
  const remainingQuantity = Math.max(0, effectiveQuantity - preparedQuantity);

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
          {remainingQuantity > 0 ? `${remainingQuantity} phần chưa làm` : "Đã làm xong"}
        </span>
      </div>

      <header className="mt-6">
        <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          {order.orderNumber}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Đơn của Bàn {String(tableCode).padStart(2, "0")}
        </h1>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Tóm tắt đơn gọi món">
        <Summary icon="table" label="Bàn" value={`Bàn ${String(tableCode).padStart(2, "0")}`} />
        <Summary
          icon="clock"
          label="Thời gian gửi"
          value={new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(
            new Date(order.createdAt),
          )}
        />
        <Summary
          icon="restaurant"
          label="Tiến độ"
          value={`${preparedQuantity}/${effectiveQuantity} phần`}
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.7fr)]">
        <section
          className="overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]"
          aria-labelledby="order-items-title"
        >
          <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/25 px-5 py-4">
            <h2 className="text-lg font-extrabold" id="order-items-title">
              Chi tiết món đã gọi
            </h2>
            <span className="rounded-full bg-cas-secondary-container/20 px-3 py-1 text-xs font-extrabold text-cas-secondary">
              {order.items.reduce((total, item) => total + item.quantity, 0)} phần ·{" "}
              {order.items.length} loại
            </span>
          </div>
          <ul className="divide-y divide-cas-outline-variant/25">
            {order.items.map((item) => {
              const itemEffectiveQuantity = item.quantity - item.cancelledQuantity;
              const itemRemainingQuantity = Math.max(
                0,
                itemEffectiveQuantity - item.preparedQuantity,
              );
              const completionPercentage =
                itemEffectiveQuantity === 0
                  ? 100
                  : Math.min(
                      100,
                      Math.round((item.preparedQuantity / itemEffectiveQuantity) * 100),
                    );
              return (
                <li className="p-5" key={item.orderItemId}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-cas-primary/10 text-xs font-extrabold text-cas-primary">
                          ×{item.quantity}
                        </span>
                        <h3 className="text-base font-extrabold">{item.itemName}</h3>
                      </div>
                      <div className="mt-3 space-y-1.5 text-xs text-cas-on-surface-variant">
                        <p className="flex justify-between gap-3 font-medium">
                          <span>Giá món gốc</span>
                          <span>{money.format(item.unitPrice)}</span>
                        </p>
                        {item.options.map((option) => (
                          <p
                            className="flex justify-between gap-3"
                            key={`${option.groupName}-${option.optionName}`}
                          >
                            <span>
                              {option.unitPrice > 0 ? `+ ${option.optionName}` : option.optionName}
                            </span>
                            <span className="font-semibold text-cas-on-surface">
                              {option.unitPrice > 0
                                ? `+${money.format(option.unitPrice)}`
                                : "Miễn phí"}
                            </span>
                          </p>
                        ))}
                        {item.cancelledQuantity > 0 ? (
                          <p className="text-cas-error">Đã hủy {item.cancelledQuantity} phần</p>
                        ) : null}
                      </div>
                    </div>
                    <strong className="shrink-0 text-base font-extrabold text-cas-primary">
                      {money.format(item.totalAmount)}
                    </strong>
                  </div>
                  <div className="mt-4 border-t border-cas-outline-variant/15 pt-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-bold">
                      <span className="text-cas-on-surface-variant">
                        Đã làm {item.preparedQuantity}/{itemEffectiveQuantity} phần
                      </span>
                      <span
                        className={
                          itemRemainingQuantity > 0 ? "text-cas-primary" : "text-cas-secondary"
                        }
                      >
                        {itemRemainingQuantity > 0
                          ? `Còn ${itemRemainingQuantity} phần`
                          : "Hoàn thành"}
                      </span>
                    </div>
                    <div
                      aria-label={`Tiến độ ${item.itemName}: ${completionPercentage}%`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={completionPercentage}
                      className="mt-2 h-2 overflow-hidden rounded-full bg-cas-surface-container"
                      role="progressbar"
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
          <section className="rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-5">
            <div className="flex items-center gap-2">
              <CasIcon className="size-5 text-cas-secondary" name="users" />
              <h2 className="font-extrabold">Khách hàng</h2>
            </div>
            <p className="mt-3 text-sm font-extrabold text-cas-on-surface">{customerName}</p>
            {customerPhone ? (
              <p className="mt-1 text-sm text-cas-on-surface-variant">{customerPhone}</p>
            ) : null}
          </section>
          <section className="rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-5">
            <div className="flex items-center gap-2">
              <CasIcon className="size-5 text-cas-secondary" name="info" />
              <h2 className="font-extrabold">Ghi chú chung</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-cas-on-surface-variant">
              {order.note ?? "Không có ghi chú cho order này."}
            </p>
          </section>
          <section className="rounded-2xl border border-cas-primary/20 bg-cas-primary/5 p-5">
            <h2 className="font-extrabold">Tổng đơn</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-cas-on-surface-variant">Tổng ban đầu</dt>
                <dd className="font-bold">{money.format(order.originalAmount)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-cas-primary/15 pt-3">
                <dt className="font-extrabold">Còn phải trả</dt>
                <dd className="text-xl font-extrabold text-cas-primary">
                  {money.format(order.payableAmount)}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </>
  );
}

function Summary({
  icon,
  label,
  value,
}: {
  icon: "table" | "clock" | "restaurant";
  label: string;
  value: string;
}) {
  return (
    <article className="flex min-h-20 items-center gap-3 rounded-xl border border-cas-outline-variant/25 bg-cas-glass p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-secondary-container/30 text-cas-secondary">
        <CasIcon className="size-5" name={icon} />
      </span>
      <div>
        <p className="text-xs font-bold text-cas-on-surface-variant">{label}</p>
        <p className="mt-0.5 font-extrabold">{value}</p>
      </div>
    </article>
  );
}

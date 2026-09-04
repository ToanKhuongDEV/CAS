"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useCustomerCatalog } from "../../lib/api/catalog/customer-catalog.query";
import {
  loadCustomerBill,
  requestCustomerCancellation,
  type CustomerBill,
} from "../../lib/api/ordering/ordering.api";
import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const customerTableSessionRequiredMessage = "Vui lòng quét mã QR của bàn để tiếp tục.";

function formatOrderTime(createdAt: string) {
  return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(createdAt),
  );
}

export function CustomerOrdersLiveView() {
  const [bill, setBill] = useState<CustomerBill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellation, setCancellation] = useState<{ itemId: string; maximum: number } | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const { showToast } = useToast();
  const { data: catalog } = useCustomerCatalog();
  const refresh = () =>
    void loadCustomerBill()
      .then((nextBill) => {
        setBill(nextBill);
        setError(null);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Không thể tải đơn hàng."),
      );
  useEffect(refresh, []);
  const itemImageUrls = useMemo(() => {
    const imageUrls: Record<string, string> = {};
    for (const item of catalog?.items ?? []) {
      if (item.imageUrl) imageUrls[item.name] = item.imageUrl;
    }
    return imageUrls;
  }, [catalog]);
  if (error === customerTableSessionRequiredMessage) {
    return (
      <main className="grid min-h-96 min-w-0 flex-1 place-items-center pb-6">
        <section className="w-full max-w-md rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-7 text-center shadow-[0_8px_24px_var(--cas-shadow-color)]">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-cas-secondary-container/25 text-cas-secondary">
            <CasIcon className="size-7" name="table" />
          </span>
          <p className="mt-5 text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
            Chưa chọn bàn
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Xem đơn hàng theo bàn</h1>
          <p className="mt-3 text-sm leading-6 text-cas-on-surface-variant">
            Quét mã QR tại bàn để xem món đã gọi, theo dõi trạng thái và gửi yêu cầu thanh toán.
          </p>
          <Link
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
            href="/scan"
          >
            <CasIcon className="size-5" name="table" />
            Quét mã QR của bàn
          </Link>
        </section>
      </main>
    );
  }
  if (error) return <p className="text-cas-error">{error}</p>;
  if (!bill) return <p className="text-cas-on-surface-variant">Đang tải đơn hàng…</p>;
  const totalItemQuantity = bill.orders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );
  const orderNotes = bill.orders.flatMap((order) => (order.note ? [order.note] : []));
  const discountAmount = Math.max(0, bill.originalAmount - bill.payableAmount);

  async function cancel() {
    if (!cancellation) return;
    try {
      await requestCustomerCancellation(cancellation.itemId, quantity, reason.trim() || null);
      showToast({ type: "success", message: "Yêu cầu hủy món đã được gửi cho nhân viên." });
      setCancellation(null);
      refresh();
    } catch (cause) {
      showToast({
        type: "error",
        message: cause instanceof Error ? cause.message : "Không thể gửi yêu cầu hủy.",
      });
    }
  }
  return (
    <main className="min-w-0 flex-1 pb-6">
      <header>
        <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          Món đã gọi
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
          Đơn hàng · Bàn {String(bill.tableCode).padStart(2, "0")}
        </h1>
        <p className="mt-2 text-sm text-cas-on-surface-variant">
          Kiểm tra món đã gọi và yêu cầu thanh toán khi dùng bữa xong.
        </p>
      </header>

      <section className="mt-7 rounded-3xl bg-cas-surface-container p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]">
        <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/40 pb-4">
          <div>
            <h2 className="text-lg font-extrabold">Chi tiết món đã gọi</h2>
            <p className="mt-1 text-xs text-cas-on-surface-variant">Các món đã gửi xuống bếp.</p>
          </div>
          <span className="rounded-full bg-cas-secondary-container/35 px-3 py-1.5 text-xs font-extrabold text-cas-secondary">
            {totalItemQuantity} món
          </span>
        </div>

        <div className="divide-y divide-cas-outline-variant/40">
          {bill.orders.map((order) => (
            <section className="py-4 first:pt-5" key={order.orderId}>
              <div className="mb-3 flex justify-end text-xs text-cas-on-surface-variant">
                <span>Gửi lúc {formatOrderTime(order.createdAt)}</span>
              </div>
              <ul className="space-y-4">
                {order.items.map((item) => (
                  <li className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3" key={item.orderItemId}>
                    {itemImageUrls[item.itemName] ? (
                      <div className="relative size-16 overflow-hidden rounded-2xl bg-cas-surface">
                        <Image
                          alt={item.itemName}
                          className="object-cover"
                          fill
                          sizes="4rem"
                          src={itemImageUrls[item.itemName]}
                        />
                      </div>
                    ) : (
                      <div className="grid size-16 place-items-center rounded-2xl bg-cas-surface text-cas-secondary">
                        <CasIcon className="size-7" name="restaurant" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="line-clamp-2 min-w-0 flex-1 text-sm leading-tight font-extrabold">
                          {item.itemName}
                        </h3>
                        <span className="shrink-0 text-xs font-bold text-cas-on-surface-variant">
                          ×{item.quantity}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-cas-on-surface-variant">
                        <p className="flex justify-between gap-4">
                          <span>Giá món gốc</span>
                          <span>{money.format(item.unitPrice)}</span>
                        </p>
                        {item.options.map((option) => (
                          <p
                            className="flex justify-between gap-4"
                            key={option.groupName + option.optionName}
                          >
                            <span>+ {option.optionName}</span>
                            <span>+{money.format(option.unitPrice * option.quantityPerItem)}</span>
                          </p>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <strong className="text-sm text-cas-primary">
                          {money.format(item.totalAmount)}
                        </strong>
                        <button
                          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-cas-primary transition hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-cas-focus-ring disabled:cursor-not-allowed disabled:text-cas-on-surface-variant"
                          disabled={item.quantity === item.cancelledQuantity}
                          onClick={() => {
                            setQuantity(1);
                            setReason("");
                            setCancellation({
                              itemId: item.orderItemId,
                              maximum: item.quantity - item.cancelledQuantity,
                            });
                          }}
                          type="button"
                        >
                          <CasIcon className="size-4" name="minus" />
                          Yêu cầu hủy
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="border-t border-cas-outline-variant/40 pt-5">
          <h2 className="text-xs font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
            Ghi chú chung
          </h2>
          <p className="mt-3 rounded-2xl bg-cas-surface px-4 py-3 text-sm leading-6 text-cas-on-surface-variant">
            {orderNotes.length > 0
              ? orderNotes.join(" · ")
              : "Không có ghi chú cho các món đã gọi."}
          </p>
        </div>

        <div className="mt-5 border-t border-cas-outline-variant/40 pt-4 text-sm">
          <p className="flex justify-between gap-4 text-cas-on-surface-variant">
            <span>Giá gốc</span>
            <span>{money.format(bill.originalAmount)}</span>
          </p>
          <p className="mt-2 flex justify-between gap-4 text-cas-on-surface-variant">
            <span>Giảm giá</span>
            <span className="font-bold text-cas-secondary">-{money.format(discountAmount)}</span>
          </p>
          <div className="mt-3 flex items-end justify-between gap-4 border-t border-cas-outline-variant/40 pt-3">
            <div>
              <p className="text-xs font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
                Giá trị cần thanh toán
              </p>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                Tạm tính trước khi gửi yêu cầu
              </p>
            </div>
            <strong className="text-xl text-cas-primary">{money.format(bill.payableAmount)}</strong>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {bill.sessionStatus === "OPEN" ? (
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-cas-primary/45 px-5 font-extrabold text-cas-primary transition hover:bg-cas-primary/8 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
            href="/payment"
          >
            <CasIcon className="size-5" name="bill" />
            Yêu cầu thanh toán
          </Link>
        ) : null}
        <Link
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
          href="/menu"
        >
          <CasIcon className="size-5" name="plus" />
          Gọi thêm món
        </Link>
      </div>
      {cancellation ? (
        <div className="fixed inset-0 z-60 grid place-items-center bg-cas-on-surface/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-cas-surface p-6 shadow-[0_16px_36px_var(--cas-shadow-color)]">
            <h2 className="text-lg font-extrabold">Yêu cầu hủy món</h2>
            <input
              className="mt-4 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface-container p-3 text-sm outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
              max={cancellation.maximum}
              min={1}
              onChange={(event) => setQuantity(Number(event.target.value))}
              type="number"
              value={quantity}
            />
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface-container p-3 text-sm outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
              onChange={(event) => setReason(event.target.value)}
              placeholder="Lý do hủy (không bắt buộc)"
              value={reason}
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setCancellation(null)}
                type="button"
              >
                Đóng
              </button>
              <button
                className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => void cancel()}
                type="button"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

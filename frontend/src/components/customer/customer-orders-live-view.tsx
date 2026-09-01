"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadCustomerBill,
  requestCustomerCancellation,
  type CustomerBill,
} from "../../lib/api/ordering/ordering.api";
import { useToast } from "../ui/toast-provider";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

export function CustomerOrdersLiveView() {
  const router = useRouter();
  const [bill, setBill] = useState<CustomerBill | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancellation, setCancellation] = useState<{ itemId: string; maximum: number } | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const { showToast } = useToast();
  const refresh = () =>
    void loadCustomerBill()
      .then(setBill)
      .catch(() => {
        const token = window.sessionStorage.getItem("cas.tableQrToken");
        if (token) {
          router.replace(`/table/${encodeURIComponent(token)}?returnTo=%2Forders`);
          return;
        }
        router.replace("/scan?returnTo=%2Forders");
      });
  useEffect(refresh, []);
  if (error) return <p className="text-cas-error">{error}</p>;
  if (!bill) return <p className="text-cas-on-surface-variant">Đang tải đơn hàng…</p>;
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
    <main className="w-full">
      <h1 className="text-2xl font-extrabold">
        Đơn hàng · Bàn {String(bill.tableCode).padStart(2, "0")}
      </h1>
      <p className="mt-2 text-cas-on-surface-variant">
        Tạm tính: {money.format(bill.payableAmount)}
      </p>
      <div className="mt-6 space-y-4">
        {bill.orders.map((order) => (
          <section className="rounded-3xl bg-cas-surface-container p-5" key={order.orderId}>
            <p className="font-bold">#{order.orderNumber}</p>
            <ul className="mt-3 divide-y divide-cas-outline-variant">
              {order.items.map((item) => (
                <li className="flex items-center justify-between gap-3 py-3" key={item.orderItemId}>
                  <span>
                    {item.itemName} × {item.quantity}
                  </span>
                  <button
                    className="text-sm font-bold text-cas-primary"
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
                    Hủy món
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {cancellation ? (
        <div className="fixed inset-0 z-60 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-cas-surface p-6">
            <h2 className="text-lg font-extrabold">Yêu cầu hủy món</h2>
            <input
              className="mt-4 w-full rounded-xl border p-3"
              max={cancellation.maximum}
              min={1}
              onChange={(event) => setQuantity(Number(event.target.value))}
              type="number"
              value={quantity}
            />
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border p-3"
              onChange={(event) => setReason(event.target.value)}
              placeholder="Lý do hủy (không bắt buộc)"
              value={reason}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setCancellation(null)} type="button">
                Đóng
              </button>
              <button
                className="rounded-xl bg-cas-primary px-4 py-2 font-bold text-cas-on-primary"
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

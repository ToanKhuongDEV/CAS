"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createCustomerOrder } from "../../lib/api/ordering/ordering.api";
import {
  clearCustomerCart,
  readCustomerCart,
  saveCustomerCart,
  type CustomerCartLine,
} from "../../lib/customer/cart";
import { getCurrentCustomerTableSession } from "../../lib/customer/table-session";
import { CasIcon } from "../ui/cas-icon";

export function CustomerCartView() {
  const router = useRouter();
  const [cart, setCart] = useState<CustomerCartLine[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setCart(readCustomerCart()), []);
  const update = (next: CustomerCartLine[]) => {
    setCart(next);
    saveCustomerCart(next);
  };
  const total = cart.reduce((sum, line) => sum + line.quantity, 0);

  async function submit() {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await getCurrentCustomerTableSession();
      await createCustomerOrder({
        note: note.trim() || null,
        items: cart.map(({ menuItemId, quantity, optionValueIds }) => ({
          menuItemId,
          quantity,
          optionValueIds,
        })),
      });
      clearCustomerCart();
      router.push("/orders");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể gửi món.");
      setSubmitting(false);
    }
  }

  return (
    <main className="w-full pb-36 md:pb-32">
      <h1 className="text-2xl font-extrabold">Giỏ hàng của bạn</h1>
      <p className="mt-2 text-sm text-cas-on-surface-variant">
        Kiểm tra món trước khi gửi xuống bếp.
      </p>
      {cart.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-cas-surface-container p-8 text-center">
          <p className="font-bold">Giỏ hàng đang trống.</p>
          <Link className="mt-4 inline-flex text-cas-primary underline" href="/menu">
            Chọn món
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-6 divide-y rounded-3xl bg-cas-surface-container px-5">
            {cart.map((line, index) => (
              <li
                className="flex items-center justify-between gap-4 py-4"
                key={`${line.menuItemId}-${line.optionValueIds.join("-")}`}
              >
                <div>
                  <p className="font-bold">{line.itemName}</p>
                  <p className="text-xs text-cas-on-surface-variant">
                    {line.optionValueIds.length} tùy chọn
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-lg p-2"
                    onClick={() =>
                      update(
                        cart.flatMap((item, itemIndex) =>
                          itemIndex !== index
                            ? [item]
                            : item.quantity === 1
                              ? []
                              : [{ ...item, quantity: item.quantity - 1 }],
                        ),
                      )
                    }
                    type="button"
                  >
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    className="rounded-lg p-2"
                    onClick={() =>
                      update(
                        cart.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, quantity: item.quantity + 1 } : item,
                        ),
                      )
                    }
                    type="button"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <label className="mt-6 block text-sm font-bold">
            Ghi chú chung
            <textarea
              className="mt-2 min-h-24 w-full rounded-2xl border border-cas-outline-variant bg-cas-surface p-3 font-normal"
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </label>
          {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
          <div className="fixed inset-x-0 bottom-0 border-t border-cas-outline-variant bg-cas-surface p-4">
            <div className="mx-auto flex max-w-136 items-center justify-between gap-4">
              <span className="font-bold">{total} món</span>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-cas-primary px-5 py-3 font-bold text-cas-on-primary disabled:opacity-60"
                disabled={submitting}
                onClick={submit}
                type="button"
              >
                <CasIcon className="size-5" name="restaurant" />
                {submitting ? "Đang gửi..." : "Gửi món xuống bếp"}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

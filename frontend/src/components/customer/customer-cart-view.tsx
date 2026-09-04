"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createCustomerOrder } from "../../lib/api/ordering/ordering.api";
import { useCustomerCatalog } from "../../lib/api/catalog/customer-catalog.query";
import {
  clearCustomerCart,
  readCustomerCart,
  saveCustomerCart,
  type CustomerCartLine,
} from "../../lib/customer/cart";
import { CasIcon } from "../ui/cas-icon";

const money = new Intl.NumberFormat("vi-VN");

function formatMoney(amount: number) {
  return money.format(amount) + "đ";
}

function lineUnitPrice(line: CustomerCartLine) {
  return (
    (line.basePrice ?? 0) +
    (line.selectedOptions ?? []).reduce((sum, option) => sum + option.price, 0)
  );
}

export function CustomerCartView() {
  const router = useRouter();
  const [cart, setCart] = useState<CustomerCartLine[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isClearConfirmationOpen, setIsClearConfirmationOpen] = useState(false);
  const { data: catalog } = useCustomerCatalog();

  useEffect(() => {
    setCart(readCustomerCart());
  }, []);

  useEffect(() => {
    if (!catalog) return;
    const itemsById = new Map(catalog.items.map((item) => [item.id, item]));
    const optionsById = new Map(
      catalog.optionGroups.flatMap((group) => group.values).map((option) => [option.id, option]),
    );

    const hydratedCart = readCustomerCart().map((line) => {
      const item = itemsById.get(line.menuItemId);
      return {
        ...line,
        basePrice: line.basePrice ?? item?.price,
        imageUrl: line.imageUrl ?? item?.imageUrl,
        selectedOptions:
          line.selectedOptions ??
          line.optionValueIds.flatMap((id) => {
            const option = optionsById.get(id);
            return option ? [{ name: option.name, price: option.extraPrice }] : [];
          }),
      };
    });
    setCart(hydratedCart);
    saveCustomerCart(hydratedCart);
  }, [catalog]);

  const update = (next: CustomerCartLine[]) => {
    setCart(next);
    saveCustomerCart(next);
  };
  const totalQuantity = cart.reduce((sum, line) => sum + line.quantity, 0);
  const totalAmount = cart.reduce((sum, line) => sum + lineUnitPrice(line) * line.quantity, 0);

  function changeQuantity(index: number, quantity: number) {
    update(
      cart.flatMap((line, lineIndex) =>
        lineIndex !== index ? [line] : quantity <= 0 ? [] : [{ ...line, quantity }],
      ),
    );
  }

  async function submit() {
    if (cart.length === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
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
    <main className="w-full pb-52 md:pb-40">
      <header>
        <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          Món đang chọn
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
          Giỏ hàng của bạn
        </h1>
        <p className="mt-2 text-sm text-cas-on-surface-variant">
          Kiểm tra lại món và tùy chọn trước khi gửi.
        </p>
      </header>

      {cart.length === 0 ? (
        <div className="mt-8 rounded-3xl bg-cas-surface-container p-8 text-center">
          <p className="font-bold">Giỏ hàng đang trống.</p>
          <Link className="mt-4 inline-flex text-cas-primary underline" href="/menu">
            Chọn món
          </Link>
        </div>
      ) : (
        <>
          <aside className="mt-7 flex items-center gap-3 rounded-2xl border border-cas-secondary/25 bg-cas-secondary-container/20 p-4 text-sm text-cas-on-surface-variant">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cas-secondary text-cas-on-secondary">
              <CasIcon className="size-5" name="info" />
            </span>
            Bạn có thể gọi thêm món trong suốt bữa ăn và thanh toán một lần khi kết thúc.
          </aside>

          <section className="mt-7" aria-labelledby="cart-items-title">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold" id="cart-items-title">
                  Món mới
                </h2>
                <span className="grid min-w-6 place-items-center rounded-full bg-cas-primary px-2 py-1 text-[0.65rem] font-extrabold text-cas-on-primary">
                  {totalQuantity}
                </span>
              </div>
              <button
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-cas-primary transition hover:bg-cas-primary/10 focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
                onClick={() => setIsClearConfirmationOpen(true)}
                type="button"
              >
                <CasIcon className="size-4" name="trash" />
                Xóa tất cả
              </button>
            </div>

            <ul className="rounded-3xl bg-cas-surface-container px-5 shadow-[0_5px_18px_var(--cas-shadow-color)]">
              {cart.map((line, index) => {
                const optionAmount = (line.selectedOptions ?? []).reduce(
                  (sum, option) => sum + option.price,
                  0,
                );
                const hasPricing = line.basePrice !== undefined;
                const itemTotal = lineUnitPrice(line) * line.quantity;

                return (
                  <li
                    className="grid gap-4 border-b border-cas-outline-variant/35 py-5 last:border-0 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8"
                    key={line.menuItemId + "-" + line.optionValueIds.join("-")}
                  >
                    <div className="flex min-w-0 gap-4">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-cas-surface">
                        <Image
                          alt={line.itemName}
                          className="object-cover"
                          fill
                          sizes="5rem"
                          src={line.imageUrl ?? "/images/welcome/spicy-noodles.jpg"}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-start gap-2">
                          <h3 className="line-clamp-2 min-w-0 flex-1 text-sm leading-tight font-extrabold">
                            {line.itemName}
                          </h3>
                          <span className="shrink-0 text-xs font-bold text-cas-on-surface-variant">
                            ×{line.quantity}
                          </span>
                        </div>
                        {line.selectedOptions?.length ? (
                          <p className="mt-1 text-xs text-cas-on-surface-variant">
                            {line.selectedOptions.map((option) => option.name).join(", ")}
                          </p>
                        ) : null}
                        {hasPricing ? (
                          <div className="mt-3 space-y-1 text-xs text-cas-on-surface-variant">
                            <p className="flex justify-between gap-4">
                              <span>Giá món gốc</span>
                              <span>{formatMoney(line.basePrice ?? 0)}</span>
                            </p>
                            {line.selectedOptions?.map((option) => (
                              <p className="flex justify-between gap-4" key={option.name}>
                                <span>+ {option.name}</span>
                                <span>+{formatMoney(option.price)}</span>
                              </p>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-4 inline-flex h-10 items-center rounded-full bg-cas-secondary-container/30 p-1">
                          <button
                            aria-label={"Giảm số lượng " + line.itemName}
                            className="grid size-8 place-items-center rounded-full text-cas-primary transition hover:bg-cas-surface focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
                            onClick={() => changeQuantity(index, line.quantity - 1)}
                            type="button"
                          >
                            <CasIcon className="size-4" name="minus" />
                          </button>
                          <span className="min-w-8 text-center text-sm font-extrabold">
                            {line.quantity}
                          </span>
                          <button
                            aria-label={"Tăng số lượng " + line.itemName}
                            className="grid size-8 place-items-center rounded-full bg-cas-primary text-cas-on-primary transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                            onClick={() => changeQuantity(index, line.quantity + 1)}
                            type="button"
                          >
                            <CasIcon className="size-4" name="plus" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex min-w-30 flex-row items-center justify-between gap-4 md:flex-col md:items-end">
                      {hasPricing ? (
                        <strong className="text-base text-cas-primary">
                          {formatMoney(itemTotal)}
                        </strong>
                      ) : (
                        <span className="text-xs text-cas-on-surface-variant">
                          {line.optionValueIds.length} tùy chọn
                        </span>
                      )}
                      {optionAmount > 0 && line.quantity > 1 ? (
                        <span className="text-xs text-cas-on-surface-variant">
                          {formatMoney(lineUnitPrice(line))} × {line.quantity}
                        </span>
                      ) : null}
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-cas-on-surface-variant transition hover:bg-cas-primary/10 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
                        onClick={() => changeQuantity(index, 0)}
                        type="button"
                      >
                        <CasIcon className="size-4" name="trash" />
                        Xóa món
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            className="mt-7 border-t border-cas-outline-variant/55 pt-7"
            aria-labelledby="order-note-title"
          >
            <label className="block" htmlFor="order-note">
              <span className="text-lg font-extrabold" id="order-note-title">
                Ghi chú chung
              </span>
              <span className="mt-1 block text-xs text-cas-on-surface-variant">
                Ghi chú này áp dụng cho toàn bộ lần gửi món.
              </span>
              <textarea
                className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-cas-outline-variant/40 bg-cas-surface-container p-4 text-sm outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
                id="order-note"
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ví dụ: vui lòng phục vụ món cay sau..."
                value={note}
              />
            </label>
          </section>
        </>
      )}

      {cart.length > 0 ? (
        <div className="fixed inset-x-0 bottom-20 z-40 border-t border-cas-outline-variant/30 bg-cas-navigation px-5 py-3 shadow-[0_-8px_24px_var(--cas-shadow-color)] backdrop-blur-xl md:bottom-0">
          <div className="mx-auto w-full max-w-[42rem]">
            {error ? <p className="mb-2 text-sm font-bold text-cas-error">{error}</p> : null}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-cas-on-surface-variant">
                  Tạm tính ({totalQuantity} món)
                </p>
                <strong className="text-lg text-cas-primary">
                  {totalAmount > 0 ? formatMoney(totalAmount) : "Chưa có giá tạm tính"}
                </strong>
              </div>
              <Link
                className="text-xs font-bold text-cas-secondary underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
                href="/menu"
              >
                Chọn thêm món
              </Link>
            </div>
            <button
              className="mt-3 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring disabled:opacity-60"
              disabled={submitting}
              onClick={submit}
              type="button"
            >
              <CasIcon className="size-5" name="restaurant" />
              {submitting ? "Đang gửi..." : "Gửi món xuống bếp"}
            </button>
          </div>
        </div>
      ) : null}

      {isClearConfirmationOpen ? (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-cas-on-surface/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsClearConfirmationOpen(false);
          }}
        >
          <section
            aria-labelledby="clear-cart-title"
            aria-modal="true"
            className="w-full max-w-sm rounded-3xl bg-cas-surface p-6 shadow-[0_16px_36px_var(--cas-shadow-color)]"
            role="dialog"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-cas-primary/10 text-cas-primary">
                <CasIcon className="size-5" name="trash" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold" id="clear-cart-title">
                  Xóa tất cả món?
                </h2>
                <p className="mt-1 text-sm leading-6 text-cas-on-surface-variant">
                  Toàn bộ món đang chọn sẽ bị xóa khỏi giỏ hàng.
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => setIsClearConfirmationOpen(false)}
                type="button"
              >
                Quay lại
              </button>
              <button
                className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                onClick={() => {
                  update([]);
                  setIsClearConfirmationOpen(false);
                }}
                type="button"
              >
                Xóa tất cả
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

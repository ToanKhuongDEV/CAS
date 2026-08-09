"use client";

import Image from "next/image";

import { ItemQuantityControl } from "../../customer/item-quantity-control";
import { CasIcon } from "../../ui/cas-icon";
import type { TableOption } from "./operator-table-select-modal";

export type CartItem = {
  cartItemId: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  optionsSummary: string;
  unitPrice: number;
  quantity: number;
};

type OperatorCartPanelProps = {
  selectedTable: TableOption;
  cartItems: CartItem[];
  orderNote: string;
  isSubmitting: boolean;
  onChangeTableClick: () => void;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onOrderNoteChange: (note: string) => void;
  onSubmitOrder: () => void;
  onCloseMobileDrawer?: () => void;
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export function OperatorCartPanel({
  selectedTable,
  cartItems,
  orderNote,
  isSubmitting,
  onChangeTableClick,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderNoteChange,
  onSubmitOrder,
  onCloseMobileDrawer,
}: OperatorCartPanelProps) {
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartAmount = cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <div className="flex h-full flex-col rounded-[1.4rem] border border-cas-outline-variant/30 bg-cas-surface shadow-[0_8px_24px_var(--cas-shadow-color)]">
      {/* Table Context Header */}
      <div className="border-b border-cas-outline-variant/20 bg-cas-secondary-container/15 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-cas-secondary text-xs font-black text-cas-on-primary">
              {selectedTable.code}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-cas-on-surface">
                  {selectedTable.label}
                </h3>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.68rem] font-bold text-emerald-600 dark:text-emerald-400">
                  Phiên đang mở
                </span>
              </div>
              {selectedTable.customerName && (
                <p className="text-xs text-cas-on-surface-variant">
                  Khách: {selectedTable.customerName} ({selectedTable.customerPhone})
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onChangeTableClick}
              className="rounded-xl border border-cas-secondary/40 bg-cas-glass px-2.5 py-1 text-xs font-extrabold text-cas-secondary transition hover:bg-cas-secondary-container/30 focus-visible:outline-2 focus-visible:outline-cas-focus-ring"
            >
              Chọn bàn khác
            </button>
            {onCloseMobileDrawer && (
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="grid size-7 place-items-center rounded-lg bg-cas-glass text-cas-on-surface-variant transition hover:bg-cas-outline-variant/20 sm:hidden"
                aria-label="Đóng giỏ hàng"
              >
                <CasIcon className="size-4" name="minus" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items List - Matching Customer Cart layout */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-extrabold text-cas-on-surface">Món đã chọn</h4>
            <span className="grid min-w-6 place-items-center rounded-full bg-cas-primary px-2 py-0.5 text-[0.65rem] font-extrabold text-cas-on-primary">
              {totalItemCount}
            </span>
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-cas-primary transition hover:underline focus-visible:outline-2 focus-visible:outline-cas-focus-ring"
            >
              <CasIcon className="size-4" name="trash" />
              Xóa tất cả
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-cas-on-surface-variant">
            <span className="grid size-12 place-items-center rounded-2xl bg-cas-outline-variant/20 text-cas-on-surface-variant/60">
              <CasIcon className="size-6" name="basket" />
            </span>
            <p className="mt-3 text-sm font-bold text-cas-on-surface">Chưa có món nào trong đơn</p>
            <p className="mt-1 text-xs text-cas-on-surface-variant/80">
              Nhấp chọn món ở danh mục bên trái để đưa món vào đơn
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => (
              <article
                key={item.cartItemId}
                className="grid grid-cols-[5rem_1fr] gap-3 rounded-[1.2rem] bg-cas-surface-container p-3 shadow-[0_5px_18px_var(--cas-shadow-color)]"
              >
                <div className="relative min-h-20 overflow-hidden rounded-xl">
                  <Image
                    className="object-cover"
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    sizes="5rem"
                  />
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="line-clamp-2 text-sm leading-snug font-extrabold">
                        {item.name}
                      </h5>
                      <p className="mt-0.5 text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
                        {item.optionsSummary}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.cartItemId)}
                      className="grid size-7 shrink-0 place-items-center rounded-full text-cas-on-surface-variant transition hover:bg-cas-primary/10 hover:text-cas-primary focus-visible:outline-2 focus-visible:outline-cas-focus-ring"
                      aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                    >
                      <CasIcon className="size-4" name="trash" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                    <strong className="text-sm font-extrabold text-cas-primary">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </strong>
                    <ItemQuantityControl
                      itemName={item.name}
                      quantity={item.quantity}
                      onDecrease={() => onUpdateQuantity(item.cartItemId, -1)}
                      onIncrease={() => onUpdateQuantity(item.cartItemId, 1)}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Section Ghi chú chung - Identical to Customer Cart */}
        <section className="mt-6 border-t border-cas-outline-variant/40 pt-5">
          <label className="block" htmlFor="operator-order-note">
            <span className="text-sm font-extrabold text-cas-on-surface">Ghi chú chung</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-cas-on-surface-variant">
              Ghi chú này áp dụng cho toàn bộ lần gửi món.
            </span>
            <textarea
              id="operator-order-note"
              name="orderNote"
              rows={2}
              className="mt-2.5 w-full resize-none rounded-xl border border-cas-outline-variant/40 bg-cas-surface-container p-3 text-xs outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
              placeholder="Ví dụ: vui lòng phục vụ món cay sau..."
              value={orderNote}
              onChange={(e) => onOrderNoteChange(e.target.value)}
            />
          </label>
        </section>
      </div>

      {/* Summary Footer - Identical to Customer Cart */}
      <div className="border-t border-cas-outline-variant/20 bg-cas-navigation p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.68rem] font-semibold text-cas-on-surface-variant">
              Tạm tính ({totalItemCount} món)
            </p>
            <strong className="text-lg font-extrabold text-cas-primary">
              {formatPrice(totalCartAmount)}
            </strong>
          </div>
        </div>

        <button
          type="button"
          disabled={cartItems.length === 0 || isSubmitting}
          onClick={onSubmitOrder}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-cas-on-primary border-t-transparent" />
              <span>Đang gửi món...</span>
            </>
          ) : (
            <>
              <CasIcon className="size-5" name="restaurant" />
              <span>Gửi món xuống bếp</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

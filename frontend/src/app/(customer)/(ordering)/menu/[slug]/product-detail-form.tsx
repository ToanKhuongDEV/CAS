"use client";

import { useState } from "react";

import { CasIcon } from "../../../../../components/ui/cas-icon";

type ProductOption = {
  id: string;
  label: string;
  priceDelta: number;
};

type ProductDetailFormProps = {
  basePrice: number;
  productName: string;
  sizes?: ProductOption[];
  spiceLevels?: ProductOption[];
  toppings?: ProductOption[];
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export function ProductDetailForm({
  basePrice,
  productName,
  sizes,
  spiceLevels,
  toppings,
}: ProductDetailFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(sizes?.[0]?.id);
  const [selectedSpiceLevel, setSelectedSpiceLevel] = useState(spiceLevels?.[0]?.id);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);

  const selectedSizePrice = sizes?.find((size) => size.id === selectedSize)?.priceDelta ?? 0;
  const selectedToppingPrice =
    toppings
      ?.filter((topping) => selectedToppings.includes(topping.id))
      .reduce((total, topping) => total + topping.priceDelta, 0) ?? 0;
  const totalPrice = (basePrice + selectedSizePrice + selectedToppingPrice) * quantity;

  const handleToppingChange = (toppingId: string) => {
    setSelectedToppings((currentToppings) =>
      currentToppings.includes(toppingId)
        ? currentToppings.filter((id) => id !== toppingId)
        : [...currentToppings, toppingId],
    );
  };

  return (
    <>
      <div className="space-y-8">
        {spiceLevels ? (
          <fieldset>
            <legend className="text-xs font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
              Cấp độ cay
            </legend>
            <p className="mt-1 text-xs text-cas-on-surface-variant">
              Chọn một cấp độ phù hợp với bạn.
            </p>
            <select
              className="mt-4 h-12 w-full rounded-xl border border-cas-outline-variant/55 bg-cas-surface-container px-3 text-sm font-extrabold outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
              aria-label="Cấp độ cay"
              value={selectedSpiceLevel}
              onChange={(event) => setSelectedSpiceLevel(event.target.value)}
            >
              {spiceLevels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </fieldset>
        ) : null}

        {sizes ? (
          <fieldset>
            <legend className="text-xs font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
              Kích thước
            </legend>
            <p className="mt-1 text-xs text-cas-on-surface-variant">
              Chọn một size. Size M được chọn mặc định.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {sizes.map((size) => (
                <label className="cursor-pointer" key={size.id}>
                  <input
                    className="peer sr-only"
                    type="radio"
                    name="size"
                    value={size.id}
                    checked={selectedSize === size.id}
                    onChange={() => setSelectedSize(size.id)}
                  />
                  <span className="flex min-h-16 items-center justify-between rounded-2xl border border-cas-outline-variant/55 bg-cas-surface-container px-4 transition peer-checked:border-cas-primary peer-checked:bg-cas-primary/10 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cas-focus-ring">
                    <strong>{size.label}</strong>
                    <span className="text-xs font-bold text-cas-primary">
                      +{formatPrice(size.priceDelta)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {toppings ? (
          <fieldset>
            <legend className="text-xs font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
              Topping
            </legend>
            <p className="mt-1 text-xs text-cas-on-surface-variant">Có thể chọn nhiều topping.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {toppings.map((topping) => (
                <label className="cursor-pointer" key={topping.id}>
                  <input
                    className="peer sr-only"
                    type="checkbox"
                    name="toppings"
                    value={topping.id}
                    checked={selectedToppings.includes(topping.id)}
                    onChange={() => handleToppingChange(topping.id)}
                  />
                  <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-cas-outline-variant/55 bg-cas-surface-container px-4 transition peer-checked:border-cas-secondary peer-checked:bg-cas-secondary-container/20 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cas-focus-ring">
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition ${
                        selectedToppings.includes(topping.id)
                          ? "border-cas-secondary text-cas-secondary"
                          : "border-cas-outline-variant text-transparent"
                      }`}
                    >
                      <CasIcon className="size-4" name="check" />
                    </span>
                    <strong className="min-w-0 flex-1 text-sm">{topping.label}</strong>
                    <span className="text-xs font-bold text-cas-primary">
                      +{formatPrice(topping.priceDelta)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-cas-outline-variant/30 bg-cas-navigation px-5 py-3 shadow-[0_-8px_24px_var(--cas-shadow-color)] backdrop-blur-xl md:bottom-0">
        <div className="mx-auto flex w-full max-w-[42rem] items-center gap-3">
          <div
            className="flex h-13 shrink-0 items-center rounded-full bg-cas-surface-container p-1"
            aria-label={`Số lượng ${productName}: ${quantity}`}
          >
            <button
              className="grid size-11 place-items-center rounded-full text-cas-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
              type="button"
              disabled={quantity === 1}
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label={`Giảm số lượng ${productName}`}
            >
              <CasIcon className="size-5" name="minus" />
            </button>
            <span className="min-w-6 text-center text-sm font-extrabold">{quantity}</span>
            <button
              className="grid size-11 place-items-center rounded-full bg-cas-primary text-cas-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              type="button"
              onClick={() => setQuantity((current) => current + 1)}
              aria-label={`Tăng số lượng ${productName}`}
            >
              <CasIcon className="size-5" name="plus" />
            </button>
          </div>

          <button
            className="flex min-h-13 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
            type="button"
          >
            <CasIcon className="size-5 shrink-0" name="cart" />
            <span className="truncate">Thêm vào giỏ · {formatPrice(totalPrice)}</span>
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { MenuOptionGroup } from "../../../../../components/customer/add-to-cart-option-dialog";
import { CasIcon } from "../../../../../components/ui/cas-icon";
import { useToast } from "../../../../../components/ui/toast-provider";
import { addCustomerCartLine } from "../../../../../lib/customer/cart";
import { hasOpenCustomerTableSession } from "../../../../../lib/customer/table-session";

type ProductDetailFormProps = {
  basePrice: number;
  imageUrl: string | null;
  menuItemId: number;
  optionGroups: MenuOptionGroup[];
  productName: string;
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export function ProductDetailForm({
  basePrice,
  imageUrl,
  menuItemId,
  optionGroups,
  productName,
}: ProductDetailFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      optionGroups.map((group) => [
        group.id,
        group.selectionType === "SINGLE" && group.options[0]
          ? [group.options.find((option) => option.isDefault)?.id ?? group.options[0].id]
          : [],
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);

  const extraPrice = optionGroups.reduce(
    (sum, group) =>
      sum +
      group.options
        .filter((option) => selected[group.id]?.includes(option.id))
        .reduce((groupSum, option) => groupSum + option.priceDelta, 0),
    0,
  );

  function choose(group: MenuOptionGroup, optionId: string) {
    setSelected((current) => {
      const currentIds = current[group.id] ?? [];
      if (group.selectionType === "SINGLE") return { ...current, [group.id]: [optionId] };
      if (currentIds.includes(optionId)) {
        return { ...current, [group.id]: currentIds.filter((id) => id !== optionId) };
      }
      if (
        group.maxSelect !== null &&
        group.maxSelect !== undefined &&
        currentIds.length >= group.maxSelect
      ) {
        return current;
      }
      return { ...current, [group.id]: [...currentIds, optionId] };
    });
  }

  async function addToCart() {
    const invalidGroup = optionGroups.find(
      (group) => (selected[group.id]?.length ?? 0) < (group.minSelect ?? 0),
    );
    if (invalidGroup) {
      setError(`Vui lòng chọn ${invalidGroup.label}.`);
      return;
    }
    if (!(await hasOpenCustomerTableSession())) {
      router.push(`/scan?returnTo=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    addCustomerCartLine({
      basePrice,
      imageUrl,
      itemName: productName,
      menuItemId,
      optionValueIds: Object.values(selected).flat().map(Number),
      quantity,
      selectedOptions: optionGroups.flatMap((group) =>
        group.options
          .filter((option) => selected[group.id]?.includes(option.id))
          .map((option) => ({ name: option.label, price: option.priceDelta })),
      ),
    });
    window.dispatchEvent(new Event("cas-cart-updated"));
    showToast({ message: `Đã thêm ${productName} vào giỏ hàng.`, type: "success" });
    router.push("/cart");
  }

  return (
    <>
      <div className="space-y-6">
        {optionGroups.map((group) => (
          <fieldset key={group.id}>
            <legend className="text-xs font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
              {group.label}
            </legend>
            <p className="mt-1 text-xs text-cas-on-surface-variant">
              {group.minSelect ? `Chọn ít nhất ${group.minSelect} lựa chọn.` : "Tùy chọn thêm."}
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {group.options.map((option) => {
                const checked = selected[group.id]?.includes(option.id) ?? false;
                return (
                  <label className="cursor-pointer" key={option.id}>
                    <input
                      checked={checked}
                      className="peer sr-only"
                      name={group.id}
                      onChange={() => choose(group, option.id)}
                      type={group.selectionType === "SINGLE" ? "radio" : "checkbox"}
                      value={option.id}
                    />
                    <span className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-cas-outline-variant/55 bg-cas-surface-container px-3 text-sm transition peer-checked:border-cas-primary peer-checked:bg-cas-primary/10">
                      <span className="font-bold">{option.label}</span>
                      <span className="text-xs font-bold text-cas-primary">
                        +{formatPrice(option.priceDelta)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      {error ? <p className="mt-4 text-sm text-cas-error">{error}</p> : null}
      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-cas-outline-variant/30 bg-cas-navigation px-5 py-3 shadow-[0_-8px_24px_var(--cas-shadow-color)] backdrop-blur-xl md:bottom-0">
        <div className="mx-auto flex w-full max-w-[42rem] items-center gap-3">
          <div className="flex h-13 shrink-0 items-center rounded-full bg-cas-surface-container p-1">
            <button
              className="grid size-11 place-items-center rounded-full text-cas-primary disabled:opacity-40"
              disabled={quantity === 1}
              onClick={() => setQuantity((value) => value - 1)}
              type="button"
            >
              <CasIcon className="size-5" name="minus" />
            </button>
            <span className="min-w-6 text-center text-sm font-extrabold">{quantity}</span>
            <button
              className="grid size-11 place-items-center rounded-full bg-cas-primary text-cas-on-primary"
              onClick={() => setQuantity((value) => value + 1)}
              type="button"
            >
              <CasIcon className="size-5" name="plus" />
            </button>
          </div>
          <button
            className="flex min-h-13 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary"
            onClick={() => void addToCart()}
            type="button"
          >
            <CasIcon className="size-5 shrink-0" name="cart" />
            <span className="truncate">
              Thêm vào giỏ · {formatPrice((basePrice + extraPrice) * quantity)}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";

import { ItemQuantityControl } from "./item-quantity-control";
import { CasIcon } from "../ui/cas-icon";

type MenuOption = {
  id: string;
  isDefault?: boolean;
  label: string;
  priceDelta: number;
};

export type MenuOptionGroup = {
  id: string;
  label: string;
  maxSelect?: number | null;
  minSelect?: number;
  selectionType: "SINGLE" | "MULTIPLE";
  options: MenuOption[];
};

export type AddToCartPayload = {
  optionsSummary: string;
  extraPrice: number;
  totalUnitPrice: number;
  selectedOptionIds: Record<string, string[]>;
};

type AddToCartOptionDialogProps = {
  basePrice: number;
  currentQuantity?: number;
  itemName: string;
  optionGroups?: MenuOptionGroup[];
  onAddToCart?: (payload: AddToCartPayload) => void;
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export function AddToCartOptionDialog({
  basePrice,
  currentQuantity,
  itemName,
  optionGroups = [],
  onAddToCart,
}: AddToCartOptionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      optionGroups.map((group) => [
        group.id,
        group.selectionType === "SINGLE" && group.options[0]
          ? [group.options.find((option) => option.isDefault)?.id ?? group.options[0].id]
          : [],
      ]),
    ),
  );

  const selectedOptionPrice = optionGroups.reduce(
    (total, group) =>
      total +
      group.options
        .filter((option) => selectedOptions[group.id]?.includes(option.id))
        .reduce((groupTotal, option) => groupTotal + option.priceDelta, 0),
    0,
  );
  const itemId = itemName.toLocaleLowerCase().replaceAll(" ", "-");

  function handleOptionChange(group: MenuOptionGroup, optionId: string) {
    setSelectedOptions((current) => {
      const currentOptions = current[group.id] ?? [];

      if (group.selectionType === "SINGLE") {
        return { ...current, [group.id]: [optionId] };
      }

      return {
        ...current,
        [group.id]: currentOptions.includes(optionId)
          ? currentOptions.filter((id) => id !== optionId)
          : [...currentOptions, optionId],
      };
    });
  }

  function handleConfirm() {
    if (onAddToCart) {
      const summaryParts: string[] = [];
      for (const group of optionGroups) {
        const chosen = group.options.filter((option) =>
          selectedOptions[group.id]?.includes(option.id),
        );
        if (chosen.length > 0) {
          summaryParts.push(chosen.map((c) => c.label).join(", "));
        }
      }

      onAddToCart({
        optionsSummary: summaryParts.join(" • ") || "Món tiêu chuẩn",
        extraPrice: selectedOptionPrice,
        totalUnitPrice: basePrice + selectedOptionPrice,
        selectedOptionIds: selectedOptions,
      });
    }

    setIsOpen(false);
  }

  function handleTriggerClick() {
    if (optionGroups.length === 0 && onAddToCart) {
      onAddToCart({
        optionsSummary: "Món tiêu chuẩn",
        extraPrice: 0,
        totalUnitPrice: basePrice,
        selectedOptionIds: {},
      });
      return;
    }
    setIsOpen(true);
  }

  return (
    <>
      {currentQuantity && currentQuantity > 0 ? (
        <ItemQuantityControl
          itemName={itemName}
          quantity={currentQuantity}
          onIncrease={() => setIsOpen(true)}
        />
      ) : (
        <button
          className="grid size-9 place-items-center rounded-full bg-cas-primary text-cas-on-primary shadow-md transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
          type="button"
          aria-label={`Chọn tùy chọn cho ${itemName}`}
          onClick={handleTriggerClick}
        >
          <CasIcon className="size-5" name="plus" />
        </button>
      )}

      {isOpen ? (
        <div
          className="fixed inset-0 z-100 overflow-y-auto bg-cas-on-surface/55 px-5 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${itemId}-options-title`}
        >
          <section className="mx-auto my-auto w-full max-w-lg rounded-[1.4rem] bg-cas-surface-container p-5 shadow-[0_16px_36px_var(--cas-shadow-color)] md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
                  Chọn tùy chọn
                </p>
                <h2 className="mt-1 text-xl font-extrabold" id={`${itemId}-options-title`}>
                  {itemName}
                </h2>
              </div>
              <strong className="shrink-0 text-lg text-cas-primary">
                {formatPrice(basePrice)}
              </strong>
            </div>

            {optionGroups.length > 0 ? (
              <div className="mt-6 space-y-5">
                {optionGroups.map((group) => (
                  <fieldset key={group.id}>
                    <legend className="text-sm font-extrabold">{group.label}</legend>
                    <p className="mt-1 text-xs text-cas-on-surface-variant">
                      {group.selectionType === "SINGLE"
                        ? "Chọn một lựa chọn."
                        : "Có thể chọn nhiều lựa chọn."}
                    </p>
                    {group.id === "spice-level" ? (
                      <select
                        className="mt-3 h-12 w-full rounded-xl border border-cas-outline-variant/55 bg-cas-surface px-3 text-sm font-bold outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
                        aria-label={group.label}
                        value={selectedOptions[group.id]?.[0] ?? ""}
                        onChange={(event) => handleOptionChange(group, event.target.value)}
                      >
                        {group.options.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {group.options.map((option) => {
                          const isSelected = selectedOptions[group.id]?.includes(option.id);

                          return (
                            <label className="cursor-pointer" key={option.id}>
                              <input
                                className="peer sr-only"
                                type={group.selectionType === "SINGLE" ? "radio" : "checkbox"}
                                name={group.id}
                                value={option.id}
                                checked={isSelected}
                                onChange={() => handleOptionChange(group, option.id)}
                              />
                              <span className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-cas-outline-variant/55 bg-cas-surface px-3 text-sm transition peer-checked:border-cas-primary peer-checked:bg-cas-primary/10 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cas-focus-ring">
                                <span className="font-bold">{option.label}</span>
                                <span className="shrink-0 text-xs font-bold text-cas-primary">
                                  +{formatPrice(option.priceDelta)}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </fieldset>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-cas-on-surface-variant">
                Món này không có tùy chọn thêm.
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="min-h-12 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Quay lại
              </button>
              <button
                className="min-h-12 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                type="button"
                onClick={handleConfirm}
              >
                Thêm vào giỏ · {formatPrice(basePrice + selectedOptionPrice)}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

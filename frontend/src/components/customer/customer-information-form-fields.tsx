"use client";

import { FormEvent, useRef, useState } from "react";

import { CasIcon } from "../ui/cas-icon";

type CustomerInformationErrors = {
  customerName?: string;
  customerPhone?: string;
};

export type CustomerInformation = {
  customerName: string;
  customerPhone: string | null;
};

type CustomerInformationFormFieldsProps = {
  idPrefix?: string;
  onSubmitCustomerInfo: (information: CustomerInformation) => void;
  submitLabel?: string;
};

export function CustomerInformationFormFields({
  idPrefix = "customer",
  onSubmitCustomerInfo,
  submitLabel = "Mở phiên và xem thực đơn",
}: CustomerInformationFormFieldsProps) {
  const customerNameInputRef = useRef<HTMLInputElement>(null);
  const customerPhoneInputRef = useRef<HTMLInputElement>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [errors, setErrors] = useState<CustomerInformationErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: CustomerInformationErrors = {};

    if (!customerName.trim()) {
      nextErrors.customerName = "Vui lòng nhập tên của bạn.";
    }
    const normalizedCustomerPhone = customerPhone.replace(/\s/g, "");
    if (normalizedCustomerPhone && !/^0\d{9}$/.test(normalizedCustomerPhone)) {
      nextErrors.customerPhone = "Nhập số điện thoại Việt Nam gồm 10 chữ số, bắt đầu bằng 0.";
    }

    setErrors(nextErrors);

    if (nextErrors.customerName || nextErrors.customerPhone) {
      customerNameInputRef.current?.focus();
      if (!nextErrors.customerName) customerPhoneInputRef.current?.focus();
      return;
    }

    onSubmitCustomerInfo({
      customerName: customerName.trim(),
      customerPhone: normalizedCustomerPhone || null,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <label className="block" htmlFor={`${idPrefix}-name`}>
        <span className="text-xs font-bold">
          Tên của bạn <span aria-hidden="true">*</span>
        </span>
        <span className="relative mt-2 block">
          <CasIcon
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cas-primary/60"
            name="user"
          />
          <input
            ref={customerNameInputRef}
            className="h-13 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface pr-4 pl-12 text-sm outline-none placeholder:text-cas-on-surface-variant/55 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15 aria-invalid:border-cas-primary aria-invalid:ring-3 aria-invalid:ring-cas-primary/15"
            id={`${idPrefix}-name`}
            name="customerName"
            placeholder="Ví dụ: Nguyễn Văn A"
            autoComplete="name"
            maxLength={150}
            required
            type="text"
            value={customerName}
            aria-describedby={errors.customerName ? `${idPrefix}-name-error` : undefined}
            aria-invalid={errors.customerName ? true : undefined}
            onChange={(event) => {
              setCustomerName(event.target.value);
              if (errors.customerName) {
                setErrors((currentErrors) => ({ ...currentErrors, customerName: undefined }));
              }
            }}
          />
        </span>
      </label>
      {errors.customerName ? (
        <p className="mt-2 text-xs font-semibold text-cas-primary" id={`${idPrefix}-name-error`}>
          {errors.customerName}
        </p>
      ) : null}

      <label className="mt-5 block" htmlFor={`${idPrefix}-phone`}>
        <span className="text-xs font-bold">
          Số điện thoại{" "}
          <span className="font-medium text-cas-on-surface-variant">(không bắt buộc)</span>
        </span>
        <span className="relative mt-2 block">
          <CasIcon
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cas-primary/60"
            name="phone"
          />
          <input
            ref={customerPhoneInputRef}
            className="h-13 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface pr-4 pl-12 text-sm outline-none placeholder:text-cas-on-surface-variant/55 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15 aria-invalid:border-cas-primary aria-invalid:ring-3 aria-invalid:ring-cas-primary/15"
            id={`${idPrefix}-phone`}
            name="customerPhone"
            placeholder="09xx xxx xxx"
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            type="tel"
            value={customerPhone}
            aria-describedby={errors.customerPhone ? `${idPrefix}-phone-error` : undefined}
            aria-invalid={errors.customerPhone ? true : undefined}
            onChange={(event) => {
              setCustomerPhone(event.target.value);
              if (errors.customerPhone) {
                setErrors((currentErrors) => ({ ...currentErrors, customerPhone: undefined }));
              }
            }}
          />
        </span>
      </label>
      {errors.customerPhone ? (
        <p className="mt-2 text-xs font-semibold text-cas-primary" id={`${idPrefix}-phone-error`}>
          {errors.customerPhone}
        </p>
      ) : null}
      <button
        className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
        type="submit"
      >
        {submitLabel}
        <CasIcon className="size-5" name="arrow" />
      </button>
    </form>
  );
}

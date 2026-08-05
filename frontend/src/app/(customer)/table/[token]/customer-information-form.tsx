"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

import { CasIcon } from "../../../../components/ui/cas-icon";

type CustomerInformationErrors = {
  customerName?: string;
  customerPhone?: string;
};

export function CustomerInformationForm() {
  const router = useRouter();
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

    if (!customerPhone.trim()) {
      nextErrors.customerPhone = "Vui lòng nhập số điện thoại.";
    }

    setErrors(nextErrors);

    if (nextErrors.customerName) {
      customerNameInputRef.current?.focus();
      return;
    }

    if (nextErrors.customerPhone) {
      customerPhoneInputRef.current?.focus();
      return;
    }

    router.push("/menu");
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <label className="block" htmlFor="customer-name">
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
            id="customer-name"
            name="customerName"
            placeholder="Ví dụ: Nguyễn Văn A"
            autoComplete="name"
            maxLength={150}
            required
            type="text"
            value={customerName}
            aria-describedby={
              errors.customerName ? "customer-name-error" : undefined
            }
            aria-invalid={errors.customerName ? true : undefined}
            onChange={(event) => {
              setCustomerName(event.target.value);
              if (errors.customerName) {
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  customerName: undefined,
                }));
              }
            }}
          />
        </span>
      </label>
      {errors.customerName ? (
        <p
          className="mt-2 text-xs font-semibold text-cas-primary"
          id="customer-name-error"
        >
          {errors.customerName}
        </p>
      ) : null}

      <label className="mt-5 block" htmlFor="customer-phone">
        <span className="text-xs font-bold">
          Số điện thoại <span aria-hidden="true">*</span>
        </span>
        <span className="relative mt-2 block">
          <CasIcon
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cas-primary/60"
            name="phone"
          />
          <input
            ref={customerPhoneInputRef}
            className="h-13 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface pr-4 pl-12 text-sm outline-none placeholder:text-cas-on-surface-variant/55 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15 aria-invalid:border-cas-primary aria-invalid:ring-3 aria-invalid:ring-cas-primary/15"
            id="customer-phone"
            name="customerPhone"
            placeholder="09xx xxx xxx"
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            required
            type="tel"
            value={customerPhone}
            aria-describedby={
              errors.customerPhone ? "customer-phone-error" : undefined
            }
            aria-invalid={errors.customerPhone ? true : undefined}
            onChange={(event) => {
              setCustomerPhone(event.target.value);
              if (errors.customerPhone) {
                setErrors((currentErrors) => ({
                  ...currentErrors,
                  customerPhone: undefined,
                }));
              }
            }}
          />
        </span>
      </label>
      {errors.customerPhone ? (
        <p
          className="mt-2 text-xs font-semibold text-cas-primary"
          id="customer-phone-error"
        >
          {errors.customerPhone}
        </p>
      ) : null}

      <button
        className="mt-6 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
        type="submit"
      >
        Mở phiên và xem thực đơn
        <CasIcon className="size-5" name="arrow" />
      </button>
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";

import { CasIcon } from "../ui/cas-icon";

type CancellationRequestControlProps = {
  itemName: string;
  quantity: number;
};

export function CancellationRequestControl({
  itemName,
  quantity,
}: CancellationRequestControlProps) {
  const [isRequestFormOpen, setIsRequestFormOpen] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [isPending, setIsPending] = useState(false);

  const itemId = itemName.toLocaleLowerCase().replaceAll(" ", "-");

  function handleSubmitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setIsRequestFormOpen(false);
  }

  return (
    <>
      {isPending ? (
      <button
        className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-cas-tertiary-container/25 px-2.5 py-1 text-[0.65rem] font-bold text-cas-on-surface-variant transition hover:bg-cas-tertiary-container/40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
        type="button"
        onClick={() => setIsRequestFormOpen(true)}
      >
        <CasIcon className="size-3.5 text-cas-tertiary" name="minus" />
        Chờ xác nhận
      </button>
      ) : (
        <button
        className="mt-3 inline-flex min-h-8 items-center gap-1 rounded-lg px-1 text-[0.68rem] font-bold text-cas-primary transition hover:bg-cas-primary/8 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
        type="button"
        onClick={() => setIsRequestFormOpen(true)}
      >
        <CasIcon className="size-3.5" name="minus" />
        Yêu cầu hủy
      </button>
      )}

      {isRequestFormOpen ? (
        <div
          className="fixed inset-0 z-100 grid place-items-center bg-cas-on-surface/55 px-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${itemId}-cancellation-title`}
        >
          <form
            className="w-full max-w-sm rounded-[1.4rem] bg-cas-surface-container p-5 shadow-[0_16px_36px_var(--cas-shadow-color)]"
            onSubmit={handleSubmitRequest}
          >
            <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
              {isPending ? "Cập nhật yêu cầu hủy" : "Yêu cầu hủy món"}
            </p>
            <h2
              className="mt-1 text-xl font-extrabold"
              id={`${itemId}-cancellation-title`}
            >
              {itemName}
            </h2>

            <label className="mt-5 block" htmlFor={`${itemId}-quantity`}>
              <span className="text-sm font-bold">Số lượng muốn hủy</span>
              <select
                className="mt-2 h-11 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 text-sm outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
                id={`${itemId}-quantity`}
                value={requestedQuantity}
                onChange={(event) => setRequestedQuantity(Number(event.target.value))}
              >
                {Array.from({ length: quantity }, (_, index) => index + 1).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value} phần
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="mt-4 block" htmlFor={`${itemId}-reason`}>
              <span className="text-sm font-bold">Lý do (không bắt buộc)</span>
              <textarea
                className="mt-2 min-h-24 w-full resize-none rounded-xl border border-cas-outline-variant/40 bg-cas-surface p-3 text-sm outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
                id={`${itemId}-reason`}
                placeholder="Ví dụ: gọi nhầm món..."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>

            <p className="mt-3 text-xs leading-relaxed text-cas-on-surface-variant">
              Yêu cầu sẽ được nhân viên duyệt trước khi số tiền cần thanh toán được cập nhật.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                type="button"
                onClick={() => setIsRequestFormOpen(false)}
              >
                Quay lại
              </button>
              <button
                className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                type="submit"
              >
                {isPending ? "Cập nhật yêu cầu" : "Gửi yêu cầu"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

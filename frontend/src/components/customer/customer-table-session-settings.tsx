"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cancelCustomerTableSession } from "../../lib/api/ordering/ordering.api";
import { getCurrentCustomerTableSession } from "../../lib/customer/table-session";
import { CasIcon } from "../ui/cas-icon";

export function CustomerTableSessionSettings() {
  const router = useRouter();
  const [isCancellable, setIsCancellable] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getCurrentCustomerTableSession()
      .then((session) => {
        if (active) setIsCancellable(session.sessionStatus === "OPEN");
      })
      .catch(() => {
        if (active) setIsCancellable(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function cancelSession() {
    if (isCancelling) return;

    setError(null);
    setIsCancelling(true);
    try {
      await cancelCustomerTableSession();
      setIsConfirmOpen(false);
      router.replace("/");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể hủy phiên bàn.");
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <section
      className="mt-5 rounded-2xl border border-cas-error/25 bg-cas-surface-container p-5 shadow-[0_8px_24px_var(--cas-shadow-color)]"
      aria-labelledby="table-session-setting-title"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold" id="table-session-setting-title">
              Hủy phiên bàn
            </h2>
            <span
              aria-label="Chỉ hủy được khi chưa gửi món nào xuống bếp."
              className="inline-flex text-cas-on-surface-variant"
              role="img"
              title="Chỉ hủy được khi chưa gửi món nào xuống bếp."
            >
              <CasIcon className="size-4" name="info" />
            </span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-cas-on-surface-variant">
            Kết thúc phiên bàn hiện tại khi bạn không tiếp tục gọi món.
          </p>
        </div>
        <button
          className="shrink-0 rounded-xl border border-cas-error/45 px-3 py-2 text-sm font-bold text-cas-error transition hover:bg-cas-error/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isCancellable}
          onClick={() => setIsConfirmOpen(true)}
          title={
            isCancellable
              ? "Hủy phiên bàn hiện tại"
              : "Cần có phiên bàn đang mở để thực hiện thao tác này"
          }
          type="button"
        >
          Hủy phiên
        </button>
      </div>

      {isConfirmOpen ? (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-cas-on-surface/45 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isCancelling) setIsConfirmOpen(false);
          }}
        >
          <section
            aria-labelledby="cancel-session-dialog-title"
            aria-modal="true"
            className="w-full max-w-sm rounded-3xl bg-cas-surface p-6 shadow-[0_16px_36px_var(--cas-shadow-color)]"
            role="dialog"
          >
            <h2 className="text-lg font-extrabold" id="cancel-session-dialog-title">
              Hủy phiên bàn này?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-cas-on-surface-variant">
              Chỉ hủy được nếu chưa gửi món nào xuống bếp. Thao tác này không thể hoàn tác.
            </p>
            {error ? <p className="mt-3 text-sm font-semibold text-cas-error">{error}</p> : null}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                disabled={isCancelling}
                onClick={() => setIsConfirmOpen(false)}
                type="button"
              >
                Quay lại
              </button>
              <button
                className="min-h-11 rounded-xl bg-cas-error px-4 text-sm font-extrabold text-cas-on-error focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring disabled:opacity-60"
                disabled={isCancelling}
                onClick={() => void cancelSession()}
                type="button"
              >
                {isCancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

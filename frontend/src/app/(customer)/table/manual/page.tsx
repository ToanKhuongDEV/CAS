"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CustomerInformationFormFields } from "../../../../components/customer/customer-information-form-fields";
import { loadCustomerNotifications } from "../../../../lib/api/notification/notification.api";
import {
  resolveCustomerSalesSessionByTable,
  type SalesSessionResolution,
} from "../../../../lib/customer/sales-session";

export default function ManualTablePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resolution, setResolution] = useState<SalesSessionResolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedNotifications = useRef(false);
  const storeId = Number(searchParams.get("storeId"));
  const tableCode = Number(searchParams.get("tableCode"));
  const isValidTable =
    Number.isSafeInteger(storeId) &&
    storeId > 0 &&
    Number.isSafeInteger(tableCode) &&
    tableCode > 0;

  function destination(status: SalesSessionResolution["sessionStatus"]) {
    if (status === "PAYMENT_PENDING") return "/payment";
    const returnTo = searchParams.get("returnTo");
    return returnTo?.startsWith("/") ? returnTo : "/menu";
  }

  function loadNotificationsOnce() {
    if (hasLoadedNotifications.current) return;
    hasLoadedNotifications.current = true;
    void loadCustomerNotifications().catch(() => undefined);
  }

  async function resolveTable(input?: {
    customerName?: string;
    customerPhone?: string | null;
    joinSessionId?: string;
  }) {
    if (!isValidTable) return;
    try {
      setError(null);
      const nextResolution = await resolveCustomerSalesSessionByTable({
        storeId,
        tableCode,
        ...input,
      });
      if (nextResolution.customerInformationRequired || nextResolution.joinSessionRequired) {
        setResolution(nextResolution);
        return;
      }
      loadNotificationsOnce();
      router.replace(destination(nextResolution.sessionStatus));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể xác thực bàn đã chọn.");
    }
  }

  useEffect(() => {
    void resolveTable();
    // The query parameters identify the selected table for this page instance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isValidTable) {
    return <main className="p-6 text-cas-error">Thông tin bàn không hợp lệ.</main>;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <h1 className="text-2xl font-extrabold">Bàn {tableCode}</h1>
      {resolution?.customerInformationRequired ? (
        <div className="mt-5">
          <CustomerInformationFormFields
            onSubmitCustomerInfo={(information) => void resolveTable(information)}
            phoneRequired={false}
          />
        </div>
      ) : null}
      {resolution?.joinSessionRequired ? (
        <div className="mt-5 space-y-3">
          <p className="text-sm leading-relaxed text-cas-on-surface-variant">
            Bạn có đang chung bàn với ai dưới đây không?
          </p>
          {resolution.joinableSessions.map((session) => (
            <button
              className="flex w-full items-center justify-between rounded-xl border border-cas-outline-variant px-4 py-3 text-left"
              key={session.sessionId}
              onClick={() => void resolveTable({ joinSessionId: session.sessionId })}
              type="button"
            >
              <span className="font-bold">{session.customerName}</span>
              <span className="text-sm font-bold text-cas-primary">Chung bàn</span>
            </button>
          ))}
          <button
            className="w-full rounded-xl border border-cas-outline-variant px-4 py-3 text-sm font-bold"
            onClick={() =>
              setResolution((current) =>
                current
                  ? { ...current, customerInformationRequired: true, joinSessionRequired: false }
                  : current,
              )
            }
            type="button"
          >
            Không chung bàn
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
      {!resolution && !error ? (
        <p className="mt-3 text-sm text-cas-on-surface-variant">Đang xác thực số bàn…</p>
      ) : null}
    </main>
  );
}

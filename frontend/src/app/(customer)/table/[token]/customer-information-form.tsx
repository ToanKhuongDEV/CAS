"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CustomerInformationFormFields } from "../../../../components/customer/customer-information-form-fields";
import {
  resolveCustomerSalesSession,
  type SalesSessionResolution,
} from "../../../../lib/customer/sales-session";
import { loadCustomerNotifications } from "../../../../lib/api/notification/notification.api";

export function CustomerInformationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ token: string }>();
  const [resolution, setResolution] = useState<SalesSessionResolution | null>(null);
  const [sessionType, setSessionType] = useState<"DINE_IN" | "TAKEAWAY" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedNotifications = useRef(false);

  function destination(status: SalesSessionResolution["sessionStatus"]) {
    if (status === "PAYMENT_PENDING") return "/payment";
    const returnTo = searchParams.get("returnTo");
    return returnTo?.startsWith("/menu") || returnTo === "/cart" ? returnTo : "/menu";
  }

  function loadNotificationsOnce() {
    if (hasLoadedNotifications.current) return;
    hasLoadedNotifications.current = true;
    void loadCustomerNotifications().catch(() => undefined);
  }

  function resolveDineIn() {
    if (typeof params.token !== "string") return;
    setError(null);
    resolveCustomerSalesSession(params.token)
      .then((nextResolution) => {
        if (nextResolution.customerInformationRequired || nextResolution.joinSessionRequired) {
          setResolution(nextResolution);
          return;
        }
        loadNotificationsOnce();
        router.replace(destination(nextResolution.sessionStatus));
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Không thể xác thực mã QR của bàn."),
      );
  }

  useEffect(() => {
    if (typeof params.token === "string") {
      window.sessionStorage.setItem("cas.tableQrToken", params.token);
    }
  }, [params.token]);

  function chooseDineIn() {
    setSessionType("DINE_IN");
    resolveDineIn();
  }

  function chooseTakeaway() {
    setSessionType("TAKEAWAY");
    setResolution({
      customerInformationRequired: true,
      joinSessionRequired: false,
      joinableSessions: [],
      sessionStatus: "CUSTOMER_INFORMATION_REQUIRED",
      tableCode: null,
    });
  }

  async function handleSubmitCustomerInformation(information: {
    customerName: string;
    customerPhone: string | null;
  }) {
    if (typeof params.token !== "string") {
      return;
    }

    try {
      setError(null);
      const nextResolution = await resolveCustomerSalesSession(params.token, {
        ...information,
        sessionType: sessionType ?? "DINE_IN",
      });
      if (!nextResolution.customerInformationRequired && !nextResolution.joinSessionRequired) {
        loadNotificationsOnce();
        router.push(destination(nextResolution.sessionStatus));
      } else {
        setResolution(nextResolution);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể mở phiên bàn.");
    }
  }

  async function joinSession(sessionId: string) {
    if (typeof params.token !== "string") return;
    try {
      setError(null);
      const nextResolution = await resolveCustomerSalesSession(params.token, {
        joinSessionId: sessionId,
      });
      loadNotificationsOnce();
      router.push(destination(nextResolution.sessionStatus));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể tham gia phiên bàn.");
    }
  }

  if (!sessionType) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <button
          className="min-h-20 rounded-xl bg-cas-primary px-3 font-bold text-cas-on-primary"
          onClick={chooseDineIn}
          type="button"
        >
          Ăn tại quán
        </button>
        <button
          className="min-h-20 rounded-xl border border-cas-primary px-3 font-bold text-cas-primary"
          onClick={chooseTakeaway}
          type="button"
        >
          Mang về
        </button>
      </div>
    );
  }

  if (resolution?.customerInformationRequired) {
    return (
      <>
        <CustomerInformationFormFields
          onSubmitCustomerInfo={handleSubmitCustomerInformation}
          phoneRequired={sessionType === "TAKEAWAY"}
          submitLabel={sessionType === "TAKEAWAY" ? "Tạo đơn mang về" : undefined}
        />
        {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
      </>
    );
  }

  if (resolution?.joinSessionRequired) {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed text-cas-on-surface-variant">
          Bạn có đang chung bàn với ai dưới đây không?
        </p>
        {resolution.joinableSessions.map((session) => (
          <button
            className="flex w-full items-center justify-between rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-4 py-3 text-left transition hover:border-cas-primary"
            key={session.sessionId}
            onClick={() => void joinSession(session.sessionId)}
            type="button"
          >
            <span className="font-bold text-cas-on-surface">{session.customerName}</span>
            <span className="text-sm font-bold text-cas-primary">Chung bàn</span>
          </button>
        ))}
        <button
          className="w-full rounded-xl border border-cas-outline-variant/50 px-4 py-3 text-sm font-bold text-cas-on-surface transition hover:bg-cas-surface"
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
        {error ? <p className="text-sm text-cas-error">{error}</p> : null}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-cas-error">{error}</p>
        <button
          className="text-sm font-bold text-cas-primary"
          onClick={resolveDineIn}
          type="button"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return <p className="text-sm text-cas-on-surface-variant">Đang xác thực mã QR của bàn…</p>;
}

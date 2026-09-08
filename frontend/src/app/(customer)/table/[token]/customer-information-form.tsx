"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CustomerInformationFormFields } from "../../../../components/customer/customer-information-form-fields";
import {
  resolveCustomerTableSession,
  type CustomerTableSessionResolution,
} from "../../../../lib/customer/table-session";
import { loadCustomerNotifications } from "../../../../lib/api/notification/notification.api";

export function CustomerInformationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ token: string }>();
  const [resolution, setResolution] = useState<CustomerTableSessionResolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedNotifications = useRef(false);

  function destination(status: CustomerTableSessionResolution["sessionStatus"]) {
    if (status === "PAYMENT_PENDING") return "/payment";
    const returnTo = searchParams.get("returnTo");
    return returnTo?.startsWith("/menu") || returnTo === "/cart" ? returnTo : "/menu";
  }

  function loadNotificationsOnce() {
    if (hasLoadedNotifications.current) return;
    hasLoadedNotifications.current = true;
    void loadCustomerNotifications().catch(() => undefined);
  }

  function resolve() {
    if (typeof params.token !== "string") return;
    setError(null);
    resolveCustomerTableSession(params.token)
      .then((nextResolution) => {
        if (nextResolution.customerInformationRequired) {
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
      resolve();
    }
  }, [params.token]);

  async function handleSubmitCustomerInformation(information: {
    customerName: string;
    customerPhone: string | null;
  }) {
    if (typeof params.token !== "string") {
      return;
    }

    try {
      setError(null);
      const nextResolution = await resolveCustomerTableSession(params.token, information);
      if (!nextResolution.customerInformationRequired) {
        loadNotificationsOnce();
        router.push(destination(nextResolution.sessionStatus));
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể mở phiên bàn.");
    }
  }

  if (resolution?.customerInformationRequired) {
    return (
      <>
        <CustomerInformationFormFields onSubmitCustomerInfo={handleSubmitCustomerInformation} />
        {error ? <p className="mt-3 text-sm text-cas-error">{error}</p> : null}
      </>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-cas-error">{error}</p>
        <button className="text-sm font-bold text-cas-primary" onClick={resolve} type="button">
          Thử lại
        </button>
      </div>
    );
  }

  return <p className="text-sm text-cas-on-surface-variant">Đang xác thực mã QR của bàn…</p>;
}

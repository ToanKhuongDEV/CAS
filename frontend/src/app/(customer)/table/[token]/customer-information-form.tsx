"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CustomerInformationFormFields } from "../../../../components/customer/customer-information-form-fields";
import {
  resolveCustomerTableSession,
  type CustomerTableSessionResolution,
} from "../../../../lib/customer/table-session";

export function CustomerInformationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ token: string }>();
  const [resolution, setResolution] = useState<CustomerTableSessionResolution | null>(null);

  useEffect(() => {
    if (typeof params.token === "string") {
      window.sessionStorage.setItem("cas.tableQrToken", params.token);
      resolveCustomerTableSession(params.token)
        .then((nextResolution) => {
          if (nextResolution.customerInformationRequired) {
            setResolution(nextResolution);
            return;
          }
          router.replace(searchParams.get("returnTo") === "/cart" ? "/cart" : "/menu");
        })
        .catch(() => setResolution(null));
    }
  }, [params.token, router, searchParams]);

  async function handleSubmitCustomerInformation(information: {
    customerName: string;
    customerPhone: string | null;
  }) {
    if (typeof params.token !== "string") {
      return;
    }

    const nextResolution = await resolveCustomerTableSession(params.token, information);
    if (!nextResolution.customerInformationRequired) {
      router.push(searchParams.get("returnTo") === "/cart" ? "/cart" : "/menu");
    }
  }

  if (resolution?.customerInformationRequired) {
    return <CustomerInformationFormFields onSubmitCustomerInfo={handleSubmitCustomerInformation} />;
  }

  return <p className="text-sm text-cas-on-surface-variant">Đang xác thực mã QR của bàn…</p>;
}

"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import { CustomerInformationFormFields } from "../../../../components/customer/customer-information-form-fields";

export function CustomerInformationForm() {
  const router = useRouter();
  const params = useParams<{ token: string }>();

  useEffect(() => {
    if (typeof params.token === "string") {
      window.sessionStorage.setItem("cas.tableQrToken", params.token);
    }
  }, [params.token]);

  return <CustomerInformationFormFields onSubmitCustomerInfo={() => router.push("/menu")} />;
}

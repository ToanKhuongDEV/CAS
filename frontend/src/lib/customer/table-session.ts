const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = {
  data: T;
};

export type CustomerTableSessionResolution = {
  customerInformationRequired: boolean;
  sessionStatus: "CUSTOMER_INFORMATION_REQUIRED" | "OPEN" | "PAYMENT_PENDING";
  tableCode: number | null;
};

export async function resolveCustomerTableSession(
  qrToken: string,
  customerInformation?: { customerName: string; customerPhone: string | null },
): Promise<CustomerTableSessionResolution> {
  const response = await fetch(`${apiUrl}/api/v1/customer/table-sessions/resolve-qr`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrToken, ...customerInformation }),
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isCustomerTableSessionResolutionResponse(body)) {
    throw new Error("Không thể xác thực phiên bàn từ mã QR.");
  }

  return body.data;
}

function isCustomerTableSessionResolutionResponse(
  value: unknown,
): value is ApiResponse<CustomerTableSessionResolution> {
  if (!value || typeof value !== "object" || !("data" in value)) {
    return false;
  }

  const { data } = value;
  return Boolean(
    data &&
      typeof data === "object" &&
      "customerInformationRequired" in data &&
      typeof data.customerInformationRequired === "boolean" &&
      "sessionStatus" in data &&
      (data.sessionStatus === "CUSTOMER_INFORMATION_REQUIRED" ||
        data.sessionStatus === "OPEN" ||
        data.sessionStatus === "PAYMENT_PENDING"),
  );
}

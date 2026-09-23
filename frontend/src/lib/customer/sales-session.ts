const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = {
  data: T;
};

export type SalesSessionResolution = {
  customerInformationRequired: boolean;
  sessionStatus: "CUSTOMER_INFORMATION_REQUIRED" | "OPEN" | "PAYMENT_PENDING";
  tableCode: number | null;
};

export async function resolveCustomerSalesSession(
  qrToken: string,
  customerInformation?: { customerName: string; customerPhone: string | null },
): Promise<SalesSessionResolution> {
  const response = await fetch(`${apiUrl}/api/v1/customer/sales-sessions/resolve-qr`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qrToken, ...customerInformation }),
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isSalesSessionResolutionResponse(body)) {
    throw new Error(getBackendErrorMessage(body, "Không thể xác thực phiên bàn từ mã QR."));
  }

  return body.data;
}

export async function getCurrentCustomerSalesSession(): Promise<SalesSessionResolution> {
  const response = await fetch(`${apiUrl}/api/v1/customer/sales-sessions/current`, {
    credentials: "include",
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isSalesSessionResolutionResponse(body)) {
    throw new Error("Không tìm thấy phiên bàn hiện tại.");
  }

  return body.data;
}

export async function hasOpenCustomerSalesSession(): Promise<boolean> {
  try {
    return (await getCurrentCustomerSalesSession()).sessionStatus === "OPEN";
  } catch {
    return false;
  }
}

function isSalesSessionResolutionResponse(
  value: unknown,
): value is ApiResponse<SalesSessionResolution> {
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

function getBackendErrorMessage(body: unknown, fallback: string) {
  return body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string" &&
    body.message.trim()
    ? body.message
    : fallback;
}

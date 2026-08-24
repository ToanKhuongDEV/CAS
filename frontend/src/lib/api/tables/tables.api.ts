import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const tablesPath = "/api/v1/admin/tables";

type ApiResponse<T> = { data: T };

export type AdminDiningTable = {
  activeQrToken: string | null;
  capacity: number | null;
  code: number;
  id: number;
  sessionStatus: "OPEN" | "PAYMENT_PENDING" | null;
};

export type ActiveTableQrCode = {
  tableCode: number;
  tableId: number;
  token: string;
};

export function loadDiningTables() {
  return request<AdminDiningTable[]>("");
}

export function createDiningTable(code: number, capacity: number | null = null) {
  return request<AdminDiningTable>("", {
    body: JSON.stringify({ capacity, code }),
    method: "POST",
  });
}

export function loadActiveTableQrCode(tableId: number) {
  return request<ActiveTableQrCode>(`/${tableId}/qr`);
}

export function deleteDiningTable(tableId: number) {
  return request<void>(`/${tableId}`, { method: "DELETE" });
}

async function request<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

  const response = await fetch(`${apiUrl}${tablesPath}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body)) {
    throw new Error(getBackendErrorMessage(body, "Không thể xử lý dữ liệu bàn ăn."));
  }
  return body.data;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "data" in value);
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

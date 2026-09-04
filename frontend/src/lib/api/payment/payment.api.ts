import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T; message?: string };
export type Payment = {
  publicId: string;
  tableCode: number;
  amount: number;
  status: "PENDING" | "PAID";
  confirmedAt: string | null;
  billSnapshot: string;
};

export function loadCustomerPayment() {
  return customer<Payment>("/payments");
}
export function createCustomerPayment() {
  return customer<Payment>("/payments", { method: "POST" });
}
export function loadOperatorPayments() {
  return operator<Payment[]>("/payments");
}
export function confirmOperatorPayment(id: string) {
  return operator<Payment>(`/payments/${encodeURIComponent(id)}/confirm`, { method: "POST" });
}

async function customer<T>(path: string, init: RequestInit = {}) {
  return request<T>(`/api/v1/customer${path}`, { ...init, credentials: "include" });
}
async function operator<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn.");
  return request<T>(`/api/v1/operator${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await user.getIdToken()}`, ...init.headers },
  });
}
async function request<T>(path: string, init: RequestInit) {
  const response = await fetch(`${apiUrl}${path}`, { ...init, cache: "no-store" });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body)) {
    throw new Error(getMessage(body, "Không thể xử lý thanh toán."));
  }
  return body.data;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "data" in value);
}

function getMessage(value: unknown, fallback: string) {
  return value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
    ? value.message
    : fallback;
}

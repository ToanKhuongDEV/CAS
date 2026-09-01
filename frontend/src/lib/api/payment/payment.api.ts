import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T };
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
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok) throw new Error("Không thể xử lý payment.");
  return body.data;
}

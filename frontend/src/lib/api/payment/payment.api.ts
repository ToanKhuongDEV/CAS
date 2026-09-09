import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T; message?: string };
export const operatorPendingPaymentCountQueryKey = [
  "operator",
  "payments",
  "pending-count",
] as const;

export type Payment = {
  publicId: string;
  tableCode: number;
  amount: number;
  status: "PENDING" | "PAID";
  confirmedAt: string | null;
  createdAt: string;
  billSnapshot: string;
};
export type UnpaidRecord = {
  publicId: string;
  tableSessionId: string;
  tableCode: number;
  amount: number;
  billSnapshot: string;
  status: "OPEN" | "RESOLVED";
  reason: string | null;
  reportedByName: string;
  paymentId: string;
  resolvedAt: string | null;
  createdAt: string;
};
export type EligibleUnpaidSession = {
  sessionId: string;
  tableCode: number;
  amount: number;
  sessionStatus: "OPEN" | "PAYMENT_PENDING";
  openedAt: string;
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
export function loadOperatorPaidTodayPayments() {
  return operator<Payment[]>("/payments/paid-today");
}
export function loadOperatorPendingPaymentCount() {
  return operator<number>("/payments/pending-count");
}
export function confirmOperatorPayment(id: string) {
  return operator<Payment>(`/payments/${encodeURIComponent(id)}/confirm`, { method: "POST" });
}
export function loadOperatorUnpaidRecords(status?: "OPEN" | "RESOLVED") {
  const query = status ? `?status=${status}` : "";
  return operator<UnpaidRecord[]>(`/unpaid-records${query}`);
}
export function loadEligibleUnpaidSessions(minimumOpenMinutes: number) {
  return operator<EligibleUnpaidSession[]>(
    `/unpaid-records/eligible-sessions?minimumOpenMinutes=${minimumOpenMinutes}`,
  );
}
export function recordOperatorUnpaid(input: { sessionId: string; reason: string | null }) {
  return operator<UnpaidRecord>("/unpaid-records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
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

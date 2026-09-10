import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T; message?: string };

export type ServiceBooking = {
  publicId: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  note: string | null;
  agreedPrice: number;
  paymentStatus: "PAY_LATER" | "PENDING" | "PAID" | "CANCELLED";
  createdByName: string;
  confirmedByName: string | null;
  confirmedAt: string | null;
  createdAt: string;
};

export function loadOperatorServiceBookings() {
  return operator<ServiceBooking[]>("/service-bookings");
}
export function createOperatorServiceBooking(input: {
  clientName: string;
  clientPhone: string;
  serviceName: string;
  note: string | null;
  agreedPrice: number;
  paymentStatus: "PAY_LATER" | "PENDING";
}) {
  return operator<ServiceBooking>("/service-bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
export function updateOperatorServiceBooking(
  id: string,
  input: { clientName: string; serviceName: string; note: string | null; agreedPrice: number },
) {
  return operator<ServiceBooking>(`/service-bookings/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
export function confirmOperatorServiceBooking(id: string) {
  return operator<ServiceBooking>(`/service-bookings/${encodeURIComponent(id)}/confirm`, {
    method: "POST",
  });
}
export function cancelOperatorServiceBooking(id: string) {
  return operator<ServiceBooking>(`/service-bookings/${encodeURIComponent(id)}/cancel`, {
    method: "POST",
  });
}

async function operator<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn.");
  const response = await fetch(`${apiUrl}/api/v1/operator${path}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${await user.getIdToken()}`, ...init.headers },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body))
    throw new Error(getMessage(body, "Không thể xử lý dịch vụ đặt trước."));
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

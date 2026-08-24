import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type ApiResponse<T> = { data: T };

export type CreatedOperator = {
  displayName: string;
  firebaseUid: string;
  id: number;
  status: "ACTIVE" | "INACTIVE";
};

export function createOperator(input: { displayName: string; email: string; phone: string }) {
  return request<CreatedOperator>("/api/v1/admin/operators", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function deactivateOperator(operatorId: number) {
  return request<void>(`/api/v1/admin/operators/${operatorId}`, { method: "DELETE" });
}

export function createAdmin(input: {
  displayName: string;
  email: string;
  firebaseUid: string;
  phone: string;
}) {
  return request<{ displayName: string; firebaseUid: string; id: number }>("/api/v1/admin/admins", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

async function request<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

  const response = await fetch(`${apiUrl}${path}`, {
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
    throw new Error(getBackendErrorMessage(body, "Không thể xử lý tài khoản vận hành."));
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

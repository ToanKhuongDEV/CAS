import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
type ApiResponse<T> = { data: T; message?: string };

export type OperationalIncident = {
  publicId: string;
  reporterName: string;
  description: string;
  createdAt: string;
};

export function createOperationalIncident(input: { reporterName: string; description: string }) {
  return operational<OperationalIncident>("/api/v1/operator/operational-incidents", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export function loadAdminOperationalIncidents() {
  return operational<OperationalIncident[]>("/api/v1/admin/operational-incidents");
}

async function operational<T>(path: string, init: RequestInit = {}) {
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
    throw new Error(message(body));
  }
  return body.data;
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return Boolean(value && typeof value === "object" && "data" in value);
}

function message(value: unknown) {
  return value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string"
    ? value.message
    : "Không thể xử lý báo cáo sự cố.";
}

import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const path = "/api/v1/admin/store/settings/long-wait-warning";

type ApiResponse<T> = { data: T };
type LongWaitWarningSetting = { longWaitWarningMinutes: number };

export async function loadLongWaitWarningMinutes() {
  return (await request<LongWaitWarningSetting>()).longWaitWarningMinutes;
}

export async function updateLongWaitWarningMinutes(longWaitWarningMinutes: number) {
  return (
    await request<LongWaitWarningSetting>({
      body: JSON.stringify({ longWaitWarningMinutes }),
      method: "PUT",
    })
  ).longWaitWarningMinutes;
}

async function request<T>(init: RequestInit = {}) {
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
    throw new Error(getBackendErrorMessage(body, "Không thể xử lý ngưỡng cảnh báo."));
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

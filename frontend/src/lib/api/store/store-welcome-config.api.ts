import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const path = "/api/v1/admin/store/welcome";

type ApiResponse<T> = { data: T };

export type StoreWelcomeConfig = {
  heroPrimaryImageUrl: string | null;
  heroPrimaryImageStorageKey: string | null;
  heroSecondaryImageUrl: string | null;
  heroSecondaryImageStorageKey: string | null;
  menuPreview1ImageUrl: string | null;
  menuPreview1ImageStorageKey: string | null;
  menuPreview2ImageUrl: string | null;
  menuPreview2ImageStorageKey: string | null;
  menuPreview3ImageUrl: string | null;
  menuPreview3ImageStorageKey: string | null;
  menuPreview4ImageUrl: string | null;
  menuPreview4ImageStorageKey: string | null;
  menuPreview5ImageUrl: string | null;
  menuPreview5ImageStorageKey: string | null;
  bannerImageUrl: string | null;
  bannerImageStorageKey: string | null;
  status: "ACTIVE" | "INACTIVE";
};

export function createEmptyStoreWelcomeConfig(): StoreWelcomeConfig {
  return {
    heroPrimaryImageUrl: null,
    heroPrimaryImageStorageKey: null,
    heroSecondaryImageUrl: null,
    heroSecondaryImageStorageKey: null,
    menuPreview1ImageUrl: null,
    menuPreview1ImageStorageKey: null,
    menuPreview2ImageUrl: null,
    menuPreview2ImageStorageKey: null,
    menuPreview3ImageUrl: null,
    menuPreview3ImageStorageKey: null,
    menuPreview4ImageUrl: null,
    menuPreview4ImageStorageKey: null,
    menuPreview5ImageUrl: null,
    menuPreview5ImageStorageKey: null,
    bannerImageUrl: null,
    bannerImageStorageKey: null,
    status: "ACTIVE",
  };
}

export async function loadStoreWelcomeConfig(): Promise<StoreWelcomeConfig | null> {
  return request<StoreWelcomeConfig>({ allowNotFound: true });
}

export async function saveStoreWelcomeConfig(config: StoreWelcomeConfig) {
  const savedConfig = await request<StoreWelcomeConfig>({
    method: "PUT",
    body: JSON.stringify(config),
  });
  if (!savedConfig) throw new Error("Không thể lưu cấu hình trang Welcome.");
  return savedConfig;
}

async function request<T>({
  allowNotFound = false,
  ...init
}: RequestInit & { allowNotFound?: boolean } = {}) {
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
  if (allowNotFound && response.status === 404) return null;

  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isApiResponse<T>(body)) {
    throw new Error(getBackendErrorMessage(body, "Không thể xử lý cấu hình trang Welcome."));
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

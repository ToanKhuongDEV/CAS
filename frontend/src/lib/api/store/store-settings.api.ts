import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const path = "/api/v1/admin/store/settings";

export type StoreSettings = {
  branchName?: string;
  /** @deprecated API responses now use branchName. */
  name?: string;
  brandName?: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  logoStorageKey: string | null;
  googleMapsLocation: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openTime: string;
  closeTime: string;
  welcomeSlogan: string | null;
  status: "ACTIVE" | "INACTIVE";
};
export type AdminStore = Pick<StoreSettings, "branchName" | "brandName" | "name" | "status"> & {
  id: number;
};
export type BrandSettings = {
  name: string;
  logoUrl: string | null;
  logoStorageKey: string | null;
  welcomeSlogan: string | null;
};
export type UpdateStoreSettings = Pick<
  StoreSettings,
  | "branchName"
  | "address"
  | "phone"
  | "email"
  | "googleMapsLocation"
  | "openTime"
  | "closeTime"
  | "status"
>;
type ApiResponse<T> = { data: T };

export async function loadStoreSettings() {
  return request<StoreSettings>();
}
export async function updateStoreSettings(settings: UpdateStoreSettings) {
  return request<StoreSettings>({ method: "PUT", body: JSON.stringify(settings) });
}
export async function loadBrandSettings() {
  return brandRequest<BrandSettings>();
}
export async function updateBrandSettings(settings: BrandSettings) {
  return brandRequest<BrandSettings>({ method: "PUT", body: JSON.stringify(settings) });
}
export async function loadAdminStores() {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const response = await fetch(`${apiUrl}/api/v1/admin/stores`, {
    cache: "no-store",
    headers: { Authorization: `Bearer ${await user.getIdToken()}` },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body)) {
    throw new Error("Không thể tải danh sách cơ sở.");
  }
  return (body as ApiResponse<AdminStore[]>).data;
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
    },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body))
    throw new Error("Không thể lưu thông tin cửa hàng.");
  return (body as ApiResponse<T>).data;
}

async function brandRequest<T>(init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  const response = await fetch(`${apiUrl}/api/v1/admin/brand/settings`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${await user.getIdToken()}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body)) {
    throw new Error("Không thể lưu cấu hình thương hiệu.");
  }
  return (body as ApiResponse<T>).data;
}

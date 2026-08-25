import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const path = "/api/v1/admin/store/settings";

export type StoreSettings = {
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string | null;
  googleMapsLocation: string | null;
  openTime: string;
  closeTime: string;
  welcomeSlogan: string | null;
  status: "ACTIVE" | "INACTIVE";
};
type ApiResponse<T> = { data: T };

export async function loadStoreSettings() {
  return request<StoreSettings>();
}
export async function updateStoreSettings(settings: StoreSettings) {
  return request<StoreSettings>({ method: "PUT", body: JSON.stringify(settings) });
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

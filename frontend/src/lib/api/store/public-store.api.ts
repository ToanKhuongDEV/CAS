import type { StoreSettings } from "./store-settings.api";

export async function loadPublicStore(storeId = 1): Promise<StoreSettings> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const response = await fetch(`${apiUrl}/api/v1/public/stores/${storeId}`, { cache: "no-store" });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body))
    throw new Error("Không thể tải thông tin cửa hàng.");
  return (body as { data: StoreSettings }).data;
}

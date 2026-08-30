import type { StoreSettings } from "./store-settings.api";

export type PublicStoreWelcomeConfig = {
  heroPrimaryImageUrl: string | null;
  heroSecondaryImageUrl: string | null;
  menuPreview1ImageUrl: string | null;
  menuPreview2ImageUrl: string | null;
  menuPreview3ImageUrl: string | null;
  menuPreview4ImageUrl: string | null;
  menuPreview5ImageUrl: string | null;
  bannerImageUrl: string | null;
};

export async function loadPublicStore(storeId = 1): Promise<StoreSettings> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const response = await fetch(`${apiUrl}/api/v1/public/stores/${storeId}`, { cache: "no-store" });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body))
    throw new Error("Không thể tải thông tin cửa hàng.");
  return (body as { data: StoreSettings }).data;
}

export async function loadPublicStoreWelcomeConfig(
  storeId = 1,
): Promise<PublicStoreWelcomeConfig | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
  const response = await fetch(`${apiUrl}/api/v1/public/stores/${storeId}/welcome`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !body || typeof body !== "object" || !("data" in body))
    throw new Error("Không thể tải cấu hình Welcome.");
  return (body as { data: PublicStoreWelcomeConfig }).data;
}

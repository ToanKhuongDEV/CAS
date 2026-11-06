import { getFirebaseAuth } from "../../auth/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const catalogPath = "/api/v1/admin/catalog";

type ApiResponse<T> = { data: T };

export type CatalogCategory = {
  categoryType: "REGULAR" | "OPTION";
  description: string | null;
  displayOrder: number;
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type CatalogTag = {
  id: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type CatalogOptionGroup = {
  displayOrder: number;
  id: number;
  maxSelect: number | null;
  minSelect: number;
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  status: "ACTIVE" | "INACTIVE";
  values: CatalogOptionValue[];
};

export type CatalogOptionValue = {
  displayOrder: number;
  extraPrice: number;
  id: number;
  isDefault: boolean;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type CatalogMenuItem = {
  availabilityStatus: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  categoryId: number;
  createdAt?: string;
  description: string | null;
  displayOrder: number;
  id: number;
  imageStorageKey: string | null;
  imageUrl: string | null;
  name: string;
  optionGroups: Array<{ displayOrder: number; id: number; name: string }> | null;
  price: number;
  tags: Array<{ id: number; name: string }> | null;
};

export type SaveCatalogMenuItem = {
  availabilityStatus: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  categoryId: number;
  description: string;
  displayOrder: number;
  imageStorageKey: string | null;
  imageUrl: string | null;
  name: string;
  optionGroups: Array<{ displayOrder: number; optionGroupId: number }>;
  price: number;
  tagIds: number[];
};

export type SaveCatalogCategory = {
  categoryType: "REGULAR" | "OPTION";
  description: string;
  displayOrder: number;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

export type SaveCatalogTag = Pick<CatalogTag, "name" | "status">;

export type SaveCatalogOptionGroup = {
  displayOrder: number;
  maxSelect: number | null;
  minSelect: number;
  name: string;
  selectionType: "SINGLE" | "MULTIPLE";
  status: "ACTIVE" | "INACTIVE";
};

export type SaveCatalogOptionValue = Omit<CatalogOptionValue, "id">;

export async function loadAdminCatalog() {
  const [categories, tags, optionGroups, items] = await Promise.all([
    request<CatalogCategory[]>("/categories"),
    request<CatalogTag[]>("/tags"),
    request<CatalogOptionGroup[]>("/option-groups"),
    request<CatalogMenuItem[]>("/items"),
  ]);
  return { categories, tags, optionGroups, items };
}

export function createCatalogMenuItem(item: SaveCatalogMenuItem) {
  return request<void>("/items", { body: JSON.stringify(item), method: "POST" });
}

export function updateCatalogMenuItem(id: number, item: SaveCatalogMenuItem) {
  return request<void>(`/items/${id}`, { body: JSON.stringify(item), method: "PUT" });
}

export function updateCatalogMenuItemStatuses(
  itemIds: number[],
  status: SaveCatalogMenuItem["availabilityStatus"],
) {
  return request<void>("/items/bulk-status", {
    body: JSON.stringify({ itemIds, status }),
    method: "PATCH",
  });
}

export function createCatalogCategory(category: SaveCatalogCategory) {
  return request<void>("/categories", { body: JSON.stringify(category), method: "POST" });
}

export function updateCatalogCategory(id: number, category: SaveCatalogCategory) {
  const { categoryType, ...body } = category;
  void categoryType;
  return request<void>(`/categories/${id}`, { body: JSON.stringify(body), method: "PUT" });
}

export function deleteCatalogCategory(id: number) {
  return request<void>(`/categories/${id}`, { method: "DELETE" });
}

export function createCatalogTag(tag: SaveCatalogTag) {
  return request<void>("/tags", { body: JSON.stringify(tag), method: "POST" });
}

export function updateCatalogTag(id: number, tag: SaveCatalogTag) {
  return request<void>(`/tags/${id}`, { body: JSON.stringify(tag), method: "PUT" });
}

export function deleteCatalogTag(id: number) {
  return request<void>(`/tags/${id}`, { method: "DELETE" });
}

export function createCatalogOptionGroup(group: SaveCatalogOptionGroup) {
  return request<void>("/option-groups", { body: JSON.stringify(group), method: "POST" });
}

export function updateCatalogOptionGroup(id: number, group: SaveCatalogOptionGroup) {
  return request<void>(`/option-groups/${id}`, { body: JSON.stringify(group), method: "PUT" });
}

export function deleteCatalogOptionGroup(id: number) {
  return request<void>(`/option-groups/${id}`, { method: "DELETE" });
}

export function createCatalogOptionValue(groupId: number, value: SaveCatalogOptionValue) {
  return request<void>(`/option-groups/${groupId}/values`, {
    body: JSON.stringify(value),
    method: "POST",
  });
}

export function updateCatalogOptionValue(id: number, value: SaveCatalogOptionValue) {
  return request<void>(`/option-values/${id}`, { body: JSON.stringify(value), method: "PUT" });
}

export function deleteCatalogOptionValue(id: number) {
  return request<void>(`/option-values/${id}`, { method: "DELETE" });
}

async function request<T>(path: string, init: RequestInit = {}) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

  const response = await fetch(`${apiUrl}${catalogPath}${path}`, {
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
    throw new Error(getBackendErrorMessage(body, "Không thể xử lý dữ liệu thực đơn."));
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

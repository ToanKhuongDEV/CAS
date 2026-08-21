import { getFirebaseAuth } from "../../auth/firebase";

type ApiResponse<T> = { data: T };

type UploadSignature = {
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  signature: string;
  timestamp: number;
  uploadPreset: string;
};

type CloudinaryUploadResponse = {
  public_id?: unknown;
  secure_url?: unknown;
};

export type UploadedCatalogImage = {
  imageStorageKey: string;
  imageUrl: string;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function uploadCatalogImage(file: File): Promise<UploadedCatalogImage> {
  const currentUser = getFirebaseAuth().currentUser;
  if (!currentUser) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

  const idToken = await currentUser.getIdToken();
  const signature = await requestUploadSignature(idToken);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);
  formData.append("public_id", signature.publicId);
  formData.append("upload_preset", signature.uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    { method: "POST", body: formData },
  );
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isCloudinaryUploadResponse(body)) {
    throw new Error("Không thể tải ảnh lên Cloudinary. Vui lòng thử lại.");
  }

  return { imageUrl: body.secure_url, imageStorageKey: body.public_id };
}

async function requestUploadSignature(idToken: string): Promise<UploadSignature> {
  const response = await fetch(`${apiUrl}/api/v1/admin/catalog/images/upload-signature`, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${idToken}` },
  });
  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok || !isUploadSignatureResponse(body)) {
    throw new Error(getBackendErrorMessage(body, "Không thể xin quyền tải ảnh."));
  }
  return body.data;
}

function isUploadSignatureResponse(value: unknown): value is ApiResponse<UploadSignature> {
  if (!value || typeof value !== "object" || !("data" in value)) return false;
  const { data } = value;
  return Boolean(
    data &&
    typeof data === "object" &&
    "apiKey" in data &&
    typeof data.apiKey === "string" &&
    "cloudName" in data &&
    typeof data.cloudName === "string" &&
    "folder" in data &&
    typeof data.folder === "string" &&
    "publicId" in data &&
    typeof data.publicId === "string" &&
    "signature" in data &&
    typeof data.signature === "string" &&
    "timestamp" in data &&
    typeof data.timestamp === "number" &&
    "uploadPreset" in data &&
    typeof data.uploadPreset === "string",
  );
}

function isCloudinaryUploadResponse(
  value: unknown,
): value is CloudinaryUploadResponse & { public_id: string; secure_url: string } {
  return Boolean(
    value &&
    typeof value === "object" &&
    "public_id" in value &&
    typeof value.public_id === "string" &&
    "secure_url" in value &&
    typeof value.secure_url === "string",
  );
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

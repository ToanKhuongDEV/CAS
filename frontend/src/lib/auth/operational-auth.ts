import {
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { getFirebaseAuth } from "./firebase";

export type OperationalRole = "ADMIN" | "OPERATOR" | "SUPER_ADMIN";

export type CurrentOperationalAccount = {
  accountId: number;
  storeId: number;
  displayName: string;
  role: OperationalRole;
};

type ApiResponse<T> = {
  data: T;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function signInOperationalUser(
  email: string,
  password: string,
): Promise<CurrentOperationalAccount> {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);

  try {
    return await getCurrentOperationalAccount(credential.user);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
}

export async function getCurrentOperationalAccount(user: User): Promise<CurrentOperationalAccount> {
  const idToken = await user.getIdToken();
  const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });

  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    throw new Error(getBackendErrorMessage(body, response.statusText));
  }

  if (!isCurrentOperationalAccountResponse(body)) {
    throw new Error("Phản hồi xác thực từ CAS không hợp lệ.");
  }

  return body.data;
}

function getBackendErrorMessage(body: unknown, fallbackMessage: string) {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof body.message === "string" &&
    body.message.trim()
  ) {
    return body.message;
  }

  return fallbackMessage || "Backend returned an invalid error response.";
}

export async function signOutOperationalUser() {
  await signOut(getFirebaseAuth());
}

function isCurrentOperationalAccountResponse(
  value: unknown,
): value is ApiResponse<CurrentOperationalAccount> {
  if (!value || typeof value !== "object" || !("data" in value)) {
    return false;
  }

  const { data } = value;
  return Boolean(
    data &&
    typeof data === "object" &&
    "accountId" in data &&
    typeof data.accountId === "number" &&
    "storeId" in data &&
    typeof data.storeId === "number" &&
    "displayName" in data &&
    typeof data.displayName === "string" &&
    "role" in data &&
    (data.role === "ADMIN" || data.role === "OPERATOR" || data.role === "SUPER_ADMIN"),
  );
}

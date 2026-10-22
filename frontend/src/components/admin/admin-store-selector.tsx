"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { loadAdminStores, type AdminStore } from "../../lib/api/store/store-settings.api";

const storageKey = "cas.admin.selectedStoreId";
const storeHeader = "X-CAS-Store-Id";

export function AdminStoreSelector() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = (input, init) => {
      const url = new URL(
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
        window.location.origin,
      );
      const storeId = window.sessionStorage.getItem(storageKey);
      if (
        !isSuperAdmin ||
        !storeId ||
        (!url.pathname.startsWith("/api/v1/admin") && !url.pathname.startsWith("/api/v1/operator"))
      ) {
        return originalFetch(input, init);
      }
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      headers.set(storeHeader, storeId);
      return originalFetch(input, { ...init, headers });
    };
    return () => {
      if (window.fetch === originalFetch) return;
      window.fetch = originalFetch;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    void getCurrentOperationalAccount(user)
      .then(async (account) => {
        if (account.role !== "SUPER_ADMIN") return;
        setIsSuperAdmin(true);
        const availableStores = await loadAdminStores();
        const rememberedStoreId = Number(window.sessionStorage.getItem(storageKey));
        const nextStoreId = availableStores.some((store) => store.id === rememberedStoreId)
          ? rememberedStoreId
          : account.storeId;
        window.sessionStorage.setItem(storageKey, String(nextStoreId));
        setStores(availableStores);
        setSelectedStoreId(nextStoreId);
      })
      .catch(() => undefined);
  }, []);

  if (stores.length < 2 || selectedStoreId === null) return null;

  return (
    <label className="hidden items-center gap-2 text-xs font-bold text-cas-on-surface-variant sm:flex">
      Cơ sở
      <select
        className="rounded-lg border border-cas-outline-variant/60 bg-cas-surface px-2 py-1.5 text-cas-on-surface"
        onChange={(event) => {
          const storeId = Number(event.target.value);
          window.sessionStorage.setItem(storageKey, String(storeId));
          setSelectedStoreId(storeId);
          queryClient.clear();
          router.refresh();
        }}
        value={selectedStoreId}
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.brandName ?? "CAS"} – {store.branchName ?? store.name}
          </option>
        ))}
      </select>
    </label>
  );
}

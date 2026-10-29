"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  clearSelectedAdminStore,
  getCurrentOperationalAccount,
  getSelectedAdminStoreId,
  selectedAdminStoreStorageKey,
} from "../../lib/auth/operational-auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { loadAdminStores, type AdminStore } from "../../lib/api/store/store-settings.api";

const storeHeader = "X-CAS-Store-Id";

export function AdminStoreSelector() {
  const queryClient = useQueryClient();
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => getSelectedAdminStoreId() !== null);

  useLayoutEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = (input, init) => {
      const url = new URL(
        typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
        window.location.origin,
      );
      const storeId = getSelectedAdminStoreId();
      if (
        !isSuperAdmin ||
        storeId === null ||
        (!url.pathname.startsWith("/api/v1/admin") && !url.pathname.startsWith("/api/v1/operator"))
      ) {
        return originalFetch(input, init);
      }
      const headers = new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      headers.set(storeHeader, String(storeId));
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
        if (account.role !== "SUPER_ADMIN") {
          clearSelectedAdminStore();
          setIsSuperAdmin(false);
          return;
        }
        setIsSuperAdmin(true);
        const availableStores = await loadAdminStores();
        const rememberedStoreId = getSelectedAdminStoreId();
        const nextStoreId = availableStores.some((store) => store.id === rememberedStoreId)
          ? rememberedStoreId
          : account.storeId;
        window.sessionStorage.setItem(selectedAdminStoreStorageKey, String(nextStoreId));
        setStores(availableStores);
        setSelectedStoreId(nextStoreId);
      })
      .catch(() => undefined);
  }, []);

  if (stores.length < 2 || selectedStoreId === null) return null;

  return (
    <label className="flex min-w-0 items-center gap-2 text-xs font-bold text-cas-on-primary">
      Cơ sở
      <select
        className="max-w-28 rounded-lg border border-cas-outline-variant/60 bg-cas-surface px-2 py-1.5 text-cas-on-surface sm:max-w-none"
        onChange={(event) => {
          const storeId = Number(event.target.value);
          window.sessionStorage.setItem(selectedAdminStoreStorageKey, String(storeId));
          setSelectedStoreId(storeId);
          queryClient.clear();
          window.location.reload();
        }}
        value={selectedStoreId}
      >
        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.branchName ?? store.name}
          </option>
        ))}
      </select>
    </label>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onIdTokenChanged } from "firebase/auth";

import {
  clearSelectedAdminStore,
  getCurrentOperationalAccount,
  getSelectedAdminStoreId,
  selectedAdminStoreStorageKey,
} from "../../lib/auth/operational-auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { loadAdminStores, type AdminStore } from "../../lib/api/store/store-settings.api";
import { CasIcon } from "../ui/cas-icon";

const storeHeader = "X-CAS-Store-Id";

export function AdminStoreSelector() {
  const queryClient = useQueryClient();
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => getSelectedAdminStoreId() !== null);
  const [loadError, setLoadError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    let active = true;
    let revision = 0;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), (user) => {
      const currentRevision = ++revision;
      if (!user) {
        setStores([]);
        setSelectedStoreId(null);
        setIsSuperAdmin(false);
        setLoadError("");
        return;
      }
      void getCurrentOperationalAccount(user)
        .then(async (account) => {
          if (!active || currentRevision !== revision) return;
          if (account.role !== "SUPER_ADMIN") {
            clearSelectedAdminStore();
            setIsSuperAdmin(false);
            setStores([]);
            setSelectedStoreId(null);
            return;
          }
          setIsSuperAdmin(true);
          setLoadError("");
          const availableStores = await loadAdminStores();
          if (!active || currentRevision !== revision) return;
          const rememberedStoreId = getSelectedAdminStoreId();
          const nextStoreId = availableStores.some((store) => store.id === rememberedStoreId)
            ? rememberedStoreId
            : availableStores.some((store) => store.id === account.storeId)
              ? account.storeId
              : (availableStores[0]?.id ?? null);
          if (nextStoreId !== null)
            window.sessionStorage.setItem(selectedAdminStoreStorageKey, String(nextStoreId));
          setStores(availableStores);
          setSelectedStoreId(nextStoreId);
        })
        .catch(() => {
          if (active && currentRevision === revision)
            setLoadError("Không thể tải danh sách cơ sở.");
        });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    function refreshStores() {
      void loadAdminStores()
        .then(setStores)
        .catch(() => setLoadError("Không thể tải danh sách cơ sở."));
    }
    window.addEventListener("cas:stores-updated", refreshStores);
    return () => window.removeEventListener("cas:stores-updated", refreshStores);
  }, [isSuperAdmin]);

  useEffect(() => {
    function dismiss(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", dismiss);
    return () => document.removeEventListener("mousedown", dismiss);
  }, []);

  useEffect(() => {
    if (isOpen)
      menuRef.current
        ?.querySelector<HTMLButtonElement>('[role="menuitemradio"][aria-checked="true"]')
        ?.focus();
  }, [isOpen]);

  if (loadError)
    return (
      <span role="alert" className="text-xs font-bold text-cas-on-primary">
        {loadError}
      </span>
    );
  if (stores.length === 0 || selectedStoreId === null) return null;
  const selectedStore = stores.find((store) => store.id === selectedStoreId);
  const selectedName = selectedStore?.branchName ?? selectedStore?.name ?? "";

  return (
    <div
      className="relative min-w-0"
      ref={menuRef}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsOpen(false);
          event.currentTarget.querySelector("button")?.focus();
        }
      }}
    >
      <button
        type="button"
        aria-label={`Chọn cơ sở: ${selectedName}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-10 max-w-44 items-center gap-2 rounded-xl border border-cas-on-primary/20 bg-cas-on-primary/10 px-3 text-xs font-bold text-cas-on-primary transition hover:bg-cas-on-primary/20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring sm:max-w-60"
      >
        <CasIcon name="location" className="size-4 shrink-0" />
        <span className="min-w-0 truncate">{selectedName}</span>
        <CasIcon
          name="arrow"
          className={`size-4 shrink-0 rotate-90 transition-transform ${isOpen ? "rotate-270" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          role="menu"
          aria-label="Danh sách cơ sở"
          className="absolute right-0 top-full z-50 mt-2 max-h-72 w-64 max-w-[85vw] overflow-y-auto rounded-xl border border-cas-outline-variant/40 bg-cas-surface-container p-1.5 text-cas-on-surface shadow-xl"
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const items = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'),
            );
            const index = items.indexOf(document.activeElement as HTMLButtonElement);
            items[
              (index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length
            ]?.focus();
          }}
        >
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              role="menuitemradio"
              aria-checked={store.id === selectedStoreId}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition hover:bg-cas-primary/10 focus-visible:outline-2 focus-visible:outline-cas-focus-ring ${store.id === selectedStoreId ? "bg-cas-primary/10 text-cas-primary" : "text-cas-on-surface"}`}
              onClick={() => {
                setIsOpen(false);
                if (store.id === selectedStoreId) return;
                window.sessionStorage.setItem(selectedAdminStoreStorageKey, String(store.id));
                setSelectedStoreId(store.id);
                queryClient.clear();
                window.location.reload();
              }}
            >
              <span className="min-w-0 break-words">{store.branchName ?? store.name}</span>
              {store.id === selectedStoreId && <CasIcon name="check" className="size-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

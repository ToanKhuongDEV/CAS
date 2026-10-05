"use client";

import { useEffect, useState } from "react";
import { getRememberedPublicStoreId, loadPublicStore } from "../../lib/api/store/public-store.api";

export function StoreBrand({ storeId }: { storeId?: number }) {
  const [name, setName] = useState("CAS");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    const effectiveStoreId = storeId ?? getRememberedPublicStoreId() ?? 1;
    void loadPublicStore(effectiveStoreId)
      .then((store) => {
        setName(store.name);
        setLogoUrl(store.logoUrl);
      })
      .catch(() => undefined);
  }, [storeId]);
  return (
    <>
      <span className="grid size-10 place-items-center overflow-hidden rounded-xl shadow-[0_8px_20px_var(--cas-shadow-color)]">
        <img
          alt="Logo cửa hàng"
          className="size-full object-cover"
          src={
            logoUrl ??
            "https://www.clipartmax.com/png/middle/9-92296_red-restaurant-3-icon-restaurant.png"
          }
        />
      </span>
      <span className="text-xl font-black tracking-tight text-cas-primary">{name}</span>
    </>
  );
}

export function StoreLogo({ storeId }: { storeId?: number }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    const effectiveStoreId = storeId ?? getRememberedPublicStoreId() ?? 1;
    void loadPublicStore(effectiveStoreId)
      .then((store) => setLogoUrl(store.logoUrl))
      .catch(() => undefined);
  }, [storeId]);
  return (
    <img
      alt="Logo cửa hàng"
      className="size-full object-cover"
      src={
        logoUrl ??
        "https://www.clipartmax.com/png/middle/9-92296_red-restaurant-3-icon-restaurant.png"
      }
    />
  );
}

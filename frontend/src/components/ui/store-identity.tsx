"use client";

import { useEffect, useState } from "react";
import { getRememberedPublicStoreId, loadPublicStore } from "../../lib/api/store/public-store.api";

type StoreIdentityProps = {
  storeId?: number;
  subtitle?: string;
  logoClassName?: string;
  nameClassName?: string;
  logoOnly?: boolean;
};

export function StoreIdentity({
  storeId,
  subtitle,
  logoClassName = "rounded-xl",
  nameClassName = "text-xl font-black tracking-tight text-cas-primary",
  logoOnly = false,
}: StoreIdentityProps) {
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
  const logo = (
    <span
      className={`grid size-10 place-items-center overflow-hidden shadow-[0_8px_20px_var(--cas-shadow-color)] ${logoClassName}`}
    >
      <img
        alt="Logo cửa hàng"
        className="size-full object-cover"
        src={
          logoUrl ??
          "https://www.clipartmax.com/png/middle/9-92296_red-restaurant-3-icon-restaurant.png"
        }
      />
    </span>
  );
  if (logoOnly) return logo;
  return (
    <div className="flex items-center gap-3">
      {logo}
      <div className="flex flex-col">
        <span className={nameClassName}>{name}</span>
        {subtitle ? (
          <span className="text-[0.68rem] font-semibold leading-none text-cas-on-surface-variant">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getRememberedPublicStoreId, loadPublicStore } from "../../lib/api/store/public-store.api";

export type StoreIdentityProps = {
  storeId?: number;
  fallbackToPublicStore?: boolean;
  subtitle?: string;
  logoClassName?: string;
  nameClassName?: string;
  logoOnly?: boolean;
  showBranchName?: boolean;
};

export function StoreIdentity({
  storeId,
  fallbackToPublicStore = true,
  subtitle,
  logoClassName = "rounded-xl",
  nameClassName = "text-xl font-black tracking-tight text-cas-primary",
  logoOnly = false,
  showBranchName = false,
}: StoreIdentityProps) {
  const [name, setName] = useState("CAS");
  const [branchName, setBranchName] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  useEffect(() => {
    const effectiveStoreId =
      storeId ?? (fallbackToPublicStore ? (getRememberedPublicStoreId() ?? 1) : null);
    if (!effectiveStoreId) return;
    void loadPublicStore(effectiveStoreId)
      .then((store) => {
        setName(store.brandName ?? store.branchName ?? store.name ?? "CAS");
        setBranchName(store.brandName ? (store.branchName ?? store.name ?? null) : null);
        setLogoUrl(store.logoUrl);
      })
      .catch(() => undefined);
  }, [fallbackToPublicStore, storeId]);
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
        <span className="flex items-baseline gap-2">
          <span className={nameClassName}>{name}</span>
          {showBranchName && branchName ? (
            <span className="text-xs font-semibold text-cas-on-surface-variant">{branchName}</span>
          ) : null}
        </span>
        {subtitle ? (
          <span className="text-[0.68rem] font-semibold leading-none text-cas-on-surface-variant">
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

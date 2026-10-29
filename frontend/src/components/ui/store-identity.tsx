"use client";

import { useEffect, useState } from "react";
import { getRememberedPublicStoreId, loadPublicStore } from "../../lib/api/store/public-store.api";
import { STORE_LOGO } from "../../lib/store-logo";

export type StoreIdentityProps = {
  storeId?: number;
  fallbackToPublicStore?: boolean;
  subtitle?: string;
  logoClassName?: string;
  nameClassName?: string;
  logoOnly?: boolean;
  showBranchName?: boolean;
  inHeader?: boolean;
};

export function StoreIdentity({
  storeId,
  fallbackToPublicStore = true,
  subtitle,
  logoClassName = "rounded-xl",
  nameClassName = "text-xl font-black tracking-tight text-cas-primary",
  logoOnly = false,
  showBranchName = false,
  inHeader = false,
}: StoreIdentityProps) {
  const [name, setName] = useState("CAS");
  const [branchName, setBranchName] = useState<string | null>(null);
  useEffect(() => {
    const effectiveStoreId =
      storeId ?? (fallbackToPublicStore ? (getRememberedPublicStoreId() ?? 1) : null);
    if (!effectiveStoreId) return;
    void loadPublicStore(effectiveStoreId)
      .then((store) => {
        setName(store.brandName ?? store.branchName ?? store.name ?? "CAS");
        setBranchName(store.brandName ? (store.branchName ?? store.name ?? null) : null);
      })
      .catch(() => undefined);
  }, [fallbackToPublicStore, storeId]);
  const logo = inHeader ? (
    <img
      alt="Logo cửa hàng"
      className="h-14 w-24 shrink-0 object-contain"
      src="/images/bambu-garden-wordmark.svg"
    />
  ) : (
    <span
      className={`grid size-10 place-items-center overflow-hidden shadow-[0_8px_20px_var(--cas-shadow-color)] ${logoClassName}`}
    >
      <img alt="Logo cửa hàng" className="size-full object-cover" src={STORE_LOGO} />
    </span>
  );
  if (logoOnly) return logo;
  return (
    <div className="flex min-w-0 items-center gap-3">
      {logo}
      <div className="flex min-w-0 flex-col">
        <span
          className={inHeader ? "truncate text-lg font-black text-cas-on-primary" : nameClassName}
        >
          {name}
        </span>
        {showBranchName && branchName ? (
          <span
            className={`truncate text-xs font-semibold ${inHeader ? "text-cas-on-primary" : "text-cas-on-surface-variant"}`}
          >
            {branchName}
          </span>
        ) : null}
        {subtitle ? (
          <span
            className={`text-[0.68rem] font-semibold leading-none ${inHeader ? "text-cas-on-primary" : "text-cas-on-surface-variant"}`}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}

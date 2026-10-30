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
  const [slogan, setSlogan] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const effectiveStoreId =
      storeId ?? (fallbackToPublicStore ? (getRememberedPublicStoreId() ?? 1) : null);
    if (!effectiveStoreId) return;
    void loadPublicStore(effectiveStoreId)
      .then((store) => {
        if (!active) return;
        setName(store.brandName ?? store.branchName ?? store.name ?? "CAS");
        setBranchName(store.branchName ?? store.name ?? null);
        setSlogan(store.welcomeSlogan);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [fallbackToPublicStore, storeId]);
  const logo = inHeader ? (
    <img
      alt="Logo cửa hàng"
      className="h-16.5 w-[113px] shrink-0 object-contain brightness-0 invert"
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
        {inHeader ? (
          slogan ? (
            <span className="truncate text-sm font-bold text-cas-on-primary">{slogan}</span>
          ) : null
        ) : (
          <span className={nameClassName}>{name}</span>
        )}
        {showBranchName && branchName ? (
          <span
            className={`truncate text-xs font-semibold ${inHeader ? "text-cas-on-primary" : "text-cas-on-surface-variant"}`}
          >
            {inHeader ? `Cơ sở ${branchName}` : branchName}
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

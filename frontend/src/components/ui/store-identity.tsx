"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getRememberedPublicStoreId, loadPublicStore } from "../../lib/api/store/public-store.api";
import { STORE_LOGO } from "../../lib/store-logo";
import { CasIcon } from "./cas-icon";

export type StoreIdentityProps = {
  storeId?: number;
  fallbackToPublicStore?: boolean;
  subtitle?: string;
  logoClassName?: string;
  nameClassName?: string;
  logoOnly?: boolean;
  showBranchName?: boolean;
  branchAsLocation?: boolean;
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
  branchAsLocation = false,
  inHeader = false,
}: StoreIdentityProps) {
  const effectiveStoreId =
    storeId ?? (fallbackToPublicStore ? (getRememberedPublicStoreId() ?? 1) : null);
  const { data: store } = useQuery({
    queryKey: ["public", "stores", effectiveStoreId],
    queryFn: () => loadPublicStore(effectiveStoreId!),
    enabled: effectiveStoreId !== null,
    retry: false,
  });
  const name = store?.brandName ?? store?.branchName ?? store?.name ?? "Bambu Garden";
  const branchName = store?.branchName ?? store?.name ?? null;
  const slogan = store?.welcomeSlogan ?? null;
  const [showBranch, setShowBranch] = useState(false);
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
    <div className={`flex min-w-0 items-center gap-3 ${branchAsLocation ? "flex-1" : ""}`}>
      {logo}
      <div className="flex min-w-0 flex-col">
        {inHeader ? (
          slogan ? (
            <span className="truncate text-sm font-bold text-cas-on-primary">{slogan}</span>
          ) : null
        ) : (
          <span className={nameClassName}>{name}</span>
        )}
        {showBranchName && branchName && !branchAsLocation ? (
          <span
            className={`flex min-w-0 items-center gap-1 text-xs font-semibold ${inHeader ? "text-cas-on-primary" : "text-cas-on-surface-variant"}`}
          >
            {inHeader && <CasIcon name="location" className="size-3.5 shrink-0" />}
            <span className="truncate">{branchName}</span>
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
      {branchAsLocation && branchName ? (
        <div className="group relative ml-auto shrink-0">
          <button
            type="button"
            aria-label="Cơ sở hiện tại"
            aria-expanded={showBranch}
            aria-describedby="operator-current-branch"
            onClick={() => setShowBranch((current) => !current)}
            onBlur={() => setShowBranch(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setShowBranch(false);
            }}
            className="grid size-10 place-items-center rounded-full text-cas-on-primary transition hover:bg-cas-on-primary/15 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
          >
            <CasIcon className="size-5.5" name="location" />
          </button>
          <div
            id="operator-current-branch"
            role="tooltip"
            className={`${showBranch ? "block" : "hidden"} absolute top-full right-0 z-50 mt-2 w-max max-w-[min(18rem,85vw)] rounded-xl border border-cas-outline-variant/30 bg-cas-surface p-3 text-sm font-semibold text-cas-on-surface shadow-xl group-hover:block`}
          >
            Bạn đang ở cơ sở {branchName}
          </div>
        </div>
      ) : null}
    </div>
  );
}

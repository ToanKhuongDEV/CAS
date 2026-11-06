"use client";

import { useEffect, useState } from "react";
import { getRememberedPublicStoreId, loadPublicStore } from "../../lib/api/store/public-store.api";
import { STORE_LOGO } from "../../lib/store-logo";

export function StoreBrand({ storeId }: { storeId?: number }) {
  const [name, setName] = useState("CAS");
  useEffect(() => {
    const effectiveStoreId = storeId ?? getRememberedPublicStoreId() ?? 1;
    void loadPublicStore(effectiveStoreId)
      .then((store) => {
        setName(store.brandName ?? store.branchName ?? store.name ?? "CAS");
      })
      .catch(() => undefined);
  }, [storeId]);
  return (
    <>
      <span className="grid size-10 place-items-center overflow-hidden rounded-xl shadow-[0_8px_20px_var(--cas-shadow-color)]">
        <img alt="Logo cửa hàng" className="size-full object-cover" src={STORE_LOGO} />
      </span>
      <span className="text-xl font-black tracking-tight text-cas-primary">{name}</span>
    </>
  );
}

export function StoreLogo() {
  return <img alt="Logo cửa hàng" className="size-full object-cover" src={STORE_LOGO} />;
}

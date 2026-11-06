"use client";

import { useEffect, useState } from "react";

import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { StoreIdentity, type StoreIdentityProps } from "../ui/store-identity";

type OperatorStoreIdentityProps = Omit<StoreIdentityProps, "fallbackToPublicStore" | "storeId">;

export function OperatorStoreIdentity(props: OperatorStoreIdentityProps) {
  const [storeId, setStoreId] = useState<number | null>(null);

  useEffect(() => {
    let isActive = true;
    const user = getFirebaseAuth().currentUser;
    if (!user) return;

    void getCurrentOperationalAccount(user)
      .then((account) => {
        if (isActive) setStoreId(account.storeId);
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <StoreIdentity
      {...props}
      showBranchName
      fallbackToPublicStore={false}
      storeId={storeId ?? undefined}
    />
  );
}

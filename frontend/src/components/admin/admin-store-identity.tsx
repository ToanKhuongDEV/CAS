"use client";

import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import {
  getCurrentOperationalAccount,
  getSelectedAdminStoreId,
} from "../../lib/auth/operational-auth";
import { StoreIdentity } from "../ui/store-identity";

export function AdminStoreIdentity() {
  const [subtitle, setSubtitle] = useState<string>();
  const [storeId, setStoreId] = useState<number>();

  useEffect(() => {
    let active = true;
    let revision = 0;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), (user) => {
      const currentRevision = ++revision;
      setSubtitle(undefined);
      setStoreId(undefined);
      if (!user) return;
      void getCurrentOperationalAccount(user)
        .then((account) => {
          if (active && revision === currentRevision) {
            setSubtitle(account.role === "SUPER_ADMIN" ? "Super Admin" : "Admin");
            setStoreId(
              account.role === "SUPER_ADMIN"
                ? (getSelectedAdminStoreId() ?? account.storeId)
                : account.storeId,
            );
          }
        })
        .catch(() => undefined);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <StoreIdentity
      inHeader
      showBranchName
      fallbackToPublicStore={false}
      storeId={storeId}
      subtitle={subtitle}
    />
  );
}

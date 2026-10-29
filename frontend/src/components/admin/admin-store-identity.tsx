"use client";

import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { StoreIdentity } from "../ui/store-identity";

export function AdminStoreIdentity() {
  const [subtitle, setSubtitle] = useState<string>();

  useEffect(() => {
    let active = true;
    let revision = 0;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), (user) => {
      const currentRevision = ++revision;
      setSubtitle(undefined);
      if (!user) return;
      void getCurrentOperationalAccount(user)
        .then((account) => {
          if (active && revision === currentRevision)
            setSubtitle(account.role === "SUPER_ADMIN" ? "Super Admin" : "Admin");
        })
        .catch(() => undefined);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return <StoreIdentity inHeader subtitle={subtitle} />;
}

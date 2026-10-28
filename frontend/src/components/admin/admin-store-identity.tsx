"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "../../lib/auth/firebase";
import { getCurrentOperationalAccount } from "../../lib/auth/operational-auth";
import { StoreIdentity } from "../ui/store-identity";

export function AdminStoreIdentity() {
  const [subtitle, setSubtitle] = useState("Admin");

  useEffect(() => {
    const user = getFirebaseAuth().currentUser;
    if (!user) return;
    void getCurrentOperationalAccount(user)
      .then((account) => setSubtitle(account.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"))
      .catch(() => undefined);
  }, []);

  return <StoreIdentity subtitle={subtitle} />;
}

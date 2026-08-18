"use client";

import { onIdTokenChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  getCurrentOperationalAccount,
  signOutOperationalUser,
  type OperationalRole,
} from "../../lib/auth/operational-auth";
import { getFirebaseAuth } from "../../lib/auth/firebase";

type OperationalRouteGuardProps = {
  area: Extract<OperationalRole, "ADMIN" | "OPERATOR">;
  children: ReactNode;
};

function canAccessArea(role: OperationalRole, area: OperationalRouteGuardProps["area"]) {
  return role === area || (area === "ADMIN" && role === "SUPER_ADMIN");
}

export function OperationalRouteGuard({ area, children }: OperationalRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const loginPath = area === "ADMIN" ? "/admin/login" : "/operator/login";
  const isLoginPage = pathname === loginPath;

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthorized(true);
      return;
    }

    let isCurrent = true;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async (user) => {
      if (!user) {
        if (isCurrent) {
          setIsAuthorized(false);
          router.replace(loginPath);
        }
        return;
      }

      try {
        const account = await getCurrentOperationalAccount(user);
        if (!canAccessArea(account.role, area)) {
          await signOutOperationalUser();
          throw new Error("Role does not have access to this area.");
        }

        if (isCurrent) {
          setIsAuthorized(true);
        }
      } catch {
        if (isCurrent) {
          setIsAuthorized(false);
          router.replace(loginPath);
        }
      }
    });

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, [area, isLoginPage, loginPath, router]);

  if (isLoginPage || isAuthorized) {
    return <>{children}</>;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cas-surface px-5 text-sm text-cas-on-surface-variant">
      Đang kiểm tra phiên đăng nhập…
    </main>
  );
}

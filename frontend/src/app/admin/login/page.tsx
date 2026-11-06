import type { Metadata } from "next";

import { OperatorLoginForm } from "../../(operator)/operator/login/operator-login-form";
import { StoreIdentity } from "../../../components/ui/store-identity";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị | CAS",
  description: "Đăng nhập quản trị CAS.",
};

export default function AdminLoginPage() {
  return (
    <main className="fixed inset-0 z-50 grid min-h-screen place-items-center bg-cas-surface px-5 py-8 text-cas-on-surface">
      <div className="w-full max-w-md rounded-[1.6rem] bg-cas-surface-container p-6 shadow-[0_16px_36px_var(--cas-shadow-color)] md:p-8">
        <StoreIdentity
          logoClassName="size-14 rounded-2xl"
          nameClassName="text-2xl font-black tracking-tight text-cas-primary"
        />
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Đăng nhập quản trị</h1>

        <OperatorLoginForm expectedRole="ADMIN" />
      </div>
    </main>
  );
}

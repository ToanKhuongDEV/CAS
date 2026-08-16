import type { Metadata } from "next";

import { CasIcon } from "../../../../components/ui/cas-icon";
import { OperatorLoginForm } from "./operator-login-form";

export const metadata: Metadata = {
  title: "Đăng nhập nhân viên | CAS",
  description: "Đăng nhập nhân viên CAS.",
};

export default function OperatorLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cas-surface px-5 py-8 text-cas-on-surface">
      <section className="w-full max-w-md rounded-[1.6rem] bg-cas-surface-container p-6 shadow-[0_16px_36px_var(--cas-shadow-color)] md:p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-cas-primary text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)]">
          <CasIcon className="size-7" name="users" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Đăng nhập nhân viên</h1>
        <p className="mt-3 text-sm leading-relaxed text-cas-on-surface-variant">
          Nhập thông tin tài khoản để tiếp tục xử lý order và thanh toán.
        </p>

        <OperatorLoginForm expectedRole="OPERATOR" />
      </section>
    </main>
  );
}

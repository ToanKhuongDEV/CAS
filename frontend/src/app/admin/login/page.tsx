import type { Metadata } from "next";

import { OperatorLoginForm } from "../../(operator)/operator/login/operator-login-form";
import { CasIcon } from "../../../components/ui/cas-icon";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị | CAS",
  description: "Đăng nhập quản trị CAS.",
};

export default function AdminLoginPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-13rem)] max-w-md place-items-center py-8">
      <div className="w-full rounded-[1.6rem] bg-cas-surface-container p-6 shadow-[0_16px_36px_var(--cas-shadow-color)] md:p-8">
        <span className="grid size-14 place-items-center rounded-2xl bg-cas-primary text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)]">
          <CasIcon className="size-7" name="user" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Đăng nhập quản trị</h1>
        <p className="mt-3 text-sm leading-relaxed text-cas-on-surface-variant">
          Nhập thông tin tài khoản quản trị để tiếp tục cấu hình và vận hành cửa hàng.
        </p>

        <OperatorLoginForm expectedRole="ADMIN" />
      </div>
    </section>
  );
}

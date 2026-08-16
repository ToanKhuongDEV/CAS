"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CasButton } from "../../../../components/ui/cas-button";
import { CasIcon } from "../../../../components/ui/cas-icon";
import { useToast } from "../../../../components/ui/toast-provider";
import {
  signInOperationalUser,
  signOutOperationalUser,
  type OperationalRole,
} from "../../../../lib/auth/operational-auth";

type FormErrors = {
  email?: string;
  password?: string;
};

type OperationalLoginFormProps = {
  expectedRole: Extract<OperationalRole, "ADMIN" | "OPERATOR">;
};

export function OperatorLoginForm({ expectedRole }: OperationalLoginFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Vui lòng nhập email.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Email không hợp lệ.";
    }

    if (!password) {
      nextErrors.password = "Vui lòng nhập mật khẩu.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const account = await signInOperationalUser(email.trim(), password);
      const canAccessArea =
        account.role === expectedRole ||
        (expectedRole === "ADMIN" && account.role === "SUPER_ADMIN");
      if (!canAccessArea) {
        await signOutOperationalUser();
        showToast({
          message:
            expectedRole === "ADMIN"
              ? "Tài khoản này không có quyền truy cập khu vực quản trị."
              : "Tài khoản này không có quyền truy cập khu vực nhân viên.",
          type: "error",
        });
        return;
      }

      router.push(expectedRole === "ADMIN" ? "/admin" : "/operator/dashboard");
    } catch (error) {
      showToast({ message: getLoginErrorMessage(error), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8" noValidate onSubmit={handleSubmit}>
      <label className="block" htmlFor="operator-email">
        <span className="text-sm font-bold">Email</span>
        <span className="relative mt-2 block">
          <CasIcon
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cas-on-surface-variant"
            name="mail"
          />
          <input
            className="h-13 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface-container pr-4 pl-12 text-sm outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
            id="operator-email"
            name="email"
            placeholder="Nhập email"
            type="email"
            autoComplete="email"
            value={email}
            aria-describedby={errors.email ? "operator-email-error" : undefined}
            aria-invalid={Boolean(errors.email)}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </span>
        {errors.email ? (
          <span
            className="mt-2 block text-xs font-medium text-cas-primary"
            id="operator-email-error"
          >
            {errors.email}
          </span>
        ) : null}
      </label>

      <label className="mt-5 block" htmlFor="operator-password">
        <span className="text-sm font-bold">Mật khẩu</span>
        <span className="relative mt-2 block">
          <input
            className="h-13 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface-container px-4 pr-12 text-sm outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
            id="operator-password"
            name="password"
            placeholder="Nhập mật khẩu"
            type={isPasswordVisible ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            aria-describedby={errors.password ? "operator-password-error" : undefined}
            aria-invalid={Boolean(errors.password)}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <button
            aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-cas-on-surface-variant hover:bg-cas-on-surface/8 hover:text-cas-on-surface focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
            onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
            type="button"
          >
            <CasIcon className="size-5" name="eye" />
          </button>
        </span>
        {errors.password ? (
          <span
            className="mt-2 block text-xs font-medium text-cas-primary"
            id="operator-password-error"
          >
            {errors.password}
          </span>
        ) : null}
      </label>

      <CasButton
        className="mt-6 w-full shadow-[0_8px_20px_var(--cas-shadow-color)]"
        disabled={isSubmitting}
        size="lg"
        type="submit"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        <CasIcon className="size-5" name="arrow" />
      </CasButton>
    </form>
  );
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    if (error.message.includes("auth/invalid-credential")) {
      return "Email hoặc mật khẩu không đúng.";
    }

    return error.message;
  }

  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    if (error.code === "auth/invalid-credential") {
      return "Email hoặc mật khẩu không đúng.";
    }

    return `Firebase: Error (${error.code}).`;
  }

  return "Unknown login error.";
}

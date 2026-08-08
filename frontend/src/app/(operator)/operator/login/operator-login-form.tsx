"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CasButton } from "../../../../components/ui/cas-button";
import { CasIcon } from "../../../../components/ui/cas-icon";

type FormErrors = {
	password?: string;
	phone?: string;
};

export function OperatorLoginForm() {
	const router = useRouter();
	const [errors, setErrors] = useState<FormErrors>({});
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const nextErrors: FormErrors = {};

		if (!phone.trim()) {
			nextErrors.phone = "Vui lòng nhập số điện thoại.";
		}

		if (!password) {
			nextErrors.password = "Vui lòng nhập mật khẩu.";
		}

		setErrors(nextErrors);

		if (Object.keys(nextErrors).length === 0) {
			router.push("/operator/dashboard");
		}
	}

	return (
		<form className="mt-8" noValidate onSubmit={handleSubmit}>
			<label className="block" htmlFor="operator-phone">
				<span className="text-sm font-bold">Số điện thoại</span>
				<span className="relative mt-2 block">
					<CasIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cas-on-surface-variant" name="phone" />
					<input
						className="h-13 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface-container pr-4 pl-12 text-sm outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
						id="operator-phone"
						name="phone"
						placeholder="Nhập số điện thoại"
						type="tel"
						autoComplete="tel"
						value={phone}
						aria-describedby={errors.phone ? "operator-phone-error" : undefined}
						aria-invalid={Boolean(errors.phone)}
						onChange={(event) => {
							setPhone(event.target.value);
						}}
					/>
				</span>
				{errors.phone ? (
					<span className="mt-2 block text-xs font-medium text-cas-primary" id="operator-phone-error">
						{errors.phone}
					</span>
				) : null}
			</label>

			<label className="mt-5 block" htmlFor="operator-password">
				<span className="text-sm font-bold">Mật khẩu</span>
				<input
					className="mt-2 h-13 w-full rounded-xl border border-cas-outline-variant/45 bg-cas-surface-container px-4 text-sm outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
					id="operator-password"
					name="password"
					placeholder="Nhập mật khẩu"
					type="password"
					autoComplete="current-password"
					value={password}
					aria-describedby={errors.password ? "operator-password-error" : undefined}
					aria-invalid={Boolean(errors.password)}
					onChange={(event) => {
						setPassword(event.target.value);
					}}
				/>
				{errors.password ? (
					<span className="mt-2 block text-xs font-medium text-cas-primary" id="operator-password-error">
						{errors.password}
					</span>
				) : null}
			</label>

			<CasButton className="mt-6 w-full shadow-[0_8px_20px_var(--cas-shadow-color)]" size="lg" type="submit">
				Đăng nhập
				<CasIcon className="size-5" name="arrow" />
			</CasButton>
		</form>
	);
}

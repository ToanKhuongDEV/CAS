"use client";

import { useEffect, useState } from "react";

import { CasIcon } from "../../../../../components/ui/cas-icon";

type PendingPayment = {
	amount: string;
	id: string;
	requestedAt: string;
	table: string;
};

const initialPayments: PendingPayment[] = [
	{
		amount: "170.000đ",
		id: "payment-table-05",
		requestedAt: "19:42",
		table: "Bàn 05",
	},
	{
		amount: "245.000đ",
		id: "payment-table-12",
		requestedAt: "19:35",
		table: "Bàn 12",
	},
	{
		amount: "95.000đ",
		id: "payment-table-03",
		requestedAt: "19:28",
		table: "Bàn 03",
	},
];

export function OperatorPaymentConfirmationList() {
	const [confirmedMessage, setConfirmedMessage] = useState<string | null>(null);
	const [payments, setPayments] = useState(initialPayments);
	const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);

	useEffect(() => {
		if (!selectedPayment) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setSelectedPayment(null);
			}
		}

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [selectedPayment]);

	function handleConfirmPayment() {
		if (!selectedPayment) {
			return;
		}

		setPayments((currentPayments) => currentPayments.filter((payment) => payment.id !== selectedPayment.id));
		setConfirmedMessage(`Đã xác nhận ${selectedPayment.table} thanh toán ${selectedPayment.amount}.`);
		setSelectedPayment(null);
	}

	return (
		<>
			<header>
				<h1 className="text-3xl font-extrabold">Thanh toán chờ xác nhận</h1>
			</header>

			{confirmedMessage ? (
				<div className="mt-5 flex items-start gap-3 rounded-xl border border-cas-secondary/25 bg-cas-secondary-container/20 p-4 text-sm font-bold text-cas-secondary" role="status">
					<CasIcon className="mt-0.5 size-5 shrink-0" name="check" />
					<p>{confirmedMessage}</p>
				</div>
			) : null}

			{payments.length > 0 ? (
				<ul className="mt-7 overflow-hidden rounded-2xl border border-cas-outline-variant/25 bg-cas-glass shadow-[0_5px_18px_var(--cas-shadow-color)]" aria-label="Danh sách thanh toán chờ xác nhận">
					{payments.map((payment) => (
						<li className="grid gap-3 border-b border-cas-outline-variant/25 p-5 last:border-b-0 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center" key={payment.id}>
							<p className="font-extrabold">{payment.table}</p>
							<p className="text-sm text-cas-on-surface-variant">Yêu cầu lúc {payment.requestedAt}</p>
							<p className="font-extrabold text-cas-primary">{payment.amount}</p>
							<button className="w-fit rounded-xl bg-cas-primary px-4 py-2 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring" onClick={() => setSelectedPayment(payment)} type="button">
								Xác nhận đã thanh toán
							</button>
						</li>
					))}
				</ul>
			) : (
				<div className="mt-7 grid min-h-56 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-8 text-center">
					<div>
						<h2 className="text-lg font-extrabold">Không còn thanh toán chờ xác nhận</h2>
						<p className="mt-1 text-sm text-cas-on-surface-variant">Tất cả yêu cầu thanh toán đã được xử lý.</p>
					</div>
				</div>
			)}

			{selectedPayment ? (
				<div
					className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							setSelectedPayment(null);
						}
					}}
				>
					<section className="w-full max-w-md rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl sm:p-6" aria-labelledby="payment-confirmation-title" aria-modal="true" role="dialog">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">{selectedPayment.table}</p>
								<h2 className="mt-1 text-xl font-extrabold" id="payment-confirmation-title">
									Xác nhận thanh toán
								</h2>
							</div>
							<button
								className="grid size-10 shrink-0 place-items-center rounded-xl border border-cas-outline-variant/35 text-cas-on-surface-variant transition hover:border-cas-primary/30 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
								onClick={() => setSelectedPayment(null)}
								type="button"
								aria-label="Đóng xác nhận thanh toán"
							>
								<CasIcon className="size-5 rotate-45" name="plus" />
							</button>
						</div>

						<div className="mt-5 rounded-xl bg-cas-surface-container/70 p-4">
							<div className="flex items-center justify-between gap-4">
								<span className="text-sm text-cas-on-surface-variant">Số tiền</span>
								<strong className="text-xl text-cas-primary">{selectedPayment.amount}</strong>
							</div>
							<p className="mt-4 border-t border-cas-outline-variant/25 pt-4 text-sm leading-6 text-cas-on-surface">Bạn chỉ xác nhận khi đã kiểm tra loa bên ngoài CAS báo giao dịch thành công.</p>
						</div>

						<div className="mt-5 grid gap-3 sm:grid-cols-2">
							<button
								className="min-h-11 rounded-xl border border-cas-outline-variant/45 px-4 text-sm font-extrabold transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
								onClick={() => setSelectedPayment(null)}
								type="button"
							>
								Quay lại
							</button>
							<button className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-extrabold text-cas-on-primary transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring" onClick={handleConfirmPayment} type="button">
								Xác nhận đã thanh toán
							</button>
						</div>
					</section>
				</div>
			) : null}
		</>
	);
}

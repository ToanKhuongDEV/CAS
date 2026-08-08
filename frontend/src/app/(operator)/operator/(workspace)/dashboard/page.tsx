import type { Metadata } from "next";
import Link from "next/link";

import { OperatorComplaintsPanel } from "../../../../../components/operator/operator-complaints-panel";
import { CasButton } from "../../../../../components/ui/cas-button";
import { CasIcon } from "../../../../../components/ui/cas-icon";

export const metadata: Metadata = {
	title: "Tổng quan | CAS",
	description: "Theo dõi tổng quan, bàn chờ lâu và khiếu nại tại CAS.",
};

type SummaryCard = {
	label: string;
	supportingValue?: string;
	value: string;
};

const summaryCards: SummaryCard[] = [
	{
		label: "Lượt gọi món hôm nay",
		value: "08",
	},
	{
		label: "Bàn đang phục vụ",
		supportingValue: "/20",
		value: "12",
	},
	{
		label: "Yêu cầu thanh toán",
		value: "03",
	},
];

const temporaryWaitingThresholdMinutes = 25;

const waitingTables = [
	{
		pendingSince: "19:05",
		table: "Bàn 05",
		waitingTime: "37 phút",
	},
	{
		pendingSince: "19:11",
		table: "Bàn 12",
		waitingTime: "31 phút",
	},
	{
		pendingSince: "19:17",
		table: "Bàn 03",
		waitingTime: "25 phút",
	},
];

const tables = [
	{
		label: "Bàn 01",
		orderNumber: "ORD-0820",
		status: "Đang hoạt động",
		tone: "active",
	},
	{
		label: "Bàn 02",
		status: "Trống",
		tone: "empty",
	},
	{
		label: "Bàn 05",
		orderNumber: "ORD-0821",
		status: "Đang hoạt động",
		tone: "active",
	},
	{
		label: "Bàn 07",
		status: "Trống",
		tone: "empty",
	},
] as const;

const tableToneClasses = {
	active: "border-cas-secondary bg-cas-secondary-container/20",
	empty: "border-dashed border-cas-outline-variant bg-cas-glass",
};

export default function OperatorDashboardPage() {
	return (
		<>
			<header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tổng quan</h1>
					<p className="mt-2 text-sm text-cas-on-surface-variant">Theo dõi nhanh hoạt động và các bàn cần chú ý trong ca.</p>
				</div>

				<div className="flex items-center gap-2.5">
					<CasButton variant="outline">
						<CasIcon className="size-4" name="trash" />
						<span>Hủy món do sự cố</span>
					</CasButton>

					<CasButton href="/operator/orders/new">
						<CasIcon className="size-4" name="plus" />
						<span>Tạo order hộ</span>
					</CasButton>
				</div>
			</header>

			<section className="mt-6 grid gap-3 md:grid-cols-3" aria-label="Tổng quan hoạt động hôm nay">
				{summaryCards.map((card) => (
					<article className="flex min-h-14 items-center justify-between gap-4 rounded-xl border border-cas-outline-variant/25 bg-cas-glass px-4 py-3" key={card.label}>
						<p className="text-sm font-bold text-cas-on-surface-variant">{card.label}</p>
						<p className="shrink-0 text-lg font-extrabold tracking-tight text-cas-primary">
							{card.value}
							{card.supportingValue ? <span className="ml-0.5 text-xs text-cas-on-surface-variant/60">{card.supportingValue}</span> : null}
						</p>
					</article>
				))}
			</section>

			<div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.8fr)]">
				<div className="flex flex-col gap-6">
					<section className="rounded-2xl border border-cas-primary/25 bg-cas-primary/5 p-5" aria-labelledby="waiting-table-alerts-title">
						<div className="flex items-start gap-3">
							<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
								<CasIcon className="size-5" name="clock" />
							</span>
							<div>
								<h2 className="text-xl font-extrabold text-cas-primary" id="waiting-table-alerts-title">
									Cảnh báo bàn chờ lâu
								</h2>
								<p className="mt-1 text-xs leading-relaxed text-cas-on-surface-variant">
									Thời gian được tính từ lúc bàn bắt đầu chờ món chưa hoàn thành. Ngưỡng cảnh báo hiện tại: <strong>{temporaryWaitingThresholdMinutes} phút</strong>.
								</p>
							</div>
						</div>

						<ul className="mt-4 space-y-3">
							{waitingTables.map((table) => (
								<li className="grid gap-3 rounded-xl border border-cas-primary/15 bg-cas-glass p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center" key={table.table}>
									<div>
										<p className="font-extrabold">{table.table}</p>
										<p className="mt-1 text-xs text-cas-on-surface-variant">Chờ món từ {table.pendingSince}</p>
									</div>
									<span className="w-fit rounded-full bg-cas-primary px-3 py-1.5 text-xs font-extrabold text-cas-on-primary">Đã chờ {table.waitingTime}</span>
								</li>
							))}
						</ul>
					</section>

					<OperatorComplaintsPanel />
				</div>

				<section className="rounded-2xl border border-cas-outline-variant/20 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)]" aria-labelledby="table-overview-title">
					<div className="flex items-center justify-between gap-4">
						<h2 className="text-xl font-extrabold" id="table-overview-title">
							Sơ đồ bàn mini
						</h2>
						<span className="text-xs font-extrabold text-cas-primary">12/20 đang dùng</span>
					</div>

					<ul className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-cas-outline-variant/25 bg-cas-surface p-4">
						{tables.map((table) => (
							<li key={table.label}>
								{table.tone === "active" ? (
									<Link
										className={`grid min-h-20 place-items-center rounded-xl border-2 p-3 text-center transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${tableToneClasses[table.tone]}`}
										href={`/operator/orders/${table.orderNumber}`}
										aria-label={`Mở đơn của ${table.label}`}
									>
										<div>
											<p className="font-extrabold">{table.label}</p>
											<p className="mt-1 text-[0.68rem] font-bold text-cas-secondary">{table.status}</p>
										</div>
									</Link>
								) : (
									<div className={`grid min-h-20 place-items-center rounded-xl border-2 p-3 text-center ${tableToneClasses[table.tone]}`}>
										<div>
											<p className="font-extrabold">{table.label}</p>
											<p className="mt-1 text-[0.68rem] font-bold text-cas-on-surface-variant">{table.status}</p>
										</div>
									</div>
								)}
							</li>
						))}
					</ul>

					<div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[0.68rem] text-cas-on-surface-variant">
						<span>○ Trống</span>
						<span className="text-cas-secondary">● Đang hoạt động</span>
					</div>
				</section>
			</div>
		</>
	);
}

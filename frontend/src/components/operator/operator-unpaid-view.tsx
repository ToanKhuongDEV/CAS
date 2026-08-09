"use client";

import { useEffect, useState } from "react";
import { CasIcon } from "../ui/cas-icon";

export type BillOptionSnapshot = {
	groupName: string;
	name: string;
	quantityPerItem: number;
	unitPrice: number;
};

export type BillItemSnapshot = {
	name: string;
	options: BillOptionSnapshot[];
	optionsAmount: number;
	originalLineAmount: number;
	payableLineAmount: number;
	quantity: number;
	remainingQuantity: number;
	unitPrice: number;
};

export type BillOrderSnapshot = {
	items: BillItemSnapshot[];
	note?: string;
	orderNumber: string;
	originalAmount: number;
	payableAmount: number;
	placedAt: string;
};

export type BillSnapshot = {
	billNumber: string;
	currency: string;
	customerName?: string;
	customerPhone?: string;
	orders: BillOrderSnapshot[];
	originalAmount: number;
	payableAmount: number;
	table: {
		code: number;
		id: string;
		name: string;
	};
	voucherCode?: string;
	voucherDiscount?: number;
};

export type UnpaidRecord = {
	amount: number;
	amountFormatted: string;
	billSnapshot: BillSnapshot;
	closedAt: string;
	createdDate: string;
	id: string;
	publicId: string;
	reason: string;
	reportedBy: string;
	reportedByName: string;
	resolvedAt?: string;
	status: "OPEN" | "RESOLVED";
	table: string;
	tableSessionId: string;
};

const initialUnpaidRecords: UnpaidRecord[] = [
	{
		amount: 320000,
		amountFormatted: "320.000đ",
		closedAt: "18:15",
		createdDate: "08/08/2026",
		id: "unpaid-01",
		publicId: "upr-uuid-001-table-09",
		reason: "Khách rời đi chưa quẹt thẻ/thanh toán",
		reportedBy: "acc-operator-01",
		reportedByName: "Nguyễn Văn A (Nhân viên)",
		status: "OPEN",
		table: "Bàn 09",
		tableSessionId: "session-b09-20260808",
		billSnapshot: {
			billNumber: "BILL-20260808-009",
			currency: "VND",
			customerName: "Nguyễn Văn B",
			customerPhone: "0901234567",
			table: {
				code: 9,
				id: "table-09",
				name: "Bàn 09",
			},
			orders: [
				{
					orderNumber: "ORD-20260808-001",
					placedAt: "17:30",
					note: "Mang tất cả món ra cùng lúc, mỳ ít cay",
					originalAmount: 180000,
					payableAmount: 180000,
					items: [
						{
							name: "Mỳ Cay Hải Sản",
							unitPrice: 55000,
							optionsAmount: 10000,
							quantity: 2,
							remainingQuantity: 2,
							originalLineAmount: 130000,
							payableLineAmount: 130000,
							options: [
								{ groupName: "Cấp độ cay", name: "Cấp 3", unitPrice: 0, quantityPerItem: 1 },
								{ groupName: "Topping", name: "Thêm Tôm", unitPrice: 10000, quantityPerItem: 1 },
							],
						},
						{
							name: "Trà Sữa Ô Long",
							unitPrice: 35000,
							optionsAmount: 15000,
							quantity: 1,
							remainingQuantity: 1,
							originalLineAmount: 50000,
							payableLineAmount: 50000,
							options: [
								{ groupName: "Kích thước", name: "Size L", unitPrice: 10000, quantityPerItem: 1 },
								{ groupName: "Độ ngọt", name: "50% Đường", unitPrice: 0, quantityPerItem: 1 },
								{ groupName: "Topping", name: "Trân châu đen", unitPrice: 5000, quantityPerItem: 1 },
							],
						},
					],
				},
				{
					orderNumber: "ORD-20260808-002",
					placedAt: "17:52",
					note: "Gọi thêm món",
					originalAmount: 150000,
					payableAmount: 150000,
					items: [
						{
							name: "Mỳ Cay Bò",
							unitPrice: 65000,
							optionsAmount: 10000,
							quantity: 2,
							remainingQuantity: 2,
							originalLineAmount: 150000,
							payableLineAmount: 150000,
							options: [
								{ groupName: "Cấp độ cay", name: "Cấp 2", unitPrice: 0, quantityPerItem: 1 },
								{ groupName: "Topping", name: "Thêm Phô Mai", unitPrice: 10000, quantityPerItem: 1 },
							],
						},
					],
				},
			],
			originalAmount: 330000,
			payableAmount: 320000,
			voucherCode: "CASFREE10",
			voucherDiscount: 10000,
		},
	},
	{
		amount: 185000,
		amountFormatted: "185.000đ",
		closedAt: "19:40",
		createdDate: "08/08/2026",
		id: "unpaid-02",
		publicId: "upr-uuid-002-table-04",
		reason: "Khách bận việc đột xuất không kịp quẹt thẻ",
		reportedBy: "acc-operator-02",
		reportedByName: "Trần Thị C (Nhân viên)",
		status: "OPEN",
		table: "Bàn 04",
		tableSessionId: "session-b04-20260808",
		billSnapshot: {
			billNumber: "BILL-20260808-004",
			currency: "VND",
			customerName: "Lê Hoàng C",
			customerPhone: "0912345678",
			table: {
				code: 4,
				id: "table-04",
				name: "Bàn 04",
			},
			orders: [
				{
					orderNumber: "ORD-20260808-008",
					placedAt: "18:50",
					note: "Mang ra ngay",
					originalAmount: 185000,
					payableAmount: 185000,
					items: [
						{
							name: "Bánh Bột Lọc",
							unitPrice: 35000,
							optionsAmount: 0,
							quantity: 2,
							remainingQuantity: 2,
							originalLineAmount: 70000,
							payableLineAmount: 70000,
							options: [],
						},
						{
							name: "Trà Trái Cây Đào Cam Sả",
							unitPrice: 40000,
							optionsAmount: 0,
							quantity: 2,
							remainingQuantity: 2,
							originalLineAmount: 80000,
							payableLineAmount: 80000,
							options: [{ groupName: "Kích thước", name: "Size M", unitPrice: 0, quantityPerItem: 1 }],
						},
						{
							name: "Cá Viên Chiên Bơ",
							unitPrice: 35000,
							optionsAmount: 0,
							quantity: 1,
							remainingQuantity: 1,
							originalLineAmount: 35000,
							payableLineAmount: 35000,
							options: [],
						},
					],
				},
			],
			originalAmount: 185000,
			payableAmount: 185000,
		},
	},
	{
		amount: 240000,
		amountFormatted: "240.000đ",
		closedAt: "14:20",
		createdDate: "07/08/2026",
		id: "unpaid-03",
		publicId: "upr-uuid-003-table-14",
		reason: "Nhầm lẫn khi chốt ca - Khách đã chuyển khoản sau đó",
		reportedBy: "acc-operator-01",
		reportedByName: "Nguyễn Văn A (Nhân viên)",
		resolvedAt: "16:00 - 07/08/2026",
		status: "RESOLVED",
		table: "Bàn 14",
		tableSessionId: "session-b14-20260807",
		billSnapshot: {
			billNumber: "BILL-20260807-014",
			currency: "VND",
			customerName: "Phạm Minh D",
			customerPhone: "0988776655",
			table: {
				code: 14,
				id: "table-14",
				name: "Bàn 14",
			},
			orders: [
				{
					orderNumber: "ORD-20260807-014",
					placedAt: "13:10",
					originalAmount: 240000,
					payableAmount: 240000,
					items: [
						{
							name: "Lẩu Nấm Mini",
							unitPrice: 180000,
							optionsAmount: 0,
							quantity: 1,
							remainingQuantity: 1,
							originalLineAmount: 180000,
							payableLineAmount: 180000,
							options: [],
						},
						{
							name: "Nước Ngọt Coca",
							unitPrice: 30000,
							optionsAmount: 0,
							quantity: 2,
							remainingQuantity: 2,
							originalLineAmount: 60000,
							payableLineAmount: 60000,
							options: [],
						},
					],
				},
			],
			originalAmount: 240000,
			payableAmount: 240000,
		},
	},
];

export function OperatorUnpaidView() {
	const [records, setRecords] = useState<UnpaidRecord[]>(initialUnpaidRecords);
	const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
	const [selectedRecord, setSelectedRecord] = useState<UnpaidRecord | null>(null);
	const [activeTab, setActiveTab] = useState<"RECEIPT" | "JSON">("RECEIPT");
	const [actionMessage, setActionMessage] = useState<string | null>(null);

	// Handle ESC key and scroll lock
	useEffect(() => {
		if (!selectedRecord) {
			return;
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setSelectedRecord(null);
			}
		}

		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [selectedRecord]);

	const filteredRecords = records.filter((r) => {
		if (filterStatus === "ALL") return true;
		return r.status === filterStatus;
	});

	function handleMarkAsResolved(recordId: string) {
		const now = new Date();
		const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} - ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()}`;

		setRecords((prev) =>
			prev.map((rec) => {
				if (rec.id === recordId) {
					return {
						...rec,
						status: "RESOLVED",
						resolvedAt: timeStr,
					};
				}
				return rec;
			}),
		);

		if (selectedRecord && selectedRecord.id === recordId) {
			setSelectedRecord((prev) => (prev ? { ...prev, status: "RESOLVED", resolvedAt: timeStr } : null));
		}

		setActionMessage(`Đã đánh dấu khoản chưa thanh toán của ${selectedRecord?.table || "bàn"} là ĐÃ THU TIỀN (RESOLVED).`);
	}

	return (
		<div className="space-y-6">
			{/* Top Header */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-extrabold">Khoản chưa thanh toán</h1>
					<p className="mt-1 text-sm text-cas-on-surface-variant">Quản lý và tra cứu bill snapshot các phiên bàn đã đóng nhưng payment chưa xác nhận PAID</p>
				</div>

				{/* Filter Tabs */}
				<div className="flex items-center gap-1 rounded-xl border border-cas-outline-variant/30 bg-cas-surface p-1.5 shadow-sm">
					<button className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${filterStatus === "ALL" ? "bg-cas-primary text-cas-on-primary shadow-xs" : "text-cas-on-surface-variant hover:text-cas-on-surface"}`} onClick={() => setFilterStatus("ALL")} type="button">
						Tất cả ({records.length})
					</button>
					<button className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${filterStatus === "OPEN" ? "bg-cas-error text-cas-on-error shadow-xs" : "text-cas-on-surface-variant hover:text-cas-on-surface"}`} onClick={() => setFilterStatus("OPEN")} type="button">
						Chưa xử lý ({records.filter((r) => r.status === "OPEN").length})
					</button>
					<button className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${filterStatus === "RESOLVED" ? "bg-cas-secondary text-cas-on-secondary shadow-xs" : "text-cas-on-surface-variant hover:text-cas-on-surface"}`} onClick={() => setFilterStatus("RESOLVED")} type="button">
						Đã thu hồi ({records.filter((r) => r.status === "RESOLVED").length})
					</button>
				</div>
			</div>

			{/* Status Action Message Toast */}
			{actionMessage ? (
				<div className="flex items-center justify-between gap-3 rounded-xl border border-cas-secondary/30 bg-cas-secondary-container/20 p-4 text-sm font-bold text-cas-secondary" role="status">
					<div className="flex items-center gap-2">
						<CasIcon className="size-5 shrink-0" name="check" />
						<span>{actionMessage}</span>
					</div>
					<button className="text-xs underline hover:no-underline" onClick={() => setActionMessage(null)} type="button">
						Ẩn
					</button>
				</div>
			) : null}

			{/* List of Unpaid Records */}
			{filteredRecords.length > 0 ? (
				<ul className="grid gap-4" aria-label="Danh sách khoản chưa thanh toán">
					{filteredRecords.map((record) => (
						<li className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-5 shadow-[0_5px_18px_var(--cas-shadow-color)] transition hover:border-cas-primary/30" key={record.id}>
							<div className="space-y-1">
								<div className="flex items-center gap-3">
									<span className="text-lg font-extrabold">{record.table}</span>
									{record.status === "OPEN" ? (
										<span className="inline-flex items-center rounded-md bg-cas-error/15 px-2.5 py-0.5 text-xs font-extrabold text-cas-error">CHƯA THANH TOÁN (OPEN)</span>
									) : (
										<span className="inline-flex items-center rounded-md bg-cas-secondary/15 px-2.5 py-0.5 text-xs font-extrabold text-cas-secondary">ĐÃ THU TIỀN (RESOLVED)</span>
									)}
								</div>
								<p className="text-xs text-cas-on-surface-variant">
									Đóng phiên lúc <strong>{record.closedAt}</strong> ({record.createdDate}) • Báo cáo bởi: {record.reportedByName}
								</p>
								<p className="text-xs text-cas-on-surface-variant/80 italic">Lý do: &quot;{record.reason}&quot;</p>
							</div>

							<div className="flex items-center gap-4">
								<div className="text-right">
									<p className="text-xs text-cas-on-surface-variant">Tổng cần trả</p>
									<p className="text-xl font-black text-cas-primary">{record.amountFormatted}</p>
								</div>

								<button
									className="flex items-center gap-2 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-4 py-2.5 text-sm font-extrabold text-cas-on-surface transition hover:border-cas-primary/50 hover:bg-cas-primary/5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
									onClick={() => {
										setSelectedRecord(record);
										setActiveTab("RECEIPT");
									}}
									type="button"
								>
									<CasIcon className="size-4" name="bill" />
									<span>Xem bill snapshot</span>
								</button>
							</div>
						</li>
					))}
				</ul>
			) : (
				<div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/50 bg-cas-glass p-8 text-center">
					<div>
						<CasIcon className="mx-auto size-10 text-cas-on-surface-variant/50" name="clock" />
						<h2 className="mt-2 text-lg font-extrabold">Không có khoản chưa thanh toán nào</h2>
						<p className="mt-1 text-sm text-cas-on-surface-variant">Không tìm thấy bản ghi phù hợp với bộ lọc hiện tại.</p>
					</div>
				</div>
			)}

			{/* BILL SNAPSHOT MODAL / DIALOG */}
			{selectedRecord ? (
				<div
					className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							setSelectedRecord(null);
						}
					}}
				>
					<section className="my-auto flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-cas-outline-variant/30 bg-cas-surface shadow-2xl" aria-labelledby="bill-snapshot-title" aria-modal="true" role="dialog">
						{/* Modal Header */}
						<div className="flex shrink-0 items-center justify-between border-b border-cas-outline-variant/20 p-5 sm:p-6">
							<div>
								<div className="flex items-center gap-2">
									<span className="rounded-md bg-cas-primary/10 px-2.5 py-0.5 text-xs font-black tracking-wider text-cas-primary uppercase">{selectedRecord.billSnapshot.billNumber}</span>
									{selectedRecord.status === "OPEN" ? <span className="rounded-md bg-cas-error/15 px-2 py-0.5 text-[0.7rem] font-bold text-cas-error">OPEN</span> : <span className="rounded-md bg-cas-secondary/15 px-2 py-0.5 text-[0.7rem] font-bold text-cas-secondary">RESOLVED</span>}
								</div>
								<h2 className="mt-1 text-2xl font-black" id="bill-snapshot-title">
									Bill Snapshot: {selectedRecord.table}
								</h2>
							</div>

							<div className="flex items-center gap-3">
								{/* Tab Toggle: Receipt view vs Raw JSON */}
								<div className="flex rounded-lg border border-cas-outline-variant/30 bg-cas-surface-container/60 p-1 text-xs font-extrabold">
									<button className={`rounded-md px-2.5 py-1 transition ${activeTab === "RECEIPT" ? "bg-cas-primary text-cas-on-primary shadow-xs" : "text-cas-on-surface-variant hover:text-cas-on-surface"}`} onClick={() => setActiveTab("RECEIPT")} type="button">
										Hóa đơn
									</button>
									<button className={`rounded-md px-2.5 py-1 transition ${activeTab === "JSON" ? "bg-cas-primary text-cas-on-primary shadow-xs" : "text-cas-on-surface-variant hover:text-cas-on-surface"}`} onClick={() => setActiveTab("JSON")} type="button">
										JSON
									</button>
								</div>

								<button
									className="grid size-9 place-items-center rounded-xl border border-cas-outline-variant/35 text-cas-on-surface-variant transition hover:border-cas-primary/30 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
									onClick={() => setSelectedRecord(null)}
									type="button"
									aria-label="Đóng bill snapshot"
								>
									<CasIcon className="size-5 rotate-45" name="plus" />
								</button>
							</div>
						</div>

						{/* Modal Content Scrollable Body */}
						<div className="flex-1 overflow-y-auto p-5 space-y-6 sm:p-6">
							{activeTab === "RECEIPT" ? (
								<>
									{/* Receipt Meta Box */}
									<div className="rounded-xl border border-cas-outline-variant/20 bg-cas-surface-container/40 p-4 text-xs space-y-2">
										<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
											<div>
												<span className="text-cas-on-surface-variant">Khách mở bàn:</span>
												<p className="font-bold">{selectedRecord.billSnapshot.customerName || "N/A"}</p>
											</div>
											<div>
												<span className="text-cas-on-surface-variant">SĐT khách:</span>
												<p className="font-bold">{selectedRecord.billSnapshot.customerPhone || "N/A"}</p>
											</div>
											<div>
												<span className="text-cas-on-surface-variant">Thời gian đóng:</span>
												<p className="font-bold">
													{selectedRecord.closedAt} ({selectedRecord.createdDate})
												</p>
											</div>
											<div>
												<span className="text-cas-on-surface-variant">Người báo cáo:</span>
												<p className="font-bold">{selectedRecord.reportedByName}</p>
											</div>
										</div>
										<div className="border-t border-cas-outline-variant/20 pt-2">
											<span className="text-cas-on-surface-variant">Lý do ghi nhận chưa thanh toán:</span>
											<p className="font-semibold text-cas-error">&quot;{selectedRecord.reason}&quot;</p>
										</div>
										{selectedRecord.resolvedAt ? <div className="border-t border-cas-outline-variant/20 pt-2 text-cas-secondary font-bold">✓ Đã thu hồi khoản thanh toán lúc: {selectedRecord.resolvedAt}</div> : null}
									</div>

									{/* Orders Breakdown */}
									<div className="space-y-4">
										<h3 className="text-sm font-extrabold uppercase tracking-wider text-cas-on-surface-variant">Chi tiết các đơn đặt trong phiên ({selectedRecord.billSnapshot.orders.length} lần gọi)</h3>

										{selectedRecord.billSnapshot.orders.map((ord, idx) => (
											<div className="rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container/20 p-4 space-y-3" key={ord.orderNumber}>
												<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-2 text-xs">
													<div className="flex items-center gap-2">
														<span className="font-extrabold text-cas-primary">
															Order #{idx + 1}: {ord.orderNumber}
														</span>
														<span className="text-cas-on-surface-variant">({ord.placedAt})</span>
													</div>
													<span className="font-bold">{ord.payableAmount.toLocaleString("vi-VN")}đ</span>
												</div>

												{ord.note ? <p className="text-xs text-cas-secondary font-semibold italic">Ghi chú đơn: &quot;{ord.note}&quot;</p> : null}

												{/* Items list */}
												<ul className="divide-y divide-cas-outline-variant/15 text-sm">
													{ord.items.map((item, iIndex) => (
														<li className="py-2.5 first:pt-0 last:pb-0" key={`${item.name}-${iIndex}`}>
															<div className="flex items-start justify-between gap-4">
																<div>
																	<p className="font-extrabold text-cas-on-surface">
																		{item.name} <span className="text-cas-primary font-black">x{item.quantity}</span>
																	</p>
																	{item.options && item.options.length > 0 ? (
																		<ul className="mt-1 space-y-0.5 text-xs text-cas-on-surface-variant">
																			{item.options.map((opt, oIdx) => (
																				<li key={`${opt.name}-${oIdx}`}>
																					- {opt.groupName}: <strong className="text-cas-on-surface">{opt.name}</strong> {opt.unitPrice > 0 ? `(+${opt.unitPrice.toLocaleString("vi-VN")}đ)` : ""}
																				</li>
																			))}
																		</ul>
																	) : null}
																</div>
																<div className="text-right shrink-0">
																	<span className="font-extrabold">{item.payableLineAmount.toLocaleString("vi-VN")}đ</span>
																	<p className="text-[0.7rem] text-cas-on-surface-variant">({item.unitPrice.toLocaleString("vi-VN")}đ/món)</p>
																</div>
															</div>
														</li>
													))}
												</ul>
											</div>
										))}
									</div>

									{/* Bill Totals Summary */}
									<div className="rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container/60 p-4 space-y-2 text-sm">
										<div className="flex items-center justify-between text-cas-on-surface-variant">
											<span>Tổng tiền món gốc</span>
											<span>{selectedRecord.billSnapshot.originalAmount.toLocaleString("vi-VN")}đ</span>
										</div>

										{selectedRecord.billSnapshot.voucherDiscount ? (
											<div className="flex items-center justify-between text-cas-secondary font-bold">
												<span>Giảm giá Voucher ({selectedRecord.billSnapshot.voucherCode})</span>
												<span>-{selectedRecord.billSnapshot.voucherDiscount.toLocaleString("vi-VN")}đ</span>
											</div>
										) : null}

										<div className="flex items-center justify-between border-t border-cas-outline-variant/30 pt-3 font-black text-lg">
											<span>TỔNG CẦN THANH TOÁN</span>
											<span className="text-cas-primary text-2xl">{selectedRecord.billSnapshot.payableAmount.toLocaleString("vi-VN")}đ</span>
										</div>
									</div>
								</>
							) : (
								/* JSON Raw View */
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<p className="text-xs text-cas-on-surface-variant font-mono">Dữ liệu `bill_snapshot` lưu bất biến trong bảng `unpaid_records`:</p>
										<button className="text-xs text-cas-primary underline font-bold hover:no-underline" onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedRecord.billSnapshot, null, 2))} type="button">
											Sao chép JSON
										</button>
									</div>
									<pre className="max-h-96 overflow-x-auto rounded-xl border border-cas-outline-variant/30 bg-black/90 p-4 text-xs text-emerald-400 font-mono">{JSON.stringify(selectedRecord.billSnapshot, null, 2)}</pre>
								</div>
							)}
						</div>

						{/* Modal Footer Actions */}
						<div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-cas-outline-variant/20 p-4 bg-cas-surface-container/30 sm:px-6">
							<button
								className="rounded-xl border border-cas-outline-variant/40 px-4 py-2.5 text-sm font-extrabold transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
								onClick={() => setSelectedRecord(null)}
								type="button"
							>
								Đóng
							</button>

							<div className="flex items-center gap-3">
								{selectedRecord.status === "OPEN" ? (
									<button
										className="rounded-xl bg-cas-secondary px-4 py-2.5 text-sm font-extrabold text-white transition hover:brightness-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
										onClick={() => handleMarkAsResolved(selectedRecord.id)}
										type="button"
									>
										✓ Xác nhận đã thu tiền (RESOLVED)
									</button>
								) : (
									<span className="text-xs font-bold text-cas-secondary">✓ Đã đánh dấu thu tiền thành công</span>
								)}
							</div>
						</div>
					</section>
				</div>
			) : null}
		</div>
	);
}

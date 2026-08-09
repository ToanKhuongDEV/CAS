"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";

type TableItem = {
	code: number;
	id: number;
	qrToken: string;
	sessionStatus: "OPEN" | "CLOSED" | "PAYMENT_PENDING";
	type: "FIXED" | "MOBILE";
};

const mockTables: TableItem[] = [
	{ id: 1, code: 1, qrToken: "qr-tb-001-fix", type: "FIXED", sessionStatus: "OPEN" },
	{ id: 2, code: 2, qrToken: "qr-tb-002-fix", type: "FIXED", sessionStatus: "OPEN" },
	{ id: 3, code: 3, qrToken: "qr-tb-003-mob", type: "MOBILE", sessionStatus: "CLOSED" },
	{ id: 4, code: 4, qrToken: "qr-tb-004-fix", type: "FIXED", sessionStatus: "PAYMENT_PENDING" },
	{ id: 5, code: 5, qrToken: "qr-tb-005-fix", type: "FIXED", sessionStatus: "CLOSED" },
];

export default function AdminTablesPage() {
	const [tables, setTables] = useState<TableItem[]>(mockTables);
	const [showAddForm, setShowAddForm] = useState(false);
	const [newTableCode, setNewTableCode] = useState<string>("");
	const [selectedQR, setSelectedQR] = useState<TableItem | null>(null);

	const handleCreateTable = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newTableCode) return;
		const codeNum = Number(newTableCode);
		const newTab: TableItem = {
			id: Date.now(),
			code: codeNum,
			qrToken: `qr-tb-00${codeNum}-fix`,
			type: "FIXED",
			sessionStatus: "CLOSED",
		};
		setTables([...tables, newTab]);
		setNewTableCode("");
		setShowAddForm(false);
	};

	return (
		<div className="space-y-6">
			{/* Top Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black text-cas-on-surface">Quản lý Bàn ăn & Thẻ Mã QR</h1>
					<p className="text-xs text-cas-on-surface-variant">Tạo mã bàn (mã số bàn), quản lý token mã QR cố định hoặc thẻ di động cho nhà hàng.</p>
				</div>
				<CasButton icon="plus" onClick={() => setShowAddForm(true)} size="md" variant="primary">
					Thêm Bàn mới
				</CasButton>
			</div>

			{/* Modal Form Tạo Bàn mới */}
			{showAddForm && (
				<div
					className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) setShowAddForm(false);
					}}
				>
					<form className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150" onSubmit={handleCreateTable}>
						<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
							<h3 className="text-base font-black text-cas-on-surface">Tạo Bàn & Sinh Mã QR Mới</h3>
							<button className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary" onClick={() => setShowAddForm(false)} type="button">
								Hủy
							</button>
						</div>

						<div className="text-xs space-y-3">
							<div>
								<label className="block font-bold text-cas-on-surface-variant">Mã số Bàn (Kiểu Số):</label>
								<input
									className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-black text-cas-primary focus:outline-none focus:ring-2 focus:ring-cas-primary"
									min={1}
									onChange={(e) => setNewTableCode(e.target.value)}
									placeholder="Nhập số bàn (VD: 6)"
									required
									type="number"
									value={newTableCode}
								/>
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-2">
							<CasButton onClick={() => setShowAddForm(false)} size="sm" type="button" variant="outline">
								Hủy
							</CasButton>
							<CasButton icon="plus" size="sm" type="submit" variant="primary">
								Tạo Bàn & Sinh Mã QR
							</CasButton>
						</div>
					</form>
				</div>
			)}

			{/* Sơ đồ Grid Bàn ăn */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{tables.map((table) => (
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition hover:shadow-md" key={table.id}>
						<div className="flex items-center justify-between">
							<span className="rounded-xl bg-cas-primary/10 px-3 py-1 text-sm font-black text-cas-primary">BÀN {table.code}</span>
							<span
								className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-black ${table.sessionStatus === "OPEN" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : table.sessionStatus === "PAYMENT_PENDING" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-cas-surface-container text-cas-on-surface-variant"}`}
							>
								{table.sessionStatus === "OPEN" ? "ĐANG CÓ KHÁCH" : table.sessionStatus === "PAYMENT_PENDING" ? "CHỜ THANH TOÁN" : "BÀN TRỐNG"}
							</span>
						</div>

						<div className="mt-4 flex items-center justify-between border-t border-cas-outline-variant/15 pt-3 text-xs">
							<div>
								<p className="font-bold text-cas-on-surface-variant">Loại thẻ QR:</p>
								<p className="font-extrabold text-cas-on-surface">{table.type === "FIXED" ? "Mã QR cố định tại bàn" : "Thẻ QR di động"}</p>
							</div>
							<CasButton onClick={() => setSelectedQR(table)} size="sm" variant="outline-primary">
								Xem QR Code
							</CasButton>
						</div>
					</div>
				))}
			</div>

			{/* Modal Xem QR */}
			{selectedQR && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
					<div className="w-full max-w-sm space-y-4 rounded-3xl bg-cas-surface p-6 text-center shadow-2xl">
						<h3 className="text-lg font-black text-cas-on-surface">Mã QR - BÀN {selectedQR.code}</h3>
						<div className="mx-auto grid size-48 place-items-center rounded-2xl border border-cas-outline-variant/30 bg-white p-4">
							<div className="grid size-36 place-items-center rounded-xl border-4 border-dashed border-cas-primary/40 text-center text-[0.68rem] font-black text-cas-primary">
								[ QR CODE TOKEN ]<br />
								{selectedQR.qrToken}
							</div>
						</div>
						<p className="text-xs font-medium text-cas-on-surface-variant">Khách quét mã QR này để truy cập trực tiếp menu bàn {selectedQR.code}.</p>
						<div className="flex gap-2">
							<CasButton className="w-full" onClick={() => setSelectedQR(null)} size="sm" variant="outline">
								Đóng
							</CasButton>
							<CasButton className="w-full" size="sm" variant="primary">
								Tải ảnh QR
							</CasButton>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

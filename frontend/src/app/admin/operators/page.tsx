"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";

type OperatorAccount = {
	id: number;
	fullName: string;
	phone: string;
	role: "OPERATOR";
	status: "ACTIVE" | "LOCKED";
	createdAt: string;
};

const mockOperators: OperatorAccount[] = [
	{ id: 1, fullName: "Nguyễn Văn A", phone: "0901234567", role: "OPERATOR", status: "ACTIVE", createdAt: "2026-01-15" },
	{ id: 2, fullName: "Trần Thị B", phone: "0912345678", role: "OPERATOR", status: "ACTIVE", createdAt: "2026-02-01" },
	{ id: 3, fullName: "Lê Văn C", phone: "0987654321", role: "OPERATOR", status: "LOCKED", createdAt: "2026-03-10" },
];

export default function AdminOperatorsPage() {
	const [operators, setOperators] = useState<OperatorAccount[]>(mockOperators);
	const [showAddForm, setShowAddForm] = useState(false);
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");

	const toggleLock = (id: number) => {
		setOperators((prev) => prev.map((op) => (op.id === id ? { ...op, status: op.status === "ACTIVE" ? "LOCKED" : "ACTIVE" } : op)));
	};

	const handleAddOperator = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !phone) return;
		const newOp: OperatorAccount = {
			id: Date.now(),
			fullName: name,
			phone,
			role: "OPERATOR",
			status: "ACTIVE",
			createdAt: "2026-08-08",
		};
		setOperators([...operators, newOp]);
		setName("");
		setPhone("");
		setShowAddForm(false);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black text-cas-on-surface">Quản lý Tài khoản Nhân viên (OPERATOR)</h1>
					<p className="text-xs text-cas-on-surface-variant">Tạo, kích hoạt hoặc khóa tài khoản nhân viên phục vụ/thu ngân qua Firebase Authentication.</p>
				</div>
				<CasButton onClick={() => setShowAddForm(true)} icon="plus" variant="primary" size="md">
					Tạo tài khoản Nhân viên
				</CasButton>
			</div>

			{/* Form modal tạo nhân viên */}
			{showAddForm && (
				<div
					className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
					onMouseDown={(e) => {
						if (e.target === e.currentTarget) setShowAddForm(false);
					}}
				>
					<form onSubmit={handleAddOperator} className="my-auto w-full max-w-lg space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150">
						<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
							<h3 className="text-base font-black text-cas-on-surface">Thêm Tài khoản Nhân viên Mới</h3>
							<button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary">
								Hủy
							</button>
						</div>

						<div className="space-y-3 text-xs">
							<div>
								<label className="block font-bold text-cas-on-surface-variant">Họ và Tên Nhân viên:</label>
								<input
									type="text"
									placeholder="Nhập họ tên..."
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
									required
								/>
							</div>
							<div>
								<label className="block font-bold text-cas-on-surface-variant">Số điện thoại đăng nhập:</label>
								<input
									type="text"
									placeholder="Nhập SĐT..."
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
									required
								/>
							</div>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<CasButton type="button" onClick={() => setShowAddForm(false)} variant="outline" size="sm">
								Hủy
							</CasButton>
							<CasButton type="submit" variant="primary" size="sm">
								Xác nhận Tạo
							</CasButton>
						</div>
					</form>
				</div>
			)}

			{/* Table Nhân viên */}
			<div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
				<table className="w-full text-left text-xs">
					<thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 text-cas-on-surface-variant font-extrabold uppercase">
						<tr>
							<th className="px-6 py-4">Họ và Tên</th>
							<th className="px-6 py-4">Số điện thoại</th>
							<th className="px-6 py-4">Quyền (Role)</th>
							<th className="px-6 py-4">Ngày tạo</th>
							<th className="px-6 py-4">Trạng thái</th>
							<th className="px-6 py-4 text-right">Thao tác</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-cas-outline-variant/15 font-bold">
						{operators.map((op) => (
							<tr key={op.id} className="hover:bg-cas-surface-container/30 transition">
								<td className="px-6 py-4 text-sm font-black text-cas-on-surface">{op.fullName}</td>
								<td className="px-6 py-4 text-cas-on-surface-variant">{op.phone}</td>
								<td className="px-6 py-4">
									<span className="rounded-md bg-cas-secondary/15 px-2 py-0.5 text-[0.68rem] font-extrabold text-cas-secondary">OPERATOR</span>
								</td>
								<td className="px-6 py-4 text-cas-on-surface-variant">{op.createdAt}</td>
								<td className="px-6 py-4">
									<span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${op.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-600 dark:text-rose-400"}`}>{op.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ KHÓA"}</span>
								</td>
								<td className="px-6 py-4 text-right">
									<CasButton onClick={() => toggleLock(op.id)} variant={op.status === "ACTIVE" ? "danger" : "outline-primary"} size="sm">
										{op.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
									</CasButton>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

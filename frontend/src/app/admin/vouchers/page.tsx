"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

type Voucher = {
	id: number;
	code: string;
	description: string;
	discountType: "FIXED_AMOUNT" | "PERCENTAGE";
	discountValue: number;
	minOrderAmount: number;
	maxDiscountAmount?: number;
	usageLimit: number;
	usageCount: number;
	status: "ACTIVE" | "INACTIVE";
	startAt: string;
	endAt: string;
};

type PromoConfig = {
	enablePopupBanner: boolean;
	popupTitle: string;
	popupContent: string;
	popupVoucherCode: string;
	enableHeaderTicker: boolean;
	tickerMessage: string;
	enableCartAutoSuggest: boolean;
	cartSuggestThreshold: number;
};

const mockVouchers: Voucher[] = [
	{
		id: 1,
		code: "SUMMER50K",
		description: "Giảm 50k cho đơn từ 200k",
		discountType: "FIXED_AMOUNT",
		discountValue: 50000,
		minOrderAmount: 200000,
		usageLimit: 100,
		usageCount: 42,
		status: "ACTIVE",
		startAt: "2026-08-01",
		endAt: "2026-08-31",
	},
	{
		id: 2,
		code: "CASVIP15",
		description: "Giảm 15% tối đa 100k cho khách quen",
		discountType: "PERCENTAGE",
		discountValue: 15,
		minOrderAmount: 300000,
		maxDiscountAmount: 100000,
		usageLimit: 50,
		usageCount: 50,
		status: "INACTIVE",
		startAt: "2026-07-01",
		endAt: "2026-08-05",
	},
	{
		id: 3,
		code: "WELCOME10K",
		description: "Ưu đãi trải nghiệm bàn mới",
		discountType: "FIXED_AMOUNT",
		discountValue: 10000,
		minOrderAmount: 50000,
		usageLimit: 500,
		usageCount: 128,
		status: "ACTIVE",
		startAt: "2026-08-01",
		endAt: "2026-09-30",
	},
];

export default function AdminVouchersPage() {
	const [activeTab, setActiveTab] = useState<"vouchers" | "promotions">("vouchers");

	// State Voucher
	const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchers);
	const [showAddForm, setShowAddForm] = useState(false);
	const [code, setCode] = useState("");
	const [description, setDescription] = useState("");
	const [discountType, setDiscountType] = useState<"FIXED_AMOUNT" | "PERCENTAGE">("FIXED_AMOUNT");
	const [discountValue, setDiscountValue] = useState<number>(20000);
	const [minOrderAmount, setMinOrderAmount] = useState<number>(100000);
	const [usageLimit, setUsageLimit] = useState<number>(100);
	const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

	// State Cấu hình Khuyến mãi
	const [promoConfig, setPromoConfig] = useState<PromoConfig>({
		enablePopupBanner: true,
		popupTitle: "Chào mừng bạn đến với CAS Restaurant!",
		popupContent: "Nhập ngay mã SUMMER50K giảm 50.000đ cho đơn hàng từ 200.000đ khi gọi món tại bàn.",
		popupVoucherCode: "SUMMER50K",
		enableHeaderTicker: true,
		tickerMessage: "🔥 Giảm ngay 50k cho đơn từ 200k khi nhập mã SUMMER50K • Món mới Trà Trái Cây tươi mát đã sẵn sàng!",
		enableCartAutoSuggest: true,
		cartSuggestThreshold: 150000,
	});
	const [savedPromoSuccess, setSavedPromoSuccess] = useState(false);

	const toggleStatus = (id: number) => {
		setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, status: v.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : v)));
	};

	const handleAddVoucher = (e: React.FormEvent) => {
		e.preventDefault();
		if (!code.trim()) return;
		const newVoucher: Voucher = {
			id: Date.now(),
			code: code.trim().toUpperCase(),
			description,
			discountType,
			discountValue: Number(discountValue),
			minOrderAmount: Number(minOrderAmount),
			usageLimit: Number(usageLimit),
			usageCount: 0,
			status: "ACTIVE",
			startAt: new Date().toISOString().split("T")[0],
			endAt: "2026-12-31",
		};
		setVouchers([newVoucher, ...vouchers]);
		setCode("");
		setDescription("");
		setShowAddForm(false);
	};

	const handleSavePromoConfig = (e: React.FormEvent) => {
		e.preventDefault();
		setSavedPromoSuccess(true);
		setTimeout(() => setSavedPromoSuccess(false), 3000);
	};

	const filteredVouchers = vouchers.filter((v) => {
		if (statusFilter === "ALL") return true;
		return v.status === statusFilter;
	});

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black text-cas-on-surface">Quản lý Mã giảm giá & Cấu hình Khuyến mãi</h1>
					<p className="text-xs font-medium text-cas-on-surface-variant">Tạo mã ưu đãi voucher, cấu hình hạn mức và thiết lập các banner khuyến mãi tự động.</p>
				</div>
				{activeTab === "vouchers" && (
					<CasButton onClick={() => setShowAddForm(true)} icon="plus" variant="primary" size="md">
						Tạo Mã giảm giá mới
					</CasButton>
				)}
			</div>

			{/* Sub-tab Navigation */}
			<div className="flex items-center gap-2 border-b border-cas-outline-variant/20 pb-3">
				<button
					type="button"
					onClick={() => setActiveTab("vouchers")}
					className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === "vouchers" ? "bg-cas-secondary text-white font-black shadow-xs" : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"}`}
				>
					<CasIcon name="sparkle" className="h-4 w-4" />
					<span>Danh sách Mã giảm giá ({vouchers.length})</span>
				</button>
				<button
					type="button"
					onClick={() => setActiveTab("promotions")}
					className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition ${activeTab === "promotions" ? "bg-cas-secondary text-white font-black shadow-xs" : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"}`}
				>
					<CasIcon name="bell" className="h-4 w-4" />
					<span>Cấu hình Banner & Thông báo Khuyến mãi</span>
				</button>
			</div>

			{/* Tab 1: Quản lý Vouchers */}
			{activeTab === "vouchers" && (
				<div className="space-y-6">
					{/* Modal Form Tạo Voucher */}
					{showAddForm && (
						<div
							className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
							onMouseDown={(e) => {
								if (e.target === e.currentTarget) setShowAddForm(false);
							}}
						>
							<form onSubmit={handleAddVoucher} className="my-auto w-full max-w-2xl space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150">
								<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
									<h3 className="text-base font-black text-cas-on-surface flex items-center gap-2">
										<CasIcon className="size-5 text-cas-primary" name="sparkle" />
										Tạo Mã Khuyến Mãi Mới
									</h3>
									<button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary">
										Hủy
									</button>
								</div>

								<div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
									<div>
										<label className="block font-bold text-cas-on-surface-variant">Mã Voucher (Code):</label>
										<input
											type="text"
											placeholder="VD: KHUYENMAI20K..."
											value={code}
											onChange={(e) => setCode(e.target.value.toUpperCase())}
											className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-black text-cas-primary focus:outline-none focus:ring-2 focus:ring-cas-primary uppercase tracking-wider"
											required
										/>
									</div>

									<div>
										<label className="block font-bold text-cas-on-surface-variant">Loại giảm giá:</label>
										<select
											value={discountType}
											onChange={(e) => setDiscountType(e.target.value as "FIXED_AMOUNT" | "PERCENTAGE")}
											className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
										>
											<option value="FIXED_AMOUNT">Giảm số tiền cố định (VNĐ)</option>
											<option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
										</select>
									</div>

									<div>
										<label className="block font-bold text-cas-on-surface-variant">{discountType === "FIXED_AMOUNT" ? "Số tiền giảm (VNĐ):" : "Tỷ lệ giảm (%):"}</label>
										<input
											type="number"
											value={discountValue}
											onChange={(e) => setDiscountValue(Number(e.target.value))}
											className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
											min={1}
											required
										/>
									</div>

									<div>
										<label className="block font-bold text-cas-on-surface-variant">Đơn tối thiểu (VNĐ):</label>
										<input
											type="number"
											value={minOrderAmount}
											onChange={(e) => setMinOrderAmount(Number(e.target.value))}
											className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
											min={0}
										/>
									</div>

									<div>
										<label className="block font-bold text-cas-on-surface-variant">Số lượt dùng tối đa:</label>
										<input
											type="number"
											value={usageLimit}
											onChange={(e) => setUsageLimit(Number(e.target.value))}
											className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
											min={1}
										/>
									</div>

									<div>
										<label className="block font-bold text-cas-on-surface-variant">Mô tả chương trình:</label>
										<input
											type="text"
											placeholder="VD: Áp dụng cho đơn từ 100k..."
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
										/>
									</div>
								</div>

								<div className="flex justify-end gap-2 pt-2">
									<CasButton type="button" onClick={() => setShowAddForm(false)} variant="outline" size="sm">
										Hủy
									</CasButton>
									<CasButton type="submit" variant="primary" size="sm">
										Lưu & Phát hành
									</CasButton>
								</div>
							</form>
						</div>
					)}

					{/* Bộ lọc trạng thái */}
					<div className="flex items-center gap-2">
						<span className="text-xs font-extrabold uppercase text-cas-on-surface-variant">Lọc trạng thái:</span>
						{(["ALL", "ACTIVE", "INACTIVE"] as const).map((st) => (
							<button key={st} onClick={() => setStatusFilter(st)} className={`rounded-xl px-3 py-1 text-xs font-bold transition ${statusFilter === st ? "bg-cas-primary text-white font-black" : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"}`}>
								{st === "ALL" ? "Tất cả" : st === "ACTIVE" ? "Đang hoạt động" : "Ngừng áp dụng"}
							</button>
						))}
					</div>

					{/* Grid Cards Voucher */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{filteredVouchers.map((voucher) => {
							const isExpired = voucher.status === "INACTIVE" || voucher.usageCount >= voucher.usageLimit;

							return (
								<div key={voucher.id} className={`relative overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition hover:shadow-md ${isExpired ? "opacity-75" : ""}`}>
									<div className="flex items-start justify-between">
										<div>
											<span className="inline-block rounded-lg bg-cas-primary/10 px-2.5 py-1 text-xs font-black tracking-wider text-cas-primary uppercase">{voucher.code}</span>
											<p className="mt-2 text-xs font-medium text-cas-on-surface-variant">{voucher.description || "Ưu đãi áp dụng đơn gọi món"}</p>
										</div>
										<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-black ${voucher.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-gray-500/15 text-gray-500"}`}>
											{voucher.status === "ACTIVE" ? "ĐANG HẠN" : "TẮT/HẾT LƯỢT"}
										</span>
									</div>

									<div className="mt-4 space-y-1.5 border-t border-cas-outline-variant/20 pt-3 text-xs">
										<div className="flex justify-between font-bold">
											<span className="text-cas-on-surface-variant">Mức giảm:</span>
											<span className="font-black text-cas-on-surface">
												{voucher.discountType === "FIXED_AMOUNT" ? `${voucher.discountValue.toLocaleString("vi-VN")} đ` : `${voucher.discountValue}% ${voucher.maxDiscountAmount ? `(Tối đa ${voucher.maxDiscountAmount.toLocaleString("vi-VN")} đ)` : ""}`}
											</span>
										</div>

										<div className="flex justify-between">
											<span className="text-cas-on-surface-variant">Đơn tối thiểu:</span>
											<span className="font-extrabold text-cas-on-surface">{voucher.minOrderAmount.toLocaleString("vi-VN")} đ</span>
										</div>

										<div className="flex justify-between">
											<span className="text-cas-on-surface-variant">Số lượt đã dùng:</span>
											<span className="font-extrabold text-cas-primary">
												{voucher.usageCount} / {voucher.usageLimit}
											</span>
										</div>

										<div className="flex justify-between text-[0.7rem] text-cas-on-surface-variant">
											<span>Thời hạn:</span>
											<span>
												{voucher.startAt} đến {voucher.endAt}
											</span>
										</div>
									</div>

									<div className="mt-4 flex justify-end">
										<button type="button" onClick={() => toggleStatus(voucher.id)} className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${voucher.status === "ACTIVE" ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20" : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"}`}>
											{voucher.status === "ACTIVE" ? "Khóa voucher" : "Kích hoạt lại"}
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Tab 2: Cấu hình Khuyến mãi & Banner */}
			{activeTab === "promotions" && (
				<div className="space-y-6">
					{savedPromoSuccess && <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-black text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">✓ Đã lưu thay đổi cấu hình thông báo khuyến mãi thành công!</div>}

					<form onSubmit={handleSavePromoConfig} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						{/* Hộp 1: Popup Banner Chào Mừng */}
						<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-4">
							<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
								<h3 className="text-base font-black text-cas-on-surface flex items-center gap-2">
									<CasIcon className="size-5 text-cas-primary" name="sparkle" />
									Popup Banner Chào Mừng Khi Quét QR
								</h3>
								<label className="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" checked={promoConfig.enablePopupBanner} onChange={(e) => setPromoConfig({ ...promoConfig, enablePopupBanner: e.target.checked })} className="sr-only peer" />
									<div className="w-11 h-6 bg-cas-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cas-primary" />
								</label>
							</div>

							<div className="space-y-3 text-xs">
								<div>
									<label className="block font-bold text-cas-on-surface-variant">Tiêu đề Popup:</label>
									<input
										type="text"
										value={promoConfig.popupTitle}
										onChange={(e) => setPromoConfig({ ...promoConfig, popupTitle: e.target.value })}
										className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
										disabled={!promoConfig.enablePopupBanner}
									/>
								</div>

								<div>
									<label className="block font-bold text-cas-on-surface-variant">Nội dung khuyến mãi:</label>
									<textarea
										rows={3}
										value={promoConfig.popupContent}
										onChange={(e) => setPromoConfig({ ...promoConfig, popupContent: e.target.value })}
										className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-medium text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary resize-none"
										disabled={!promoConfig.enablePopupBanner}
									/>
								</div>

								<div>
									<label className="block font-bold text-cas-on-surface-variant">Mã Voucher đính kèm:</label>
									<input
										type="text"
										value={promoConfig.popupVoucherCode}
										onChange={(e) => setPromoConfig({ ...promoConfig, popupVoucherCode: e.target.value.toUpperCase() })}
										className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-black text-cas-primary uppercase focus:outline-none focus:ring-2 focus:ring-cas-primary"
										disabled={!promoConfig.enablePopupBanner}
									/>
								</div>
							</div>
						</div>

						{/* Hộp 2: Thanh Thông Báo Chạy Trên Header */}
						<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-4">
							<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
								<h3 className="text-base font-black text-cas-on-surface flex items-center gap-2">
									<CasIcon className="size-5 text-cas-secondary" name="bell" />
									Thanh Thông Báo Chạy Trên Header
								</h3>
								<label className="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" checked={promoConfig.enableHeaderTicker} onChange={(e) => setPromoConfig({ ...promoConfig, enableHeaderTicker: e.target.checked })} className="sr-only peer" />
									<div className="w-11 h-6 bg-cas-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cas-secondary" />
								</label>
							</div>

							<div className="space-y-3 text-xs">
								<div>
									<label className="block font-bold text-cas-on-surface-variant">Dòng tin thông báo nổi bật:</label>
									<textarea
										rows={3}
										value={promoConfig.tickerMessage}
										onChange={(e) => setPromoConfig({ ...promoConfig, tickerMessage: e.target.value })}
										className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-medium text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-secondary resize-none"
										disabled={!promoConfig.enableHeaderTicker}
									/>
								</div>
							</div>

							<div className="border-t border-cas-outline-variant/20 pt-4 space-y-3">
								<div className="flex items-center justify-between">
									<h4 className="text-xs font-black text-cas-on-surface">Tự động Gợi ý Voucher tại Giỏ hàng</h4>
									<label className="relative inline-flex items-center cursor-pointer">
										<input type="checkbox" checked={promoConfig.enableCartAutoSuggest} onChange={(e) => setPromoConfig({ ...promoConfig, enableCartAutoSuggest: e.target.checked })} className="sr-only peer" />
										<div className="w-9 h-5 bg-cas-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cas-primary" />
									</label>
								</div>

								<div className="text-xs">
									<label className="block font-bold text-cas-on-surface-variant">Ngưỡng giá trị giỏ hàng để gợi ý (VNĐ):</label>
									<input
										type="number"
										value={promoConfig.cartSuggestThreshold}
										onChange={(e) => setPromoConfig({ ...promoConfig, cartSuggestThreshold: Number(e.target.value) })}
										className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
										disabled={!promoConfig.enableCartAutoSuggest}
									/>
								</div>
							</div>
						</div>

						<div className="lg:col-span-2 flex justify-end">
							<CasButton type="submit" icon="check" variant="primary" size="md">
								Lưu cấu hình Khuyến mãi
							</CasButton>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}

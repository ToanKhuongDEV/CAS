"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

const TimePicker12H = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
	const [isOpen, setIsOpen] = useState(false);
	const parts = (value || "08:00").split(":");
	let h24 = parseInt(parts[0], 10);
	if (isNaN(h24)) h24 = 8;
	const mStr = parts[1] || "00";
	const period = h24 >= 12 ? "PM" : "AM";
	const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
	const formattedH = h12 < 10 ? `0${h12}` : `${h12}`;
	const displayTime = `${formattedH}:${mStr} ${period}`;

	const togglePeriod = () => {
		const newPeriod = period === "AM" ? "PM" : "AM";
		let finalH24 = h12 % 12;
		if (newPeriod === "PM") finalH24 += 12;
		const finalHStr = finalH24 < 10 ? `0${finalH24}` : `${finalH24}`;
		onChange(`${finalHStr}:${mStr}`);
	};

	const setHour = (newH12: number) => {
		let finalH24 = newH12 % 12;
		if (period === "PM") finalH24 += 12;
		const finalHStr = finalH24 < 10 ? `0${finalH24}` : `${finalH24}`;
		onChange(`${finalHStr}:${mStr}`);
	};

	const setMinute = (newM: string) => {
		const finalHStr = h24 < 10 ? `0${h24}` : `${h24}`;
		onChange(`${finalHStr}:${newM}`);
	};

	return (
		<div className="relative">
			{/* Khung hiển thị thời gian chính */}
			<div className="flex items-center gap-2.5 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface shadow-xs hover:border-cas-primary/50 focus-within:ring-2 focus-within:ring-cas-primary transition">
				<CasIcon name="clock" className="h-4 w-4 shrink-0 text-cas-primary" />
				<button type="button" onClick={() => setIsOpen(!isOpen)} className="flex-1 text-left font-black text-sm tracking-wide text-cas-on-surface focus:outline-none cursor-pointer">
					{displayTime}
				</button>
				<button type="button" onClick={togglePeriod} className="shrink-0 rounded-lg bg-cas-primary/10 hover:bg-cas-primary hover:text-white px-2.5 py-1 font-black text-xs text-cas-primary transition border border-cas-primary/20 cursor-pointer" title="Bấm để chuyển đổi nhanh AM / PM">
					{period}
				</button>
			</div>

			{/* Dropdown Popover Chọn Giờ / Phút Sang Trọng */}
			{isOpen && (
				<div className="absolute top-full left-0 mt-2 z-50 w-64 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-3.5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
					<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-2">
						<span className="text-xs font-black text-cas-primary flex items-center gap-1">
							<CasIcon name="clock" className="h-3.5 w-3.5" /> Chọn thời gian
						</span>
						<button type="button" onClick={() => setIsOpen(false)} className="text-cas-on-surface-variant hover:text-cas-primary font-bold text-xs cursor-pointer">
							✕
						</button>
					</div>

					<div className="grid grid-cols-2 gap-2 text-xs">
						{/* Cột chọn Giờ */}
						<div>
							<span className="block text-[0.65rem] font-bold text-cas-on-surface-variant mb-1">Giờ</span>
							<div className="max-h-36 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
								{Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
									const isSelected = n === h12;
									return (
										<button key={n} type="button" onClick={() => setHour(n)} className={`w-full text-center py-1 rounded-lg font-extrabold transition text-xs cursor-pointer ${isSelected ? "bg-cas-primary text-white shadow-xs" : "hover:bg-cas-surface-variant/60 text-cas-on-surface"}`}>
											{n < 10 ? `0${n}` : n}
										</button>
									);
								})}
							</div>
						</div>

						{/* Cột chọn Phút */}
						<div>
							<span className="block text-[0.65rem] font-bold text-cas-on-surface-variant mb-1">Phút</span>
							<div className="max-h-36 overflow-y-auto space-y-0.5 pr-1 custom-scrollbar">
								{["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((min) => {
									const isSelected = min === mStr;
									return (
										<button key={min} type="button" onClick={() => setMinute(min)} className={`w-full text-center py-1 rounded-lg font-extrabold transition text-xs cursor-pointer ${isSelected ? "bg-cas-primary text-white shadow-xs" : "hover:bg-cas-surface-variant/60 text-cas-on-surface"}`}>
											{min}
										</button>
									);
								})}
							</div>
						</div>
					</div>

					{/* Thao tác Chuyển AM/PM & Xong */}
					<div className="pt-2 border-t border-cas-outline-variant/15 flex items-center justify-between">
						<button type="button" onClick={togglePeriod} className="text-xs font-black text-cas-primary hover:underline flex items-center gap-1 cursor-pointer">
							Chuyển sang {period === "AM" ? "PM" : "AM"}
						</button>
						<button type="button" onClick={() => setIsOpen(false)} className="rounded-lg bg-cas-primary px-3 py-1 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer">
							Xác nhận
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default function AdminSettingsPage() {
	// State cho Thông tin Cửa hàng
	const [storeName, setStoreName] = useState<string>("Tiệm Ăn Vặt & Mỳ Cay CAS");
	const [phone, setPhone] = useState<string>("0901 234 567");
	const [email, setEmail] = useState<string>("contact@cas-restaurant.vn");
	const [address, setAddress] = useState<string>("123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh");
	const [googleMapUrl, setGoogleMapUrl] = useState<string>("https://maps.google.com/?q=10.7554,106.6781");
	const [showMapHelp, setShowMapHelp] = useState<boolean>(false);
	const [openTime, setOpenTime] = useState<string>("08:00");
	const [closeTime, setCloseTime] = useState<string>("22:30");
	const [slogan, setSlogan] = useState<string>("Thưởng thức Mỳ Cay & Đồ Uống Chuẩn Vị, Gọi Món QR Siêu Tốc!");
	const [storeStatus, setStoreStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
	const [savedStoreMsg, setSavedStoreMsg] = useState<string>("");

	// State cho Tham số Vận hành & Cảnh báo
	const [warningMins, setWarningMins] = useState<number>(25);
	const [savedOpsMsg, setSavedOpsMsg] = useState<string>("");

	const handleSaveStoreInfo = (e: React.FormEvent) => {
		e.preventDefault();
		setSavedStoreMsg("Đã cập nhật thông tin cửa hàng thành công!");
		setTimeout(() => setSavedStoreMsg(""), 3500);
	};

	const handleSaveOpsSettings = (e: React.FormEvent) => {
		e.preventDefault();
		setSavedOpsMsg("Đã lưu tham số vận hành thành công!");
		setTimeout(() => setSavedOpsMsg(""), 3500);
	};

	return (
		<div className="space-y-8 pb-12">
			{/* Page Header */}
			<div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black text-cas-on-surface">Cấu hình Cửa hàng & Tham số Vận hành</h1>
					<p className="text-xs text-cas-on-surface-variant">Quản lý thông tin cửa hàng và tham số vận hành</p>
				</div>
				<div className="mt-2 sm:mt-0 flex items-center gap-2">
					<span
						className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ${storeStatus === "ACTIVE" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"}`}
					>
						<span className={`h-2 w-2 rounded-full ${storeStatus === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
						{storeStatus === "ACTIVE" ? "Quán đang Hoạt động" : "Quán Tạm đóng cửa"}
					</span>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Column 1 & 2: Form Cấu hình Thông tin Cửa hàng */}
				<div className="lg:col-span-2 space-y-8">
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 sm:p-8 shadow-xs">
						<div className="flex items-center gap-3 border-b border-cas-outline-variant/15 pb-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cas-primary/10 text-cas-primary">
								<CasIcon name="restaurant" className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-lg font-black text-cas-on-surface">Thông tin Cửa hàng</h2>
							</div>
						</div>

						<form onSubmit={handleSaveStoreInfo} className="mt-6 space-y-5 text-xs">
							{/* Tên Cửa hàng */}
							<div>
								<label className="block font-extrabold text-cas-on-surface mb-1">
									Tên Cửa hàng <span className="text-rose-500">*</span>
								</label>
								<input
									type="text"
									required
									value={storeName}
									onChange={(e) => setStoreName(e.target.value)}
									placeholder="Nhập tên quán..."
									className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
								/>
							</div>

							{/* Số Điện thoại & Email liên hệ */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label className="block font-extrabold text-cas-on-surface mb-1">
										Số điện thoại Hotline <span className="text-rose-500">*</span>
									</label>
									<input
										type="tel"
										required
										value={phone}
										onChange={(e) => setPhone(e.target.value)}
										placeholder="VD: 0901 234 567"
										className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
									/>
								</div>
								<div>
									<label className="block font-extrabold text-cas-on-surface mb-1">
										Email liên hệ <span className="text-rose-500">*</span>
									</label>
									<input
										type="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="VD: lienhe@cuahang.com"
										className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
									/>
								</div>
							</div>

							{/* Địa chỉ Cửa hàng */}
							<div>
								<label className="block font-extrabold text-cas-on-surface mb-1">
									Địa chỉ Cửa hàng <span className="text-rose-500">*</span>
								</label>
								<input
									type="text"
									required
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder="Nhập địa chỉ đầy đủ của quán..."
									className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
								/>
							</div>

							{/* Gắn tọa độ / Vị trí quán Google Maps */}
							<div>
								<div className="flex items-center gap-1.5 mb-1">
									<label className="block font-extrabold text-cas-on-surface">Gắn tọa độ vị trí quán bằng Google Maps</label>

									{/* Floating Tooltip Container (Hỗ trợ vừa Hover vừa Click, Không che/tối màn hình) */}
									<div className="relative inline-block" onMouseEnter={() => setShowMapHelp(true)} onMouseLeave={() => setShowMapHelp(false)}>
										<button
											type="button"
											onClick={() => setShowMapHelp(!showMapHelp)}
											className="inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-cas-primary/15 text-cas-primary font-black text-[0.7rem] hover:bg-cas-primary hover:text-white transition focus:outline-none cursor-pointer"
											title="Xem hướng dẫn lấy link/tọa độ"
											aria-label="Xem hướng dẫn lấy link hoặc tọa độ Google Maps"
										>
											?
										</button>

										{/* Floating Popover Tooltip */}
										{showMapHelp && (
											<div className="absolute top-full left-0 mt-2 z-40 w-72 sm:w-80 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-4 shadow-2xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150 text-xs">
												<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-2">
													<h4 className="font-black text-cas-primary flex items-center gap-1.5 text-xs">
														<CasIcon name="info" className="h-4 w-4" />
														Hướng dẫn lấy vị trí Google Maps
													</h4>
													<button type="button" onClick={() => setShowMapHelp(false)} className="text-cas-on-surface-variant hover:text-cas-primary font-bold text-xs">
														✕
													</button>
												</div>

												<div className="text-cas-on-surface-variant text-[0.75rem]">
													<ol className="list-decimal list-inside space-y-1 text-cas-on-surface-variant leading-relaxed">
														<li>Vào Google Maps tìm vị trí quán.</li>
														<li>Copy (sao chép) đường dẫn trên thanh địa chỉ URL bên trên.</li>
														<li>Dán đường dẫn vào ô này.</li>
													</ol>
												</div>
											</div>
										)}
									</div>
								</div>

								<div className="flex items-center gap-2">
									<input
										type="text"
										value={googleMapUrl}
										onChange={(e) => setGoogleMapUrl(e.target.value)}
										placeholder="Dán link Google Maps hoặc nhập tọa độ Lat, Long (VD: 10.7554, 106.6781)"
										className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
									/>
									<a
										href={googleMapUrl ? (googleMapUrl.startsWith("http") ? googleMapUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapUrl)}`) : "https://maps.google.com"}
										target="_blank"
										rel="noopener noreferrer"
										className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-cas-outline-variant/40 bg-cas-surface-variant/30 px-3.5 py-2.5 font-bold text-cas-primary hover:bg-cas-primary/10 transition"
									>
										<CasIcon name="sparkle" className="h-4 w-4" />
										<span>{googleMapUrl ? "Xem vị trí" : "Mở Google Maps"}</span>
									</a>
								</div>
							</div>

							{/* Giờ mở cửa / đóng cửa */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
								<div>
									<label className="block font-extrabold text-cas-on-surface mb-1">Giờ mở cửa</label>
									<TimePicker12H value={openTime} onChange={setOpenTime} />
								</div>
								<div>
									<label className="block font-extrabold text-cas-on-surface mb-1">Giờ đóng cửa</label>
									<TimePicker12H value={closeTime} onChange={setCloseTime} />
								</div>
							</div>

							{/* Slogan / Thông điệp chào mừng */}
							<div>
								<label className="block font-extrabold text-cas-on-surface mb-1">Thông điệp / Slogan Chào mừng</label>
								<input
									type="text"
									value={slogan}
									onChange={(e) => setSlogan(e.target.value)}
									placeholder="VD: Phục vụ món ngon hot dẻo, gọi món QR siêu tốc..."
									className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
								/>
							</div>

							{/* Trạng thái hoạt động */}
							<div>
								<label className="block font-extrabold text-cas-on-surface mb-1">Trạng thái Hoạt động Cửa hàng</label>
								<div className="flex items-center gap-4 mt-2">
									<label className="flex items-center gap-2 cursor-pointer font-bold text-cas-on-surface">
										<input type="radio" name="storeStatus" value="ACTIVE" checked={storeStatus === "ACTIVE"} onChange={() => setStoreStatus("ACTIVE")} className="h-4 w-4 text-cas-primary accent-cas-primary focus:ring-cas-primary" />
										<span>Mở cửa (ACTIVE)</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer font-bold text-cas-on-surface">
										<input type="radio" name="storeStatus" value="INACTIVE" checked={storeStatus === "INACTIVE"} onChange={() => setStoreStatus("INACTIVE")} className="h-4 w-4 text-cas-primary accent-cas-primary focus:ring-cas-primary" />
										<span>Tạm ngưng (INACTIVE)</span>
									</label>
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center gap-3 pt-3">
								<CasButton type="submit" icon="check" variant="primary" size="sm">
									Lưu Thông tin Cửa hàng
								</CasButton>
								{savedStoreMsg && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">{savedStoreMsg}</span>}
							</div>
						</form>
					</div>

					{/* Form Cấu hình Ngưỡng cảnh báo Vận hành */}
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 sm:p-8 shadow-xs">
						<div className="flex items-center gap-3 border-b border-cas-outline-variant/15 pb-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
								<CasIcon name="clock" className="h-5 w-5" />
							</div>
							<div>
								<h2 className="text-lg font-black text-cas-on-surface">Tham số Vận hành & Cảnh báo</h2>
								<p className="text-xs text-cas-on-surface-variant">Thiết lập quy tắc thời gian phục vụ món và ngưỡng cảnh báo quá tải cho nhân viên.</p>
							</div>
						</div>

						<form onSubmit={handleSaveOpsSettings} className="mt-6 space-y-5 text-xs">
							<div>
								<label className="block font-extrabold text-cas-on-surface">Ngưỡng thời gian Cảnh báo bàn chờ lâu (Phút):</label>
								<p className="mt-1 text-cas-on-surface-variant">Nếu một bàn có order còn món chưa làm xong quá thời gian này, hệ thống sẽ bật cảnh báo màu đỏ trên Dashboard Operator.</p>
								<div className="mt-3 flex items-center gap-3">
									<input
										type="number"
										min={5}
										max={120}
										value={warningMins}
										onChange={(e) => setWarningMins(Number(e.target.value))}
										className="w-32 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3.5 py-2.5 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
									/>
									<span className="font-extrabold text-cas-on-surface">Phút (Mặc định chuẩn: 25 phút)</span>
								</div>
							</div>

							<div className="flex items-center gap-3 pt-2">
								<CasButton type="submit" icon="check" variant="primary" size="sm">
									Lưu Tham số Vận hành
								</CasButton>
								{savedOpsMsg && <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">{savedOpsMsg}</span>}
							</div>
						</form>
					</div>
				</div>

				{/* Column 3: Live Preview & Summary Widget */}
				<div className="space-y-6">
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs sticky top-6">
						<h3 className="text-sm font-black text-cas-on-surface border-b border-cas-outline-variant/15 pb-3 flex items-center gap-2">
							<CasIcon name="info" className="h-4 w-4 text-cas-primary" />
							<span>Xem trước Thông tin Cửa hàng</span>
						</h3>

						{/* Mock Preview Card */}
						<div className="mt-4 rounded-2xl border border-cas-outline-variant/20 bg-cas-surface p-4 space-y-3">
							<div className="flex items-center justify-between">
								<span className="rounded-md bg-cas-primary/10 px-2 py-0.5 text-[0.65rem] font-black text-cas-primary">CAS Store</span>
							</div>

							<div>
								<h4 className="text-base font-black text-cas-on-surface">{storeName || "Tên Cửa hàng"}</h4>
								<p className="text-[0.7rem] text-cas-on-surface-variant mt-0.5">{slogan || "Thông điệp chào mừng khách..."}</p>
							</div>

							<div className="space-y-1.5 pt-2 border-t border-cas-outline-variant/15 text-[0.75rem]">
								<div className="flex items-start gap-2 text-cas-on-surface">
									<CasIcon name="phone" className="h-3.5 w-3.5 shrink-0 text-cas-primary mt-0.5" />
									<span className="font-extrabold">{phone || "Chưa nhập SĐT"}</span>
								</div>
								<div className="flex items-start gap-2 text-cas-on-surface">
									<CasIcon name="user" className="h-3.5 w-3.5 shrink-0 text-cas-primary mt-0.5" />
									<span className="font-extrabold">{email || "Chưa nhập Email"}</span>
								</div>
								<div className="flex items-start gap-2 text-cas-on-surface">
									<CasIcon name="table" className="h-3.5 w-3.5 shrink-0 text-cas-primary mt-0.5" />
									<span className="text-cas-on-surface-variant">{address || "Chưa nhập địa chỉ"}</span>
								</div>
								{googleMapUrl && (
									<div className="flex items-start gap-2 text-cas-on-surface">
										<CasIcon name="sparkle" className="h-3.5 w-3.5 shrink-0 text-cas-primary mt-0.5" />
										<a href={googleMapUrl.startsWith("http") ? googleMapUrl : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleMapUrl)}`} target="_blank" rel="noopener noreferrer" className="text-cas-primary underline font-bold hover:opacity-80">
											Xem vị trí trên Google Maps
										</a>
									</div>
								)}
								<div className="flex items-center gap-2 text-cas-on-surface">
									<CasIcon name="clock" className="h-3.5 w-3.5 shrink-0 text-cas-primary" />
									<span className="font-extrabold">
										{openTime} - {closeTime}
									</span>
								</div>
							</div>

							<div className="pt-2">
								<div className="rounded-xl bg-cas-surface-variant/40 p-2.5 text-[0.7rem] text-cas-on-surface-variant space-y-1">
									<div className="flex justify-between font-bold">
										<span>Ngưỡng chờ lâu:</span>
										<span className="text-amber-600 dark:text-amber-400 font-extrabold">{warningMins} Phút</span>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-4 rounded-2xl bg-cas-primary/5 p-3.5 border border-cas-primary/10">
							<p className="text-[0.7rem] text-cas-on-surface-variant leading-relaxed">
								<strong>Lưu ý:</strong> Mọi chỉnh sửa về tên quán, hotline, địa chỉ, email và vị trí Google Maps sẽ tự động đồng bộ trên hệ thống.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

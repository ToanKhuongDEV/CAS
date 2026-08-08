"use client";

import Link from "next/link";
import { CasButton } from "../../components/ui/cas-button";
import { CasIcon } from "../../components/ui/cas-icon";

export default function AdminDashboardPage() {
	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-black text-cas-on-surface">Tổng quan</h1>
				</div>
			</div>

			{/* 3 Thẻ Chỉ số KPI cốt lõi */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{/* Doanh thu */}
				<div className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition hover:shadow-md">
					<div className="flex items-center justify-between">
						<span className="text-xs font-extrabold uppercase text-cas-on-surface-variant">Doanh thu Hôm nay</span>
						<span className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
							<CasIcon className="size-5" name="payment" />
						</span>
					</div>
					<p className="mt-3 text-2xl font-black text-cas-on-surface">42.850.000 đ</p>
					<div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
						<span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5">+12.5%</span>
						<span className="text-cas-on-surface-variant">so với cùng giờ hôm qua</span>
					</div>
				</div>

				{/* Tổng số đơn */}
				<div className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition hover:shadow-md">
					<div className="flex items-center justify-between">
						<span className="text-xs font-extrabold uppercase text-cas-on-surface-variant">Tổng số đơn hàng</span>
						<span className="grid size-9 place-items-center rounded-xl bg-cas-secondary/15 text-cas-secondary">
							<CasIcon className="size-5" name="bill" />
						</span>
					</div>
					<p className="mt-3 text-2xl font-black text-cas-on-surface">186 đơn</p>
					<div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-cas-on-surface-variant">
						<span>Tỷ lệ hoàn tất 96.8% (180 đơn đã PAID)</span>
					</div>
				</div>

				{/* Món hỏng / Làm lại (is_remade) */}
				<div className="rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition hover:shadow-md">
					<div className="flex items-center justify-between">
						<span className="text-xs font-extrabold uppercase text-cas-on-surface-variant">Món hỏng / Bù tiền (is_remade)</span>
						<span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
							<CasIcon className="size-5" name="fire" />
						</span>
					</div>
					<p className="mt-3 text-2xl font-black text-cas-primary">
						4 món <span className="text-sm font-bold text-cas-on-surface-variant">(850.000 đ)</span>
					</p>
					<div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
						<span className="rounded-md bg-amber-500/10 px-1.5 py-0.5">Cần theo dõi</span>
						<span className="text-cas-on-surface-variant">Bóc tách hao hụt chính xác</span>
					</div>
				</div>
			</div>

			{/* Nội dung chính 2 cột */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
				{/* Cột trái (8 columns): Biểu đồ Doanh thu & Báo cáo Sự cố ca trực */}
				<div className="space-y-8 lg:col-span-8">
					{/* Biểu đồ doanh thu theo giờ */}
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs">
						<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-4">
							<div>
								<h2 className="text-lg font-black text-cas-on-surface">Biểu đồ Doanh thu & Khung giờ cao điểm</h2>
								<p className="text-xs font-medium text-cas-on-surface-variant">Thống kê doanh thu từng khung giờ trong ngày (đơn vị: triệu VNĐ)</p>
							</div>
							<span className="rounded-xl bg-cas-primary/10 px-3 py-1 text-xs font-extrabold text-cas-primary">Hôm nay</span>
						</div>

						{/* Trực quan hóa Biểu đồ Cột */}
						<div className="mt-6 space-y-4">
							<div className="flex h-48 items-end justify-between gap-2 border-b border-cas-outline-variant/30 pb-2 pt-4">
								{[
									{ hour: "10h", val: 2.1, max: 8 },
									{ hour: "11h", val: 4.8, max: 8 },
									{ hour: "12h", val: 7.2, max: 8 },
									{ hour: "13h", val: 5.5, max: 8 },
									{ hour: "14h", val: 2.8, max: 8 },
									{ hour: "15h", val: 1.9, max: 8 },
									{ hour: "16h", val: 3.4, max: 8 },
									{ hour: "17h", val: 6.8, max: 8 },
									{ hour: "18h", val: 8.0, max: 8 },
									{ hour: "19h", val: 7.6, max: 8 },
									{ hour: "20h", val: 4.2, max: 8 },
								].map((item, idx) => {
									const heightPercent = Math.round((item.val / item.max) * 100);
									const isPeak = item.val >= 7.0;

									return (
										<div key={idx} className="group relative flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
											<div className="pointer-events-none absolute -top-8 z-10 hidden rounded-md bg-cas-on-surface px-2 py-1 text-[0.68rem] font-bold text-cas-surface shadow-md group-hover:block whitespace-nowrap">{item.val} triệu đ</div>
											<div style={{ height: `${heightPercent}%` }} className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${isPeak ? "bg-gradient-to-t from-cas-primary to-rose-400 shadow-sm" : "bg-cas-secondary/40 group-hover:bg-cas-secondary"}`} />
											<span className="text-[0.7rem] font-bold text-cas-on-surface-variant">{item.hour}</span>
										</div>
									);
								})}
							</div>
							<div className="flex items-center justify-between text-xs font-bold text-cas-on-surface-variant">
								<span className="flex items-center gap-2">
									<span className="size-3 rounded-sm bg-cas-primary" /> Khung giờ cao điểm (12h, 18h-19h)
								</span>
								<span className="flex items-center gap-2">
									<span className="size-3 rounded-sm bg-cas-secondary/40" /> Khung giờ bình thường
								</span>
							</div>
						</div>
					</div>

					{/* Báo cáo Sự cố ca trực mới nhất */}
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs">
						<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-4">
							<div className="flex items-center gap-2.5">
								<span className="grid size-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
									<CasIcon className="size-5" name="info" />
								</span>
								<div>
									<h2 className="text-lg font-black text-cas-on-surface">Báo cáo Sự cố ca trực mới nhất</h2>
									<p className="text-xs font-medium text-cas-on-surface-variant">Sự cố phát sinh do nhân viên OPERATOR ghi nhận trong ca</p>
								</div>
							</div>
							<Link href="/admin/incidents" className="text-xs font-extrabold text-cas-primary hover:underline">
								Xem tất cả ➔
							</Link>
						</div>

						<div className="mt-4 space-y-3">
							{[
								{
									id: 1,
									author: "Nhân viên Nguyễn Văn A",
									time: "17:35 hôm nay",
									table: "Bàn 08",
									title: "Khách chê Mỳ cay quá mặn, đã làm lại",
									content: "Đã cho bếp nấu lại tô mới có cờ is_remade = TRUE, khách hài lòng.",
									status: "Chưa duyệt",
								},
								{
									id: 2,
									author: "Nhân viên Trần Thị B",
									time: "15:20 hôm nay",
									table: "Bàn 03",
									title: "Vỡ 1 ly nước ngọt khi bưng đồ",
									content: "Ghi nhận hao hụt ly thủy tinh và bù 1 lon Coca mới cho khách.",
									status: "Đã tiếp nhận",
								},
							].map((incident) => (
								<div key={incident.id} className="rounded-2xl border border-cas-outline-variant/20 bg-cas-surface-container/50 p-4 transition hover:bg-cas-surface-container">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="rounded-lg bg-cas-primary/10 px-2 py-0.5 text-xs font-black text-cas-primary">{incident.table}</span>
											<span className="text-xs font-extrabold text-cas-on-surface">{incident.author}</span>
											<span className="text-[0.7rem] text-cas-on-surface-variant">• {incident.time}</span>
										</div>
										<span className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-black ${incident.status === "Chưa duyệt" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"}`}>{incident.status}</span>
									</div>
									<h4 className="mt-2 text-sm font-black text-cas-on-surface">{incident.title}</h4>
									<p className="mt-1 text-xs text-cas-on-surface-variant">{incident.content}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Cột phải (4 columns): Các Khối Lối tắt Quản lý Chuyên biệt */}
				<div className="space-y-6 lg:col-span-4">
					{/* Quản lý Quán (Menu & Bàn) */}
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-3">
						<div className="flex items-center gap-2.5 border-b border-cas-outline-variant/15 pb-3">
							<span className="grid size-8 place-items-center rounded-lg bg-cas-primary/15 text-cas-primary">
								<CasIcon className="size-4.5" name="menu" />
							</span>
							<h3 className="text-base font-black text-cas-on-surface">Quản lý Quán</h3>
						</div>
						<p className="text-xs text-cas-on-surface-variant">Truy cập nhanh danh mục thực đơn, món hết hàng và sơ đồ mã QR bàn ăn.</p>
						<div className="space-y-2 pt-1">
							<CasButton href="/admin/catalog" icon="menu" variant="outline-primary" size="sm" className="w-full justify-start">
								Thực đơn & Options
							</CasButton>
							<CasButton href="/admin/tables" icon="table" variant="outline" size="sm" className="w-full justify-start">
								Sơ đồ Bàn ăn & Mã QR
							</CasButton>
						</div>
					</div>

					{/* Vận hành & Nhân sự */}
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-3">
						<div className="flex items-center gap-2.5 border-b border-cas-outline-variant/15 pb-3">
							<span className="grid size-8 place-items-center rounded-lg bg-cas-secondary/15 text-cas-secondary">
								<CasIcon className="size-4.5" name="users" />
							</span>
							<h3 className="text-base font-black text-cas-on-surface">Vận hành & Nhân sự</h3>
						</div>
						<p className="text-xs text-cas-on-surface-variant">Tạo tài khoản nhân viên OPERATOR, mở/khóa quyền và duyệt sự cố ca trực.</p>
						<div className="space-y-2 pt-1">
							<CasButton href="/admin/operators" icon="users" variant="outline" size="sm" className="w-full justify-start">
								Tài khoản Nhân viên
							</CasButton>
							<CasButton href="/admin/incidents" icon="info" variant="outline" size="sm" className="w-full justify-start">
								Báo cáo Sự cố ca trực (2)
							</CasButton>
						</div>
					</div>

					{/* Hệ thống & Cấu hình */}
					<div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-3">
						<div className="flex items-center gap-2.5 border-b border-cas-outline-variant/15 pb-3">
							<span className="grid size-8 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
								<CasIcon className="size-4.5" name="settings" />
							</span>
							<h3 className="text-base font-black text-cas-on-surface">Hệ thống & Cấu hình</h3>
						</div>
						<p className="text-xs text-cas-on-surface-variant">Điều chỉnh ngưỡng cảnh báo chờ món 25 phút và tra cứu nhật ký Audit Logs.</p>
						<div className="pt-1">
							<CasButton href="/admin/settings" icon="settings" variant="outline" size="sm" className="w-full justify-start">
								Cấu hình Tham số & Audit Logs
							</CasButton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

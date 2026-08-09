"use client";

import { useEffect, useRef, useState } from "react";
import { CasIcon } from "../ui/cas-icon";

export type OperatorNotification = {
	desc: string;
	id: number;
	isRead: boolean;
	time: string;
	title: string;
	type: "URGENT" | "WARNING" | "INFO";
};

const mockOperatorNotifications: OperatorNotification[] = [
	{
		id: 1,
		title: "Thông báo bảo trì hệ thống",
		desc: "Hệ thống CAS Backend sẽ bảo trì nhẹ từ 02:00 - 02:15 đêm nay.",
		time: "30 phút trước",
		type: "WARNING",
		isRead: false,
	},
	{
		id: 2,
		title: "Ưu đãi mới phát hành",
		desc: "Mã SUMMER50K vừa được ADMIN kích hoạt cho khách gọi món.",
		time: "1 giờ trước",
		type: "INFO",
		isRead: false,
	},
	{
		id: 3,
		title: "Sự cố Bàn 09 đã được tiếp nhận",
		desc: "Admin đã xem và ghi nhận báo cáo sự cố thiết bị của ca sáng.",
		time: "3 giờ trước",
		type: "URGENT",
		isRead: true,
	},
];

export function OperatorHeaderNotifications() {
	const [showNotif, setShowNotif] = useState(false);
	const [notifications, setNotifications] = useState<OperatorNotification[]>(mockOperatorNotifications);
	const notifRef = useRef<HTMLDivElement>(null);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const markAllRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
	};

	const toggleRead = (id: number) => {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));
	};

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
				setShowNotif(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative z-30" ref={notifRef}>
			<button
				type="button"
				onClick={() => setShowNotif(!showNotif)}
				className="relative grid size-10 place-items-center rounded-xl border border-cas-outline-variant/20 bg-cas-glass text-cas-on-surface transition hover:bg-cas-surface-container focus-visible:outline-none"
				aria-label="Thông báo vận hành"
			>
				<CasIcon className="size-5" name="bell" />
				{unreadCount > 0 && <span className="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-cas-primary text-[0.65rem] font-black text-white animate-pulse">{unreadCount}</span>}
			</button>

			{showNotif && (
				<div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in duration-150 z-100">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-2.5">
						<h4 className="flex items-center gap-1.5 text-xs font-black uppercase text-cas-on-surface">
							<CasIcon className="size-4 text-cas-primary" name="bill" />
							Thông báo Vận hành
						</h4>

						{unreadCount > 0 ? (
							<button onClick={markAllRead} className="text-[0.68rem] font-bold text-cas-primary hover:underline" type="button">
								Đọc tất cả
							</button>
						) : (
							<span className="text-[0.65rem] font-medium text-cas-on-surface-variant/70">Đã đọc hết</span>
						)}
					</div>

					{/* Notification List */}
					<div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-0.5">
						{notifications.length > 0 ? (
							notifications.map((n) => (
								<div
									key={n.id}
									onClick={() => toggleRead(n.id)}
									className={`group cursor-pointer rounded-2xl border p-3 text-xs transition ${n.isRead ? "border-cas-outline-variant/15 bg-cas-glass/60 opacity-70 hover:opacity-100" : "border-cas-primary/30 bg-cas-primary/10 shadow-xs"}`}
									role="button"
									tabIndex={0}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											toggleRead(n.id);
										}
									}}
								>
									<div className="flex items-start justify-between gap-2">
										<div className="flex items-center gap-1.5">
											{!n.isRead && <span className="size-2 shrink-0 rounded-full bg-cas-primary animate-pulse" title="Chưa đọc" />}
											<span className={`font-extrabold ${n.isRead ? "text-cas-on-surface-variant" : "text-cas-on-surface"}`}>{n.title}</span>
										</div>

										<span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[0.6rem] font-black uppercase ${n.type === "URGENT" ? "bg-rose-500/20 text-rose-600" : n.type === "WARNING" ? "bg-amber-500/20 text-amber-600" : "bg-sky-500/20 text-sky-600"}`}>{n.type}</span>
									</div>

									<p className="mt-1 text-[0.7rem] leading-relaxed text-cas-on-surface-variant">{n.desc}</p>

									<div className="mt-2 flex items-center justify-between text-[0.65rem]">
										<span className="font-medium text-cas-on-surface-variant/80">{n.time}</span>
										<span className="text-[0.65rem] font-bold text-cas-primary opacity-0 transition group-hover:opacity-100">{n.isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc"}</span>
									</div>
								</div>
							))
						) : (
							<p className="py-6 text-center text-xs text-cas-on-surface-variant">Không có thông báo nào.</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

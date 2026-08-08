import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CustomerBottomNavigation } from "../../../components/customer/customer-bottom-navigation";
import { CustomerHeader } from "../../../components/customer/customer-header";
import { CancellationRequestControl } from "../../../components/customer/cancellation-request-control";
import { CasIcon } from "../../../components/ui/cas-icon";
import { CasButton } from "../../../components/ui/cas-button";

export const metadata: Metadata = {
	title: "Đơn hàng | CAS",
	description: "Xem lại món vừa gửi tại CAS.",
};

const submittedItems = [
	{
		name: "Mỳ cay đặc biệt 7 cấp độ",
		options: "Cấp độ 2",
		imageSrc: "/images/welcome/spicy-noodles.jpg",
		imageAlt: "Tô mỳ cay đặc biệt vừa gửi",
		basePrice: "45.000đ",
		toppings: [{ name: "Thêm xúc xích", price: "10.000đ" }],
		total: "55.000đ",
		quantity: 1,
	},
	{
		name: "Gà rán giòn rụm",
		options: "Sốt cay, phần vừa",
		imageSrc: "/images/welcome/fried-chicken.jpg",
		imageAlt: "Phần gà rán giòn vừa gửi",
		basePrice: "35.000đ × 2",
		toppings: [],
		total: "70.000đ",
		quantity: 2,
	},
	{
		name: "Trà sữa Trân châu Đường đen",
		options: "50% đường, ít đá",
		imageSrc: "/images/welcome/milk-tea.jpg",
		imageAlt: "Ly trà sữa trân châu đường đen vừa gửi",
		basePrice: "35.000đ",
		toppings: [{ name: "Thêm trân châu", price: "10.000đ" }],
		total: "45.000đ",
		quantity: 1,
	},
];

export default function OrdersPage() {
	return (
		<div className="min-h-screen bg-cas-surface text-cas-on-surface transition-colors duration-200">
			<CustomerHeader tableName="Bàn 05" />

			<div className="mx-auto flex w-full max-w-[85rem] items-start gap-8 px-4 pt-20 pb-28 md:gap-12 md:px-8 md:pt-24 md:pb-16 lg:gap-14">
				<CustomerBottomNavigation activeItem="orders" />

				<main className="min-w-0 flex-1">
					<section className="text-center" aria-labelledby="order-success-title">
						<div className="relative mx-auto grid size-24 place-items-center rounded-full border-4 border-cas-primary bg-cas-primary/8 text-cas-primary shadow-[0_12px_30px_var(--cas-shadow-color)]">
							<span className="absolute inset-2 rounded-full border border-cas-primary/25" />
							<CasIcon className="relative size-12" name="check" />
						</div>

						<p className="mt-7 text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">Gửi món thành công</p>
						<h1 className="mx-auto mt-2 max-w-lg text-2xl leading-tight font-extrabold tracking-tight md:text-3xl" id="order-success-title">
							Quán đã nhận món của bạn
						</h1>
						<p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cas-on-surface-variant">
							Đơn hàng <strong className="text-cas-on-surface">#CAS-123</strong> đã được gửi thành công. Bạn có thể tiếp tục gọi thêm món trong bữa ăn.
						</p>
					</section>

					<section className="mt-8 grid grid-cols-2 gap-4 md:gap-6" aria-label="Thông tin đơn hàng">
						<article className="flex min-h-36 flex-col justify-between rounded-2xl bg-cas-surface-container p-4 shadow-[0_5px_18px_var(--cas-shadow-color)] md:rounded-3xl md:p-6">
							<CasIcon className="size-7 text-cas-secondary md:size-8" name="table" />
							<div>
								<p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase md:text-xs">Vị trí</p>
								<p className="mt-1 text-xl font-extrabold md:text-3xl">Bàn 05</p>
							</div>
						</article>

						<article className="flex min-h-36 flex-col justify-between rounded-2xl bg-cas-surface-container p-4 shadow-[0_5px_18px_var(--cas-shadow-color)] md:rounded-3xl md:p-6">
							<CasIcon className="size-7 text-cas-tertiary md:size-8" name="clock" />
							<div>
								<p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase md:text-xs">Thời gian gửi</p>
								<p className="mt-1 text-xl font-extrabold md:text-3xl">19:42</p>
							</div>
						</article>
					</section>

					<article className="mt-6 rounded-2xl bg-cas-surface-container p-5 shadow-[0_5px_18px_var(--cas-shadow-color)] md:rounded-3xl md:p-7">
						<div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/40 pb-4">
							<h2 className="text-base font-extrabold md:text-lg">Chi tiết món đã gọi</h2>
							<span className="rounded-full bg-cas-secondary-container/20 px-3.5 py-1 text-xs font-extrabold text-cas-secondary md:text-sm">4 món</span>
						</div>

						<ul className="divide-y divide-cas-outline-variant/35">
							{submittedItems.map((item, index) => (
								<li className="flex items-start gap-4 py-4 md:py-5" key={item.name}>
									<div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cas-surface md:size-20 md:rounded-2xl">
										<Image className="object-cover" src={item.imageSrc} alt={item.imageAlt} fill loading={index === 0 ? "eager" : "lazy"} priority={index === 0} sizes="(min-width: 768px) 5rem, 4rem" />
									</div>
									<div className="min-w-0 flex-1">
										<h3 className="line-clamp-1 text-sm font-extrabold md:text-base">
											<Link className="rounded-sm transition hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring" href="/menu">
												{item.name}
											</Link>
										</h3>
										<p className="mt-1 line-clamp-1 text-[0.72rem] text-cas-on-surface-variant md:text-xs">
											x{item.quantity} · {item.options}
										</p>
										<div className="mt-2 space-y-1 text-[0.72rem] leading-relaxed text-cas-on-surface-variant md:text-xs">
											<p className="flex justify-between gap-3">
												<span>Giá món gốc</span>
												<span>{item.basePrice}</span>
											</p>
											{item.toppings.map((topping) => (
												<p className="flex justify-between gap-3" key={topping.name}>
													<span>+ {topping.name}</span>
													<span>+{topping.price}</span>
												</p>
											))}
										</div>
										<CancellationRequestControl itemName={item.name} quantity={item.quantity} />
									</div>
									<div className="shrink-0 text-right">
										<strong className="text-sm text-cas-primary md:text-base">{item.total}</strong>
									</div>
								</li>
							))}
						</ul>

						<div className="flex items-end justify-between gap-4 border-t border-cas-outline-variant/40 pt-5">
							<div>
								<p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase md:text-xs">Tổng đơn vừa gửi</p>
								<p className="mt-1 text-xs text-cas-on-surface-variant md:text-sm">4 món · 3 loại</p>
							</div>
							<strong className="text-xl text-cas-primary md:text-3xl">170.000đ</strong>
						</div>
					</article>

					<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:gap-4">
						<CasButton variant="outline-primary" icon="payment" href="/payment" className="min-h-12 sm:min-w-[15rem]">
							Yêu cầu thanh toán
						</CasButton>
						<CasButton variant="primary" icon="plus" href="/menu" className="min-h-13 shadow-[0_8px_20px_var(--cas-shadow-color)] sm:min-w-[15rem]">
							Gọi thêm món
						</CasButton>
					</div>
				</main>
			</div>
		</div>
	);
}

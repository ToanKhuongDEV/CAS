import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { CustomerBottomNavigation } from "../../../components/customer/customer-bottom-navigation";
import { CustomerHeader } from "../../../components/customer/customer-header";
import { CancellationRequestControl } from "../../../components/customer/cancellation-request-control";
import { CasIcon } from "../../../components/ui/cas-icon";

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
    <div className="min-h-screen bg-cas-surface pb-28 text-cas-on-surface transition-colors duration-200 md:pb-10 md:pl-56">
      <CustomerHeader tableName="Bàn 05" />

      <main className="mx-auto w-full max-w-[36rem] px-5 pt-24 md:max-w-[75rem] md:px-10 md:pt-28">
        <section className="text-center" aria-labelledby="order-success-title">
          <div className="relative mx-auto grid size-24 place-items-center rounded-full border-4 border-cas-primary bg-cas-primary/8 text-cas-primary shadow-[0_12px_30px_var(--cas-shadow-color)]">
            <span className="absolute inset-2 rounded-full border border-cas-primary/25" />
            <CasIcon className="relative size-12" name="check" />
          </div>

          <p className="mt-7 text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
            Gửi món thành công
          </p>
          <h1
            className="mx-auto mt-2 max-w-md text-2xl leading-tight font-extrabold tracking-tight md:text-3xl"
            id="order-success-title"
          >
            Quán đã nhận món của bạn
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cas-on-surface-variant">
            Đơn hàng <strong className="text-cas-on-surface">#CAS-123</strong>{" "}
            đã được gửi thành công. Bạn có thể tiếp tục gọi thêm món trong bữa
            ăn.
          </p>
        </section>

        <section
          className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-[14rem_14rem_1fr]"
          aria-label="Thông tin đơn hàng"
        >
          <article className="flex min-h-36 flex-col justify-between rounded-2xl bg-cas-surface-container p-4 shadow-[0_5px_18px_var(--cas-shadow-color)]">
            <CasIcon className="size-7 text-cas-secondary" name="table" />
            <div>
              <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
                Vị trí
              </p>
              <p className="mt-1 text-xl font-extrabold">Bàn 05</p>
            </div>
          </article>

          <article className="flex min-h-36 flex-col justify-between rounded-2xl bg-cas-surface-container p-4 shadow-[0_5px_18px_var(--cas-shadow-color)]">
            <CasIcon className="size-7 text-cas-tertiary" name="clock" />
            <div>
              <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
                Thời gian gửi
              </p>
              <p className="mt-1 text-xl font-extrabold">19:42</p>
            </div>
          </article>

          <article className="col-span-2 rounded-2xl bg-cas-surface-container p-4 shadow-[0_5px_18px_var(--cas-shadow-color)] md:col-span-1 md:row-span-2 md:p-5">
            <div className="flex items-center justify-between gap-4 border-b border-cas-outline-variant/40 pb-4">
              <h2 className="text-base font-extrabold">Chi tiết món đã gọi</h2>
              <span className="rounded-full bg-cas-secondary-container/20 px-3 py-1 text-xs font-extrabold text-cas-secondary">
                4 món
              </span>
            </div>

            <ul className="divide-y divide-cas-outline-variant/35">
              {submittedItems.map((item, index) => (
                <li className="flex items-start gap-3 py-4" key={item.name}>
                  <div className="relative size-15 shrink-0 overflow-hidden rounded-xl bg-cas-surface">
                    <Image
                      className="object-cover"
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                      sizes="3.75rem"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-sm font-extrabold">
                      <Link
                        className="rounded-sm transition hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                        href="/menu"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-1 line-clamp-1 text-[0.68rem] text-cas-on-surface-variant">
                      x{item.quantity} · {item.options}
                    </p>
                    <div className="mt-2 space-y-1 text-[0.68rem] leading-relaxed text-cas-on-surface-variant">
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
                    <CancellationRequestControl
                      itemName={item.name}
                      quantity={item.quantity}
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <strong className="text-sm text-cas-primary">{item.total}</strong>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-end justify-between gap-4 border-t border-cas-outline-variant/40 pt-4">
              <div>
                <p className="text-[0.65rem] font-extrabold tracking-[0.12em] text-cas-on-surface-variant uppercase">
                  Tổng đơn vừa gửi
                </p>
                <p className="mt-1 text-xs text-cas-on-surface-variant">
                  4 món · 3 loại
                </p>
              </div>
              <strong className="text-xl text-cas-primary">170.000đ</strong>
            </div>
          </article>

        </section>

        <div className="mt-7 grid gap-3 md:mx-auto md:max-w-sm">
          <Link
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-cas-primary/30 bg-cas-surface-container px-5 font-extrabold text-cas-primary transition hover:bg-cas-primary/8 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
            href="/payment"
          >
            <CasIcon className="size-5" name="payment" />
            Yêu cầu thanh toán
          </Link>
          <Link
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
            href="/menu"
          >
            <CasIcon className="size-5" name="plus" />
            Gọi thêm món
          </Link>
        </div>
      </main>

      <CustomerBottomNavigation activeItem="orders" />
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ItemQuantityControl } from "../../../../components/customer/item-quantity-control";
import { CasIcon } from "../../../../components/ui/cas-icon";

export const metadata: Metadata = {
  title: "Giỏ hàng | CAS",
  description: "Kiểm tra món đã chọn trước khi gửi order tại CAS.",
};

const cartItems = [
  {
    name: "Mỳ cay đặc biệt 7 cấp độ",
    options: "Cấp độ 2, thêm xúc xích",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay đặc biệt đã chọn",
    basePrice: "45.000đ",
    toppings: [{ name: "Thêm xúc xích", price: "10.000đ" }],
    total: "55.000đ",
    quantity: 1,
  },
  {
    name: "Gà rán giòn rụm",
    options: "Sốt cay, phần vừa",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Phần gà rán giòn đã chọn",
    basePrice: "35.000đ × 2",
    toppings: [],
    total: "70.000đ",
    quantity: 2,
  },
  {
    name: "Trà sữa Trân châu Đường đen",
    options: "50% đường, ít đá",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa trân châu đường đen đã chọn",
    basePrice: "35.000đ",
    toppings: [{ name: "Thêm trân châu", price: "10.000đ" }],
    total: "45.000đ",
    quantity: 1,
  },
];

export default function CartPage() {
  return (
    <>
      <main className="w-full pb-36 md:pb-32">
        <header className="mb-6">
          <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
            Món đang chọn
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">
            Giỏ hàng của bạn
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-cas-on-surface-variant">
            Kiểm tra lại món và tùy chọn trước khi gửi.
          </p>
        </header>

        <aside className="flex items-start gap-3 rounded-2xl border border-cas-secondary/20 bg-cas-secondary-container/20 p-4 text-cas-on-surface-variant">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cas-secondary text-cas-on-primary">
            <CasIcon className="size-5" name="info" />
          </span>
          <p className="text-xs leading-relaxed md:text-sm">
            Bạn có thể gọi thêm món trong suốt bữa ăn và thanh toán một lần khi kết thúc.
          </p>
        </aside>

        <section className="mt-7" aria-labelledby="cart-items-title">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold" id="cart-items-title">
                Món mới
              </h2>
              <span className="grid min-w-6 place-items-center rounded-full bg-cas-primary px-2 py-1 text-[0.65rem] font-extrabold text-cas-on-primary">
                {cartItems.length}
              </span>
            </div>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              type="button"
            >
              <CasIcon className="size-4" name="trash" />
              Xóa tất cả
            </button>
          </div>

          <article className="rounded-2xl bg-cas-surface-container p-5 shadow-[0_5px_18px_var(--cas-shadow-color)] md:rounded-3xl md:p-7">
            <ul className="divide-y divide-cas-outline-variant/35">
              {cartItems.map((item, index) => (
                <li className="flex items-start gap-4 py-4 md:py-5" key={item.name}>
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-cas-surface md:size-20 md:rounded-2xl">
                    <Image
                      className="object-cover"
                      src={item.imageSrc}
                      alt={item.imageAlt}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                      sizes="(min-width: 768px) 5rem, 4rem"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="line-clamp-1 text-sm font-extrabold md:text-base">
                      {item.name}
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
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <ItemQuantityControl itemName={item.name} quantity={item.quantity} />
                      <button
                        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-cas-on-surface-variant transition hover:bg-cas-primary/10 hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-cas-focus-ring"
                        type="button"
                      >
                        <CasIcon className="size-4" name="trash" />
                        Xóa món
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <strong className="text-sm text-cas-primary md:text-base">{item.total}</strong>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section
          className="mt-7 border-t border-cas-outline-variant/55 pt-7"
          aria-labelledby="order-note-title"
        >
          <label className="block" htmlFor="order-note">
            <span className="text-lg font-extrabold" id="order-note-title">
              Ghi chú chung
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-cas-on-surface-variant">
              Ghi chú này áp dụng cho toàn bộ lần gửi món.
            </span>
            <textarea
              className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-cas-outline-variant/40 bg-cas-surface-container p-4 text-sm outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
              id="order-note"
              name="orderNote"
              placeholder="Ví dụ: vui lòng phục vụ món cay sau..."
            />
          </label>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-20 z-40 border-t border-cas-outline-variant/30 bg-cas-navigation px-5 py-3 shadow-[0_-8px_24px_var(--cas-shadow-color)] backdrop-blur-xl md:bottom-0">
        <div className="mx-auto w-full max-w-[34rem]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[0.68rem] font-semibold text-cas-on-surface-variant">
                Tạm tính (4 món)
              </p>
              <strong className="text-lg text-cas-primary">170.000đ</strong>
            </div>
            <Link
              className="inline-flex min-h-10 items-center rounded-xl px-3 text-xs font-bold text-cas-secondary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              href="/menu"
            >
              Chọn thêm món
            </Link>
          </div>
          <Link
            className="mt-2 flex min-h-13 w-full items-center justify-center gap-2 rounded-xl bg-cas-primary px-5 font-extrabold text-cas-on-primary shadow-[0_8px_20px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
            href="/orders"
          >
            <CasIcon className="size-5" name="restaurant" />
            Gửi món xuống bếp
          </Link>
        </div>
      </div>
    </>
  );
}

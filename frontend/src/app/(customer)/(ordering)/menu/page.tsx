import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ItemQuantityControl } from "../../../../components/customer/item-quantity-control";
import { CasIcon } from "../../../../components/ui/cas-icon";
import { CategoryNavigation } from "./category-navigation";

export const metadata: Metadata = {
  title: "Thực đơn | CAS",
  description: "Thực đơn món ăn và đồ uống tại CAS.",
};

const categories = [
  { id: "mon-noi-bat", label: "Món nổi bật" },
  { id: "my-cay", label: "Mỳ cay" },
  { id: "ga-ran", label: "Gà rán" },
  { id: "tra-sua", label: "Trà sữa" },
  { id: "ca-phe", label: "Cà phê" },
  { id: "nuoc-giai-khat", label: "Nước giải khát" },
  { id: "an-vat", label: "Ăn vặt" },
];

const menuItems = [
  {
    categoryId: "mon-noi-bat",
    detailSlug: "my-cay-dac-biet",
    name: "Mỳ cay đặc biệt 7 cấp độ",
    description:
      "Sợi mỳ dai ngon quyện cùng nước dùng chua cay đậm đà, rau nấm và topping hấp dẫn.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay đặc biệt với rau nấm và nhiều topping",
    price: "55.000đ",
    badges: ["Bán chạy", "Cực cay"],
    quantity: 1,
  },
  {
    categoryId: "mon-noi-bat",
    detailSlug: "tra-sua-tran-chau-duong-den",
    name: "Trà sữa Trân châu Đường đen",
    description:
      "Vị trà thơm dịu, sữa béo vừa phải cùng trân châu đường đen mềm dẻo.",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa trân châu đường đen mát lạnh",
    price: "45.000đ",
    badges: [],
    quantity: 1,
  },
  {
    categoryId: "mon-noi-bat",
    detailSlug: undefined,
    name: "Gà rán giòn rụm",
    description:
      "Lớp vỏ vàng giòn, thịt gà mềm mọng, dùng kèm sốt cay đặc trưng của quán.",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Phần gà rán vàng giòn dùng kèm sốt cay",
    price: "35.000đ",
    badges: [],
    quantity: 2,
  },
  {
    categoryId: "my-cay",
    detailSlug: "my-cay-xuc-xich-pho-mai",
    name: "Mỳ cay xúc xích phô mai",
    description:
      "Mỳ cay thơm béo với xúc xích, phô mai tan chảy, rau nấm và nước dùng đậm vị.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay xúc xích phủ phô mai",
    price: "49.000đ",
    badges: ["Món mới"],
    quantity: 0,
  },
  {
    categoryId: "my-cay",
    detailSlug: "my-cay-nam-rau-cu",
    name: "Mỳ cay nấm rau củ",
    description:
      "Phiên bản thanh nhẹ với nhiều loại nấm, rau xanh và nước dùng chua cay vừa vị.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay nấm và rau củ",
    price: "42.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "ga-ran",
    detailSlug: undefined,
    name: "Gà sốt cay Hàn Quốc",
    description:
      "Gà rán giòn áo sốt cay ngọt, phủ mè rang thơm và hành lá.",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Gà rán phủ sốt cay và mè rang",
    price: "39.000đ",
    badges: ["Bán chạy"],
    quantity: 0,
  },
  {
    categoryId: "ga-ran",
    detailSlug: undefined,
    name: "Gà popcorn lắc phô mai",
    description:
      "Gà viên nhỏ giòn tan, phủ bột phô mai đậm đà, tiện dùng cùng bạn bè.",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Gà popcorn phủ bột phô mai",
    price: "32.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "tra-sua",
    detailSlug: "tra-sua-truyen-thong",
    name: "Trà sữa truyền thống",
    description:
      "Trà đậm thơm kết hợp cùng sữa béo nhẹ, vị ngọt hài hòa và dễ uống.",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa truyền thống",
    price: "35.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "tra-sua",
    detailSlug: "tra-sua-matcha",
    name: "Trà sữa matcha",
    description:
      "Matcha thơm dịu hòa cùng sữa tươi và lớp kem béo mịn.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly trà sữa matcha xanh mát",
    price: "42.000đ",
    badges: ["Món mới"],
    quantity: 0,
  },
  {
    categoryId: "ca-phe",
    detailSlug: "ca-phe-sua-da",
    name: "Cà phê sữa đá",
    description:
      "Cà phê rang đậm pha cùng sữa đặc, phục vụ với đá mát lạnh.",
    imageSrc: "/images/welcome/iced-coffee.jpg",
    imageAlt: "Ly cà phê sữa đá",
    price: "29.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "ca-phe",
    detailSlug: undefined,
    name: "Bạc xỉu",
    description:
      "Vị sữa thơm béo nổi bật, điểm thêm cà phê nhẹ nhàng và đá lạnh.",
    imageSrc: "/images/welcome/iced-coffee.jpg",
    imageAlt: "Ly bạc xỉu mát lạnh",
    price: "32.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "nuoc-giai-khat",
    detailSlug: "matcha-latte",
    name: "Matcha latte",
    description:
      "Matcha thanh nhẹ kết hợp sữa tươi, tạo vị béo dịu và hậu vị thơm.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly matcha latte",
    price: "39.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "nuoc-giai-khat",
    detailSlug: undefined,
    name: "Nước chanh dây",
    description:
      "Chanh dây chua ngọt, thơm mát, thích hợp dùng cùng các món cay.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly nước giải khát mát lạnh",
    price: "25.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "nuoc-giai-khat",
    detailSlug: undefined,
    name: "Soda dâu",
    description:
      "Soda mát lạnh hòa cùng vị dâu chua ngọt và hương thơm trái cây.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly soda trái cây mát lạnh",
    price: "29.000đ",
    badges: [],
    quantity: 0,
  },
  {
    categoryId: "an-vat",
    detailSlug: undefined,
    name: "Ăn vặt thập cẩm",
    description:
      "Phần ăn vặt gồm khoai tây chiên, cá viên và các món xiên chiên giòn.",
    imageSrc: "/images/welcome/street-snacks.jpg",
    imageAlt: "Phần ăn vặt thập cẩm với khoai tây và xiên chiên",
    price: "45.000đ",
    badges: ["Đề xuất"],
    quantity: 0,
  },
];

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-cas-surface pb-44 text-cas-on-surface transition-colors duration-200 md:pb-32">
      <main className="mx-auto w-full max-w-[75rem] px-5 pt-20 md:px-10 md:pt-24">
        <section aria-labelledby="menu-heading">
          <h1 className="sr-only" id="menu-heading">
            Thực đơn CAS
          </h1>

          <label className="relative block" htmlFor="menu-search">
            <span className="sr-only">Tìm kiếm món ăn</span>
            <CasIcon
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-cas-on-surface-variant"
              name="search"
            />
            <input
              className="h-12 w-full rounded-2xl border border-cas-outline-variant/35 bg-cas-surface-container pr-4 pl-12 text-sm outline-none placeholder:text-cas-on-surface-variant/70 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
              id="menu-search"
              name="search"
              placeholder="Tìm món ngon tại Cas..."
              type="search"
            />
          </label>

          <article className="relative mt-5 min-h-48 overflow-hidden rounded-[1.4rem] bg-cas-primary shadow-[0_12px_32px_var(--cas-shadow-color)] md:min-h-64">
            <Image
              className="object-cover"
              src="/images/welcome/spicy-noodles.jpg"
              alt="Mỳ cay nổi bật trong ưu đãi hôm nay"
              fill
              loading="eager"
              priority
              sizes="(max-width: 767px) 100vw, 75rem"
            />
            <span className="absolute inset-0 bg-linear-to-r from-black/80 via-black/55 to-black/10" />
            <div className="relative z-10 flex min-h-48 max-w-[22rem] flex-col items-start justify-center p-6 text-white md:min-h-64 md:max-w-[31rem] md:p-10">
              <p className="mb-2 text-[0.65rem] font-extrabold tracking-[0.16em] text-amber-300 uppercase">
                Ưu đãi hôm nay
              </p>
              <h2 className="text-[1.45rem] leading-tight font-extrabold md:text-3xl">
                Combo Mỳ Cay &amp; Trà Sữa cho ngày mới
              </h2>
              <a
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-cas-primary px-4 text-xs font-bold text-cas-on-primary transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-white"
                href="#menu-list"
              >
                Đặt ngay
                <CasIcon className="size-4" name="arrow" />
              </a>
            </div>
          </article>
        </section>

        <CategoryNavigation categories={categories} />

        <div className="mt-2" id="menu-list">
          {categories.map((category) => {
            const categoryItems = menuItems.filter(
              (item) => item.categoryId === category.id,
            );

            return (
              <section
                className="scroll-mt-32 border-t border-cas-outline-variant/55 py-7 first:border-t-0"
                id={category.id}
                key={category.id}
                aria-labelledby={`${category.id}-title`}
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2
                    className="text-xl font-extrabold"
                    id={`${category.id}-title`}
                  >
                    {category.label}
                  </h2>
                  <span className="text-xs font-semibold text-cas-on-surface-variant">
                    {categoryItems.length} món
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {categoryItems.map((item, itemIndex) => (
                    <article
                      className="grid grid-cols-[7.25rem_1fr] gap-4 rounded-[1.2rem] bg-cas-surface-container p-3 shadow-[0_5px_18px_var(--cas-shadow-color)] md:grid-cols-1 md:p-4"
                      key={item.name}
                    >
                      <div className="relative min-h-32 overflow-hidden rounded-2xl md:aspect-[4/3] md:min-h-0">
                        <Image
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          src={item.imageSrc}
                          alt={item.imageAlt}
                          fill
                          loading={
                            category.id === "mon-noi-bat" && itemIndex === 0
                              ? "eager"
                              : "lazy"
                          }
                          sizes="(max-width: 767px) 7.25rem, (max-width: 1023px) 45vw, 30vw"
                        />
                        {item.badges.length > 0 ? (
                          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
                            {item.badges.map((badge, index) => (
                              <span
                                className={`rounded-full px-2 py-1 text-[0.55rem] font-extrabold text-white ${
                                  index === 0
                                    ? "bg-cas-primary"
                                    : "bg-rose-600"
                                }`}
                                key={badge}
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex min-w-0 flex-col">
                        <h3 className="line-clamp-2 text-sm leading-snug font-extrabold md:text-base">
                          {item.detailSlug ? (
                            <Link
                              className="rounded-sm transition hover:text-cas-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                              href={`/menu/${item.detailSlug}`}
                            >
                              {item.name}
                            </Link>
                          ) : (
                            item.name
                          )}
                        </h3>
                        <p className="mt-1.5 line-clamp-3 text-[0.7rem] leading-relaxed text-cas-on-surface-variant md:text-xs">
                          {item.description}
                        </p>
                        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                          <strong className="text-sm text-cas-primary md:text-base">
                            {item.price}
                          </strong>
                          {item.quantity > 0 ? (
                            <ItemQuantityControl
                              itemName={item.name}
                              quantity={item.quantity}
                            />
                          ) : item.detailSlug ? (
                            <Link
                              className="grid size-9 place-items-center rounded-full bg-cas-primary text-cas-on-primary shadow-md transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                              href={`/menu/${item.detailSlug}`}
                              aria-label={`Chọn tùy chọn cho ${item.name}`}
                            >
                              <CasIcon className="size-5" name="plus" />
                            </Link>
                          ) : (
                            <button
                              className="grid size-9 place-items-center rounded-full bg-cas-primary text-cas-on-primary shadow-md transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                              type="button"
                              aria-label={`Thêm ${item.name} vào giỏ hàng`}
                            >
                              <CasIcon className="size-5" name="plus" />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      <div className="fixed inset-x-5 bottom-24 z-40 mx-auto max-w-[34rem] md:bottom-6">
        <Link
          className="flex min-h-15 w-full items-center justify-between rounded-2xl bg-cas-primary px-5 text-left text-cas-on-primary shadow-[0_12px_30px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
          href="/cart"
        >
          <span className="inline-flex items-center gap-3 font-extrabold">
            <span className="grid size-9 place-items-center rounded-full bg-white/15">
              <CasIcon className="size-5" name="basket" />
            </span>
            Xem món đã chọn
          </span>
          <span className="text-xs font-semibold">4 món • 170.000đ</span>
        </Link>
      </div>

    </div>
  );
}

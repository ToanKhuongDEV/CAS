import Image from "next/image";
import type { ReactNode, SVGProps } from "react";

import { ThemeToggle } from "../components/ui/theme-toggle";

type IconName =
  | "arrow"
  | "bill"
  | "fire"
  | "menu"
  | "payment"
  | "restaurant"
  | "settings"
  | "sparkle";

type CasIconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

const iconPaths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  bill: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  fire: (
    <path d="M13.5 2.8c.5 3.2-1.8 4.2-1.8 6.4 0 1.1.8 1.9 1.8 1.9 1.7 0 2.8-1.7 2.5-4.1 2.1 1.8 3.4 4.2 3.4 6.7A7.4 7.4 0 0 1 12 21a7.4 7.4 0 0 1-7.4-7.3c0-3.7 2.2-7.2 5.6-9.5-.2 3.2 1 4.6 2 4.6 1.2 0 2.1-2 1.3-6Z" />
  ),
  menu: (
    <>
      <path d="M5 4v7M3 4v4a2 2 0 0 0 4 0V4M5 11v9M11 4v16M11 4c4 0 6 2 6 5v2h-6" />
      <path d="M17 11v9" />
    </>
  ),
  payment: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  restaurant: (
    <>
      <path d="M7 3v7M4 3v5a3 3 0 0 0 6 0V3M7 10v11" />
      <path d="M15 3c3 0 5 2.7 5 6v3h-5V3Zm2.5 9v9" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
      <path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" />
    </>
  ),
};

const quickStats = [
  { value: "4.9", label: "Đánh giá" },
  { value: "7", label: "Cấp độ cay" },
  { value: "15p", label: "Phục vụ" },
];

const menuCategories = [
  {
    title: "Mỳ cay",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay nóng với tôm, mực và nấm",
  },
  {
    title: "Nước giải khát",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly matcha mát lạnh",
  },
  {
    title: "Cà phê",
    imageSrc: "/images/welcome/iced-coffee.jpg",
    imageAlt: "Ly cà phê sữa đá Việt Nam",
  },
  {
    title: "Trà sữa",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa trân châu mát lạnh",
  },
  {
    title: "Gà rán",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Gà rán giòn phủ sốt cay và mè",
  },
];

const navigationItems: {
  label: string;
  icon: IconName;
  active: boolean;
}[] = [
  { label: "Menu", icon: "menu", active: true },
  { label: "Đơn hàng", icon: "bill", active: false },
  { label: "Thanh toán", icon: "payment", active: false },
  { label: "Cài đặt", icon: "settings", active: false },
];

function CasIcon({ name, ...props }: CasIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-cas-surface pb-22 text-cas-on-surface transition-colors duration-200 [background-image:linear-gradient(var(--cas-pattern-color)_1px,transparent_1px),linear-gradient(90deg,var(--cas-pattern-color)_1px,transparent_1px)] [background-size:30px_30px] md:pb-0">
      <header className="fixed inset-x-0 top-0 z-50 h-16 bg-cas-header shadow-[0_2px_12px_var(--cas-shadow-color)] backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-[75rem] items-center justify-between px-5 md:px-10">
          <a
            className="inline-flex items-center gap-3 text-xl font-bold text-cas-primary focus-visible:rounded-full focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
            href="#"
            aria-label="CAS - Trang chào mừng"
          >
            <span className="grid size-10 place-items-center rounded-full bg-cas-primary text-cas-on-primary">
              <CasIcon className="size-5" name="restaurant" />
            </span>
            <span>Cas</span>
          </a>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <span className="rounded-full bg-cas-primary-container px-4 py-1.5 text-xs font-semibold tracking-wide text-cas-on-primary-container">
              Bàn 05
            </span>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-[75rem] px-5 pt-28 pb-10 md:min-h-[47rem] md:grid-cols-[5fr_7fr] md:items-center md:gap-12 md:px-10 md:pt-24 md:pb-12">
          <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cas-secondary-container/30 px-4 py-2 text-[0.72rem] font-semibold tracking-[0.1em] text-cas-secondary uppercase">
              <CasIcon className="size-4.5" name="sparkle" />
              Mỳ cay, gà rán &amp; coffee
            </p>

            <h1 className="m-0 text-[clamp(2rem,9vw,3rem)] leading-[1.2] font-extrabold tracking-[-0.035em] md:text-[clamp(2.8rem,5vw,4rem)] md:leading-[1.1]">
              Chào mừng bạn <br className="hidden md:block" />
              đến <em className="text-cas-primary">Cas</em>
            </h1>

            <p className="mt-4 max-w-[31rem] text-[0.93rem] leading-[1.65] text-cas-on-surface-variant md:text-[1.05rem]">
              Cùng chọn món ngon cho bàn của bạn. Thưởng thức mỳ cay 7 cấp độ,
              gà rán giòn tan cùng cà phê, trà sữa và đồ uống mát lạnh.
            </p>

            <a
              className="mt-6 inline-flex min-h-14 w-full max-w-[21rem] items-center justify-center gap-3.5 rounded-xl bg-cas-primary px-7 font-bold text-cas-on-primary shadow-[0_10px_28px_var(--cas-shadow-color)] transition duration-200 hover:-translate-y-0.5 hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring md:w-auto md:min-w-[13.5rem]"
              href="#menu-preview"
            >
              Bắt đầu gọi món
              <CasIcon className="size-5" name="arrow" />
            </a>

            <div
              className="mt-6 grid w-full max-w-[23rem] grid-cols-3 divide-x divide-cas-outline-variant text-cas-on-surface-variant md:w-auto"
              aria-label="Thông tin nổi bật"
            >
              {quickStats.map((stat) => (
                <div
                  className="flex flex-col items-center px-3 md:items-start"
                  key={stat.label}
                >
                  <strong className="text-[1.05rem] text-cas-on-surface">
                    {stat.value}
                  </strong>
                  <span className="mt-0.5 text-[0.55rem] font-bold tracking-[0.1em] uppercase">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative mt-8 h-[28rem] md:mt-0 md:h-[37rem]"
            aria-label="Món ăn nổi bật"
          >
            <div className="group absolute top-0 right-0 h-[79%] w-[82%] overflow-hidden rounded-[2rem] shadow-[0_22px_48px_var(--cas-shadow-color)]">
              <Image
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                src="/images/welcome/spicy-noodles.jpg"
                alt="Tô mỳ cay nóng nổi bật tại CAS"
                fill
                priority
                sizes="(max-width: 767px) 80vw, 48vw"
              />
              <span className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            </div>

            <div className="animate-cas-float absolute bottom-6 left-0 z-20 aspect-square w-[58%] overflow-hidden rounded-3xl border-[0.45rem] border-cas-surface shadow-[0_22px_48px_var(--cas-shadow-color)]">
              <Image
                className="object-cover"
                src="/images/welcome/street-snacks.jpg"
                alt="Các món ăn vặt gồm cá viên, khoai tây chiên và xiên que"
                fill
                sizes="(max-width: 767px) 58vw, 28vw"
              />
            </div>

            <div className="absolute top-13 left-[7%] z-30 flex items-center gap-2 rounded-full border border-white/35 bg-cas-glass px-3 py-2 text-[0.62rem] font-semibold shadow-[0_8px_20px_var(--cas-shadow-color)] backdrop-blur-xl">
              <span className="grid size-7 place-items-center rounded-full bg-cas-tertiary-container text-cas-on-tertiary-container">
                <CasIcon className="size-4" name="fire" />
              </span>
              Được gọi nhiều
            </div>

            <span
              className="absolute -right-10 -bottom-2 size-40 rotate-20 rounded-[45%] bg-cas-primary/10"
              aria-hidden="true"
            />
          </div>
        </section>

        <section
          className="mx-auto w-full max-w-[75rem] px-5 py-6 pb-11 md:px-10 md:py-12 md:pb-16"
          id="menu-preview"
        >
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[0.68rem] font-bold tracking-[0.12em] text-cas-primary uppercase">
                Gợi ý hôm nay
              </p>
              <h2 className="text-[clamp(1.35rem,5vw,1.75rem)] leading-tight font-bold">
                Khám phá thực đơn
              </h2>
            </div>
            <a
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-cas-secondary focus-visible:rounded focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              href="#menu-preview"
            >
              Xem tất cả
              <CasIcon className="size-4" name="arrow" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {menuCategories.map((category) => (
              <article
                className="group relative min-h-52 overflow-hidden rounded-[1.15rem] shadow-[0_8px_24px_var(--cas-shadow-color)] last:col-span-2 last:min-h-44 md:min-h-[23rem] md:last:col-span-1 md:last:min-h-[23rem]"
                key={category.title}
              >
                <Image
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  src={category.imageSrc}
                  alt={category.imageAlt}
                  fill
                  sizes="(max-width: 767px) 46vw, 24vw"
                />
                <span className="absolute inset-0 bg-linear-to-t from-black/45 to-transparent" />
                <strong className="absolute right-4 bottom-4 left-4 z-10 text-sm font-bold text-white drop-shadow-md">
                  {category.title}
                </strong>
              </article>
            ))}
          </div>
        </section>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid min-h-20 grid-cols-4 rounded-t-xl border-t border-cas-outline-variant/30 bg-cas-navigation px-3 pt-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_var(--cas-shadow-color)] backdrop-blur-xl md:hidden"
        aria-label="Điều hướng chính"
      >
        {navigationItems.map((item) => (
          <a
            className={`flex flex-col items-center justify-center gap-1 rounded-xl text-[0.62rem] font-semibold focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-cas-focus-ring ${
              item.active
                ? "bg-cas-secondary-container/20 text-cas-primary"
                : "text-cas-on-surface-variant"
            }`}
            href={item.active ? "#menu-preview" : "#"}
            key={item.label}
            aria-current={item.active ? "page" : undefined}
          >
            <CasIcon className="size-5.5" name={item.icon} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

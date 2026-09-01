"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CustomerBottomNavigation } from "../../components/customer/customer-bottom-navigation";
import { CustomerHeader } from "../../components/customer/customer-header";
import { CasIcon } from "../../components/ui/cas-icon";
import {
  loadPublicStore,
  loadPublicStoreWelcomeConfig,
  type PublicStoreWelcomeConfig,
} from "../../lib/api/store/public-store.api";
import type { StoreSettings } from "../../lib/api/store/store-settings.api";

const quickStats = [
  { value: "4.9", label: "Đánh giá" },
  { value: "7", label: "Cấp độ cay" },
  { value: "15p", label: "Phục vụ" },
];

const fallbackMenuCategories = [
  {
    title: "Mỳ cay",
    href: "/menu#my-cay",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay nóng với rau nấm và nhiều topping",
  },
  {
    title: "Nước giải khát",
    href: "/menu#nuoc-giai-khat",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly matcha mát lạnh",
  },
  {
    title: "Cà phê",
    href: "/menu#ca-phe",
    imageSrc: "/images/welcome/iced-coffee.jpg",
    imageAlt: "Ly cà phê sữa đá Việt Nam",
  },
  {
    title: "Trà sữa",
    href: "/menu#tra-sua",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa trân châu mát lạnh",
  },
  {
    title: "Gà rán",
    href: "/menu#ga-ran",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Gà rán giòn phủ sốt cay và mè",
  },
];

const fallbackStore: StoreSettings = {
  address: "123 Đường Nguyễn Văn Cừ, Phường 4, Quận 5, TP. Hồ Chí Minh",
  closeTime: "22:30:00",
  email: "contact@cas-restaurant.vn",
  googleMapsLocation: "https://maps.google.com/?q=10.7554,106.6781",
  logoStorageKey: null,
  logoUrl: null,
  name: "Tiệm Ăn Vặt & Mỳ Cay CAS",
  openTime: "08:00:00",
  phone: "0901234567",
  status: "ACTIVE",
  welcomeSlogan: null,
};

function imageUrl(configuredUrl: string | null | undefined, fallbackUrl: string) {
  return configuredUrl || fallbackUrl;
}

function formatOpeningHours(openTime: string, closeTime: string) {
  return `${openTime.slice(0, 5)} – ${closeTime.slice(0, 5)} mỗi ngày`;
}

export default function Home() {
  const [store, setStore] = useState<StoreSettings>(fallbackStore);
  const [welcome, setWelcome] = useState<PublicStoreWelcomeConfig | null>(null);

  useEffect(() => {
    void loadPublicStore()
      .then(setStore)
      .catch(() => undefined);
    void loadPublicStoreWelcomeConfig()
      .then(setWelcome)
      .catch(() => undefined);
  }, []);

  const menuCategories = fallbackMenuCategories.map((category, index) => ({
    ...category,
    imageSrc: imageUrl(
      welcome?.[
        `menuPreview${index + 1}ImageUrl` as keyof Pick<
          PublicStoreWelcomeConfig,
          | "menuPreview1ImageUrl"
          | "menuPreview2ImageUrl"
          | "menuPreview3ImageUrl"
          | "menuPreview4ImageUrl"
          | "menuPreview5ImageUrl"
        >
      ],
      category.imageSrc,
    ),
  }));
  const heroPrimaryImage = imageUrl(
    welcome?.heroPrimaryImageUrl,
    "/images/welcome/spicy-noodles.jpg",
  );
  const heroSecondaryImage = imageUrl(
    welcome?.heroSecondaryImageUrl,
    "/images/welcome/street-snacks.jpg",
  );

  return (
    <div className="min-h-screen overflow-hidden bg-cas-surface text-cas-on-surface transition-colors duration-200 bg-[linear-gradient(var(--cas-pattern-color)_1px,transparent_1px),linear-gradient(90deg,var(--cas-pattern-color)_1px,transparent_1px)] bg-size-[30px_30px]">
      <CustomerHeader />

      <div className="mx-auto flex w-full max-w-340 items-start gap-8 px-4 pt-20 pb-28 md:gap-12 md:px-8 md:pt-24 md:pb-16 lg:gap-14">
        <CustomerBottomNavigation activeItem="home" />

        <main className="min-w-0 flex-1">
          <section className="grid w-full pb-10 md:min-h-176 md:grid-cols-[5fr_7fr] md:items-center md:gap-10 md:pt-4 md:pb-12">
            <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-cas-secondary-container/30 px-4 py-2 text-[0.72rem] font-semibold tracking-widest text-cas-secondary uppercase">
                <CasIcon className="size-4.5" name="sparkle" />
                Mỳ cay, gà rán &amp; coffee
              </p>

              <h1 className="m-0 text-[clamp(2rem,9vw,3rem)] leading-[1.2] font-extrabold tracking-[-0.035em] md:text-[clamp(2.8rem,5vw,4rem)] md:leading-[1.1]">
                Chào mừng bạn <br className="hidden md:block" />
                đến <em className="text-cas-primary">Cas</em>
              </h1>

              <p className="mt-4 max-w-124 text-[0.93rem] leading-[1.65] text-cas-on-surface-variant md:text-[1.05rem]">
                {store.welcomeSlogan ??
                  "Cùng chọn món ngon cho bàn của bạn. Thưởng thức mỳ cay 7 cấp độ, gà rán giòn tan cùng cà phê, trà sữa và đồ uống mát lạnh."}
              </p>

              <Link
                className="mt-6 inline-flex min-h-14 w-full max-w-84 items-center justify-center gap-3.5 rounded-xl bg-cas-primary px-7 font-bold text-cas-on-primary shadow-[0_10px_28px_var(--cas-shadow-color)] transition duration-200 hover:-translate-y-0.5 hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring md:w-auto md:min-w-54"
                href="/menu"
              >
                Bắt đầu gọi món
                <CasIcon className="size-5" name="arrow" />
              </Link>

              <div
                className="mt-6 grid w-full max-w-92 grid-cols-3 divide-x divide-cas-outline-variant text-cas-on-surface-variant md:w-auto"
                aria-label="Thông tin nổi bật"
              >
                {quickStats.map((stat) => (
                  <div className="flex flex-col items-center px-3 md:items-start" key={stat.label}>
                    <strong className="text-[1.05rem] text-cas-on-surface">{stat.value}</strong>
                    <span className="mt-0.5 text-[0.55rem] font-bold tracking-widest uppercase">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 h-112 md:mt-0 md:h-148" aria-label="Món ăn nổi bật">
              <div className="group absolute top-0 right-0 h-[79%] w-[82%] overflow-hidden rounded-4xl shadow-[0_22px_48px_var(--cas-shadow-color)]">
                <img
                  className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={heroPrimaryImage}
                  alt="Tô mỳ cay nóng nổi bật tại CAS"
                  loading="eager"
                />
                <span className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
              </div>

              <div className="animate-cas-float absolute bottom-6 left-0 z-20 aspect-square w-[58%] overflow-hidden rounded-3xl border-[0.45rem] border-cas-surface shadow-[0_22px_48px_var(--cas-shadow-color)]">
                <img
                  className="absolute inset-0 size-full object-cover"
                  src={heroSecondaryImage}
                  alt="Các món ăn vặt gồm cá viên, khoai tây chiên và xiên que"
                  loading="eager"
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

          {welcome?.bannerImageUrl ? (
            <section
              className="mb-8 overflow-hidden rounded-3xl shadow-[0_12px_28px_var(--cas-shadow-color)]"
              aria-label="Banner giới thiệu cửa hàng"
            >
              <img
                className="aspect-[11/4] w-full object-cover"
                src={welcome.bannerImageUrl}
                alt="Banner giới thiệu cửa hàng"
              />
            </section>
          ) : null}

          <section className="w-full py-6 pb-11 md:py-10 md:pb-14" id="menu-preview">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[0.68rem] font-bold tracking-[0.12em] text-cas-primary uppercase">
                  Gợi ý hôm nay
                </p>
                <h2 className="text-[clamp(1.35rem,5vw,1.75rem)] leading-tight font-bold">
                  Khám phá thực đơn
                </h2>
              </div>
              <Link
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-cas-secondary focus-visible:rounded focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                href="/menu"
              >
                Xem tất cả
                <CasIcon className="size-4" name="arrow" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {menuCategories.map((category, index) => (
                <Link
                  className="group relative min-h-52 overflow-hidden rounded-[1.15rem] shadow-[0_8px_24px_var(--cas-shadow-color)] last:col-span-2 last:min-h-44 md:min-h-92 md:last:col-span-1 md:last:min-h-92"
                  key={category.title}
                  href={category.href}
                  aria-label={category.title}
                >
                  <img
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    src={category.imageSrc}
                    alt={category.imageAlt}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  <span className="absolute inset-0 bg-linear-to-t from-black/45 to-transparent" />
                  <strong className="absolute right-4 bottom-4 left-4 z-10 text-sm font-bold text-white drop-shadow-md">
                    {category.title}
                  </strong>
                </Link>
              ))}
            </div>
          </section>

          <footer className="border-t border-cas-outline-variant/45 py-7 text-sm text-cas-on-surface-variant">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)] md:gap-8">
              <div>
                <p className="flex items-center gap-2 font-extrabold text-cas-on-surface">
                  <CasIcon className="size-4 text-cas-primary" name="restaurant" />
                  {store.name}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 font-extrabold text-cas-on-surface">
                  <CasIcon className="size-4 text-cas-primary" name="location" />
                  Địa chỉ
                </p>
                <a
                  className="mt-2 block leading-relaxed hover:text-cas-primary focus-visible:rounded focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                  href={store.googleMapsLocation || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {store.address}
                </a>
              </div>
              <div>
                <p className="flex items-center gap-2 font-extrabold text-cas-on-surface">
                  <CasIcon className="size-4 text-cas-primary" name="phone" />
                  Liên hệ
                </p>
                <div className="mt-2 grid gap-2">
                  <a
                    className="inline-flex items-center gap-2 font-bold text-cas-primary focus-visible:rounded focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                    href={`tel:${store.phone}`}
                  >
                    <CasIcon className="size-4" name="phone" />
                    {store.phone}
                  </a>
                  <a
                    className="inline-flex items-center gap-2 font-bold text-cas-primary focus-visible:rounded focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
                    href={`mailto:${store.email}`}
                  >
                    <CasIcon className="size-4" name="mail" />
                    {store.email}
                  </a>
                  <p className="inline-flex items-center gap-2">
                    <CasIcon className="size-4 text-cas-primary" name="clock" />
                    {formatOpeningHours(store.openTime, store.closeTime)}
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-7 border-t border-cas-outline-variant/30 pt-4 text-xs text-cas-on-surface-variant">
              © 2026 Bản quyền thuộc về Khuong Xuan Toan - 0394986338
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

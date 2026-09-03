"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AddToCartOptionDialog,
  type MenuOptionGroup,
} from "../../../../components/customer/add-to-cart-option-dialog";
import { CasIcon } from "../../../../components/ui/cas-icon";
import { loadCustomerCatalog } from "../../../../lib/api/catalog/published-catalog.api";
import { loadPublicStoreWelcomeConfig } from "../../../../lib/api/store/public-store.api";
import { addCustomerCartLine } from "../../../../lib/customer/cart";
import { hasOpenCustomerTableSession } from "../../../../lib/customer/table-session";
import { CategoryNavigation } from "./category-navigation";

type CustomerMenuItem = {
  availabilityStatus?: "ACTIVE" | "SOLD_OUT" | "INACTIVE";
  id?: number;
  badges: string[];
  basePrice: number;
  categoryId: string;
  description: string;
  detailSlug?: string;
  imageAlt: string;
  imageSrc: string;
  name: string;
  optionGroups?: MenuOptionGroup[];
  price: string;
  quantity: number;
};

type CatalogCategoryNavigationItem = {
  id: string;
  label: string;
};

export default function MenuPage() {
  const router = useRouter();
  const [catalogCategories, setCatalogCategories] = useState<CatalogCategoryNavigationItem[]>([]);
  const [catalogItems, setCatalogItems] = useState<CustomerMenuItem[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [welcomeBannerImageUrl, setWelcomeBannerImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void loadCustomerCatalog()
      .then((catalog) => {
        setCatalogError(null);
        const optionGroupsById = new Map(catalog.optionGroups.map((group) => [group.id, group]));
        setCatalogCategories(
          catalog.categories.map((category) => ({
            id: String(category.id),
            label: category.name,
          })),
        );
        setCatalogItems(
          catalog.items.map((item) => ({
            id: item.id,
            availabilityStatus: item.availabilityStatus,
            badges: (item.tags ?? []).map((tag) => tag.name),
            basePrice: item.price,
            categoryId: String(item.categoryId),
            description: item.description ?? "",
            detailSlug: String(item.id),
            imageAlt: item.name,
            imageSrc: item.imageUrl ?? "/images/welcome/spicy-noodles.jpg",
            name: item.name,
            optionGroups: (item.optionGroups ?? []).flatMap((group) => {
              const optionGroup = optionGroupsById.get(group.id);
              if (!optionGroup) return [];
              return [
                {
                  id: String(group.id),
                  label: group.name,
                  maxSelect: optionGroup.maxSelect,
                  minSelect: optionGroup.minSelect,
                  options: optionGroup.values.map((value) => ({
                    id: String(value.id),
                    isDefault: value.isDefault,
                    label: value.name,
                    priceDelta: value.extraPrice,
                  })),
                  selectionType: optionGroup.selectionType,
                },
              ];
            }),
            price: `${new Intl.NumberFormat("vi-VN").format(item.price)}đ`,
            quantity: 0,
          })),
        );
      })
      .catch((cause) =>
        setCatalogError(cause instanceof Error ? cause.message : "Không thể tải thực đơn."),
      );
    void loadPublicStoreWelcomeConfig()
      .then((config) => setWelcomeBannerImageUrl(config?.bannerImageUrl ?? null))
      .catch(() => undefined);
  }, []);

  const categoryNavigationItems = [
    ...catalogCategories,
    { id: "additional-services", label: "Dịch vụ thêm" },
  ];
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase();

  return (
    <>
      <main className="w-full">
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
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm món ngon tại Cas..."
              type="search"
              value={searchQuery}
            />
          </label>

          {welcomeBannerImageUrl ? (
            <article className="relative mt-5 min-h-48 overflow-hidden rounded-[1.4rem] shadow-[0_12px_32px_var(--cas-shadow-color)] md:min-h-64">
              <Image
                className="object-cover"
                src={welcomeBannerImageUrl}
                alt="Banner giới thiệu cửa hàng"
                fill
                loading="eager"
                priority
                sizes="(max-width: 767px) 100vw, 75rem"
              />
            </article>
          ) : null}
        </section>

        <CategoryNavigation categories={categoryNavigationItems} />

        <div className="mt-2 pb-70 md:pb-70" id="menu-list">
          {catalogError ? <p className="py-8 text-sm text-cas-error">{catalogError}</p> : null}
          {!catalogError && catalogCategories.length === 0 ? (
            <p className="py-8 text-sm text-cas-on-surface-variant">Đang tải thực đơn…</p>
          ) : null}
          {catalogCategories.map((category) => {
            const categoryItems = catalogItems.filter(
              (item) =>
                item.categoryId === category.id &&
                (!normalizedSearchQuery ||
                  item.name.toLocaleLowerCase().includes(normalizedSearchQuery) ||
                  item.description.toLocaleLowerCase().includes(normalizedSearchQuery)),
            );

            return (
              <section
                className="scroll-mt-32 border-t border-cas-outline-variant/55 py-5 first:border-t-0 md:py-6"
                id={category.id}
                key={category.id}
                aria-labelledby={`${category.id}-title`}
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-extrabold" id={`${category.id}-title`}>
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
                            category.id === "mon-noi-bat" && itemIndex === 0 ? "eager" : "lazy"
                          }
                          sizes="(max-width: 767px) 7.25rem, (max-width: 1023px) 45vw, 30vw"
                        />
                        {item.badges.length > 0 ? (
                          <div className="absolute top-2 left-2 flex flex-wrap items-start gap-1">
                            {item.badges.map((badge, index) => (
                              <span
                                className={`rounded-full px-2 py-1 text-[0.55rem] font-extrabold text-white ${
                                  index === 0 ? "bg-cas-primary" : "bg-rose-600"
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
                          <AddToCartOptionDialog
                            basePrice={item.basePrice}
                            beforeAddToCart={async () => {
                              if (await hasOpenCustomerTableSession()) return true;
                              router.push(
                                `/scan?returnTo=${encodeURIComponent(window.location.pathname)}`,
                              );
                              return false;
                            }}
                            currentQuantity={item.quantity}
                            disabled={item.availabilityStatus === "SOLD_OUT"}
                            itemName={item.name}
                            optionGroups={item.optionGroups}
                            onAddToCart={(payload) => {
                              if (item.id === undefined) return;
                              addCustomerCartLine({
                                menuItemId: item.id,
                                itemName: item.name,
                                optionValueIds: Object.values(payload.selectedOptionIds)
                                  .flat()
                                  .map(Number),
                                quantity: 1,
                              });
                              window.dispatchEvent(new Event("cas-cart-updated"));
                            }}
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          <section
            className="scroll-mt-32 border-t border-cas-outline-variant/55 py-5 md:py-6"
            id="additional-services"
            aria-labelledby="additional-services-title"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-extrabold" id="additional-services-title">
                Dịch vụ thêm
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <article className="grid grid-cols-[7.25rem_1fr] gap-4 rounded-[1.2rem] bg-cas-surface-container p-3 shadow-[0_5px_18px_var(--cas-shadow-color)] md:grid-cols-1 md:p-4">
                <div className="grid min-h-32 place-items-center rounded-2xl bg-cas-primary/10 text-cas-primary md:aspect-[4/3] md:min-h-0">
                  <CasIcon className="size-10" name="sparkle" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <h3 className="line-clamp-2 text-sm leading-snug font-extrabold md:text-base">
                    Đặt dịch vụ theo yêu cầu
                  </h3>
                  <p className="mt-1.5 line-clamp-3 text-[0.7rem] leading-relaxed text-cas-on-surface-variant md:text-xs">
                    Liên hệ nhân viên để trao đổi dịch vụ và chốt giá trước khi đặt.
                  </p>
                  <div className="mt-auto pt-3">
                    <p className="text-xs font-semibold text-cas-on-surface-variant md:text-sm">
                      Chốt giá qua Zalo
                    </p>
                    <span className="mt-2 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-cas-primary/10 px-3 text-xs font-extrabold text-cas-primary">
                      <CasIcon className="size-3.5" name="phone" />
                      Liên hệ: 0901 234 567
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </section>
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
        </Link>
      </div>
    </>
  );
}

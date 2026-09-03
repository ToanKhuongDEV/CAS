"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { MenuOptionGroup } from "../../../../../components/customer/add-to-cart-option-dialog";
import { CasIcon } from "../../../../../components/ui/cas-icon";
import { loadCustomerCatalogItem } from "../../../../../lib/api/catalog/published-catalog.api";
import { ProductDetailForm } from "./product-detail-form";

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const [product, setProduct] = useState<{
    id: number;
    badges: string[];
    description: string;
    imageUrl: string | null;
    name: string;
    optionGroups: MenuOptionGroup[];
    price: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params.slug);
    if (!Number.isSafeInteger(id) || id <= 0) {
      setError("Không tìm thấy món ăn.");
      return;
    }

    void loadCustomerCatalogItem(id)
      .then(({ item, optionGroups }) => {
        const groupsById = new Map(optionGroups.map((group) => [group.id, group]));
        setProduct({
          id: item.id,
          badges: (item.tags ?? []).map((tag) => tag.name),
          description: item.description ?? "",
          imageUrl: item.imageUrl,
          name: item.name,
          optionGroups: (item.optionGroups ?? []).flatMap((link) => {
            const group = groupsById.get(link.id);
            if (!group) return [];
            return [
              {
                id: String(group.id),
                label: group.name,
                maxSelect: group.maxSelect,
                minSelect: group.minSelect,
                options: group.values.map((value) => ({
                  id: String(value.id),
                  isDefault: value.isDefault,
                  label: value.name,
                  priceDelta: value.extraPrice,
                })),
                selectionType: group.selectionType,
              },
            ];
          }),
          price: item.price,
        });
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Không thể tải thông tin món."),
      );
  }, [params.slug]);

  if (error) {
    return (
      <main className="p-5">
        <p className="text-cas-error">{error}</p>
        <Link className="mt-4 inline-flex font-bold text-cas-primary" href="/menu">
          Quay lại thực đơn
        </Link>
      </main>
    );
  }
  if (!product) return <p className="p-5 text-cas-on-surface-variant">Đang tải món ăn…</p>;

  return (
    <main className="w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[21/9] md:rounded-[1.6rem]">
        <Image
          className="object-cover"
          src={product.imageUrl ?? "/images/welcome/spicy-noodles.jpg"}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 75rem"
        />
        <span className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/10" />
        <Link
          className="absolute top-4 left-4 grid size-11 place-items-center rounded-full bg-cas-glass text-cas-primary shadow-lg backdrop-blur-xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
          href="/menu"
          aria-label="Quay lại thực đơn"
        >
          <CasIcon className="size-5 rotate-180" name="arrow" />
        </Link>
        {product.badges[0] ? (
          <span className="absolute bottom-12 left-5 rounded-full bg-cas-secondary px-3 py-1.5 text-xs font-extrabold text-cas-on-primary shadow-lg">
            {product.badges[0]}
          </span>
        ) : null}
      </div>

      <section className="relative z-10 -mt-7 rounded-t-[1.8rem] bg-cas-surface px-5 pt-7 md:-mt-10 md:mx-8 md:rounded-[1.8rem] md:px-8">
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
              Chi tiết món
            </p>
            <h1 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight md:text-3xl">
              {product.name}
            </h1>
          </div>
          <strong className="shrink-0 text-xl text-cas-primary md:text-2xl">
            {formatPrice(product.price)}
          </strong>
        </div>
        {product.description ? (
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cas-on-surface-variant md:text-base">
            {product.description}
          </p>
        ) : null}
        <div className="mt-7 border-t border-cas-outline-variant/45 pt-7">
          <ProductDetailForm
            basePrice={product.price}
            menuItemId={product.id}
            optionGroups={product.optionGroups}
            productName={product.name}
          />
        </div>
      </section>
    </main>
  );
}

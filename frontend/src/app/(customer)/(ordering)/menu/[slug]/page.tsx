import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CasIcon } from "../../../../../components/ui/cas-icon";
import { ProductDetailForm } from "./product-detail-form";

type ProductDetail = {
  badge?: string;
  basePrice: number;
  description: string;
  imageAlt: string;
  imageSrc: string;
  name: string;
  sizes?: { id: string; label: string; priceDelta: number }[];
  spiceLevels?: { id: string; label: string; priceDelta: number }[];
  toppings?: { id: string; label: string; priceDelta: number }[];
};

const spiceLevels = Array.from({ length: 8 }, (_, level) => ({
  id: `level-${level}`,
  label: `Cấp ${level}`,
  priceDelta: 0,
}));

const drinkSizes = [
  { id: "size-m", label: "Size M", priceDelta: 0 },
  { id: "size-l", label: "Size L", priceDelta: 10000 },
];

const drinkToppings = [
  { id: "black-pearl", label: "Trân châu đen", priceDelta: 8000 },
  { id: "white-pearl", label: "Trân châu trắng", priceDelta: 8000 },
  { id: "pudding", label: "Pudding trứng", priceDelta: 10000 },
  { id: "cheese-jelly", label: "Thạch phô mai", priceDelta: 10000 },
];

const products: Record<string, ProductDetail> = {
  "my-cay-dac-biet": {
    name: "Mỳ cay đặc biệt 7 cấp độ",
    description:
      "Sợi mỳ dai ngon quyện cùng nước dùng chua cay đậm đà, rau nấm và topping hấp dẫn.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay đặc biệt với rau nấm và nhiều topping",
    basePrice: 55000,
    badge: "Bán chạy",
    spiceLevels,
  },
  "my-cay-xuc-xich-pho-mai": {
    name: "Mỳ cay xúc xích phô mai",
    description:
      "Mỳ cay thơm béo với xúc xích, phô mai tan chảy, rau nấm và nước dùng đậm vị.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay xúc xích phủ phô mai",
    basePrice: 49000,
    badge: "Món mới",
    spiceLevels,
  },
  "my-cay-nam-rau-cu": {
    name: "Mỳ cay nấm rau củ",
    description:
      "Phiên bản thanh nhẹ với nhiều loại nấm, rau xanh và nước dùng chua cay vừa vị.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay nấm và rau củ",
    basePrice: 42000,
    spiceLevels,
  },
  "tra-sua-tran-chau-duong-den": {
    name: "Trà sữa Trân châu Đường đen",
    description:
      "Vị trà thơm dịu, sữa béo vừa phải cùng trân châu đường đen mềm dẻo.",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa trân châu đường đen mát lạnh",
    basePrice: 45000,
    badge: "Bán chạy",
    sizes: drinkSizes,
    toppings: drinkToppings,
  },
  "tra-sua-truyen-thong": {
    name: "Trà sữa truyền thống",
    description:
      "Trà đậm thơm kết hợp cùng sữa béo nhẹ, vị ngọt hài hòa và dễ uống.",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa truyền thống",
    basePrice: 35000,
    sizes: drinkSizes,
    toppings: drinkToppings,
  },
  "tra-sua-matcha": {
    name: "Trà sữa matcha",
    description:
      "Matcha thơm dịu hòa cùng sữa tươi và lớp kem béo mịn.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly trà sữa matcha xanh mát",
    basePrice: 42000,
    badge: "Món mới",
    sizes: drinkSizes,
    toppings: drinkToppings,
  },
  "ca-phe-sua-da": {
    name: "Cà phê sữa đá",
    description:
      "Cà phê rang đậm pha cùng sữa đặc, phục vụ với đá mát lạnh.",
    imageSrc: "/images/welcome/iced-coffee.jpg",
    imageAlt: "Ly cà phê sữa đá",
    basePrice: 29000,
    sizes: drinkSizes,
    toppings: drinkToppings,
  },
  "matcha-latte": {
    name: "Matcha latte",
    description:
      "Matcha thanh nhẹ kết hợp sữa tươi, tạo vị béo dịu và hậu vị thơm.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly matcha latte",
    basePrice: 39000,
    sizes: drinkSizes,
    toppings: drinkToppings,
  },
};

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const formatPrice = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = products[slug];

  if (!product) {
    return { title: "Không tìm thấy món | CAS" };
  }

  return {
    title: `${product.name} | CAS`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = products[slug];

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cas-surface pb-44 text-cas-on-surface transition-colors duration-200 md:pb-32">
      <main className="mx-auto w-full max-w-[75rem] pt-16 md:px-10 md:pt-20">
        <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[21/9] md:rounded-[1.6rem]">
          <Image
            className="object-cover"
            src={product.imageSrc}
            alt={product.imageAlt}
            fill
            loading="eager"
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
          {product.badge ? (
            <span className="absolute bottom-12 left-5 rounded-full bg-cas-secondary px-3 py-1.5 text-xs font-extrabold text-cas-on-primary shadow-lg">
              {product.badge}
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
              {formatPrice(product.basePrice)}
            </strong>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cas-on-surface-variant md:text-base">
            {product.description}
          </p>

          <div className="mt-7 border-t border-cas-outline-variant/45 pt-7">
            <ProductDetailForm
              basePrice={product.basePrice}
              productName={product.name}
              sizes={product.sizes}
              spiceLevels={product.spiceLevels}
              toppings={product.toppings}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

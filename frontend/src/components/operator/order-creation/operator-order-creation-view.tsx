"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { CategoryNavigation } from "../../../app/(customer)/(ordering)/menu/category-navigation";
import {
  AddToCartOptionDialog,
  type AddToCartPayload,
  type MenuOptionGroup,
} from "../../customer/add-to-cart-option-dialog";
import { CasIcon } from "../../ui/cas-icon";
import {
  type CartItem,
  OperatorCartPanel,
} from "./operator-cart-panel";
import {
  OperatorTableSelectModal,
  type TableOption,
} from "./operator-table-select-modal";

const categories = [
  { id: "mon-noi-bat", label: "Món nổi bật" },
  { id: "my-cay", label: "Mỳ cay" },
  { id: "ga-ran", label: "Gà rán" },
  { id: "tra-sua", label: "Trà sữa" },
  { id: "ca-phe", label: "Cà phê" },
  { id: "nuoc-giai-khat", label: "Nước giải khát" },
  { id: "an-vat", label: "Ăn vặt" },
];

const spiceLevels = Array.from({ length: 8 }, (_, level) => ({
  id: `level-${level}`,
  label: `Cấp ${level}`,
  priceDelta: 0,
}));

const drinkOptionGroups: MenuOptionGroup[] = [
  {
    id: "size",
    label: "Kích thước",
    selectionType: "SINGLE",
    options: [
      { id: "size-m", label: "Size M", priceDelta: 0 },
      { id: "size-l", label: "Size L", priceDelta: 10000 },
    ],
  },
  {
    id: "sweetness",
    label: "Độ ngọt",
    selectionType: "SINGLE",
    options: [
      { id: "sweetness-30", label: "30%", priceDelta: 0 },
      { id: "sweetness-50", label: "50%", priceDelta: 0 },
      { id: "sweetness-100", label: "100%", priceDelta: 0 },
    ],
  },
  {
    id: "toppings",
    label: "Topping",
    selectionType: "MULTIPLE",
    options: [
      { id: "black-pearl", label: "Trân châu đen", priceDelta: 8000 },
      { id: "white-pearl", label: "Trân châu trắng", priceDelta: 8000 },
      { id: "pudding", label: "Pudding trứng", priceDelta: 10000 },
      { id: "cheese-jelly", label: "Thạch phô mai", priceDelta: 10000 },
    ],
  },
];

type MenuItemData = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  price: string;
  basePrice: number;
  badges: string[];
  optionGroups?: MenuOptionGroup[];
};

const menuItems: MenuItemData[] = [
  {
    id: "my-cay-dac-biet",
    categoryId: "mon-noi-bat",
    name: "Mỳ cay đặc biệt 7 cấp độ",
    description:
      "Sợi mỳ dai ngon quyện cùng nước dùng chua cay đậm đà, rau nấm và topping hấp dẫn.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay đặc biệt với rau nấm và nhiều topping",
    price: "55.000đ",
    basePrice: 55000,
    badges: ["Bán chạy", "Cực cay"],
    optionGroups: [
      {
        id: "spice-level",
        label: "Cấp độ cay",
        selectionType: "SINGLE",
        options: spiceLevels,
      },
    ],
  },
  {
    id: "tra-sua-tran-chau-duong-den",
    categoryId: "mon-noi-bat",
    name: "Trà sữa Trân châu Đường đen",
    description:
      "Vị trà thơm dịu, sữa béo vừa phải cùng trân châu đường đen mềm dẻo.",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa trân châu đường đen mát lạnh",
    price: "45.000đ",
    basePrice: 45000,
    badges: [],
    optionGroups: drinkOptionGroups,
  },
  {
    id: "ga-ran-gion-rum-noi-bat",
    categoryId: "mon-noi-bat",
    name: "Gà rán giòn rụm",
    description:
      "Lớp vỏ vàng giòn, thịt gà mềm mọng, dùng kèm sốt cay đặc trưng của quán.",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Phần gà rán vàng giòn dùng kèm sốt cay",
    price: "35.000đ",
    basePrice: 35000,
    badges: [],
  },
  {
    id: "my-cay-xuc-xich-pho-mai",
    categoryId: "my-cay",
    name: "Mỳ cay xúc xích phô mai",
    description:
      "Mỳ cay thơm béo với xúc xích, phô mai tan chảy, rau nấm và nước dùng đậm vị.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay xúc xích phủ phô mai",
    price: "49.000đ",
    basePrice: 49000,
    badges: ["Món mới"],
    optionGroups: [
      {
        id: "spice-level",
        label: "Cấp độ cay",
        selectionType: "SINGLE",
        options: spiceLevels,
      },
    ],
  },
  {
    id: "my-cay-nam-rau-cu",
    categoryId: "my-cay",
    name: "Mỳ cay nấm rau củ",
    description:
      "Phiên bản thanh nhẹ với nhiều loại nấm, rau xanh và nước dùng chua cay vừa vị.",
    imageSrc: "/images/welcome/spicy-noodles.jpg",
    imageAlt: "Tô mỳ cay nấm và rau củ",
    price: "42.000đ",
    basePrice: 42000,
    badges: [],
    optionGroups: [
      {
        id: "spice-level",
        label: "Cấp độ cay",
        selectionType: "SINGLE",
        options: spiceLevels,
      },
    ],
  },
  {
    id: "ga-sot-cay-han-quoc",
    categoryId: "ga-ran",
    name: "Gà sốt cay Hàn Quốc",
    description:
      "Gà rán giòn áo sốt cay ngọt, phủ mè rang thơm và hành lá.",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Gà rán phủ sốt cay và mè rang",
    price: "39.000đ",
    basePrice: 39000,
    badges: ["Bán chạy"],
  },
  {
    id: "ga-popcorn-lac-pho-mai",
    categoryId: "ga-ran",
    name: "Gà popcorn lắc phô mai",
    description:
      "Gà viên nhỏ giòn tan, phủ bột phô mai đậm đà, tiện dùng cùng bạn bè.",
    imageSrc: "/images/welcome/fried-chicken.jpg",
    imageAlt: "Gà popcorn phủ bột phô mai",
    price: "32.000đ",
    basePrice: 32000,
    badges: [],
  },
  {
    id: "tra-sua-truyen-thong",
    categoryId: "tra-sua",
    name: "Trà sữa truyền thống",
    description:
      "Trà đậm thơm kết hợp cùng sữa béo nhẹ, vị ngọt hài hòa và dễ uống.",
    imageSrc: "/images/welcome/milk-tea.jpg",
    imageAlt: "Ly trà sữa truyền thống",
    price: "35.000đ",
    basePrice: 35000,
    badges: [],
    optionGroups: drinkOptionGroups,
  },
  {
    id: "tra-sua-matcha",
    categoryId: "tra-sua",
    name: "Trà sữa matcha",
    description:
      "Matcha thơm dịu hòa cùng sữa tươi và lớp kem béo mịn.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly trà sữa matcha xanh mát",
    price: "42.000đ",
    basePrice: 42000,
    badges: ["Món mới"],
    optionGroups: drinkOptionGroups,
  },
  {
    id: "ca-phe-sua-da",
    categoryId: "ca-phe",
    name: "Cà phê sữa đá",
    description:
      "Cà phê rang đậm pha cùng sữa đặc, phục vụ với đá mát lạnh.",
    imageSrc: "/images/welcome/iced-coffee.jpg",
    imageAlt: "Ly cà phê sữa đá",
    price: "29.000đ",
    basePrice: 29000,
    badges: [],
    optionGroups: drinkOptionGroups,
  },
  {
    id: "bac-xiu",
    categoryId: "ca-phe",
    name: "Bạc xỉu",
    description:
      "Vị sữa thơm béo nổi bật, điểm thêm cà phê nhẹ nhàng và đá lạnh.",
    imageSrc: "/images/welcome/iced-coffee.jpg",
    imageAlt: "Ly bạc xỉu mát lạnh",
    price: "32.000đ",
    basePrice: 32000,
    badges: [],
  },
  {
    id: "matcha-latte",
    categoryId: "nuoc-giai-khat",
    name: "Matcha latte",
    description:
      "Matcha thanh nhẹ kết hợp sữa tươi, tạo vị béo dịu và hậu vị thơm.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly matcha latte",
    price: "39.000đ",
    basePrice: 39000,
    badges: [],
    optionGroups: drinkOptionGroups,
  },
  {
    id: "nuoc-chanh-day",
    categoryId: "nuoc-giai-khat",
    name: "Nước chanh dây",
    description:
      "Chanh dây chua ngọt, thơm mát, thích hợp dùng cùng các món cay.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly nước giải khát mát lạnh",
    price: "25.000đ",
    basePrice: 25000,
    badges: [],
  },
  {
    id: "soda-dau",
    categoryId: "nuoc-giai-khat",
    name: "Soda dâu",
    description:
      "Soda mát lạnh hòa cùng vị dâu chua ngọt và hương thơm trái cây.",
    imageSrc: "/images/welcome/matcha-drink.jpg",
    imageAlt: "Ly soda trái cây mát lạnh",
    price: "29.000đ",
    basePrice: 29000,
    badges: [],
  },
  {
    id: "an-vat-thap-cam",
    categoryId: "an-vat",
    name: "Ăn vặt thập cẩm",
    description:
      "Phần ăn vặt gồm khoai tây chiên, cá viên và các món xiên chiên giòn.",
    imageSrc: "/images/welcome/street-snacks.jpg",
    imageAlt: "Phần ăn vặt thập cẩm với khoai tây và xiên chiên",
    price: "45.000đ",
    basePrice: 45000,
    badges: ["Đề xuất"],
  },
];

const mockActiveTables: TableOption[] = [
  {
    tableId: "table-01",
    code: 1,
    label: "Bàn 01",
    sessionStatus: "OPEN",
    customerName: "Minh Anh",
    customerPhone: "0912***456",
    activeOrderCount: 1,
  },
  {
    tableId: "table-02",
    code: 2,
    label: "Bàn 02",
    sessionStatus: "OPEN",
    customerName: "Hoàng Nam",
    customerPhone: "0988***123",
    activeOrderCount: 2,
  },
  {
    tableId: "table-05",
    code: 5,
    label: "Bàn 05",
    sessionStatus: "OPEN",
    customerName: "Khách lẻ",
    customerPhone: "0905***789",
    activeOrderCount: 0,
  },
  {
    tableId: "table-07",
    code: 7,
    label: "Bàn 07",
    sessionStatus: "OPEN",
    customerName: "Thu Hà",
    customerPhone: "0934***678",
    activeOrderCount: 1,
  },
  {
    tableId: "table-09",
    code: 9,
    label: "Bàn 09",
    sessionStatus: "OPEN",
    customerName: "Văn Hùng",
    customerPhone: "0971***999",
    activeOrderCount: 3,
  },
];

const formatPrice = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

type OrderSuccessData = {
  orderNumber: string;
  tableLabel: string;
  itemCount: number;
  totalAmount: number;
  orderNote?: string;
  createdAt: string;
};

type OperatorOrderCreationViewProps = {
  defaultTableId?: string;
};

export function OperatorOrderCreationView({
  defaultTableId = "table-05",
}: OperatorOrderCreationViewProps) {
  const [selectedTable, setSelectedTable] = useState<TableOption>(() => {
    const found = mockActiveTables.find((t) => t.tableId === defaultTableId);
    return found ?? mockActiveTables[2];
  });

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderNote, setOrderNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [successOrderData, setSuccessOrderData] =
    useState<OrderSuccessData | null>(null);

  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase().trim();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const totalCartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.quantity, 0),
    [cartItems],
  );

  const totalCartAmount = useMemo(
    () =>
      cartItems.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0,
      ),
    [cartItems],
  );

  const handleAddItemToCart = (item: MenuItemData, payload: AddToCartPayload) => {
    const cartItemId = `${item.id}-${payload.optionsSummary}`;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === cartItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          name: item.name,
          imageSrc: item.imageSrc,
          imageAlt: item.imageAlt,
          optionsSummary: payload.optionsSummary,
          unitPrice: payload.totalUnitPrice,
          quantity: 1,
        },
      ];
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null),
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    const newOrderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    setSuccessOrderData({
      orderNumber: newOrderNumber,
      tableLabel: selectedTable.label,
      itemCount: totalCartCount,
      totalAmount: totalCartAmount,
      orderNote: orderNote.trim() || undefined,
      createdAt: timeStr,
    });

    setIsSubmitting(false);
    setCartItems([]);
    setOrderNote("");
    setIsMobileDrawerOpen(false);
  };

  return (
    <div className="relative pb-24 lg:pb-0">
      {/* Top Header - No Breadcrumbs, Clean Context & Table Switch */}
      <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-cas-on-surface sm:text-3xl">
            Tạo order hộ tại bàn
          </h1>
          <p className="mt-1 text-xs text-cas-on-surface-variant">
            Chọn món từ thực đơn và gửi đơn vào hàng đợi chế biến của bếp
          </p>
        </div>

        {/* Selected Table Context Card */}
        <div className="flex items-center gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-2.5 shadow-sm sm:p-3">
          <span className="grid size-9 place-items-center rounded-xl bg-cas-secondary text-xs font-black text-cas-on-primary">
            {selectedTable.code}
          </span>
          <div className="pr-2">
            <p className="text-xs font-extrabold text-cas-on-surface">
              {selectedTable.label}
              {selectedTable.customerName ? ` (${selectedTable.customerName})` : ""}
            </p>
            <p className="text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-400">
              Phiên bàn đang mở
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsTableModalOpen(true)}
            className="rounded-xl bg-cas-secondary-container/30 px-3 py-1.5 text-xs font-extrabold text-cas-secondary transition hover:bg-cas-secondary-container/50 focus-visible:outline-2 focus-visible:outline-cas-focus-ring"
          >
            Chọn bàn khác
          </button>
        </div>
      </header>

      {/* Main Content Layout (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Menu Catalog (min-w-0 ensures no grid track overflow) */}
        <div className="min-w-0 space-y-4 lg:col-span-7 xl:col-span-8">
          {/* Search bar matching customer design */}
          <label className="relative block" htmlFor="menu-search">
            <span className="sr-only">Tìm kiếm món ăn</span>
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-cas-on-surface-variant">
              <CasIcon className="size-4.5" name="search" />
            </span>
            <input
              id="menu-search"
              type="text"
              className="h-12 w-full rounded-2xl border border-cas-outline-variant/40 bg-cas-surface-container pl-11 pr-4 text-sm text-cas-on-surface outline-none placeholder:text-cas-on-surface-variant/65 focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
              placeholder="Tìm kiếm món trong thực đơn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>

          {/* Sticky Category Navigation with Drag & Scroll-spy - Constrained in left column */}
          <CategoryNavigation
            categories={categories}
            className="w-full max-w-full rounded-2xl border border-cas-outline-variant/30 px-2 py-2.5 mt-2 mx-0 shadow-sm"
          />

          {/* Continuous Long Menu List divided by Categories */}
          <div className="mt-2" id="menu-list">
            {categories.map((category) => {
              const categoryItems = filteredMenuItems.filter(
                (item) => item.categoryId === category.id,
              );

              if (categoryItems.length === 0) return null;

              return (
                <section
                  className="scroll-mt-32 border-t border-cas-outline-variant/55 py-5 first:border-t-0 md:py-6"
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

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {categoryItems.map((item, itemIndex) => (
                      <article
                        className="grid grid-cols-[7.25rem_1fr] gap-4 rounded-[1.2rem] bg-cas-surface-container p-3 shadow-[0_5px_18px_var(--cas-shadow-color)] md:p-4"
                        key={item.id}
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
                            <div className="absolute top-2 left-2 flex flex-wrap items-start gap-1">
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
                            {item.name}
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
                              itemName={item.name}
                              optionGroups={item.optionGroups}
                              onAddToCart={(payload) =>
                                handleAddItemToCart(item, payload)
                              }
                            />
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Right Column: Persistent Cart Panel on Desktop */}
        <aside className="hidden lg:col-span-5 lg:block xl:col-span-4">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)]">
            <OperatorCartPanel
              selectedTable={selectedTable}
              cartItems={cartItems}
              orderNote={orderNote}
              isSubmitting={isSubmitting}
              onChangeTableClick={() => setIsTableModalOpen(true)}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onOrderNoteChange={setOrderNote}
              onSubmitOrder={handleSubmitOrder}
            />
          </div>
        </aside>
      </div>

      {/* Mobile Floating Bottom Bar - Matching Customer Menu */}
      <div className="fixed inset-x-5 bottom-6 z-40 mx-auto max-w-[34rem] lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex min-h-15 w-full items-center justify-between rounded-2xl bg-cas-primary px-5 text-left text-cas-on-primary shadow-[0_12px_30px_var(--cas-shadow-color)] transition hover:bg-cas-primary-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
        >
          <span className="inline-flex items-center gap-3 font-extrabold">
            <span className="grid size-9 place-items-center rounded-full bg-white/15">
              <CasIcon className="size-5" name="basket" />
            </span>
            Xem món đã chọn
          </span>
          <span className="text-xs font-semibold">
            {totalCartCount} món • {formatPrice(totalCartAmount)}
          </span>
        </button>
      </div>

      {/* Mobile Cart Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-cas-on-surface/60 backdrop-blur-xs lg:hidden">
          <div
            className="flex-1"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="max-h-[85vh] overflow-hidden rounded-t-[2rem] bg-cas-surface shadow-2xl">
            <OperatorCartPanel
              selectedTable={selectedTable}
              cartItems={cartItems}
              orderNote={orderNote}
              isSubmitting={isSubmitting}
              onChangeTableClick={() => {
                setIsMobileDrawerOpen(false);
                setIsTableModalOpen(true);
              }}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onOrderNoteChange={setOrderNote}
              onSubmitOrder={handleSubmitOrder}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Table Selector Modal */}
      <OperatorTableSelectModal
        isOpen={isTableModalOpen}
        tables={mockActiveTables}
        currentTableId={selectedTable.tableId}
        onClose={() => setIsTableModalOpen(false)}
        onSelectTable={(table) => {
          setSelectedTable(table);
          setIsTableModalOpen(false);
        }}
      />

      {/* Order Success Dialog */}
      {successOrderData && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-cas-on-surface/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-[1.6rem] bg-cas-surface p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CasIcon className="size-8" name="checked" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-cas-on-surface">
                Tạo order thành công!
              </h3>
              <p className="mt-1 text-xs text-cas-on-surface-variant">
                Đơn đã được thêm vào hàng đợi chế biến FIFO của Bếp
              </p>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl border border-cas-outline-variant/30 bg-cas-surface-container p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-cas-on-surface-variant">Mã đơn:</span>
                <span className="font-mono font-bold text-cas-on-surface">
                  {successOrderData.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cas-on-surface-variant">Bàn phục vụ:</span>
                <span className="font-bold text-cas-on-surface">
                  {successOrderData.tableLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cas-on-surface-variant">Số lượng:</span>
                <span className="font-bold text-cas-on-surface">
                  {successOrderData.itemCount} món
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cas-on-surface-variant">Thời gian:</span>
                <span className="font-bold text-cas-on-surface">
                  {successOrderData.createdAt}
                </span>
              </div>
              {successOrderData.orderNote && (
                <div className="border-t border-cas-outline-variant/20 pt-2 text-left">
                  <span className="text-cas-on-surface-variant">Ghi chú: </span>
                  <span className="font-medium text-cas-on-surface">
                    &ldquo;{successOrderData.orderNote}&rdquo;
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-cas-outline-variant/20 pt-2 text-sm font-extrabold">
                <span>Tổng tiền:</span>
                <span className="text-cas-primary">
                  {formatPrice(successOrderData.totalAmount)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSuccessOrderData(null)}
              className="mt-5 w-full rounded-xl bg-cas-primary py-3 text-center text-sm font-extrabold text-cas-on-primary shadow-md transition hover:bg-cas-primary-hover focus-visible:outline-2 focus-visible:outline-cas-focus-ring"
            >
              Tiếp tục tạo order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

type PromotionStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
type PromotionType = "PERCENT_OFF" | "FIXED_AMOUNT_OFF" | "ITEM_PERCENT_OFF" | "ITEM_FIXED_OFF";
type TargetType = "MENU_ITEM" | "CATEGORY";

type PromotionTarget = {
  id: string;
  targetType: TargetType;
  targetId: string;
};

type PromotionRedemption = {
  id: string;
  customerName: string;
  amount: number;
  paidAt: string;
  status: "COMPLETED" | "REVERSED";
};

type Promotion = {
  id: string;
  name: string;
  code: string;
  promotionType: PromotionType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minBillAmount: number | null;
  maxRedemptions: number | null;
  maxRedemptionsPerCustomer: number | null;
  status: PromotionStatus;
  startAt: string;
  endAt: string;
  targets: PromotionTarget[];
  redemptions: PromotionRedemption[];
};

type PromotionForm = Omit<Promotion, "id" | "redemptions">;

const menuItems = [
  { id: "mi-1", name: "Mỳ cay hải sản", category: "Mỳ cay" },
  { id: "mi-2", name: "Gà rán sốt cay", category: "Đồ ăn vặt" },
  { id: "mi-3", name: "Trà sữa trân châu", category: "Đồ uống" },
  { id: "mi-4", name: "Khoai tây lắc", category: "Đồ ăn vặt" },
];

const categories = [
  { id: "cat-1", name: "Mỳ cay" },
  { id: "cat-2", name: "Đồ ăn vặt" },
  { id: "cat-3", name: "Đồ uống" },
];

const mockPromotions: Promotion[] = [
  {
    id: "promo-1",
    name: "Mùa hè giảm 50.000đ",
    code: "SUMMER50K",
    promotionType: "FIXED_AMOUNT_OFF",
    discountValue: 50000,
    maxDiscountAmount: null,
    minBillAmount: 200000,
    maxRedemptions: 100,
    maxRedemptionsPerCustomer: 1,
    status: "ACTIVE",
    startAt: "2026-08-01",
    endAt: "2026-08-31",
    targets: [],
    redemptions: [
      {
        id: "red-1",
        customerName: "Nguyễn Minh Anh",
        amount: 50000,
        paidAt: "10/08/2026 19:20",
        status: "COMPLETED",
      },
      {
        id: "red-2",
        customerName: "Trần Quốc Bảo",
        amount: 50000,
        paidAt: "09/08/2026 18:42",
        status: "COMPLETED",
      },
    ],
  },
  {
    id: "promo-2",
    name: "Ưu đãi đồ uống buổi chiều",
    code: "",
    promotionType: "ITEM_PERCENT_OFF",
    discountValue: 15,
    maxDiscountAmount: 100000,
    minBillAmount: null,
    maxRedemptions: 50,
    maxRedemptionsPerCustomer: 2,
    status: "ACTIVE",
    startAt: "2026-08-01",
    endAt: "2026-09-30",
    targets: [{ id: "target-1", targetType: "CATEGORY", targetId: "cat-3" }],
    redemptions: [
      {
        id: "red-3",
        customerName: "Lê Thu Hà",
        amount: 24000,
        paidAt: "10/08/2026 15:10",
        status: "COMPLETED",
      },
    ],
  },
  {
    id: "promo-3",
    name: "Kích hoạt khách mới",
    code: "WELCOME10K",
    promotionType: "FIXED_AMOUNT_OFF",
    discountValue: 10000,
    maxDiscountAmount: null,
    minBillAmount: 50000,
    maxRedemptions: null,
    maxRedemptionsPerCustomer: 1,
    status: "DRAFT",
    startAt: "",
    endAt: "",
    targets: [],
    redemptions: [],
  },
  {
    id: "promo-4",
    name: "Tri ân khách hàng thân thiết",
    code: "VIPMEMBER",
    promotionType: "PERCENT_OFF",
    discountValue: 10,
    maxDiscountAmount: 50000,
    minBillAmount: 100000,
    maxRedemptions: null,
    maxRedemptionsPerCustomer: null,
    status: "ACTIVE",
    startAt: "2026-08-01",
    endAt: "",
    targets: [],
    redemptions: [],
  },
];

const typeLabels: Record<PromotionType, string> = {
  PERCENT_OFF: "Giảm % toàn bill",
  FIXED_AMOUNT_OFF: "Giảm tiền toàn bill",
  ITEM_PERCENT_OFF: "Giảm % món áp dụng",
  ITEM_FIXED_OFF: "Giảm tiền món áp dụng",
};

const statusLabels: Record<PromotionStatus, string> = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng áp dụng",
};

const emptyForm = (): PromotionForm => ({
  name: "",
  code: "",
  promotionType: "FIXED_AMOUNT_OFF",
  discountValue: 20000,
  maxDiscountAmount: null,
  minBillAmount: null,
  maxRedemptions: null,
  maxRedemptionsPerCustomer: 1,
  status: "DRAFT",
  startAt: "",
  endAt: "",
  targets: [],
});

function formatMoney(value: number | null) {
  if (value === null) return "Không giới hạn";
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatValidity(startAt: string, endAt: string) {
  if (!startAt && !endAt) return "Vô thời hạn";
  if (startAt && !endAt) return `Từ ${startAt} → ∞`;
  if (!startAt && endAt) return `Đến ${endAt}`;
  return `${startAt} → ${endAt}`;
}

function getTargetLabel(target: PromotionTarget) {
  const source = target.targetType === "MENU_ITEM" ? menuItems : categories;
  return source.find((item) => item.id === target.targetId)?.name ?? "Đã ngừng áp dụng";
}

function getCompletedRedemptions(promotion: Promotion) {
  return promotion.redemptions.filter((r) => r.status === "COMPLETED").length;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PromotionForm>(emptyForm);
  const [statusFilter, setStatusFilter] = useState<"ALL" | PromotionStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | PromotionType>("ALL");
  const [search, setSearch] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<{
    action: "save" | "status";
    promotionId?: string;
    promotionName?: string;
    nextStatus?: PromotionStatus;
  } | null>(null);
  const [selectedRedemptionPromo, setSelectedRedemptionPromo] = useState<Promotion | null>(null);
  const [targetType, setTargetType] = useState<TargetType>("MENU_ITEM");
  const [targetId, setTargetId] = useState(menuItems[0].id);

  const filteredPromotions = useMemo(
    () =>
      promotions.filter((promotion) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          promotion.name.toLowerCase().includes(normalizedSearch) ||
          promotion.code.toLowerCase().includes(normalizedSearch);
        const matchesStatus = statusFilter === "ALL" || promotion.status === statusFilter;
        const matchesType = typeFilter === "ALL" || promotion.promotionType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      }),
    [promotions, search, statusFilter, typeFilter],
  );

  const updateForm = <K extends keyof PromotionForm>(key: K, value: PromotionForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm());
    setTargetType("MENU_ITEM");
    setTargetId(menuItems[0].id);
    setShowForm(true);
  };

  const openEditForm = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setForm({
      name: promotion.name,
      code: promotion.code,
      promotionType: promotion.promotionType,
      discountValue: promotion.discountValue,
      maxDiscountAmount: promotion.maxDiscountAmount,
      minBillAmount: promotion.minBillAmount,
      maxRedemptions: promotion.maxRedemptions,
      maxRedemptionsPerCustomer: promotion.maxRedemptionsPerCustomer,
      status: promotion.status,
      startAt: promotion.startAt,
      endAt: promotion.endAt,
      targets: promotion.targets.map((t) => ({ ...t })),
    });
    setTargetType("MENU_ITEM");
    setTargetId(menuItems[0].id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const addTarget = () => {
    const exists = form.targets.some((t) => t.targetType === targetType && t.targetId === targetId);
    if (exists) return;
    setForm((current) => ({
      ...current,
      targets: [...current.targets, { id: `target-${Date.now()}`, targetType, targetId }],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || form.discountValue <= 0) return;
    setConfirmTarget({ action: "save" });
  };

  const nextStatus = (status: PromotionStatus): PromotionStatus => {
    if (status === "DRAFT") return "ACTIVE";
    if (status === "ACTIVE") return "INACTIVE";
    return "ACTIVE";
  };

  const requestStatusChange = (promotion: Promotion) => {
    setConfirmTarget({
      action: "status",
      promotionId: promotion.id,
      promotionName: promotion.name,
      nextStatus: nextStatus(promotion.status),
    });
  };

  const updateStatus = (id: string) => {
    setPromotions((current) =>
      current.map((p) => (p.id === id ? { ...p, status: nextStatus(p.status) } : p)),
    );
  };

  const handleConfirm = () => {
    if (!confirmTarget) return;
    if (confirmTarget.action === "save") {
      const trimmed = form.name.trim();
      const normalized = { ...form, name: trimmed, code: form.code.trim().toUpperCase() };
      if (editingId) {
        setPromotions((current) =>
          current.map((p) =>
            p.id === editingId ? { ...p, ...normalized, redemptions: p.redemptions } : p,
          ),
        );
      } else {
        setPromotions((current) => [
          { ...normalized, id: `promo-${Date.now()}`, redemptions: [] },
          ...current,
        ]);
      }
      setConfirmTarget(null);
      closeForm();
    } else if (confirmTarget.action === "status" && confirmTarget.promotionId) {
      updateStatus(confirmTarget.promotionId);
      setConfirmTarget(null);
    }
  };

  const targetOptions = targetType === "MENU_ITEM" ? menuItems : categories;
  const typeUsesPercent =
    form.promotionType === "PERCENT_OFF" || form.promotionType === "ITEM_PERCENT_OFF";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">
            Quản lý chương trình khuyến mãi
          </h1>
          <p className="mt-1 max-w-3xl text-xs font-medium leading-5 text-cas-on-surface-variant">
            Mỗi promotion có một mã nhập duy nhất. Khách nhập đúng mã mới được áp dụng. Mỗi bill
            hiện chỉ dùng tối đa một promotion.
          </p>
        </div>
        <CasButton onClick={openCreateForm} icon="plus" variant="primary" size="md">
          Tạo promotion
        </CasButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-cas-outline-variant/25 bg-cas-glass p-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <CasIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cas-on-surface-variant"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã promotion..."
            className="w-full rounded-xl border border-cas-outline-variant/35 bg-cas-surface py-2 pl-9 pr-3 text-xs font-semibold text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "ALL" | PromotionStatus)}
          className="rounded-xl border border-cas-outline-variant/35 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="INACTIVE">Ngừng áp dụng</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "ALL" | PromotionType)}
          className="rounded-xl border border-cas-outline-variant/35 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
        >
          <option value="ALL">Tất cả loại giảm</option>
          {Object.entries(typeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Promotion cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredPromotions.map((promotion) => {
          const completed = getCompletedRedemptions(promotion);
          const quotaReached =
            promotion.maxRedemptions !== null && completed >= promotion.maxRedemptions;
          const statusTone =
            promotion.status === "ACTIVE"
              ? "bg-cas-secondary/15 text-cas-secondary"
              : promotion.status === "DRAFT"
                ? "bg-cas-tertiary/15 text-cas-tertiary"
                : "bg-cas-on-surface-variant/15 text-cas-on-surface-variant";
          return (
            <article
              key={promotion.id}
              className={`rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs ${promotion.status !== "ACTIVE" || quotaReached ? "opacity-85" : ""}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-cas-primary">
                    {typeLabels[promotion.promotionType]}
                  </p>
                  <h2 className="mt-1 text-lg font-black text-cas-on-surface">{promotion.name}</h2>
                  <p className="mt-1 text-xs font-medium text-cas-on-surface-variant">
                    {promotion.targets.length === 0
                      ? "Áp dụng toàn bill"
                      : `Áp dụng: ${promotion.targets.map(getTargetLabel).join(", ")}`}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[0.65rem] font-black ${statusTone}`}
                >
                  {quotaReached ? "ĐÃ HẾT LƯỢT DÙNG" : statusLabels[promotion.status].toUpperCase()}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 border-y border-cas-outline-variant/20 py-3 text-xs">
                <div>
                  <p className="text-cas-on-surface-variant">Mức giảm</p>
                  <p className="mt-0.5 font-black text-cas-on-surface">
                    {promotion.promotionType.includes("PERCENT")
                      ? `${promotion.discountValue}%`
                      : formatMoney(promotion.discountValue)}
                  </p>
                </div>
                <div>
                  <p className="text-cas-on-surface-variant">Giảm tối đa</p>
                  <p className="mt-0.5 font-black text-cas-on-surface">
                    {typeUsesPercentFor(promotion)
                      ? formatMoney(promotion.maxDiscountAmount)
                      : "Không áp dụng"}
                  </p>
                </div>
                <div>
                  <p className="text-cas-on-surface-variant">Điều kiện</p>
                  <p className="mt-0.5 font-bold text-cas-on-surface">
                    {promotion.minBillAmount !== null
                      ? `Bill từ ${formatMoney(promotion.minBillAmount)}`
                      : "Không yêu cầu"}
                  </p>
                </div>
                <div>
                  <p className="text-cas-on-surface-variant">Hiệu lực</p>
                  <p className="mt-0.5 font-bold text-cas-on-surface">
                    {formatValidity(promotion.startAt, promotion.endAt)}
                  </p>
                </div>
              </div>

              {/* Single code badge */}
              <div className="mt-3">
                {promotion.code ? (
                  <span className="rounded-lg bg-cas-primary/10 px-2.5 py-1 text-[0.65rem] font-black tracking-widest text-cas-primary">
                    {promotion.code}
                  </span>
                ) : (
                  <span className="rounded-lg bg-cas-primary/8 px-2 py-1 text-[0.65rem] font-bold text-cas-primary">
                    Không yêu cầu mã
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-cas-outline-variant/20 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.7rem] font-bold text-cas-on-surface-variant">
                  Lượt dùng:{" "}
                  <span className="text-cas-on-surface">
                    {completed}/{promotion.maxRedemptions ?? "∞"}
                  </span>{" "}
                  · Tối đa/khách:{" "}
                  <span className="text-cas-on-surface">
                    {promotion.maxRedemptionsPerCustomer ?? "∞"}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRedemptionPromo(promotion)}
                    className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-cas-primary hover:bg-cas-primary/10 transition-colors"
                  >
                    Lịch sử dùng ({promotion.redemptions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditForm(promotion)}
                    className="rounded-xl px-3 py-1.5 text-xs font-black text-cas-on-surface hover:bg-cas-on-surface/5"
                  >
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    onClick={() => requestStatusChange(promotion)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black ${promotion.status === "ACTIVE" ? "bg-cas-error/10 text-cas-error hover:bg-cas-error/20" : "bg-cas-secondary/10 text-cas-secondary hover:bg-cas-secondary/20"}`}
                  >
                    {promotion.status === "ACTIVE"
                      ? "Ngừng"
                      : promotion.status === "DRAFT"
                        ? "Phát hành"
                        : "Kích hoạt"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="rounded-3xl border border-dashed border-cas-outline-variant/45 bg-cas-glass px-6 py-12 text-center text-sm font-bold text-cas-on-surface-variant">
          Không tìm thấy promotion phù hợp.
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="my-auto w-full max-w-5xl space-y-5 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-2xl sm:p-6"
          >
            {/* Form header */}
            <div className="flex items-start justify-between gap-4 border-b border-cas-outline-variant/20 pb-4">
              <h3 className="text-lg font-black text-cas-on-surface">
                {editingId ? "Cập nhật promotion" : "Tạo promotion mới"}
              </h3>
              <button
                type="button"
                onClick={closeForm}
                className="grid size-9 place-items-center rounded-xl text-cas-on-surface-variant hover:bg-cas-on-surface/5"
                aria-label="Đóng"
              >
                <CasIcon name="close" className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Section 1: Thông tin & giá trị */}
              <section className="space-y-4">
                <FormTitle icon="sparkle" title="Thông tin & giá trị giảm" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Tên chương trình" className="sm:col-span-2">
                    <input
                      required
                      value={form.name}
                      onChange={(e) => updateForm("name", e.target.value)}
                      placeholder="VD: Mùa hè giảm 50.000đ"
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Mã khuyến mãi" className="sm:col-span-2">
                    <input
                      value={form.code}
                      onChange={(e) => updateForm("code", e.target.value.toUpperCase())}
                      placeholder="VD: SUMMER50K (để trống nếu không cần mã)"
                      className={inputClass}
                      maxLength={50}
                    />
                  </Field>
                  <Field label="Loại promotion">
                    <select
                      value={form.promotionType}
                      onChange={(e) => updateForm("promotionType", e.target.value as PromotionType)}
                      className={inputClass}
                    >
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={typeUsesPercent ? "Tỷ lệ giảm (%)" : "Giá trị giảm (VNĐ)"}>
                    {typeUsesPercent ? (
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={form.discountValue || ""}
                        onChange={(e) => updateForm("discountValue", Number(e.target.value))}
                        placeholder="VD: 15"
                        className={inputClass}
                      />
                    ) : (
                      <MoneyInput
                        required
                        value={form.discountValue}
                        onChange={(v) => updateForm("discountValue", v ?? 0)}
                        placeholder="VD: 50,000"
                      />
                    )}
                  </Field>
                  {typeUsesPercent && (
                    <Field label="Giảm tối đa (VNĐ)">
                      <MoneyInput
                        value={form.maxDiscountAmount}
                        onChange={(v) => updateForm("maxDiscountAmount", v)}
                        placeholder="Không giới hạn"
                      />
                    </Field>
                  )}
                </div>
              </section>

              {/* Section 2: Điều kiện áp dụng */}
              <section className="space-y-4">
                <FormTitle icon="settings" title="Điều kiện áp dụng" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Bill tối thiểu (VNĐ)">
                    <MoneyInput
                      value={form.minBillAmount}
                      onChange={(v) => updateForm("minBillAmount", v)}
                      placeholder="Không yêu cầu"
                    />
                  </Field>
                  <Field label="Số lượt dùng tối đa">
                    <OptionalNumberInput
                      value={form.maxRedemptions}
                      onChange={(v) => updateForm("maxRedemptions", v)}
                      placeholder="Không giới hạn"
                    />
                  </Field>
                  <Field label="Bắt đầu">
                    <input
                      type="datetime-local"
                      value={form.startAt}
                      onChange={(e) => updateForm("startAt", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Kết thúc">
                    <input
                      type="datetime-local"
                      value={form.endAt}
                      onChange={(e) => updateForm("endAt", e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Số lượt dùng tối đa / khách">
                    <OptionalNumberInput
                      value={form.maxRedemptionsPerCustomer}
                      onChange={(v) => updateForm("maxRedemptionsPerCustomer", v)}
                      placeholder="Không giới hạn"
                    />
                  </Field>
                  <Field label="Trạng thái">
                    <select
                      value={form.status}
                      onChange={(e) => updateForm("status", e.target.value as PromotionStatus)}
                      className={inputClass}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>
            </div>

            {/* Section 3: Phạm vi áp dụng */}
            <section className="space-y-3 rounded-2xl border border-cas-outline-variant/25 p-4">
              <FormTitle icon="menu" title="Phạm vi áp dụng" />
              <p className="text-[0.7rem] text-cas-on-surface-variant">
                Không chọn target nghĩa là áp dụng trên toàn bill.
              </p>
              {form.promotionType.startsWith("ITEM_") && form.targets.length === 0 && (
                <p className="rounded-xl bg-cas-tertiary/10 p-2.5 text-xs font-bold text-cas-tertiary">
                  ⚠️ Loại ưu đãi này áp dụng theo món/danh mục (`ITEM_...`). Vui lòng chọn ít nhất 1
                  món ăn hoặc danh mục bên dưới.
                </p>
              )}
              <div className="flex gap-2">
                <select
                  value={targetType}
                  onChange={(e) => {
                    const next = e.target.value as TargetType;
                    setTargetType(next);
                    setTargetId((next === "MENU_ITEM" ? menuItems : categories)[0].id);
                  }}
                  className={inputClass}
                >
                  <option value="MENU_ITEM">Món ăn</option>
                  <option value="CATEGORY">Danh mục</option>
                </select>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className={inputClass}
                >
                  {targetOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <CasButton type="button" onClick={addTarget} variant="outline-primary" size="sm">
                  Thêm
                </CasButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.targets.map((target) => (
                  <span
                    key={target.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-cas-primary/10 px-2 py-1 text-[0.65rem] font-bold text-cas-primary"
                  >
                    {target.targetType === "MENU_ITEM" ? "Món:" : "Danh mục:"}{" "}
                    {getTargetLabel(target)}
                    <button
                      type="button"
                      onClick={() =>
                        updateForm(
                          "targets",
                          form.targets.filter((t) => t.id !== target.id),
                        )
                      }
                      className="ml-0.5 text-cas-primary hover:text-cas-error"
                      aria-label="Xóa target"
                    >
                      <CasIcon name="close" className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </section>

            {/* Form footer */}
            <div className="flex justify-end gap-2 border-t border-cas-outline-variant/20 pt-4">
              <CasButton type="button" onClick={closeForm} variant="outline" size="sm">
                Hủy
              </CasButton>
              <CasButton type="submit" variant="primary" size="sm">
                {form.status === "ACTIVE" ? "Lưu & phát hành" : "Lưu promotion"}
              </CasButton>
            </div>
          </form>
        </div>
      )}

      {/* Confirm dialog */}
      {confirmTarget &&
        (() => {
          const isSave = confirmTarget.action === "save";
          const isDeactivate = confirmTarget.nextStatus === "INACTIVE";
          return (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setConfirmTarget(null)}
              />
              <div className="relative z-10 w-full max-w-sm rounded-2xl border border-cas-outline-variant/25 bg-cas-surface p-6 shadow-2xl">
                <div className="mb-1 flex items-center gap-3">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl text-white ${
                      isSave ? "bg-cas-primary" : isDeactivate ? "bg-cas-error" : "bg-cas-secondary"
                    }`}
                  >
                    <CasIcon
                      name={isSave ? "check" : isDeactivate ? "close" : "sparkle"}
                      className="size-5"
                    />
                  </span>
                  <h2 className="text-base font-black text-cas-on-surface">
                    {isSave
                      ? editingId
                        ? "Xác nhận cập nhật"
                        : "Xác nhận tạo mới"
                      : isDeactivate
                        ? "Xác nhận ngừng áp dụng"
                        : "Xác nhận kích hoạt"}
                  </h2>
                </div>
                <p className="mb-6 mt-3 text-xs font-medium leading-5 text-cas-on-surface-variant">
                  {isSave
                    ? editingId
                      ? `Bạn có chắc muốn lưu thay đổi cho promotion "${form.name.trim()}"?`
                      : `Bạn có chắc muốn tạo promotion "${form.name.trim()}"?`
                    : isDeactivate
                      ? `Bạn có chắc muốn ngừng áp dụng promotion "${confirmTarget.promotionName}"?`
                      : `Bạn có chắc muốn kích hoạt promotion "${confirmTarget.promotionName}"?`}
                </p>
                <div className="flex justify-end gap-2">
                  <CasButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmTarget(null)}
                  >
                    Hủy
                  </CasButton>
                  <CasButton
                    type="button"
                    size="sm"
                    variant={isDeactivate ? "danger" : "primary"}
                    onClick={handleConfirm}
                  >
                    {isSave
                      ? form.status === "ACTIVE"
                        ? "Lưu & phát hành"
                        : "Xác nhận lưu"
                      : isDeactivate
                        ? "Ngừng áp dụng"
                        : "Kích hoạt"}
                  </CasButton>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Redemptions list modal */}
      {selectedRedemptionPromo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setSelectedRedemptionPromo(null)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <div>
                <h3 className="text-base font-black text-cas-on-surface">
                  Lịch sử sử dụng: {selectedRedemptionPromo.name}
                </h3>
                <p className="text-xs font-medium text-cas-on-surface-variant">
                  Mã: {selectedRedemptionPromo.code || "Không dùng mã"} · Tổng lượt dùng:{" "}
                  {selectedRedemptionPromo.redemptions.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRedemptionPromo(null)}
                className="grid size-8 place-items-center rounded-xl text-cas-on-surface-variant hover:bg-cas-on-surface/5"
                aria-label="Đóng modal lịch sử sử dụng"
              >
                <CasIcon name="close" className="size-5" />
              </button>
            </div>

            {selectedRedemptionPromo.redemptions.length === 0 ? (
              <p className="py-8 text-center text-xs font-bold text-cas-on-surface-variant">
                Chưa có khách hàng nào sử dụng chương trình này.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto rounded-2xl border border-cas-outline-variant/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cas-surface/80 text-cas-on-surface-variant">
                    <tr>
                      <th className="p-3 font-bold">Khách hàng</th>
                      <th className="p-3 font-bold">Số tiền giảm</th>
                      <th className="p-3 font-bold">Thời gian thanh toán</th>
                      <th className="p-3 font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cas-outline-variant/15 text-cas-on-surface">
                    {selectedRedemptionPromo.redemptions.map((red) => (
                      <tr key={red.id} className="hover:bg-cas-on-surface/5">
                        <td className="p-3 font-bold">{red.customerName}</td>
                        <td className="p-3 font-black text-cas-primary">
                          {formatMoney(red.amount)}
                        </td>
                        <td className="p-3 font-medium text-cas-on-surface-variant">
                          {red.paidAt}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block rounded-md px-2 py-0.5 text-[0.65rem] font-bold ${
                              red.status === "COMPLETED"
                                ? "bg-cas-secondary/15 text-cas-secondary"
                                : "bg-cas-error/15 text-cas-error"
                            }`}
                          >
                            {red.status === "COMPLETED" ? "Hoàn thành" : "Đã hoàn trả (Reversed)"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <CasButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedRedemptionPromo(null)}
              >
                Đóng
              </CasButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-cas-outline-variant/35 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary";

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[0.7rem] font-bold text-cas-on-surface-variant">
        {label}
      </span>
      {children}
    </label>
  );
}

function FormTitle({
  icon,
  title,
}: {
  icon: "sparkle" | "settings" | "menu" | "bill";
  title: string;
}) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-black text-cas-on-surface">
      <CasIcon name={icon} className="size-4 text-cas-primary" />
      {title}
    </h4>
  );
}

function OptionalNumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      min="0"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function MoneyInput({
  value,
  onChange,
  placeholder,
  required = false,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  required?: boolean;
}) {
  const displayValue =
    value !== null && value !== undefined && !isNaN(value) ? value.toLocaleString("en-US") : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "").replace(/\D/g, "");
    if (raw === "") {
      onChange(null);
    } else {
      const num = Number(raw);
      onChange(isNaN(num) ? null : num);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      required={required}
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={inputClass}
    />
  );
}

function typeUsesPercentFor(promotion: Promotion) {
  return (
    promotion.promotionType === "PERCENT_OFF" || promotion.promotionType === "ITEM_PERCENT_OFF"
  );
}

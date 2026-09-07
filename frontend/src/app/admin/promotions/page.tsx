"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";
import { loadAdminCatalog } from "../../../lib/api/catalog/catalog.api";
import {
  createPromotion,
  loadAdminPromotions,
  loadPromotionRedemptions,
  type PromotionRedemption as PromotionRedemptionResponse,
  updatePromotion,
  updatePromotionStatus,
} from "../../../lib/api/promotion/promotion.api";

type PromotionStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
type PromotionType = "PERCENT_OFF" | "FIXED_AMOUNT_OFF" | "ITEM_PERCENT_OFF" | "ITEM_FIXED_OFF";
type TargetType = "MENU_ITEM" | "CATEGORY";

type PromotionTarget = {
  id: string;
  targetType: TargetType;
  targetId: string;
};

type PromotionRedemptionPreview = {
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
  completedRedemptionCount: number;
  redemptions: PromotionRedemptionPreview[];
};

type PromotionForm = Omit<Promotion, "id" | "redemptions" | "completedRedemptionCount">;

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
    completedRedemptionCount: 2,
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
    completedRedemptionCount: 1,
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
    completedRedemptionCount: 0,
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
    completedRedemptionCount: 0,
    redemptions: [],
  },
];

void mockPromotions;

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

function getCompletedRedemptions(promotion: Promotion) {
  return promotion.completedRedemptionCount;
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
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
  const [redemptionHistory, setRedemptionHistory] = useState<{
    promotion: Promotion;
    items: PromotionRedemptionResponse[];
    total: number;
    page: number;
    size: number;
    loading: boolean;
  } | null>(null);
  const [targetType, setTargetType] = useState<TargetType | "">("");
  const [targetId, setTargetId] = useState("");
  const [catalogMenuItems, setCatalogMenuItems] = useState(menuItems);
  const [catalogCategories, setCatalogCategories] = useState(categories);

  useEffect(() => {
    void loadAdminPromotions()
      .then((items) => {
        setPromotions(
          items.map((item) => ({
            ...item.promotion,
            id: item.promotion.publicId,
            code: item.codes
              .map(
                (code) =>
                  `${code.code}${code.maxRedemptions === null ? "" : `:${code.maxRedemptions}`}`,
              )
              .join(", "),
            startAt: item.promotion.startAt?.slice(0, 16) ?? "",
            endAt: item.promotion.endAt?.slice(0, 16) ?? "",
            targets: item.targets.map((target) => ({
              id: String(target.id),
              targetType: target.targetType,
              targetId: String(target.targetId),
            })),
            completedRedemptionCount: item.completedRedemptionCount,
            redemptions: [],
          })),
        );
        setApiError(null);
      })
      .catch((cause) =>
        setApiError(cause instanceof Error ? cause.message : "Không thể tải khuyến mãi."),
      );
  }, []);

  useEffect(() => {
    void loadAdminCatalog()
      .then((catalog) => {
        const nextItems = catalog.items.map((item) => ({
          id: String(item.id),
          name: item.name,
          category: "",
        }));
        const nextCategories = catalog.categories.map((category) => ({
          id: String(category.id),
          name: category.name,
        }));
        setCatalogMenuItems(nextItems);
        setCatalogCategories(nextCategories);
      })
      .catch((cause) =>
        setApiError(
          cause instanceof Error ? cause.message : "Không thể tải danh mục để chọn phạm vi.",
        ),
      );
  }, []);

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
    setTargetType("");
    setTargetId("");
    setShowForm(true);
  };

  const openEditForm = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setForm({
      name: promotion.name,
      code: promotion.code,
      promotionType: promotion.promotionType,
      discountValue: promotion.discountValue,
      maxDiscountAmount: promotion.promotionType.includes("PERCENT")
        ? promotion.maxDiscountAmount
        : null,
      minBillAmount: promotion.minBillAmount,
      maxRedemptions: promotion.maxRedemptions,
      maxRedemptionsPerCustomer: promotion.maxRedemptionsPerCustomer,
      status: promotion.status,
      startAt: promotion.startAt,
      endAt: promotion.endAt,
      targets: promotion.targets.map((t) => ({ ...t })),
    });
    setTargetType("");
    setTargetId("");
    setShowForm(true);
  };

  const loadRedemptionHistory = async (promotion: Promotion, page = 0) => {
    setRedemptionHistory((current) => ({
      promotion,
      items: current?.promotion.id === promotion.id ? current.items : [],
      total: current?.promotion.id === promotion.id ? current.total : 0,
      page,
      size: 10,
      loading: true,
    }));
    try {
      const result = await loadPromotionRedemptions(promotion.id, page);
      setRedemptionHistory({ promotion, ...result, loading: false });
      setApiError(null);
    } catch (cause) {
      setRedemptionHistory(null);
      setApiError(cause instanceof Error ? cause.message : "Không thể tải lịch sử sử dụng.");
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const addTarget = () => {
    if (!targetType || !targetId) return;
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
    if (typeUsesPercent && form.discountValue > 100) {
      setApiError("Tỷ lệ giảm tối đa là 100%.");
      return;
    }
    if (
      form.code
        .split(",")
        .map((value) => value.trim())
        .some((value) => value && !/^[A-Z0-9]+(?::[1-9]\d*)?$/.test(value))
    ) {
      setApiError(
        "Mã chỉ gồm chữ in hoa không dấu và số; dùng CODE:quota, ngăn nhiều mã bằng dấu phẩy.",
      );
      return;
    }
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

  const updateStatus = async (id: string) => {
    const current = promotions.find((promotion) => promotion.id === id);
    if (!current) return;
    try {
      const updated = await updatePromotionStatus(id, nextStatus(current.status));
      setPromotions((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updated.promotion,
                completedRedemptionCount: updated.completedRedemptionCount,
                code: updated.codes
                  .map(
                    (code) =>
                      `${code.code}${code.maxRedemptions === null ? "" : `:${code.maxRedemptions}`}`,
                  )
                  .join(", "),
                startAt: updated.promotion.startAt?.slice(0, 16) ?? "",
                endAt: updated.promotion.endAt?.slice(0, 16) ?? "",
                targets: updated.targets.map((target) => ({
                  id: String(target.id),
                  targetType: target.targetType,
                  targetId: String(target.targetId),
                })),
              }
            : item,
        ),
      );
      setApiError(null);
    } catch (cause) {
      setApiError(cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái.");
    }
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    if (confirmTarget.action === "save") {
      const trimmed = form.name.trim();
      const normalized = { ...form, name: trimmed, code: form.code.trim().toUpperCase() };
      const command = {
        ...normalized,
        startAt: normalized.startAt || null,
        endAt: normalized.endAt || null,
        codes: normalized.code
          ? normalized.code
              .split(",")
              .map((entry) => entry.trim())
              .filter(Boolean)
              .map((entry) => {
                const [value, quota] = entry.split(":", 2).map((part) => part.trim());
                return {
                  value,
                  maxRedemptions: quota ? Number(quota) : null,
                };
              })
          : [],
        targets: normalized.targets.map((target) => ({
          type: target.targetType,
          id: Number(target.targetId),
        })),
      };
      try {
        const saved = editingId
          ? await updatePromotion(editingId, command)
          : await createPromotion(command);
        const next = {
          ...normalized,
          ...saved.promotion,
          completedRedemptionCount: saved.completedRedemptionCount,
          id: saved.promotion.publicId,
          code: saved.codes
            .map(
              (code) =>
                `${code.code}${code.maxRedemptions === null ? "" : `:${code.maxRedemptions}`}`,
            )
            .join(", "),
          startAt: saved.promotion.startAt?.slice(0, 16) ?? "",
          endAt: saved.promotion.endAt?.slice(0, 16) ?? "",
          targets: saved.targets.map((target) => ({
            id: String(target.id),
            targetType: target.targetType,
            targetId: String(target.targetId),
          })),
          redemptions: [],
        };
        setPromotions((current) =>
          editingId
            ? current.map((item) => (item.id === editingId ? next : item))
            : [next, ...current],
        );
        setApiError(null);
      } catch (cause) {
        setApiError(cause instanceof Error ? cause.message : "Không thể lưu khuyến mãi.");
        return;
      }
      setConfirmTarget(null);
      closeForm();
    } else if (confirmTarget.action === "status" && confirmTarget.promotionId) {
      await updateStatus(confirmTarget.promotionId);
      setConfirmTarget(null);
    }
  };

  const targetOptions =
    targetType === "MENU_ITEM"
      ? catalogMenuItems
      : targetType === "CATEGORY"
        ? catalogCategories
        : [];
  const getCatalogTargetLabel = (target: PromotionTarget) => {
    const source = target.targetType === "MENU_ITEM" ? catalogMenuItems : catalogCategories;
    return source.find((item) => item.id === target.targetId)?.name ?? "Đã ngừng áp dụng";
  };
  const typeUsesPercent =
    form.promotionType === "PERCENT_OFF" || form.promotionType === "ITEM_PERCENT_OFF";
  const supportsMaxDiscount = typeUsesPercent;
  const typeUsesTargets = form.promotionType.startsWith("ITEM_");

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
      {apiError && <p className="text-sm font-semibold text-cas-error">{apiError}</p>}

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
                <div className="min-w-0">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-cas-primary">
                    {typeLabels[promotion.promotionType]}
                  </p>
                  <h2 className="mt-1 text-lg font-black text-cas-on-surface">{promotion.name}</h2>
                  <p className="mt-1 text-xs font-medium text-cas-on-surface-variant">
                    {promotion.targets.length === 0
                      ? "Áp dụng toàn bill"
                      : `Áp dụng: ${promotion.targets.map(getCatalogTargetLabel).join(", ")}`}
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.65rem] font-black ${statusTone}`}
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
                    onClick={() => void loadRedemptionHistory(promotion)}
                    className="rounded-xl px-2.5 py-1.5 text-xs font-bold text-cas-primary hover:bg-cas-primary/10 transition-colors"
                  >
                    Lịch sử dùng
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
                      maxLength={500}
                      title="Nhập nhiều mã cách nhau bằng dấu phẩy; dùng CODE:quota cho quota riêng từng mã."
                    />
                  </Field>
                  <Field label="Loại promotion">
                    <select
                      value={form.promotionType}
                      onChange={(e) => {
                        const promotionType = e.target.value as PromotionType;
                        setForm((current) => ({
                          ...current,
                          promotionType,
                          maxDiscountAmount: promotionType.includes("PERCENT")
                            ? current.maxDiscountAmount
                            : null,
                          targets: promotionType.startsWith("ITEM_") ? current.targets : [],
                        }));
                      }}
                      className={inputClass}
                    >
                      {Object.entries(typeLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label={typeUsesPercent ? "Tỷ lệ giảm (%)" : "Giá trị giảm (VNĐ)"}
                    tooltip="Với ưu đãi giảm tiền, số tiền giảm thực tế không vượt quá tổng giá trị bill hoặc phần món được áp dụng. Ví dụ: bill 30.000đ, ưu đãi 50.000đ — hệ thống giảm 30.000đ, số tiền phải thanh toán là 0đ."
                  >
                    {typeUsesPercent ? (
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={form.discountValue || ""}
                        onChange={(e) => updateForm("discountValue", Number(e.target.value))}
                        onInvalid={(event) =>
                          event.currentTarget.setCustomValidity(
                            "Tỷ lệ giảm phải lớn hơn 0% và không vượt quá 100%.",
                          )
                        }
                        onInput={(event) => event.currentTarget.setCustomValidity("")}
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
                  {supportsMaxDiscount && (
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
                  <Field
                    label="Bill tối thiểu (VNĐ)"
                    tooltip="Promotion chỉ áp dụng khi tổng bill đạt mức này. Ví dụ: đặt 100.000đ thì bill 80.000đ không được giảm."
                  >
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
            {typeUsesTargets ? (
              <section className="space-y-3 rounded-2xl border border-cas-outline-variant/25 p-4">
                <FormTitle
                  icon="menu"
                  title="Phạm vi áp dụng"
                  tooltip="Giảm % hoặc giảm tiền chỉ tính trên món/danh mục đã chọn và không vượt tổng giá trị của chúng. Ví dụ: món 30.000đ, giảm 50.000đ thì chỉ giảm 30.000đ."
                />
                <p className="text-[0.7rem] text-cas-on-surface-variant">
                  Chọn ít nhất một món hoặc danh mục để áp dụng promotion này.
                </p>
                {form.targets.length === 0 && (
                  <p className="rounded-xl bg-cas-tertiary/10 p-2.5 text-xs font-bold text-cas-tertiary">
                    ⚠️ Loại ưu đãi này áp dụng theo món/danh mục (`ITEM_...`). Vui lòng chọn ít nhất
                    1 món ăn hoặc danh mục bên dưới.
                  </p>
                )}
                <div className="flex gap-2">
                  <select
                    value={targetType}
                    onChange={(e) => {
                      const next = e.target.value as TargetType | "";
                      setTargetType(next);
                      setTargetId("");
                    }}
                    className={inputClass}
                  >
                    <option value="">Chọn loại phạm vi</option>
                    <option value="MENU_ITEM">Món ăn</option>
                    <option value="CATEGORY">Danh mục</option>
                  </select>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className={inputClass}
                    disabled={!targetType}
                  >
                    <option value="">Chọn món hoặc danh mục</option>
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
                      {getCatalogTargetLabel(target)}
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
            ) : (
              <section className="space-y-3 rounded-2xl border border-cas-outline-variant/25 p-4">
                <FormTitle
                  icon="menu"
                  title="Phạm vi áp dụng"
                  tooltip="Promotion này giảm trên toàn bộ bill nên không cần chọn món hoặc danh mục."
                />
                <p className="text-[0.7rem] text-cas-on-surface-variant">
                  Loại promotion này áp dụng trên toàn bộ bill.
                </p>
              </section>
            )}

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
      {redemptionHistory && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setRedemptionHistory(null)}
          />
          <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <div>
                <h3 className="text-base font-black text-cas-on-surface">
                  Lịch sử sử dụng: {redemptionHistory.promotion.name}
                </h3>
                <p className="text-xs font-medium text-cas-on-surface-variant">
                  Mã: {redemptionHistory.promotion.code || "Không dùng mã"} · Tổng lượt sử dụng:{" "}
                  {redemptionHistory.total}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRedemptionHistory(null)}
                className="grid size-8 place-items-center rounded-xl text-cas-on-surface-variant hover:bg-cas-on-surface/5"
                aria-label="Đóng modal lịch sử sử dụng"
              >
                <CasIcon name="close" className="size-5" />
              </button>
            </div>

            {redemptionHistory.loading ? (
              <p className="py-8 text-center text-xs font-bold text-cas-on-surface-variant">
                Đang tải lịch sử sử dụng...
              </p>
            ) : redemptionHistory.items.length === 0 ? (
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
                    {redemptionHistory.items.map((red) => (
                      <tr key={red.id} className="hover:bg-cas-on-surface/5">
                        <td className="p-3 font-bold">{red.customerName}</td>
                        <td className="p-3 font-black text-cas-primary">
                          {formatMoney(red.discountAmount)}
                        </td>
                        <td className="p-3 font-medium text-cas-on-surface-variant">
                          {new Date(red.paidAt).toLocaleString("vi-VN")}
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

            {!redemptionHistory.loading && redemptionHistory.total > redemptionHistory.size && (
              <div className="flex items-center justify-between text-xs font-bold text-cas-on-surface-variant">
                <span>
                  Trang {redemptionHistory.page + 1}/
                  {Math.ceil(redemptionHistory.total / redemptionHistory.size)}
                </span>
                <div className="flex gap-2">
                  <CasButton
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={redemptionHistory.page === 0}
                    onClick={() =>
                      void loadRedemptionHistory(
                        redemptionHistory.promotion,
                        redemptionHistory.page - 1,
                      )
                    }
                  >
                    Trước
                  </CasButton>
                  <CasButton
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={
                      (redemptionHistory.page + 1) * redemptionHistory.size >=
                      redemptionHistory.total
                    }
                    onClick={() =>
                      void loadRedemptionHistory(
                        redemptionHistory.promotion,
                        redemptionHistory.page + 1,
                      )
                    }
                  >
                    Sau
                  </CasButton>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <CasButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRedemptionHistory(null)}
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
  tooltip,
}: {
  label: string;
  className?: string;
  children: ReactNode;
  tooltip?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 flex items-center gap-1 text-[0.7rem] font-bold text-cas-on-surface-variant">
        {label}
        {tooltip && <InfoTooltip text={tooltip} />}
      </span>
      {children}
    </label>
  );
}

function FormTitle({
  icon,
  title,
  tooltip,
}: {
  icon: "sparkle" | "settings" | "menu" | "bill";
  title: string;
  tooltip?: string;
}) {
  return (
    <h4 className="flex items-center gap-2 text-sm font-black text-cas-on-surface">
      <CasIcon name={icon} className="size-4 text-cas-primary" />
      {title}
      {tooltip && <InfoTooltip text={tooltip} />}
    </h4>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        className="grid size-4 place-items-center rounded-full border border-cas-outline-variant/70 text-[0.65rem] font-black leading-none text-cas-on-surface-variant transition-colors hover:border-cas-primary hover:text-cas-primary focus:outline-none focus:ring-2 focus:ring-cas-primary"
        aria-label="Giải thích phạm vi áp dụng"
      >
        !
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border border-cas-outline-variant/30 bg-cas-surface px-3 py-2 text-left text-xs font-medium leading-5 text-cas-on-surface-variant opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
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
  return promotion.promotionType.includes("PERCENT");
}

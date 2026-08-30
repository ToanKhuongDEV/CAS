"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CasIcon } from "../../../../../../components/ui/cas-icon";
import { CasButton } from "../../../../../../components/ui/cas-button";
import { createOperatorIncidentCancellation } from "../../../../../../lib/api/ordering/cancellation.api";
import { loadPreparationGroups } from "../../../../../../lib/api/ordering/preparation.api";

type TableOrderItem = {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  options: { name: string; price: number }[];
};

const mockTableOrders: Record<string, TableOrderItem[]> = {
  "Bàn 01": [
    {
      id: "item-01-1",
      name: "Gà chiên mắm",
      unitPrice: 49000,
      quantity: 2,
      options: [{ name: "Không cay", price: 0 }],
    },
    {
      id: "item-01-2",
      name: "Trà sữa Trân châu Đường đen",
      unitPrice: 35000,
      quantity: 2,
      options: [
        { name: "50% đường, ít đá", price: 0 },
        { name: "Thêm trân châu", price: 10000 },
      ],
    },
  ],
  "Bàn 03": [
    {
      id: "item-03-1",
      name: "Mỳ cay đặc biệt 7 cấp độ",
      unitPrice: 45000,
      quantity: 2,
      options: [
        { name: "Cấp độ 2", price: 0 },
        { name: "Thêm xúc xích", price: 10000 },
        { name: "Thêm bò viên", price: 15000 },
      ],
    },
    {
      id: "item-03-2",
      name: "Gà rán giòn rụm",
      unitPrice: 35000,
      quantity: 1,
      options: [{ name: "Thêm sốt phô mai", price: 10000 }],
    },
  ],
  "Bàn 05": [
    {
      id: "item-05-1",
      name: "Bò sốt tiêu đen",
      unitPrice: 59000,
      quantity: 4,
      options: [
        { name: "Chín vừa", price: 0 },
        { name: "Thêm nấm đùi gà", price: 15000 },
      ],
    },
  ],
};

const formatPrice = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)}đ`;

export default function IncidentCancellationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const [cancelQuantities, setCancelQuantities] = useState<Record<string, number>>({});
  const [isRemade, setIsRemade] = useState<boolean | null>(null);
  const [reason, setReason] = useState("Đổ/bể trong lúc phục vụ");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [tableOrders, setTableOrders] = useState(mockTableOrders);

  useEffect(() => {
    void loadPreparationGroups()
      .then((groups) => {
        const next: Record<string, TableOrderItem[]> = {};
        for (const group of groups) {
          for (const allocation of group.allocations) {
            const table = `Bàn ${String(allocation.tableCode).padStart(2, "0")}`;
            next[table] ??= [];
            next[table].push({
              id: allocation.orderItemId,
              name: group.itemName,
              unitPrice: 0,
              quantity: allocation.remainingQuantity,
              options: group.options.map((option) => ({
                name: `${option.groupName}: ${option.optionName}`,
                price: 0,
              })),
            });
          }
        }
        setTableOrders(next);
      })
      .catch(() => undefined);
  }, []);

  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    setCancelQuantities({});
    setValidationError(null);
  };

  const updateCancelQty = (itemId: string, newQty: number) => {
    setCancelQuantities((prev) => ({
      ...prev,
      [itemId]: newQty,
    }));
    setValidationError(null);
  };

  const currentItems = selectedTable ? (tableOrders[selectedTable] ?? []) : [];

  const totalCancelCount = Object.values(cancelQuantities).reduce((acc, qty) => acc + qty, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTable) {
      setValidationError("Vui lòng chọn bàn đang phục vụ.");
      return;
    }
    if (totalCancelCount === 0) {
      setValidationError("Vui lòng dùng nút trừ/cộng để chọn số lượng món cần hủy.");
      return;
    }
    if (isRemade === null) {
      setValidationError("Vui lòng chọn Có hoặc Không cho mục 'Làm lại món bù'.");
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all(
        currentItems
          .filter((item) => (cancelQuantities[item.id] ?? 0) > 0)
          .map((item) =>
            createOperatorIncidentCancellation({
              orderItemId: item.id,
              requestedQuantity: cancelQuantities[item.id],
              reason,
              isRemade,
            }),
          ),
      );
      router.push("/operator/cancellations");
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Không thể hủy món.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <Link
          href="/operator/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-cas-on-surface-variant transition hover:text-cas-primary hover:underline underline-offset-4"
        >
          <CasIcon name="arrow" className="size-4 rotate-180" />
          Quay lại Bảng điều khiển
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-cas-primary">
          Hủy món do sự cố
        </h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl bg-cas-glass border border-cas-outline-variant/30 p-6 shadow-[0_5px_18px_var(--cas-shadow-color)] sm:p-8"
      >
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cas-primary/15 text-xs font-extrabold text-cas-primary">
              1
            </span>
            <h2 className="text-lg font-extrabold">Thông tin Bàn & Danh sách Món</h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Bàn đang phục vụ</span>
            <select
              required
              value={selectedTable}
              onChange={(e) => handleTableChange(e.target.value)}
              className="h-13 w-full cursor-pointer appearance-none rounded-xl border border-cas-outline-variant/45 bg-cas-surface px-4 text-sm font-medium outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
            >
              <option value="" disabled>
                --- Chọn bàn để xem danh sách món ---
              </option>
              {Object.keys(tableOrders).map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </label>

          {selectedTable ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold tracking-wider text-cas-on-surface-variant uppercase">
                  Món đã gọi tại {selectedTable}
                </span>
              </div>

              <div className="space-y-3">
                {currentItems.map((item) => {
                  const cancelQty = cancelQuantities[item.id] ?? 0;
                  const itemUnitPriceWithTopping =
                    item.unitPrice + item.options.reduce((acc, opt) => acc + opt.price, 0);

                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-4 transition-all duration-200 ${cancelQty > 0 ? "border-cas-primary bg-cas-primary/5 shadow-sm" : "border-cas-outline-variant/30 bg-cas-surface/80"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-cas-primary/10 text-xs font-extrabold text-cas-primary">
                              x{item.quantity}
                            </span>
                            <h3 className="text-base font-extrabold">{item.name}</h3>
                          </div>

                          <div className="mt-2.5 space-y-1 text-xs text-cas-on-surface-variant">
                            <p className="flex justify-between gap-3 font-medium">
                              <span>Giá món gốc</span>
                              <span>
                                {formatPrice(item.unitPrice)}
                                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                              </span>
                            </p>
                            {item.options.map((opt) => (
                              <p key={opt.name} className="flex justify-between gap-3 text-xs">
                                <span>{opt.price > 0 ? `+ ${opt.name}` : opt.name}</span>
                                <span className="font-semibold text-cas-on-surface">
                                  {opt.price > 0 ? `+${formatPrice(opt.price)}` : "Miễn phí"}
                                </span>
                              </p>
                            ))}
                          </div>

                          <div className="mt-2 pt-2 border-t border-cas-outline-variant/15 flex items-center justify-between text-xs">
                            <span className="text-cas-on-surface-variant">Đơn giá tổng:</span>
                            <strong className="font-extrabold text-cas-primary">
                              {formatPrice(itemUnitPriceWithTopping * item.quantity)}
                            </strong>
                          </div>
                        </div>

                        {/* NÚT TRỪ / CỘNG BÊN PHẢI */}
                        <div className="shrink-0 text-right">
                          <span className="block text-[0.7rem] font-bold text-cas-on-surface-variant uppercase tracking-wider mb-1.5">
                            Số lượng hủy
                          </span>
                          <div className="flex items-center rounded-xl border border-cas-outline-variant/45 bg-cas-surface overflow-hidden shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateCancelQty(item.id, Math.max(0, cancelQty - 1))}
                              disabled={cancelQty === 0}
                              className="grid size-10 place-items-center text-cas-on-surface hover:bg-cas-on-surface/5 active:bg-cas-on-surface/10 disabled:opacity-30"
                              title="Giảm số lượng hủy"
                              aria-label={`Giảm số lượng hủy ${item.name}`}
                            >
                              <CasIcon name="minus" className="size-4" />
                            </button>
                            <span className="w-9 text-center text-base font-extrabold text-cas-primary">
                              {cancelQty}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateCancelQty(item.id, Math.min(item.quantity, cancelQty + 1))
                              }
                              disabled={cancelQty >= item.quantity}
                              className="grid size-10 place-items-center text-cas-on-surface hover:bg-cas-on-surface/5 active:bg-cas-on-surface/10 disabled:opacity-30"
                              title="Tăng số lượng hủy"
                              aria-label={`Tăng số lượng hủy ${item.name}`}
                            >
                              <CasIcon name="plus" className="size-4" />
                            </button>
                          </div>
                          {cancelQty > 0 ? (
                            <span className="mt-1.5 block text-[0.72rem] font-extrabold text-cas-primary">
                              Hủy {cancelQty}/{item.quantity} phần
                            </span>
                          ) : (
                            <span className="mt-1.5 block text-[0.72rem] text-cas-on-surface-variant">
                              Chưa chọn hủy
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-cas-outline-variant/40 bg-cas-surface/50 p-6 text-center text-xs text-cas-on-surface-variant">
              Vui lòng chọn bàn ở trên để xem chi tiết các món ăn và chọn số lượng cần hủy.
            </div>
          )}
        </section>

        {validationError ? (
          <div className="rounded-xl bg-cas-error-container/20 border border-cas-error/30 p-3 text-xs font-bold text-cas-error">
            {validationError}
          </div>
        ) : null}

        <section className="space-y-5 border-t border-cas-outline-variant/25 pt-8">
          <div className="flex items-center gap-2">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-cas-primary/15 text-xs font-extrabold text-cas-primary">
              2
            </span>
            <h2 className="text-lg font-extrabold">Cách thức xử lý</h2>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold">Nguyên nhân / Lý do sự cố</span>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ví dụ: Đổ/bể trong lúc phục vụ, Lỗi chế biến từ Bếp..."
              className="h-13 w-full md:w-2/3 rounded-xl border border-cas-outline-variant/45 bg-cas-surface px-4 text-sm font-medium outline-none focus:border-cas-primary focus:ring-3 focus:ring-cas-primary/15"
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-bold">
              Làm lại món bù <span className="text-cas-error">*</span>
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setIsRemade(true);
                  setValidationError(null);
                }}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${isRemade === true ? "border-cas-secondary bg-cas-secondary-container/20 text-cas-secondary shadow-xs" : "border-cas-outline-variant/30 bg-cas-surface hover:border-cas-outline-variant/60"}`}
              >
                <span
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${isRemade === true ? "border-cas-secondary bg-cas-secondary text-cas-on-primary" : "border-cas-outline-variant"}`}
                >
                  {isRemade === true ? "✓" : ""}
                </span>
                <div>
                  <strong className="block text-sm font-extrabold">Có</strong>
                  <p className="mt-1 text-xs text-cas-on-surface-variant leading-relaxed">
                    Tạo order mới cùng món và option để bếp làm lại; tổng bill được giữ nguyên.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsRemade(false);
                  setValidationError(null);
                }}
                className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all ${isRemade === false ? "border-cas-primary bg-cas-primary/10 text-cas-primary shadow-xs" : "border-cas-outline-variant/30 bg-cas-surface hover:border-cas-outline-variant/60"}`}
              >
                <span
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${isRemade === false ? "border-cas-primary bg-cas-primary text-cas-on-primary" : "border-cas-outline-variant"}`}
                >
                  {isRemade === false ? "✓" : ""}
                </span>
                <div>
                  <strong className="block text-sm font-extrabold">Không</strong>
                  <p className="mt-1 text-xs text-cas-on-surface-variant leading-relaxed">
                    Trừ món khỏi đơn hàng và không làm lại.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>

        <div className="border-t border-cas-outline-variant/40 pt-8 text-right">
          <CasButton
            type="submit"
            size="lg"
            icon="trash"
            className="w-full sm:w-auto shadow-[0_8px_20px_var(--cas-shadow-color)]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận Hủy món & Cập nhật"}
          </CasButton>
        </div>
      </form>
    </div>
  );
}

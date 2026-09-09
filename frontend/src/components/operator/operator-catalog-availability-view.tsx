"use client";

import { useEffect, useMemo, useState } from "react";

import {
  loadOperatorCatalog,
  updateOperatorItemAvailability,
} from "../../lib/api/catalog/published-catalog.api";
import type { CatalogMenuItem } from "../../lib/api/catalog/catalog.api";
import { CasButton } from "../ui/cas-button";
import { CasIcon } from "../ui/cas-icon";
import { useToast } from "../ui/toast-provider";

const money = new Intl.NumberFormat("vi-VN");

export function OperatorCatalogAvailabilityView() {
  const { showToast } = useToast();
  const [items, setItems] = useState<CatalogMenuItem[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "SOLD_OUT">("ALL");
  const [loading, setLoading] = useState(true);
  const [savingItemId, setSavingItemId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadOperatorCatalog()
      .then(({ items: catalogItems }) => {
        setItems(catalogItems);
        setError(null);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Không thể tải danh sách món.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    return items.filter(
      (item) =>
        (statusFilter === "ALL" || item.availabilityStatus === statusFilter) &&
        (!normalizedQuery || item.name.toLocaleLowerCase("vi-VN").includes(normalizedQuery)),
    );
  }, [items, query, statusFilter]);

  async function handleAvailabilityChange(item: CatalogMenuItem) {
    const nextStatus = item.availabilityStatus === "SOLD_OUT" ? "ACTIVE" : "SOLD_OUT";
    setSavingItemId(item.id);
    try {
      await updateOperatorItemAvailability(item.id, nextStatus);
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? { ...currentItem, availabilityStatus: nextStatus }
            : currentItem,
        ),
      );
      showToast({
        type: "success",
        message:
          nextStatus === "SOLD_OUT"
            ? `${item.name} đã được đánh dấu hết hàng.`
            : `${item.name} đã chuyển sang đang bán.`,
      });
    } catch (cause) {
      showToast({
        type: "error",
        message: cause instanceof Error ? cause.message : "Không thể cập nhật trạng thái món.",
      });
    } finally {
      setSavingItemId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-extrabold tracking-[0.12em] text-cas-secondary uppercase">
          Vận hành thực đơn
        </p>
        <h1 className="mt-1 text-3xl font-black text-cas-on-surface">Món hàng</h1>
        <p className="mt-2 max-w-2xl text-sm text-cas-on-surface-variant">
          Chỉ thay đổi trạng thái Đang bán hoặc Hết hàng. Tạo, xóa và chỉnh sửa thông tin món do
          Admin quản lý.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md" htmlFor="operator-catalog-search">
          <CasIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cas-on-surface-variant"
            name="search"
          />
          <input
            className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface py-2 pr-4 pl-9 text-xs font-bold text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
            id="operator-catalog-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm kiếm tên món..."
            value={query}
          />
        </label>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="operator-catalog-status-filter">
            Trạng thái món
          </label>
          <select
            className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface outline-none focus:ring-2 focus:ring-cas-primary"
            id="operator-catalog-status-filter"
            onChange={(event) =>
              setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "SOLD_OUT")
            }
            value={statusFilter}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="SOLD_OUT">Hết hàng</option>
          </select>
          <CasButton
            onClick={() => {
              setQuery("");
              setStatusFilter("ALL");
            }}
            size="sm"
            variant="outline"
          >
            Xóa lọc
          </CasButton>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-cas-error-container/20 p-3 text-sm text-cas-error">{error}</p>
      ) : null}
      <div className="overflow-x-auto rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs">
        <table className="w-full min-w-175 text-left text-xs">
          <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 font-extrabold text-cas-on-surface-variant uppercase">
            <tr>
              <th className="px-6 py-4">Tên món</th>
              <th className="px-6 py-4 text-center">Thứ tự hiển thị</th>
              <th className="px-6 py-4">Giá niêm yết</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cas-outline-variant/15 font-bold">
            {loading ? (
              <tr>
                <td className="px-6 py-10 text-center text-cas-on-surface-variant" colSpan={5}>
                  Đang tải thực đơn…
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td className="px-6 py-10 text-center text-cas-on-surface-variant" colSpan={5}>
                  Không tìm thấy món phù hợp.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const isSoldOut = item.availabilityStatus === "SOLD_OUT";
                return (
                  <tr className="transition hover:bg-cas-surface-container/30" key={item.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            alt={item.name}
                            className="size-10 shrink-0 rounded-xl border border-cas-outline-variant/30 object-cover"
                            height={40}
                            src={item.imageUrl}
                            width={40}
                          />
                        ) : (
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-cas-outline-variant/30 bg-cas-surface-container text-cas-on-surface-variant">
                            <CasIcon className="size-4" name="restaurant" />
                          </span>
                        )}
                        <span className="text-sm font-black text-cas-on-surface">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-cas-on-surface-variant">
                      {item.displayOrder}
                    </td>
                    <td className="px-6 py-4 font-black text-cas-primary">
                      {money.format(item.price)}đ
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black ${
                          isSoldOut
                            ? "bg-cas-error-container/25 text-cas-error"
                            : "bg-cas-secondary-container/30 text-cas-secondary"
                        }`}
                      >
                        {isSoldOut ? "HẾT HÀNG" : "ĐANG BÁN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CasButton
                        disabled={savingItemId === item.id}
                        onClick={() => void handleAvailabilityChange(item)}
                        size="sm"
                        variant={isSoldOut ? "outline-primary" : "outline"}
                      >
                        {savingItemId === item.id
                          ? "Đang lưu…"
                          : isSoldOut
                            ? "Chuyển sang đang bán"
                            : "Đánh dấu hết hàng"}
                      </CasButton>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

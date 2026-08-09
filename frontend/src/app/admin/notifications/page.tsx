"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

export type SystemNotification = {
  content: string;
  createdAt: string;
  createdByName: string;
  id: number;
  isRead: boolean;
  targetRole: "OPERATOR" | "CUSTOMER" | "BOTH";
  title: string;
  type: "INFO" | "WARNING" | "URGENT";
};

const mockNotifications: SystemNotification[] = [
  {
    id: 1,
    title: "Thông báo bảo trì hệ thống định kỳ",
    content:
      "Hệ thống CAS Backend sẽ bảo trì nhẹ từ 02:00 - 02:15 đêm nay. Ca trực đêm và khách hàng lưu ý chốt đơn trước thời gian này.",
    type: "WARNING",
    targetRole: "BOTH",
    createdAt: "2026-08-08 14:30",
    createdByName: "ADMIN Master",
    isRead: false,
  },
  {
    id: 2,
    title: "Cập nhật menu món mới mùa hè",
    content:
      "Đã bổ sung danh mục Trà Trái Cây và điều chỉnh giá Topping Trân Châu Trắng. Nhân viên thu ngân lưu ý tư vấn khách.",
    type: "INFO",
    targetRole: "OPERATOR",
    createdAt: "2026-08-07 09:00",
    createdByName: "ADMIN Master",
    isRead: true,
  },
  {
    id: 3,
    title: "Khuyến mãi chào hè - Giảm 50K đơn từ 200K",
    content: "Nhập mã SUMMER50K để nhận ngay ưu đãi 50.000đ khi đặt món tại bàn!",
    type: "INFO",
    targetRole: "CUSTOMER",
    createdAt: "2026-08-06 10:00",
    createdByName: "ADMIN Master",
    isRead: false,
  },
  {
    id: 4,
    title: "Nhắc nhở kiểm tra loa báo chuyển khoản",
    content:
      "Nghiêm cấm bấm PAID thủ công khi chưa nghe âm thanh loa báo giao dịch hoặc chưa đối chiếu thông tin ngân hàng.",
    type: "URGENT",
    targetRole: "OPERATOR",
    createdAt: "2026-08-06 18:20",
    createdByName: "ADMIN Master",
    isRead: true,
  },
];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockNotifications);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<"INFO" | "WARNING" | "URGENT">("INFO");
  const [targetRole, setTargetRole] = useState<"OPERATOR" | "CUSTOMER" | "BOTH">("BOTH");
  const [filterTarget, setFilterTarget] = useState<"ALL" | "OPERATOR" | "CUSTOMER" | "BOTH">("ALL");

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const newNotif: SystemNotification = {
      id: Date.now(),
      title: title.trim(),
      content: content.trim(),
      type,
      targetRole,
      createdAt: new Date().toLocaleString("sv-SE").replace("T", " ").substring(0, 16),
      createdByName: "ADMIN Master",
      isRead: false,
    };

    setNotifications([newNotif, ...notifications]);
    setTitle("");
    setContent("");
    setShowAddForm(false);
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterTarget === "ALL") return true;
    return n.targetRole === filterTarget;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Quản lý Thông báo Hệ thống</h1>
          <p className="text-xs font-medium text-cas-on-surface-variant">
            Soạn và phát hành thông báo tới Nhân viên vận hành (OPERATOR), Khách hàng (CUSTOMER)
            hoặc Cả 2 đối tượng.
          </p>
        </div>
        <CasButton icon="plus" onClick={() => setShowAddForm(true)} size="md" variant="primary">
          Phát hành Thông báo mới
        </CasButton>
      </div>

      {/* Form Modal Tạo Thông báo */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <form
            className="my-auto w-full max-w-2xl space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
            onSubmit={handleCreateNotification}
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="flex items-center gap-2 text-base font-black text-cas-on-surface">
                <CasIcon className="size-5 text-cas-primary" name="bill" />
                Tạo thông báo
              </h3>
              <button
                className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
                onClick={() => setShowAddForm(false)}
                type="button"
              >
                Hủy
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block font-bold text-cas-on-surface-variant">
                  Tiêu đề thông báo:
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Thông báo cập nhật món mới / Bảo trì ca..."
                  required
                  type="text"
                  value={title}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-bold text-cas-on-surface-variant">
                    Mức độ ưu tiên:
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    onChange={(e) => setType(e.target.value as "INFO" | "WARNING" | "URGENT")}
                    value={type}
                  >
                    <option value="INFO">Tin tức / Thông tin (INFO)</option>
                    <option value="WARNING">Cảnh báo (WARNING)</option>
                    <option value="URGENT">Khẩn cấp (URGENT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-cas-on-surface-variant">
                    Đối tượng nhận thông báo:
                  </label>
                  <select
                    className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                    onChange={(e) =>
                      setTargetRole(e.target.value as "OPERATOR" | "CUSTOMER" | "BOTH")
                    }
                    value={targetRole}
                  >
                    <option value="BOTH">Tất cả</option>
                    <option value="OPERATOR">Nhân viên</option>
                    <option value="CUSTOMER">Khách hàng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-cas-on-surface-variant">
                  Nội dung chi tiết:
                </label>
                <textarea
                  className="mt-1 w-full resize-none rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-medium text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết thông báo..."
                  required
                  rows={3}
                  value={content}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <CasButton
                onClick={() => setShowAddForm(false)}
                size="sm"
                type="button"
                variant="outline"
              >
                Hủy
              </CasButton>
              <CasButton size="sm" type="submit" variant="primary">
                Phát hành ngay
              </CasButton>
            </div>
          </form>
        </div>
      )}

      {/* Lọc đối tượng nhận thông báo */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cas-outline-variant/20 pb-3">
        <span className="text-xs font-extrabold uppercase text-cas-on-surface-variant">
          Lọc theo đối tượng:
        </span>
        <button
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterTarget === "ALL" ? "bg-cas-primary text-white font-black shadow-xs" : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"}`}
          onClick={() => setFilterTarget("ALL")}
          type="button"
        >
          Tất cả ({notifications.length})
        </button>
        <button
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterTarget === "OPERATOR" ? "bg-amber-600 text-white font-black shadow-xs" : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"}`}
          onClick={() => setFilterTarget("OPERATOR")}
          type="button"
        >
          Chỉ Nhân viên ({notifications.filter((n) => n.targetRole === "OPERATOR").length})
        </button>
        <button
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterTarget === "CUSTOMER" ? "bg-emerald-600 text-white font-black shadow-xs" : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"}`}
          onClick={() => setFilterTarget("CUSTOMER")}
          type="button"
        >
          Chỉ Khách hàng ({notifications.filter((n) => n.targetRole === "CUSTOMER").length})
        </button>
        <button
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterTarget === "BOTH" ? "bg-indigo-600 text-white font-black shadow-xs" : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"}`}
          onClick={() => setFilterTarget("BOTH")}
          type="button"
        >
          Cả 2 đối tượng ({notifications.filter((n) => n.targetRole === "BOTH").length})
        </button>
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const typeBadge =
              n.type === "URGENT"
                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                : n.type === "WARNING"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";

            const targetBadge =
              n.targetRole === "OPERATOR"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                : n.targetRole === "CUSTOMER"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30";

            const targetText =
              n.targetRole === "OPERATOR"
                ? "Gửi: Nhân viên (OPERATOR)"
                : n.targetRole === "CUSTOMER"
                  ? "Gửi: Khách hàng (CUSTOMER)"
                  : "Gửi: Cả 2 (Nhân viên & Khách hàng)";

            return (
              <div
                className="flex flex-col gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition sm:flex-row sm:items-start sm:justify-between"
                key={n.id}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-lg border px-2 py-0.5 text-[0.65rem] font-black uppercase ${typeBadge}`}
                    >
                      {n.type}
                    </span>
                    <span
                      className={`rounded-lg border px-2 py-0.5 text-[0.65rem] font-black ${targetBadge}`}
                    >
                      {targetText}
                    </span>
                    <h3 className="text-sm font-black text-cas-on-surface">{n.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-cas-on-surface-variant">{n.content}</p>
                  <div className="flex items-center gap-3 text-[0.7rem] font-medium text-cas-on-surface-variant">
                    <span>
                      Người phát hành:{" "}
                      <strong className="text-cas-on-surface">{n.createdByName}</strong>
                    </span>
                    <span>•</span>
                    <span>Thời gian: {n.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-500/20"
                    onClick={() => deleteNotification(n.id)}
                    type="button"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="grid min-h-40 place-items-center rounded-2xl border border-dashed border-cas-outline-variant/40 bg-cas-glass p-6 text-center text-xs text-cas-on-surface-variant">
            Không có thông báo nào phù hợp với bộ lọc đối tượng.
          </div>
        )}
      </div>
    </div>
  );
}

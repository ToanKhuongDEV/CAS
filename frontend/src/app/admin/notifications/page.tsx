"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

type SystemNotification = {
  id: number;
  title: string;
  content: string;
  type: "INFO" | "WARNING" | "URGENT";
  targetRole: "ALL" | "OPERATOR" | "ADMIN";
  createdAt: string;
  createdByName: string;
  isRead: boolean;
};

const mockNotifications: SystemNotification[] = [
  {
    id: 1,
    title: "Thông báo bảo trì hệ thống định kỳ",
    content: "Hệ thống CAS Backend sẽ bảo trì nhẹ từ 02:00 - 02:15 đêm nay. Ca trực đêm lưu ý chốt bàn trước thời gian này.",
    type: "WARNING",
    targetRole: "ALL",
    createdAt: "2026-08-08 14:30",
    createdByName: "ADMIN Master",
    isRead: false,
  },
  {
    id: 2,
    title: "Cập nhật menu món mới mùa hè",
    content: "Đã bổ sung danh mục Trà Trái Cây và điều chỉnh giá Topping Trân Châu Trắng. Nhân viên thu ngân lưu ý tư vấn khách.",
    type: "INFO",
    targetRole: "OPERATOR",
    createdAt: "2026-08-07 09:00",
    createdByName: "ADMIN Master",
    isRead: true,
  },
  {
    id: 3,
    title: "Nhắc nhở kiểm tra loa báo chuyển khoản",
    content: "Nghiêm cấm bấm PAID thủ công khi chưa nghe âm thanh loa báo giao dịch hoặc chưa đối chiếu thông tin ngân hàng.",
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
  const [targetRole, setTargetRole] = useState<"ALL" | "OPERATOR" | "ADMIN">("ALL");
  const [filterType, setFilterType] = useState<"ALL" | "INFO" | "WARNING" | "URGENT">("ALL");

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
    if (filterType === "ALL") return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Quản lý Thông báo Hệ thống</h1>
          <p className="text-xs font-medium text-cas-on-surface-variant">
            Tạo và gửi các thông báo tin tức, nhắc nhở vận hành hoặc cảnh báo khẩn cấp đến nhân viên ca trực.
          </p>
        </div>
        <CasButton
          onClick={() => setShowAddForm(true)}
          icon="plus"
          variant="primary"
          size="md"
        >
          Phát hành Thông báo mới
        </CasButton>
      </div>

      {/* Form Tạo Thông báo */}
      {showAddForm && (
        <form onSubmit={handleCreateNotification} className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-md space-y-4 max-w-2xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
            <h3 className="text-base font-black text-cas-on-surface flex items-center gap-2">
              <CasIcon className="size-5 text-cas-primary" name="bill" />
              Soạn Thông báo Hệ thống Mới
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
            >
              Hủy
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-cas-on-surface-variant">Tiêu đề thông báo:</label>
              <input
                type="text"
                placeholder="VD: Nhắc nhở vận hành ca tối..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-bold text-cas-on-surface-variant">Mức độ ưu tiên:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "INFO" | "WARNING" | "URGENT")}
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                >
                  <option value="INFO">Tin tức / Thông tin (INFO)</option>
                  <option value="WARNING">Cảnh báo (WARNING)</option>
                  <option value="URGENT">Khẩn cấp (URGENT)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-cas-on-surface-variant">Đối tượng nhận:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as "ALL" | "OPERATOR" | "ADMIN")}
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                >
                  <option value="ALL">Tất cả tài khoản (ALL)</option>
                  <option value="OPERATOR">Chỉ Nhân viên (OPERATOR)</option>
                  <option value="ADMIN">Chỉ Quản trị viên (ADMIN)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-cas-on-surface-variant">Nội dung chi tiết:</label>
              <textarea
                rows={3}
                placeholder="Nhập nội dung chi tiết thông báo..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-medium text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary resize-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <CasButton
              type="button"
              onClick={() => setShowAddForm(false)}
              variant="outline"
              size="sm"
            >
              Hủy
            </CasButton>
            <CasButton type="submit" variant="primary" size="sm">
              Phát hành ngay
            </CasButton>
          </div>
        </form>
      )}

      {/* Lọc thông báo */}
      <div className="flex items-center gap-2 border-b border-cas-outline-variant/20 pb-3">
        <span className="text-xs font-extrabold uppercase text-cas-on-surface-variant">Phân loại:</span>
        {(["ALL", "INFO", "WARNING", "URGENT"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              filterType === t
                ? "bg-cas-secondary text-white font-black shadow-xs"
                : "bg-cas-glass text-cas-on-surface-variant hover:text-cas-on-surface"
            }`}
          >
            {t === "ALL" ? "Tất cả" : t === "INFO" ? "Thông tin" : t === "WARNING" ? "Cảnh báo" : "Khẩn cấp"}
          </button>
        ))}
      </div>

      {/* Danh sách thông báo */}
      <div className="space-y-3">
        {filteredNotifications.map((n) => {
          const typeBadge =
            n.type === "URGENT"
              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
              : n.type === "WARNING"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30";

          return (
            <div
              key={n.id}
              className="flex flex-col gap-3 rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded-lg border px-2 py-0.5 text-[0.65rem] font-black uppercase ${typeBadge}`}>
                    {n.type}
                  </span>
                  <span className="rounded-lg bg-cas-surface px-2 py-0.5 text-[0.65rem] font-extrabold text-cas-on-surface-variant">
                    Đối tượng: {n.targetRole}
                  </span>
                  <h3 className="text-sm font-black text-cas-on-surface">{n.title}</h3>
                </div>
                <p className="text-xs text-cas-on-surface-variant leading-relaxed">
                  {n.content}
                </p>
                <div className="flex items-center gap-3 text-[0.7rem] font-medium text-cas-on-surface-variant">
                  <span>Người phát hành: <strong className="text-cas-on-surface">{n.createdByName}</strong></span>
                  <span>•</span>
                  <span>Thời gian: {n.createdAt}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => deleteNotification(n.id)}
                  className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-500/20"
                >
                  Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

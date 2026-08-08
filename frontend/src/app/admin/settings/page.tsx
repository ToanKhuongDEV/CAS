"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";

type AuditLog = {
  id: number;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
};

const mockAuditLogs: AuditLog[] = [
  { id: 1, actor: "ADMIN Master", role: "ADMIN", action: "XÁC NHẬN THANH TOÁN", target: "Payment P-9082 (Bàn 12 - 450.000đ)", timestamp: "17:42 08/08/2026" },
  { id: 2, actor: "Nguyễn Văn A", role: "OPERATOR", action: "DUYỆT HỦY MÓN", target: "Request R-102 (1 Trà chanh - Bàn 05)", timestamp: "17:15 08/08/2026" },
  { id: 3, actor: "ADMIN Master", role: "ADMIN", action: "CẬP NHẬT CỬA HÀNG", target: "Chuyển trạng thái SOLD_OUT Ốc Hương", timestamp: "16:50 08/08/2026" },
  { id: 4, actor: "Trần Thị B", role: "OPERATOR", action: "GỌI MÓN HỘ KHÁCH", target: "Order O-501 (Bàn 08 - 3 món)", timestamp: "16:30 08/08/2026" },
];

export default function AdminSettingsPage() {
  const [warningMins, setWarningMins] = useState<number>(25);
  const [savedMsg, setSavedMsg] = useState<string>("");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg("Đã lưu cấu hình thành công!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-cas-on-surface">Cấu hình Hệ thống & Tra cứu Audit Logs</h1>
        <p className="text-xs text-cas-on-surface-variant">
          Thiết lập tham số vận hành cửa hàng và kiểm tra lịch sử nhật ký thao tác quan trọng để quy trách nhiệm.
        </p>
      </div>

      {/* Form Cấu hình Ngưỡng cảnh báo */}
      <div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs max-w-2xl">
        <h2 className="text-lg font-black text-cas-on-surface border-b border-cas-outline-variant/15 pb-3">
          1. Tham số Vận hành Cửa hàng
        </h2>
        <form onSubmit={handleSaveSettings} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-extrabold text-cas-on-surface">
              Ngưỡng thời gian Cảnh báo bàn chờ lâu (Phút):
            </label>
            <p className="mt-0.5 text-cas-on-surface-variant">
              Nếu một bàn có order còn món chưa làm xong quá thời gian này, hệ thống sẽ bật cảnh báo đỏ trên Dashboard Operator.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={5}
                max={120}
                value={warningMins}
                onChange={(e) => setWarningMins(Number(e.target.value))}
                className="w-32 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
              />
              <span className="font-extrabold text-cas-on-surface">Phút (Mặc định: 25)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <CasButton type="submit" icon="check" variant="primary" size="sm">
              Lưu Cấu hình
            </CasButton>
            {savedMsg && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {savedMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Tra cứu Audit Logs */}
      <div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-cas-outline-variant/15 pb-3">
          <div>
            <h2 className="text-lg font-black text-cas-on-surface">2. Nhật ký Thao tác (Audit Logs)</h2>
            <p className="text-xs text-cas-on-surface-variant">
              Ghi nhận minh bạch mọi hành động xác nhận tiền, đổi giá, hủy món, khóa tài khoản.
            </p>
          </div>
          <span className="rounded-xl bg-cas-secondary/15 px-3 py-1 text-xs font-extrabold text-cas-secondary">
            Bảo mật & Quy trách nhiệm
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cas-outline-variant/25 bg-cas-surface-container/60 text-cas-on-surface-variant font-extrabold uppercase">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Tài khoản thao tác</th>
                <th className="px-6 py-4">Hành động</th>
                <th className="px-6 py-4">Chi tiết Đối tượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cas-outline-variant/15 font-bold">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-cas-surface-container/30 transition">
                  <td className="px-6 py-4 text-cas-on-surface-variant">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className="font-black text-cas-on-surface">{log.actor}</span>
                    <span className="ml-2 rounded bg-cas-primary/10 px-1.5 py-0.5 text-[0.65rem] font-extrabold text-cas-primary">
                      {log.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-black text-cas-primary">{log.action}</td>
                  <td className="px-6 py-4 text-cas-on-surface-variant">{log.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

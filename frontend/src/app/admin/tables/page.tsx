"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";

type TableItem = {
  id: number;
  code: number;
  qrToken: string;
  type: "FIXED" | "MOBILE";
  sessionStatus: "OPEN" | "CLOSED" | "PAYMENT_PENDING";
};

const mockTables: TableItem[] = [
  { id: 1, code: 1, qrToken: "qr-tb-001-fix", type: "FIXED", sessionStatus: "OPEN" },
  { id: 2, code: 2, qrToken: "qr-tb-002-fix", type: "FIXED", sessionStatus: "OPEN" },
  { id: 3, code: 3, qrToken: "qr-tb-003-mob", type: "MOBILE", sessionStatus: "CLOSED" },
  { id: 4, code: 4, qrToken: "qr-tb-004-fix", type: "FIXED", sessionStatus: "PAYMENT_PENDING" },
  { id: 5, code: 5, qrToken: "qr-tb-005-fix", type: "FIXED", sessionStatus: "CLOSED" },
];

export default function AdminTablesPage() {
  const [tables, setTables] = useState<TableItem[]>(mockTables);
  const [newTableCode, setNewTableCode] = useState<string>("");
  const [selectedQR, setSelectedQR] = useState<TableItem | null>(null);

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableCode) return;
    const codeNum = Number(newTableCode);
    const newTab: TableItem = {
      id: Date.now(),
      code: codeNum,
      qrToken: `qr-tb-00${codeNum}-fix`,
      type: "FIXED",
      sessionStatus: "CLOSED",
    };
    setTables([...tables, newTab]);
    setNewTableCode("");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Quản lý Bàn ăn & Thẻ Mã QR</h1>
          <p className="text-xs text-cas-on-surface-variant">
            Tạo mã bàn (`code` kiễu INT), quản lý token mã QR cố định hoặc thẻ di động cho nhà hàng.
          </p>
        </div>
      </div>

      {/* Form Tạo Bàn mới */}
      <form onSubmit={handleCreateTable} className="flex flex-wrap items-center gap-3 rounded-2xl bg-cas-glass p-4 border border-cas-outline-variant/30">
        <label className="text-xs font-bold text-cas-on-surface">Thêm Bàn mới (Mã số Bàn):</label>
        <input
          type="number"
          placeholder="Nhập mã số bàn (ví dụ: 6)"
          value={newTableCode}
          onChange={(e) => setNewTableCode(e.target.value)}
          className="rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
        />
        <CasButton type="submit" icon="plus" variant="primary" size="sm">
          Tạo Bàn & Sinh Mã QR
        </CasButton>
      </form>

      {/* Sơ đồ Grid Bàn ăn */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => (
          <div key={table.id} className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="rounded-xl bg-cas-primary/10 px-3 py-1 text-sm font-black text-cas-primary">
                BÀN {table.code}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[0.68rem] font-black ${
                table.sessionStatus === "OPEN"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : table.sessionStatus === "PAYMENT_PENDING"
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  : "bg-cas-surface-container text-cas-on-surface-variant"
              }`}>
                {table.sessionStatus === "OPEN" ? "ĐANG CÓ KHÁCH" : table.sessionStatus === "PAYMENT_PENDING" ? "CHỜ THANH TOÁN" : "BÀN TRỐNG"}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-cas-outline-variant/15 pt-3 text-xs">
              <div>
                <p className="font-bold text-cas-on-surface-variant">Loại thẻ QR:</p>
                <p className="font-extrabold text-cas-on-surface">{table.type === "FIXED" ? "Mã QR cố định tại bàn" : "Thẻ QR di động"}</p>
              </div>
              <CasButton
                onClick={() => setSelectedQR(table)}
                variant="outline-primary"
                size="sm"
              >
                Xem QR Code
              </CasButton>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Xem QR */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-cas-surface p-6 shadow-2xl space-y-4 text-center">
            <h3 className="text-lg font-black text-cas-on-surface">Mã QR - BÀN {selectedQR.code}</h3>
            <div className="mx-auto grid size-48 place-items-center rounded-2xl bg-white p-4 border border-cas-outline-variant/30">
              <div className="grid size-36 place-items-center rounded-xl border-4 border-dashed border-cas-primary/40 text-[0.68rem] font-black text-cas-primary text-center">
                [ QR CODE TOKEN ]<br />
                {selectedQR.qrToken}
              </div>
            </div>
            <p className="text-xs font-medium text-cas-on-surface-variant">
              Khách quét mã QR này để truy cập trực tiếp menu bàn {selectedQR.code}.
            </p>
            <div className="flex gap-2">
              <CasButton
                onClick={() => setSelectedQR(null)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Đóng
              </CasButton>
              <CasButton variant="primary" size="sm" className="w-full">
                Tải ảnh QR
              </CasButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";
import { useToast } from "../../../components/ui/toast-provider";
import {
  type AdminDiningTable,
  createDiningTable,
  deleteDiningTable,
  loadActiveTableQrCode,
  loadDiningTables,
} from "../../../lib/api/tables/tables.api";

type TableItem = {
  code: number;
  id: number;
  qrToken: string;
  sessionStatus: "OPEN" | "CLOSED" | "PAYMENT_PENDING";
};

function toTableItem(table: AdminDiningTable): TableItem {
  return {
    code: table.code,
    id: table.id,
    qrToken: table.activeQrToken ?? "",
    sessionStatus: table.sessionStatus ?? "CLOSED",
  };
}

export default function AdminTablesPage() {
  const { showToast } = useToast();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableCode, setNewTableCode] = useState<string>("");
  const [selectedQR, setSelectedQR] = useState<TableItem | null>(null);
  const [deletingTable, setDeletingTable] = useState<TableItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED" | "PAYMENT_PENDING">(
    "ALL",
  );

  const reloadTables = useCallback(async () => {
    try {
      setTables((await loadDiningTables()).map(toTableItem));
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tải danh sách bàn ăn.",
        type: "error",
      });
    }
  }, [showToast]);

  useEffect(() => {
    void reloadTables();
  }, [reloadTables]);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableCode) return;
    const codeNum = Number(newTableCode);

    try {
      await createDiningTable(codeNum);
      await reloadTables();
      setNewTableCode("");
      setShowAddForm(false);
      showToast({ message: "Đã tạo bàn ăn và mã QR.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tạo bàn ăn.",
        type: "error",
      });
    }
  };

  const handleDeleteTable = async (id: number) => {
    try {
      await deleteDiningTable(id);
      await reloadTables();
      setDeletingTable(null);
      showToast({ message: "Đã xóa bàn và mã QR liên quan.", type: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể xóa bàn ăn.",
        type: "error",
      });
    }
  };

  const handleViewQr = async (table: TableItem) => {
    try {
      const qrCode = await loadActiveTableQrCode(table.id);
      setSelectedQR({ ...table, code: qrCode.tableCode, qrToken: qrCode.token });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Không thể tải mã QR của bàn.",
        type: "error",
      });
    }
  };

  const downloadQRCode = (tableCode: number) => {
    const canvas = document.getElementById(`qr-code-canvas-${tableCode}`) as HTMLCanvasElement;
    if (!canvas) return;
    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `QR-Code-Ban-${tableCode}.png`;
    link.click();
  };

  const filteredTables = tables.filter((t) => {
    const matchesSearch =
      t.code.toString().includes(searchTerm.trim()) ||
      t.qrToken.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.sessionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Quản lý Bàn ăn & Thẻ Mã QR</h1>
          <p className="text-xs text-cas-on-surface-variant">
            Danh sách mã bàn, mã QR token và trạng thái hoạt động trong nhà hàng.
          </p>
        </div>
        <CasButton icon="plus" onClick={() => setShowAddForm(true)} size="md" variant="primary">
          Thêm Bàn mới
        </CasButton>
      </div>

      {/* Thanh Tìm kiếm & Lọc Trạng thái */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-cas-outline-variant/30 bg-cas-glass p-3.5 shadow-xs backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <CasIcon
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-cas-on-surface-variant"
            name="search"
          />
          <input
            className="w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface pl-10 pr-4 py-2 text-xs font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm số bàn hoặc mã QR token..."
            type="text"
            value={searchTerm}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            className={`rounded-xl px-3 py-1.5 font-bold transition ${statusFilter === "ALL" ? "bg-cas-primary text-cas-on-primary shadow-xs" : "bg-cas-surface text-cas-on-surface-variant hover:bg-cas-surface-container"}`}
            onClick={() => setStatusFilter("ALL")}
            type="button"
          >
            Tất cả ({tables.length})
          </button>
          <button
            className={`rounded-xl px-3 py-1.5 font-bold transition ${statusFilter === "CLOSED" ? "bg-cas-primary text-cas-on-primary shadow-xs" : "bg-cas-surface text-cas-on-surface-variant hover:bg-cas-surface-container"}`}
            onClick={() => setStatusFilter("CLOSED")}
            type="button"
          >
            Bàn trống ({tables.filter((t) => t.sessionStatus === "CLOSED").length})
          </button>
          <button
            className={`rounded-xl px-3 py-1.5 font-bold transition ${statusFilter === "OPEN" ? "bg-cas-secondary text-cas-on-secondary shadow-xs" : "bg-cas-surface text-cas-on-surface-variant hover:bg-cas-surface-container"}`}
            onClick={() => setStatusFilter("OPEN")}
            type="button"
          >
            Đang có khách ({tables.filter((t) => t.sessionStatus === "OPEN").length})
          </button>
          <button
            className={`rounded-xl px-3 py-1.5 font-bold transition ${statusFilter === "PAYMENT_PENDING" ? "bg-cas-tertiary text-cas-on-primary shadow-xs" : "bg-cas-surface text-cas-on-surface-variant hover:bg-cas-surface-container"}`}
            onClick={() => setStatusFilter("PAYMENT_PENDING")}
            type="button"
          >
            Chờ thanh toán ({tables.filter((t) => t.sessionStatus === "PAYMENT_PENDING").length})
          </button>
        </div>
      </div>

      {/* Modal Tạo Bàn mới */}
      {showAddForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:p-6"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowAddForm(false);
          }}
        >
          <form
            className="my-auto w-full max-w-md space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150"
            onSubmit={handleCreateTable}
          >
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="flex items-center gap-2 text-base font-black text-cas-on-surface">
                <CasIcon className="size-5 text-cas-primary" name="table" />
                Thêm Bàn mới & Sinh Mã QR
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
                  Mã số Bàn (Kiểu Số):
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2.5 font-black text-cas-primary focus:outline-none focus:ring-2 focus:ring-cas-primary"
                  min={1}
                  onChange={(e) => setNewTableCode(e.target.value)}
                  placeholder="Nhập số bàn (VD: 6)"
                  required
                  type="number"
                  value={newTableCode}
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
              <CasButton icon="plus" size="sm" type="submit" variant="primary">
                Tạo Bàn & Sinh Mã QR
              </CasButton>
            </div>
          </form>
        </div>
      )}

      {/* Bảng Danh Sách Bàn Ăn (Table View) */}
      <div className="overflow-hidden rounded-3xl border border-cas-outline-variant/30 bg-cas-glass shadow-xs backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-cas-outline-variant/20 bg-cas-surface-container/60 text-cas-on-surface uppercase font-black tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mã số Bàn</th>
                <th className="px-5 py-3.5">QR Token</th>
                <th className="px-5 py-3.5">Trạng thái (Status)</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cas-outline-variant/15">
              {filteredTables.length === 0 ? (
                <tr>
                  <td
                    className="px-5 py-8 text-center text-cas-on-surface-variant font-bold"
                    colSpan={4}
                  >
                    Không tìm thấy bàn ăn nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredTables.map((table) => (
                  <tr className="transition hover:bg-cas-primary/5" key={table.id}>
                    <td className="px-5 py-4 font-black text-cas-on-surface text-sm">
                      <div className="flex items-center gap-2">
                        <span className="grid size-8 place-items-center rounded-xl bg-cas-primary/10 text-cas-primary">
                          <CasIcon className="size-4.5" name="table" />
                        </span>
                        <span>BÀN {table.code}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-cas-on-surface-variant text-[0.75rem]">
                      {table.qrToken}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.68rem] font-black ${table.sessionStatus === "OPEN" ? "border border-cas-secondary/30 bg-cas-secondary-container/25 text-cas-secondary" : table.sessionStatus === "PAYMENT_PENDING" ? "border border-cas-tertiary/30 bg-cas-tertiary-container/25 text-cas-tertiary" : "border border-cas-outline-variant/30 bg-cas-surface-container text-cas-on-surface-variant"}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${table.sessionStatus === "OPEN" ? "bg-cas-secondary" : table.sessionStatus === "PAYMENT_PENDING" ? "animate-ping bg-cas-tertiary" : "bg-cas-on-surface-variant/40"}`}
                        />
                        {table.sessionStatus === "OPEN"
                          ? "ĐANG CÓ KHÁCH"
                          : table.sessionStatus === "PAYMENT_PENDING"
                            ? "CHỜ THANH TOÁN"
                            : "BÀN TRỐNG"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <CasButton
                          icon="search"
                          onClick={() => void handleViewQr(table)}
                          size="sm"
                          variant="outline-primary"
                        >
                          Xem QR
                        </CasButton>
                        <button
                          className="grid size-8 place-items-center rounded-xl bg-cas-error/10 text-cas-error transition hover:bg-cas-error hover:text-white"
                          onClick={() => setDeletingTable(table)}
                          title={`Xóa Bàn ${table.code}`}
                          type="button"
                        >
                          <CasIcon className="size-4" name="trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Xác nhận Xóa Bàn */}
      {deletingTable && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center gap-3 text-cas-error">
              <span className="grid size-10 place-items-center rounded-2xl bg-cas-error/15">
                <CasIcon className="size-5" name="trash" />
              </span>
              <div>
                <h3 className="text-base font-black text-cas-on-surface">
                  Xác nhận xóa BÀN {deletingTable.code}?
                </h3>
                <p className="text-xs text-cas-on-surface-variant">
                  Thao tác này sẽ gỡ mã QR token {deletingTable.qrToken} khỏi hệ thống.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <CasButton onClick={() => setDeletingTable(null)} size="sm" variant="outline">
                Hủy
              </CasButton>
              <CasButton
                onClick={() => handleDeleteTable(deletingTable.id)}
                size="sm"
                variant="danger"
              >
                Xóa Bàn
              </CasButton>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Mã QR thực tế */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-3xl border border-cas-outline-variant/30 bg-cas-surface p-6 text-center shadow-2xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
              <h3 className="flex items-center gap-2 text-base font-black text-cas-on-surface">
                <CasIcon className="size-5 text-cas-primary" name="table" />
                Mã QR - BÀN {selectedQR.code}
              </h3>
              <button
                className="text-xs font-bold text-cas-on-surface-variant hover:text-cas-primary"
                onClick={() => setSelectedQR(null)}
                type="button"
              >
                Đóng
              </button>
            </div>

            <div className="mx-auto flex flex-col items-center justify-center rounded-2xl border border-cas-outline-variant/30 bg-cas-surface p-5 shadow-inner">
              <QRCodeCanvas
                bgColor="#ffffff"
                fgColor="#000000"
                id={`qr-code-canvas-${selectedQR.code}`}
                includeMargin
                level="H"
                size={180}
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/table/${selectedQR.qrToken}`}
              />
              <span className="mt-2 font-mono text-[0.65rem] font-bold text-cas-on-surface-variant">
                {selectedQR.qrToken}
              </span>
            </div>

            <p className="text-xs font-medium text-cas-on-surface-variant">
              Khách quét mã QR này để truy cập trực tiếp menu bàn {selectedQR.code}.
            </p>

            <div className="flex gap-2 pt-2">
              <CasButton
                className="w-full"
                onClick={() => setSelectedQR(null)}
                size="sm"
                variant="outline"
              >
                Đóng
              </CasButton>
              <CasButton
                className="w-full"
                onClick={() => downloadQRCode(selectedQR.code)}
                size="sm"
                variant="primary"
              >
                Tải ảnh QR (PNG)
              </CasButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

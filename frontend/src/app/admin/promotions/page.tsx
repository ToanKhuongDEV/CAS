"use client";

import { useState } from "react";
import { CasButton } from "../../../components/ui/cas-button";
import { CasIcon } from "../../../components/ui/cas-icon";

type PromoConfig = {
  enablePopupBanner: boolean;
  popupTitle: string;
  popupContent: string;
  popupVoucherCode: string;
  enableHeaderTicker: boolean;
  tickerMessage: string;
  enableCartAutoSuggest: boolean;
  cartSuggestThreshold: number;
};

export default function AdminPromotionsConfigPage() {
  const [config, setConfig] = useState<PromoConfig>({
    enablePopupBanner: true,
    popupTitle: "Chào mừng bạn đến với CAS Restaurant!",
    popupContent: "Nhập ngay mã SUMMER50K giảm 50.000đ cho đơn hàng từ 200.000đ khi gọi món tại bàn.",
    popupVoucherCode: "SUMMER50K",
    enableHeaderTicker: true,
    tickerMessage: "🔥 Giảm ngay 50k cho đơn từ 200k khi nhập mã SUMMER50K • Món mới Trà Trái Cây tươi mát đã sẵn sàng!",
    enableCartAutoSuggest: true,
    cartSuggestThreshold: 150000,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-cas-on-surface">Cấu hình Thông báo Khuyến mãi & Banner</h1>
          <p className="text-xs font-medium text-cas-on-surface-variant">
            Thiết lập các thông báo khuyến mãi tự động, popup chào mừng và gợi ý mã giảm giá trên giao diện Khách hàng (Customer) & Nhân viên (Operator).
          </p>
        </div>
        <CasButton
          onClick={handleSave}
          icon="sparkle"
          variant="primary"
          size="md"
        >
          Lưu cấu hình
        </CasButton>
      </div>

      {savedSuccess && (
        <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-4 text-xs font-black text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
          ✓ Đã lưu thay đổi cấu hình thông báo khuyến mãi thành công!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hộp 1: Popup Banner Chào Mừng */}
        <div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
            <h3 className="text-base font-black text-cas-on-surface flex items-center gap-2">
              <CasIcon className="size-5 text-cas-primary" name="sparkle" />
              Popup Banner Chào Mừng Khi Quét QR
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enablePopupBanner}
                onChange={(e) => setConfig({ ...config, enablePopupBanner: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cas-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cas-primary" />
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-cas-on-surface-variant">Tiêu đề Popup:</label>
              <input
                type="text"
                value={config.popupTitle}
                onChange={(e) => setConfig({ ...config, popupTitle: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                disabled={!config.enablePopupBanner}
              />
            </div>

            <div>
              <label className="block font-bold text-cas-on-surface-variant">Nội dung khuyến mãi:</label>
              <textarea
                rows={3}
                value={config.popupContent}
                onChange={(e) => setConfig({ ...config, popupContent: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-medium text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary resize-none"
                disabled={!config.enablePopupBanner}
              />
            </div>

            <div>
              <label className="block font-bold text-cas-on-surface-variant">Mã Voucher đính kèm:</label>
              <input
                type="text"
                value={config.popupVoucherCode}
                onChange={(e) => setConfig({ ...config, popupVoucherCode: e.target.value.toUpperCase() })}
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-black text-cas-primary uppercase focus:outline-none focus:ring-2 focus:ring-cas-primary"
                disabled={!config.enablePopupBanner}
              />
            </div>
          </div>
        </div>

        {/* Hộp 2: Thanh Thông Báo Khuyến Mãi Chạy Ngang (Header Ticker) */}
        <div className="rounded-3xl border border-cas-outline-variant/30 bg-cas-glass p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-cas-outline-variant/20 pb-3">
            <h3 className="text-base font-black text-cas-on-surface flex items-center gap-2">
              <CasIcon className="size-5 text-cas-secondary" name="bell" />
              Thanh Thông Báo Chạy Trên Header
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableHeaderTicker}
                onChange={(e) => setConfig({ ...config, enableHeaderTicker: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-cas-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cas-secondary" />
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-cas-on-surface-variant">Dòng tin thông báo nổi bật:</label>
              <textarea
                rows={3}
                value={config.tickerMessage}
                onChange={(e) => setConfig({ ...config, tickerMessage: e.target.value })}
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-medium text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-secondary resize-none"
                disabled={!config.enableHeaderTicker}
              />
            </div>
          </div>

          <div className="border-t border-cas-outline-variant/20 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-cas-on-surface">Tự động Gợi ý Voucher tại Giỏ hàng</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableCartAutoSuggest}
                  onChange={(e) => setConfig({ ...config, enableCartAutoSuggest: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-cas-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cas-primary" />
              </label>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-cas-on-surface-variant">Ngưỡng giá trị giỏ hàng để gợi ý (VNĐ):</label>
              <input
                type="number"
                value={config.cartSuggestThreshold}
                onChange={(e) => setConfig({ ...config, cartSuggestThreshold: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 py-2 font-bold text-cas-on-surface focus:outline-none focus:ring-2 focus:ring-cas-primary"
                disabled={!config.enableCartAutoSuggest}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

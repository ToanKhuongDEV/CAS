export function OperatorBillAdjustmentForm() {
  return (
    <section
      aria-labelledby="bill-adjustment-title"
      className="mt-5 rounded-2xl border border-cas-outline-variant/40 bg-cas-surface-container p-4"
    >
      <h3 className="text-base font-extrabold text-cas-on-surface" id="bill-adjustment-title">
        Điều chỉnh hóa đơn
      </h3>
      <p className="mt-1 text-sm text-cas-on-surface-variant">
        Tăng hoặc giảm tiền sau khuyến mãi, kèm lý do rõ ràng.
      </p>
      <p className="mt-3 text-sm font-semibold text-cas-on-surface-variant" role="status">
        Chức năng điều chỉnh đang được hoàn thiện.
      </p>
      <fieldset className="mt-4 grid gap-3 opacity-60" disabled>
        <label className="grid gap-1 text-sm font-bold">
          Loại điều chỉnh
          <select className="min-h-11 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 text-sm">
            <option>Tăng tiền</option>
            <option>Giảm tiền</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Số tiền
          <input
            className="min-h-11 rounded-xl border border-cas-outline-variant/40 bg-cas-surface px-3 text-base"
            inputMode="decimal"
            placeholder="Nhập số tiền"
          />
        </label>
        <label className="grid gap-1 text-sm font-bold">
          Lý do
          <textarea
            className="min-h-20 resize-y rounded-xl border border-cas-outline-variant/40 bg-cas-surface p-3 text-base"
            placeholder="Nhập lý do điều chỉnh"
          />
        </label>
        <button
          className="min-h-11 rounded-xl bg-cas-primary px-4 text-sm font-bold text-cas-on-primary"
          type="button"
        >
          Thêm điều chỉnh
        </button>
      </fieldset>
    </section>
  );
}

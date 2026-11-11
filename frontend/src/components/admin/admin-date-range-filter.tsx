import type { Period } from "../../lib/admin/dashboard-filter";

const periodLabels: Record<Exclude<Period, "custom">, string> = {
  threeDays: "3 ngày",
  oneWeek: "1 tuần",
  oneMonth: "1 tháng",
};

export function AdminDateRangeFilter({
  period,
  from,
  to,
  onPeriodChange,
  onFromChange,
  onToChange,
}: {
  period: Period;
  from: string;
  to: string;
  onPeriodChange: (period: Period) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="flex overflow-hidden rounded-sm border border-cas-outline-variant/60 bg-cas-surface">
        {(Object.keys(periodLabels) as Exclude<Period, "custom">[]).map((item) => (
          <button
            className={`cursor-pointer px-3 py-2 text-xs font-bold transition ${period === item ? "bg-cas-primary/10 text-cas-primary" : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"}`}
            aria-pressed={period === item}
            key={item}
            onClick={() => onPeriodChange(item)}
            type="button"
          >
            {periodLabels[item]}
          </button>
        ))}
        <button
          className={`cursor-pointer border-l border-cas-outline-variant/40 px-3 py-2 text-xs font-bold transition ${period === "custom" ? "bg-cas-primary/10 text-cas-primary" : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"}`}
          aria-pressed={period === "custom"}
          onClick={() => onPeriodChange("custom")}
          type="button"
        >
          Tùy chỉnh
        </button>
      </div>
      <DateInput label="Ngày bắt đầu" value={from} onChange={onFromChange} />
      <span className="text-xs font-bold text-cas-on-surface-variant">đến</span>
      <DateInput label="Ngày kết thúc" value={to} onChange={onToChange} />
    </div>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-sm border border-cas-outline-variant/60 bg-cas-surface px-2.5 py-1.5 text-xs font-semibold text-cas-on-surface">
      <span className="sr-only">{label}</span>
      <input
        className="min-w-30 bg-transparent outline-none"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}

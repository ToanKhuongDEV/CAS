import type { Period } from "../../lib/admin/dashboard-filter";
import { CasIcon } from "../ui/cas-icon";

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
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap rounded-xl border border-cas-outline-variant/60 bg-cas-surface p-0.5">
        {(Object.keys(periodLabels) as Exclude<Period, "custom">[]).map((item) => (
          <button
            className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${period === item ? "bg-cas-surface-container text-cas-primary shadow-sm" : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"}`}
            aria-pressed={period === item}
            key={item}
            onClick={() => onPeriodChange(item)}
            type="button"
          >
            {periodLabels[item]}
          </button>
        ))}
        <button
          className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${period === "custom" ? "bg-cas-surface-container text-cas-primary shadow-sm" : "text-cas-on-surface-variant hover:bg-cas-surface-container/50"}`}
          aria-pressed={period === "custom"}
          onClick={() => onPeriodChange("custom")}
          type="button"
        >
          Tùy chỉnh
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:border-l sm:border-cas-outline-variant/60 sm:pl-3">
        <DateInput label="Ngày bắt đầu" value={from} onChange={onFromChange} />
        <span className="text-xs font-bold text-cas-on-surface-variant">đến</span>
        <DateInput label="Ngày kết thúc" value={to} onChange={onToChange} />
      </div>
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
    <label className="relative flex h-9 w-35 items-center justify-between rounded-xl border border-cas-outline-variant/60 bg-cas-surface px-2.5 text-xs font-semibold text-cas-on-surface focus-within:outline-2 focus-within:outline-cas-focus-ring">
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{value ? value.split("-").reverse().join("/") : "dd/mm/yyyy"}</span>
      <CasIcon name="calendar" className="size-4 text-cas-on-surface-variant" />
      <input
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        onClick={(event) => event.currentTarget.showPicker?.()}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}

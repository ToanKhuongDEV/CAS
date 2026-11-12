export function CompactPagination({
  page,
  size,
  total,
  onPageChange,
}: {
  page: number;
  size: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / size));
  return (
    <nav aria-label="Phân trang" className="flex flex-wrap items-center justify-end gap-2">
      <span className="rounded-lg bg-cas-surface-container px-3 py-2 text-sm font-semibold text-cas-on-surface-variant">
        {total} kết quả
      </span>
      <div className="flex items-center gap-2 rounded-lg bg-cas-surface-container px-2 py-1">
        <button
          type="button"
          aria-label="Trước"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="h-7 rounded-md px-3 text-sm font-bold text-cas-on-surface transition hover:bg-cas-primary/10 disabled:opacity-40"
        >
          &lt;
        </button>
        <span
          aria-current="page"
          className="grid h-7 min-w-8 place-items-center rounded-md px-2 text-sm font-bold text-cas-on-surface"
        >
          {page + 1}
        </span>
        <button
          type="button"
          aria-label="Sau"
          disabled={page + 1 >= pageCount}
          onClick={() => onPageChange(page + 1)}
          className="h-7 rounded-md px-3 text-sm font-bold text-cas-on-surface transition hover:bg-cas-primary/10 disabled:opacity-40"
        >
          &gt;
        </button>
        <span className="ml-1 text-sm font-semibold text-cas-on-surface-variant">
          {page + 1}/{pageCount}
        </span>
      </div>
    </nav>
  );
}

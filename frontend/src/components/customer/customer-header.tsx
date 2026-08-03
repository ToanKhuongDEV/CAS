import Link from "next/link";

import { CasIcon } from "../ui/cas-icon";
import { ThemeToggle } from "../ui/theme-toggle";

type CustomerHeaderProps = {
  cartCount?: number;
  tableName: string;
};

export function CustomerHeader({
  cartCount,
  tableName,
}: CustomerHeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 bg-cas-header shadow-[0_2px_12px_var(--cas-shadow-color)] backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-[75rem] items-center justify-between px-5 md:px-10">
        <Link
          className="inline-flex items-center gap-3 text-xl font-bold text-cas-primary focus-visible:rounded-full focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cas-focus-ring"
          href="/"
          aria-label="CAS - Trang chào mừng"
        >
          <span className="grid size-10 place-items-center rounded-full bg-cas-primary text-cas-on-primary">
            <CasIcon className="size-5" name="restaurant" />
          </span>
          <span>Cas</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cas-secondary-container/20 px-3 py-1.5 text-xs font-semibold text-cas-secondary">
            <CasIcon className="size-4" name="table" />
            {tableName}
          </span>
          <ThemeToggle />
          {cartCount !== undefined ? (
            <button
              className="relative grid size-10 place-items-center rounded-full text-cas-on-surface-variant transition hover:bg-cas-surface-container focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
              type="button"
              aria-label={`Giỏ hàng có ${cartCount} món`}
            >
              <CasIcon className="size-5.5" name="cart" />
              <span className="absolute top-0.5 right-0.5 grid size-4 place-items-center rounded-full bg-cas-primary text-[0.6rem] font-bold text-cas-on-primary">
                {cartCount}
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

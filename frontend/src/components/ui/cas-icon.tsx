import type { ReactNode, SVGProps } from "react";

export type CasIconName =
  | "arrow"
  | "basket"
  | "bill"
  | "cart"
  | "check"
  | "clock"
  | "fire"
  | "info"
  | "menu"
  | "minus"
  | "payment"
  | "phone"
  | "plus"
  | "restaurant"
  | "search"
  | "settings"
  | "sparkle"
  | "table"
  | "trash"
  | "user"
  | "users";

type CasIconProps = SVGProps<SVGSVGElement> & {
  name: CasIconName;
};

const iconPaths: Record<CasIconName, ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  basket: (
    <>
      <path d="m4 10 2 10h12l2-10H4Z" />
      <path d="m8 10 4-6 4 6M9 14v2M15 14v2" />
    </>
  ),
  bill: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L20.5 8H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </>
  ),
  check: <path d="m5 12.5 4.2 4L19 7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  fire: (
    <path d="M13.5 2.8c.5 3.2-1.8 4.2-1.8 6.4 0 1.1.8 1.9 1.8 1.9 1.7 0 2.8-1.7 2.5-4.1 2.1 1.8 3.4 4.2 3.4 6.7A7.4 7.4 0 0 1 12 21a7.4 7.4 0 0 1-7.4-7.3c0-3.7 2.2-7.2 5.6-9.5-.2 3.2 1 4.6 2 4.6 1.2 0 2.1-2 1.3-6Z" />
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  menu: (
    <>
      <path d="M5 4v7M3 4v4a2 2 0 0 0 4 0V4M5 11v9M11 4v16M11 4c4 0 6 2 6 5v2h-6" />
      <path d="M17 11v9" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  payment: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  phone: (
    <path d="M6.6 3h3l1.4 4-2 1.4a15 15 0 0 0 6.6 6.6l1.4-2 4 1.4v3A3.6 3.6 0 0 1 17.4 21C9.4 20.5 3.5 14.6 3 6.6A3.6 3.6 0 0 1 6.6 3Z" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  restaurant: (
    <>
      <path d="M7 3v7M4 3v5a3 3 0 0 0 6 0V3M7 10v11" />
      <path d="M15 3c3 0 5 2.7 5 6v3h-5V3Zm2.5 9v9" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  sparkle: (
    <>
      <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z" />
      <path d="m18.5 14 .7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" />
    </>
  ),
  table: (
    <>
      <path d="M4 10h16M6 10v9M18 10v9M7 5h10l2 5H5l2-5Z" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 3h6l1 4H8l1-4ZM7 7l1 14h8l1-14" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0M16 7.5a3 3 0 0 1 0 5.5M16 15a5 5 0 0 1 5 5" />
    </>
  ),
};

export function CasIcon({ name, ...props }: CasIconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      {...props}
    >
      {iconPaths[name]}
    </svg>
  );
}

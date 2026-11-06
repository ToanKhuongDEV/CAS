"use client";

import { usePathname } from "next/navigation";
import styles from "./customer-background-shapes.module.css";

const shapes = [
  "top-[12%] left-[7%] size-10 rounded-full",
  "top-[19%] right-[12%] size-8 rounded-lg",
  "top-[38%] left-[18%] size-7 rounded-full",
  "top-[45%] right-[6%] size-12 rounded-2xl",
  "top-[62%] left-[5%] size-8 rounded-lg",
  "top-[73%] right-[19%] size-10 rounded-full",
  "top-[87%] left-[35%] size-7 rounded-lg",
];

export function CustomerBackgroundShapes() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {shapes.map((shape) => (
        <span key={shape} className={`absolute bg-cas-primary/10 ${styles.shape} ${shape}`} />
      ))}
    </div>
  );
}

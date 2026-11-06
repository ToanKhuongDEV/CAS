import Image from "next/image";
import { STORE_LOGO } from "../../lib/store-logo";

type CasLogoProps = {
  className?: string;
  priority?: boolean;
};

export function CasLogo({ className, priority = false }: CasLogoProps) {
  return (
    <Image
      alt=""
      aria-hidden="true"
      className={className}
      height={64}
      priority={priority}
      src={STORE_LOGO}
      unoptimized
      width={64}
    />
  );
}

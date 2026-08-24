import Image from "next/image";

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
      src="/cas-logo.svg"
      unoptimized
      width={64}
    />
  );
}

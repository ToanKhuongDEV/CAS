type MaterialSymbolName =
  | "corporate_fare"
  | "add_business"
  | "storefront"
  | "photo_library"
  | "timer"
  | "preview"
  | "upload_file"
  | "delete"
  | "check_circle";

export function MaterialSymbol({
  name,
  className = "size-5",
}: {
  name: MaterialSymbolName;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current [mask-size:contain] [mask-repeat:no-repeat] ${className}`}
      style={{ maskImage: `url(/icons/material-symbols/${name}.svg)` }}
    />
  );
}

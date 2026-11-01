import Image from "next/image";
import { ProductArt } from "./ProductArt";
import type { ProductSnapshot } from "@/lib/types";

/** عکس واقعی محصول اگر در ادمین آپلود شده باشد، وگرنه طرح جایگزین */
export function ProductVisual({
  art,
  image,
  label,
  className = "",
  sizes = "(max-width: 768px) 60vw, 280px",
}: {
  art: ProductSnapshot["art"];
  image?: string | null;
  label: string;
  className?: string;
  sizes?: string;
}) {
  if (!image) return <ProductArt kind={art.kind} tone={art.tone} label={label} className={className} />;
  return (
    <span className={`relative block overflow-hidden bg-olive-100 ${className}`}>
      <Image src={image} alt={label} fill sizes={sizes} className="object-cover" />
    </span>
  );
}

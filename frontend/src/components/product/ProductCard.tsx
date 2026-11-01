import Link from "next/link";
import { Star } from "lucide-react";
import { ProductVisual } from "./ProductVisual";
import { CardActions } from "./CardActions";
import { discountPercent, faNum, toman } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const inStock = product.variants.some((v) => v.stock > 0);
  const percent = discountPercent(variant.price, variant.compareAt);

  return (
    <article className="group relative flex h-full flex-col" data-priority={priority || undefined}>
      <div className="relative overflow-hidden rounded-2xl">
        <Link href={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
          <ProductVisual
            art={product.art}
            image={product.images[0]}
            label=""
            className="aspect-square w-full transition-transform duration-500 ease-out-quint group-hover:scale-[1.04]"
          />
        </Link>
        <div className="absolute start-2.5 top-2.5 flex flex-col items-start gap-1">
          {percent > 0 && <span className="rounded-full bg-clay-700 px-2.5 py-0.5 text-xs font-bold text-white">{faNum(percent)}٪</span>}
          {product.tags.includes("new") && <span className="rounded-full bg-olive-800 px-2.5 py-0.5 text-xs font-medium text-lemon-100">تازه</span>}
          {!inStock && <span className="rounded-full bg-olive-950 px-2.5 py-0.5 text-xs font-medium text-lemon-100">ناموجود</span>}
        </div>
        <CardActions product={product} variant={variant} inStock={inStock} />
      </div>
      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs text-olive-700">{product.birdNames.slice(0, 3).join("، ")}{product.birdNames.length > 3 && " و…"}</p>
        <h3 className="mt-1 line-clamp-2 min-h-12 text-[15px] leading-6 font-semibold">
          <Link href={`/product/${product.slug}`} className="hover:text-olive-700">{product.name}</Link>
        </h3>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-2">
          <p>
            {percent > 0 && <del className="block text-xs text-olive-700">{toman(variant.compareAt!)}</del>}
            <span className="font-bold">{toman(variant.price)}</span>
          </p>
          <p className="flex items-center gap-1 text-xs text-olive-800" aria-label={`امتیاز ${faNum(product.rating)} از ۵`}>
            <Star className="size-3.5 fill-lemon-500 text-lemon-500" aria-hidden="true" />
            {faNum(product.rating)}
          </p>
        </div>
      </div>
    </article>
  );
}

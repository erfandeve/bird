"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { BirdMark } from "@/components/layout/Logo";
import { ProductVisual } from "@/components/product/ProductVisual";
import { useHydrated, useWish } from "@/lib/store";
import { toman } from "@/lib/format";

export function WishlistView() {
  const hydrated = useHydrated();
  const items = useWish((s) => s.items);
  const remove = useWish((s) => s.remove);

  return (
    <div className="wrap py-8">
      <h1 className="mb-6 font-display text-5xl font-bold text-olive-900">علاقه‌مندی‌ها</h1>
      {!hydrated ? (
        <div className="skeleton h-64" />
      ) : items.length ? (
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.slug} className="relative">
              <Link href={`/product/${item.slug}`} className="block">
                <ProductVisual art={item.art} image={item.image} label={item.name} className="aspect-square w-full rounded-2xl" />
                <p className="mt-3 line-clamp-2 leading-6 font-semibold">{item.name}</p>
                <p className="mt-1 font-bold">{toman(item.price)}</p>
              </Link>
              <button type="button" aria-label={`حذف ${item.name} از علاقه‌مندی‌ها`} onClick={() => remove(item.slug)} className="absolute end-2 top-2 grid size-11 place-items-center rounded-full bg-lemon-50/90 hover:text-clay-700">
                <X className="size-5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BirdMark className="h-16 w-auto text-olive-300" />
          <p className="text-lg">هنوز چیزی را نشان نکرده‌اید.</p>
          <Link href="/shop" className="btn btn-primary">دیدن محصولات</Link>
        </div>
      )}
    </div>
  );
}

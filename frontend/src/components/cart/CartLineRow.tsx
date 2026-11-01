"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { useCart } from "@/lib/store";
import { faNum, toman } from "@/lib/format";
import type { CartLine } from "@/lib/types";

export function CartLineRow({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  return (
    <div className="flex gap-3">
      <Link href={`/product/${line.slug}`} className="shrink-0">
        <ProductVisual art={line.art} image={line.image} label={line.name} sizes="112px" className={`rounded-xl ${compact ? "size-20" : "size-24 sm:size-28"}`} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/product/${line.slug}`} className="line-clamp-2 text-sm leading-6 font-semibold hover:underline">
          {line.name}
        </Link>
        <p className="mt-0.5 text-xs text-olive-700">{line.variantLabel}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center rounded-full bg-olive-100">
            <button type="button" aria-label={`افزایش تعداد ${line.name}`} disabled={line.qty >= line.stock} onClick={() => setQty(line.variantId, line.qty + 1)} className="grid size-10 place-items-center rounded-full hover:bg-olive-200 disabled:opacity-40">
              <Plus className="size-4" aria-hidden="true" />
            </button>
            <span className="w-7 text-center text-sm font-bold" aria-live="polite">{faNum(line.qty)}</span>
            <button type="button" aria-label={`کاهش تعداد ${line.name}`} disabled={line.qty <= 1} onClick={() => setQty(line.variantId, line.qty - 1)} className="grid size-10 place-items-center rounded-full hover:bg-olive-200 disabled:opacity-40">
              <Minus className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{toman(line.price * line.qty)}</span>
            <button type="button" aria-label={`حذف ${line.name} از سبد`} onClick={() => remove(line.variantId)} className="grid size-10 place-items-center rounded-full text-olive-700 hover:bg-clay-100 hover:text-clay-700">
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Heart } from "lucide-react";
import { useHydrated, useToast, useWish } from "@/lib/store";
import type { ProductSnapshot } from "@/lib/types";

export function WishButton({ item, className = "" }: { item: ProductSnapshot; className?: string }) {
  const hydrated = useHydrated();
  const has = useWish((s) => s.items.some((i) => i.slug === item.slug));
  const toggle = useWish((s) => s.toggle);
  const toast = useToast((s) => s.push);
  const active = hydrated && has;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `حذف ${item.name} از علاقه‌مندی‌ها` : `افزودن ${item.name} به علاقه‌مندی‌ها`}
      onClick={() => toast(toggle(item) ? "به علاقه‌مندی‌ها اضافه شد" : "از علاقه‌مندی‌ها حذف شد")}
      className={`grid size-11 place-items-center rounded-full text-olive-800 transition-colors hover:text-clay-700 ${className}`}
    >
      <Heart className={`size-5 transition-colors ${active ? "fill-clay-500 text-clay-500" : ""}`} aria-hidden="true" />
    </button>
  );
}

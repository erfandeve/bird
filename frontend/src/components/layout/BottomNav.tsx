"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, ShoppingBag, UserRound } from "lucide-react";
import { cartCount, useCart, useHydrated, useWish } from "@/lib/store";
import { CountBadge } from "./HeaderActions";

const ITEM = "relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium";

export function BottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const wish = useWish((s) => s.items.length);

  const tone = (href: string) => (pathname === href ? "text-olive-800" : "text-olive-700");

  return (
    <nav aria-label="دسترسی سریع" className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t border-olive-200 bg-lemon-50 pb-[env(safe-area-inset-bottom)] md:hidden" style={{ zIndex: "var(--z-sticky)" }}>
      <Link href="/" className={`${ITEM} ${tone("/")}`}><Home className="size-5" aria-hidden="true" />خانه</Link>
      <Link href="/shop" className={`${ITEM} ${tone("/shop")}`}><LayoutGrid className="size-5" aria-hidden="true" />محصولات</Link>
      <button type="button" onClick={() => setOpen(true)} className={`${ITEM} text-olive-700`}>
        <span className="relative">
          <ShoppingBag className="size-5" aria-hidden="true" />
          <CountBadge count={hydrated ? cartCount(lines) : 0} />
        </span>
        سبد
      </button>
      <Link href="/wishlist" className={`${ITEM} ${tone("/wishlist")}`}>
        <span className="relative">
          <Heart className="size-5" aria-hidden="true" />
          <CountBadge count={hydrated ? wish : 0} />
        </span>
        علاقه‌مندی
      </Link>
      <Link href="/account" className={`${ITEM} ${tone("/account")}`}><UserRound className="size-5" aria-hidden="true" />حساب</Link>
    </nav>
  );
}

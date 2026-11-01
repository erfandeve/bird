"use client";

import Link from "next/link";
import { Heart, ShoppingBag, UserRound } from "lucide-react";
import { cartCount, useAuth, useCart, useHydrated, useWish } from "@/lib/store";
import { faNum } from "@/lib/format";

const ICON_BTN = "relative grid size-11 place-items-center rounded-full text-olive-900 transition-colors hover:bg-lemon-200";

export function CountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-olive-700 px-1 text-[11px] font-bold text-lemon-50">
      {faNum(count)}
    </span>
  );
}

export function HeaderActions() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const wishCount = useWish((s) => s.items.length);
  const user = useAuth((s) => s.user);

  const signedIn = hydrated && user;

  return (
    <div className="flex items-center gap-0.5">
      <Link href={signedIn ? "/account" : "/login"} className={`${ICON_BTN} md:hidden`} aria-label={signedIn ? "حساب کاربری" : "ورود یا ثبت‌نام"}>
        <UserRound className="size-5" aria-hidden="true" />
      </Link>
      <Link href={signedIn ? "/account" : "/login"} className="me-1 hidden items-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium text-olive-900 transition-colors hover:bg-lemon-200 md:inline-flex">
        <UserRound className="size-5" aria-hidden="true" />
        {signedIn ? user.name || "حساب من" : "ورود | ثبت‌نام"}
      </Link>
      <Link href="/wishlist" className={`${ICON_BTN} hidden sm:grid`} aria-label="علاقه‌مندی‌ها">
        <Heart className="size-5" aria-hidden="true" />
        <CountBadge count={hydrated ? wishCount : 0} />
      </Link>
      <button type="button" data-cart-target onClick={() => setOpen(true)} className={ICON_BTN} aria-label={`سبد خرید، ${faNum(hydrated ? cartCount(lines) : 0)} کالا`}>
        <ShoppingBag className="size-5" aria-hidden="true" />
        <CountBadge count={hydrated ? cartCount(lines) : 0} />
      </button>
    </div>
  );
}

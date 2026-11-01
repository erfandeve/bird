"use client";

import Link from "next/link";
import { BirdMark } from "@/components/layout/Logo";
import { CartLineRow } from "./CartLineRow";
import { CouponBox } from "./CouponBox";
import { FreeShippingMeter } from "./FreeShippingMeter";
import { SummaryRows } from "./SummaryRows";
import { CartProblems } from "./CartProblems";
import { cartSubtotal, useCart, useHydrated, useQuote } from "@/lib/store";

export function CartPageView() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const quote = useQuote();

  return (
    <div className="wrap py-8">
      <h1 className="mb-6 font-display text-5xl font-bold text-olive-900">سبد خرید</h1>
      {!hydrated ? (
        <div className="skeleton h-64" />
      ) : !lines.length ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <BirdMark className="h-16 w-auto text-olive-300" />
          <p className="text-lg">سبد خرید شما خالی است.</p>
          <Link href="/shop" className="btn btn-primary">دیدن محصولات</Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <div>
            <ul className="divide-y divide-olive-200 border-y border-olive-200">
              {lines.map((line) => (
                <li key={line.variantId} className="py-4"><CartLineRow line={line} /></li>
              ))}
            </ul>
            <button type="button" onClick={clear} className="mt-3 min-h-11 text-sm font-semibold text-olive-800 underline underline-offset-4">خالی کردن سبد</button>
          </div>
          <aside className="space-y-5 self-start rounded-2xl bg-lemon-200 p-6 lg:sticky lg:top-36" aria-label="خلاصهٔ سفارش">
            <FreeShippingMeter subtotal={cartSubtotal(lines)} />
            <CartProblems quote={quote} lines={lines} />
            <CouponBox quote={quote} />
            <SummaryRows quote={quote} shippingKnown={false} />
            <Link href="/checkout" className="btn btn-primary w-full">ادامهٔ خرید و ارسال</Link>
          </aside>
        </div>
      )}
    </div>
  );
}

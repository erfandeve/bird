"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BirdMark } from "./Logo";
import { Drawer } from "./Drawer";
import { CartLineRow } from "@/components/cart/CartLineRow";
import { FreeShippingMeter } from "@/components/cart/FreeShippingMeter";
import { cartCount, cartSubtotal, useCart, useHydrated } from "@/lib/store";
import { faNum, toman } from "@/lib/format";

export function CartDrawer() {
  const hydrated = useHydrated();
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const lines = useCart((s) => s.lines);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname, setOpen]);

  const subtotal = cartSubtotal(lines);

  return (
    <Drawer open={open} onClose={() => setOpen(false)} label="سبد خرید">
      <div className="flex items-center justify-between border-b border-olive-200 p-4">
        <h2 className="font-display text-3xl font-semibold text-olive-800">
          سبد خرید {hydrated && lines.length > 0 && <span className="text-xl">({faNum(cartCount(lines))})</span>}
        </h2>
        <button type="button" onClick={() => setOpen(false)} aria-label="بستن سبد خرید" className="grid size-11 place-items-center rounded-full hover:bg-lemon-200">
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {hydrated && lines.length ? (
        <>
          <div className="border-b border-olive-200 p-4">
            <FreeShippingMeter subtotal={subtotal} />
          </div>
          <ul className="flex-1 divide-y divide-olive-200 overflow-y-auto px-4">
            {lines.map((line) => (
              <li key={line.variantId} className="py-3">
                <CartLineRow line={line} compact />
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t border-olive-200 p-4">
            <p className="flex items-center justify-between font-bold">
              <span>جمع سبد</span>
              <span>{toman(subtotal)}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/cart" className="btn btn-soft" onClick={() => setOpen(false)}>مشاهدهٔ سبد</Link>
              <Link href="/checkout" className="btn btn-primary" onClick={() => setOpen(false)}>تسویه‌حساب</Link>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <BirdMark className="h-14 w-auto text-olive-300" />
          <p className="text-olive-800">سبد خرید شما خالی است.</p>
          <Link href="/shop" className="btn btn-primary" onClick={() => setOpen(false)}>دیدن محصولات</Link>
        </div>
      )}
    </Drawer>
  );
}

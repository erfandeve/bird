"use client";

import { useRef, useState } from "react";
import { Minus, PackageCheck, Plus, RotateCcw, Truck } from "lucide-react";
import { flyToCart } from "@/components/birds/CartFlight";
import { WishButton } from "./WishButton";
import { useCart, useToast } from "@/lib/store";
import { discountPercent, faNum, toman } from "@/lib/format";
import { FREE_SHIPPING_FROM } from "@/lib/site";
import type { Product } from "@/lib/types";

export function BuyBox({ product }: { product: Product }) {
  const firstAvailable = product.variants.findIndex((v) => v.stock > 0);
  const [selected, setSelected] = useState(Math.max(0, firstAvailable));
  const [qty, setQty] = useState(1);
  const button = useRef<HTMLButtonElement>(null);
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.setOpen);
  const toast = useToast((s) => s.push);

  const variant = product.variants[selected];
  const percent = discountPercent(variant.price, variant.compareAt);
  const available = variant.stock > 0;

  const addToCart = () => {
    add(
      {
        slug: product.slug,
        name: product.name,
        art: product.art,
        image: product.images[0],
        price: variant.price,
        compareAt: variant.compareAt,
        variantId: variant.id,
        variantLabel: `${product.variantLabel}: ${variant.label}`,
        stock: variant.stock,
      },
      qty,
    );
  };

  return (
    <div className="mt-6">
      <fieldset>
        <legend className="mb-2 text-sm font-bold">{product.variantLabel}</legend>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v, i) => (
            <label
              key={v.id}
              className={`flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm font-semibold transition-colors has-focus-visible:outline-2 has-focus-visible:outline-olive-600 ${
                selected === i ? "bg-olive-700 text-lemon-50" : "bg-olive-100 text-olive-900 hover:bg-olive-200"
              } ${v.stock ? "" : "opacity-50"}`}
            >
              <input
                type="radio"
                name="variant"
                className="sr-only"
                checked={selected === i}
                onChange={() => {
                  setSelected(i);
                  setQty(1);
                }}
              />
              {v.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p className="text-3xl font-bold">{toman(variant.price)}</p>
        {percent > 0 && (
          <>
            <del className="text-olive-700">{toman(variant.compareAt!)}</del>
            <span className="rounded-full bg-clay-700 px-2.5 py-0.5 text-sm font-bold text-white">{faNum(percent)}٪ تخفیف</span>
          </>
        )}
      </div>
      <p className={`mt-1 text-sm ${available ? "text-olive-700" : "font-semibold text-clay-700"}`}>
        {!available ? "این گزینه فعلاً ناموجود است." : variant.stock <= 15 ? `فقط ${faNum(variant.stock)} عدد در انبار` : "موجود در انبار"}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full bg-olive-100">
          <button type="button" aria-label="افزایش تعداد" disabled={qty >= variant.stock} onClick={() => setQty(qty + 1)} className="grid size-12 place-items-center rounded-full hover:bg-olive-200 disabled:opacity-40">
            <Plus className="size-4" aria-hidden="true" />
          </button>
          <span className="w-8 text-center font-bold" aria-live="polite">{faNum(qty)}</span>
          <button type="button" aria-label="کاهش تعداد" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="grid size-12 place-items-center rounded-full hover:bg-olive-200 disabled:opacity-40">
            <Minus className="size-4" aria-hidden="true" />
          </button>
        </div>
        <button
          ref={button}
          type="button"
          disabled={!available}
          onClick={() => {
            addToCart();
            flyToCart(button.current);
            toast(`«${product.name}» به سبد اضافه شد`);
          }}
          className="btn btn-primary min-h-12 flex-1 sm:flex-none sm:px-10"
        >
          {available ? "افزودن به سبد" : "ناموجود"}
        </button>
        {available && (
          <button
            type="button"
            className="btn btn-lemon min-h-12"
            onClick={() => {
              addToCart();
              openCart(true);
            }}
          >
            خرید سریع
          </button>
        )}
        <WishButton
          className="size-12 bg-olive-100"
          item={{ slug: product.slug, name: product.name, art: product.art, image: product.images[0], price: variant.price, compareAt: variant.compareAt }}
        />
      </div>

      <ul className="mt-6 space-y-2 border-t border-olive-200 pt-5 text-sm text-olive-900">
        <li className="flex items-center gap-2.5"><Truck className="size-5 text-olive-600" aria-hidden="true" />ارسال رایگان برای سفارش‌های بالای {toman(FREE_SHIPPING_FROM)}</li>
        <li className="flex items-center gap-2.5"><PackageCheck className="size-5 text-olive-600" aria-hidden="true" />آماده‌سازی سفارش تا یک روز کاری</li>
        <li className="flex items-center gap-2.5"><RotateCcw className="size-5 text-olive-600" aria-hidden="true" />۷ روز مهلت مرجوعی لوازم استفاده‌نشده</li>
      </ul>
    </div>
  );
}

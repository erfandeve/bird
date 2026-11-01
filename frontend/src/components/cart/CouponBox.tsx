"use client";

import { useState } from "react";
import { useCart } from "@/lib/store";
import type { Quote } from "@/lib/types";

/** اعتبار کد را سرور از طریق quote بررسی می‌کند */
export function CouponBox({ quote }: { quote: Quote | null }) {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState("");

  if (coupon && quote?.coupon) {
    return (
      <p className="flex items-center justify-between gap-2 rounded-xl bg-lemon-100 px-3 py-2 text-sm">
        <span>
          <b dir="ltr">{quote.coupon.code}</b>
          <span className="block text-xs">{quote.coupon.label}</span>
        </span>
        <button type="button" onClick={() => setCoupon(null)} className="min-h-10 px-2 font-semibold underline underline-offset-2">حذف</button>
      </p>
    );
  }

  const error = coupon ? quote?.couponError : null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setCoupon(code.trim() || null);
      }}
    >
      <label htmlFor="coupon" className="mb-1 block text-sm font-semibold">کد تخفیف</label>
      <div className="flex gap-2">
        <input
          id="coupon"
          dir="ltr"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "coupon-error" : undefined}
          className="field min-w-0 flex-1 text-start"
        />
        <button type="submit" className="btn btn-soft">اعمال</button>
      </div>
      {error && <p id="coupon-error" className="mt-1 text-sm text-clay-700">{error}</p>}
    </form>
  );
}

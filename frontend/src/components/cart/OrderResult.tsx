"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FlyingBird } from "@/components/birds/FlyingBird";
import { api } from "@/lib/api";
import { useCart } from "@/lib/store";
import { toman } from "@/lib/format";
import type { Order } from "@/lib/types";

export function OrderSuccess() {
  const code = useSearchParams().get("order");
  const clear = useCart((s) => s.clear);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!code) return;
    api<Order>(`/orders/${encodeURIComponent(code)}`).then(setOrder).catch(() => {});
    clear();
  }, [code, clear]);

  return (
    <div className="wrap flex flex-col items-center py-20 text-center">
      <FlyingBird tone="lime" className="w-32" />
      <h1 className="mt-4 font-display text-5xl font-bold text-olive-900">سفارش شما ثبت شد</h1>
      {code && (
        <p className="mt-3 max-w-md leading-8 text-olive-900">
          شمارهٔ سفارش <b dir="ltr">{code}</b>{order && <> به مبلغ {toman(order.total)}</>}. با این شماره و موبایل گیرنده می‌توانید وضعیت آن را پیگیری کنید.
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/track" className="btn btn-primary">پیگیری سفارش</Link>
        <Link href="/shop" className="btn btn-soft">ادامهٔ خرید</Link>
      </div>
    </div>
  );
}

export function OrderFailed() {
  const code = useSearchParams().get("order");
  return (
    <div className="wrap flex flex-col items-center py-20 text-center">
      <h1 className="font-display text-5xl font-bold text-olive-900">پرداخت انجام نشد</h1>
      <p className="mt-3 max-w-md leading-8 text-olive-900">
        {code && <>سفارش <b dir="ltr">{code}</b> لغو شد. </>}
        اگر مبلغی از حساب شما کم شده باشد، طبق قوانین بانکی به حسابتان برمی‌گردد. کالاها هنوز در سبد خرید شما هستند.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/checkout" className="btn btn-primary">تلاش دوباره</Link>
        <Link href="/contact" className="btn btn-soft">تماس با پشتیبانی</Link>
      </div>
    </div>
  );
}

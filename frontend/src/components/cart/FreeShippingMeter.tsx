import { FREE_SHIPPING_FROM } from "@/lib/site";
import { toman } from "@/lib/format";

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const left = FREE_SHIPPING_FROM - subtotal;
  const percent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_FROM) * 100));
  return (
    <div>
      <p className="mb-2 text-sm text-olive-900">
        {left > 0 ? <>با {toman(left)} خرید بیشتر، ارسال رایگان می‌شود.</> : "ارسال این سفارش رایگان است."}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-olive-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="پیشرفت تا ارسال رایگان">
        <div className="h-full rounded-full bg-olive-500 transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

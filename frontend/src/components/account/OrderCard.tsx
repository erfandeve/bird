import { ChevronDown } from "lucide-react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { faDate, faNum, toman } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

const PROGRESS: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "ثبت سفارش" },
  { key: "packing", label: "آماده‌سازی" },
  { key: "shipped", label: "ارسال‌شده" },
  { key: "delivered", label: "تحویل‌شده" },
];

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "در انتظار پرداخت",
  confirmed: "ثبت سفارش",
  packing: "آماده‌سازی",
  shipped: "ارسال‌شده",
  delivered: "تحویل‌شده",
  cancelled: "لغوشده",
};

export function OrderCard({ order, open = false }: { order: Order; open?: boolean }) {
  const current = PROGRESS.findIndex((s) => s.key === order.status);
  return (
    <details open={open} className="group rounded-2xl bg-white ring-1 ring-olive-200">
      <summary className="flex min-h-16 list-none flex-wrap items-center justify-between gap-2 p-4 [&::-webkit-details-marker]:hidden">
        <span>
          <b dir="ltr" className="block">{order.id}</b>
          <span className="text-sm text-olive-800">{faDate(order.createdAt)}</span>
        </span>
        <span className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${order.status === "cancelled" ? "bg-clay-100 text-clay-700" : "bg-lemon-200"}`}>{LABELS[order.status]}</span>
          <b className="text-sm">{toman(order.total)}</b>
          <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="border-t border-olive-200 p-4">
        {current >= 0 && (
          <ol className="mb-5 grid grid-cols-4 gap-1 text-center text-xs" aria-label="وضعیت سفارش">
            {PROGRESS.map((s, i) => (
              <li key={s.key} aria-current={i === current ? "step" : undefined} className={i <= current ? "font-bold text-olive-900" : "text-olive-700"}>
                <span className={`mb-1.5 block h-1.5 rounded-full ${i <= current ? "bg-olive-600" : "bg-olive-100"}`} />
                {s.label}
              </li>
            ))}
          </ol>
        )}
        <ul className="space-y-2">
          {order.lines.map((l, i) => (
            <li key={l.variantId ?? i} className="flex items-center gap-3 text-sm">
              <ProductVisual art={l.art} image={l.image} label="" sizes="48px" className="size-12 shrink-0 rounded-lg" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-1 font-semibold">{l.name}</span>
                <span className="text-xs text-olive-800">{faNum(l.qty)} × {l.variantLabel}</span>
              </span>
              <span className="shrink-0">{toman(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid gap-1 border-t border-olive-200 pt-3 text-sm leading-7 sm:grid-cols-2">
          <div><dt className="inline font-semibold">ارسال به: </dt><dd className="inline">{order.address.receiver}، {order.address.province}، {order.address.city}، {order.address.line}</dd></div>
          <div><dt className="inline font-semibold">روش ارسال: </dt><dd className="inline">{order.shippingMethod}</dd></div>
          <div><dt className="inline font-semibold">پرداخت: </dt><dd className="inline">{order.paymentMethod}</dd></div>
          <div><dt className="inline font-semibold">هزینهٔ ارسال: </dt><dd className="inline">{order.shipping ? toman(order.shipping) : "رایگان"}</dd></div>
          {order.discount > 0 && <div><dt className="inline font-semibold">تخفیف: </dt><dd className="inline">{toman(order.discount)}</dd></div>}
          {order.trackingCode && <div><dt className="inline font-semibold">کد رهگیری مرسوله: </dt><dd className="inline" dir="ltr">{order.trackingCode}</dd></div>}
        </dl>
      </div>
    </details>
  );
}

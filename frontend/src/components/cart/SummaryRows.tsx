import { toman } from "@/lib/format";
import type { Quote } from "@/lib/types";

export function SummaryRows({ quote, shippingKnown }: { quote: Quote | null; shippingKnown: boolean }) {
  if (!quote) return <div className="skeleton h-28" />;
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt>جمع کالاها</dt><dd>{toman(quote.subtotal)}</dd></div>
      {quote.saved > 0 && <div className="flex justify-between text-olive-800"><dt>سود شما از تخفیف محصولات</dt><dd>{toman(quote.saved)}</dd></div>}
      {quote.discount > 0 && <div className="flex justify-between text-clay-700"><dt>کد تخفیف</dt><dd>−{toman(quote.discount)}</dd></div>}
      <div className="flex justify-between">
        <dt>هزینهٔ ارسال</dt>
        <dd>{quote.freeShipping ? "رایگان" : shippingKnown ? toman(quote.shipping) : "در مرحلهٔ بعد"}</dd>
      </div>
      <div className="flex justify-between border-t border-olive-300 pt-3 text-base font-bold">
        <dt>مبلغ قابل پرداخت</dt>
        <dd>{toman(quote.total)}</dd>
      </div>
    </dl>
  );
}

import type { CartLine, Quote } from "@/lib/types";
import { faNum } from "@/lib/format";

export function CartProblems({ quote, lines }: { quote: Quote | null; lines: CartLine[] }) {
  const stock = quote?.problems.filter((p) => p.reason === "stock") ?? [];
  if (!stock.length) return null;
  return (
    <ul role="alert" className="space-y-1 rounded-xl bg-clay-100 p-3 text-sm text-clay-700">
      {stock.map((p) => {
        const line = lines.find((l) => l.variantId === p.variant);
        return (
          <li key={p.variant}>
            {p.stock > 0 ? `از «${line?.name}» فقط ${faNum(p.stock)} عدد موجود است.` : `«${line?.name}» ناموجود شده است.`}
          </li>
        );
      })}
    </ul>
  );
}

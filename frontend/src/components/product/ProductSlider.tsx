import Link from "next/link";
import { ProductCard } from "./ProductCard";
import { SliderControls } from "./SliderControls";
import type { Product } from "@/lib/types";

/** اسلایدر با scroll-snap: همهٔ محصولات در HTML هستند و بدون جاوااسکریپت هم کار می‌کند */
export function ProductSlider({
  id,
  title,
  note,
  href,
  products,
  dark = false,
}: {
  id: string;
  title: string;
  note?: string;
  href?: string;
  products: Product[];
  dark?: boolean;
}) {
  return (
    <section aria-labelledby={`${id}-title`} className="rise-in">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id={`${id}-title`} className={`font-display text-4xl leading-tight font-semibold md:text-5xl ${dark ? "text-lemon-100" : "text-olive-900"}`}>
            {title}
          </h2>
          {note && <p className={`mt-1 text-sm ${dark ? "text-olive-100" : "text-olive-700"}`}>{note}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href && (
            <Link href={href} className={`me-1 text-sm font-medium underline-offset-4 hover:underline ${dark ? "text-lemon-200" : "text-olive-800"}`}>
              همه
            </Link>
          )}
          <SliderControls target={id} dark={dark} />
        </div>
      </div>
      <ul
        id={id}
        className="no-scrollbar -mx-[clamp(16px,4vw,40px)] flex snap-x snap-mandatory scroll-px-[clamp(16px,4vw,40px)] gap-4 overflow-x-auto px-[clamp(16px,4vw,40px)] pb-2 md:gap-6"
      >
        {products.map((p) => (
          <li key={p.id} className={`w-[62vw] shrink-0 snap-start sm:w-[38vw] md:w-[27vw] lg:w-[21vw] xl:w-[252px] ${dark ? "[&_h3]:text-lemon-50 [&_h3_a:hover]:text-lemon-300 [&_p]:text-lemon-100 [&_del]:text-olive-100" : ""}`}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

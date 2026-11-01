import Link from "next/link";
import { ProductArt } from "@/components/product/ProductArt";
import { getCategories } from "@/lib/catalog";
import type { Category } from "@/lib/types";

function Row({ c }: { c: Category }) {
  return (
    <li>
      <Link href={`/category/${c.slug}`} className="group flex items-center gap-3 rounded-xl py-2 pe-3 transition-colors hover:bg-lemon-50/60">
        <ProductArt kind={c.art.kind} tone={c.art.tone} label="" className="size-16 shrink-0 rounded-xl transition-transform duration-300 ease-out-quint group-hover:scale-105" />
        <span className="min-w-0">
          <span className="block font-semibold">{c.name}</span>
          <span className="block truncate text-sm text-olive-800">{c.blurb}</span>
        </span>
      </Link>
    </li>
  );
}

export async function CategoryShowcase() {
  const categories = await getCategories();
  return (
    <section aria-label="دسته‌بندی محصولات" className="wrap pt-16 md:pt-24">
      <div className="grid gap-4 md:grid-cols-[1fr_1.35fr] md:gap-6">
        <div className="rounded-2xl bg-lemon-200 p-6 md:p-8">
          <h2 className="font-display text-4xl font-semibold text-olive-900 md:text-5xl">خوراک</h2>
          <p className="mt-1 mb-5 text-sm text-olive-800">غذای روزانه، تشویقی و مکمل.</p>
          <ul className="space-y-1">
            {categories.filter((c) => c.group === "food").map((c) => <Row key={c.slug} c={c} />)}
          </ul>
        </div>
        <div className="rounded-2xl bg-olive-200 p-6 md:p-8">
          <h2 className="font-display text-4xl font-semibold text-olive-900 md:text-5xl">لوازم و اکسسوری</h2>
          <p className="mt-1 mb-5 text-sm text-olive-900">هرچه خانهٔ پرنده لازم دارد.</p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {categories.filter((c) => c.group === "gear").map((c) => <Row key={c.slug} c={c} />)}
          </ul>
        </div>
      </div>
    </section>
  );
}

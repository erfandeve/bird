import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { getBirds, getCategories } from "@/lib/catalog";
import type { Category } from "@/lib/types";
import { FREE_SHIPPING_FROM } from "@/lib/site";
import { toman } from "@/lib/format";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { HeaderActions } from "./HeaderActions";
import { MobileMenu } from "./MobileMenu";

function CategoryColumn({ title, group, categories }: { title: string; group: "food" | "gear"; categories: Category[] }) {
  return (
    <div>
      <p className="mb-3 font-display text-2xl font-semibold text-olive-800">{title}</p>
      <ul className="space-y-1">
        {categories
          .filter((c) => c.group === group)
          .map((c) => (
            <li key={c.slug}>
              <Link href={`/category/${c.slug}`} className="block rounded-lg px-2 py-1.5 text-sm text-olive-900 transition-colors hover:bg-lemon-200">
                <span className="font-medium">{c.name}</span>
                <span className="ms-2 text-xs text-olive-700">{c.blurb}</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

const NAV_LINK = "inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-olive-900 transition-colors hover:bg-lemon-200";

export async function Header() {
  const [categories, birds] = await Promise.all([getCategories(), getBirds()]);
  return (
    <>
      <p className="bg-olive-800 px-4 py-1.5 text-center text-xs text-lemon-100 sm:text-sm">
        ارسال رایگان برای خریدهای بالای {toman(FREE_SHIPPING_FROM)}
      </p>
      <header className="sticky top-0 border-b border-olive-200 bg-lemon-50" style={{ zIndex: "var(--z-sticky)" }}>
        <div className="wrap flex items-center gap-3 py-2.5 md:gap-6">
          <MobileMenu categories={categories} birds={birds} />
          <Logo />
          <div className="hidden flex-1 md:block">
            <SearchBox />
          </div>
          <div className="ms-auto">
            <HeaderActions />
          </div>
        </div>
        <div className="wrap pb-2.5 md:hidden">
          <SearchBox />
        </div>
        <nav aria-label="منوی اصلی" className="wrap hidden items-center gap-1 pb-2 md:flex">
          <div className="group relative">
            <Link href="/shop" className={NAV_LINK}>
              همهٔ محصولات
              <ChevronDown className="size-4 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden="true" />
            </Link>
            <div
              className="invisible absolute start-0 top-full w-[min(760px,90vw)] translate-y-1 rounded-b-2xl bg-lemon-50 p-6 opacity-0 shadow-[0_8px_8px_-6px_oklch(0.26_0.04_118/0.25)] ring-1 ring-olive-200 transition-[opacity,transform] duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
              style={{ zIndex: "var(--z-dropdown)" }}
            >
              <div className="grid grid-cols-2 gap-8">
                <CategoryColumn title="خوراک" group="food" categories={categories} />
                <CategoryColumn title="لوازم و اکسسوری" group="gear" categories={categories} />
              </div>
            </div>
          </div>
          <Link href="/category/seeds" className={NAV_LINK}>دان و دانه</Link>
          <Link href="/category/cages" className={NAV_LINK}>قفس</Link>
          <Link href="/category/toys" className={NAV_LINK}>اسباب‌بازی</Link>
          <span className="mx-2 h-4 w-px bg-olive-300" aria-hidden="true" />
          {birds.map((b) => (
            <Link key={b.slug} href={`/bird/${b.slug}`} className={NAV_LINK}>
              {b.name}
            </Link>
          ))}
          <Link href="/shop?sale=1" className={`${NAV_LINK} ms-auto text-clay-700`}>تخفیف‌ها</Link>
          <Link href="/blog" className={NAV_LINK}>راهنمای نگهداری</Link>
        </nav>
      </header>
    </>
  );
}

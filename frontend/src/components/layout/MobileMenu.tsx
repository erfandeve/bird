"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { BirdSpecies, Category } from "@/lib/types";
import { Drawer } from "./Drawer";

export function MobileMenu({ categories, birds }: { categories: Category[]; birds: BirdSpecies[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // eslint-disable-next-line react-hooks/set-state-in-effect -- منو با تغییر مسیر بسته می‌شود
  useEffect(() => setOpen(false), [pathname]);

  const LINK = "block rounded-lg px-2 py-2.5 text-[15px] hover:bg-lemon-200";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="باز کردن منو" className="grid size-11 place-items-center rounded-full text-olive-900 hover:bg-lemon-200 md:hidden">
        <Menu className="size-6" aria-hidden="true" />
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} side="start" label="منوی سایت">
        <div className="flex items-center justify-between border-b border-olive-200 p-4">
          <span className="font-display text-3xl font-semibold text-olive-800">منو</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="بستن منو" className="grid size-11 place-items-center rounded-full hover:bg-lemon-200">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav className="flex-1 space-y-6 overflow-y-auto p-4" aria-label="منوی موبایل">
          <section>
            <h2 className="mb-1 px-2 text-sm font-bold text-olive-700">بر اساس پرنده</h2>
            {birds.map((b) => (
              <Link key={b.slug} href={`/bird/${b.slug}`} className={LINK}>{b.name}</Link>
            ))}
          </section>
          <section>
            <h2 className="mb-1 px-2 text-sm font-bold text-olive-700">دسته‌بندی‌ها</h2>
            {categories.map((c) => (
              <Link key={c.slug} href={`/category/${c.slug}`} className={LINK}>{c.name}</Link>
            ))}
          </section>
          <section>
            <Link href="/shop" className={LINK}>همهٔ محصولات</Link>
            <Link href="/shop?sale=1" className={`${LINK} text-clay-700`}>تخفیف‌ها</Link>
            <Link href="/blog" className={LINK}>راهنمای نگهداری</Link>
            <Link href="/track" className={LINK}>پیگیری سفارش</Link>
            <Link href="/contact" className={LINK}>تماس با ما</Link>
          </section>
        </nav>
      </Drawer>
    </>
  );
}

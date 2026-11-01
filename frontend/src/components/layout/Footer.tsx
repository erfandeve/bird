import Link from "next/link";
import { getBirds, getCategories } from "@/lib/catalog";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";

function Column({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="mb-3 font-display text-2xl font-semibold text-lemon-200">{title}</h2>
      <ul className="space-y-1.5 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-block py-0.5 text-olive-100 transition-colors hover:text-lemon-300">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const [categories, birds] = await Promise.all([getCategories(), getBirds()]);
  return (
    <footer className="mt-20 bg-olive-900 pb-20 text-olive-100 md:pb-0">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo tone="light" large />
          <p className="mt-4 text-sm leading-7">
            فروشگاه آنلاین غذا و لوازم پرندگان خانگی. انتخاب از اینجا شروع می‌شود که پرندهٔ شما کیست.
          </p>
          <Newsletter />
        </div>
        <Column title="دسته‌بندی‌ها" links={categories.slice(0, 7).map((c) => ({ href: `/category/${c.slug}`, label: c.name }))} />
        <Column title="پرنده‌ها" links={birds.map((b) => ({ href: `/bird/${b.slug}`, label: b.name }))} />
        <Column
          title="راهنما"
          links={[
            { href: "/track", label: "پیگیری سفارش" },
            { href: "/shipping-returns", label: "ارسال و مرجوعی" },
            { href: "/faq", label: "پرسش‌های متداول" },
            { href: "/blog", label: "راهنمای نگهداری" },
            { href: "/about", label: "دربارهٔ ما" },
            { href: "/contact", label: "تماس با ما" },
          ]}
        />
      </div>
      <div className="border-t border-olive-700">
        <div className="wrap flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>{site.phone} · {site.hours}</p>
          <p className="flex gap-4">
            <Link href="/terms" className="hover:text-lemon-300">قوانین</Link>
            <Link href="/privacy" className="hover:text-lemon-300">حریم خصوصی</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

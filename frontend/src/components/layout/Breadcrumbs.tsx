import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { site } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  const all = [{ href: "/", label: "خانه" }, ...items];
  return (
    <nav aria-label="مسیر صفحه" className="py-4 text-sm text-olive-700">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${site.url}${item.href}` } : {}),
          })),
        }}
      />
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <ChevronLeft className="size-3.5" aria-hidden="true" />}
            {item.href && i < all.length - 1 ? (
              <Link href={item.href} className="hover:text-olive-950 hover:underline">{item.label}</Link>
            ) : (
              <span aria-current="page" className="text-olive-950">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

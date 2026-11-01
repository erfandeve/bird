import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Catalog, type RawParams } from "@/components/shop/Catalog";
import { getCategories, getSlugs } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<RawParams> };

export async function generateStaticParams() {
  return (await getSlugs()).category.map((slug) => ({ slug }));
}

// محتوای کامل برای سئو مهم‌تر از ناوبری آنی با اسکلت خالی است
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `خرید ${category.name} پرنده`,
    description: category.seoIntro.slice(0, 155),
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) notFound();
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ href: "/shop", label: "محصولات" }, { label: category.name }]} />
      <h1 className="font-display text-5xl font-bold text-olive-900 md:text-6xl">{category.name}</h1>
      <p className="mt-3 mb-8 max-w-[70ch] leading-8 text-olive-800">{category.seoIntro}</p>
      <Catalog path={`/category/${slug}`} base={{ category: [slug] }} searchParams={searchParams} />
    </div>
  );
}

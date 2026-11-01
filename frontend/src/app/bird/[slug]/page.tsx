import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PerchedBird } from "@/components/birds/PerchedBird";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Catalog, type RawParams } from "@/components/shop/Catalog";
import { getBirds, getSlugs } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<RawParams> };

export async function generateStaticParams() {
  return (await getSlugs()).bird.map((slug) => ({ slug }));
}

// محتوای کامل برای سئو مهم‌تر از ناوبری آنی با اسکلت خالی است
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const bird = (await getBirds()).find((b) => b.slug === slug);
  if (!bird) return {};
  return {
    title: `غذا و لوازم ${bird.name}`,
    description: bird.seoIntro.slice(0, 155),
    alternates: { canonical: `/bird/${slug}` },
  };
}

export default async function BirdPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const bird = (await getBirds()).find((b) => b.slug === slug);
  if (!bird) notFound();
  return (
    <>
      <div className="bg-lemon-200">
        <div className="wrap">
          <Breadcrumbs items={[{ href: "/shop", label: "محصولات" }, { label: bird.name }]} />
          <div className="flex items-end justify-between gap-6 pb-8">
            <div className="max-w-2xl">
              <h1 className="font-display text-5xl font-bold text-olive-900 md:text-6xl">غذا و لوازم {bird.name}</h1>
              <p className="mt-3 leading-8 text-olive-900">{bird.seoIntro}</p>
              <dl className="mt-4 grid gap-1 text-sm leading-7 sm:grid-cols-2 sm:gap-6">
                <div><dt className="font-bold">غذای پیشنهادی</dt><dd>{bird.diet}</dd></div>
                <div><dt className="font-bold">پرهیز کنید</dt><dd>{bird.avoid}</dd></div>
              </dl>
            </div>
            <svg viewBox="-60 -110 120 160" className="hidden h-44 shrink-0 overflow-visible md:block" aria-hidden="true" focusable="false">
              <rect x="-60" y="1" width="120" height="6" rx="3" fill="oklch(0.41 0.068 118)" />
              <PerchedBird look={bird.look} y={3} />
            </svg>
          </div>
        </div>
      </div>
      <div className="wrap pt-8">
        <Catalog path={`/bird/${slug}`} base={{ bird: [slug] }} searchParams={searchParams} />
      </div>
    </>
  );
}

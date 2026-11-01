import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/layout/JsonLd";
import { BuyBox } from "@/components/product/BuyBox";
import { Gallery } from "@/components/product/Gallery";
import { ProductSlider } from "@/components/product/ProductSlider";
import { ReviewForm } from "@/components/product/ReviewForm";
import { getCategories, getProduct, getRelated, getReviews, getSlugs, staticSlugParams } from "@/lib/catalog";
import { faDate, faNum } from "@/lib/format";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return staticSlugParams((await getSlugs()).product);
}

// محتوای کامل برای سئو مهم‌تر از ناوبری آنی با اسکلت خالی است
export const instant = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const description = `${product.name}: ${product.short}. خرید آنلاین با ارسال به سراسر ایران از ${site.name}.`;
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: { type: "website", title: product.name, description, url: `/product/${slug}` },
  };
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`size-4 ${n <= Math.round(value) ? "fill-lemon-500 text-lemon-500" : "text-olive-300"}`} />
      ))}
    </span>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [related, reviews, categories] = await Promise.all([getRelated(slug), getReviews(slug), getCategories()]);
  const category = categories.find((c) => c.slug === product.category)!;
  const prices = product.variants.map((v) => v.price);

  return (
    <div className="wrap">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description[0],
          sku: product.sku,
          brand: { "@type": "Brand", name: product.brand },
          category: category.name,
          ...(product.reviewCount > 0 && {
            aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
          }),
          ...(product.images.length > 0 && { image: product.images.map((src) => `${site.url}${src}`) }),
          offers: {
            "@type": "AggregateOffer",
            // schema.org واحد IRR می‌خواهد؛ قیمت‌ها در سایت تومان هستند
            priceCurrency: "IRR",
            lowPrice: Math.min(...prices) * 10,
            highPrice: Math.max(...prices) * 10,
            offerCount: product.variants.length,
            availability: product.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${site.url}/product/${product.slug}`,
          },
        }}
      />
      <Breadcrumbs
        items={[
          { href: "/shop", label: "محصولات" },
          { href: `/category/${category.slug}`, label: category.name },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <Gallery art={product.art} images={product.images} name={product.name} />
        <div>
          <p className="flex flex-wrap gap-x-1 text-sm text-olive-700">
            مناسب برای
            {product.birds.map((b, i) => (
              <span key={b}>
                <Link href={`/bird/${b}`} className="font-semibold text-olive-800 hover:underline">{product.birdNames[i]}</Link>
                {i < product.birds.length - 1 && "،"}
              </span>
            ))}
          </p>
          <h1 className="mt-2 font-display text-[2.75rem] leading-[1.15] font-bold text-olive-900 md:text-[3.25rem]">{product.name}</h1>
          <p className="mt-2 text-olive-800">{product.short}</p>
          <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-olive-800 hover:underline">
            <Stars value={product.rating} />
            {faNum(product.rating)} از ۵ · {faNum(product.reviewCount)} نظر
          </a>
          <BuyBox product={product} />
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="about-title">
          <h2 id="about-title" className="font-display text-4xl font-semibold text-olive-900">دربارهٔ این محصول</h2>
          <div className="prose-fa mt-3">
            {product.description.map((text) => <p key={text}>{text}</p>)}
          </div>
        </section>
        <section aria-labelledby="specs-title">
          <h2 id="specs-title" className="font-display text-4xl font-semibold text-olive-900">مشخصات</h2>
          <dl className="mt-3 divide-y divide-olive-200 border-y border-olive-200 text-sm">
            <div className="grid grid-cols-[110px_1fr] gap-3 py-3"><dt className="font-semibold">کد کالا</dt><dd dir="ltr" className="text-end">{product.sku}</dd></div>
            {product.specs.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[110px_1fr] gap-3 py-3">
                <dt className="font-semibold">{key}</dt>
                <dd className="leading-6 text-olive-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <section id="reviews" aria-labelledby="reviews-title" className="mt-14 scroll-mt-32">
        <h2 id="reviews-title" className="font-display text-4xl font-semibold text-olive-900">نظر خریداران</h2>
        <div className="mt-4 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          {reviews.length === 0 && <p className="text-olive-800">هنوز نظری ثبت نشده است. اولین نفر باشید.</p>}
          <ul className={reviews.length ? "divide-y divide-olive-200 border-y border-olive-200" : "hidden"}>
            {reviews.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-bold">{r.author}</span>
                  <Stars value={r.rating} />
                  <time dateTime={r.date} className="text-olive-700">{faDate(r.date)}</time>
                </div>
                <p className="mt-2 leading-7">{r.text}</p>
              </li>
            ))}
          </ul>
          <ReviewForm slug={product.slug} />
        </div>
      </section>

      <div className="mt-16">
        <ProductSlider id="related" title="شاید این‌ها را هم لازم داشته باشید" products={related} />
      </div>
    </div>
  );
}

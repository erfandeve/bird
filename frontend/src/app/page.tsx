import Link from "next/link";
import { Flock } from "@/components/birds/Flock";
import { Hero } from "@/components/home/Hero";
import { BirdWire } from "@/components/home/BirdWire";
import { CategoryShowcase } from "@/components/home/CategoryShowcase";
import { Countdown } from "@/components/home/Countdown";
import { FeedingGuide } from "@/components/home/FeedingGuide";
import { FaqList } from "@/components/home/Faq";
import { PostCard } from "@/components/home/PostCard";
import { ProductSlider } from "@/components/product/ProductSlider";
import { testimonials } from "@/lib/data/content";
import { getOnSale, getPosts, getTagged } from "@/lib/catalog";

export default async function HomePage() {
  const [bestsellers, fresh, onSale, posts] = await Promise.all([
    getTagged("bestseller"),
    getTagged("new"),
    getOnSale(),
    getPosts(),
  ]);

  return (
    <>
      <Flock />
      <Hero />
      <BirdWire />

      <div className="wrap pt-16 md:pt-24">
        <ProductSlider id="bestsellers" title="پرفروش‌ترین‌ها" note="آنچه خریداران بیشتر از همه انتخاب کرده‌اند." href="/shop?sort=popular" products={bestsellers} />
      </div>

      <CategoryShowcase />

      <section className="mt-16 bg-olive-800 py-14 md:mt-24 md:py-20">
        <div className="wrap">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
            <p className="max-w-xl text-lemon-100">
              <span className="block font-display text-5xl leading-tight font-bold text-lemon-200 md:text-6xl">تخفیف امروز</span>
              تا پایان شب، قیمت این محصولات پایین‌تر است.
            </p>
            <Countdown />
          </div>
          <ProductSlider id="on-sale" title="محصولات تخفیف‌دار" href="/shop?sale=1&sort=discount" products={onSale} dark />
        </div>
      </section>

      <div className="wrap pt-16 md:pt-24">
        <ProductSlider id="new-arrivals" title="تازه‌ها" note="جدیدترین محصولاتی که به فروشگاه اضافه شده‌اند." href="/shop?sort=newest" products={fresh} />
      </div>

      <FeedingGuide />

      <section aria-labelledby="voices-title" className="wrap pt-16 md:pt-24">
        <h2 id="voices-title" className="font-display text-4xl font-semibold text-olive-900 md:text-5xl">از زبان صاحب‌های پرنده</h2>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.name}>
              <blockquote className="font-display text-[1.75rem] leading-[1.45] text-olive-900">{t.text}</blockquote>
              <figcaption className="mt-3 text-sm text-olive-700">{t.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section aria-labelledby="journal-title" className="wrap pt-16 md:pt-24">
        <div className="mb-6 flex items-end justify-between">
          <h2 id="journal-title" className="font-display text-4xl font-semibold text-olive-900 md:text-5xl">راهنمای نگهداری</h2>
          <Link href="/blog" className="text-sm font-medium text-olive-800 underline-offset-4 hover:underline">همهٔ مطالب</Link>
        </div>
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          {posts.slice(0, 3).map((post, i) => <PostCard key={post.slug} post={post} large={i === 0} />)}
        </div>
      </section>

      <section aria-labelledby="faq-title" className="wrap grid gap-6 pt-16 md:grid-cols-[1fr_2fr] md:pt-24">
        <h2 id="faq-title" className="font-display text-4xl font-semibold text-olive-900 md:text-5xl">پرسش‌های پرتکرار</h2>
        <FaqList />
      </section>
    </>
  );
}

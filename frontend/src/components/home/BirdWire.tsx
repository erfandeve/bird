import Link from "next/link";
import { PerchedBird } from "@/components/birds/PerchedBird";
import { getBirds } from "@/lib/catalog";

/** خرید بر اساس پرنده: گونه‌ها روی یک سیم نشسته‌اند و هرکدام لینک است */
export async function BirdWire() {
  const birds = await getBirds();
  return (
    <section aria-labelledby="by-bird-title" className="wrap pt-16 md:pt-24">
      <h2 id="by-bird-title" className="font-display text-4xl leading-tight font-semibold text-olive-900 md:text-5xl">پرنده‌تان کدام است؟</h2>
      <p className="mt-1 text-sm text-olive-700">روی پرنده بزنید تا محصولات مناسب او را ببینید.</p>
      <div className="relative mt-8">
        <div className="absolute inset-x-0 top-[116px] h-2 rounded-full bg-gradient-to-b from-olive-500 via-olive-700 to-olive-900 md:top-[150px]" aria-hidden="true" />
        <ul className="no-scrollbar relative -mx-[clamp(16px,4vw,40px)] flex justify-between gap-2 overflow-x-auto px-[clamp(16px,4vw,40px)] md:mx-0 md:overflow-visible md:px-6">
          {birds.map((b, i) => (
            <li key={b.slug} className="shrink-0">
              <Link href={`/bird/${b.slug}`} className="group block w-32 text-center md:w-40">
                <svg viewBox="-55 -110 110 120" className="mx-auto block h-[120px] overflow-visible md:h-[155px]" aria-hidden="true" focusable="false">
                  <PerchedBird look={b.look} y={3} flip={i % 2 === 1} tiltDelay={i * 1.4} />
                </svg>
                <span className="mt-12 block font-display text-[1.75rem] leading-none font-semibold whitespace-nowrap text-olive-900 group-hover:text-olive-600">{b.name}</span>
                <span className="mt-1.5 block text-xs leading-5 text-olive-700">{b.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

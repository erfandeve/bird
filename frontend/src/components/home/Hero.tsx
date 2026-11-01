import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PerchedBird } from "@/components/birds/PerchedBird";
import { getBirds } from "@/lib/catalog";
import { birdLooks } from "@/lib/data/birds";

const look = (slug: string) => birdLooks[slug];

function Leaf({ x, y, r, s = 1, tone = "a" }: { x: number; y: number; r: number; s?: number; tone?: "a" | "b" }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0 C10 -18 34 -25 60 -12 C46 8 18 14 0 0 Z" fill={`url(#hero-leaf-${tone})`} />
      <path d="M2 0 C20 -6 38 -10 56 -12" fill="none" stroke="oklch(0.86 0.09 118)" strokeWidth="1.1" opacity="0.7" />
      <path d="M18 -5 L24 -13 M30 -8 L37 -15 M20 -4 L27 3 M33 -8 L40 -2" fill="none" stroke="oklch(0.86 0.09 118)" strokeWidth="0.6" opacity="0.5" />
    </g>
  );
}

function Berry({ x, y, r = 8 }: { x: number; y: number; r?: number }) {
  return <circle cx={x} cy={y} r={r} fill="url(#hero-berry)" />;
}

function Bough({ d, width }: { d: string; width: number }) {
  // سه لایه خط، سطح استوانه‌ای شاخه را می‌سازد
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke="oklch(0.3 0.045 70)" strokeWidth={width} />
      <path d={d} stroke="oklch(0.42 0.06 72)" strokeWidth={width * 0.68} transform="translate(0 -0.8)" />
      <path d={d} stroke="oklch(0.58 0.06 78)" strokeWidth={width * 0.22} transform={`translate(0 ${-width * 0.22})`} opacity="0.75" />
    </g>
  );
}

/** شاخه‌ای که از لبهٔ چپ وارد می‌شود و پرنده‌ها رویش نشسته‌اند */
function BranchScene() {
  return (
    <svg viewBox="0 0 620 460" className="h-auto w-full overflow-visible" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="hero-leaf-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.66 0.13 135)" />
          <stop offset="1" stopColor="oklch(0.42 0.1 140)" />
        </linearGradient>
        <linearGradient id="hero-leaf-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="oklch(0.72 0.11 125)" />
          <stop offset="1" stopColor="oklch(0.5 0.09 125)" />
        </linearGradient>
        <radialGradient id="hero-berry" cx="0.34" cy="0.3" r="0.8">
          <stop offset="0" stopColor="oklch(0.97 0.1 102)" />
          <stop offset="0.5" stopColor="oklch(0.86 0.17 95)" />
          <stop offset="1" stopColor="oklch(0.66 0.15 78)" />
        </radialGradient>
      </defs>

      <Bough d="M268 338 C306 298 346 272 404 252" width={9} />
      <Bough d="M92 346 C112 382 150 404 192 416" width={8} />
      <Leaf x={404} y={252} r={-30} s={1.35} />
      <Leaf x={382} y={262} r={-92} s={1.1} tone="b" />
      <Leaf x={350} y={276} r={20} s={1.05} tone="b" />
      <Leaf x={192} y={416} r={8} s={1.2} />
      <Leaf x={168} y={406} r={62} tone="b" />
      <Leaf x={138} y={388} r={-150} s={0.95} />
      <Bough d="M0 348 C96 332 170 366 262 340 C350 316 424 326 520 276 C552 260 586 250 618 240" width={17} />
      <Leaf x={70} y={344} r={-110} s={1.05} tone="b" />
      <Leaf x={520} y={276} r={-126} s={1.05} />
      <Leaf x={560} y={258} r={40} s={1.05} tone="b" />
      <Berry x={392} y={236} />
      <Berry x={412} y={228} r={7} />
      <Berry x={204} y={436} r={8} />
      <Berry x={226} y={424} r={6.5} />
      <Berry x={584} y={228} r={7.5} />

      <PerchedBird look={look("cockatiel")} x={170} y={345} size={1.5} tiltDelay={0} />
      <PerchedBird look={look("budgie")} x={306} y={331} size={1.45} tiltDelay={2.3} />
      <PerchedBird look={look("canary")} x={410} y={312} size={1.5} flip tiltDelay={4.1} />
      <PerchedBird look={look("finch")} x={486} y={287} size={1.45} tiltDelay={1.2} />
    </svg>
  );
}

export async function Hero() {
  const birds = await getBirds();
  return (
    <section className="relative isolate overflow-hidden bg-lemon-200">
      <div className="absolute -start-24 top-10 -z-10 size-[min(70vw,520px)] rounded-full bg-lemon-300 md:start-auto md:end-[8%] md:top-14" aria-hidden="true" />

      <div className="wrap relative grid items-center gap-2 pt-10 pb-28 md:min-h-[calc(100svh-150px)] md:grid-cols-[1.05fr_1fr] md:gap-4 md:pt-16 md:pb-52">
        <div className="relative max-w-2xl">
          <h1>
            <span className="block text-base font-semibold text-olive-800 md:text-lg">فروشگاه آنلاین غذا و لوازم پرنده</span>
            <span className="mt-3 block font-display text-[clamp(3.5rem,8vw,6rem)] leading-[1.02] font-bold text-olive-900">
              هر پرنده، <br />غذای خودش
            </span>
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-8 text-olive-900">
            پرنده‌تان را انتخاب کنید تا فقط دانه، قفس و اسباب‌بازی مناسب همان گونه را ببینید.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2" aria-label="خرید بر اساس پرنده">
            {birds.map((b) => (
              <li key={b.slug}>
                <Link href={`/bird/${b.slug}`} className="inline-flex min-h-11 items-center rounded-full bg-lemon-50 px-4 text-sm font-semibold text-olive-900 transition-colors hover:bg-olive-700 hover:text-lemon-50">
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="/shop" className="btn btn-primary mt-5">
            دیدن همهٔ محصولات
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="relative z-10 -mb-20 w-full self-end md:-mb-44">
          <BranchScene />
        </div>
      </div>

      {/* تپه‌های لایه‌ای پایین هیرو */}
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 -z-10 h-[150px] w-full md:h-[220px]" aria-hidden="true" focusable="false">
        <path d="M0 110 C220 40 420 150 720 100 C980 58 1200 30 1440 96 L1440 220 L0 220 Z" fill="oklch(0.78 0.072 118)" />
        <path d="M0 158 C260 96 520 196 820 150 C1060 112 1260 118 1440 160 L1440 220 L0 220 Z" fill="oklch(0.58 0.09 118)" />
        <path d="M0 196 C300 160 640 226 960 190 C1180 166 1320 178 1440 200 L1440 220 L0 220 Z" fill="oklch(0.41 0.068 118)" />
      </svg>
    </section>
  );
}

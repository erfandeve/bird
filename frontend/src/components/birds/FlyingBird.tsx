import { useId } from "react";
import { fan, feather, shade } from "./art";

export type BirdTone = "miloo" | "olive" | "lime" | "sage";

type Palette = { body: string; belly: string; head: string; wing: string; tip: string; tail: string; cheek: string; crest?: string };

const tones: Record<BirdTone, Palette> = {
  // همان عروس هلندی زرد لوگو
  miloo: { body: "oklch(0.88 0.15 100)", belly: "oklch(0.97 0.035 100)", head: "oklch(0.91 0.17 103)", wing: "oklch(0.95 0.07 100)", tip: "oklch(0.8 0.14 88)", tail: "oklch(0.86 0.13 92)", cheek: "oklch(0.72 0.16 32)", crest: "oklch(0.88 0.17 102)" },
  olive: { body: "oklch(0.6 0.1 118)", belly: "oklch(0.91 0.09 108)", head: "oklch(0.68 0.11 118)", wing: "oklch(0.56 0.09 118)", tip: "oklch(0.36 0.06 118)", tail: "oklch(0.42 0.07 118)", cheek: "oklch(0.72 0.12 50)" },
  lime: { body: "oklch(0.76 0.15 122)", belly: "oklch(0.93 0.11 108)", head: "oklch(0.89 0.15 106)", wing: "oklch(0.68 0.12 122)", tip: "oklch(0.45 0.08 118)", tail: "oklch(0.48 0.09 170)", cheek: "oklch(0.58 0.11 240)" },
  sage: { body: "oklch(0.72 0.05 135)", belly: "oklch(0.95 0.02 118)", head: "oklch(0.77 0.05 135)", wing: "oklch(0.62 0.05 135)", tip: "oklch(0.36 0.04 125)", tail: "oklch(0.4 0.04 125)", cheek: "oklch(0.74 0.13 45)" },
};

const primaries = fan(9, (i) => [58 + i * 3.4, 47 - i * 0.2], (i) => -116 + i * 9.5, (i) => 66 - i * 3.6, 7.6);
const secondaries = fan(8, (i) => [58 + i * 3.6, 47], (i) => -114 + i * 10, (i) => 41 - i * 1.7, 7);
const coverts = fan(7, (i) => [59 + i * 4, 47], (i) => -110 + i * 10.5, (i) => 21 - i * 0.5, 6.4);

const tailFeathers = [
  feather(96, 60, 24, 62, 7.2),
  feather(96, 62, 31, 66, 7.2),
  feather(95, 64, 38, 60, 7.2),
  feather(94, 66, 46, 50, 6.8),
];

function Wing({ c, gradient }: { c: Palette; gradient: string }) {
  return (
    <>
      {primaries.map((f, i) => (
        <g key={`p${i}`}>
          <path d={f.d} fill={`url(#${gradient}-p)`} stroke={shade(c.tip, -0.08)} strokeWidth="0.45" />
          <path d={f.rib} stroke={shade(c.wing, 0.12)} strokeWidth="0.5" opacity="0.65" fill="none" />
        </g>
      ))}
      {secondaries.map((f, i) => (
        <path key={`s${i}`} d={f.d} fill={`url(#${gradient}-s)`} stroke={shade(c.tip, -0.02)} strokeWidth="0.35" />
      ))}
      {coverts.map((f, i) => (
        <path key={`c${i}`} d={f.d} fill={`url(#${gradient}-c)`} stroke={shade(c.body, -0.14)} strokeWidth="0.3" />
      ))}
    </>
  );
}

/**
 * پرندهٔ در حال پرواز رو به چپ. بدن و هر بال لایهٔ جدایی در فضای سه‌بعدی CSS هستند،
 * پس بال‌ها واقعاً حول شانه می‌چرخند و در پرسپکتیو کوتاه و بلند می‌شوند.
 */
export function FlyingBird({ tone = "olive", className }: { tone?: BirdTone; className?: string }) {
  const c = tones[tone];
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const wingStops = (idSuffix: string, base: string, tip: string) => (
    <linearGradient id={`${id}${idSuffix}`} x1="0.5" y1="1" x2="0.5" y2="0">
      <stop offset="0" stopColor={shade(base, 0.05)} />
      <stop offset="0.55" stopColor={base} />
      <stop offset="1" stopColor={tip} />
    </linearGradient>
  );

  return (
    <div className={`bird3d ${className ?? ""}`} aria-hidden="true">
      <div className="bird3d-rig">
        <svg viewBox="0 -34 160 130" className="bird3d-wing-far" focusable="false">
          <defs>
            {wingStops("far-p", shade(c.wing, -0.1), shade(c.tip, -0.08))}
            {wingStops("far-s", shade(c.wing, -0.08), shade(c.tip, -0.03))}
            {wingStops("far-c", shade(c.body, -0.1), shade(c.body, -0.14))}
          </defs>
          <g transform="translate(-4 1)">
            <Wing c={c} gradient={`${id}far`} />
          </g>
        </svg>

        <svg viewBox="0 -34 160 130" className="bird3d-body" focusable="false">
          <defs>
            <radialGradient id={`${id}body`} cx="0.36" cy="0.2" r="0.95">
              <stop offset="0" stopColor={shade(c.body, 0.1)} />
              <stop offset="0.55" stopColor={c.body} />
              <stop offset="1" stopColor={shade(c.body, -0.2)} />
            </radialGradient>
            <radialGradient id={`${id}belly`} cx="0.35" cy="0.25" r="0.9">
              <stop offset="0" stopColor={c.belly} />
              <stop offset="0.75" stopColor={shade(c.belly, -0.05)} />
              <stop offset="1" stopColor={shade(c.belly, -0.2)} stopOpacity="0.7" />
            </radialGradient>
            <radialGradient id={`${id}head`} cx="0.34" cy="0.26" r="0.82">
              <stop offset="0" stopColor={shade(c.head, 0.09)} />
              <stop offset="0.6" stopColor={c.head} />
              <stop offset="1" stopColor={shade(c.head, -0.17)} />
            </radialGradient>
            <radialGradient id={`${id}cheek`}>
              <stop offset="0" stopColor={c.cheek} />
              <stop offset="0.65" stopColor={c.cheek} stopOpacity="0.85" />
              <stop offset="1" stopColor={c.cheek} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`${id}beak`} x1="0.2" y1="0" x2="0.6" y2="1">
              <stop offset="0" stopColor="oklch(0.88 0.08 60)" />
              <stop offset="1" stopColor="oklch(0.66 0.13 50)" />
            </linearGradient>
            <linearGradient id={`${id}tail`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={shade(c.tail, 0.07)} />
              <stop offset="1" stopColor={shade(c.tail, -0.12)} />
            </linearGradient>
            <radialGradient id={`${id}eye`} cx="0.36" cy="0.32" r="0.8">
              <stop offset="0" stopColor="oklch(0.34 0.04 60)" />
              <stop offset="1" stopColor="oklch(0.11 0.01 60)" />
            </radialGradient>
          </defs>

          {tailFeathers.map((d) => (
            <path key={d} d={d} fill={`url(#${id}tail)`} stroke={shade(c.tail, -0.18)} strokeWidth="0.45" />
          ))}

          {/* پنجه‌های جمع‌شده */}
          <g fill="none" stroke="oklch(0.72 0.09 25)" strokeWidth="2.2" strokeLinecap="round">
            <path d="M76 78 Q80 86 88 86 M80 86 Q84 90 89 90" />
          </g>

          <path d="M28 54 C30 34 52 26 74 31 C94 36 110 48 118 63 C102 78 80 84 58 80 C40 77 27 70 28 54 Z" fill={`url(#${id}body)`} />
          <path d="M30 60 C40 80 76 88 110 69 C88 72 54 72 30 60 Z" fill={`url(#${id}belly)`} />
          <g fill="none" stroke={shade(c.belly, -0.22)} strokeWidth="0.55" opacity="0.5" strokeLinecap="round">
            <path d="M44 72 q3 3 6 0 M54 75 q3 3 6 0 M64 76 q3 3 6 0 M74 75 q3 3 6 0 M84 73 q3 3 6 0" />
          </g>

          {c.crest && (
            <g stroke={shade(c.crest, -0.2)} strokeWidth="0.45">
              <path d={feather(48, 30, -38, 34, 4.6)} fill={c.crest} />
              <path d={feather(44, 28, -56, 36, 4.8)} fill={shade(c.crest, 0.03)} />
              <path d={feather(40, 28, -74, 30, 4.4)} fill={shade(c.crest, 0.06)} />
            </g>
          )}

          {/* سایهٔ زیر سر که به آن عمق می‌دهد */}
          <ellipse cx="50" cy="60" rx="20" ry="7" fill="oklch(0.2 0.03 118)" opacity="0.1" />
          <circle cx="44" cy="44" r="21" fill={`url(#${id}head)`} />
          <circle cx="37" cy="54" r="8.6" fill={`url(#${id}cheek)`} />

          <path d="M27 38 C18 39 12 44 12 50 C17 49 23 49 28 50 Z" fill={`url(#${id}beak)`} />
          <path d="M16 50 C20 54 25 54 29 51 C24 49.5 20 49.5 16 50 Z" fill="oklch(0.58 0.11 45)" />

          <circle cx="36" cy="40" r="5.4" fill="oklch(0.97 0.01 100)" opacity="0.65" />
          <circle cx="36" cy="40" r="4.5" fill={`url(#${id}eye)`} />
          <circle cx="34.5" cy="38.2" r="1.5" fill="white" />
          <circle cx="37.6" cy="41.8" r="0.7" fill="white" opacity="0.8" />
        </svg>

        <svg viewBox="0 -34 160 130" className="bird3d-wing-near" focusable="false">
          <defs>
            {wingStops("near-p", c.wing, c.tip)}
            {wingStops("near-s", shade(c.wing, 0.03), shade(c.tip, 0.08))}
            {wingStops("near-c", shade(c.body, 0.05), shade(c.body, -0.04))}
          </defs>
          <Wing c={c} gradient={`${id}near`} />
        </svg>
      </div>
    </div>
  );
}

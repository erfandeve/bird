import { useId } from "react";
import type { BirdLook } from "@/lib/types";
import { fan, feather, shade } from "./art";

const primaries = fan(7, () => [1, -47], (i) => 58 + i * 3.6, (i) => 60 - i * 3.2, 5.2);
const secondaries = fan(6, (i) => [-3 + i * 0.6, -48 + i * 0.5], (i) => 54 + i * 5, (i) => 38 - i * 1.6, 5.6);
const coverts = fan(6, (i) => [-6 + i * 1.4, -51 + i * 0.6], (i) => 48 + i * 6.5, (i) => 20 - i * 0.6, 5.4);
const tail = [
  feather(10, -18, 62, 58, 5.4),
  feather(11, -18, 70, 66, 5.6),
  feather(10, -18, 78, 62, 5.4),
  feather(8, -18, 86, 52, 5),
];

/**
 * پرندهٔ نشسته به‌صورت گروه SVG. نقطهٔ (0,0) همان جایی است که پنجه‌ها روی شاخه قرار می‌گیرند،
 * پس برای نشاندن روی هر شاخه‌ای فقط کافی است گروه را به آن نقطه منتقل کنیم.
 */
export function PerchedBird({
  look,
  x = 0,
  y = 0,
  size = 1,
  flip = false,
  tiltDelay = 0,
}: {
  look: BirdLook;
  x?: number;
  y?: number;
  size?: number;
  flip?: boolean;
  tiltDelay?: number;
}) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const s = size * look.scale;
  const feet = "oklch(0.74 0.08 28)";

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <defs>
        <radialGradient id={`${id}b`} cx="0.32" cy="0.22" r="0.95">
          <stop offset="0" stopColor={shade(look.body, 0.1)} />
          <stop offset="0.55" stopColor={look.body} />
          <stop offset="1" stopColor={shade(look.body, -0.2)} />
        </radialGradient>
        <radialGradient id={`${id}belly`} cx="0.42" cy="0.28" r="0.85">
          <stop offset="0" stopColor={shade(look.belly, 0.04)} />
          <stop offset="0.7" stopColor={look.belly} />
          <stop offset="1" stopColor={shade(look.belly, -0.14)} />
        </radialGradient>
        <radialGradient id={`${id}h`} cx="0.32" cy="0.26" r="0.85">
          <stop offset="0" stopColor={shade(look.head, 0.08)} />
          <stop offset="0.58" stopColor={look.head} />
          <stop offset="1" stopColor={shade(look.head, -0.17)} />
        </radialGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(look.wing, 0.05)} />
          <stop offset="1" stopColor={shade(look.wing, -0.13)} />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(look.wing, 0.13)} />
          <stop offset="1" stopColor={look.wing} />
        </linearGradient>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={shade(look.body, 0.05)} />
          <stop offset="1" stopColor={shade(look.body, -0.09)} />
        </linearGradient>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={shade(look.tail, 0.07)} />
          <stop offset="1" stopColor={shade(look.tail, -0.12)} />
        </linearGradient>
        {look.cheek && (
          <radialGradient id={`${id}ch`}>
            <stop offset="0" stopColor={look.cheek} />
            <stop offset="0.62" stopColor={look.cheek} stopOpacity="0.85" />
            <stop offset="1" stopColor={look.cheek} stopOpacity="0" />
          </radialGradient>
        )}
        <linearGradient id={`${id}bk`} x1="0.8" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor={shade(look.beak, 0.14)} />
          <stop offset="1" stopColor={shade(look.beak, -0.1)} />
        </linearGradient>
        <radialGradient id={`${id}e`} cx="0.36" cy="0.32" r="0.8">
          <stop offset="0" stopColor="oklch(0.34 0.04 60)" />
          <stop offset="1" stopColor="oklch(0.11 0.01 60)" />
        </radialGradient>
      </defs>

      <ellipse cx="1" cy="3" rx="17" ry="3.6" fill="oklch(0.2 0.03 118)" opacity="0.28" />

      <g className="bird-hop">
        {tail.map((d) => (
          <path key={d} d={d} fill={`url(#${id}t)`} stroke={shade(look.tail, -0.18)} strokeWidth="0.45" />
        ))}

        <path d="M-20 -38 C-28 -20 -18 -2 -2 -3 C12 -4 22 -15 22 -31 C22 -49 10 -60 -4 -60 C-13 -60 -18 -50 -20 -38 Z" fill={`url(#${id}b)`} />
        <path d="M-20 -40 C-27 -21 -17 -4 -3 -4 C2 -18 -5 -36 -20 -40 Z" fill={`url(#${id}belly)`} />
        <g fill="none" stroke={shade(look.belly, -0.2)} strokeWidth="0.6" strokeLinecap="round" opacity="0.55">
          <path d="M-19 -30 q2.6 2.6 5 0 M-12 -32 q2.6 2.6 5 0 M-18 -22 q2.6 2.6 5 0 M-11 -24 q2.6 2.6 5 0 M-14 -14 q2.6 2.6 5 0 M-7 -16 q2.6 2.6 5 0" />
        </g>

        {primaries.map((f, i) => (
          <g key={`p${i}`}>
            <path d={f.d} fill={`url(#${id}p)`} stroke={shade(look.wing, -0.2)} strokeWidth="0.4" />
            <path d={f.rib} stroke={shade(look.wing, 0.2)} strokeWidth="0.4" opacity="0.5" fill="none" />
          </g>
        ))}
        {secondaries.map((f, i) => (
          <path key={`s${i}`} d={f.d} fill={`url(#${id}s)`} stroke={shade(look.wing, -0.16)} strokeWidth="0.35" />
        ))}
        {coverts.map((f, i) => (
          <path key={`c${i}`} d={f.d} fill={`url(#${id}c)`} stroke={shade(look.body, -0.17)} strokeWidth="0.3" />
        ))}

        {/* پنجه‌ها دور شاخه حلقه می‌شوند */}
        <g fill="none" stroke={feet} strokeWidth="2.7" strokeLinecap="round">
          <path d="M-8 -6 L-9 0 M-13 4 Q-13 -1 -9 0 Q-5 -1 -5 4 M-9 0 L-9 5" />
          <path d="M2 -5 L3 0 M-1 4 Q-1 -1 3 0 Q7 -1 7 4 M3 0 L3 5" />
        </g>

        <g className="perched-head" style={{ ["--tilt-delay" as string]: `${tiltDelay}s` }}>
          {look.crest && (
            <g stroke={shade(look.crest, -0.2)} strokeWidth="0.45">
              <path d={feather(-1, -74, -40, 30, 4.4)} fill={look.crest} />
              <path d={feather(-4, -76, -58, 32, 4.6)} fill={shade(look.crest, 0.03)} />
              <path d={feather(-7, -77, -76, 27, 4.2)} fill={shade(look.crest, 0.06)} />
            </g>
          )}
          <ellipse cx="-6" cy="-47" rx="14" ry="5" fill="oklch(0.2 0.03 118)" opacity="0.12" />
          <circle cx="-8" cy="-62" r="17" fill={`url(#${id}h)`} />
          {look.cheek && <circle cx="-14" cy="-54.5" r="6.2" fill={`url(#${id}ch)`} />}
          {look.hooked ? (
            <>
              <path d="M-22 -70 C-33 -71 -38 -60 -33 -48 C-30 -54 -26 -57 -21 -58 Z" fill={`url(#${id}bk)`} />
              <path d="M-23 -58 C-28 -57 -29 -53 -27 -50 C-24 -51 -21 -53 -20 -56 Z" fill={shade(look.beak, 0.08)} />
            </>
          ) : (
            <>
              <path d="M-23 -68 C-29 -67 -35 -63 -36 -59 C-31 -58 -26 -58 -22 -59 Z" fill={`url(#${id}bk)`} />
              <path d="M-33 -59 C-30 -55.5 -26 -55 -22.5 -57.5 C-26 -59 -30 -59.5 -33 -59 Z" fill={shade(look.beak, -0.13)} />
            </>
          )}
          <circle cx="-14" cy="-66" r="4.4" fill="oklch(0.97 0.01 100)" opacity="0.6" />
          <circle cx="-14" cy="-66" r="3.7" fill={`url(#${id}e)`} />
          <circle cx="-15.2" cy="-67.4" r="1.25" fill="white" />
          <circle cx="-12.8" cy="-64.6" r="0.6" fill="white" opacity="0.8" />
        </g>
      </g>
    </g>
  );
}

import type { ArtKind, ArtTone } from "@/lib/types";

/*
 * طرح جایگزین محصول تا زمانی که عکس واقعی از بک‌اند برسد.
 * اشیاء ساده و هندسی‌اند و همه روی یک بوم ۴۰۰×۴۰۰ کشیده شده‌اند.
 */

type Palette = { plate: string; main: string; dark: string; light: string; label: string; ink: string };

export const artPalettes: Record<ArtTone, Palette> = {
  olive: { plate: "oklch(0.93 0.034 118)", main: "oklch(0.49 0.082 118)", dark: "oklch(0.37 0.06 118)", light: "oklch(0.62 0.09 118)", label: "oklch(0.97 0.034 108)", ink: "oklch(0.26 0.04 118)" },
  lemon: { plate: "oklch(0.95 0.06 108)", main: "oklch(0.87 0.125 106)", dark: "oklch(0.72 0.12 104)", light: "oklch(0.93 0.09 106)", label: "oklch(0.33 0.053 118)", ink: "oklch(0.97 0.034 108)" },
  sage: { plate: "oklch(0.94 0.024 135)", main: "oklch(0.68 0.06 135)", dark: "oklch(0.52 0.06 135)", light: "oklch(0.8 0.05 135)", label: "oklch(0.98 0.012 108)", ink: "oklch(0.3 0.04 130)" },
  moss: { plate: "oklch(0.91 0.03 125)", main: "oklch(0.36 0.05 125)", dark: "oklch(0.27 0.04 125)", light: "oklch(0.5 0.06 125)", label: "oklch(0.92 0.09 108)", ink: "oklch(0.26 0.04 118)" },
  honey: { plate: "oklch(0.95 0.045 92)", main: "oklch(0.76 0.12 82)", dark: "oklch(0.6 0.11 72)", light: "oklch(0.84 0.1 86)", label: "oklch(0.98 0.02 100)", ink: "oklch(0.33 0.06 70)" },
  clay: { plate: "oklch(0.94 0.03 55)", main: "oklch(0.66 0.11 48)", dark: "oklch(0.52 0.11 44)", light: "oklch(0.76 0.09 52)", label: "oklch(0.98 0.015 90)", ink: "oklch(0.32 0.07 44)" },
};

const Mark = ({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    fill={fill}
    d="M0 16 C2 8 8 3 14 4 C18 0 25 1 27 6 L34 9 L27 11 C26 19 19 25 10 25 C6 25 2 24 -2 21 C2 21 5 19 6 16 C4 18 2 18 0 16 Z"
  />
);

const Shadow = ({ rx = 110, y = 348 }: { rx?: number; y?: number }) => (
  <ellipse cx="200" cy={y} rx={rx} ry="11" fill="oklch(0.26 0.04 118)" opacity="0.13" />
);

const seedDots: [number, number, number][] = [
  [84, 340, 6], [104, 352, 5], [66, 354, 5], [316, 344, 6], [338, 355, 5], [296, 356, 4],
];

function kindArt(kind: ArtKind, c: Palette) {
  switch (kind) {
    case "pouch":
      return (
        <>
          <Shadow />
          {seedDots.map(([x, y, r]) => (
            <ellipse key={x} cx={x} cy={y} rx={r} ry={r * 0.68} fill={c.dark} transform={`rotate(${x % 40} ${x} ${y})`} />
          ))}
          <path d="M108 72 L292 72 C298 130 306 240 302 330 C302 341 296 348 286 348 L114 348 C104 348 98 341 98 330 C94 240 102 130 108 72 Z" fill={c.main} />
          <path d="M108 72 L292 72 L294 104 L106 104 Z" fill={c.dark} />
          <path d="M118 112 C112 180 110 260 114 336" stroke={c.light} strokeWidth="12" strokeLinecap="round" fill="none" opacity="0.5" />
          <rect x="136" y="142" width="128" height="150" rx="10" fill={c.label} />
          <Mark x={178} y={160} s={1.3} fill={c.ink} />
          <rect x="156" y="212" width="88" height="8" rx="4" fill={c.ink} />
          <rect x="170" y="230" width="60" height="6" rx="3" fill={c.ink} opacity="0.55" />
          <rect x="164" y="258" width="72" height="16" rx="8" fill={c.dark} opacity="0.85" />
        </>
      );
    case "jar":
      return (
        <>
          <Shadow rx={92} />
          <rect x="124" y="60" width="152" height="46" rx="10" fill={c.dark} />
          <rect x="124" y="92" width="152" height="14" fill={c.ink} opacity="0.14" />
          <path d="M116 112 C116 106 122 104 128 104 L272 104 C278 104 284 106 284 112 L296 148 L296 326 C296 340 288 348 276 348 L124 348 C112 348 104 340 104 326 L104 148 Z" fill={c.main} />
          <rect x="118" y="146" width="12" height="176" rx="6" fill={c.light} opacity="0.6" />
          <rect x="104" y="178" width="192" height="116" fill={c.label} />
          <Mark x={182} y={192} s={1.05} fill={c.ink} />
          <rect x="150" y="240" width="100" height="8" rx="4" fill={c.ink} />
          <rect x="170" y="258" width="60" height="6" rx="3" fill={c.ink} opacity="0.55" />
        </>
      );
    case "box":
      return (
        <>
          <Shadow rx={112} />
          <path d="M112 112 L142 76 L318 76 L288 112 Z" fill={c.light} />
          <path d="M288 112 L318 76 L318 312 L288 348 Z" fill={c.dark} />
          <rect x="82" y="112" width="206" height="236" fill={c.main} />
          <rect x="106" y="156" width="158" height="118" rx="8" fill={c.label} />
          <Mark x={166} y={170} s={1.15} fill={c.ink} />
          <rect x="136" y="218" width="98" height="8" rx="4" fill={c.ink} />
          <rect x="156" y="238" width="58" height="6" rx="3" fill={c.ink} opacity="0.55" />
          <circle cx="116" cy="312" r="8" fill={c.light} />
          <circle cx="142" cy="312" r="8" fill={c.light} />
          <circle cx="168" cy="312" r="8" fill={c.light} />
        </>
      );
    case "bottle":
      return (
        <>
          <Shadow rx={78} />
          <rect x="170" y="52" width="60" height="26" rx="6" fill={c.dark} />
          <rect x="182" y="30" width="36" height="26" rx="6" fill={c.ink} />
          <path d="M176 78 L224 78 L224 104 C224 118 276 122 276 170 L276 328 C276 340 268 348 256 348 L144 348 C132 348 124 340 124 328 L124 170 C124 122 176 118 176 104 Z" fill={c.main} />
          <rect x="138" y="168" width="11" height="160" rx="5" fill={c.light} opacity="0.65" />
          <rect x="124" y="196" width="152" height="104" fill={c.label} />
          <Mark x={182} y={208} s={1} fill={c.ink} />
          <rect x="156" y="252" width="88" height="7" rx="3.5" fill={c.ink} />
          <rect x="172" y="270" width="56" height="6" rx="3" fill={c.ink} opacity="0.55" />
        </>
      );
    case "cage":
      return (
        <>
          <Shadow rx={128} />
          <path d="M84 148 C84 84 136 54 200 54 C264 54 316 84 316 148 Z" fill="none" stroke={c.main} strokeWidth="9" />
          <circle cx="200" cy="44" r="13" fill="none" stroke={c.main} strokeWidth="8" />
          {[110, 136, 162, 188, 212, 238, 264, 290].map((x) => (
            <line key={x} x1={x} y1={x < 130 || x > 270 ? 118 : 72} x2={x} y2="312" stroke={c.main} strokeWidth="5" />
          ))}
          <path d="M162 62 C150 88 148 118 148 148 M238 62 C250 88 252 118 252 148" stroke={c.main} strokeWidth="5" fill="none" />
          <rect x="80" y="144" width="240" height="10" rx="5" fill={c.main} />
          <rect x="76" y="304" width="248" height="42" rx="7" fill={c.dark} />
          <rect x="88" y="318" width="224" height="6" rx="3" fill={c.light} />
          <rect x="104" y="240" width="192" height="9" rx="4.5" fill="oklch(0.6 0.09 68)" />
          <path d="M188 240 C182 214 192 196 208 194 C224 194 230 210 222 224 C218 234 214 238 212 240 Z" fill={c.dark} />
          <circle cx="204" cy="186" r="14" fill={c.dark} />
          <path d="M191 182 L181 187 L192 191 Z" fill="oklch(0.74 0.11 68)" />
        </>
      );
    case "perch":
      return (
        <>
          <Shadow rx={132} y={316} />
          <path d="M60 248 C96 226 124 244 164 226 C208 208 236 224 276 198 C300 184 322 184 342 174" fill="none" stroke={c.dark} strokeWidth="26" strokeLinecap="round" />
          <path d="M60 248 C96 226 124 244 164 226 C208 208 236 224 276 198" fill="none" stroke={c.light} strokeWidth="7" strokeLinecap="round" opacity="0.55" transform="translate(0 -6)" />
          <path d="M226 220 C232 196 252 180 280 158" fill="none" stroke={c.dark} strokeWidth="14" strokeLinecap="round" />
          <path d="M342 174 C352 178 358 186 358 196 L340 202 Z" fill={c.main} />
          <rect x="50" y="236" width="22" height="42" rx="6" fill="oklch(0.55 0.015 118)" />
          <circle cx="61" cy="290" r="15" fill="oklch(0.4 0.02 118)" />
          <path d="M280 158 C296 134 322 130 340 134 C332 156 306 170 280 158 Z" fill="oklch(0.58 0.09 118)" />
        </>
      );
    case "swing":
      return (
        <>
          <Shadow rx={82} y={346} />
          <circle cx="200" cy="48" r="15" fill="none" stroke="oklch(0.55 0.015 118)" strokeWidth="7" />
          <path d="M200 62 L108 266 M200 62 L292 266" stroke={c.dark} strokeWidth="6" strokeLinecap="round" />
          <rect x="92" y="262" width="216" height="24" rx="12" fill={c.main} />
          <rect x="108" y="266" width="60" height="6" rx="3" fill={c.light} />
          {[[148, 158, c.main], [176, 112, c.light], [252, 158, c.main], [224, 112, c.light]].map(([x, y, f]) => (
            <circle key={`${x}${y}`} cx={x as number} cy={y as number} r="15" fill={f as string} />
          ))}
          <circle cx="132" cy="206" r="13" fill={c.dark} />
          <circle cx="268" cy="206" r="13" fill={c.dark} />
          <circle cx="200" cy="322" r="15" fill="oklch(0.84 0.13 100)" />
          <line x1="200" y1="286" x2="200" y2="308" stroke={c.dark} strokeWidth="5" />
        </>
      );
    case "toy":
      return (
        <>
          <Shadow rx={78} />
          <circle cx="200" cy="42" r="14" fill="none" stroke="oklch(0.55 0.015 118)" strokeWidth="7" />
          <line x1="200" y1="56" x2="200" y2="108" stroke={c.dark} strokeWidth="7" />
          <circle cx="200" cy="184" r="80" fill={c.main} />
          <path d="M126 158 C168 188 232 188 274 158 M122 196 C168 228 232 228 278 196 M200 104 C176 148 176 220 200 264 M200 104 C224 148 224 220 200 264" stroke={c.dark} strokeWidth="6" fill="none" />
          <path d="M152 136 C160 124 172 116 184 114" stroke={c.light} strokeWidth="9" strokeLinecap="round" fill="none" />
          <line x1="200" y1="264" x2="200" y2="290" stroke={c.dark} strokeWidth="5" />
          <path d="M176 322 C176 298 186 288 200 288 C214 288 224 298 224 322 L232 332 L168 332 Z" fill="oklch(0.84 0.13 96)" />
          <circle cx="200" cy="336" r="7" fill={c.dark} />
        </>
      );
    case "feeder":
      return (
        <>
          <Shadow rx={92} />
          <rect x="150" y="52" width="100" height="24" rx="8" fill={c.dark} />
          <path d="M146 76 L254 76 L254 244 L146 244 Z" fill={c.label} stroke={c.main} strokeWidth="6" />
          <rect x="149" y="146" width="102" height="96" fill="oklch(0.84 0.1 88)" />
          {[[166, 170], [190, 160], [214, 176], [234, 158], [178, 200], [204, 212], [230, 200], [162, 226], [222, 228]].map(([x, y]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="6" ry="4" fill="oklch(0.62 0.1 72)" />
          ))}
          <rect x="160" y="96" width="9" height="36" rx="4.5" fill={c.light} opacity="0.7" />
          <path d="M104 244 L296 244 L282 328 C281 340 272 348 260 348 L140 348 C128 348 119 340 118 328 Z" fill={c.main} />
          <rect x="96" y="238" width="208" height="16" rx="8" fill={c.dark} />
        </>
      );
    case "bath":
      return (
        <>
          <Shadow rx={124} />
          <path d="M84 106 L316 106 L316 334 C316 342 310 348 302 348 L98 348 C90 348 84 342 84 334 Z" fill={c.plate} stroke={c.dark} strokeWidth="7" />
          <path d="M84 106 C84 76 108 56 138 56 L262 56 C292 56 316 76 316 106 Z" fill={c.main} />
          <rect x="88" y="252" width="224" height="92" rx="5" fill="oklch(0.84 0.06 215)" />
          <path d="M88 258 C118 244 144 270 176 258 C208 246 236 270 268 258 C284 252 298 252 312 258" fill="none" stroke="oklch(0.97 0.02 215)" strokeWidth="6" strokeLinecap="round" />
          <rect x="104" y="214" width="192" height="9" rx="4.5" fill="oklch(0.6 0.09 68)" />
          <circle cx="146" cy="294" r="8" fill="oklch(0.97 0.02 215)" opacity="0.7" />
          <circle cx="248" cy="310" r="6" fill="oklch(0.97 0.02 215)" opacity="0.7" />
        </>
      );
    case "nest":
      return (
        <>
          <Shadow rx={118} />
          <path d="M200 58 L334 154 L66 154 Z" fill={c.dark} />
          <rect x="88" y="150" width="224" height="198" fill={c.main} />
          <rect x="88" y="150" width="224" height="18" fill={c.ink} opacity="0.15" />
          <circle cx="200" cy="238" r="50" fill={c.ink} />
          <circle cx="200" cy="238" r="50" fill="none" stroke={c.light} strokeWidth="7" />
          <rect x="150" y="302" width="100" height="11" rx="5.5" fill={c.light} />
          <ellipse cx="190" cy="262" rx="11" ry="14" fill={c.label} />
          <ellipse cx="212" cy="264" rx="11" ry="14" fill={c.label} opacity="0.85" />
        </>
      );
    case "ladder":
      return (
        <>
          <Shadow rx={84} />
          <rect x="132" y="48" width="16" height="298" rx="8" fill={c.dark} transform="rotate(-6 140 198)" />
          <rect x="252" y="48" width="16" height="298" rx="8" fill={c.dark} transform="rotate(6 260 198)" />
          {[88, 134, 180, 226, 272, 318].map((y, i) => {
            const spread = 2.5 + i * 4.8;
            return <rect key={y} x={143 - spread} y={y} width={114 + spread * 2} height="15" rx="7.5" fill={c.main} />;
          })}
          <circle cx="156" cy="38" r="9" fill="none" stroke="oklch(0.55 0.015 118)" strokeWidth="5" />
          <circle cx="244" cy="38" r="9" fill="none" stroke="oklch(0.55 0.015 118)" strokeWidth="5" />
        </>
      );
  }
}

export function ProductArt({
  kind,
  tone,
  label,
  zoom = 1,
  focus,
  className,
}: {
  kind: ArtKind;
  tone: ArtTone;
  label: string;
  zoom?: number;
  focus?: [number, number];
  className?: string;
}) {
  const c = artPalettes[tone];
  const size = 400 / zoom;
  const [fx, fy] = focus ?? [200, 200];
  const viewBox = `${fx - size / 2} ${fy - size / 2} ${size} ${size}`;
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className={className} style={{ background: c.plate }}>
      {kindArt(kind, c)}
    </svg>
  );
}

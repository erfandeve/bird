import type { BirdLook } from "../types";

/** ظاهر تصویرسازی هر گونه؛ مشخصات متنی پرنده‌ها از API می‌آید */
export const birdLooks: Record<string, BirdLook> = {
  budgie: { body: "oklch(0.72 0.14 125)", belly: "oklch(0.9 0.13 108)", wing: "oklch(0.42 0.06 118)", head: "oklch(0.92 0.12 106)", beak: "oklch(0.72 0.09 60)", tail: "oklch(0.4 0.07 200)", cheek: "oklch(0.55 0.1 240)", scale: 0.9 },
  canary: { body: "oklch(0.88 0.15 100)", belly: "oklch(0.95 0.09 105)", wing: "oklch(0.8 0.14 92)", head: "oklch(0.88 0.15 100)", beak: "oklch(0.8 0.08 70)", tail: "oklch(0.74 0.13 90)", scale: 0.82 },
  cockatiel: { body: "oklch(0.68 0.012 100)", belly: "oklch(0.8 0.012 100)", wing: "oklch(0.5 0.012 100)", head: "oklch(0.92 0.1 104)", beak: "oklch(0.5 0.015 80)", tail: "oklch(0.42 0.012 100)", cheek: "oklch(0.7 0.15 50)", crest: "oklch(0.9 0.12 102)", scale: 1 },
  finch: { body: "oklch(0.58 0.05 70)", belly: "oklch(0.93 0.02 100)", wing: "oklch(0.4 0.03 70)", head: "oklch(0.52 0.02 240)", beak: "oklch(0.64 0.18 40)", tail: "oklch(0.24 0.02 100)", cheek: "oklch(0.68 0.14 50)", scale: 0.72 },
  parrot: { body: "oklch(0.6 0.012 240)", belly: "oklch(0.7 0.012 240)", wing: "oklch(0.47 0.012 240)", head: "oklch(0.66 0.012 240)", beak: "oklch(0.25 0.01 100)", tail: "oklch(0.58 0.17 28)", scale: 1.1, hooked: true },
};

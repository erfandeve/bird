import type { ReactNode } from "react";
import { PerchedBird } from "@/components/birds/PerchedBird";
import { birdLooks } from "@/lib/data/birds";

export function AuthCard({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  const { canary, budgie } = birdLooks;
  return (
    <div className="wrap grid items-center gap-10 py-10 md:min-h-[70vh] md:grid-cols-2 md:py-16">
      <div>
        <h1 className="font-display text-5xl font-bold text-olive-900">{title}</h1>
        <p className="mt-2 mb-6 text-olive-800">{note}</p>
        <div className="max-w-md">{children}</div>
      </div>
      <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl bg-lemon-200 md:block" aria-hidden="true">
        <div className="absolute -start-10 -top-10 size-64 rounded-full bg-lemon-300" />
        <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" focusable="false">
          <path d="M0 214 C80 196 160 236 250 204 C310 182 360 190 400 176" stroke="oklch(0.41 0.068 118)" strokeWidth="11" fill="none" strokeLinecap="round" />
          <PerchedBird look={canary} x={150} y={214} size={1.8} />
          <PerchedBird look={budgie} x={280} y={196} size={1.7} flip tiltDelay={2} />
        </svg>
      </div>
    </div>
  );
}

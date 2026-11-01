"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductArt } from "./ProductArt";
import type { Product } from "@/lib/types";

const VIEWS: { label: string; zoom: number; focus?: [number, number] }[] = [
  { label: "نمای کامل", zoom: 1 },
  { label: "نمای نزدیک", zoom: 1.7, focus: [200, 210] },
  { label: "جزئیات", zoom: 2.5, focus: [200, 130] },
];

const LARGE = "(max-width: 1024px) 100vw, 50vw";

export function Gallery({ art, images, name }: { art: Product["art"]; images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const count = images.length || VIEWS.length;
  const index = Math.min(active, count - 1);
  const view = VIEWS[index];

  return (
    <div className="lg:sticky lg:top-36 lg:self-start">
      {images.length ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-olive-100">
          <Image src={images[index]} alt={name} fill sizes={LARGE} priority className="object-cover" />
        </div>
      ) : (
        <ProductArt kind={art.kind} tone={art.tone} label={`${name}، ${view.label}`} zoom={view.zoom} focus={view.focus} className="aspect-square w-full rounded-2xl" />
      )}
      <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto p-1" role="group" aria-label="نماهای محصول">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={images.length ? `عکس ${i + 1}` : VIEWS[i].label}
            aria-pressed={index === i}
            onClick={() => setActive(i)}
            className={`relative size-20 shrink-0 overflow-hidden rounded-xl outline-offset-2 transition-opacity ${index === i ? "outline-2 outline-olive-700" : "opacity-75 hover:opacity-100"}`}
          >
            {images.length ? (
              <Image src={images[i]} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <ProductArt kind={art.kind} tone={art.tone} label="" zoom={VIEWS[i].zoom} focus={VIEWS[i].focus} className="block size-20" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

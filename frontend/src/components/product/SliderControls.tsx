"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function SliderControls({ target, dark }: { target: string; dark?: boolean }) {
  const move = (direction: 1 | -1) => {
    const el = document.getElementById(target);
    // در RTL مقدار scrollLeft منفی است؛ «بعدی» یعنی حرکت به سمت چپ
    el?.scrollBy({ left: -direction * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const cls = `hidden size-11 place-items-center rounded-full transition-colors sm:grid ${dark ? "bg-olive-700 text-lemon-100 hover:bg-olive-600" : "bg-olive-100 text-olive-900 hover:bg-olive-200"}`;
  return (
    <>
      <button type="button" className={cls} aria-label="محصولات قبلی" onClick={() => move(-1)}>
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
      <button type="button" className={cls} aria-label="محصولات بعدی" onClick={() => move(1)}>
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
    </>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { FlyingBird, type BirdTone } from "./FlyingBird";

type Bird = {
  id: number;
  tone: BirdTone;
  style: CSSProperties;
};

const TONES: BirdTone[] = ["miloo", "miloo", "lime", "olive", "sage"];
const MAX_ALIVE = 18;
const MAX_ALIVE_SMALL = 8;
const SCROLL_GAP_MS = 850;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** یک دسته پرنده با آرایش V که از راست صفحه به چپ می‌روند */
function makeFlock(count: number, startId: number): Bird[] {
  const small = window.innerWidth < 768;
  const depth = Math.random();
  const size = (small ? 62 : 118) * (0.75 + depth * 0.65);
  const dur = (small ? rand(4.2, 5.6) : rand(6, 7.5)) - depth * 1.5;
  // از زیر هدر شروع می‌شود تا پرنده‌ها روی نوار بالا نیفتند
  const top = rand(26, 66);
  return Array.from({ length: count }, (_, i) => {
    const rank = Math.ceil(i / 2);
    const side = i % 2 === 0 ? 1 : -1;
    const scale = rand(0.82, 1.08);
    return {
      id: startId + i,
      tone: TONES[Math.floor(Math.random() * TONES.length)],
      style: {
        "--top": `calc(${top}vh + ${rank * side * (small ? 26 : 42)}px)`,
        "--size": `${Math.round(size * scale)}px`,
        "--dur": `${(dur * rand(0.97, 1.05)).toFixed(2)}s`,
        "--delay": `${(rank * 0.34 + rand(0, 0.12)).toFixed(2)}s`,
        "--drift": `${Math.round(rand(-90, 30))}px`,
        "--alpha": (0.72 + depth * 0.28).toFixed(2),
        "--bob": `${rand(0.9, 1.5).toFixed(2)}s`,
        "--flap": `${Math.round(rand(190, 270))}ms`,
      } as CSSProperties,
    };
  });
}

export function Flock() {
  const [birds, setBirds] = useState<Bird[]>([]);
  const nextId = useRef(0);

  const launch = useCallback((count: number) => {
    setBirds((alive) => {
      const room = (window.innerWidth < 768 ? MAX_ALIVE_SMALL : MAX_ALIVE) - alive.length;
      if (room <= 0) return alive;
      const flock = makeFlock(Math.min(count, room), nextId.current);
      nextId.current += flock.length;
      return [...alive, ...flock];
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const opening = window.setTimeout(() => launch(5), 250);
    const second = window.setTimeout(() => launch(3), 1900);

    let last = 0;
    const onScroll = () => {
      const now = performance.now();
      if (now - last < SCROLL_GAP_MS) return;
      last = now;
      launch(3 + Math.floor(Math.random() * 3));
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(opening);
      window.clearTimeout(second);
      window.removeEventListener("scroll", onScroll);
    };
  }, [launch]);

  return (
    <div className="flock-layer" aria-hidden="true">
      {birds.map((bird) => (
        <div
          key={bird.id}
          className="flock-bird"
          style={bird.style}
          onAnimationEnd={(e) => {
            if (e.animationName === "bird-cross" || e.target === e.currentTarget) {
              setBirds((alive) => alive.filter((b) => b.id !== bird.id));
            }
          }}
        >
          <div className="flock-bob">
            <FlyingBird tone={bird.tone} />
          </div>
        </div>
      ))}
    </div>
  );
}

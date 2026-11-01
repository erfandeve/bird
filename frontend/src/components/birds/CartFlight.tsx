"use client";

import { useEffect, useRef, useState } from "react";
import { FlyingBird } from "./FlyingBird";

const EVENT = "biard:fly-to-cart";

type Flight = { id: number; x: number; y: number; dx: number; dy: number };

/** بعد از افزودن به سبد، یک پرنده از دکمه تا آیکن سبد پرواز می‌کند */
export function flyToCart(from: Element | null) {
  if (!from) return;
  const { left, top, width, height } = from.getBoundingClientRect();
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { x: left + width / 2, y: top + height / 2 } }));
}

export function CartFlight() {
  const [flight, setFlight] = useState<Flight | null>(null);
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFly = (e: Event) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const target = [...document.querySelectorAll("[data-cart-target]")].find((t) => t.getBoundingClientRect().width > 0);
      if (!target) return;
      const { x, y } = (e as CustomEvent<{ x: number; y: number }>).detail;
      const rect = target.getBoundingClientRect();
      setFlight({ id: Date.now(), x, y, dx: rect.left + rect.width / 2 - x, dy: rect.top + rect.height / 2 - y });
    };
    window.addEventListener(EVENT, onFly);
    return () => window.removeEventListener(EVENT, onFly);
  }, []);

  useEffect(() => {
    if (!flight || !el.current) return;
    const { dx, dy } = flight;
    const mirror = dx > 0 ? -1 : 1;
    const animation = el.current.animate(
      [
        { transform: `translate(-50%, -50%) scaleX(${mirror}) scale(0.7)`, opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${dy * 0.35 - 70}px)) scaleX(${mirror}) scale(1)`, opacity: 1, offset: 0.5 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scaleX(${mirror}) scale(0.35)`, opacity: 0.2 },
      ],
      { duration: 850, easing: "cubic-bezier(0.45, 0.05, 0.3, 1)" },
    );
    animation.onfinish = () => setFlight(null);
    return () => animation.cancel();
  }, [flight]);

  if (!flight) return null;
  return (
    <div
      key={flight.id}
      ref={el}
      aria-hidden="true"
      className="pointer-events-none fixed w-14"
      style={{ left: flight.x, top: flight.y, zIndex: "var(--z-toast)", ["--flap" as string]: "130ms" }}
    >
      <FlyingBird tone="lime" />
    </div>
  );
}

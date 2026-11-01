"use client";

import { useEffect, useState } from "react";
import { faNum } from "@/lib/format";

const pad = (n: number) => faNum(n).padStart(2, "۰");

/** شمارش معکوس تا پایان امروز؛ فقط سمت مرورگر محاسبه می‌شود */
export function Countdown() {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, Math.floor((end.getTime() - Date.now()) / 1000)));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const parts: [string, string][] =
    left === null
      ? [["--", "ساعت"], ["--", "دقیقه"], ["--", "ثانیه"]]
      : [[pad(Math.floor(left / 3600)), "ساعت"], [pad(Math.floor((left % 3600) / 60)), "دقیقه"], [pad(left % 60), "ثانیه"]];

  return (
    <div className="flex gap-2" role="timer" aria-label="زمان باقی‌مانده از تخفیف امروز" dir="rtl">
      {parts.map(([value, label]) => (
        <span key={label} className="grid w-16 place-items-center rounded-xl bg-olive-900 py-2 text-lemon-200">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          <span className="text-[11px] text-olive-100">{label}</span>
        </span>
      ))}
    </div>
  );
}

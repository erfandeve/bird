import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export function BirdMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-3 0 38 27" className={className} aria-hidden="true" fill="currentColor">
      <path transform="matrix(-1 0 0 1 32 0)" d="M0 16 C2 8 8 3 14 4 C18 0 25 1 27 6 L34 9 L27 11 C26 19 19 25 10 25 C6 25 2 24 -2 21 C2 21 5 19 6 16 C4 18 2 18 0 16 Z" />
    </svg>
  );
}

export function Logo({ tone = "dark", large = false }: { tone?: "dark" | "light"; large?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name}، صفحهٔ اصلی`}
      className={`inline-flex shrink-0 items-center gap-2 ${tone === "dark" ? "text-olive-800" : "text-lemon-200"}`}
    >
      <Image
        src="/brand/miloo-logo.png"
        alt=""
        width={large ? 96 : 64}
        height={large ? 96 : 64}
        priority={!large}
        className={large ? "size-24" : "size-13 md:size-16"}
      />
      <span className="font-display text-[2.1rem] leading-none font-bold">{site.name}</span>
    </Link>
  );
}

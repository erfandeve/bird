"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { ProductVisual } from "@/components/product/ProductVisual";
import { api } from "@/lib/api";
import { toSnapshot } from "@/lib/store";
import { toman } from "@/lib/format";
import type { Product, ProductSnapshot } from "@/lib/types";

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSnapshot[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLFormElement>(null);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    let stale = false;
    const timer = setTimeout(async () => {
      try {
        const { items } = await api<{ items: Product[] }>(`/products?q=${encodeURIComponent(q)}&per_page=6`);
        if (!stale) setResults(items.map(toSnapshot));
      } catch {
        // پیشنهادها اختیاری‌اند؛ جست‌وجوی کامل با Enter همچنان کار می‌کند
      }
    }, 220);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <form
      ref={box}
      role="search"
      action="/shop"
      className="relative max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        setOpen(false);
        router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      }}
    >
      <label className="sr-only" htmlFor={`${listId}-input`}>جست‌وجوی محصولات</label>
      <input
        id={`${listId}-input`}
        name="q"
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder="جست‌وجو: دان قناری، قفس، تاب…"
        autoComplete="off"
        className="h-11 w-full rounded-full bg-olive-100 ps-11 pe-4 text-[15px] text-olive-950 transition-colors outline-none focus:bg-white focus:ring-2 focus:ring-olive-500 [&::-webkit-search-cancel-button]:appearance-none"
      />
      <button type="submit" aria-label="جست‌وجو" className="absolute start-1 top-1 grid size-9 place-items-center rounded-full text-olive-800">
        <Search className="size-5" aria-hidden="true" />
      </button>

      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-2xl bg-white shadow-[0_6px_8px_-2px_oklch(0.26_0.04_118/0.25)] ring-1 ring-olive-200" style={{ zIndex: "var(--z-dropdown)" }}>
          {results.length ? (
            <ul>
              {results.map((p) => (
                <li key={p.slug}>
                  <Link href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 p-2 transition-colors hover:bg-lemon-100">
                    <ProductVisual art={p.art} image={p.image} label="" sizes="48px" className="size-12 shrink-0 rounded-lg" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                    <span className="shrink-0 text-xs text-olive-700">{toman(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm text-olive-700">پیشنهادی پیدا نشد. Enter را بزنید تا همهٔ نتایج را ببینید.</p>
          )}
        </div>
      )}
    </form>
  );
}

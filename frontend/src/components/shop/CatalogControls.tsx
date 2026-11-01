"use client";

import { useState, useTransition, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Drawer } from "@/components/layout/Drawer";
import { toLatinDigits } from "@/lib/format";

type Option = { value: string; label: string };

const SORTS: Option[] = [
  { value: "popular", label: "محبوب‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "cheap", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
];

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b border-olive-200 py-4">
      <legend className="float-start mb-2 w-full font-display text-2xl font-semibold text-olive-900">{title}</legend>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-[15px] hover:bg-lemon-100">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-[18px] accent-[var(--color-olive-700)]" />
      {label}
    </label>
  );
}

export function CatalogControls({ categories, birds, brands }: { categories?: Option[]; birds?: Option[]; brands: Option[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [drawer, setDrawer] = useState(false);

  const update = (mutate: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    mutate(next);
    const query = next.toString();
    startTransition(() => router.push(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  };

  const values = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const toggleIn = (key: string, value: string) =>
    update((next) => {
      const current = values(key);
      const result = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      if (result.length) next.set(key, result.join(","));
      else next.delete(key);
    });
  const toggleFlag = (key: string) =>
    update((next) => (next.get(key) === "1" ? next.delete(key) : next.set(key, "1")));

  const setPrice = (key: "min" | "max", raw: string) =>
    update((next) => {
      const value = toLatinDigits(raw).replace(/\D/g, "");
      if (value) next.set(key, value);
      else next.delete(key);
    });

  const hasFilters = ["category", "bird", "brand", "min", "max", "stock", "sale"].some((k) => params.has(k));

  const panel = (
    <div aria-busy={pending}>
      {birds && (
        <Group title="پرنده">
          {birds.map((o) => <Check key={o.value} label={o.label} checked={values("bird").includes(o.value)} onChange={() => toggleIn("bird", o.value)} />)}
        </Group>
      )}
      {categories && (
        <Group title="دسته‌بندی">
          {categories.map((o) => <Check key={o.value} label={o.label} checked={values("category").includes(o.value)} onChange={() => toggleIn("category", o.value)} />)}
        </Group>
      )}
      <Group title="قیمت (تومان)">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-sm">
            از
            <input key={`min-${params.get("min")}`} inputMode="numeric" defaultValue={params.get("min") ?? ""} onBlur={(e) => setPrice("min", e.target.value)} className="field mt-1" />
          </label>
          <label className="text-sm">
            تا
            <input key={`max-${params.get("max")}`} inputMode="numeric" defaultValue={params.get("max") ?? ""} onBlur={(e) => setPrice("max", e.target.value)} className="field mt-1" />
          </label>
        </div>
      </Group>
      <Group title="برند">
        {brands.map((o) => <Check key={o.value} label={o.label} checked={values("brand").includes(o.value)} onChange={() => toggleIn("brand", o.value)} />)}
      </Group>
      <Group title="وضعیت">
        <Check label="فقط کالاهای موجود" checked={params.get("stock") === "1"} onChange={() => toggleFlag("stock")} />
        <Check label="فقط تخفیف‌دارها" checked={params.get("sale") === "1"} onChange={() => toggleFlag("sale")} />
      </Group>
      {hasFilters && (
        <button
          type="button"
          className="btn btn-soft mt-4 w-full"
          onClick={() => update((next) => ["category", "bird", "brand", "min", "max", "stock", "sale"].forEach((k) => next.delete(k)))}
        >
          پاک کردن فیلترها
        </button>
      )}
    </div>
  );

  return (
    <aside aria-label="فیلتر محصولات">
      <div className="mb-3 flex gap-2 md:mb-0 md:block">
        <button type="button" onClick={() => setDrawer(true)} className="btn btn-soft flex-1 md:hidden">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          فیلترها
        </button>
        <label className="flex-1 md:block">
          <span className="sr-only md:not-sr-only md:mb-1 md:block md:text-sm md:font-semibold">مرتب‌سازی</span>
          <select
            value={params.get("sort") ?? "popular"}
            onChange={(e) => update((next) => (e.target.value === "popular" ? next.delete("sort") : next.set("sort", e.target.value)))}
            className="field"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      </div>
      <div className="hidden md:block">{panel}</div>
      <Drawer open={drawer} onClose={() => setDrawer(false)} label="فیلترها" side="start">
        <div className="flex items-center justify-between border-b border-olive-200 p-4">
          <span className="font-display text-3xl font-semibold text-olive-800">فیلترها</span>
          <button type="button" aria-label="بستن فیلترها" onClick={() => setDrawer(false)} className="grid size-11 place-items-center rounded-full hover:bg-lemon-200">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">{panel}</div>
        <div className="border-t border-olive-200 p-4">
          <button type="button" onClick={() => setDrawer(false)} className="btn btn-primary w-full">دیدن نتایج</button>
        </div>
      </Drawer>
    </aside>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { BirdMark } from "@/components/layout/Logo";
import { ProductCard } from "@/components/product/ProductCard";
import { getBirds, getBrands, getCategories, getProducts } from "@/lib/catalog";
import { faNum } from "@/lib/format";
import type { ProductFilter, ProductPage, SortKey } from "@/lib/types";
import { CatalogControls } from "./CatalogControls";

export type RawParams = Record<string, string | string[] | undefined>;

const SORTS: SortKey[] = ["popular", "newest", "cheap", "expensive", "discount"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const list = (v: string | string[] | undefined) => one(v)?.split(",").filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function toFilter(params: RawParams, base: ProductFilter): ProductFilter {
  const sort = one(params.sort) as SortKey | undefined;
  return {
    category: base.category ?? list(params.category),
    bird: base.bird ?? list(params.bird),
    brand: list(params.brand),
    q: one(params.q)?.slice(0, 80),
    min: num(params.min),
    max: num(params.max),
    inStock: one(params.stock) === "1",
    onSale: one(params.sale) === "1",
    sort: sort && SORTS.includes(sort) ? sort : "popular",
    page: num(params.page),
  };
}

function Grid({ page }: { page: ProductPage }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
      {page.items.map((p) => (
        <li key={p.id}><ProductCard product={p} /></li>
      ))}
    </ul>
  );
}

function pageHref(path: string, params: RawParams, page: number) {
  const next = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = one(value);
    if (v && key !== "page") next.set(key, v);
  }
  if (page > 1) next.set("page", String(page));
  const query = next.toString();
  return query ? `${path}?${query}` : path;
}

function Pagination({ path, params, page }: { path: string; params: RawParams; page: ProductPage }) {
  if (page.pages < 2) return null;
  return (
    <nav aria-label="صفحه‌بندی" className="mt-10 flex flex-wrap justify-center gap-2">
      {Array.from({ length: page.pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={pageHref(path, params, n)}
          aria-current={n === page.page ? "page" : undefined}
          className={`grid size-11 place-items-center rounded-full font-semibold transition-colors ${
            n === page.page ? "bg-olive-700 text-lemon-50" : "bg-olive-100 text-olive-900 hover:bg-olive-200"
          }`}
        >
          {faNum(n)}
        </Link>
      ))}
    </nav>
  );
}

function Results({ path, params, page }: { path: string; params: RawParams; page: ProductPage }) {
  if (!page.total) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <BirdMark className="h-14 w-auto text-olive-300" />
        <p className="text-lg font-semibold">محصولی با این انتخاب‌ها پیدا نشد.</p>
        <p className="text-olive-800">فیلترها را کمتر کنید یا کلمهٔ دیگری را جست‌وجو کنید.</p>
        <Link href={path} className="btn btn-primary">پاک کردن فیلترها</Link>
      </div>
    );
  }
  return (
    <>
      <p className="mb-4 text-sm text-olive-800">{faNum(page.total)} محصول</p>
      <Grid page={page} />
      <Pagination path={path} params={params} page={page} />
    </>
  );
}

async function FilteredResults({ path, base, searchParams }: { path: string; base: ProductFilter; searchParams: Promise<RawParams> }) {
  const params = await searchParams;
  const page = await getProducts(toFilter(params, base));
  return <Results path={path} params={params} page={page} />;
}

/**
 * برای سئو، صفحهٔ اول بدون فیلتر داخل همان HTML اولیه قرار می‌گیرد (fallback همین لیست است)،
 * و اگر آدرس پارامتر داشته باشد، نتیجهٔ فیلترشده هنگام درخواست جایگزین آن می‌شود.
 */
export async function Catalog({
  path,
  base = {},
  searchParams,
}: {
  path: string;
  base?: ProductFilter;
  searchParams: Promise<RawParams>;
}) {
  const [initial, categories, birds, brands] = await Promise.all([
    getProducts({ ...base, sort: "popular" }),
    getCategories(),
    getBirds(),
    getBrands(),
  ]);

  return (
    <div className="grid gap-8 pb-4 md:grid-cols-[260px_1fr]">
      <Suspense fallback={<div className="skeleton hidden h-96 md:block" />}>
        <CatalogControls
          categories={base.category ? undefined : categories.map((c) => ({ value: c.slug, label: c.name }))}
          birds={base.bird ? undefined : birds.map((b) => ({ value: b.slug, label: b.name }))}
          brands={brands.map((b) => ({ value: b, label: b }))}
        />
      </Suspense>
      <div>
        <Suspense fallback={<Results path={path} params={{}} page={initial} />}>
          <FilteredResults path={path} base={base} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

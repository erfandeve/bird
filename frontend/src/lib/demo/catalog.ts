import data from "./data.json";
import type { Category, Post, Product, Review } from "../types";

/*
 * نسخهٔ نمایشی بدون بک‌اند: همان دادهٔ نمونهٔ جنگو داخل سایت قرار دارد و
 * همان مسیرهای API را جواب می‌دهد. با تنظیم API_URL این فایل کنار می‌رود.
 */

type DemoProduct = Product & { reviews: Review[] };

export const demoProducts = data.products as unknown as DemoProduct[];
const categories = data.categories as Category[];
const birds = data.birds as { slug: string; name: string; blurb: string; seoIntro: string; diet: string; avoid: string }[];
const posts = data.posts as Post[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- نظرها از مسیر جدا برگردانده می‌شوند
const strip = ({ reviews, ...product }: DemoProduct): Product => product;

const lowestPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
const bestDiscount = (p: Product) =>
  Math.max(...p.variants.map((v) => (v.compareAt ? (v.compareAt - v.price) / v.compareAt : 0)));
const inStock = (p: Product) => p.variants.some((v) => v.stock > 0);

const normalize = (text: string) =>
  text.replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[‌\s]+/g, " ").trim().toLowerCase();

function searchText(p: Product) {
  const category = categories.find((c) => c.slug === p.category)?.name ?? "";
  return normalize([p.name, p.short, p.brand, category, ...p.birdNames].join(" "));
}

function listProducts(params: URLSearchParams) {
  const csv = (key: string) => params.get(key)?.split(",").filter(Boolean) ?? [];
  const positive = (key: string) => {
    const n = Number(params.get(key));
    return Number.isInteger(n) && n > 0 ? n : undefined;
  };

  let list = demoProducts.slice();
  const category = csv("category");
  const bird = csv("bird");
  const brand = csv("brand");
  if (category.length) list = list.filter((p) => category.includes(p.category));
  if (bird.length) list = list.filter((p) => p.birds.some((b) => bird.includes(b)));
  if (brand.length) list = list.filter((p) => brand.includes(p.brand));
  const min = positive("min");
  const max = positive("max");
  if (min) list = list.filter((p) => lowestPrice(p) >= min);
  if (max) list = list.filter((p) => lowestPrice(p) <= max);
  if (params.get("stock") === "1") list = list.filter(inStock);
  if (params.get("sale") === "1") list = list.filter((p) => bestDiscount(p) > 0);
  const tag = params.get("tag");
  if (tag) list = list.filter((p) => p.tags.includes(tag as "new" | "bestseller"));
  const q = params.get("q")?.slice(0, 80);
  if (q) {
    const words = normalize(q).split(" ");
    list = list.filter((p) => words.every((w) => searchText(p).includes(w)));
  }

  const id = (p: Product) => Number(p.id);
  switch (params.get("sort")) {
    case "cheap":
      list.sort((a, b) => lowestPrice(a) - lowestPrice(b) || id(b) - id(a));
      break;
    case "expensive":
      list.sort((a, b) => lowestPrice(b) - lowestPrice(a) || id(b) - id(a));
      break;
    case "discount":
      list.sort((a, b) => bestDiscount(b) - bestDiscount(a) || id(b) - id(a));
      break;
    case "newest":
      list.sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")) || id(b) - id(a));
      break;
    default:
      list.sort((a, b) => Number(inStock(b)) - Number(inStock(a)) || b.reviewCount - a.reviewCount || b.rating - a.rating || id(b) - id(a));
  }

  const perPage = Math.min(positive("per_page") ?? 12, 60);
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const page = Math.min(positive("page") ?? 1, pages);
  return { items: list.slice((page - 1) * perPage, page * perPage).map(strip), total: list.length, page, pages };
}

function related(slug: string) {
  const product = demoProducts.find((p) => p.slug === slug);
  if (!product) return null;
  return demoProducts
    .filter((p) => p.slug !== slug)
    .map((p) => ({ p, score: 2 * Number(p.category === product.category) + p.birds.filter((b) => product.birds.includes(b)).length }))
    .sort((a, b) => b.score - a.score || Number(b.p.id) - Number(a.p.id))
    .slice(0, 8)
    .map(({ p }) => strip(p));
}

export const demoSlugs = () => ({
  product: demoProducts.map((p) => p.slug),
  category: categories.map((c) => c.slug),
  bird: birds.map((b) => b.slug),
  blog: posts.map((p) => p.slug),
});

/** همان جواب‌های GET که API جنگو می‌دهد؛ null یعنی ۴۰۴ */
export function demoGet(path: string): unknown {
  const url = new URL(path, "http://demo");
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
  const [section, slug, sub] = parts;

  if (section === "categories") return categories;
  if (section === "birds") return birds;
  if (section === "brands") return [...new Set(demoProducts.map((p) => p.brand))];
  if (section === "slugs") return demoSlugs();
  if (section === "posts") return slug ? (posts.find((p) => p.slug === slug) ?? null) : posts;
  if (section === "products") {
    if (!slug) return listProducts(url.searchParams);
    const product = demoProducts.find((p) => p.slug === slug);
    if (!product) return null;
    if (sub === "related") return related(slug);
    if (sub === "reviews") return product.reviews;
    return strip(product);
  }
  return null;
}

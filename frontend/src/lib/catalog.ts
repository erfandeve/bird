import { cacheLife, cacheTag } from "next/cache";
import { birdLooks } from "./data/birds";
import type { BirdSpecies, Category, Post, Product, ProductFilter, ProductPage, Review } from "./types";

/*
 * خواندن داده از API جنگو سمت سرور. نتیجه کش می‌شود و با تغییر داده در ادمین،
 * جنگو از مسیر /api/revalidate تگ catalog را تازه می‌کند.
 */

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`API ${path} responded ${response.status}`);
  return response.json();
}

async function getOrNull<T>(path: string): Promise<T | null> {
  const response = await fetch(`${API_URL}/api/v1${path}`, { headers: { Accept: "application/json" } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`API ${path} responded ${response.status}`);
  return response.json();
}

function toQuery(filter: ProductFilter) {
  const query = new URLSearchParams();
  if (filter.category?.length) query.set("category", filter.category.join(","));
  if (filter.bird?.length) query.set("bird", filter.bird.join(","));
  if (filter.brand?.length) query.set("brand", filter.brand.join(","));
  if (filter.q) query.set("q", filter.q);
  if (filter.min) query.set("min", String(filter.min));
  if (filter.max) query.set("max", String(filter.max));
  if (filter.inStock) query.set("stock", "1");
  if (filter.onSale) query.set("sale", "1");
  if (filter.tag) query.set("tag", filter.tag);
  if (filter.sort) query.set("sort", filter.sort);
  if (filter.page) query.set("page", String(filter.page));
  if (filter.perPage) query.set("per_page", String(filter.perPage));
  return query.toString();
}

export async function getProducts(filter: ProductFilter = {}): Promise<ProductPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return get<ProductPage>(`/products?${toQuery(filter)}`);
}

export async function getProduct(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return getOrNull<Product>(`/products/${encodeURIComponent(slug)}`);
}

export async function getSlugs() {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return get<{ product: string[]; category: string[]; bird: string[]; blog: string[] }>("/slugs");
}

/** ساخت پروژه با Cache Components دست‌کم یک پارامتر می‌خواهد، حتی وقتی دیتابیس هنوز خالی است */
export const staticSlugParams = (slugs: string[]) => (slugs.length ? slugs : ["__placeholder__"]).map((slug) => ({ slug }));

export async function getTagged(tag: "bestseller" | "new", limit = 10) {
  return (await getProducts({ tag, inStock: true, perPage: limit })).items;
}

export async function getOnSale(limit = 10) {
  return (await getProducts({ onSale: true, inStock: true, sort: "discount", perPage: limit })).items;
}

export async function getRelated(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return get<Product[]>(`/products/${encodeURIComponent(slug)}/related`);
}

export async function getReviews(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("catalog");
  return get<Review[]>(`/products/${encodeURIComponent(slug)}/reviews`);
}

export async function getCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return get<Category[]>("/categories");
}

export async function getBirds(): Promise<BirdSpecies[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  const birds = await get<Omit<BirdSpecies, "look">[]>("/birds");
  return birds.map((bird) => ({ ...bird, look: birdLooks[bird.slug] ?? birdLooks.budgie }));
}

export async function getBrands() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return get<string[]>("/brands");
}

export async function getPosts() {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return get<Post[]>("/posts");
}

export async function getPost(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("catalog");
  return getOrNull<Post>(`/posts/${encodeURIComponent(slug)}`);
}

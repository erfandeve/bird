import { NextResponse, type NextRequest } from "next/server";
import { infoPages } from "@/lib/data/content";

/*
 * صفحه‌های پویا پس از شروع استریم نمی‌توانند کد وضعیت را عوض کنند و notFound() با کد ۲۰۰ برمی‌گردد.
 * برای اینکه گوگل soft 404 نبیند، آدرس‌های ناموجود همین‌جا و پیش از رندر ۴۰۴ می‌گیرند.
 */
const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000";
const FRESH_MS = 60_000;
const RECHECK_MS = 5_000;

type Known = Record<string, Set<string>>;
let known: Known | null = null;
let loadedAt = 0;

async function loadKnown() {
  try {
    const response = await fetch(`${API_URL}/api/v1/slugs`, { signal: AbortSignal.timeout(2000) });
    if (response.ok) {
      const data: Record<string, string[]> = await response.json();
      known = Object.fromEntries(Object.entries(data).map(([key, slugs]) => [key, new Set(slugs)]));
    }
  } catch {
    // اگر API در دسترس نباشد، تصمیم با خود صفحه است (در ادامه درخواست عبور می‌کند)
  }
  loadedAt = Date.now();
}

const SECTIONS = new Set(["product", "category", "bird", "blog"]);

const topLevel = new Set([
  "shop", "blog", "cart", "checkout", "account", "login", "register", "forgot-password",
  "wishlist", "track", "faq", "contact", ...Object.keys(infoPages),
]);

const safeDecode = (segment: string) => {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

async function slugExists(section: string, slug: string) {
  if (!known || Date.now() - loadedAt > FRESH_MS) await loadKnown();
  if (!known) return true;
  if (known[section]?.has(slug)) return true;
  // شاید محصول همین حالا در ادمین اضافه شده باشد
  if (Date.now() - loadedAt > RECHECK_MS) await loadKnown();
  return known[section]?.has(slug) ?? false;
}

export async function proxy(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean).map(safeDecode);
  const [first, second] = segments;

  let exists = true;
  if (segments.length === 1) exists = topLevel.has(first);
  else if (segments.length === 2 && SECTIONS.has(first)) exists = await slugExists(first, second);
  else if (segments.length > 2 && SECTIONS.has(first)) exists = false;

  if (exists) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  matcher: "/((?!_next|api|media|.*\\..*).*)",
};

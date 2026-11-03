import { ApiError } from "../api";
import { isEmail, isMobile, isPostalCode, toLatinDigits } from "../format";
import { demoGet, demoProducts } from "./catalog";
import type { Address, Order, Product, User } from "../types";

/*
 * پاسخ‌گوی درخواست‌های مرورگر در نسخهٔ نمایشی. همه‌چیز فقط در localStorage همین مرورگر می‌ماند؛
 * سفارش واقعی ثبت نمی‌شود و پرداختی انجام نمی‌گیرد.
 */

type Account = User & { passwordHash: string; addresses: Address[]; wishlist: string[] };
type Store = { accounts: Record<string, Account>; current: string | null; orders: (Order & { owner: string | null })[] };

const KEY = "miloo-demo";
const FREE_SHIPPING_FROM = 800_000;
const SHIPPING = [
  { id: "post", name: "پست پیشتاز", eta: "۲ تا ۴ روز کاری", price: 65_000, allowsCod: false },
  { id: "tipax", name: "تیپاکس", eta: "۱ تا ۳ روز کاری", price: 95_000, allowsCod: false },
  { id: "courier", name: "پیک تهران", eta: "همان روز یا فردا", price: 75_000, allowsCod: true },
];
const COUPONS: Record<string, { label: string; percent: number; cap: number }> = {
  MILOO10: { label: "۱۰٪ تخفیف تا سقف ۲۰۰ هزار تومان", percent: 10, cap: 200_000 },
};

function load(): Store {
  try {
    return { accounts: {}, current: null, orders: [], ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { accounts: {}, current: null, orders: [] };
  }
}
const save = (store: Store) => localStorage.setItem(KEY, JSON.stringify(store));

async function hash(text: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`miloo-demo:${text}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const invalid = (fields: Record<string, string>) => new ApiError(Object.values(fields)[0], 400, fields);
const conflict = (detail: string, data: Record<string, unknown> = {}) => new ApiError(detail, 409, {}, data);
const publicUser = ({ name, mobile, email }: Account): User => ({ name, mobile, email });

function requireUser(store: Store) {
  const account = store.current ? store.accounts[store.current] : undefined;
  if (!account) throw new ApiError("برای این کار وارد حساب خود شوید.", 403);
  return account;
}

function checkPassword(password: string) {
  if (password.length < 8) return "رمز عبور باید دست‌کم ۸ کاراکتر باشد.";
  if (/^\d+$/.test(password)) return "رمز عبور نباید فقط عدد باشد.";
  return null;
}

function cleanAddress(body: Record<string, string>) {
  const errors: Record<string, string> = {};
  if ((body.receiver ?? "").trim().length < 3) errors.receiver = "نام گیرنده را کامل وارد کنید.";
  if (!isMobile(body.mobile ?? "")) errors.mobile = "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.";
  if (!body.province) errors.province = "استان را انتخاب کنید.";
  if ((body.city ?? "").trim().length < 2) errors.city = "شهر را وارد کنید.";
  if ((body.line ?? "").trim().length < 10) errors.line = "نشانی را کامل‌تر بنویسید.";
  if (!isPostalCode(body.postalCode ?? "")) errors.postalCode = "کد پستی باید ۱۰ رقم باشد.";
  if (Object.keys(errors).length) throw invalid(errors);
  return {
    receiver: body.receiver.trim(),
    mobile: toLatinDigits(body.mobile.trim()),
    province: body.province,
    city: body.city.trim(),
    line: body.line.trim(),
    postalCode: toLatinDigits(body.postalCode.trim()),
  };
}

const variants = () =>
  new Map(demoProducts.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const)));

function quote(lines: { variant: number; qty: number }[], couponCode: string, shippingId: string) {
  const all = variants();
  const merged = new Map<string, number>();
  for (const line of lines) merged.set(String(line.variant), (merged.get(String(line.variant)) ?? 0) + line.qty);

  const rows = [];
  const problems = [];
  for (const [id, qty] of merged) {
    const found = all.get(id);
    if (!found) {
      problems.push({ variant: id, reason: "unavailable" as const, stock: 0 });
      continue;
    }
    if (found.variant.stock < qty) problems.push({ variant: id, reason: "stock" as const, stock: found.variant.stock });
    rows.push({ ...found, qty });
  }

  const subtotal = rows.reduce((sum, r) => sum + r.variant.price * r.qty, 0);
  const listed = rows.reduce((sum, r) => sum + (r.variant.compareAt ?? r.variant.price) * r.qty, 0);
  const code = couponCode.trim().toUpperCase();
  const coupon = COUPONS[code];
  const discount = coupon ? Math.min(Math.round((subtotal * coupon.percent) / 100), coupon.cap) : 0;
  const shippingMethod = SHIPPING.find((s) => s.id === shippingId);
  const freeShipping = subtotal >= FREE_SHIPPING_FROM;
  const shipping = freeShipping || !shippingMethod ? 0 : shippingMethod.price;

  return {
    rows,
    shippingMethod,
    quote: {
      lines: rows.map((r) => ({ variant: r.variant.id, price: r.variant.price, compareAt: r.variant.compareAt ?? null, stock: r.variant.stock, qty: r.qty })),
      problems,
      subtotal,
      saved: listed - subtotal,
      discount,
      shipping,
      freeShipping,
      total: subtotal - discount + shipping,
      coupon: coupon ? { code, label: coupon.label } : null,
      couponError: code && !coupon ? "این کد معتبر نیست." : null,
    },
  };
}

const toSnapshotProducts = (slugs: string[]) =>
  slugs.map((slug) => demoGet(`/products/${slug}`) as Product | null).filter((p): p is Product => Boolean(p));

export async function demoApi(path: string, method: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const store = load();
  const url = new URL(path, "http://demo");
  const route = `${method} ${url.pathname.replace(/\/\d+$/, "/:id").replace(/^\/auth\/wishlist\/.+$/, "/auth/wishlist/:slug").replace(/^\/orders\/(?!quote$|track$)[^/]+$/, "/orders/:code").replace(/^\/products\/[^/]+\/reviews$/, "/products/:slug/reviews")}`;
  const param = decodeURIComponent(url.pathname.split("/").pop() ?? "");
  const text = (key: string) => String(body[key] ?? "");

  switch (route) {
    case "GET /auth/me":
      return { user: store.current && store.accounts[store.current] ? publicUser(store.accounts[store.current]) : null };

    case "POST /auth/register": {
      const errors: Record<string, string> = {};
      const mobile = toLatinDigits(text("mobile").trim());
      if (text("name").trim().length < 3) errors.name = "نام باید دست‌کم ۳ حرف باشد.";
      if (!isMobile(mobile)) errors.mobile = "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.";
      else if (store.accounts[mobile]) errors.mobile = "با این شماره قبلاً ثبت‌نام شده است.";
      if (text("email") && !isEmail(text("email"))) errors.email = "ایمیل درست نیست.";
      const weak = checkPassword(text("password"));
      if (weak) errors.password = weak;
      if (Object.keys(errors).length) throw invalid(errors);
      store.accounts[mobile] = { name: text("name").trim(), mobile, email: text("email").trim(), passwordHash: await hash(text("password")), addresses: [], wishlist: [] };
      store.current = mobile;
      save(store);
      return { user: publicUser(store.accounts[mobile]) };
    }

    case "POST /auth/login": {
      const mobile = toLatinDigits(text("mobile").trim());
      const account = store.accounts[mobile];
      if (!account || account.passwordHash !== (await hash(text("password")))) {
        throw new ApiError("شماره موبایل یا رمز عبور درست نیست.", 400);
      }
      store.current = mobile;
      save(store);
      return { user: publicUser(account) };
    }

    case "POST /auth/logout":
      store.current = null;
      save(store);
      return undefined;

    case "PATCH /auth/me": {
      const account = requireUser(store);
      if (text("email") && !isEmail(text("email"))) throw invalid({ email: "ایمیل درست نیست." });
      if ("name" in body) account.name = text("name").trim();
      if ("email" in body) account.email = text("email").trim();
      save(store);
      return { user: publicUser(account) };
    }

    case "POST /auth/password/change": {
      const account = requireUser(store);
      if (account.passwordHash !== (await hash(text("current")))) throw invalid({ current: "رمز فعلی درست نیست." });
      const weak = checkPassword(text("password"));
      if (weak) throw invalid({ password: weak });
      account.passwordHash = await hash(text("password"));
      save(store);
      return { detail: "رمز عبور تغییر کرد." };
    }

    case "POST /auth/password/forgot":
      if (!isMobile(text("mobile"))) throw invalid({ mobile: "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود." });
      return { detail: "ok" };

    case "POST /auth/password/reset":
      throw new ApiError("در نسخهٔ نمایشی پیامک ارسال نمی‌شود و بازیابی رمز فعال نیست.", 400);

    case "GET /auth/addresses":
      return requireUser(store).addresses;

    case "POST /auth/addresses": {
      const account = requireUser(store);
      const address: Address = { id: String(Date.now()), title: text("title"), ...cleanAddress(body as Record<string, string>) };
      account.addresses.unshift(address);
      save(store);
      return address;
    }

    case "PUT /auth/addresses/:id": {
      const account = requireUser(store);
      const index = account.addresses.findIndex((a) => a.id === param);
      if (index < 0) throw new ApiError("پیدا نشد.", 404);
      account.addresses[index] = { id: param, title: text("title"), ...cleanAddress(body as Record<string, string>) };
      save(store);
      return account.addresses[index];
    }

    case "DELETE /auth/addresses/:id": {
      const account = requireUser(store);
      account.addresses = account.addresses.filter((a) => a.id !== param);
      save(store);
      return undefined;
    }

    case "GET /auth/wishlist":
      return toSnapshotProducts(requireUser(store).wishlist);

    case "POST /auth/wishlist": {
      const account = requireUser(store);
      const slugs = Array.isArray(body.slugs) ? body.slugs.map(String) : [];
      account.wishlist = [...new Set([...account.wishlist, ...slugs])];
      save(store);
      return toSnapshotProducts(account.wishlist);
    }

    case "PUT /auth/wishlist/:slug": {
      const account = requireUser(store);
      if (!account.wishlist.includes(param)) account.wishlist.unshift(param);
      save(store);
      return undefined;
    }

    case "DELETE /auth/wishlist/:slug": {
      const account = requireUser(store);
      account.wishlist = account.wishlist.filter((s) => s !== param);
      save(store);
      return undefined;
    }

    case "POST /products/:slug/reviews":
      requireUser(store);
      if (text("text").trim().length < 10) throw invalid({ text: "نظر باید دست‌کم ۱۰ حرف داشته باشد." });
      return { id: String(Date.now()) };

    case "GET /shipping-methods":
      return { methods: SHIPPING, freeFrom: FREE_SHIPPING_FROM };

    case "POST /orders/quote":
      return quote((body.lines as { variant: number; qty: number }[]) ?? [], text("coupon"), text("shipping")).quote;

    case "POST /orders": {
      const lines = (body.lines as { variant: number; qty: number }[]) ?? [];
      const result = quote(lines, text("coupon"), text("shipping"));
      if (!result.shippingMethod) throw conflict("روش ارسال معتبر نیست.");
      if (text("payment") === "cod" && !result.shippingMethod.allowsCod) throw conflict("پرداخت در محل برای این روش ارسال ممکن نیست.");
      if (result.quote.problems.length) throw conflict("موجودی بعضی کالاها کافی نیست.", { code: "stock" });
      if (text("coupon") && !result.quote.coupon) throw conflict("این کد تخفیف معتبر نیست.", { code: "coupon" });
      if (Number(body.expectedTotal) !== result.quote.total) {
        throw conflict("قیمت سبد تغییر کرده است. مبلغ جدید را بررسی کنید.", { code: "price_changed", total: result.quote.total });
      }
      const order: Order = {
        id: `BRD${String(Date.now()).slice(-10)}`,
        createdAt: new Date().toISOString(),
        status: "confirmed",
        lines: result.rows.map((r) => ({
          variantId: r.variant.id,
          slug: r.product.slug,
          name: r.product.name,
          variantLabel: `${r.product.variantLabel}: ${r.variant.label}`,
          price: r.variant.price,
          compareAt: r.variant.compareAt ?? null,
          qty: r.qty,
          art: r.product.art,
          image: null,
        })),
        subtotal: result.quote.subtotal,
        discount: result.quote.discount,
        shipping: result.quote.shipping,
        total: result.quote.total,
        address: cleanAddress((body.address ?? {}) as Record<string, string>),
        shippingMethod: result.shippingMethod.name,
        paymentMethod: text("payment") === "cod" ? "پرداخت در محل" : "پرداخت آنلاین (نمایشی)",
        trackingCode: "",
      };
      store.orders.unshift({ ...order, owner: store.current });
      save(store);
      // در نسخهٔ نمایشی به درگاه نمی‌رویم و سفارش مستقیم ثبت‌شده نمایش داده می‌شود
      return { order, paymentUrl: null };
    }

    case "GET /orders":
      return store.orders.filter((o) => o.owner === requireUser(store).mobile);

    case "GET /orders/:code": {
      const order = store.orders.find((o) => o.id === param);
      if (!order) throw new ApiError("پیدا نشد.", 404);
      return order;
    }

    case "POST /orders/track": {
      const order = store.orders.find((o) => o.id === text("code").toUpperCase() && o.address.mobile === toLatinDigits(text("mobile").trim()));
      if (!order) throw new ApiError("سفارشی با این مشخصات پیدا نشد.", 404);
      return order;
    }

    case "POST /contact": {
      const errors: Record<string, string> = {};
      if (text("name").trim().length < 2) errors.name = "نام را وارد کنید.";
      if (!isMobile(text("mobile"))) errors.mobile = "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.";
      if (text("message").trim().length < 10) errors.message = "پیام باید دست‌کم ۱۰ حرف داشته باشد.";
      if (Object.keys(errors).length) throw invalid(errors);
      return undefined;
    }

    case "POST /newsletter":
      if (!isMobile(text("contact")) && !isEmail(text("contact"))) throw invalid({ contact: "یک شمارهٔ موبایل یا ایمیل درست وارد کنید." });
      return undefined;
  }

  if (method === "GET") {
    const result = demoGet(path);
    if (result === null) throw new ApiError("پیدا نشد.", 404);
    return result;
  }
  throw new ApiError("این بخش در نسخهٔ نمایشی فعال نیست.", 400);
}

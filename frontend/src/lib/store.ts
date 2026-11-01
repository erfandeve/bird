"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "./api";
import type { Address, CartLine, Product, ProductSnapshot, Quote, User } from "./types";

/** مقادیر localStorage فقط بعد از hydrate معتبرند؛ این هلپر جلوی mismatch را می‌گیرد */
export const useHydrated = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

type CartState = {
  lines: CartLine[];
  coupon: string | null;
  open: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  syncFromQuote: (quote: Quote) => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      open: false,
      add: (line, qty = 1) => {
        const existing = get().lines.find((l) => l.variantId === line.variantId);
        set({
          lines: existing
            ? get().lines.map((l) =>
                l.variantId === line.variantId ? { ...l, ...line, qty: Math.min(l.qty + qty, line.stock) } : l,
              )
            : [...get().lines, { ...line, qty: Math.min(qty, line.stock) }],
        });
      },
      setQty: (variantId, qty) =>
        set({
          lines: get().lines.map((l) =>
            l.variantId === variantId ? { ...l, qty: Math.max(1, Math.min(qty, l.stock)) } : l,
          ),
        }),
      remove: (variantId) => set({ lines: get().lines.filter((l) => l.variantId !== variantId) }),
      clear: () => set({ lines: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      // قیمت و موجودی روز از سرور جای مقدار ذخیره‌شده در مرورگر را می‌گیرد
      syncFromQuote: (quote) => {
        const fresh = new Map(quote.lines.map((l) => [l.variant, l]));
        const gone = new Set(quote.problems.filter((p) => p.reason === "unavailable").map((p) => p.variant));
        const next = get().lines
          .filter((l) => !gone.has(l.variantId))
          .map((l) => {
            const line = fresh.get(l.variantId);
            return line ? { ...l, price: line.price, compareAt: line.compareAt, stock: line.stock } : l;
          });
        const changed = next.length !== get().lines.length || next.some((l, i) => {
          const before = get().lines[i];
          return l.price !== before.price || l.stock !== before.stock || l.compareAt !== before.compareAt;
        });
        if (changed) set({ lines: next });
      },
      setOpen: (open) => set({ open }),
    }),
    // شناسهٔ گزینه‌ها با آمدن بک‌اند عوض شد؛ سبدهای نسخهٔ قبلی معتبر نیستند
    { name: "biard-cart-v2", partialize: (s) => ({ lines: s.lines, coupon: s.coupon }) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.price * l.qty, 0);

/** مبلغ نهایی همیشه از سرور می‌آید. با تغییر سبد، کد تخفیف یا روش ارسال دوباره خوانده می‌شود. */
export function useQuote(shipping?: string, refreshKey = 0) {
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const syncFromQuote = useCart((s) => s.syncFromQuote);
  const [quote, setQuote] = useState<Quote | null>(null);
  const latest = useRef(0);

  const key = lines.map((l) => `${l.variantId}:${l.qty}`).join(",");
  useEffect(() => {
    const items = key ? key.split(",").map((part) => part.split(":")) : [];
    if (!items.length) return;
    const request = ++latest.current;
    api<Quote>("/orders/quote", {
      method: "POST",
      body: {
        lines: items.map(([variant, qty]) => ({ variant: Number(variant), qty: Number(qty) })),
        coupon: coupon ?? "",
        shipping: shipping ?? "",
      },
    })
      .then((result) => {
        if (request !== latest.current) return;
        setQuote(result);
        syncFromQuote(result);
      })
      .catch(() => {
        // خلاصهٔ قبلی می‌ماند؛ هنگام ثبت سفارش سرور دوباره همه‌چیز را بررسی می‌کند
      });
  }, [key, coupon, shipping, refreshKey, syncFromQuote]);

  return key ? quote : null;
}

export const toSnapshot = (product: Product): ProductSnapshot => {
  const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  return { slug: product.slug, name: product.name, art: product.art, image: product.images[0], price: variant.price, compareAt: variant.compareAt };
};

type WishState = {
  items: ProductSnapshot[];
  toggle: (item: ProductSnapshot) => boolean;
  remove: (slug: string) => void;
  replace: (items: ProductSnapshot[]) => void;
};

export const useWish = create<WishState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const has = get().items.some((i) => i.slug === item.slug);
        set({ items: has ? get().items.filter((i) => i.slug !== item.slug) : [item, ...get().items] });
        if (useAuth.getState().user) {
          api(`/auth/wishlist/${item.slug}`, { method: has ? "DELETE" : "PUT" }).catch(() => {});
        }
        return !has;
      },
      remove: (slug) => {
        set({ items: get().items.filter((i) => i.slug !== slug) });
        if (useAuth.getState().user) api(`/auth/wishlist/${slug}`, { method: "DELETE" }).catch(() => {});
      },
      replace: (items) => set({ items }),
    }),
    { name: "biard-wish" },
  ),
);

async function mergeWishlist() {
  const slugs = useWish.getState().items.map((i) => i.slug);
  const products = await api<Product[]>("/auth/wishlist", { method: "POST", body: { slugs } });
  useWish.getState().replace(products.map(toSnapshot));
}

type AuthState = {
  user: User | null;
  /** پاسخ /auth/me رسیده است */
  ready: boolean;
  addresses: Address[];
  init: () => Promise<void>;
  login: (mobile: string, password: string) => Promise<void>;
  register: (form: { name: string; mobile: string; email?: string; password: string }) => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  loadAddresses: () => Promise<void>;
  saveAddress: (address: Omit<Address, "id"> & { id?: string }) => Promise<Address>;
  removeAddress: (id: string) => Promise<void>;
};

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  ready: false,
  addresses: [],
  init: async () => {
    try {
      const { user } = await api<{ user: User | null }>("/auth/me");
      set({ user, ready: true });
      if (user) await mergeWishlist();
    } catch {
      set({ ready: true });
    }
  },
  login: async (mobile, password) => {
    const { user } = await api<{ user: User }>("/auth/login", { method: "POST", body: { mobile, password } });
    set({ user });
    await mergeWishlist().catch(() => {});
  },
  register: async (form) => {
    const { user } = await api<{ user: User }>("/auth/register", { method: "POST", body: form });
    set({ user });
    await mergeWishlist().catch(() => {});
  },
  updateProfile: async (patch) => {
    const { user } = await api<{ user: User }>("/auth/me", { method: "PATCH", body: patch });
    set({ user });
  },
  logout: async () => {
    await api("/auth/logout", { method: "POST" });
    // روی رایانهٔ مشترک، دادهٔ حساب نباید بماند
    set({ user: null, addresses: [] });
    useWish.getState().replace([]);
  },
  loadAddresses: async () => {
    set({ addresses: await api<Address[]>("/auth/addresses") });
  },
  saveAddress: async ({ id, ...address }) => {
    const saved = await api<Address>(id ? `/auth/addresses/${id}` : "/auth/addresses", {
      method: id ? "PUT" : "POST",
      body: address,
    });
    set({ addresses: id ? get().addresses.map((a) => (a.id === id ? saved : a)) : [saved, ...get().addresses] });
    return saved;
  },
  removeAddress: async (id) => {
    await api(`/auth/addresses/${id}`, { method: "DELETE" });
    set({ addresses: get().addresses.filter((a) => a.id !== id) });
  },
}));

type Toast = { id: number; text: string };
type ToastState = { toasts: Toast[]; push: (text: string) => void };

export const useToast = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (text) => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts.slice(-2), { id, text }] });
    setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 3200);
  },
}));

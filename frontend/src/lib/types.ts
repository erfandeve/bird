export type ArtKind =
  | "pouch"
  | "jar"
  | "box"
  | "bottle"
  | "cage"
  | "perch"
  | "swing"
  | "toy"
  | "feeder"
  | "bath"
  | "nest"
  | "ladder";

export type ArtTone = "olive" | "lemon" | "sage" | "moss" | "honey" | "clay";

export type Variant = {
  id: string;
  label: string;
  price: number;
  compareAt?: number | null;
  stock: number;
};

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  short: string;
  description: string[];
  category: string;
  birds: string[];
  birdNames: string[];
  brand: string;
  variants: Variant[];
  variantLabel: string;
  rating: number;
  reviewCount: number;
  art: { kind: ArtKind; tone: ArtTone };
  /** عکس‌های آپلودشده در ادمین؛ اگر خالی باشد طرح SVG نمایش داده می‌شود */
  images: string[];
  specs: [string, string][];
  tags: ("bestseller" | "new")[];
};

export type Category = {
  slug: string;
  name: string;
  group: "food" | "gear";
  blurb: string;
  seoIntro: string;
  art: { kind: ArtKind; tone: ArtTone };
};

export type BirdLook = {
  body: string;
  belly: string;
  wing: string;
  head: string;
  beak: string;
  tail: string;
  cheek?: string;
  crest?: string;
  scale: number;
  hooked?: boolean;
};

export type BirdSpecies = {
  slug: string;
  name: string;
  blurb: string;
  seoIntro: string;
  diet: string;
  avoid: string;
  look: BirdLook;
};

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readMinutes: number;
  body: { heading?: string | null; paragraphs: string[] }[];
};

export type ProductFilter = {
  category?: string[];
  bird?: string[];
  brand?: string[];
  q?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
  onSale?: boolean;
  tag?: "bestseller" | "new";
  sort?: SortKey;
  page?: number;
  perPage?: number;
};

export type SortKey = "popular" | "newest" | "cheap" | "expensive" | "discount";

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
};

/** چیزی که داخل سبد و علاقه‌مندی ذخیره می‌شود */
export type ProductSnapshot = {
  slug: string;
  name: string;
  art: Product["art"];
  image?: string | null;
  price: number;
  compareAt?: number | null;
};

export type CartLine = ProductSnapshot & {
  variantId: string;
  variantLabel: string;
  qty: number;
  stock: number;
};

export type Address = {
  id: string;
  title: string;
  receiver: string;
  mobile: string;
  province: string;
  city: string;
  line: string;
  postalCode: string;
};

export type OrderStatus = "pending_payment" | "confirmed" | "packing" | "shipped" | "delivered" | "cancelled";

export type OrderLine = ProductSnapshot & {
  variantId: string | null;
  variantLabel: string;
  qty: number;
};

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  address: Omit<Address, "id" | "title">;
  shippingMethod: string;
  paymentMethod: string;
  trackingCode: string;
};

export type Quote = {
  lines: { variant: string; price: number; compareAt: number | null; stock: number; qty: number }[];
  problems: { variant: string; reason: "unavailable" | "stock"; stock: number }[];
  subtotal: number;
  saved: number;
  discount: number;
  shipping: number;
  freeShipping: boolean;
  total: number;
  coupon: { code: string; label: string } | null;
  couponError: string | null;
};

export type ShippingMethod = { id: string; name: string; eta: string; price: number; allowsCod: boolean };

export type User = {
  name: string;
  mobile: string;
  email?: string;
};

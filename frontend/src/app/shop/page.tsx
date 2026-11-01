import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Catalog, type RawParams } from "@/components/shop/Catalog";

export const metadata: Metadata = {
  title: "همهٔ محصولات پرنده",
  description: "فهرست کامل غذا، دان، پلت، قفس، لانه و اسباب‌بازی پرنده با فیلتر بر اساس گونه، برند و قیمت.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ label: "همهٔ محصولات" }]} />
      <h1 className="mb-6 font-display text-5xl font-bold text-olive-900 md:text-6xl">همهٔ محصولات</h1>
      <Catalog path="/shop" searchParams={searchParams} />
    </div>
  );
}

import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { FaqList } from "@/components/home/Faq";

export const metadata: Metadata = {
  title: "پرسش‌های متداول",
  description: "پاسخ پرسش‌های پرتکرار دربارهٔ ارسال، مرجوعی و انتخاب غذای پرنده.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ label: "پرسش‌های متداول" }]} />
      <h1 className="mb-6 font-display text-5xl font-bold text-olive-900 md:text-6xl">پرسش‌های متداول</h1>
      <div className="max-w-3xl"><FaqList /></div>
    </div>
  );
}

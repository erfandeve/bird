import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContactForm } from "@/components/account/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباط با پشتیبانی فروشگاه میلو.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="wrap">
      <Breadcrumbs items={[{ label: "تماس با ما" }]} />
      <h1 className="mb-6 font-display text-5xl font-bold text-olive-900 md:text-6xl">تماس با ما</h1>
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <dl className="space-y-4 leading-7">
          <div><dt className="font-bold">تلفن پشتیبانی</dt><dd>{site.phone}</dd></div>
          <div><dt className="font-bold">ساعت پاسخ‌گویی</dt><dd>{site.hours}</dd></div>
          <div><dt className="font-bold">ایمیل</dt><dd dir="ltr" className="text-end">{site.email}</dd></div>
          <div><dt className="font-bold">نشانی</dt><dd>{site.address}</dd></div>
        </dl>
        <ContactForm />
      </div>
    </div>
  );
}

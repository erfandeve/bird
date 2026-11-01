import type { Metadata } from "next";
import { TrackForm } from "@/components/account/TrackForm";

export const metadata: Metadata = {
  title: "پیگیری سفارش",
  description: "وضعیت سفارش خود را با شمارهٔ سفارش و موبایل گیرنده بررسی کنید.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="wrap py-8">
      <h1 className="font-display text-5xl font-bold text-olive-900">پیگیری سفارش</h1>
      <p className="mt-2 mb-6 text-olive-800">شمارهٔ سفارش را از صفحهٔ تأیید سفارش بردارید و موبایل گیرنده را وارد کنید.</p>
      <TrackForm />
    </div>
  );
}

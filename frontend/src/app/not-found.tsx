import Link from "next/link";
import { FlyingBird } from "@/components/birds/FlyingBird";

export default function NotFound() {
  return (
    <div className="wrap flex flex-col items-center py-24 text-center">
      <FlyingBird tone="olive" className="w-32" />
      <h1 className="mt-4 font-display text-5xl font-bold text-olive-900">این صفحه پریده است!</h1>
      <p className="mt-2 text-olive-800">صفحه‌ای که دنبالش هستید پیدا نشد.</p>
      <Link href="/shop" className="btn btn-primary mt-6">رفتن به فروشگاه</Link>
    </div>
  );
}

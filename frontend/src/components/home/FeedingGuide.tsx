import Link from "next/link";
import { getBirds } from "@/lib/catalog";

export async function FeedingGuide() {
  const birds = await getBirds();
  return (
    <section aria-labelledby="guide-title" className="wrap rise-in pt-16 md:pt-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <h2 id="guide-title" className="font-display text-4xl leading-tight font-semibold text-olive-900 md:text-5xl">چه چیزی به کدام پرنده بدهیم؟</h2>
          <p className="mt-3 leading-8 text-olive-800">یک راهنمای کلی برای شروع. نیاز هر پرنده به سن و سلامتش بستگی دارد؛ برای پرندهٔ بیمار با دامپزشک مشورت کنید.</p>
          <Link href="/blog/foods-dangerous-for-birds" className="mt-4 inline-block font-semibold text-olive-800 underline underline-offset-4">
            خوراکی‌های خطرناک برای پرنده
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-start text-sm">
            <thead>
              <tr className="border-b-2 border-olive-700 text-olive-900">
                <th scope="col" className="py-3 pe-4 text-start font-bold">پرنده</th>
                <th scope="col" className="py-3 pe-4 text-start font-bold">غذای پیشنهادی</th>
                <th scope="col" className="py-3 text-start font-bold">پرهیز کنید</th>
              </tr>
            </thead>
            <tbody>
              {birds.map((b) => (
                <tr key={b.slug} className="border-b border-olive-200 transition-colors hover:bg-lemon-100">
                  <th scope="row" className="py-3.5 pe-4 text-start font-display text-2xl font-semibold whitespace-nowrap">
                    <Link href={`/bird/${b.slug}`} className="hover:text-olive-600">{b.name}</Link>
                  </th>
                  <td className="py-3.5 pe-4 leading-7">{b.diet}</td>
                  <td className="py-3.5 leading-7 text-olive-800">{b.avoid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

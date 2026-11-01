"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="wrap flex flex-col items-center py-24 text-center">
      <h1 className="font-display text-5xl font-bold text-olive-900">مشکلی پیش آمد</h1>
      <p className="mt-2 text-olive-800">صفحه بارگذاری نشد. دوباره تلاش کنید.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">تلاش دوباره</button>
    </div>
  );
}

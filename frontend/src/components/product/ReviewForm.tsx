"use client";

import { useState } from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { faNum } from "@/lib/format";

export function ReviewForm({ slug }: { slug: string }) {
  const ready = useAuth((s) => s.ready);
  const user = useAuth((s) => s.user);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  if (state === "sent") return <p className="self-start rounded-2xl bg-lemon-200 p-6 font-semibold">ممنون از نظر شما. پس از بررسی، در این صفحه نمایش داده می‌شود.</p>;

  if (ready && !user) {
    return (
      <div className="self-start rounded-2xl bg-lemon-200 p-6">
        <p className="font-semibold">برای ثبت نظر وارد حساب خود شوید.</p>
        <Link href={`/login?next=/product/${slug}`} className="btn btn-primary mt-4">ورود یا ثبت‌نام</Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="rounded-2xl bg-lemon-200 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setError("");
        try {
          await api(`/products/${slug}/reviews`, { method: "POST", body: { rating, text } });
          setState("sent");
        } catch (err) {
          setState("idle");
          setError(err instanceof ApiError ? err.message : "مشکلی پیش آمد.");
        }
      }}
    >
      <h3 className="font-display text-3xl font-semibold text-olive-900">نظر خود را بنویسید</h3>
      <fieldset className="mt-3">
        <legend className="mb-1 text-sm font-semibold">امتیاز شما</legend>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${faNum(n)} ستاره`} aria-pressed={rating === n} onClick={() => setRating(n)} className="grid size-11 place-items-center">
              <Star className={`size-6 ${n <= rating ? "fill-olive-600 text-olive-600" : "text-olive-400"}`} aria-hidden="true" />
            </button>
          ))}
        </div>
      </fieldset>
      <label htmlFor="review-text" className="mt-3 mb-1 block text-sm font-semibold">متن نظر</label>
      <textarea
        id="review-text"
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setError("");
        }}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "review-error" : undefined}
        className="field"
      />
      {error && <p id="review-error" className="mt-1 text-sm text-clay-700">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary mt-3">ثبت نظر</button>
    </form>
  );
}

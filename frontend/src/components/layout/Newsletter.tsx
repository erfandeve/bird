"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";

export function Newsletter() {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  if (state === "done") return <p className="mt-5 text-sm text-lemon-200">ثبت شد. تخفیف‌ها و راهنماهای تازه را برایتان می‌فرستیم.</p>;

  return (
    <form
      className="mt-5"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setError("");
        try {
          await api("/newsletter", { method: "POST", body: { contact: value } });
          setState("done");
        } catch (err) {
          setState("idle");
          setError(err instanceof ApiError ? err.message : "مشکلی پیش آمد.");
        }
      }}
    >
      <label htmlFor="newsletter" className="mb-2 block text-sm font-medium text-lemon-200">خبر تخفیف‌ها را بگیرید</label>
      <div className="flex gap-2">
        <input
          id="newsletter"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError("");
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "newsletter-error" : undefined}
          placeholder="موبایل یا ایمیل"
          className="field min-w-0 flex-1"
        />
        <button type="submit" disabled={state === "sending"} className="btn btn-lemon">عضویت</button>
      </div>
      {error && <p id="newsletter-error" className="mt-2 text-sm text-lemon-300">{error}</p>}
    </form>
  );
}

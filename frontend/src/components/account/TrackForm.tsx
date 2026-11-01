"use client";

import { useState } from "react";
import { OrderCard } from "./OrderCard";
import { Field } from "./AddressFields";
import { api, ApiError } from "@/lib/api";
import { toLatinDigits } from "@/lib/format";
import type { Order } from "@/lib/types";

export function TrackForm() {
  const [code, setCode] = useState("");
  const [mobile, setMobile] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-2xl">
      <form
        noValidate
        className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          setOrder(null);
          try {
            setOrder(await api<Order>("/orders/track", { method: "POST", body: { code: toLatinDigits(code).trim(), mobile } }));
          } catch (err) {
            setError(err instanceof ApiError ? err.message : "مشکلی پیش آمد.");
          } finally {
            setLoading(false);
          }
        }}
      >
        <Field id="track-code" label="شمارهٔ سفارش">
          <input id="track-code" value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" placeholder="BRD1234567890" className="field text-start" />
        </Field>
        <Field id="track-mobile" label="موبایل گیرنده">
          <input id="track-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="tel" dir="ltr" placeholder="09123456789" className="field text-start" />
        </Field>
        <button type="submit" disabled={loading} className="btn btn-primary">پیگیری</button>
      </form>
      <div className="mt-6" aria-live="polite">
        {error && <p className="rounded-xl bg-lemon-200 p-4">{error}</p>}
        {order && <OrderCard order={order} open />}
      </div>
    </div>
  );
}

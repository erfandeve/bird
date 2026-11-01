"use client";

import { useState } from "react";
import { Field } from "./AddressFields";
import { api, ApiError } from "@/lib/api";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", mobile: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  if (state === "sent") return <p className="self-start rounded-2xl bg-lemon-200 p-6 font-semibold">پیام شما ثبت شد و در ساعت کاری پاسخ داده می‌شود.</p>;

  return (
    <form
      noValidate
      className="space-y-4 rounded-2xl bg-lemon-200 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        setErrors({});
        try {
          await api("/contact", { method: "POST", body: form });
          setState("sent");
        } catch (err) {
          setState("idle");
          if (err instanceof ApiError) setErrors(Object.keys(err.fields).length ? err.fields : { form: err.message });
        }
      }}
    >
      {errors.form && <p role="alert" className="rounded-xl bg-clay-100 p-3 text-sm font-semibold text-clay-700">{errors.form}</p>}
      <Field id="contact-name" label="نام" error={errors.name}>
        <input id="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} className="field" />
      </Field>
      <Field id="contact-mobile" label="موبایل" error={errors.mobile}>
        <input id="contact-mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} inputMode="tel" autoComplete="tel" dir="ltr" aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? "contact-mobile-error" : undefined} className="field text-start" />
      </Field>
      <Field id="contact-message" label="پیام" error={errors.message}>
        <textarea id="contact-message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : undefined} className="field" />
      </Field>
      <button type="submit" disabled={state === "sending"} className="btn btn-primary">ارسال پیام</button>
    </form>
  );
}

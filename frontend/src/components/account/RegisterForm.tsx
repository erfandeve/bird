"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Field } from "./AddressFields";
import { safeNext } from "./LoginForm";
import { PasswordInput } from "./PasswordInput";
import { ApiError } from "@/lib/api";
import { useAuth, useToast } from "@/lib/store";

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const register = useAuth((s) => s.register);
  const toast = useToast((s) => s.push);
  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "", repeat: "", accept: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const bind = (key: "name" | "mobile" | "email" | "password" | "repeat") => ({
    id: `reg-${key}`,
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value }),
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `reg-${key}-error` : undefined,
  });

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const found: Record<string, string> = {};
        if (form.repeat !== form.password) found.repeat = "تکرار رمز با رمز عبور یکی نیست.";
        if (!form.accept) found.accept = "برای ثبت‌نام باید قوانین را بپذیرید.";
        setErrors(found);
        if (Object.keys(found).length) return;
        setSending(true);
        try {
          await register({ name: form.name, mobile: form.mobile, email: form.email.trim(), password: form.password });
          toast("حساب شما ساخته شد");
          router.push(safeNext(params.get("next")));
        } catch (err) {
          if (err instanceof ApiError) setErrors(Object.keys(err.fields).length ? err.fields : { form: err.message });
          setSending(false);
        }
      }}
    >
      {errors.form && <p role="alert" className="rounded-xl bg-clay-100 p-3 text-sm font-semibold text-clay-700">{errors.form}</p>}
      <Field id="reg-name" label="نام و نام خانوادگی" error={errors.name}>
        <input {...bind("name")} autoComplete="name" className="field" />
      </Field>
      <Field id="reg-mobile" label="شماره موبایل" error={errors.mobile}>
        <input {...bind("mobile")} inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09123456789" className="field text-start" />
      </Field>
      <Field id="reg-email" label="ایمیل (اختیاری)" error={errors.email}>
        <input {...bind("email")} type="email" autoComplete="email" dir="ltr" className="field text-start" />
      </Field>
      <Field id="reg-password" label="رمز عبور" error={errors.password}>
        <PasswordInput {...bind("password")} autoComplete="new-password" />
      </Field>
      <Field id="reg-repeat" label="تکرار رمز عبور" error={errors.repeat}>
        <PasswordInput {...bind("repeat")} autoComplete="new-password" />
      </Field>
      <div>
        <label className="flex min-h-10 items-center gap-2.5 text-sm">
          <input type="checkbox" checked={form.accept} onChange={(e) => setForm({ ...form, accept: e.target.checked })} className="size-[18px] accent-[var(--color-olive-700)]" />
          <span><Link href="/terms" className="font-semibold underline underline-offset-2">قوانین فروشگاه</Link> را می‌پذیرم.</span>
        </label>
        {errors.accept && <p className="mt-1 text-sm text-clay-700">{errors.accept}</p>}
      </div>
      <button type="submit" disabled={sending} className="btn btn-primary w-full">ساخت حساب</button>
      <p className="text-center text-sm">
        قبلاً ثبت‌نام کرده‌اید؟ <Link href="/login" className="font-bold text-olive-800 underline underline-offset-4">وارد شوید</Link>
      </p>
    </form>
  );
}

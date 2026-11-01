"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Field } from "./AddressFields";
import { PasswordInput } from "./PasswordInput";
import { ApiError } from "@/lib/api";
import { useAuth, useToast } from "@/lib/store";

/** فقط مسیرهای داخلی سایت پذیرفته می‌شوند تا next به سایت دیگری هدایت نکند */
export const safeNext = (next: string | null) => (next?.startsWith("/") && !next.startsWith("//") ? next : "/account");

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuth((s) => s.login);
  const toast = useToast((s) => s.push);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setSending(true);
        setErrors({});
        try {
          await login(mobile, password);
          toast("خوش آمدید");
          router.push(safeNext(params.get("next")));
        } catch (err) {
          if (err instanceof ApiError) setErrors(Object.keys(err.fields).length ? err.fields : { form: err.message });
          setSending(false);
        }
      }}
    >
      {errors.form && <p role="alert" className="rounded-xl bg-clay-100 p-3 text-sm font-semibold text-clay-700">{errors.form}</p>}
      <Field id="login-mobile" label="شماره موبایل" error={errors.mobile}>
        <input id="login-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="tel" autoComplete="username" dir="ltr" placeholder="09123456789" aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? "login-mobile-error" : undefined} className="field text-start" />
      </Field>
      <Field id="login-password" label="رمز عبور" error={errors.password}>
        <PasswordInput id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} />
      </Field>
      <div className="text-sm"><Link href="/forgot-password" className="font-semibold text-olive-800 underline underline-offset-4">رمز عبور را فراموش کرده‌اید؟</Link></div>
      <button type="submit" disabled={sending} className="btn btn-primary w-full">ورود</button>
      <p className="text-center text-sm">
        حساب ندارید؟ <Link href={`/register${params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : ""}`} className="font-bold text-olive-800 underline underline-offset-4">ثبت‌نام کنید</Link>
      </p>
    </form>
  );
}

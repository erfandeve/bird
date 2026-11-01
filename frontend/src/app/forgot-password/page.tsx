"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard } from "@/components/account/AuthCard";
import { Field } from "@/components/account/AddressFields";
import { PasswordInput } from "@/components/account/PasswordInput";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"mobile" | "code" | "done">("mobile");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const submit = async (action: () => Promise<void>) => {
    setSending(true);
    setErrors({});
    try {
      await action();
    } catch (err) {
      if (err instanceof ApiError) setErrors(Object.keys(err.fields).length ? err.fields : { form: err.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthCard title="بازیابی رمز عبور" note={step === "code" ? "اگر این شماره حساب داشته باشد، کد ۶ رقمی برایش پیامک شده است." : "شماره موبایل حساب خود را وارد کنید."}>
      {errors.form && <p role="alert" className="mb-4 rounded-xl bg-clay-100 p-3 text-sm font-semibold text-clay-700">{errors.form}</p>}
      {step === "done" ? (
        <div className="rounded-xl bg-lemon-200 p-4 leading-7">
          رمز عبور تغییر کرد.
          <Link href="/login" className="mt-3 block font-bold underline underline-offset-4">رفتن به صفحهٔ ورود</Link>
        </div>
      ) : step === "mobile" ? (
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(async () => {
              await api("/auth/password/forgot", { method: "POST", body: { mobile } });
              setStep("code");
            });
          }}
        >
          <Field id="forgot-mobile" label="شماره موبایل" error={errors.mobile}>
            <input id="forgot-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="tel" dir="ltr" placeholder="09123456789" aria-invalid={Boolean(errors.mobile)} aria-describedby={errors.mobile ? "forgot-mobile-error" : undefined} className="field text-start" />
          </Field>
          <button type="submit" disabled={sending} className="btn btn-primary w-full">ارسال کد بازیابی</button>
          <Link href="/login" className="block text-center text-sm font-semibold underline underline-offset-4">بازگشت به ورود</Link>
        </form>
      ) : (
        <form
          noValidate
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(async () => {
              await api("/auth/password/reset", { method: "POST", body: { mobile, code, password } });
              setStep("done");
            });
          }}
        >
          <Field id="forgot-code" label="کد پیامک‌شده" error={errors.code}>
            <input id="forgot-code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" dir="ltr" aria-invalid={Boolean(errors.code)} aria-describedby={errors.code ? "forgot-code-error" : undefined} className="field text-start" />
          </Field>
          <Field id="forgot-password" label="رمز عبور جدید" error={errors.password}>
            <PasswordInput id="forgot-password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "forgot-password-error" : undefined} />
          </Field>
          <button type="submit" disabled={sending} className="btn btn-primary w-full">تغییر رمز</button>
        </form>
      )}
    </AuthCard>
  );
}

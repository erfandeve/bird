"use client";

import { useState } from "react";
import { Field } from "@/components/account/AddressFields";
import { PasswordInput } from "@/components/account/PasswordInput";
import { api, ApiError } from "@/lib/api";
import { useAuth, useToast } from "@/lib/store";

function ChangePassword() {
  const toast = useToast((s) => s.push);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  return (
    <form
      noValidate
      className="mt-10 max-w-md space-y-4 border-t border-olive-200 pt-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});
        try {
          await api("/auth/password/change", { method: "POST", body: { current, password } });
          setCurrent("");
          setPassword("");
          toast("رمز عبور تغییر کرد");
        } catch (err) {
          if (err instanceof ApiError) setErrors(Object.keys(err.fields).length ? err.fields : { password: err.message });
        } finally {
          setSaving(false);
        }
      }}
    >
      <h2 className="font-display text-3xl font-semibold">تغییر رمز عبور</h2>
      <Field id="pw-current" label="رمز فعلی" error={errors.current}>
        <PasswordInput id="pw-current" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" aria-invalid={Boolean(errors.current)} aria-describedby={errors.current ? "pw-current-error" : undefined} />
      </Field>
      <Field id="pw-new" label="رمز جدید" error={errors.password}>
        <PasswordInput id="pw-new" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "pw-new-error" : undefined} />
      </Field>
      <button type="submit" disabled={saving} className="btn btn-soft">تغییر رمز</button>
    </form>
  );
}

export default function ProfilePage() {
  const user = useAuth((s) => s.user);
  const update = useAuth((s) => s.updateProfile);
  const toast = useToast((s) => s.push);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <h1 className="mb-5 font-display text-5xl font-bold text-olive-900">مشخصات</h1>
      <form
        noValidate
        className="max-w-md space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setErrors({});
          try {
            await update({ name: name.trim(), email: email.trim() });
            toast("مشخصات ذخیره شد");
          } catch (err) {
            if (err instanceof ApiError) {
              setErrors(err.fields);
              if (!Object.keys(err.fields).length) toast(err.message);
            }
          } finally {
            setSaving(false);
          }
        }}
      >
        <Field id="profile-name" label="نام و نام خانوادگی" error={errors.name}>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={Boolean(errors.name)} className="field" />
        </Field>
        <Field id="profile-mobile" label="شماره موبایل">
          <input id="profile-mobile" value={user?.mobile ?? ""} readOnly dir="ltr" className="field bg-olive-50 text-start" />
        </Field>
        <Field id="profile-email" label="ایمیل" error={errors.email}>
          <input id="profile-email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" dir="ltr" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "profile-email-error" : undefined} className="field text-start" />
        </Field>
        <button type="submit" disabled={saving} className="btn btn-primary">ذخیره</button>
      </form>
      <ChangePassword />
    </div>
  );
}

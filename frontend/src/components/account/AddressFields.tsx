"use client";

import { isMobile, isPostalCode } from "@/lib/format";
import { provinces } from "@/lib/site";
import type { Address } from "@/lib/types";

export type AddressDraft = Omit<Address, "id" | "title">;
export type AddressErrors = Partial<Record<keyof AddressDraft, string>>;

export const emptyAddress: AddressDraft = { receiver: "", mobile: "", province: "", city: "", line: "", postalCode: "" };

export function validateAddress(a: AddressDraft): AddressErrors {
  const errors: AddressErrors = {};
  if (a.receiver.trim().length < 3) errors.receiver = "نام و نام خانوادگی گیرنده را وارد کنید.";
  if (!isMobile(a.mobile)) errors.mobile = "شماره موبایل باید ۱۱ رقم باشد و با ۰۹ شروع شود.";
  if (!a.province) errors.province = "استان را انتخاب کنید.";
  if (a.city.trim().length < 2) errors.city = "شهر را وارد کنید.";
  if (a.line.trim().length < 10) errors.line = "نشانی را کامل‌تر بنویسید.";
  if (!isPostalCode(a.postalCode)) errors.postalCode = "کد پستی باید ۱۰ رقم باشد.";
  return errors;
}

/** کلیدهای خطای سرور با نام فیلدهای فرم یکی است */
export const toAddressErrors = (fields: Record<string, string>): AddressErrors => fields;

export function Field({
  id,
  label,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-sm text-clay-700">{error}</p>}
    </div>
  );
}

export function AddressFields({
  value,
  errors,
  onChange,
}: {
  value: AddressDraft;
  errors: AddressErrors;
  onChange: (next: AddressDraft) => void;
}) {
  const input = (key: keyof AddressDraft) => ({
    id: `address-${key}`,
    value: value[key],
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `address-${key}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: e.target.value }),
  });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="address-receiver" label="نام گیرنده" error={errors.receiver}>
        <input {...input("receiver")} autoComplete="name" className="field" />
      </Field>
      <Field id="address-mobile" label="موبایل گیرنده" error={errors.mobile}>
        <input {...input("mobile")} inputMode="tel" autoComplete="tel" dir="ltr" placeholder="09123456789" className="field text-start" />
      </Field>
      <Field id="address-province" label="استان" error={errors.province}>
        <select {...input("province")} autoComplete="address-level1" className="field">
          <option value="">انتخاب کنید</option>
          {provinces.map((p) => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <Field id="address-city" label="شهر" error={errors.city}>
        <input {...input("city")} autoComplete="address-level2" className="field" />
      </Field>
      <Field id="address-line" label="نشانی کامل" error={errors.line} className="sm:col-span-2">
        <textarea {...input("line")} rows={3} autoComplete="street-address" className="field" />
      </Field>
      <Field id="address-postalCode" label="کد پستی" error={errors.postalCode}>
        <input {...input("postalCode")} inputMode="numeric" autoComplete="postal-code" dir="ltr" className="field text-start" />
      </Field>
    </div>
  );
}

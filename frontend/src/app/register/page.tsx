import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/account/AuthCard";
import { RegisterForm } from "@/components/account/RegisterForm";

export const metadata: Metadata = { title: "ثبت‌نام", robots: { index: false, follow: true } };

export default function RegisterPage() {
  return (
    <AuthCard title="ساخت حساب" note="برای پیگیری سفارش‌ها، ذخیرهٔ نشانی و نوشتن نظر.">
      <Suspense fallback={<div className="skeleton h-96" />}>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  );
}

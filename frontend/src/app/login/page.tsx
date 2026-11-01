import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/account/AuthCard";
import { LoginForm } from "@/components/account/LoginForm";

export const metadata: Metadata = { title: "ورود به حساب", robots: { index: false, follow: true } };

export default function LoginPage() {
  return (
    <AuthCard title="ورود به حساب" note="با شماره موبایل و رمز عبور وارد شوید.">
      <Suspense fallback={<div className="skeleton h-72" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

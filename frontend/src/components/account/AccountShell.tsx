"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/store";

const NAV = [
  { href: "/account", label: "پیشخوان" },
  { href: "/account/orders", label: "سفارش‌ها" },
  { href: "/account/addresses", label: "نشانی‌ها" },
  { href: "/account/profile", label: "مشخصات" },
  { href: "/wishlist", label: "علاقه‌مندی‌ها" },
];

export function AccountShell({ children }: { children: ReactNode }) {
  const ready = useAuth((s) => s.ready);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) return <div className="wrap py-10"><div className="skeleton h-96" /></div>;

  return (
    <div className="wrap grid gap-8 py-8 md:grid-cols-[220px_1fr]">
      <nav aria-label="منوی حساب" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:block md:space-y-1 md:px-0">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={`block shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${pathname === item.href ? "bg-olive-700 text-lemon-50" : "hover:bg-lemon-200"}`}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={async () => {
            await logout().catch(() => {});
            router.push("/");
          }}
          className="block shrink-0 rounded-full px-4 py-2.5 text-start text-sm font-semibold text-clay-700 hover:bg-clay-100"
        >
          خروج
        </button>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

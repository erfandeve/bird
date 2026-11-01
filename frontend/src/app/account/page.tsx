"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderCard } from "@/components/account/OrderCard";
import { api } from "@/lib/api";
import { useAuth, useWish } from "@/lib/store";
import { faNum } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function AccountPage() {
  const user = useAuth((s) => s.user);
  const addresses = useAuth((s) => s.addresses.length);
  const loadAddresses = useAuth((s) => s.loadAddresses);
  const wish = useWish((s) => s.items.length);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    api<Order[]>("/orders").then(setOrders).catch(() => setOrders([]));
    loadAddresses().catch(() => {});
  }, [loadAddresses]);

  return (
    <div>
      <h1 className="font-display text-5xl font-bold text-olive-900">سلام{user?.name ? `، ${user.name}` : ""}</h1>
      <p className="mt-2 text-olive-800">
        {faNum(orders?.length ?? 0)} سفارش، {faNum(addresses)} نشانی و {faNum(wish)} کالای مورد علاقه دارید.
      </p>
      <h2 className="mt-8 mb-3 font-display text-3xl font-semibold">آخرین سفارش</h2>
      {orders === null ? (
        <div className="skeleton h-32" />
      ) : orders[0] ? (
        <OrderCard order={orders[0]} open />
      ) : (
        <div className="rounded-2xl bg-lemon-200 p-6">
          <p>هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link href="/shop" className="btn btn-primary mt-4">دیدن محصولات</Link>
        </div>
      )}
    </div>
  );
}

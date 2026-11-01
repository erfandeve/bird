"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderCard } from "@/components/account/OrderCard";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api<Order[]>("/orders").then(setOrders).catch(() => setFailed(true));
  }, []);

  return (
    <div>
      <h1 className="mb-5 font-display text-5xl font-bold text-olive-900">سفارش‌های من</h1>
      {failed ? (
        <p role="alert" className="rounded-xl bg-clay-100 p-4 text-clay-700">سفارش‌ها بارگذاری نشد. صفحه را دوباره باز کنید.</p>
      ) : orders === null ? (
        <div className="skeleton h-48" />
      ) : orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      ) : (
        <div className="rounded-2xl bg-lemon-200 p-6">
          <p>هنوز سفارشی ثبت نکرده‌اید.</p>
          <Link href="/shop" className="btn btn-primary mt-4">دیدن محصولات</Link>
        </div>
      )}
    </div>
  );
}

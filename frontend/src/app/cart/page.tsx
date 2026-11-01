import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = { title: "سبد خرید", robots: { index: false, follow: true } };

export default function CartPage() {
  return <CartPageView />;
}

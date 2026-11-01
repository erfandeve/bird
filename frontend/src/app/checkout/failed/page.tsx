import { Suspense } from "react";
import { OrderFailed } from "@/components/cart/OrderResult";

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={<div className="wrap py-20"><div className="skeleton h-64" /></div>}>
      <OrderFailed />
    </Suspense>
  );
}

import { Suspense } from "react";
import { OrderSuccess } from "@/components/cart/OrderResult";

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="wrap py-20"><div className="skeleton h-64" /></div>}>
      <OrderSuccess />
    </Suspense>
  );
}

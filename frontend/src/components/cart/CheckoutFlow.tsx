"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { AddressFields, emptyAddress, validateAddress, type AddressDraft, type AddressErrors } from "@/components/account/AddressFields";
import { ProductVisual } from "@/components/product/ProductVisual";
import { CartProblems } from "./CartProblems";
import { CouponBox } from "./CouponBox";
import { SummaryRows } from "./SummaryRows";
import { api, ApiError } from "@/lib/api";
import { useAuth, useCart, useHydrated, useQuote, useToast } from "@/lib/store";
import { faNum, toman } from "@/lib/format";
import { paymentMethods } from "@/lib/site";
import type { Order, ShippingMethod } from "@/lib/types";

const STEPS = ["نشانی", "ارسال", "پرداخت"];

function Radio({ name, checked, disabled, onChange, title, note, side }: { name: string; checked: boolean; disabled?: boolean; onChange: () => void; title: string; note: string; side?: string }) {
  return (
    <label className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-xl p-4 ring-1 transition-colors ${checked ? "bg-lemon-200 ring-2 ring-olive-600" : "bg-white ring-olive-200 hover:bg-lemon-100"} ${disabled ? "cursor-not-allowed opacity-50" : ""}`}>
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="size-[18px] accent-[var(--color-olive-700)]" />
      <span className="flex-1">
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-olive-800">{note}</span>
      </span>
      {side && <span className="text-sm font-bold">{side}</span>}
    </label>
  );
}

export function CheckoutFlow() {
  const router = useRouter();
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const coupon = useCart((s) => s.coupon);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const addresses = useAuth((s) => s.addresses);
  const loadAddresses = useAuth((s) => s.loadAddresses);
  const saveAddress = useAuth((s) => s.saveAddress);
  const toast = useToast((s) => s.push);

  const [step, setStep] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState<string>("auto");
  const [address, setAddress] = useState<AddressDraft>(emptyAddress);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [shippingId, setShippingId] = useState("");
  const [paymentId, setPaymentId] = useState("online");
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const quote = useQuote(step >= 1 ? shippingId : undefined, attempt);

  useEffect(() => {
    api<{ methods: ShippingMethod[] }>("/shipping-methods")
      .then(({ methods }) => {
        setMethods(methods);
        setShippingId(methods[0]?.id ?? "");
      })
      .catch(() => setError("روش‌های ارسال بارگذاری نشد. صفحه را دوباره باز کنید."));
  }, []);

  useEffect(() => {
    if (user) loadAddresses().catch(() => {});
  }, [user, loadAddresses]);

  // تا کاربر خودش انتخاب نکرده، اولین نشانی ذخیره‌شده انتخاب است
  const addressChoice = selectedAddress === "auto" ? (addresses[0]?.id ?? "new") : selectedAddress;
  const shipping = methods.find((m) => m.id === shippingId);
  const allowsCod = Boolean(shipping?.allowsCod);
  const payment = paymentId === "cod" && !allowsCod ? "online" : paymentId;

  if (!hydrated) return <div className="wrap py-8"><div className="skeleton h-96" /></div>;

  if (!lines.length && !placed) {
    return (
      <div className="wrap flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-lg">سبد خرید شما خالی است.</p>
        <Link href="/shop" className="btn btn-primary">دیدن محصولات</Link>
      </div>
    );
  }

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (addressChoice === "new") {
      const found = validateAddress(address);
      setErrors(found);
      if (Object.keys(found).length) return;
      if (user) {
        try {
          const saved = await saveAddress({ ...address, title: address.city });
          setSelectedAddress(saved.id);
        } catch (err) {
          if (err instanceof ApiError) {
            setErrors(err.fields);
            if (!Object.keys(err.fields).length) setError(err.message);
          }
          return;
        }
      }
    }
    setStep(1);
    window.scrollTo({ top: 0 });
  };

  const placeOrder = async () => {
    if (!quote) return;
    setPlacing(true);
    setError("");
    const saved = addresses.find((a) => a.id === addressChoice);
    const target: AddressDraft = saved ?? address;
    try {
      const { order, paymentUrl } = await api<{ order: Order; paymentUrl: string | null }>("/orders", {
        method: "POST",
        body: {
          lines: lines.map((l) => ({ variant: Number(l.variantId), qty: l.qty })),
          address: {
            receiver: target.receiver,
            mobile: target.mobile,
            province: target.province,
            city: target.city,
            line: target.line,
            postalCode: target.postalCode,
          },
          shipping: shippingId,
          payment,
          coupon: coupon ?? "",
          expectedTotal: quote.total,
        },
      });
      if (paymentUrl) {
        // سبد تا تأیید پرداخت می‌ماند تا اگر پرداخت ناموفق بود از دست نرود
        window.location.assign(paymentUrl);
        return;
      }
      setPlaced(true);
      clear();
      router.push(`/checkout/success?order=${order.id}`);
    } catch (err) {
      setPlacing(false);
      setAttempt((n) => n + 1);
      const message = err instanceof ApiError ? err.message : "مشکلی پیش آمد. دوباره تلاش کنید.";
      setError(message);
      toast(message);
    }
  };

  const hasStockProblem = Boolean(quote?.problems.length);

  return (
    <div className="wrap py-8">
      <h1 className="font-display text-5xl font-bold text-olive-900">تسویه‌حساب</h1>

      <ol className="mt-5 mb-8 flex gap-2 sm:gap-6">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined} className={`flex items-center gap-2 text-sm font-semibold ${i <= step ? "text-olive-900" : "text-olive-700"}`}>
            <span className={`grid size-8 place-items-center rounded-full ${i < step ? "bg-olive-700 text-lemon-50" : i === step ? "bg-lemon-400 text-olive-950" : "bg-olive-100"}`}>
              {i < step ? <Check className="size-4" aria-hidden="true" /> : faNum(i + 1)}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <div>
          {!user && step === 0 && (
            <p className="mb-5 rounded-xl bg-lemon-200 p-4 text-sm leading-7">
              حساب دارید؟ <Link href="/login?next=/checkout" className="font-bold underline underline-offset-2">وارد شوید</Link> تا نشانی و سفارش‌هایتان ذخیره شود.
            </p>
          )}
          {error && <p role="alert" className="mb-5 rounded-xl bg-clay-100 p-4 text-sm font-semibold text-clay-700">{error}</p>}

          {step === 0 && (
            <form noValidate onSubmit={submitAddress}>
              <h2 className="mb-4 font-display text-3xl font-semibold">نشانی تحویل</h2>
              {addresses.length > 0 && (
                <div className="mb-4 space-y-2">
                  {addresses.map((a) => (
                    <Radio key={a.id} name="address" checked={addressChoice === a.id} onChange={() => setSelectedAddress(a.id)} title={a.receiver} note={`${a.province}، ${a.city}، ${a.line}`} />
                  ))}
                  <Radio name="address" checked={addressChoice === "new"} onChange={() => setSelectedAddress("new")} title="نشانی جدید" note="نشانی دیگری وارد می‌کنم" />
                </div>
              )}
              {addressChoice === "new" && <AddressFields value={address} errors={errors} onChange={setAddress} />}
              <button type="submit" className="btn btn-primary mt-6">ادامه: روش ارسال</button>
            </form>
          )}

          {step === 1 && (
            <div>
              <h2 className="mb-4 font-display text-3xl font-semibold">روش ارسال</h2>
              <div className="space-y-2">
                {methods.map((m) => (
                  <Radio key={m.id} name="shipping" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} title={m.name} note={m.eta} side={quote?.freeShipping ? "رایگان" : toman(m.price)} />
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button type="button" className="btn btn-soft" onClick={() => setStep(0)}>بازگشت</button>
                <button type="button" className="btn btn-primary" disabled={!shippingId} onClick={() => { setStep(2); window.scrollTo({ top: 0 }); }}>ادامه: پرداخت</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="mb-4 font-display text-3xl font-semibold">روش پرداخت</h2>
              <div className="space-y-2">
                {paymentMethods.map((m) => (
                  <Radio key={m.id} name="payment" checked={payment === m.id} disabled={m.id === "cod" && !allowsCod} onChange={() => setPaymentId(m.id)} title={m.name} note={m.note} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-olive-800">
                ثبت سفارش به معنی پذیرش <Link href="/terms" className="underline underline-offset-2">قوانین فروشگاه</Link> است.
                {process.env.NEXT_PUBLIC_DEMO_MODE && " این نسخهٔ نمایشی است؛ پرداختی انجام نمی‌شود و سفارش فقط در همین مرورگر ذخیره می‌شود."}
              </p>
              <div className="mt-6 flex gap-2">
                <button type="button" className="btn btn-soft" onClick={() => setStep(1)}>بازگشت</button>
                <button type="button" className="btn btn-primary flex-1 sm:flex-none" disabled={placing || !quote || hasStockProblem} onClick={placeOrder}>
                  {placing ? "در حال ثبت…" : payment === "online" ? `پرداخت ${quote ? toman(quote.total) : ""}` : `ثبت سفارش ${quote ? `(${toman(quote.total)})` : ""}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="order-first space-y-4 self-start rounded-2xl bg-lemon-200 p-6 lg:sticky lg:top-36 lg:order-none" aria-label="خلاصهٔ سفارش">
          <ul className="space-y-3">
            {lines.map((l) => (
              <li key={l.variantId} className="flex items-center gap-3 text-sm">
                <ProductVisual art={l.art} image={l.image} label="" sizes="56px" className="size-14 shrink-0 rounded-lg" />
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 font-semibold">{l.name}</span>
                  <span className="text-xs text-olive-800">{faNum(l.qty)} × {l.variantLabel}</span>
                </span>
              </li>
            ))}
          </ul>
          <CartProblems quote={quote} lines={lines} />
          <CouponBox quote={quote} />
          <SummaryRows quote={quote} shippingKnown={step >= 1} />
        </aside>
      </div>
    </div>
  );
}

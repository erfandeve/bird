const number = new Intl.NumberFormat("fa-IR");

export const faNum = (n: number) => number.format(n);
export const toman = (n: number) => `${number.format(n)} تومان`;

export const discountPercent = (price: number, compareAt?: number | null) =>
  compareAt && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

export const faDate = (iso: string) =>
  new Intl.DateTimeFormat("fa-IR", { dateStyle: "long", timeZone: "Asia/Tehran" }).format(new Date(iso));

/** ارقام فارسی و عربی را به انگلیسی تبدیل می‌کند تا ورودی کاربر قابل بررسی باشد */
export const toLatinDigits = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));

export const isMobile = (value: string) => /^09\d{9}$/.test(toLatinDigits(value.trim()));
export const isPostalCode = (value: string) => /^\d{10}$/.test(toLatinDigits(value.trim()));
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());


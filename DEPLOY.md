# انتشار روی Railway و Vercel

بک‌اند و دیتابیس روی Railway و فرانت‌اند روی Vercel قرار می‌گیرد. اول Railway را کامل کنید، چون بیلد Vercel به API در حال اجرا نیاز دارد.

## ۱. بک‌اند روی Railway

1. در Railway گزینهٔ **New Project** و بعد **Deploy from GitHub repo** را بزنید و مخزن `erfandeve/bird` را انتخاب کنید.
2. در تنظیمات سرویس، **Root Directory** را `backend` بگذارید. Railway فایل `Dockerfile` را خودش پیدا می‌کند.
3. در همان پروژه **New** و بعد **Database** و **PostgreSQL** را اضافه کنید.
4. روی سرویس بک‌اند راست‌کلیک کنید و یک **Volume** با مسیر `/app/media` بسازید تا عکس‌های محصول با هر استقرار پاک نشوند.
5. در بخش **Networking** گزینهٔ **Generate Domain** را بزنید.
6. در **Settings** مقدار **Healthcheck Path** را `/healthz` بگذارید.
7. این متغیرها را در تب **Variables** اضافه کنید:

| متغیر | مقدار |
| --- | --- |
| `DEBUG` | `false` |
| `SECRET_KEY` | `${{secret(64)}}` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `FRONTEND_URL` | موقتاً `https://example.com`؛ در مرحلهٔ ۳ عوض می‌شود |
| `REVALIDATE_SECRET` | `${{secret(32)}}`؛ مقدار ساخته‌شده را برای Vercel کپی کنید |
| `SEED_DEMO` | `true` تا دادهٔ نمونه وارد شود؛ فقط وقتی فروشگاه خالی است اثر دارد |
| `DJANGO_SUPERUSER_MOBILE` | شمارهٔ موبایل مدیر |
| `DJANGO_SUPERUSER_PASSWORD` | یک رمز قوی برای مدیر |
| `ZARINPAL_MERCHANT_ID` | مرچنت کد زرین‌پال، وقتی آماده شد |

بعد از اجرای موفق، این آدرس باید کار کند: `https://دامنه-railway/api/v1/categories`

پنل ادمین: `https://دامنه-railway/admin/`

بعد از اولین ورود، `DJANGO_SUPERUSER_PASSWORD` را از متغیرها حذف کنید.

## ۲. فرانت‌اند روی Vercel

1. در Vercel گزینهٔ **Add New Project** را بزنید و مخزن `erfandeve/bird` را انتخاب کنید.
2. **Root Directory** را `frontend` بگذارید.
3. این متغیرها را اضافه کنید و **Deploy** را بزنید:

| متغیر | مقدار |
| --- | --- |
| `API_URL` | `https://دامنه-railway` با https و بدون `/` در انتها |
| `NEXT_PUBLIC_SITE_URL` | `https://دامنه-vercel` یا دامنهٔ اصلی |
| `REVALIDATE_SECRET` | همان مقدار Railway |

## ۳. وصل کردن دو طرف

در Railway این دو متغیر را با آدرس نهایی سایت تنظیم کنید:

| متغیر | مقدار |
| --- | --- |
| `FRONTEND_URL` | `https://دامنه-vercel` |
| `FRONTEND_REVALIDATE_URL` | `https://دامنه-vercel/api/revalidate` |

ورود، ثبت سفارش و بازگشت از درگاه فقط روی همین آدرس کار می‌کنند. لینک‌های Preview در Vercel دامنهٔ دیگری دارند، پس ورود و سفارش روی آن‌ها خطا می‌دهد. اگر بعداً دامنهٔ اصلی وصل کردید، این دو متغیر و `NEXT_PUBLIC_SITE_URL` را دوباره به‌روز کنید.

## ۴. آزادسازی موجودی سفارش‌های پرداخت‌نشده

یک سرویس دوم از همان مخزن با Root Directory برابر `backend` بسازید و متغیرهای بک‌اند را به آن هم بدهید. سپس:

- **Custom Start Command:** `python manage.py release_unpaid`
- **Cron Schedule:** `*/5 * * * *`

## وضعیت پرداخت و پیامک

- بدون `ZARINPAL_MERCHANT_ID`، پرداخت آنلاین پیام خطا می‌دهد و سفارش لغو می‌شود. پرداخت در محل با پیک تهران کار می‌کند.
- پیامک هنوز وصل نیست، پس بازیابی رمز عبور برای کاربران کار نمی‌کند. سرویس پیامک در `backend/accounts/sms.py` وصل می‌شود.

## اگر چیزی کار نکرد

| نشانه | علت محتمل |
| --- | --- |
| خطای بیلد Vercel با `fetch failed` | `API_URL` اشتباه است یا بک‌اند بالا نیست |
| خطای `400` روی Railway | دامنه تولید نشده یا در `ALLOWED_HOSTS` نیست |
| خطای `403` هنگام ورود یا سفارش | `FRONTEND_URL` با آدرس سایت یکی نیست |
| تغییر ادمین دیر روی سایت می‌آید | `FRONTEND_REVALIDATE_URL` یا `REVALIDATE_SECRET` درست نیست؛ در این حالت صفحه‌ها چند دقیقه بعد تازه می‌شوند |

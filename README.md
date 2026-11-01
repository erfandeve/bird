# میلو | فروشگاه غذا و لوازم پرنده

- `frontend/`: Next.js 16، React 19 و Tailwind 4 (سئو و رابط کاربری)
- `backend/`: Django 6، Django REST Framework و PostgreSQL (داده، سفارش، پرداخت و پنل ادمین)

مرورگر فقط با Next.js حرف می‌زند و Next.js مسیرهای `/api/v1` و `/media` را به جنگو می‌فرستد.

## اجرا روی سیستم خودتان

پیش‌نیاز: Python 3.13، Node 20 به بالا و PostgreSQL.

### بک‌اند

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
cp .env.example .env
```

مقدار `SECRET_KEY` و `REVALIDATE_SECRET` را در `.env` عوض کنید، سپس:

```bash
createdb biard
.venv/bin/python manage.py migrate
.venv/bin/python manage.py seed_demo
.venv/bin/python manage.py createsuperuser
.venv/bin/python manage.py runserver 127.0.0.1:8000
```

پنل ادمین: `http://127.0.0.1:8000/admin/`

### فرانت‌اند

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

سایت: `http://localhost:3100`

`npm run build` به API در حال اجرا نیاز دارد، چون صفحه‌های محصول هنگام ساخت از آن خوانده می‌شوند.

### آزمون‌های بک‌اند

```bash
cd backend
.venv/bin/python manage.py test tests
```

## پیش از انتشار

| مورد | کار لازم |
| --- | --- |
| دادهٔ نمونه | `seed_demo` فقط برای دمو است؛ محصولات، قیمت‌ها و نظرها ساختگی‌اند و باید با دادهٔ واقعی عوض شوند |
| پرداخت | در `.env`: `PAYMENT_GATEWAY=zarinpal` و `ZARINPAL_MERCHANT_ID`. درگاه `fake` با `DEBUG=false` کار نمی‌کند. اتصال به زرین‌پال هنوز با مرچنت واقعی آزمایش نشده است |
| پیامک بازیابی رمز | سرویس پیامک را در `backend/accounts/sms.py` وصل کنید؛ حالت `console` فقط کد را در لاگ می‌نویسد |
| سفارش‌های پرداخت‌نشده | `python manage.py release_unpaid` را با cron هر ۵ دقیقه اجرا کنید تا موجودی آزاد شود |
| چند پردازه | برای throttle، در `CACHE_URL` یک کش مشترک مانند Redis تنظیم کنید |
| تنظیمات دامنه | `FRONTEND_URL`، `ALLOWED_HOSTS` و `DEBUG=false` در بک‌اند؛ `API_URL` و `NEXT_PUBLIC_SITE_URL` در فرانت‌اند |
| فایل‌ها | روی سرور، `/media` و فایل‌های استاتیک ادمین را با Nginx یا فضای ذخیره‌سازی سرو کنید و جنگو را با Gunicorn اجرا کنید |
| محتوا | اطلاعات تماس در `frontend/src/lib/site.ts` و متن قوانین و حریم خصوصی |

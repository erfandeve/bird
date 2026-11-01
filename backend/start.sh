#!/bin/sh
set -e

python manage.py migrate --noinput

# با SEED_DEMO=true فقط اگر فروشگاه خالی باشد دادهٔ نمونه وارد می‌شود
if [ "$SEED_DEMO" = "true" ]; then
  python manage.py seed_demo --if-empty
fi

# با DJANGO_SUPERUSER_MOBILE و DJANGO_SUPERUSER_PASSWORD حساب مدیر ساخته می‌شود؛ اگر باشد اتفاقی نمی‌افتد
if [ -n "$DJANGO_SUPERUSER_MOBILE" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser --noinput || true
fi

exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT:-8000}" --workers 2 --threads 4 --timeout 40 --access-logfile -

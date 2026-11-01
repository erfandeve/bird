FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
# فقط برای جمع‌آوری فایل‌های استاتیک؛ کلید واقعی هنگام اجرا از متغیرهای محیطی می‌آید
RUN SECRET_KEY=build-only DEBUG=false python manage.py collectstatic --noinput

CMD ["sh", "start.sh"]

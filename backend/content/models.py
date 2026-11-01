from django.db import models
from django.utils import timezone


class Post(models.Model):
    slug = models.SlugField("شناسهٔ آدرس", max_length=120, unique=True)
    title = models.CharField("عنوان", max_length=200)
    excerpt = models.CharField("خلاصه", max_length=300)
    body = models.TextField("متن", help_text="پاراگراف‌ها را با خط خالی جدا کنید. تیتر را با ## شروع کنید.")
    read_minutes = models.PositiveSmallIntegerField("زمان مطالعه (دقیقه)", default=3)
    published_at = models.DateTimeField("تاریخ انتشار", default=timezone.now)
    is_published = models.BooleanField("منتشرشده", default=True)

    class Meta:
        ordering = ["-published_at"]
        verbose_name = "مقاله"
        verbose_name_plural = "مقاله‌ها"

    def __str__(self):
        return self.title

    def sections(self):
        result = [{"heading": None, "paragraphs": []}]
        for block in self.body.split("\n\n"):
            block = block.strip()
            if not block:
                continue
            if block.startswith("## "):
                result.append({"heading": block[3:].strip(), "paragraphs": []})
            else:
                result[-1]["paragraphs"].append(block)
        return [section for section in result if section["heading"] or section["paragraphs"]]


class ContactMessage(models.Model):
    name = models.CharField("نام", max_length=120)
    mobile = models.CharField("موبایل", max_length=11)
    message = models.TextField("پیام")
    is_handled = models.BooleanField("پاسخ داده شد", default=False)
    created_at = models.DateTimeField("تاریخ", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "پیام تماس"
        verbose_name_plural = "پیام‌های تماس"

    def __str__(self):
        return f"{self.name} ({self.mobile})"


class NewsletterSubscriber(models.Model):
    contact = models.CharField("موبایل یا ایمیل", max_length=254, unique=True)
    created_at = models.DateTimeField("تاریخ", auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "عضو خبرنامه"
        verbose_name_plural = "اعضای خبرنامه"

    def __str__(self):
        return self.contact

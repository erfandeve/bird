import threading
from datetime import timedelta
from unittest import mock

from django.core.management import call_command
from django.db import connection
from django.test import TestCase, TransactionTestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import PasswordResetCode, User
from catalog.models import BirdSpecies, Brand, Category, Product, Review, Variant
from orders.models import Coupon, Order, Payment, ShippingMethod
from orders.services import place_order

ADDRESS = {
    "receiver": "کاربر آزمون",
    "mobile": "۰۹۱۲۳۴۵۶۷۸۹",
    "province": "تهران",
    "city": "تهران",
    "line": "خیابان آزمایشی، پلاک دوازده",
    "postalCode": "1234567890",
}


def make_catalog():
    category = Category.objects.create(slug="seeds", name="دان", group="food")
    brand = Brand.objects.create(name="آوا")
    bird = BirdSpecies.objects.create(slug="canary", name="قناری")
    product = Product.objects.create(slug="mix", sku="S1", name="مخلوط دان", category=category, brand=brand)
    product.birds.add(bird)
    variant = Variant.objects.create(product=product, label="۱ کیلو", price=100_000, compare_at=120_000, stock=5)
    ShippingMethod.objects.create(code="post", name="پست", eta="۲ روز", price=50_000)
    ShippingMethod.objects.create(code="courier", name="پیک", eta="امروز", price=30_000, allows_cod=True)
    return product, variant


def order_payload(variant, **overrides):
    return {
        "lines": [{"variant": variant.pk, "qty": 1}],
        "address": ADDRESS,
        "shipping": "post",
        "payment": "online",
        "expectedTotal": 150_000,
        **overrides,
    }


@override_settings(PAYMENT_GATEWAY="fake", DEBUG=True, FREE_SHIPPING_FROM=800_000)
class OrderTests(TestCase):
    def setUp(self):
        self.product, self.variant = make_catalog()
        self.client = APIClient()

    def test_price_comes_from_database_not_client(self):
        response = self.client.post("/api/v1/orders", order_payload(self.variant, expectedTotal=1), format="json")
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data["code"], "price_changed")
        self.assertEqual(response.data["total"], 150_000)
        self.assertEqual(Order.objects.count(), 0)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 5)

    def test_order_reduces_stock_and_rejects_overselling(self):
        response = self.client.post("/api/v1/orders", order_payload(self.variant), format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(response.data["paymentUrl"])
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 4)

        over = order_payload(self.variant, lines=[{"variant": self.variant.pk, "qty": 5}])
        response = self.client.post("/api/v1/orders", over, format="json")
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data["code"], "stock")
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 4)

    def test_duplicate_lines_are_merged_before_stock_check(self):
        lines = [{"variant": self.variant.pk, "qty": 3}, {"variant": self.variant.pk, "qty": 3}]
        response = self.client.post("/api/v1/orders", order_payload(self.variant, lines=lines), format="json")
        self.assertEqual(response.data["code"], "stock")

    def test_free_shipping_threshold(self):
        Variant.objects.filter(pk=self.variant.pk).update(price=800_000)
        response = self.client.post("/api/v1/orders", order_payload(self.variant, expectedTotal=800_000), format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["order"]["shipping"], 0)

    def test_cod_only_with_allowed_shipping(self):
        response = self.client.post("/api/v1/orders", order_payload(self.variant, payment="cod"), format="json")
        self.assertEqual(response.status_code, 409)
        response = self.client.post(
            "/api/v1/orders", order_payload(self.variant, payment="cod", shipping="courier", expectedTotal=130_000), format="json"
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIsNone(response.data["paymentUrl"])
        self.assertEqual(response.data["order"]["status"], "confirmed")

    def test_coupon_cap_expiry_and_usage_limit(self):
        Coupon.objects.create(code="OFF", label="x", percent=50, cap=20_000, max_uses=1)
        Coupon.objects.create(code="OLD", label="x", percent=50, ends_at=timezone.now() - timedelta(days=1))
        quote = self.client.post(
            "/api/v1/orders/quote", {"lines": [{"variant": self.variant.pk, "qty": 1}], "coupon": "off", "shipping": "post"}, format="json"
        ).data
        self.assertEqual(quote["discount"], 20_000)
        self.assertEqual(quote["total"], 130_000)

        old = self.client.post("/api/v1/orders/quote", {"lines": [{"variant": self.variant.pk, "qty": 1}], "coupon": "OLD"}, format="json").data
        self.assertEqual(old["discount"], 0)
        self.assertTrue(old["couponError"])

        first = self.client.post("/api/v1/orders", order_payload(self.variant, coupon="OFF", expectedTotal=130_000), format="json")
        self.assertEqual(first.status_code, 201, first.data)
        second = self.client.post("/api/v1/orders", order_payload(self.variant, coupon="OFF", expectedTotal=130_000), format="json")
        self.assertEqual(second.data["code"], "coupon")

    def test_successful_payment_is_idempotent(self):
        created = self.client.post("/api/v1/orders", order_payload(self.variant), format="json").data
        payment = Payment.objects.get()
        url = f"/api/v1/payments/callback?Authority={payment.authority}&Status=OK"
        for _ in range(2):
            response = self.client.get(url)
            self.assertEqual(response.status_code, 302)
            self.assertIn(f"/checkout/success?order={created['order']['id']}", response["Location"])
        order = Order.objects.get()
        self.assertEqual(order.status, "confirmed")
        self.assertIsNotNone(order.paid_at)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 4)

    def test_failed_payment_cancels_and_restores_stock_once(self):
        Coupon.objects.create(code="OFF", label="x", percent=10)
        self.client.post("/api/v1/orders", order_payload(self.variant, coupon="OFF", expectedTotal=140_000), format="json")
        payment = Payment.objects.get()
        url = f"/api/v1/payments/callback?Authority={payment.authority}&Status=NOK"
        for _ in range(2):
            self.assertIn("/checkout/failed", self.client.get(url)["Location"])
        self.assertEqual(Order.objects.get().status, "cancelled")
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 5)
        self.assertEqual(Coupon.objects.get().used_count, 0)

    @override_settings(PAYMENT_GATEWAY="zarinpal", ZARINPAL_MERCHANT_ID="")
    def test_missing_gateway_config_releases_the_order(self):
        response = self.client.post("/api/v1/orders", order_payload(self.variant), format="json")
        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.data["code"], "gateway")
        self.assertEqual(Order.objects.get().status, "cancelled")
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 5)

    def test_unknown_authority_goes_to_failed_page(self):
        self.assertIn("/checkout/failed", self.client.get("/api/v1/payments/callback?Authority=nope&Status=OK")["Location"])

    def test_expired_order_is_released_and_late_payment_not_accepted(self):
        self.client.post("/api/v1/orders", order_payload(self.variant), format="json")
        Order.objects.update(created_at=timezone.now() - timedelta(hours=2))
        call_command("release_unpaid", verbosity=0)
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.stock, 5)
        payment = Payment.objects.get()
        response = self.client.get(f"/api/v1/payments/callback?Authority={payment.authority}&Status=OK")
        self.assertIn("/checkout/failed", response["Location"])
        self.assertIsNone(Order.objects.get().paid_at)

    def test_order_privacy(self):
        owner = User.objects.create_user("09120000001", "pw-For-test-1")
        other = User.objects.create_user("09120000002", "pw-For-test-2")
        self.client.force_authenticate(owner)
        code = self.client.post("/api/v1/orders", order_payload(self.variant), format="json").data["order"]["id"]
        self.assertEqual(self.client.get(f"/api/v1/orders/{code}").status_code, 200)

        stranger = APIClient()
        stranger.force_authenticate(other)
        self.assertEqual(stranger.get(f"/api/v1/orders/{code}").status_code, 404)
        self.assertEqual(stranger.get("/api/v1/orders").data, [])
        self.assertEqual(APIClient().get(f"/api/v1/orders/{code}").status_code, 404)
        self.assertEqual(APIClient().get("/api/v1/orders").status_code, 403)

    def test_guest_can_read_own_order_and_track_needs_mobile(self):
        code = self.client.post("/api/v1/orders", order_payload(self.variant), format="json").data["order"]["id"]
        self.assertEqual(self.client.get(f"/api/v1/orders/{code}").status_code, 200)
        self.assertEqual(APIClient().get(f"/api/v1/orders/{code}").status_code, 404)
        wrong = APIClient().post("/api/v1/orders/track", {"code": code, "mobile": "09999999999"}, format="json")
        self.assertEqual(wrong.status_code, 404)
        right = APIClient().post("/api/v1/orders/track", {"code": code, "mobile": "09123456789"}, format="json")
        self.assertEqual(right.status_code, 200)


@override_settings(PAYMENT_GATEWAY="fake", DEBUG=True)
class ConcurrencyTests(TransactionTestCase):
    def test_two_buyers_cannot_take_the_last_item(self):
        _, variant = make_catalog()
        Variant.objects.filter(pk=variant.pk).update(stock=1)
        address = {"receiver": "x y z", "mobile": "09120000000", "province": "ت", "city": "تت", "line": "نشانی آزمایشی کامل", "postal_code": "1234567890"}
        results, barrier = [], threading.Barrier(2)

        def buy():
            barrier.wait()
            try:
                place_order(user=None, lines=[{"variant": variant.pk, "qty": 1}], address=address, shipping_code="post", payment_method="online", coupon_code="", expected_total=150_000)
                results.append("ok")
            except Exception as error:  # noqa: BLE001
                results.append(getattr(error, "code", repr(error)))
            finally:
                connection.close()

        threads = [threading.Thread(target=buy) for _ in range(2)]
        [t.start() for t in threads]
        [t.join() for t in threads]
        self.assertEqual(sorted(results), ["ok", "stock"])
        variant.refresh_from_db()
        self.assertEqual(variant.stock, 0)


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def register(self, **overrides):
        data = {"name": "کاربر آزمون", "mobile": "۰۹۱۲۰۰۰۰۰۰۳", "password": "Strong-pass-77", **overrides}
        return self.client.post("/api/v1/auth/register", data, format="json")

    def test_register_login_logout(self):
        self.assertEqual(self.register().status_code, 201)
        user = User.objects.get()
        self.assertEqual(user.mobile, "09120000003")
        self.assertNotEqual(user.password, "Strong-pass-77")
        self.assertEqual(self.client.get("/api/v1/auth/me").data["user"]["mobile"], "09120000003")
        self.client.post("/api/v1/auth/logout")
        self.assertIsNone(self.client.get("/api/v1/auth/me").data["user"])

        bad = self.client.post("/api/v1/auth/login", {"mobile": "09120000003", "password": "wrong"}, format="json")
        self.assertEqual(bad.status_code, 400)
        good = self.client.post("/api/v1/auth/login", {"mobile": "09120000003", "password": "Strong-pass-77"}, format="json")
        self.assertEqual(good.status_code, 200)

    def test_register_rejects_weak_password_and_duplicates(self):
        self.assertEqual(self.register(password="12345678").status_code, 400)
        self.assertEqual(self.register().status_code, 201)
        self.client.post("/api/v1/auth/logout")
        self.assertEqual(self.register().status_code, 400)

    @mock.patch("accounts.views.send_sms")
    def test_password_reset(self, send_sms):
        User.objects.create_user("09120000004", "Old-pass-991")
        response = self.client.post("/api/v1/auth/password/forgot", {"mobile": "09120000004"}, format="json")
        self.assertNotIn("code", response.data)
        code = send_sms.call_args.args[1].split(": ")[1]

        wrong = "000000" if code != "000000" else "111111"
        data = {"mobile": "09120000004", "code": wrong, "password": "New-pass-552"}
        self.assertEqual(self.client.post("/api/v1/auth/password/reset", data, format="json").status_code, 400)
        data["code"] = code
        self.assertEqual(self.client.post("/api/v1/auth/password/reset", data, format="json").status_code, 200)
        self.assertTrue(User.objects.get().check_password("New-pass-552"))
        # کد مصرف‌شده دوباره کار نمی‌کند
        self.assertEqual(self.client.post("/api/v1/auth/password/reset", data, format="json").status_code, 400)

    @mock.patch("accounts.views.send_sms")
    def test_forgot_reveals_nothing_about_unknown_numbers(self, send_sms):
        response = self.client.post("/api/v1/auth/password/forgot", {"mobile": "09129999999"}, format="json")
        self.assertEqual(response.status_code, 200)
        send_sms.assert_not_called()
        self.assertEqual(PasswordResetCode.objects.count(), 0)

    def test_addresses_are_private(self):
        owner = User.objects.create_user("09120000005", "Pass-word-111")
        other = User.objects.create_user("09120000006", "Pass-word-222")
        self.client.force_authenticate(owner)
        created = self.client.post("/api/v1/auth/addresses", ADDRESS, format="json")
        self.assertEqual(created.status_code, 201, created.data)
        self.assertEqual(created.data["mobile"], "09123456789")
        stranger = APIClient()
        stranger.force_authenticate(other)
        self.assertEqual(stranger.get("/api/v1/auth/addresses").data, [])
        self.assertEqual(stranger.delete(f"/api/v1/auth/addresses/{created.data['id']}").status_code, 404)

    def test_csrf_is_enforced_for_logged_in_browser_sessions(self):
        User.objects.create_user("09120000007", "Pass-word-333")
        browser = APIClient(enforce_csrf_checks=True)
        browser.post("/api/v1/auth/login", {"mobile": "09120000007", "password": "Pass-word-333"}, format="json")
        self.assertEqual(browser.post("/api/v1/auth/logout").status_code, 403)


class CatalogTests(TestCase):
    def setUp(self):
        self.product, self.variant = make_catalog()
        self.client = APIClient()

    def test_filters_search_and_inactive(self):
        def slugs(query=""):
            return [p["slug"] for p in self.client.get(f"/api/v1/products{query}").data["items"]]

        self.assertEqual(slugs("?bird=canary&sale=1&stock=1&min=50000&max=100000"), ["mix"])
        self.assertEqual(slugs("?bird=finch"), [])
        self.assertEqual(slugs("?q=" + "مخلوط%20قناري"), ["mix"])  # ی عربی
        Product.objects.update(is_active=False)
        self.assertEqual(slugs(), [])
        self.assertEqual(self.client.get("/api/v1/products/mix").status_code, 404)
        self.assertNotIn("mix", self.client.get("/api/v1/slugs").data["product"])

    def test_bad_query_params_do_not_crash(self):
        for query in ["?page=abc", "?page=-1", "?min=abc", "?per_page=99999", "?sort=x", "?tag=x"]:
            self.assertEqual(self.client.get(f"/api/v1/products{query}").status_code, 200, query)

    def test_multi_bird_filter_does_not_duplicate_products(self):
        finch = BirdSpecies.objects.create(slug="finch", name="فنچ")
        self.product.birds.add(finch)
        data = self.client.get("/api/v1/products?bird=canary,finch").data
        self.assertEqual(data["total"], 1)

    def test_reviews_need_login_and_approval(self):
        url = "/api/v1/products/mix/reviews"
        self.assertEqual(self.client.post(url, {"rating": 5, "text": "خیلی خوب بود واقعاً"}, format="json").status_code, 403)
        user = User.objects.create_user("09120000008", "Pass-word-444", name="نگار")
        self.client.force_authenticate(user)
        self.assertEqual(self.client.post(url, {"rating": 5, "text": "خیلی خوب بود واقعاً"}, format="json").status_code, 201)
        self.assertEqual(self.client.post(url, {"rating": 4, "text": "نظر دوم من دربارهٔ این"}, format="json").status_code, 409)
        self.assertEqual(self.client.get(url).data, [])
        Review.objects.update(is_approved=True)
        Review.objects.get().save()
        self.assertEqual(len(self.client.get(url).data), 1)
        self.product.refresh_from_db()
        self.assertEqual((float(self.product.rating), self.product.review_count), (5.0, 1))

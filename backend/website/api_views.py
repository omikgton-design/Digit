import json
import logging
import os
import re
import secrets
import urllib.parse
import urllib.request
from urllib.error import HTTPError, URLError
from datetime import date
from decimal import Decimal, InvalidOperation
from typing import Any

from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core import signing
from django.core.mail import send_mail
from django.db.models import Avg, Case, Count, IntegerField, Q, Value, When
from django.http import HttpRequest, HttpResponse, JsonResponse, HttpResponseRedirect, request
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods

from website.registry import REGISTER_PATTERN, normalize_register
from website.models import AboutSection, AdvisoryLike, ArticleLike, FooterLink, ProcessSection, ProcessStep, SiteSetting, AdvisoryPriceTerm, AdvisoryRating, AdvisoryService, AdvisoryServiceImage, AdvisoryServiceType, Article, Category, Customer, CustomerBanner, CustomerMembershipPayment, FooterMenuContent, PartnerOrganization, Slide, Software, SoftwareImage, SoftwareRating, SavedSoftware, SavedAdvisory, SavedArticle


def _parse_json(request: HttpRequest) -> dict[str, Any]:
    if not request.body:
        return {}
    try:
        return json.loads(request.body)
    except json.JSONDecodeError:
        return {}


def _parse_body_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if value in [None, ""]:
        return []
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
        except json.JSONDecodeError:
            return [item.strip() for item in value.split(",") if item.strip()]
    return []


def _get_multi_values(request: HttpRequest, key: str) -> list[str]:
    values: list[str] = []
    for raw_value in request.GET.getlist(key):
        for part in raw_value.split(","):
            normalized = part.strip()
            if normalized:
                values.append(normalized)
    return values


logger = logging.getLogger(__name__)

_normalize_register = normalize_register


def _tier_rank(prefix: str):
    """Gold -> 0, Silver -> 1, бусад (Bronze) -> 2. Хайлт, жагсаалтын эрэмбэд ашиглана."""
    return Case(
        When(**{f"{prefix}__type": Customer.TYPE_GOLD}, then=Value(0)),
        When(**{f"{prefix}__type": Customer.TYPE_SILVER}, then=Value(1)),
        default=Value(2),
        output_field=IntegerField(),
    )


def _customer_payload(customer: Customer, request: HttpRequest) -> dict[str, Any]:
    logo_url = request.build_absolute_uri(customer.logo.url) if customer.logo else ""
    return {
        "id": customer.id,
        "name": customer.name,
        "email": customer.email,
        "phone": customer.phone,
        "website": customer.website,
        "address": customer.address,
        "contact_person_name": customer.contact_person_name,
        "contact_person_phone": customer.contact_person_phone,
        "account_type": customer.account_type,
        "type": customer.type,
        "register_number": customer.register_number or "",
        "limits": {
            "software": customer.content_limit("software"),
            "advisory": customer.content_limit("advisory"),
            "article": customer.content_limit("article"),
        },
        "logo_url": logo_url,
    }


def _get_customer_for_user(request: HttpRequest) -> Customer:
    customer, _ = Customer.objects.get_or_create(
        user=request.user,
        defaults={
            "name": request.user.get_full_name() or request.user.username,
            "email": request.user.email or request.user.username,
        },
    )
    return customer


def _software_thumbnail_url(software: Software, request: HttpRequest) -> str:
    first_image = software.images.first()
    if first_image and getattr(first_image, "image", None):
        try:
            return request.build_absolute_uri(first_image.image.url)
        except Exception:
            return ""
    return ""


def _software_rating_payload(software: Software, request: HttpRequest) -> dict[str, Any]:
    stats = software.ratings.aggregate(average=Avg("score"), count=Count("id"))
    user_rating = None
    user_comment = ""

    if request.user.is_authenticated:
        rating = software.ratings.filter(user=request.user).first()
        user_rating = rating.score if rating else None
        user_comment = rating.comment if rating else ""

    return {
        "rating_average": round(float(stats["average"] or 0), 1),
        "rating_count": stats["count"] or 0,
        "user_rating": user_rating,
        "user_comment": user_comment,
    }

def _software_payload(software: Software, request: HttpRequest) -> dict[str, Any]:
    images = []
    for image in software.images.all():
        try:
            images.append(request.build_absolute_uri(image.image.url))
        except Exception:
            continue

    return {
        "id": software.id,
        "name": software.name,
        "program_type": {"id": software.program_type_id, "name": software.program_type.name},
        "advisory_sectors": [{"id": category.id, "name": category.name} for category in software.advisory_sectors.all()],
        "developer": {"id": software.developer_id, "name": software.developer.name},
        "price": str(software.price),
        "price_type": software.price_type,
        "is_approved": software.is_approved,
        "is_featured": software.is_featured,
        "development_start_year": software.development_start_year,
        "introduction": software.introduction,
        "description": software.description,
        "thumbnail_url": _software_thumbnail_url(software, request),
        "images": images,
        **_software_rating_payload(software, request),
    }


def _software_list_payload(software: Software, request: HttpRequest) -> dict[str, Any]:
    return {
        "id": software.id,
        "name": software.name,
        "program_type": {"id": software.program_type_id, "name": software.program_type.name},
        "advisory_sectors": [{"id": category.id, "name": category.name} for category in software.advisory_sectors.all()],
        "developer": {"id": software.developer_id, "name": software.developer.name},
        "price": str(software.price),
        "price_type": software.price_type,
        "is_featured": software.is_featured,
        "introduction": software.introduction,
        "thumbnail_url": _software_thumbnail_url(software, request),
        **_software_rating_payload(software, request),
    }


def _related_software_payload(software: Software, request: HttpRequest) -> list[dict[str, Any]]:
    queryset = (
        Software.objects
        .filter(is_approved=True, program_type_id=software.program_type_id)
        .exclude(id=software.id)
        .select_related("program_type", "developer")
        .prefetch_related("images", "advisory_sectors")
        .order_by("-is_featured", "-created_date", "-id")[:4]
    )
    return [_software_list_payload(item, request) for item in queryset]


def _parse_software_form_data(payload: Any) -> tuple[dict[str, Any] | None, JsonResponse | None]:
    name = (payload.get("name") or "").strip()
    introduction = (payload.get("introduction") or "").strip()
    description = (payload.get("description") or "").strip()
    price_type = (payload.get("price_type") or "").strip()
    program_type_id = payload.get("program_type_id")
    development_start_year = payload.get("development_start_year")
    advisory_sector_ids = _parse_body_list(payload.get("advisory_sector_ids"))

    if not name:
        return None, JsonResponse({"message": "Програмын нэр шаардлагатай."}, status=400)
    if price_type not in [Software.PRICE_TYPE_RENT, Software.PRICE_TYPE_SALE]:
        return None, JsonResponse({"message": "Үнийн төрөл буруу байна."}, status=400)

    try:
        program_type_id = int(program_type_id)
    except (TypeError, ValueError):
        return None, JsonResponse({"message": "Програмын төрөл сонгоно уу."}, status=400)

    try:
        development_start_year = int(development_start_year)
    except (TypeError, ValueError):
        return None, JsonResponse({"message": "Эхэлсэн он буруу байна."}, status=400)

    current_year = date.today().year
    if development_start_year < 1900 or development_start_year > current_year + 1:
        return None, JsonResponse({"message": "Эхэлсэн он буруу байна."}, status=400)

    try:
        price = Decimal(str(payload.get("price") or "0")).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError):
        return None, JsonResponse({"message": "Үнэ буруу байна."}, status=400)

    if price < 0:
        return None, JsonResponse({"message": "Үнэ сөрөг байж болохгүй."}, status=400)

    try:
        program_type = Category.objects.get(id=program_type_id, type=Category.TYPE_PROGRAM)
    except Category.DoesNotExist:
        return None, JsonResponse({"message": "Програмын төрөл олдсонгүй."}, status=400)

    sector_ids: list[int] = []
    if isinstance(advisory_sector_ids, list):
        for raw_value in advisory_sector_ids:
            try:
                sector_ids.append(int(raw_value))
            except (TypeError, ValueError):
                continue

    advisory_sectors = list(Category.objects.filter(id__in=sector_ids, type=Category.TYPE_ADVISORY))
    if sector_ids and len(advisory_sectors) != len(set(sector_ids)):
        return None, JsonResponse({"message": "Салбарын сонголт буруу байна."}, status=400)

    return {
        "name": name,
        "introduction": introduction,
        "description": description,
        "price_type": price_type,
        "program_type": program_type,
        "development_start_year": development_start_year,
        "price": price,
        "advisory_sectors": advisory_sectors,
    }, None


def _advisory_thumbnail_url(advisory: AdvisoryService, request: HttpRequest) -> str:
    first_image = advisory.images.first()
    if first_image and getattr(first_image, "image", None):
        try:
            return request.build_absolute_uri(first_image.image.url)
        except Exception:
            return ""
    return ""


def _advisory_payload(advisory: AdvisoryService, request: HttpRequest) -> dict[str, Any]:
    images = []
    for image in advisory.images.all():
        try:
            images.append(request.build_absolute_uri(image.image.url))
        except Exception:
            continue

    return {
        "id": advisory.id,
        "title": advisory.title,
        "service_type": advisory.service_type.name,
        "service_type_value": advisory.service_type.key,
        "advisory_sectors": [{"id": category.id, "name": category.name} for category in advisory.advisory_sectors.all()],
        "service_start_year": advisory.service_start_year,
        "company": {"id": advisory.company_id, "name": advisory.company.name},
        "introduction": advisory.introduction,
        "description": advisory.description,
        "price_terms": advisory.price_terms.name,
        "price_terms_value": advisory.price_terms.key,
        "price": str(advisory.price),
        "client_organizations": advisory.client_organizations,
        "like_count": getattr(advisory, "like_count", 0),
        "liked": _advisory_liked_by_user(advisory, request),
        "is_approved": advisory.is_approved,
        "is_featured": advisory.is_featured,
        "thumbnail_url": _advisory_thumbnail_url(advisory, request),
        "images": images,
        **_advisory_rating_payload(advisory, request),
    }


def _advisory_list_payload(advisory: AdvisoryService, request: HttpRequest) -> dict[str, Any]:
    return {
        "id": advisory.id,
        "title": advisory.title,
        "service_type": advisory.service_type.name,
        "service_type_value": advisory.service_type.key,
        "advisory_sectors": [{"id": category.id, "name": category.name} for category in advisory.advisory_sectors.all()],
        "company": {"id": advisory.company_id, "name": advisory.company.name},
        "introduction": advisory.introduction,
        "price_terms": advisory.price_terms.name,
        "price": str(advisory.price),
        "like_count": advisory.like_count,
        "liked": _advisory_liked_by_user(advisory, request),
        "thumbnail_url": _advisory_thumbnail_url(advisory, request),
        "is_featured": advisory.is_featured,
        **_advisory_rating_payload(advisory, request),
    }


def _related_advisory_payload(advisory: AdvisoryService, request: HttpRequest) -> list[dict[str, Any]]:
    queryset = (
        AdvisoryService.objects
        .filter(is_approved=True, service_type_id=advisory.service_type_id)
        .exclude(id=advisory.id)
        .select_related("company", "service_type", "price_terms")
        .prefetch_related("images", "advisory_sectors")
        .annotate(like_count=Count("likes", distinct=True))
        .order_by("-is_featured", "-created_date", "-id")[:4]
    )
    return [_advisory_list_payload(item, request) for item in queryset]


def _parse_advisory_form_data(payload: Any) -> tuple[dict[str, Any] | None, JsonResponse | None]:
    title = (payload.get("title") or "").strip()
    introduction = (payload.get("introduction") or "").strip()
    description = (payload.get("description") or "").strip()
    client_organizations = (payload.get("client_organizations") or "").strip()
    service_type_key = (payload.get("service_type") or "").strip()
    price_terms_key = (payload.get("price_terms") or "").strip()
    service_start_year = payload.get("service_start_year")
    advisory_sector_ids = _parse_body_list(payload.get("advisory_sector_ids"))

    if not title:
        return None, JsonResponse({"message": "Зөвлөх үйлчилгээний нэр шаардлагатай."}, status=400)
    if not service_type_key:
        return None, JsonResponse({"message": "Үйлчилгээний төрөл сонгоно уу."}, status=400)
    if not price_terms_key:
        return None, JsonResponse({"message": "Үнийн нөхцөл сонгоно уу."}, status=400)

    try:
        service_start_year = int(service_start_year)
    except (TypeError, ValueError):
        return None, JsonResponse({"message": "Эхэлсэн он буруу байна."}, status=400)

    current_year = date.today().year
    if service_start_year < 1900 or service_start_year > current_year + 1:
        return None, JsonResponse({"message": "Эхэлсэн он буруу байна."}, status=400)

    try:
        price = Decimal(str(payload.get("price") or "0")).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError):
        return None, JsonResponse({"message": "Үнэ буруу байна."}, status=400)

    if price < 0:
        return None, JsonResponse({"message": "Үнэ сөрөг байж болохгүй."}, status=400)

    try:
        service_type = AdvisoryServiceType.objects.get(key=service_type_key)
    except AdvisoryServiceType.DoesNotExist:
        return None, JsonResponse({"message": "Үйлчилгээний төрөл олдсонгүй."}, status=400)

    try:
        price_terms = AdvisoryPriceTerm.objects.get(key=price_terms_key)
    except AdvisoryPriceTerm.DoesNotExist:
        return None, JsonResponse({"message": "Үнийн нөхцөл олдсонгүй."}, status=400)

    sector_ids: list[int] = []
    if isinstance(advisory_sector_ids, list):
        for raw_value in advisory_sector_ids:
            try:
                sector_ids.append(int(raw_value))
            except (TypeError, ValueError):
                continue

    advisory_sectors = list(Category.objects.filter(id__in=sector_ids, type=Category.TYPE_ADVISORY))
    if sector_ids and len(advisory_sectors) != len(set(sector_ids)):
        return None, JsonResponse({"message": "Салбарын сонголт буруу байна."}, status=400)

    return {
        "title": title,
        "service_type": service_type,
        "service_start_year": service_start_year,
        "advisory_sectors": advisory_sectors,
        "introduction": introduction,
        "description": description,
        "price_terms": price_terms,
        "price": price,
        "client_organizations": client_organizations,
    }, None


def _advisory_liked_by_user(advisory: AdvisoryService, request: HttpRequest) -> bool:
    if not request.user.is_authenticated:
        return False
    return advisory.likes.filter(user=request.user).exists()


def _advisory_rating_payload(advisory: AdvisoryService, request: HttpRequest) -> dict[str, Any]:
    stats = advisory.ratings.aggregate(average=Avg("score"), count=Count("id"))
    user_rating = None
    user_comment = ""

    if request.user.is_authenticated:
        rating = advisory.ratings.filter(user=request.user).first()
        user_rating = rating.score if rating else None
        user_comment = rating.comment if rating else ""

    return {
        "rating_average": round(float(stats["average"] or 0), 1),
        "rating_count": stats["count"] or 0,
        "user_rating": user_rating,
        "user_comment": user_comment,
    }


def _article_thumbnail_url(article: Article, request: HttpRequest) -> str:
    if getattr(article, "image", None):
        try:
            return request.build_absolute_uri(article.image.url)
        except Exception:
            return ""
    return ""


def _article_payload(article: Article, request: HttpRequest) -> dict[str, Any]:
    image_url = ""
    if article.image:
        try:
            image_url = request.build_absolute_uri(article.image.url)
        except Exception:
            image_url = ""

    return {
        "id": article.id,
        "title": article.title,
        "article_type": {"id": article.article_type_id, "name": article.article_type.name},
        "organization": {"id": article.organization_id, "name": article.organization.name},
        "published_date": article.published_date.isoformat(),
        "update_date": article.update_date.date().isoformat(),
        "description": article.description,
        "thumbnail_url": _article_thumbnail_url(article, request),
        "image_url": image_url,
        "is_approved": article.is_approved,
        "is_featured": article.is_featured,
        "like_count": article.likes.count(),
        "liked": bool(request.user.is_authenticated and article.likes.filter(user=request.user).exists()),
    }


def _saved_by_user(request: HttpRequest, model, **lookup) -> bool:
    """Нэвтэрсэн хувь хэрэглэгч тухайн контентыг хадгалсан эсэх."""
    if not request.user.is_authenticated:
        return False
    return model.objects.filter(user=request.user, **lookup).exists()


def _related_article_payload(article: Article, request: HttpRequest) -> list[dict[str, Any]]:
    queryset = (
        Article.objects
        .filter(is_approved=True, article_type_id=article.article_type_id)
        .exclude(id=article.id)
        .select_related("article_type", "organization")
        .order_by("-is_featured", "-published_date", "-id")[:4]
    )
    return [_article_payload(item, request) for item in queryset]


def _ensure_content_limit(customer: Customer, queryset, label: str, kind: str = "software") -> JsonResponse | None:
    if customer.account_type == Customer.ACCOUNT_PERSON:
        return JsonResponse(
            {"message": "Хувь хэрэглэгч програм хангамж, зөвлөх үйлчилгээ, нийтлэл нэмэх боломжгүй. Зөвхөн үнэлгээ өгөх, сэтгэгдэл бичих боломжтой."},
            status=403,
        )
    limit = customer.content_limit(kind)
    if limit is None:
        return None
    if limit <= 0 or queryset.filter().count() >= limit:
        tier_label = dict(Customer.TYPE_CHOICES).get(customer.type, customer.type.title())
        if limit <= 0:
            message = f"{tier_label} багцад {label} нэмэх боломжгүй. Багцаа шинэчлээрэй."
        else:
            message = f"{tier_label} багц хамгийн ихдээ {limit} {label} оруулах боломжтой."
        return JsonResponse({"message": message}, status=400)
    return None


def _can_view_unapproved(owner_id: int, request: HttpRequest) -> bool:
    if not request.user.is_authenticated:
        return False
    if request.user.is_staff or request.user.is_superuser:
        return True
    customer = getattr(request.user, "customer", None)
    return bool(customer and customer.id == owner_id)


def _parse_article_form_data(payload: Any, files: Any, existing_article: Article | None = None) -> tuple[dict[str, Any] | None, JsonResponse | None]:
    title = (payload.get("title") or "").strip()
    description = (payload.get("description") or "").strip()
    published_date_value = (payload.get("published_date") or "").strip()
    article_type_id = payload.get("article_type_id")
    image = files.get("image") if files else None

    if not title:
        return None, JsonResponse({"message": "Нийтлэлийн гарчиг шаардлагатай."}, status=400)
    try:
        article_type_id = int(article_type_id)
    except (TypeError, ValueError):
        return None, JsonResponse({"message": "Нийтлэлийн төрөл сонгоно уу."}, status=400)

    if published_date_value:
        try:
            published_date = date.fromisoformat(published_date_value)
        except ValueError:
            return None, JsonResponse({"message": "Огноо буруу байна."}, status=400)
    elif existing_article is not None:
        published_date = existing_article.published_date
    else:
        published_date = date.today()

    try:
        article_type = Category.objects.get(id=article_type_id, type=Category.TYPE_ARTICLE)
    except Category.DoesNotExist:
        return None, JsonResponse({"message": "Нийтлэлийн төрөл олдсонгүй."}, status=400)

    return {
        "title": title,
        "description": description,
        "published_date": published_date,
        "article_type": article_type,
        "image": image,
    }, None


@require_http_methods(["GET"])
@ensure_csrf_cookie
def csrf(request: HttpRequest) -> JsonResponse:
    return JsonResponse({"csrfToken": get_token(request)})


def _google_frontend_url(path: str) -> str:
    frontend = os.getenv("FRONTEND_URL", "http://127.0.0.1:5173").strip().rstrip("/")
    return frontend + path


def google_oauth_start(request: HttpRequest) -> HttpResponseRedirect:
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    if not client_id:
        return HttpResponseRedirect(_google_frontend_url("/login?oauth_error=google_not_configured"))

    # Sign the OAuth state with Django's SECRET_KEY instead of relying on a
    # browser session cookie surviving the round-trip to Google.
    nonce = secrets.token_urlsafe(32)
    state = signing.dumps(nonce, salt="digit.google.oauth.state")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "").strip() or request.build_absolute_uri(reverse("api_google_callback"))
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "prompt": "select_account",
    }
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    return HttpResponseRedirect(url)


def _google_error_redirect(code: str) -> HttpResponseRedirect:
    return HttpResponseRedirect(_google_frontend_url("/login?oauth_error=" + urllib.parse.quote(code)))


@require_http_methods(["GET"])
def google_oauth_callback(request: HttpRequest) -> HttpResponseRedirect:
    received_state = request.GET.get("state", "")
    try:
        # State is time-limited and cryptographically signed to prevent forgery.
        signing.loads(received_state, salt="digit.google.oauth.state", max_age=600)
    except (signing.BadSignature, signing.SignatureExpired, TypeError):
        return _google_error_redirect("state")

    if request.GET.get("error"):
        return _google_error_redirect("cancelled")

    code = request.GET.get("code", "")
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "").strip() or request.build_absolute_uri(reverse("api_google_callback"))
    if not code or not client_id or not client_secret:
        return _google_error_redirect("google_not_configured")

    try:
        token_body = urllib.parse.urlencode({
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }).encode("utf-8")
        token_request = urllib.request.Request(
            "https://oauth2.googleapis.com/token",
            data=token_body,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )
        with urllib.request.urlopen(token_request, timeout=10) as response:
            token_data = json.loads(response.read().decode("utf-8"))
        id_token = token_data.get("id_token")
        if not id_token:
            return _google_error_redirect("token")
        verify_url = "https://oauth2.googleapis.com/tokeninfo?" + urllib.parse.urlencode({"id_token": id_token})
        with urllib.request.urlopen(verify_url, timeout=10) as response:
            claims = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, ValueError, OSError):
        return _google_error_redirect("google_verification")

    if claims.get("aud") != client_id or claims.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        return _google_error_redirect("token_invalid")
    if claims.get("email_verified") not in (True, "true", "True", "1"):
        return _google_error_redirect("email_unverified")
    email = (claims.get("email") or "").strip().lower()
    if not email:
        return _google_error_redirect("email_missing")

    user = User.objects.filter(email__iexact=email).first()
    if user is None:
        username = email
        if User.objects.filter(username=username).exists():
            return _google_error_redirect("account_conflict")
        display_name = " ".join(part for part in [claims.get("given_name", ""), claims.get("family_name", "")] if part).strip()
        if not display_name:
            display_name = (claims.get("name") or email.split("@")[0]).strip()
        user = User.objects.create_user(username=username, email=email, password=secrets.token_urlsafe(48), first_name=claims.get("given_name", "")[:150], last_name=claims.get("family_name", "")[:150])
        Customer.objects.create(user=user, name=display_name[:255], email=email, account_type=Customer.ACCOUNT_PERSON)
    else:
        customer = getattr(user, "customer", None)
        if customer and customer.account_type != Customer.ACCOUNT_PERSON:
            return _google_error_redirect("organization_account")
        if customer is None:
            display_name = (claims.get("name") or email.split("@")[0]).strip()
            Customer.objects.create(user=user, name=display_name[:255], email=email, account_type=Customer.ACCOUNT_PERSON)

    if not user.is_active:
        return _google_error_redirect("account_inactive")
    login(request, user, backend="django.contrib.auth.backends.ModelBackend")
    return HttpResponseRedirect(_google_frontend_url("/login?oauth_success=google"))


@require_http_methods(["POST"])
def login_api(request: HttpRequest) -> JsonResponse:
    payload = _parse_json(request)
    email = (payload.get("email") or "").strip().lower()
    register_number = _normalize_register(payload.get("register_number"))
    password = payload.get("password") or ""

    if not password or not (email or register_number):
        return JsonResponse({"message": "Нэвтрэх мэдээлэл болон нууц үг шаардлагатай."}, status=400)

    if register_number:
        # Байгууллага: регистр + нууц үг
        org = Customer.objects.select_related("user").filter(account_type=Customer.ACCOUNT_ORG, register_number=register_number).first()
        user = authenticate(request, username=org.user.username, password=password) if org else None
        if user is None:
            return JsonResponse({"message": "Регистр эсвэл нууц үг буруу байна."}, status=401)
    else:
        # Хувь хүн: имэйл + нууц үг
        user = authenticate(request, username=email, password=password)
        if user is None:
            return JsonResponse({"message": "Имэйл эсвэл нууц үг буруу байна."}, status=401)
    if not user.is_active:
        return JsonResponse({"message": "Хэрэглэгч идэвхгүй байна."}, status=403)

    login(request, user)
    # "Намайг сануулах": тэмдэглээгүй бол browser хаагдахад session дуусна.
    if payload.get("remember") is False:
        request.session.set_expiry(0)
    customer = getattr(user, "customer", None)
    return JsonResponse(
        {
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
            },
            "customer": _customer_payload(customer, request) if customer else None,
        }
    )


@require_http_methods(["POST"])
def password_reset_request_api(request: HttpRequest) -> JsonResponse:
    """Нууц үг мартсан хэрэглэгчид сэргээх холбоос бүхий имэйл илгээнэ."""
    payload = _parse_json(request)
    email = (payload.get("email") or "").strip().lower()
    if not email:
        return JsonResponse({"message": "Имэйл хаяг оруулна уу."}, status=400)

    # Бүртгэлтэй эсэхийг ил хэлэхгүй (имэйл таамаглахаас сэргийлнэ).
    generic = {"message": "Хэрэв энэ имэйл бүртгэлтэй бол нууц үг сэргээх холбоосыг илгээлээ. Имэйлээ шалгана уу."}
    user = User.objects.filter(is_active=True).filter(Q(username=email) | Q(email__iexact=email)).first()
    if user is None:
        return JsonResponse(generic)

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    link = _google_frontend_url(f"/reset-password?uid={uid}&token={token}")
    body = (
        "Сайн байна уу,\n\n"
        "Digit платформ дээрх таны бүртгэлийн нууц үгийг сэргээх хүсэлт ирлээ.\n"
        f"Доорх холбоос дээр дарж шинэ нууц үгээ тохируулна уу:\n\n{link}\n\n"
        "Холбоос 3 хоногийн дотор хүчинтэй. Хэрэв та хүсэлт илгээгээгүй бол энэ имэйлийг үл хэрэгсэнэ үү.\n"
    )
    try:
        send_mail("Digit: Нууц үг сэргээх", body, settings.DEFAULT_FROM_EMAIL, [user.email or user.username], fail_silently=False)
    except Exception:  # SMTP тохиргоо буруу байж болно — хэрэглэгчид ил хэлэхгүй, лог руу бичнэ.
        logger.exception("Нууц үг сэргээх имэйл илгээж чадсангүй (user id=%s)", user.pk)
    return JsonResponse(generic)


@require_http_methods(["POST"])
def password_reset_confirm_api(request: HttpRequest) -> JsonResponse:
    payload = _parse_json(request)
    uid = payload.get("uid") or ""
    token = payload.get("token") or ""
    password = payload.get("password") or ""

    try:
        user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        user = None
    if user is None or not user.is_active or not default_token_generator.check_token(user, token):
        return JsonResponse({"message": "Сэргээх холбоос хүчингүй эсвэл хугацаа нь дууссан байна. Дахин хүсэлт илгээнэ үү."}, status=400)

    policy_error = _digit_password_policy(password)
    if policy_error:
        return JsonResponse({"message": policy_error}, status=400)
    try:
        validate_password(password, user)
    except ValidationError as error:
        return JsonResponse({"message": " ".join(error.messages)}, status=400)

    user.set_password(password)
    user.save(update_fields=["password"])
    return JsonResponse({"message": "Нууц үг амжилттай шинэчлэгдлээ. Одоо нэвтэрнэ үү."})


def _digit_password_policy(password: str) -> str | None:
    """Shared password policy for signup and password changes."""
    import re
    if len(password) < 8:
        return "Нууц үг хамгийн багадаа 8 тэмдэгттэй байна."
    if not re.search(r"[A-Z]", password):
        return "Нууц үг том үсэг агуулсан байна."
    if not re.search(r"[a-z]", password):
        return "Нууц үг жижиг үсэг агуулсан байна."
    if not re.search(r"[0-9]", password):
        return "Нууц үг тоо агуулсан байна."
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Нууц үг тусгай тэмдэгт агуулсан байна."
    return None


@require_http_methods(["POST"])
def signup_api(request: HttpRequest) -> JsonResponse:
    payload = _parse_json(request)
    account_type = payload.get("account_type") or Customer.ACCOUNT_ORG
    name = (payload.get("name") or "").strip()
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if account_type not in [Customer.ACCOUNT_ORG, Customer.ACCOUNT_PERSON]:
        return JsonResponse({"message": "account_type буруу байна."}, status=400)
    if not name or not email or not password:
        return JsonResponse({"message": "name, email, password шаардлагатай."}, status=400)
    policy_error = _digit_password_policy(password)
    if policy_error:
        return JsonResponse({"message": policy_error}, status=400)
    register_number = None
    if account_type == Customer.ACCOUNT_ORG:
        register_number = _normalize_register(payload.get("register_number"))
        if not register_number:
            return JsonResponse({"message": "Байгууллагын регистрийн дугаар шаардлагатай."}, status=400)
        if not REGISTER_PATTERN.match(register_number):
            return JsonResponse({"message": "Регистрийн дугаар буруу байна (7–10 тэмдэгт, тоо болон үсэг)."}, status=400)
        if Customer.objects.filter(register_number=register_number).exists():
            return JsonResponse({"message": "Энэ регистрийн дугаар бүртгэлтэй байна."}, status=409)
    if User.objects.filter(username=email).exists():
        return JsonResponse({"message": "Энэ имэйл бүртгэлтэй байна."}, status=409)

    user = User.objects.create_user(username=email, email=email, password=password)
    customer = Customer.objects.create(
        user=user,
        name=name,
        email=email,
        account_type=account_type,
        register_number=register_number,
    )
    login(request, user)
    return JsonResponse(
        {
            "user": {"id": user.id, "email": user.email, "username": user.username},
            "customer": _customer_payload(customer, request),
        },
        status=201,
    )


@require_http_methods(["POST"])
def logout_api(request: HttpRequest) -> JsonResponse:
    logout(request)
    return JsonResponse({"ok": True})


@require_http_methods(["GET"])
def me_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({
            "authenticated": False,
            "user": None,
            "customer": None,
        })

    customer = getattr(request.user, "customer", None)
    return JsonResponse(
        {
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "email": request.user.email,
                "username": request.user.username,
            },
            "customer": _customer_payload(customer, request) if customer else None,
        }
    )

@require_http_methods(["GET"])
def profile_summary_api(request: HttpRequest) -> JsonResponse:
    """Профайлын нүүр (dashboard)-д хэрэгтэй тоо, сүүлийн үйл ажиллагаа.

    Хувь хэрэглэгч: хадгалсан програм/зөвлөх үйлчилгээ/нийтлэлийн тоо.
    Байгууллага:    өөрийн нийтэлсэн програм/зөвлөх үйлчилгээ/нийтлэлийн тоо.
    Хоёуланд нь: өгсөн үнэлгээ, бичсэн сэтгэгдэл, идэвхтэй захиалгын тоо.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)
    customer = _get_customer_for_user(request)
    user = request.user
    is_person = customer.account_type == Customer.ACCOUNT_PERSON
    recent: list[dict[str, Any]] = []

    def add(kind: str, obj_id: int, title: str, status: str, when, url: str) -> None:
        recent.append({"kind": kind, "id": obj_id, "title": title, "status": status, "date": when.strftime("%Y-%m-%d"), "url": url, "_sort": when.strftime("%Y-%m-%d %H:%M:%S")})

    def approval(obj) -> str:
        return "Баталгаажсан" if obj.is_approved else "Хянагдаж байна"

    if is_person:
        mode = "saved"
        saved_sw = SavedSoftware.objects.filter(user=user).select_related("software")
        saved_ad = SavedAdvisory.objects.filter(user=user).select_related("advisory_service")
        saved_ar = SavedArticle.objects.filter(user=user).select_related("article")
        counts = {"software": saved_sw.count(), "advisory": saved_ad.count(), "article": saved_ar.count()}
        for row in saved_sw[:5]:
            add("software", row.software_id, row.software.name, "Хадгалсан", row.created_date, f"/softwares/{row.software_id}")
        for row in saved_ad[:5]:
            add("advisory", row.advisory_service_id, row.advisory_service.title, "Хадгалсан", row.created_date, f"/advisories/{row.advisory_service_id}")
        for row in saved_ar[:5]:
            add("article", row.article_id, row.article.title, "Хадгалсан", row.created_date, f"/articles/{row.article_id}")
    else:
        mode = "owned"
        own_sw = Software.objects.filter(developer=customer).order_by("-created_date")
        own_ad = AdvisoryService.objects.filter(company=customer).order_by("-created_date")
        own_ar = Article.objects.filter(organization=customer).order_by("-created_date")
        counts = {"software": own_sw.count(), "advisory": own_ad.count(), "article": own_ar.count()}
        for obj in own_sw[:5]:
            add("software", obj.id, obj.name, approval(obj), obj.created_date, f"/softwares/{obj.id}")
        for obj in own_ad[:5]:
            add("advisory", obj.id, obj.title, approval(obj), obj.created_date, f"/advisories/{obj.id}")
        for obj in own_ar[:5]:
            add("article", obj.id, obj.title, approval(obj), obj.created_date, f"/articles/{obj.id}")

    sw_ratings = SoftwareRating.objects.filter(user=user).select_related("software")
    ad_ratings = AdvisoryRating.objects.filter(user=user).select_related("advisory_service")
    counts["ratings"] = sw_ratings.count() + ad_ratings.count()
    counts["comments"] = sw_ratings.exclude(comment="").count() + ad_ratings.exclude(comment="").count()
    for rating in sw_ratings.order_by("-update_date")[:5]:
        add("rating", rating.software_id, rating.software.name, f"Үнэлгээ ★ {rating.score}", rating.update_date, f"/softwares/{rating.software_id}")
    for rating in ad_ratings.order_by("-update_date")[:5]:
        add("rating", rating.advisory_service_id, rating.advisory_service.title, f"Үнэлгээ ★ {rating.score}", rating.update_date, f"/advisories/{rating.advisory_service_id}")

    today = timezone.localdate()
    counts["payments"] = (
        CustomerMembershipPayment.objects.filter(customer=customer, paid_date__isnull=False)
        .filter(Q(end_date__isnull=True) | Q(end_date__gte=today))
        .count()
    )
    recent.sort(key=lambda row: row["_sort"], reverse=True)
    for row in recent:
        row.pop("_sort", None)
    return JsonResponse({"mode": mode, "counts": counts, "recent": recent[:5]})


@require_http_methods(["GET", "PUT"])
def profile_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    customer, _ = Customer.objects.get_or_create(
        user=request.user,
        defaults={
            "name": request.user.get_full_name() or request.user.username,
            "email": request.user.email or request.user.username,
        },
    )

    if request.method == "GET":
        return JsonResponse({"customer": _customer_payload(customer, request)})

    payload = _parse_json(request)
    if customer.account_type == Customer.ACCOUNT_ORG and "register_number" in payload:
        register_number = _normalize_register(payload.get("register_number"))
        if register_number:
            if not REGISTER_PATTERN.match(register_number):
                return JsonResponse({"message": "Регистрийн дугаар буруу байна (7–10 тэмдэгт, тоо болон үсэг)."}, status=400)
            if Customer.objects.filter(register_number=register_number).exclude(pk=customer.pk).exists():
                return JsonResponse({"message": "Энэ регистрийн дугаар өөр бүртгэлд ашиглагдаж байна."}, status=409)
        customer.register_number = register_number or None
    customer.name = (payload.get("name") or customer.name).strip()
    customer.email = (payload.get("email") or customer.email).strip().lower()
    customer.phone = (payload.get("phone") or "").strip()
    customer.website = (payload.get("website") or "").strip()
    customer.address = (payload.get("address") or "").strip()
    customer.contact_person_name = (payload.get("contact_person_name") or "").strip()
    customer.contact_person_phone = (payload.get("contact_person_phone") or "").strip()
    # Гишүүнчлэлийн төрлийг (Gold/Silver/Bronze) зөвхөн админ тохируулна — хэрэглэгч өөрөө солих боломжгүй.
    customer.save()

    if customer.email and customer.email != request.user.email:
        request.user.email = customer.email
        request.user.username = customer.email
        request.user.save()

    return JsonResponse({"customer": _customer_payload(customer, request)})


@require_http_methods(["POST"])
def profile_logo_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    customer = _get_customer_for_user(request)
    logo = request.FILES.get("logo")
    if logo is None:
        return JsonResponse({"message": "Logo файл сонгоно уу."}, status=400)

    customer.logo = logo
    customer.save(update_fields=["logo", "update_date"])
    return JsonResponse({"customer": _customer_payload(customer, request)})


@require_http_methods(["POST"])
def change_password_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    payload = _parse_json(request)
    current_password = payload.get("current_password") or ""
    new_password = payload.get("new_password") or ""
    confirm_password = payload.get("confirm_password") or ""

    if not current_password or not new_password or not confirm_password:
        return JsonResponse({"message": "Бүх нууц үгийн талбаруудыг бөглөнө үү."}, status=400)
    if not request.user.check_password(current_password):
        return JsonResponse({"message": "Одоогийн нууц үг буруу байна."}, status=400)
    policy_error = _digit_password_policy(new_password)
    if policy_error:
        return JsonResponse({"message": policy_error}, status=400)
    if new_password != confirm_password:
        return JsonResponse({"message": "Шинэ нууц үгүүд таарахгүй байна."}, status=400)

    try:
        validate_password(new_password, request.user)
    except ValidationError as exc:
        return JsonResponse({"message": " ".join(exc.messages)}, status=400)

    request.user.set_password(new_password)
    request.user.save()
    update_session_auth_hash(request, request.user)
    return JsonResponse({"ok": True})


def _active_categories():
    """Идэвхтэй ангиллууд (эцэг ангилал нь идэвхгүй бол хүүхэд нь бас нуугдана)."""
    return Category.objects.filter(is_active=True).exclude(parent__is_active=False)


@require_http_methods(["GET"])
def categories_api(request: HttpRequest) -> JsonResponse:
    category_type = (request.GET.get("type") or "").strip()
    # Админ хэсгээс идэвхгүй болгосон төрөл/салбар вэбсайт дээр харагдахгүй.
    queryset = _active_categories().order_by("type", "sort_order", "name", "id")
    if category_type:
        queryset = queryset.filter(type=category_type)

    data = [
        {
            "id": category.id,
            "name": category.name,
            "type": category.type,
            "parent_id": category.parent_id,
            "description": category.description,
            "sort_order": category.sort_order,
        }
        for category in queryset
    ]
    return JsonResponse({"results": data})


@require_http_methods(["GET"])
def featured_softwares_api(request: HttpRequest) -> JsonResponse:
    queryset = (
        Software.objects.filter(is_approved=True)
        .select_related("program_type", "developer")
        .prefetch_related("images", "advisory_sectors")
        .annotate(
            paid_rank=Case(
                When(developer__type=Customer.TYPE_GOLD, then=2),
                When(developer__type=Customer.TYPE_SILVER, then=1),
                default=0,
                output_field=IntegerField(),
            ),
            rating_count_rank=Count("ratings", distinct=True),
            rating_average_rank=Avg("ratings__score"),
        )
        .order_by("-paid_rank", "-rating_count_rank", "-rating_average_rank", "-is_featured", "-created_date", "-id")[:12]
    )

    results = []
    for software in queryset:
        results.append(
            {
                "id": software.id,
                "name": software.name,
                "program_type": software.program_type.name,
                "advisory_sectors": [category.name for category in software.advisory_sectors.all()],
                "developer": software.developer.name,
                "price": str(software.price),
                "price_type": software.price_type,
                "introduction": software.introduction,
                "thumbnail_url": _software_thumbnail_url(software, request),
                **_software_rating_payload(software, request),
            }
        )

    return JsonResponse({"results": results})


@require_http_methods(["GET"])
def public_stats_api(request: HttpRequest) -> JsonResponse:
    return JsonResponse({
        "users": Customer.objects.count(),
        "softwares": Software.objects.filter(is_approved=True).count(),
        "advisories": AdvisoryService.objects.filter(is_approved=True).count(),
        "articles": Article.objects.filter(is_approved=True).count(),
    })


@require_http_methods(["GET"])
def public_partners_api(request: HttpRequest) -> JsonResponse:
    queryset = PartnerOrganization.objects.filter(is_active=True).exclude(logo="").order_by("sort_order", "name", "id")

    return JsonResponse({
        "results": [
            {
                "id": partner.id,
                "name": partner.name,
                "link_url": partner.link_url,
                "logo_url": request.build_absolute_uri(partner.logo.url),
            }
            for partner in queryset
        ]
    })


@require_http_methods(["GET"])
def public_slides_api(request: HttpRequest) -> JsonResponse:
    queryset = Slide.objects.filter(is_active=True).exclude(image="").order_by("sort_order", "-created_date", "-id")

    return JsonResponse({
        "results": [
            {
                "id": slide.id,
                "partner_label": slide.partner_label,
                "title": slide.title,
                "description": slide.description,
                "image_url": request.build_absolute_uri(slide.image.url),
                "link_url": slide.link_url,
                "sort_order": slide.sort_order,
            }
            for slide in queryset
        ]
    })


@require_http_methods(["GET"])
def public_about_section_api(request: HttpRequest) -> JsonResponse:
    section = AboutSection.objects.filter(is_active=True).order_by("sort_order", "-created_date", "-id").first()
    if not section:
        return JsonResponse({"message": "Мэдээлэл олдсонгүй."}, status=404)

    top_image_url = request.build_absolute_uri(section.top_image.url) if section.top_image else ""
    bottom_image_url = request.build_absolute_uri(section.bottom_image.url) if section.bottom_image else ""
    return JsonResponse({
        "id": section.id,
        "kicker": section.kicker,
        "title": section.title,
        "description": section.description,
        "feature_title": section.feature_title,
        "feature_text": section.feature_text,
        "button_text": section.button_text,
        "button_url": section.button_url,
        "circle_right_text": section.circle_right_text,
        "circle_left_text": section.circle_left_text,
        "top_image_url": top_image_url,
        "bottom_image_url": bottom_image_url,
        "sort_order": section.sort_order,
    })


@require_http_methods(["GET"])
def footer_content_api(request: HttpRequest, key: str) -> JsonResponse:
    try:
        content = FooterMenuContent.objects.get(key=key, is_active=True)
    except FooterMenuContent.DoesNotExist:
        return JsonResponse({"message": "Мэдээлэл олдсонгүй."}, status=404)

    image_url = request.build_absolute_uri(content.image.url) if content.image else ""
    return JsonResponse({
        "key": content.key,
        "title": content.title,
        "content": content.content,
        "image_url": image_url,
        "update_date": content.update_date.date().isoformat(),
    })


@require_http_methods(["GET"])
def featured_advisories_api(request: HttpRequest) -> JsonResponse:
    queryset = (
        AdvisoryService.objects.filter(is_approved=True)
        .select_related("company", "service_type", "price_terms")
        .prefetch_related("images", "advisory_sectors")
        .annotate(
            like_count=Count("likes", distinct=True),
            paid_rank=Case(
                When(company__type=Customer.TYPE_GOLD, then=2),
                When(company__type=Customer.TYPE_SILVER, then=1),
                default=0,
                output_field=IntegerField(),
            ),
            rating_count_rank=Count("ratings", distinct=True),
            rating_average_rank=Avg("ratings__score"),
        )
        .order_by("-paid_rank", "-rating_count_rank", "-rating_average_rank", "-like_count", "-is_featured", "-created_date", "-id")[:12]
    )

    results = []
    for advisory in queryset:
        results.append(
            {
                "id": advisory.id,
                "title": advisory.title,
                "service_type": advisory.service_type.name,
                "advisory_sectors": [category.name for category in advisory.advisory_sectors.all()],
                "company": advisory.company.name,
                "introduction": advisory.introduction,
                "price_terms": advisory.price_terms.name,
                "price": str(advisory.price),
                "like_count": advisory.like_count,
                "liked": _advisory_liked_by_user(advisory, request),
                "thumbnail_url": _advisory_thumbnail_url(advisory, request),
                **_advisory_rating_payload(advisory, request),
            }
        )

    return JsonResponse({"results": results})


@require_http_methods(["GET"])
def featured_articles_api(request: HttpRequest) -> JsonResponse:
    queryset = (
        Article.objects.filter(is_approved=True)
        .select_related("article_type", "organization")
        .order_by("-is_featured", "-published_date", "-id")[:24]
    )

    results = []
    for article in queryset:
        results.append(
            {
                "id": article.id,
                "title": article.title,
                "article_type_id": article.article_type_id,
                "article_type": article.article_type.name,
                "organization": article.organization.name,
                "published_date": article.published_date.isoformat(),
                "update_date": article.update_date.date().isoformat(),
                "description": article.description,
                "thumbnail_url": _article_thumbnail_url(article, request),
            }
        )

    return JsonResponse({"results": results})


@require_http_methods(["GET", "POST", "PUT", "DELETE"])
def software_detail_api(request: HttpRequest, software_id: int) -> JsonResponse:
    try:
        software = (
            Software.objects
            .select_related("program_type", "developer")
            .prefetch_related("images", "advisory_sectors")
            .get(id=software_id)
        )
    except Software.DoesNotExist:
        return JsonResponse({"message": "Програм олдсонгүй."}, status=404)

    if request.method == "GET":
        if not software.is_approved and not _can_view_unapproved(software.developer_id, request):
            return JsonResponse({"message": "Програм олдсонгүй."}, status=404)
        payload = _software_payload(software, request)
        payload["related"] = _related_software_payload(software, request)
        payload["saved"] = _saved_by_user(request, SavedSoftware, software=software)
        return JsonResponse(payload)

    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    customer = _get_customer_for_user(request)
    if software.developer_id != customer.id:
        return JsonResponse({"message": "Энэ програмд үйлдэл хийх эрхгүй."}, status=403)

    if request.method == "DELETE":
        software.delete()
        return JsonResponse({}, status=204)

    content_type = request.content_type or ""
    payload = request.POST if content_type.startswith("multipart/form-data") else _parse_json(request)
    parsed, error = _parse_software_form_data(payload)
    if error:
        return error

    software.name = parsed["name"]
    software.development_start_year = parsed["development_start_year"]
    software.program_type = parsed["program_type"]
    software.description = parsed["description"]
    software.introduction = parsed["introduction"]
    software.price = parsed["price"]
    software.price_type = parsed["price_type"]
    software.is_approved = True
    software.save()
    software.advisory_sectors.set(parsed["advisory_sectors"])

    new_images = request.FILES.getlist("images")
    if new_images:
        software.images.all().delete()
        for index, image in enumerate(new_images):
            SoftwareImage.objects.create(software=software, image=image, sort_order=index)

    software = (
        Software.objects
        .select_related("program_type", "developer")
        .prefetch_related("images", "advisory_sectors")
        .get(id=software.id)
    )
    return JsonResponse({"software": _software_payload(software, request)})


@require_http_methods(["GET", "POST", "DELETE"])
def advisory_detail_api(request: HttpRequest, advisory_id: int) -> JsonResponse:
    try:
        advisory = (
            AdvisoryService.objects
            .select_related("company", "service_type", "price_terms")
            .prefetch_related("images", "advisory_sectors")
            .annotate(like_count=Count("likes", distinct=True))
            .get(id=advisory_id)
        )
    except AdvisoryService.DoesNotExist:
        return JsonResponse({"message": "Зөвлөх үйлчилгээ олдсонгүй."}, status=404)

    if request.method == "GET":
        if not advisory.is_approved and not _can_view_unapproved(advisory.company_id, request):
            return JsonResponse({"message": "Зөвлөх үйлчилгээ олдсонгүй."}, status=404)
        payload = _advisory_payload(advisory, request)
        payload["related"] = _related_advisory_payload(advisory, request)
        payload["saved"] = _saved_by_user(request, SavedAdvisory, advisory_service=advisory)
        return JsonResponse(payload)

    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    customer = _get_customer_for_user(request)
    if advisory.company_id != customer.id:
        return JsonResponse({"message": "Энэ үйлчилгээнд үйлдэл хийх эрхгүй."}, status=403)

    if request.method == "DELETE":
        advisory.delete()
        return JsonResponse({}, status=204)

    content_type = request.content_type or ""
    payload = request.POST if content_type.startswith("multipart/form-data") else _parse_json(request)
    parsed, error = _parse_advisory_form_data(payload)
    if error:
        return error

    advisory.title = parsed["title"]
    advisory.service_type = parsed["service_type"]
    advisory.service_start_year = parsed["service_start_year"]
    advisory.introduction = parsed["introduction"]
    advisory.description = parsed["description"]
    advisory.price_terms = parsed["price_terms"]
    advisory.price = parsed["price"]
    advisory.client_organizations = parsed["client_organizations"]
    advisory.is_approved = True
    advisory.save()
    advisory.advisory_sectors.set(parsed["advisory_sectors"])

    new_images = request.FILES.getlist("images")
    if new_images:
        advisory.images.all().delete()
        for index, image in enumerate(new_images):
            AdvisoryServiceImage.objects.create(advisory_service=advisory, image=image, sort_order=index)

    advisory = (
        AdvisoryService.objects
        .select_related("company", "service_type", "price_terms")
        .prefetch_related("images", "advisory_sectors")
        .annotate(like_count=Count("likes", distinct=True))
        .get(id=advisory.id)
    )
    return JsonResponse({"advisory": _advisory_payload(advisory, request)})


@require_http_methods(["GET", "POST", "DELETE"])
def article_detail_api(request: HttpRequest, article_id: int) -> JsonResponse:
    try:
        article = (
            Article.objects
            .select_related("article_type", "organization")
            .get(id=article_id)
        )
    except Article.DoesNotExist:
        return JsonResponse({"message": "Нийтлэл олдсонгүй."}, status=404)

    if request.method == "GET":
        if not article.is_approved and not _can_view_unapproved(article.organization_id, request):
            return JsonResponse({"message": "Нийтлэл олдсонгүй."}, status=404)
        payload = _article_payload(article, request)
        payload["related"] = _related_article_payload(article, request)
        payload["saved"] = _saved_by_user(request, SavedArticle, article=article)
        return JsonResponse(payload)

    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    customer = _get_customer_for_user(request)
    if article.organization_id != customer.id:
        return JsonResponse({"message": "Энэ нийтлэлд өөрчлөлт хийх эрхгүй байна."}, status=403)

    if request.method == "DELETE":
        article.delete()
        return JsonResponse({"success": True})

    parsed, error = _parse_article_form_data(request.POST, request.FILES, article)
    if error:
        return error

    article.title = parsed["title"]
    article.article_type = parsed["article_type"]
    article.published_date = parsed["published_date"]
    article.description = parsed["description"]
    article.is_approved = True
    if parsed["image"] is not None:
        article.image = parsed["image"]
    article.save()
    article = Article.objects.select_related("article_type", "organization").get(id=article.id)
    return JsonResponse({"article": _article_payload(article, request)})


@require_http_methods(["GET", "POST"])
def softwares_api(request: HttpRequest) -> JsonResponse:
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

        content_type = request.content_type or ""
        payload = request.POST if content_type.startswith("multipart/form-data") else _parse_json(request)
        parsed, error = _parse_software_form_data(payload)
        if error:
            return error

        customer = _get_customer_for_user(request)
        limit_error = _ensure_content_limit(customer, Software.objects.filter(developer=customer), "програм", kind="software")
        if limit_error:
            return limit_error
        software = Software.objects.create(
            name=parsed["name"],
            development_start_year=parsed["development_start_year"],
            program_type=parsed["program_type"],
            developer=customer,
            description=parsed["description"],
            introduction=parsed["introduction"],
            price=parsed["price"],
            price_type=parsed["price_type"],
            is_approved=True,
            created_by=request.user,
        )
        if parsed["advisory_sectors"]:
            software.advisory_sectors.set(parsed["advisory_sectors"])
        for index, image in enumerate(request.FILES.getlist("images")):
            SoftwareImage.objects.create(software=software, image=image, sort_order=index)

        software = (
            Software.objects
            .select_related("program_type", "developer")
            .prefetch_related("images", "advisory_sectors")
            .get(id=software.id)
        )
        return JsonResponse({"software": _software_payload(software, request)}, status=201)

    queryset = (
        Software.objects.all()
        .select_related("program_type", "developer")
        .prefetch_related("images", "advisory_sectors")
        .annotate(tier_rank=_tier_rank("developer"))
        .order_by("tier_rank", "-created_date", "-id")
    )

    mine = (request.GET.get("mine") or "").strip().lower() in {"1", "true", "yes"}
    if mine and request.user.is_authenticated:
        customer = _get_customer_for_user(request)
        queryset = queryset.filter(developer=customer)
    else:
        queryset = queryset.filter(is_approved=True)

    query = (request.GET.get("q") or "").strip()
    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) |
            Q(developer__name__icontains=query) |
            Q(introduction__icontains=query) |
            Q(description__icontains=query) |
            Q(program_type__name__icontains=query) |
            Q(advisory_sectors__name__icontains=query)
        )

    def expand_category_ids(category_ids: list[str], category_type: str) -> list[int]:
        selected_ids = [int(value) for value in category_ids if value.isdigit()]
        if not selected_ids:
            return []

        child_ids = Category.objects.filter(parent_id__in=selected_ids, type=category_type).values_list("id", flat=True)
        return list(set(selected_ids + list(child_ids)))

    program_type_ids = [value for value in _get_multi_values(request, "program_type") if value.isdigit()]
    if program_type_ids:
        queryset = queryset.filter(
            program_type_id__in=expand_category_ids(program_type_ids, Category.TYPE_PROGRAM)
        )

    advisory_sector_ids = [value for value in _get_multi_values(request, "advisory_sector") if value.isdigit()]
    if advisory_sector_ids:
        queryset = queryset.filter(
            advisory_sectors__id__in=expand_category_ids(advisory_sector_ids, Category.TYPE_ADVISORY)
        )

    developer_ids = [value for value in _get_multi_values(request, "developer") if value.isdigit()]
    if developer_ids:
        queryset = queryset.filter(developer_id__in=developer_ids)

    price_types = [
        value
        for value in _get_multi_values(request, "price_type")
        if value in [Software.PRICE_TYPE_RENT, Software.PRICE_TYPE_SALE]
    ]
    if price_types:
        queryset = queryset.filter(price_type__in=price_types)

    featured = (request.GET.get("featured") or "").strip().lower()
    if featured in {"1", "true", "yes"}:
        queryset = queryset.filter(is_featured=True)

    queryset = queryset.distinct()

    page = 1
    page_size = 12
    page_value = (request.GET.get("page") or "").strip()
    page_size_value = (request.GET.get("page_size") or "").strip()
    if page_value.isdigit() and int(page_value) > 0:
        page = int(page_value)
    if page_size_value.isdigit() and int(page_size_value) > 0:
        page_size = min(int(page_size_value), 50)

    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    paged_queryset = queryset[start:end]

    results = []
    for software in paged_queryset:
        results.append(
            {
                "id": software.id,
                "name": software.name,
                "program_type": {"id": software.program_type_id, "name": software.program_type.name},
                "advisory_sectors": [{"id": category.id, "name": category.name} for category in software.advisory_sectors.all()],
                "developer": {"id": software.developer_id, "name": software.developer.name},
                "price": str(software.price),
                "price_type": software.price_type,
                "is_featured": software.is_featured,
                "introduction": software.introduction,
                "thumbnail_url": _software_thumbnail_url(software, request),
                **_software_rating_payload(software, request),
            }
        )

    developer_ids_all = Software.objects.values_list("developer_id", flat=True).distinct()

    facets = {
        "program_types": [
            {"id": category.id, "name": category.name, "parent_id": category.parent_id}
            for category in _active_categories().filter(
                type=Category.TYPE_PROGRAM,
            ).order_by("parent_id", "sort_order", "name")
        ],
        "advisory_sectors": [
            {"id": category.id, "name": category.name, "parent_id": category.parent_id}
            for category in _active_categories().filter(
                type=Category.TYPE_ADVISORY,
            ).order_by("parent_id", "sort_order", "name")
        ],
        "developers": [
            {"id": customer.id, "name": customer.name}
            for customer in Customer.objects.filter(id__in=developer_ids_all).order_by("name")
        ],
        "price_types": [
            {"id": Software.PRICE_TYPE_RENT, "name": "Түрээс"},
            {"id": Software.PRICE_TYPE_SALE, "name": "Худалдаа"},
        ],
    }

    return JsonResponse({
        "results": results,
        "facets": facets,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "has_next": end < total,
        },
    })


@require_http_methods(["GET", "POST"])
def advisories_api(request: HttpRequest) -> JsonResponse:
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

        content_type = request.content_type or ""
        payload = request.POST if content_type.startswith("multipart/form-data") else _parse_json(request)
        parsed, error = _parse_advisory_form_data(payload)
        if error:
            return error

        customer = _get_customer_for_user(request)
        limit_error = _ensure_content_limit(customer, AdvisoryService.objects.filter(company=customer), "зөвлөх үйлчилгээ", kind="advisory")
        if limit_error:
            return limit_error
        advisory = AdvisoryService.objects.create(
            title=parsed["title"],
            service_type=parsed["service_type"],
            service_start_year=parsed["service_start_year"],
            company=customer,
            introduction=parsed["introduction"],
            description=parsed["description"],
            price_terms=parsed["price_terms"],
            price=parsed["price"],
            client_organizations=parsed["client_organizations"],
            is_approved=True,
            created_by=request.user,
        )
        if parsed["advisory_sectors"]:
            advisory.advisory_sectors.set(parsed["advisory_sectors"])
        for index, image in enumerate(request.FILES.getlist("images")):
            AdvisoryServiceImage.objects.create(advisory_service=advisory, image=image, sort_order=index)

        advisory = (
            AdvisoryService.objects
            .select_related("company", "service_type", "price_terms")
            .prefetch_related("images", "advisory_sectors")
            .annotate(like_count=Count("likes", distinct=True))
            .get(id=advisory.id)
        )
        return JsonResponse({"advisory": _advisory_payload(advisory, request)}, status=201)

    queryset = (
        AdvisoryService.objects.all()
        .select_related("company", "service_type", "price_terms")
        .prefetch_related("images", "advisory_sectors")
        .annotate(like_count=Count("likes", distinct=True))
        .annotate(tier_rank=_tier_rank("company"))
        .order_by("tier_rank", "-created_date", "-id")
    )

    mine = (request.GET.get("mine") or "").strip().lower() in {"1", "true", "yes"}
    if mine and request.user.is_authenticated:
        customer = _get_customer_for_user(request)
        queryset = queryset.filter(company=customer)
    else:
        queryset = queryset.filter(is_approved=True)

    query = (request.GET.get("q") or "").strip()
    if query:
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(company__name__icontains=query) |
            Q(description__icontains=query) |
            Q(client_organizations__icontains=query) |
            Q(advisory_sectors__name__icontains=query)
        )

    service_types = [value for value in _get_multi_values(request, "service_type") if value]
    if service_types:
        queryset = queryset.filter(service_type__key__in=service_types)

    def expand_category_ids(category_ids: list[str], category_type: str) -> list[int]:
        selected_ids = [int(value) for value in category_ids if value.isdigit()]
        if not selected_ids:
            return []

        child_ids = Category.objects.filter(parent_id__in=selected_ids, type=category_type).values_list("id", flat=True)
        return list(set(selected_ids + list(child_ids)))

    advisory_sector_ids = [value for value in _get_multi_values(request, "advisory_sector") if value.isdigit()]
    if advisory_sector_ids:
        queryset = queryset.filter(
            advisory_sectors__id__in=expand_category_ids(advisory_sector_ids, Category.TYPE_ADVISORY)
        )

    company_ids = [value for value in _get_multi_values(request, "company") if value.isdigit()]
    if company_ids:
        queryset = queryset.filter(company_id__in=company_ids)

    featured = (request.GET.get("featured") or "").strip().lower()
    if featured in {"1", "true", "yes"}:
        queryset = queryset.filter(is_featured=True)

    queryset = queryset.distinct()

    page = 1
    page_size = 12
    page_value = (request.GET.get("page") or "").strip()
    page_size_value = (request.GET.get("page_size") or "").strip()
    if page_value.isdigit() and int(page_value) > 0:
        page = int(page_value)
    if page_size_value.isdigit() and int(page_size_value) > 0:
        page_size = min(int(page_size_value), 50)

    total = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    paged_queryset = queryset[start:end]

    results = []
    for advisory in paged_queryset:
        results.append(
            {
                "id": advisory.id,
                "title": advisory.title,
                "service_type": advisory.service_type.name,
                "service_type_value": advisory.service_type.key,
                "advisory_sectors": [{"id": category.id, "name": category.name} for category in advisory.advisory_sectors.all()],
                "company": {"id": advisory.company_id, "name": advisory.company.name},
                "introduction": advisory.introduction,
                "price_terms": advisory.price_terms.name,
                "price": str(advisory.price),
                "like_count": advisory.like_count,
                "liked": _advisory_liked_by_user(advisory, request),
                "thumbnail_url": _advisory_thumbnail_url(advisory, request),
                "is_featured": advisory.is_featured,
                **_advisory_rating_payload(advisory, request),
            }
        )

    company_ids_all = AdvisoryService.objects.values_list("company_id", flat=True).distinct()
    facets = {
        "service_types": [
            {"id": item.key, "name": item.name}
            for item in AdvisoryServiceType.objects.filter(is_active=True).order_by("sort_order", "name")
        ],
        "advisory_sectors": [
            {"id": category.id, "name": category.name, "parent_id": category.parent_id}
            for category in _active_categories().filter(type=Category.TYPE_ADVISORY).order_by("parent_id", "sort_order", "name")
        ],
        "companies": [
            {"id": customer.id, "name": customer.name}
            for customer in Customer.objects.filter(id__in=company_ids_all).order_by("name")
        ],
        "price_terms": [
            {"id": item.key, "name": item.name}
            for item in AdvisoryPriceTerm.objects.all()
        ],
    }

    return JsonResponse(
        {
            "results": results,
            "facets": facets,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "has_next": end < total,
            },
        }
    )


@require_http_methods(["GET", "POST"])
def articles_api(request: HttpRequest) -> JsonResponse:
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

        parsed, error = _parse_article_form_data(request.POST, request.FILES)
        if error:
            return error

        if parsed["image"] is None:
            return JsonResponse({"message": "Нийтлэлийн зураг шаардлагатай."}, status=400)

        customer = _get_customer_for_user(request)
        limit_error = _ensure_content_limit(customer, Article.objects.filter(organization=customer), "нийтлэл", kind="article")
        if limit_error:
            return limit_error
        article = Article.objects.create(
            title=parsed["title"],
            article_type=parsed["article_type"],
            organization=customer,
            image=parsed["image"],
            published_date=parsed["published_date"],
            description=parsed["description"],
            is_approved=True,
            created_by=request.user,
        )
        article = Article.objects.select_related("article_type", "organization").get(id=article.id)
        return JsonResponse({"article": _article_payload(article, request)})

    queryset = (
        Article.objects.all()
        .select_related("article_type", "organization")
        .annotate(tier_rank=_tier_rank("organization"))
        .order_by("tier_rank", "-published_date", "-id")
    )

    mine = (request.GET.get("mine") or "").strip().lower() in {"1", "true", "yes"}
    if mine and request.user.is_authenticated:
        customer = _get_customer_for_user(request)
        queryset = queryset.filter(organization=customer)
    else:
        queryset = queryset.filter(is_approved=True)

    query = (request.GET.get("q") or "").strip()
    if query:
        queryset = queryset.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(organization__name__icontains=query)
        )

    def expand_category_ids(category_ids: list[str], category_type: str) -> list[int]:
        selected_ids = [int(value) for value in category_ids if value.isdigit()]
        if not selected_ids:
            return []

        child_ids = Category.objects.filter(parent_id__in=selected_ids, type=category_type).values_list("id", flat=True)
        return list(set(selected_ids + list(child_ids)))

    article_type_ids = [value for value in _get_multi_values(request, "article_type") if value.isdigit()]
    if article_type_ids:
        queryset = queryset.filter(article_type_id__in=expand_category_ids(article_type_ids, Category.TYPE_ARTICLE))

    organization_ids = [value for value in request.GET.getlist("organization") if value.isdigit()]
    if organization_ids:
        queryset = queryset.filter(organization_id__in=organization_ids)

    featured = (request.GET.get("featured") or "").strip().lower()
    if featured in {"1", "true", "yes"}:
        queryset = queryset.filter(is_featured=True)

    page = 1
    page_size = 12
    page_value = (request.GET.get("page") or "").strip()
    page_size_value = (request.GET.get("page_size") or "").strip()
    if page_value.isdigit() and int(page_value) > 0:
        page = int(page_value)
    if page_size_value.isdigit() and int(page_size_value) > 0:
        page_size = min(int(page_size_value), 50)
    # offset: эхний N нийтлэлийг (жишээ нь "сүүлийн 3") алгасаад үлдсэнийг хуудаслана.
    offset_value = (request.GET.get("offset") or "").strip()
    offset = min(int(offset_value), 50) if offset_value.isdigit() else 0

    total = max(0, queryset.count() - offset)
    start = offset + (page - 1) * page_size
    end = start + page_size
    paged_queryset = queryset[start:end]

    results = []
    for article in paged_queryset:
        results.append(
            _article_payload(article, request)
        )

    organization_ids_all = Article.objects.values_list("organization_id", flat=True).distinct()
    facets = {
        "article_types": [
            {"id": category.id, "name": category.name, "parent_id": category.parent_id}
            for category in _active_categories().filter(type=Category.TYPE_ARTICLE).order_by("parent_id", "sort_order", "name")
        ],
        "organizations": [
            {"id": customer.id, "name": customer.name}
            for customer in Customer.objects.filter(id__in=organization_ids_all).order_by("name")
        ],
    }

    return JsonResponse(
        {
            "results": results,
            "facets": facets,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "has_next": (end - offset) < total,
            },
        }
    )


@require_http_methods(["POST", "DELETE"])
def software_rating_api(request: HttpRequest, software_id: int) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Үнэлгээ өгөхийн тулд нэвтэрнэ үү."},
            status=401,
        )

    try:
        software = Software.objects.get(
            id=software_id,
            is_approved=True,
        )
    except Software.DoesNotExist:
        return JsonResponse(
            {"message": "Програм олдсонгүй."},
            status=404,
        )

    if request.method == "DELETE":
        deleted, _ = SoftwareRating.objects.filter(
            software=software,
            user=request.user,
        ).delete()

        if deleted == 0:
            return JsonResponse(
                {"message": "Устгах үнэлгээ олдсонгүй."},
                status=404,
            )

        return JsonResponse(
            {"message": "Үнэлгээ, сэтгэгдэл устгагдлаа."}
        )

    payload = _parse_json(request)
    comment = str(payload.get("comment", "")).strip()

    try:
        score = int(payload.get("score"))
    except (TypeError, ValueError):
        return JsonResponse(
            {"message": "Үнэлгээ 1-5 хооронд байх ёстой."},
            status=400,
        )

    if score < 1 or score > 5:
        return JsonResponse(
            {"message": "Үнэлгээ 1-5 хооронд байх ёстой."},
            status=400,
        )

    SoftwareRating.objects.update_or_create(
        software=software,
        user=request.user,
        defaults={
            "score": score,
            "comment": comment,
        },
    )

    return JsonResponse(
        _software_rating_payload(software, request)
    )

@require_http_methods(["POST", "DELETE"])
def advisory_rating_api(request: HttpRequest, advisory_id: int) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Үнэлгээ өгөхийн тулд нэвтэрнэ үү."},
            status=401,
        )

    try:
        advisory = AdvisoryService.objects.get(
            id=advisory_id,
            is_approved=True,
        )
    except AdvisoryService.DoesNotExist:
        return JsonResponse(
            {"message": "Зөвлөх үйлчилгээ олдсонгүй."},
            status=404,
        )

    if request.method == "DELETE":
        deleted, _ = AdvisoryRating.objects.filter(
            advisory_service=advisory,
            user=request.user,
        ).delete()

        if deleted == 0:
            return JsonResponse(
                {"message": "Устгах үнэлгээ олдсонгүй."},
                status=404,
            )

        return JsonResponse(
            {"message": "Үнэлгээ, сэтгэгдэл устгагдлаа."}
        )

    payload = _parse_json(request)
    comment = str(payload.get("comment", "")).strip()

    try:
        score = int(payload.get("score"))
    except (TypeError, ValueError):
        return JsonResponse(
            {"message": "Үнэлгээ 1-5 хооронд байх ёстой."},
            status=400,
        )

    if score < 1 or score > 5:
        return JsonResponse(
            {"message": "Үнэлгээ 1-5 хооронд байх ёстой."},
            status=400,
        )

    AdvisoryRating.objects.update_or_create(
        advisory_service=advisory,
        user=request.user,
        defaults={
            "score": score,
            "comment": comment,
        },
    )

    return JsonResponse(
        _advisory_rating_payload(advisory, request)
    )


def _review_author_name(user: User) -> str:
    customer = getattr(user, "customer", None)
    if customer and customer.name:
        return customer.name
    return user.username or user.email or "Хэрэглэгч"


@require_http_methods(["GET"])
def software_reviews_api(request: HttpRequest, software_id: int) -> JsonResponse:
    try:
        software = Software.objects.get(id=software_id, is_approved=True)
    except Software.DoesNotExist:
        return JsonResponse({"message": "Програм олдсонгүй."}, status=404)

    ratings = (
        SoftwareRating.objects
        .filter(software=software)
        .exclude(comment="")
        .select_related("user", "user__customer")
        .order_by("-update_date")[:100]
    )

    results = [
        {
            "id": rating.id,
            "author_name": _review_author_name(rating.user),
            "score": rating.score,
            "comment": rating.comment,
            "created_date": rating.created_date.isoformat(),
            "update_date": rating.update_date.isoformat(),
            "is_own": request.user.is_authenticated and rating.user_id == request.user.id,
        }
        for rating in ratings
    ]

    return JsonResponse({"results": results})


@require_http_methods(["GET"])
def advisory_reviews_api(request: HttpRequest, advisory_id: int) -> JsonResponse:
    try:
        advisory = AdvisoryService.objects.get(id=advisory_id, is_approved=True)
    except AdvisoryService.DoesNotExist:
        return JsonResponse({"message": "Зөвлөх үйлчилгээ олдсонгүй."}, status=404)

    ratings = (
        AdvisoryRating.objects
        .filter(advisory_service=advisory)
        .exclude(comment="")
        .select_related("user", "user__customer")
        .order_by("-update_date")[:100]
    )

    results = [
        {
            "id": rating.id,
            "author_name": _review_author_name(rating.user),
            "score": rating.score,
            "comment": rating.comment,
            "created_date": rating.created_date.isoformat(),
            "update_date": rating.update_date.isoformat(),
            "is_own": request.user.is_authenticated and rating.user_id == request.user.id,
        }
        for rating in ratings
    ]

    return JsonResponse({"results": results})


@require_http_methods(["POST"])
def advisory_like_toggle_api(request: HttpRequest, advisory_id: int) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Лайк дарахын тулд нэвтэрнэ үү."}, status=401)

    try:
        advisory = AdvisoryService.objects.get(id=advisory_id)
    except AdvisoryService.DoesNotExist:
        return JsonResponse({"message": "Зөвлөх үйлчилгээ олдсонгүй."}, status=404)

    like, created = AdvisoryLike.objects.get_or_create(advisory_service=advisory, user=request.user)
    liked = True
    if not created:
        like.delete()
        liked = False

    return JsonResponse({
        "liked": liked,
        "like_count": AdvisoryLike.objects.filter(advisory_service=advisory).count(),
    })


@require_http_methods(["POST"])
def article_like_toggle_api(request: HttpRequest, article_id: int) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Лайк дарахын тулд нэвтэрнэ үү."}, status=401)

    try:
        article = Article.objects.get(id=article_id, is_approved=True)
    except Article.DoesNotExist:
        return JsonResponse({"message": "Нийтлэл олдсонгүй."}, status=404)

    like, created = ArticleLike.objects.get_or_create(article=article, user=request.user)
    liked = True
    if not created:
        like.delete()
        liked = False

    return JsonResponse({
        "liked": liked,
        "like_count": ArticleLike.objects.filter(article=article).count(),
    })


@require_http_methods(["GET"])
def site_content_api(request: HttpRequest) -> JsonResponse:
    """Нүүр хуудас, толгой/хөл хэсэгт админаас удирддаг мэдээлэл (лого, ажлын үе шат, хөл цэс)."""
    site = SiteSetting.load()

    def image_url(field) -> str:
        if not field:
            return ""
        try:
            return request.build_absolute_uri(field.url)
        except Exception:
            return ""

    process = ProcessSection.load()
    steps = [
        {"id": step.id, "icon": step.icon, "title": step.title, "text": step.text, "sort_order": step.sort_order}
        for step in process.steps.filter(is_active=True).order_by("sort_order", "id")
    ]

    footer_links: dict[str, list[dict[str, Any]]] = {key: [] for key, _ in FooterLink.COLUMN_CHOICES}
    for link in FooterLink.objects.filter(is_active=True).order_by("column", "sort_order", "id"):
        footer_links.setdefault(link.column, []).append({"id": link.id, "label": link.label, "url": link.url})

    return JsonResponse({
        "settings": {
            "header_logo_url": image_url(site.header_logo),
            "header_logo_scrolled_url": image_url(site.header_logo_scrolled),
            "footer_logo_url": image_url(site.footer_logo),
            "footer_text": site.footer_text,
        },
        "process": {
            "is_active": process.is_active,
            "kicker": process.kicker,
            "title": process.title,
            "cta_text": process.cta_text,
            "cta_button_text": process.cta_button_text,
            "cta_button_url": process.cta_button_url,
            "steps": steps,
        },
        "footer_links": footer_links,
    })

@require_http_methods(["GET"])
def my_ratings_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Нэвтэрнэ үү."},
            status=401,
        )

    items = []

    software_ratings = (
        SoftwareRating.objects
        .filter(user=request.user)
        .select_related("software", "software__developer")
    )

    for rating in software_ratings:
        items.append({
            "id": rating.id,
            "type": "software",
            "item_id": rating.software_id,
            "name": rating.software.name,
          "logo": (
    request.build_absolute_uri(rating.software.developer.logo.url)
    if rating.software.developer.logo
    else (
        request.build_absolute_uri(rating.software.images.first().image.url)
        if rating.software.images.first()
        else ""
    )
),
            "score": rating.score,
            "comment": rating.comment,
            "created_date": rating.created_date.isoformat(),
            "update_date": rating.update_date.isoformat(),
        })

    advisory_ratings = (
        AdvisoryRating.objects
        .filter(user=request.user)
        .select_related("advisory_service", "advisory_service__company")
    )

    for rating in advisory_ratings:
        items.append({
            "id": rating.id,
            "type": "advisory",
            "item_id": rating.advisory_service_id,
            "name": rating.advisory_service.title,
            "logo": (request.build_absolute_uri(rating.advisory_service.company.logo.url)
    if rating.advisory_service.company.logo
    else ""
),
            "score": rating.score,
            "comment": rating.comment,
            "created_date": rating.created_date.isoformat(),
            "update_date": rating.update_date.isoformat(),
        })

    items.sort(
        key=lambda item: item["update_date"],
        reverse=True,
    )

    return JsonResponse({"results": items})

def _saved_auth(request):
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтэрнэ үү."}, status=401)
    try:
        customer = request.user.customer
    except Customer.DoesNotExist:
        return JsonResponse({"message": "Хэрэглэгчийн профайл олдсонгүй."}, status=403)
    if customer.account_type != Customer.ACCOUNT_PERSON:
        return JsonResponse(
            {"message": "Хадгалах боломж зөвхөн хэрэглэгчийн профайлд нээлттэй."},
            status=403,
        )
    return None

@require_http_methods(["POST", "DELETE"])
def saved_software_toggle_api(request, software_id):
    auth = _saved_auth(request)
    if auth: return auth
    try: item = Software.objects.get(id=software_id, is_approved=True)
    except Software.DoesNotExist: return JsonResponse({"message": "Програм олдсонгүй."}, status=404)
    if request.method == "DELETE":
        SavedSoftware.objects.filter(user=request.user, software=item).delete(); return JsonResponse({"saved": False})
    SavedSoftware.objects.get_or_create(user=request.user, software=item); return JsonResponse({"saved": True})

@require_http_methods(["GET"])
def my_saved_softwares_api(request):
    auth = _saved_auth(request)
    if auth: return auth
    rows = SavedSoftware.objects.filter(user=request.user).select_related("software", "software__program_type", "software__developer").prefetch_related("software__images", "software__advisory_sectors")
    return JsonResponse({"results": [_software_list_payload(r.software, request) for r in rows if r.software.is_approved]})

@require_http_methods(["POST", "DELETE"])
def saved_advisory_toggle_api(request, advisory_id):
    auth = _saved_auth(request)
    if auth: return auth
    try: item = AdvisoryService.objects.get(id=advisory_id, is_approved=True)
    except AdvisoryService.DoesNotExist: return JsonResponse({"message": "Зөвлөх үйлчилгээ олдсонгүй."}, status=404)
    if request.method == "DELETE":
        SavedAdvisory.objects.filter(user=request.user, advisory_service=item).delete(); return JsonResponse({"saved": False})
    SavedAdvisory.objects.get_or_create(user=request.user, advisory_service=item); return JsonResponse({"saved": True})

@require_http_methods(["GET"])
def my_saved_advisories_api(request):
    auth = _saved_auth(request)
    if auth: return auth
    rows = SavedAdvisory.objects.filter(user=request.user).select_related("advisory_service", "advisory_service__company").prefetch_related("advisory_service__images", "advisory_service__advisory_sectors")
    return JsonResponse({"results": [_advisory_list_payload(r.advisory_service, request) for r in rows if r.advisory_service.is_approved]})

@require_http_methods(["POST", "DELETE"])
def saved_article_toggle_api(request, article_id):
    auth = _saved_auth(request)
    if auth: return auth
    try: item = Article.objects.get(id=article_id, is_approved=True)
    except Article.DoesNotExist: return JsonResponse({"message": "Нийтлэл олдсонгүй."}, status=404)
    if request.method == "DELETE":
        SavedArticle.objects.filter(user=request.user, article=item).delete(); return JsonResponse({"saved": False})
    SavedArticle.objects.get_or_create(user=request.user, article=item); return JsonResponse({"saved": True})

@require_http_methods(["GET"])
def my_saved_articles_api(request):
    auth = _saved_auth(request)
    if auth: return auth
    rows = SavedArticle.objects.filter(user=request.user).select_related("article", "article__article_type", "article__organization")
    return JsonResponse({"results": [_article_payload(r.article, request) for r in rows if r.article.is_approved]})


MEMBERSHIP_PRICE = {
    Customer.TYPE_BRONZE: 0,
    Customer.TYPE_SILVER: 99000,
    Customer.TYPE_GOLD: 499000,
}
MEMBERSHIP_LABEL = {
    Customer.TYPE_BRONZE: "Энгийн",
    Customer.TYPE_SILVER: "Silver",
    Customer.TYPE_GOLD: "Gold",
}


@require_http_methods(["POST"])
def membership_request_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Багц сонгохын тулд эхлээд нэвтэрнэ үү."}, status=401)

    customer = getattr(request.user, "customer", None)
    if customer is None:
        return JsonResponse({"message": "Хэрэглэгчийн бүртгэл олдсонгүй."}, status=400)

    payload = _parse_json(request)
    membership_type = payload.get("membership_type")
    valid_types = {choice for choice, _ in Customer.TYPE_CHOICES}
    if membership_type not in valid_types:
        return JsonResponse({"message": "Багцын төрөл буруу байна."}, status=400)

    payment = CustomerMembershipPayment.objects.create(
        customer=customer,
        membership_type=membership_type,
        paid_date=None,
        end_date=None,
    )

    return JsonResponse(
        {
            "id": payment.id,
            "membership_type": payment.membership_type,
            "membership_label": MEMBERSHIP_LABEL.get(payment.membership_type, payment.membership_type),
            "price": MEMBERSHIP_PRICE.get(payment.membership_type, 0),
            "status": "pending",
            "created_date": payment.created_date.isoformat(),
        },
        status=201,
    )


@require_http_methods(["GET"])
def my_membership_requests_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрэх шаардлагатай."}, status=401)

    customer = getattr(request.user, "customer", None)
    if customer is None:
        return JsonResponse({"results": []})

    rows = customer.membership_payments.all()[:20]
    results = [
        {
            "id": row.id,
            "membership_type": row.membership_type,
            "membership_label": MEMBERSHIP_LABEL.get(row.membership_type, row.membership_type),
            "price": MEMBERSHIP_PRICE.get(row.membership_type, 0),
            "status": "paid" if row.paid_date else "pending",
            "paid_date": row.paid_date.isoformat() if row.paid_date else None,
            "end_date": row.end_date.isoformat() if row.end_date else None,
            "created_date": row.created_date.isoformat(),
        }
        for row in rows
    ]
    return JsonResponse({"results": results})


@require_http_methods(["GET"])
def payment_document_api(request: HttpRequest, payment_id: int) -> HttpResponse:
    """Төлбөрийн нэхэмжлэх эсвэл баримтыг хэвлэх боломжтой HTML хуудас болгож буцаана.

    ?kind=invoice (анхдагч) | receipt (зөвхөн төлөгдсөн төлбөр)
    ?print=1 бол нээгдмэгц хэвлэх цонх гарна (PDF болгон хадгалах боломжтой).
    """
    plain = "text/plain; charset=utf-8"
    if not request.user.is_authenticated:
        return HttpResponse("Нэвтрэх шаардлагатай.", status=401, content_type=plain)
    customer = getattr(request.user, "customer", None)
    payment = CustomerMembershipPayment.objects.filter(pk=payment_id, customer=customer).first() if customer else None
    if payment is None:
        return HttpResponse("Төлбөр олдсонгүй.", status=404, content_type=plain)

    kind = "receipt" if request.GET.get("kind") == "receipt" else "invoice"
    if kind == "receipt" and not payment.paid_date:
        return HttpResponse("Төлбөр төлөгдөөгүй байна, баримт гаргах боломжгүй.", status=400, content_type=plain)

    price = MEMBERSHIP_PRICE.get(payment.membership_type, 0)
    issue_date = payment.paid_date or payment.created_date.date()
    prefix = "RCP" if kind == "receipt" else "INV"
    return render(
        request,
        "invoice/payment_document.html",
        {
            "kind": kind,
            "doc_title": "Төлбөрийн баримт" if kind == "receipt" else "Нэхэмжлэх",
            "doc_number": f"{prefix}-{payment.pk:06d}",
            "issue_date": issue_date,
            "customer": customer,
            "package": MEMBERSHIP_LABEL.get(payment.membership_type, payment.membership_type),
            "amount_text": f"{price:,} ₮",
            "period_start": payment.paid_date,
            "period_end": payment.end_date,
            "is_paid": bool(payment.paid_date),
            "auto_print": request.GET.get("print") == "1",
        },
    )


def _banner_payload(banner: CustomerBanner, request: HttpRequest) -> dict[str, Any]:
    return {
        "id": banner.id,
        "image_url": request.build_absolute_uri(banner.image.url) if banner.image else "",
        "link_url": banner.link_url,
        "is_active": banner.is_active,
        "sort_order": banner.sort_order,
        "created_date": banner.created_date.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def my_banners_api(request: HttpRequest) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    customer = _get_customer_for_user(request)

    if request.method == "GET":
        rows = customer.banners.all()
        return JsonResponse({"results": [_banner_payload(b, request) for b in rows]})

    # POST: create a new banner
    limit = customer.banner_limit()
    if limit <= 0:
        return JsonResponse(
            {"message": "Баннер байршуулах боломж зөвхөн Gold багцад нээлттэй. Багцаа шинэчлээрэй."},
            status=403,
        )
    if customer.banners.count() >= limit:
        return JsonResponse(
            {"message": f"Gold багц хамгийн ихдээ {limit} баннер байршуулах боломжтой."},
            status=400,
        )

    image = request.FILES.get("image")
    if image is None:
        return JsonResponse({"message": "Баннерын зураг сонгоно уу."}, status=400)

    link_url = (request.POST.get("link_url") or "").strip()
    banner = CustomerBanner.objects.create(customer=customer, image=image, link_url=link_url)
    return JsonResponse({"banner": _banner_payload(banner, request)}, status=201)


@require_http_methods(["DELETE"])
def banner_delete_api(request: HttpRequest, banner_id: int) -> JsonResponse:
    if not request.user.is_authenticated:
        return JsonResponse({"message": "Нэвтрээгүй байна."}, status=401)

    customer = _get_customer_for_user(request)
    deleted, _ = CustomerBanner.objects.filter(id=banner_id, customer=customer).delete()
    if not deleted:
        return JsonResponse({"message": "Баннер олдсонгүй."}, status=404)
    return JsonResponse({"deleted": True})


@require_http_methods(["GET"])
def public_banners_api(request: HttpRequest) -> JsonResponse:
    rows = (
        CustomerBanner.objects.filter(is_active=True, customer__type=Customer.TYPE_GOLD)
        .select_related("customer")
        .order_by("sort_order", "-created_date")[:12]
    )
    return JsonResponse({"results": [_banner_payload(b, request) for b in rows]})

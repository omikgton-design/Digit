from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.paginator import Paginator
from django.db.models import Count
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse

from .forms import (
    AboutSectionForm,
    AdvisoryAdminForm,
    ArticleAdminForm,
    CustomerPaymentForm,
    CustomerAdminForm,
    FooterMenuContentForm,
    ManagementAuthenticationForm,
    PartnerOrganizationForm,
    SlideForm,
    SoftwareAdminForm,
    ManagementRegistrationForm,
)
from .models import AboutSection, AdvisoryService, AdvisoryServiceImage, Article, Customer, CustomerMembershipPayment, FooterMenuContent, PartnerOrganization, Slide, Software, SoftwareImage


def _nav_context(current_section: str, **extra):
    return {
        "current_section": current_section,
        **extra,
    }


def _status_meta(is_approved: bool):
    if is_approved:
        return {"label": "Нийтлэгдсэн", "class": "bg-light-success text-success"}
    return {"label": "Хянагдаж байна", "class": "bg-light-warning text-warning"}


def _paginate(request: HttpRequest, object_list, page_param: str = "page"):
    paginator = Paginator(object_list, 10)
    page_obj = paginator.get_page(request.GET.get(page_param))
    page_obj.elided_page_range = _page_range(page_obj.number, paginator.num_pages)
    return page_obj


def _page_range(current_page: int, total_pages: int):
    if total_pages <= 4:
        return range(1, total_pages + 1)
    if current_page <= 3:
        return [1, 2, 3, Paginator.ELLIPSIS, total_pages]
    if current_page >= total_pages - 2:
        return [1, Paginator.ELLIPSIS, total_pages - 2, total_pages - 1, total_pages]
    return [1, Paginator.ELLIPSIS, current_page - 1, current_page, current_page + 1, Paginator.ELLIPSIS, total_pages]


def management_root(request: HttpRequest) -> HttpResponse:
    return management_login(request)


def management_login(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
        return redirect("management:dashboard")

    form = ManagementAuthenticationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        identifier = form.cleaned_data["username"].strip()
        password = form.cleaned_data["password"]

        candidate_usernames: list[str] = [identifier]
        matched_user = User.objects.filter(email__iexact=identifier).order_by("id").first()
        if matched_user and matched_user.username not in candidate_usernames:
            candidate_usernames.append(matched_user.username)

        user = None
        for candidate in candidate_usernames:
            user = authenticate(request, username=candidate, password=password)
            if user:
                break

        if not user:
            form.add_error(None, "Нэвтрэх нэр эсвэл нууц үг буруу байна.")
        elif not (user.is_staff or user.is_superuser):
            form.add_error(None, "Энэ хэсэгт зөвхөн админ хэрэглэгч нэвтэрнэ.")
        else:
            login(request, user)
            messages.success(request, "Удирдлагын хэсэгт амжилттай нэвтэрлээ.")
            return redirect(request.GET.get("next") or reverse("management:dashboard"))

    return render(request, "management/login.html", {"form": form})

def management_register(request: HttpRequest) -> HttpResponse:
    if request.user.is_authenticated and (
        request.user.is_staff or request.user.is_superuser
    ):
        return redirect("management:dashboard")

    form = ManagementRegistrationForm(request.POST or None)

    if request.method == "POST" and form.is_valid():
        user = User.objects.create_user(
            username=form.cleaned_data["username"],
            email=form.cleaned_data["email"],
            password=form.cleaned_data["password"],
        )

        user.is_staff = True
        user.save(update_fields=["is_staff"])

        messages.success(
            request,
            "Админ хэрэглэгч амжилттай бүртгэгдлээ. Одоо нэвтэрнэ үү.",
        )

        return redirect("management:login")

    return render(
        request,
        "management/register.html",
        {"form": form},
    )

@staff_member_required(login_url="management:login")
def management_logout(request: HttpRequest) -> HttpResponse:
    logout(request)
    messages.success(request, "Системээс гарлаа.")
    return redirect("management:login")


@staff_member_required(login_url="management:login")
def dashboard(request: HttpRequest) -> HttpResponse:
    customers = Customer.objects.select_related("user")
    softwares = Software.objects.select_related("developer", "program_type")
    advisories = AdvisoryService.objects.select_related("company", "service_type")
    articles = Article.objects.select_related("organization", "article_type")

    tier_labels = {"bronze": "Bronze", "silver": "Silver", "gold": "Gold"}
    tier_breakdown = customers.values("type").annotate(total=Count("id")).order_by("type")

    recent_contents = []
    for item in softwares.order_by("-created_date")[:5]:
        recent_contents.append(
            {
                "kind": "Програм",
                "title": item.name,
                "owner": item.developer.name,
                "created_date": item.created_date,
                "edit_url": reverse("management:software_edit", args=[item.pk]),
            }
        )
    for item in advisories.order_by("-created_date")[:5]:
        recent_contents.append(
            {
                "kind": "Зөвлөх үйлчилгээ",
                "title": item.title,
                "owner": item.company.name,
                "created_date": item.created_date,
                "edit_url": reverse("management:advisory_edit", args=[item.pk]),
            }
        )
    for item in articles.order_by("-created_date")[:5]:
        recent_contents.append(
            {
                "kind": "Нийтлэл",
                "title": item.title,
                "owner": item.organization.name,
                "created_date": item.created_date,
                "edit_url": reverse("management:article_edit", args=[item.pk]),
            }
        )
    recent_contents.sort(key=lambda row: row["created_date"], reverse=True)

    context = _nav_context(
        "dashboard",
        metrics=[
            {"label": "Байгууллага", "value": customers.count(), "meta": f"Админ: {customers.filter(user__is_staff=True).count()}"},
            {"label": "Програм хангамж", "value": softwares.count(), "meta": f"Нийтлэгдсэн: {softwares.filter(is_approved=True).count()}"},
            {"label": "Зөвлөх үйлчилгээ", "value": advisories.count(), "meta": f"Нийтлэгдсэн: {advisories.filter(is_approved=True).count()}"},
            {"label": "Нийтлэл", "value": articles.count(), "meta": f"Нийтлэгдсэн: {articles.filter(is_approved=True).count()}"},
        ],
        tier_breakdown=[
            {"label": tier_labels.get(row["type"], row["type"]), "total": row["total"]}
            for row in tier_breakdown
        ],
        recent_contents=recent_contents[:8],
        recent_customers=customers.order_by("-created_date")[:6],
    )
    return render(request, "management/dashboard.html", context)


@staff_member_required(login_url="management:login")
def customer_list(request: HttpRequest) -> HttpResponse:
    customers = Customer.objects.select_related("user").order_by("-created_date")
    customers_page = _paginate(request, customers)
    return render(
        request,
        "management/customer_list.html",
        _nav_context("customers", customers=customers_page, page_title="Бүх хэрэглэгч", empty_message="Хэрэглэгч олдсонгүй."),
    )


@staff_member_required(login_url="management:login")
def organization_list(request: HttpRequest) -> HttpResponse:
    customers = Customer.objects.select_related("user").filter(account_type=Customer.ACCOUNT_ORG).order_by("-created_date")
    customers_page = _paginate(request, customers)
    return render(
        request,
        "management/customer_list.html",
        _nav_context("organizations", customers=customers_page, page_title="Байгууллага", empty_message="Байгууллага олдсонгүй."),
    )


@staff_member_required(login_url="management:login")
def person_list(request: HttpRequest) -> HttpResponse:
    customers = Customer.objects.select_related("user").filter(account_type=Customer.ACCOUNT_PERSON).order_by("-created_date")
    customers_page = _paginate(request, customers)
    return render(
        request,
        "management/customer_list.html",
        _nav_context("people", customers=customers_page, page_title="Хувь хүн", empty_message="Хувь хүн олдсонгүй."),
    )


@staff_member_required(login_url="management:login")
def customer_detail(request: HttpRequest, customer_id: int) -> HttpResponse:
    customer = get_object_or_404(Customer.objects.select_related("user"), pk=customer_id)
    payments = customer.membership_payments.order_by("-paid_date", "-id")
    payment_form = CustomerPaymentForm(request.POST or None)
    if request.method == "POST" and payment_form.is_valid():
        payment = payment_form.save(commit=False)
        payment.customer = customer
        payment.save()
        customer.type = payment.membership_type
        customer.save(update_fields=["type", "update_date"])
        messages.success(request, "Сунгалтын мэдээлэл нэмэгдлээ.")
        return redirect("management:customer_detail", customer_id=customer.pk)

    content_rows = []
    for item in customer.softwares.select_related("program_type").order_by("-created_date"):
        content_rows.append(
            {
                "kind": "Програм хангамж",
                "title": item.name,
                "category": item.program_type.name,
                "created_date": item.created_date,
                "status": _status_meta(item.is_approved),
                "featured": item.is_featured,
                "edit_url": reverse("management:software_edit", args=[item.pk]),
            }
        )
    for item in customer.advisory_services.select_related("service_type").order_by("-created_date"):
        content_rows.append(
            {
                "kind": "Зөвлөх үйлчилгээ",
                "title": item.title,
                "category": item.service_type.name,
                "created_date": item.created_date,
                "status": _status_meta(item.is_approved),
                "featured": item.is_featured,
                "edit_url": reverse("management:advisory_edit", args=[item.pk]),
            }
        )
    for item in customer.articles.select_related("article_type").order_by("-created_date"):
        content_rows.append(
            {
                "kind": "Нийтлэл",
                "title": item.title,
                "category": item.article_type.name,
                "created_date": item.created_date,
                "status": _status_meta(item.is_approved),
                "featured": item.is_featured,
                "edit_url": reverse("management:article_edit", args=[item.pk]),
            }
        )
    content_rows.sort(key=lambda row: row["created_date"], reverse=True)
    payments_page = _paginate(request, payments, "payments_page")
    content_page = _paginate(request, content_rows, "content_page")

    return render(
        request,
        "management/customer_detail.html",
        _nav_context(
            "customers",
            customer=customer,
            payments=payments_page,
            payment_form=payment_form,
            content_rows=content_page,
        ),
    )


@staff_member_required(login_url="management:login")
def customer_payment_edit(request: HttpRequest, customer_id: int, payment_id: int) -> HttpResponse:
    customer = get_object_or_404(Customer, pk=customer_id)
    payment = get_object_or_404(CustomerMembershipPayment, pk=payment_id, customer=customer)
    form = CustomerPaymentForm(request.POST or None, instance=payment)
    if request.method == "POST" and form.is_valid():
        saved = form.save()
        latest_payment = customer.membership_payments.order_by("-paid_date", "-id").first()
        if latest_payment:
            customer.type = latest_payment.membership_type
            customer.save(update_fields=["type", "update_date"])
        messages.success(request, "Сунгалтын мэдээлэл хадгалагдлаа.")
        return redirect("management:customer_detail", customer_id=customer.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "customers",
            form=form,
            object=payment,
            form_title=f"{customer.name} - сунгалт засах",
            list_url=reverse("management:customer_detail", args=[customer.pk]),
            delete_url=reverse("management:customer_payment_delete", args=[customer.pk, payment.pk]),
        ),
    )


@staff_member_required(login_url="management:login")
def customer_payment_delete(request: HttpRequest, customer_id: int, payment_id: int) -> HttpResponse:
    customer = get_object_or_404(Customer, pk=customer_id)
    payment = get_object_or_404(CustomerMembershipPayment, pk=payment_id, customer=customer)
    if request.method == "POST":
        payment.delete()
        latest_payment = customer.membership_payments.order_by("-paid_date", "-id").first()
        if latest_payment:
            customer.type = latest_payment.membership_type
            customer.save(update_fields=["type", "update_date"])
        messages.success(request, "Сунгалтын мэдээлэл устгагдлаа.")
        return redirect("management:customer_detail", customer_id=customer.pk)

    return render(
        request,
        "management/entity_delete.html",
        _nav_context(
            "customers",
            object_label=str(payment),
            cancel_url=reverse("management:customer_detail", args=[customer.pk]),
            list_url=reverse("management:customer_list"),
        ),
    )


@staff_member_required(login_url="management:login")
def customer_create(request: HttpRequest) -> HttpResponse:
    return _customer_form(request, default_account_type=request.GET.get("account_type"))


@staff_member_required(login_url="management:login")
def organization_create(request: HttpRequest) -> HttpResponse:
    return _customer_form(request, default_account_type=Customer.ACCOUNT_ORG)


@staff_member_required(login_url="management:login")
def person_create(request: HttpRequest) -> HttpResponse:
    return _customer_form(request, default_account_type=Customer.ACCOUNT_PERSON)


@staff_member_required(login_url="management:login")
def customer_edit(request: HttpRequest, customer_id: int) -> HttpResponse:
    customer = get_object_or_404(Customer.objects.select_related("user"), pk=customer_id)
    return _customer_form(request, customer)


def _customer_form(request: HttpRequest, customer: Customer | None = None, default_account_type: str | None = None) -> HttpResponse:
    is_edit = customer is not None
    initial = {}
    if not is_edit and default_account_type in {Customer.ACCOUNT_ORG, Customer.ACCOUNT_PERSON}:
        initial["account_type"] = default_account_type
    account_type = customer.account_type if is_edit else initial.get("account_type") or Customer.ACCOUNT_ORG
    form = CustomerAdminForm(request.POST or None, request.FILES or None, instance=customer, initial=initial, account_type=account_type)
    if request.method == "POST" and form.is_valid():
        saved = form.save()
        messages.success(request, "Байгууллагын мэдээлэл хадгалагдлаа.")
        return redirect("management:customer_edit", customer_id=saved.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "customers",
            form=form,
            object=customer,
            form_title=("Хувь хүн засах" if account_type == Customer.ACCOUNT_PERSON else "Байгууллага засах") if is_edit else ("Хувь хүн нэмэх" if account_type == Customer.ACCOUNT_PERSON else "Байгууллага нэмэх"),
            list_url=reverse("management:person_list" if account_type == Customer.ACCOUNT_PERSON else "management:organization_list"),
            delete_url=reverse("management:customer_delete", args=[customer.pk]) if is_edit else None,
            customer_form_type=account_type,
        ),
    )


@staff_member_required(login_url="management:login")
def customer_delete(request: HttpRequest, customer_id: int) -> HttpResponse:
    customer = get_object_or_404(Customer.objects.select_related("user"), pk=customer_id)
    if request.method == "POST":
        user = customer.user
        customer.delete()
        user.delete()
        messages.success(request, "Байгууллага устгагдлаа.")
        return redirect("management:customer_list")
    return render(
        request,
        "management/entity_delete.html",
        _nav_context(
            "customers",
            object_label=customer.name,
            cancel_url=reverse("management:customer_edit", args=[customer.pk]),
            list_url=reverse("management:customer_list"),
        ),
    )


@staff_member_required(login_url="management:login")
def footer_content_list(request: HttpRequest) -> HttpResponse:
    saved_contents = {item.key: item for item in FooterMenuContent.objects.all()}
    rows = []
    for key, label in FooterMenuContent.KEY_CHOICES:
        item = saved_contents.get(key)
        rows.append(
            {
                "key": key,
                "title": item.title if item else label,
                "menu_label": label,
                "has_content": bool(item and item.content.strip()),
                "has_image": bool(item and item.image),
                "is_active": item.is_active if item else False,
                "edit_url": reverse("management:footer_content_edit", args=[key]),
            }
        )
    return render(request, "management/footer_content_list.html", _nav_context("footer_contents", rows=rows))


@staff_member_required(login_url="management:login")
def footer_content_edit(request: HttpRequest, key: str) -> HttpResponse:
    labels = dict(FooterMenuContent.KEY_CHOICES)
    if key not in labels:
        return redirect("management:footer_content_list")

    content, _ = FooterMenuContent.objects.get_or_create(
        key=key,
        defaults={
            "title": labels[key],
        },
    )
    form = FooterMenuContentForm(request.POST or None, request.FILES or None, instance=content)
    form.fields["key"].disabled = True
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Хөл цэсний мэдээлэл хадгалагдлаа.")
        return redirect("management:footer_content_edit", key=key)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "footer_contents",
            form=form,
            object=content,
            form_title=f"{labels[key]} засах",
            list_url=reverse("management:footer_content_list"),
            form_layout="footer_content",
        ),
    )


@staff_member_required(login_url="management:login")
def partner_list(request: HttpRequest) -> HttpResponse:
    partners = PartnerOrganization.objects.order_by("sort_order", "name", "id")
    partners_page = _paginate(request, partners)
    return render(
        request,
        "management/partner_list.html",
        _nav_context("partners", partners=partners_page, page_title="Хамтрагч байгууллагууд"),
    )


@staff_member_required(login_url="management:login")
def partner_create(request: HttpRequest) -> HttpResponse:
    return _partner_form(request)


@staff_member_required(login_url="management:login")
def partner_edit(request: HttpRequest, partner_id: int) -> HttpResponse:
    partner = get_object_or_404(PartnerOrganization, pk=partner_id)
    return _partner_form(request, partner)


def _partner_form(request: HttpRequest, partner: PartnerOrganization | None = None) -> HttpResponse:
    is_edit = partner is not None
    form = PartnerOrganizationForm(request.POST or None, request.FILES or None, instance=partner)
    if request.method == "POST" and form.is_valid():
        item = form.save()
        messages.success(request, "Хамтрагч байгууллагын мэдээлэл хадгалагдлаа.")
        return redirect("management:partner_edit", partner_id=item.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "partners",
            form=form,
            object=partner,
            form_title="Хамтрагч байгууллага засах" if is_edit else "Хамтрагч байгууллага нэмэх",
            list_url=reverse("management:partner_list"),
            delete_url=reverse("management:partner_delete", args=[partner.pk]) if is_edit else None,
            form_layout="partner",
        ),
    )


@staff_member_required(login_url="management:login")
def partner_delete(request: HttpRequest, partner_id: int) -> HttpResponse:
    partner = get_object_or_404(PartnerOrganization, pk=partner_id)
    if request.method == "POST":
        partner.delete()
        messages.success(request, "Хамтрагч байгууллага устгагдлаа.")
        return redirect("management:partner_list")
    return render(
        request,
        "management/entity_delete.html",
        _nav_context(
            "partners",
            object_label=partner.name,
            cancel_url=reverse("management:partner_edit", args=[partner.pk]),
            list_url=reverse("management:partner_list"),
        ),
    )


@staff_member_required(login_url="management:login")
def slide_list(request: HttpRequest) -> HttpResponse:
    slides = Slide.objects.order_by("sort_order", "-created_date", "-id")
    slides_page = _paginate(request, slides)
    return render(
        request,
        "management/slide_list.html",
        _nav_context("slides", slides=slides_page, page_title="Слайд"),
    )


@staff_member_required(login_url="management:login")
def slide_create(request: HttpRequest) -> HttpResponse:
    return _slide_form(request)


@staff_member_required(login_url="management:login")
def slide_edit(request: HttpRequest, slide_id: int) -> HttpResponse:
    slide = get_object_or_404(Slide, pk=slide_id)
    return _slide_form(request, slide)


def _slide_form(request: HttpRequest, slide: Slide | None = None) -> HttpResponse:
    is_edit = slide is not None
    form = SlideForm(request.POST or None, request.FILES or None, instance=slide)
    if request.method == "POST" and form.is_valid():
        item = form.save()
        messages.success(request, "Слайдын мэдээлэл хадгалагдлаа.")
        return redirect("management:slide_edit", slide_id=item.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "slides",
            form=form,
            object=slide,
            form_title="Слайд засах" if is_edit else "Слайд нэмэх",
            list_url=reverse("management:slide_list"),
            delete_url=reverse("management:slide_delete", args=[slide.pk]) if is_edit else None,
            form_layout="slide",
        ),
    )


@staff_member_required(login_url="management:login")
def slide_toggle(request: HttpRequest, slide_id: int) -> HttpResponse:
    slide = get_object_or_404(Slide, pk=slide_id)
    slide.is_active = not slide.is_active
    slide.save(update_fields=["is_active", "update_date"])
    messages.success(request, "Слайдын төлөв шинэчлэгдлээ.")
    return redirect("management:slide_list")


@staff_member_required(login_url="management:login")
def slide_delete(request: HttpRequest, slide_id: int) -> HttpResponse:
    slide = get_object_or_404(Slide, pk=slide_id)
    if request.method == "POST":
        slide.delete()
        messages.success(request, "Слайд устгагдлаа.")
        return redirect("management:slide_list")
    return render(
        request,
        "management/entity_delete.html",
        _nav_context(
            "slides",
            object_label=slide.title,
            cancel_url=reverse("management:slide_edit", args=[slide.pk]),
            list_url=reverse("management:slide_list"),
        ),
    )


@staff_member_required(login_url="management:login")
def about_section_list(request: HttpRequest) -> HttpResponse:
    section, _ = AboutSection.objects.get_or_create(
        pk=1,
        defaults={
            "kicker": "Бидний тухай",
            "title": "Бизнесийн шийдлээ нэг дороос сонгоход тусална",
            "description": "Digit нь байгууллагуудад тохирох програм хангамж, зөвлөх үйлчилгээ, мэдлэг мэдээллийг нэг платформ дээр цэгцтэй харьцуулж сонгоход тусалдаг.",
            "feature_title": "Ил тод, бодит мэдээлэл",
            "feature_text": "Шийдэл, үйлчилгээ, нийтлэлийг нэг дороос ойлгомжтой харьцуулна.",
            "button_text": "Шийдлүүд үзэх",
            "button_url": "/softwares",
            "circle_right_text": "Найдвартай мэдээлэл",
            "circle_left_text": "Зөв сонголт",
            "sort_order": 0,
            "is_active": True,
        },
    )
    return redirect("management:about_section_edit", section_id=section.pk)


@staff_member_required(login_url="management:login")
def about_section_create(request: HttpRequest) -> HttpResponse:
    return redirect("management:about_section_list")


@staff_member_required(login_url="management:login")
def about_section_edit(request: HttpRequest, section_id: int) -> HttpResponse:
    section = get_object_or_404(AboutSection, pk=section_id)
    return _about_section_form(request, section)


def _about_section_form(request: HttpRequest, section: AboutSection | None = None) -> HttpResponse:
    form = AboutSectionForm(request.POST or None, request.FILES or None, instance=section)
    if request.method == "POST" and form.is_valid():
        item = form.save()
        messages.success(request, "Бидний тухай хэсгийн мэдээлэл хадгалагдлаа.")
        return redirect("management:about_section_edit", section_id=item.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "about_sections",
            form=form,
            object=section,
            form_title="Бидний тухай засах",
            list_url=reverse("management:dashboard"),
            list_label="Самбар руу буцах",
            form_layout="about_section",
        ),
    )


@staff_member_required(login_url="management:login")
def about_section_toggle(request: HttpRequest, section_id: int) -> HttpResponse:
    return redirect("management:about_section_list")


@staff_member_required(login_url="management:login")
def about_section_delete(request: HttpRequest, section_id: int) -> HttpResponse:
    return redirect("management:about_section_list")


def _content_list(request: HttpRequest, current_section: str, title: str, create_url: str, rows: list[dict]) -> HttpResponse:
    rows_page = _paginate(request, rows)
    return render(
        request,
        "management/content_list.html",
        _nav_context(current_section, page_title=title, rows=rows_page, create_url=create_url),
    )


@staff_member_required(login_url="management:login")
def software_list(request: HttpRequest) -> HttpResponse:
    rows = []
    for item in Software.objects.select_related("developer", "program_type").order_by("-created_date"):
        rows.append(
            {
                "title": item.name,
                "owner": item.developer.name,
                "category": item.program_type.name,
                "created_date": item.created_date,
                "status": _status_meta(item.is_approved),
                "featured": item.is_featured,
                "edit_url": reverse("management:software_edit", args=[item.pk]),
                "toggle_url": reverse("management:software_toggle", args=[item.pk]),
                "delete_url": reverse("management:software_delete", args=[item.pk]),
            }
        )
    return _content_list(request, "softwares", "Програм хангамж", reverse("management:software_create"), rows)


@staff_member_required(login_url="management:login")
def software_create(request: HttpRequest) -> HttpResponse:
    return _software_form(request)


@staff_member_required(login_url="management:login")
def software_edit(request: HttpRequest, software_id: int) -> HttpResponse:
    software = get_object_or_404(Software.objects.prefetch_related("images"), pk=software_id)
    return _software_form(request, software)


def _software_form(request: HttpRequest, software: Software | None = None) -> HttpResponse:
    is_edit = software is not None
    form = SoftwareAdminForm(request.POST or None, request.FILES or None, instance=software)
    if request.method == "POST" and form.is_valid():
        item = form.save(commit=False)
        if not is_edit:
            item.created_by = request.user
        item.save()
        form.save_m2m()
        _delete_images(item.images, request.POST.getlist("delete_image_ids"))
        _append_software_images(item, form.cleaned_data.get("new_images", []))
        messages.success(request, "Програм хангамжийн мэдээлэл хадгалагдлаа.")
        return redirect("management:software_edit", software_id=item.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "softwares",
            form=form,
            object=software,
            object_images=list(software.images.all()) if software else [],
            form_title="Програм засах" if is_edit else "Програм нэмэх",
            list_url=reverse("management:software_list"),
            delete_url=reverse("management:software_delete", args=[software.pk]) if is_edit else None,
        ),
    )


@staff_member_required(login_url="management:login")
def software_toggle(request: HttpRequest, software_id: int) -> HttpResponse:
    software = get_object_or_404(Software, pk=software_id)
    software.is_approved = not software.is_approved
    software.save(update_fields=["is_approved"])
    messages.success(request, "Програмын төлөв шинэчлэгдлээ.")
    return redirect("management:software_list")


@staff_member_required(login_url="management:login")
def software_delete(request: HttpRequest, software_id: int) -> HttpResponse:
    software = get_object_or_404(Software, pk=software_id)
    if request.method == "POST":
        software.delete()
        messages.success(request, "Програм устгагдлаа.")
        return redirect("management:software_list")
    return render(
        request,
        "management/entity_delete.html",
        _nav_context(
            "softwares",
            object_label=software.name,
            cancel_url=reverse("management:software_edit", args=[software.pk]),
            list_url=reverse("management:software_list"),
        ),
    )


@staff_member_required(login_url="management:login")
def advisory_list(request: HttpRequest) -> HttpResponse:
    rows = []
    for item in AdvisoryService.objects.select_related("company", "service_type").order_by("-created_date"):
        rows.append(
            {
                "title": item.title,
                "owner": item.company.name,
                "category": item.service_type.name,
                "created_date": item.created_date,
                "status": _status_meta(item.is_approved),
                "featured": item.is_featured,
                "edit_url": reverse("management:advisory_edit", args=[item.pk]),
                "toggle_url": reverse("management:advisory_toggle", args=[item.pk]),
                "delete_url": reverse("management:advisory_delete", args=[item.pk]),
            }
        )
    return _content_list(request, "advisories", "Зөвлөх үйлчилгээ", reverse("management:advisory_create"), rows)


@staff_member_required(login_url="management:login")
def advisory_create(request: HttpRequest) -> HttpResponse:
    return _advisory_form(request)


@staff_member_required(login_url="management:login")
def advisory_edit(request: HttpRequest, advisory_id: int) -> HttpResponse:
    advisory = get_object_or_404(AdvisoryService.objects.prefetch_related("images"), pk=advisory_id)
    return _advisory_form(request, advisory)


def _advisory_form(request: HttpRequest, advisory: AdvisoryService | None = None) -> HttpResponse:
    is_edit = advisory is not None
    form = AdvisoryAdminForm(request.POST or None, request.FILES or None, instance=advisory)
    if request.method == "POST" and form.is_valid():
        item = form.save(commit=False)
        if not is_edit:
            item.created_by = request.user
        item.save()
        form.save_m2m()
        _delete_images(item.images, request.POST.getlist("delete_image_ids"))
        _append_advisory_images(item, form.cleaned_data.get("new_images", []))
        messages.success(request, "Зөвлөх үйлчилгээний мэдээлэл хадгалагдлаа.")
        return redirect("management:advisory_edit", advisory_id=item.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "advisories",
            form=form,
            object=advisory,
            object_images=list(advisory.images.all()) if advisory else [],
            form_title="Зөвлөх үйлчилгээ засах" if is_edit else "Зөвлөх үйлчилгээ нэмэх",
            list_url=reverse("management:advisory_list"),
            delete_url=reverse("management:advisory_delete", args=[advisory.pk]) if is_edit else None,
        ),
    )


@staff_member_required(login_url="management:login")
def advisory_toggle(request: HttpRequest, advisory_id: int) -> HttpResponse:
    advisory = get_object_or_404(AdvisoryService, pk=advisory_id)
    advisory.is_approved = not advisory.is_approved
    advisory.save(update_fields=["is_approved"])
    messages.success(request, "Зөвлөх үйлчилгээний төлөв шинэчлэгдлээ.")
    return redirect("management:advisory_list")


@staff_member_required(login_url="management:login")
def advisory_delete(request: HttpRequest, advisory_id: int) -> HttpResponse:
    advisory = get_object_or_404(AdvisoryService, pk=advisory_id)
    if request.method == "POST":
        advisory.delete()
        messages.success(request, "Зөвлөх үйлчилгээ устгагдлаа.")
        return redirect("management:advisory_list")
    return render(
        request,
        "management/entity_delete.html",
        _nav_context(
            "advisories",
            object_label=advisory.title,
            cancel_url=reverse("management:advisory_edit", args=[advisory.pk]),
            list_url=reverse("management:advisory_list"),
        ),
    )


@staff_member_required(login_url="management:login")
def article_list(request: HttpRequest) -> HttpResponse:
    rows = []
    for item in Article.objects.select_related("organization", "article_type").order_by("-created_date"):
        rows.append(
            {
                "title": item.title,
                "owner": item.organization.name,
                "category": item.article_type.name,
                "created_date": item.created_date,
                "status": _status_meta(item.is_approved),
                "featured": item.is_featured,
                "edit_url": reverse("management:article_edit", args=[item.pk]),
                "toggle_url": reverse("management:article_toggle", args=[item.pk]),
                "delete_url": reverse("management:article_delete", args=[item.pk]),
            }
        )
    return _content_list(request, "articles", "Нийтлэл", reverse("management:article_create"), rows)


@staff_member_required(login_url="management:login")
def article_create(request: HttpRequest) -> HttpResponse:
    return _article_form(request)


@staff_member_required(login_url="management:login")
def article_edit(request: HttpRequest, article_id: int) -> HttpResponse:
    article = get_object_or_404(Article, pk=article_id)
    return _article_form(request, article)


def _article_form(request: HttpRequest, article: Article | None = None) -> HttpResponse:
    is_edit = article is not None
    form = ArticleAdminForm(request.POST or None, request.FILES or None, instance=article)
    if request.method == "POST" and form.is_valid():
        item = form.save(commit=False)
        if not is_edit:
            item.created_by = request.user
        item.save()
        form.save_m2m()
        messages.success(request, "Нийтлэлийн мэдээлэл хадгалагдлаа.")
        return redirect("management:article_edit", article_id=item.pk)

    return render(
        request,
        "management/entity_form.html",
        _nav_context(
            "articles",
            form=form,
            object=article,
            form_title="Нийтлэл засах" if is_edit else "Нийтлэл нэмэх",
            list_url=reverse("management:article_list"),
            delete_url=reverse("management:article_delete", args=[article.pk]) if is_edit else None,
            form_layout="single_image_left",
        ),
    )


@staff_member_required(login_url="management:login")
def article_toggle(request: HttpRequest, article_id: int) -> HttpResponse:
    article = get_object_or_404(Article, pk=article_id)
    article.is_approved = not article.is_approved
    article.save(update_fields=["is_approved"])
    messages.success(request, "Нийтлэлийн төлөв шинэчлэгдлээ.")
    return redirect("management:article_list")


@staff_member_required(login_url="management:login")
def article_delete(request: HttpRequest, article_id: int) -> HttpResponse:
    article = get_object_or_404(Article, pk=article_id)
    if request.method == "POST":
        article.delete()
        messages.success(request, "Нийтлэл устгагдлаа.")
        return redirect("management:article_list")
    return render(
        request,
        "management/entity_delete.html",
        _nav_context(
            "articles",
            object_label=article.title,
            cancel_url=reverse("management:article_edit", args=[article.pk]),
            list_url=reverse("management:article_list"),
        ),
    )


def _delete_images(related_manager, delete_ids: list[str]):
    valid_ids = [int(image_id) for image_id in delete_ids if image_id.isdigit()]
    if valid_ids:
        related_manager.filter(pk__in=valid_ids).delete()


def _append_software_images(software: Software, files):
    next_sort = software.images.count()
    for file in files:
        SoftwareImage.objects.create(software=software, image=file, sort_order=next_sort)
        next_sort += 1


def _append_advisory_images(advisory: AdvisoryService, files):
    next_sort = advisory.images.count()
    for file in files:
        AdvisoryServiceImage.objects.create(advisory_service=advisory, image=file, sort_order=next_sort)
        next_sort += 1

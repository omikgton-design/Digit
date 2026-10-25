"""Админ хэсэг: сайтын агуулгыг удирдах нэмэлт хуудсууд.

- Төрөл, салбар (Category) болон зөвлөх үйлчилгээний төрөл (AdvisoryServiceType)
- Нүүр хуудасны "Ажлын үе шат" хэсэг ба алхмууд
- Хөл цэсний холбоосууд
- Сайтын лого (толгой, хөл хэсэг)

Бүх хуудас зөвхөн staff эрхтэй хэрэглэгчид нээлттэй; устгахын өмнө баталгаажуулах
хуудас харуулна; төлөв солих, дараалал өөрчлөх үйлдлүүд POST-оор хийгдэнэ.
"""

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.db import transaction
from django.db.models import Count, ProtectedError, Q
from django.http import HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from .forms import AdvisoryServiceTypeForm, CategoryForm, FooterLinkForm, ProcessSectionForm, ProcessStepForm, SiteSettingForm
from .models import AdvisoryServiceType, Category, FooterLink, ProcessSection, ProcessStep, SiteSetting


staff_required = staff_member_required(login_url="management:login")

CATEGORY_TABS = [
    (Category.TYPE_PROGRAM, "Програм хангамжийн төрөл"),
    (Category.TYPE_ADVISORY, "Салбар"),
    (Category.TYPE_ARTICLE, "Нийтлэлийн төрөл"),
    ("service_type", "Зөвлөх үйлчилгээний төрөл"),
]
CATEGORY_TAB_KEYS = {key for key, _ in CATEGORY_TABS}


def _ctx(current_section: str, **extra):
    return {"current_section": current_section, **extra}


def _safe_next(request: HttpRequest, fallback: str) -> str:
    next_url = request.POST.get("next") or request.GET.get("next") or ""
    return next_url if next_url.startswith("/") and not next_url.startswith("//") else fallback


def _swap_order(queryset, item, direction: str) -> None:
    """Дараалал өөрчлөх: ижил бүлэг доторх хөрш мөртэй sort_order-ыг солино."""
    siblings = list(queryset.order_by("sort_order", "id"))
    # Дараалал давхцсан бол эхлээд 1..N болгож цэгцэлнэ.
    for index, sibling in enumerate(siblings, start=1):
        if sibling.sort_order != index:
            sibling.sort_order = index
            sibling.save(update_fields=["sort_order"])
    position = next((i for i, sibling in enumerate(siblings) if sibling.pk == item.pk), None)
    if position is None:
        return
    target = position - 1 if direction == "up" else position + 1
    if target < 0 or target >= len(siblings):
        return
    a, b = siblings[position], siblings[target]
    a.sort_order, b.sort_order = b.sort_order, a.sort_order
    a.save(update_fields=["sort_order"])
    b.save(update_fields=["sort_order"])


def _next_sort_order(queryset) -> int:
    last = queryset.order_by("-sort_order").values_list("sort_order", flat=True).first()
    return (last or 0) + 1


# --------------------------------------------------------------------------
# Төрөл, салбар
# --------------------------------------------------------------------------


def _category_usage(category: Category) -> int:
    return (
        category.software_program_types.count()
        + category.software_advisory_sectors.count()
        + category.advisory_service_sectors.count()
        + category.articles.count()
    )


@staff_required
def category_list(request: HttpRequest) -> HttpResponse:
    tab = request.GET.get("type") or Category.TYPE_PROGRAM
    if tab not in CATEGORY_TAB_KEYS:
        tab = Category.TYPE_PROGRAM
    query = (request.GET.get("q") or "").strip()
    status = request.GET.get("status") or ""

    rows = []
    if tab == "service_type":
        items = AdvisoryServiceType.objects.annotate(usage=Count("advisory_services")).order_by("sort_order", "name")
        if query:
            items = items.filter(Q(name__icontains=query) | Q(key__icontains=query) | Q(description__icontains=query))
        if status in {"active", "inactive"}:
            items = items.filter(is_active=status == "active")
        for item in items:
            rows.append({"obj": item, "level": 0, "usage": item.usage, "name": item.name, "extra": item.key})
        create_url = reverse("management:service_type_create")
    else:
        base = Category.objects.filter(type=tab)
        filtered = base
        if query:
            filtered = filtered.filter(Q(name__icontains=query) | Q(description__icontains=query))
        if status in {"active", "inactive"}:
            filtered = filtered.filter(is_active=status == "active")
        matched_ids = set(filtered.values_list("id", flat=True))
        parents = list(base.filter(parent__isnull=True).order_by("sort_order", "name"))
        children_by_parent: dict[int, list[Category]] = {}
        for child in base.filter(parent__isnull=False).order_by("sort_order", "name"):
            children_by_parent.setdefault(child.parent_id, []).append(child)
        known_parent_ids = {parent.id for parent in parents}
        # Эцэг нь өөр төрлийнх болсон "өнчин" ангиллыг үндсэн түвшинд харуулна.
        orphans = [child for pid, kids in children_by_parent.items() if pid not in known_parent_ids for child in kids]
        for parent in parents + orphans:
            kids = children_by_parent.get(parent.id, []) if parent in parents else []
            visible_kids = [kid for kid in kids if kid.id in matched_ids]
            if parent.id in matched_ids or visible_kids:
                rows.append({"obj": parent, "level": 0, "usage": _category_usage(parent), "name": parent.name, "child_count": len(kids)})
            for kid in visible_kids:
                rows.append({"obj": kid, "level": 1, "usage": _category_usage(kid), "name": kid.name})
        create_url = f"{reverse('management:category_create')}?type={tab}"

    return render(
        request,
        "management/category_list.html",
        _ctx(
            "categories",
            page_title="Төрөл, салбар",
            tabs=CATEGORY_TABS,
            tab=tab,
            rows=rows,
            query=query,
            status=status,
            create_url=create_url,
            is_service_type=tab == "service_type",
            current_url=request.get_full_path(),
        ),
    )


def _category_form(request: HttpRequest, category: Category | None = None) -> HttpResponse:
    is_edit = category is not None
    fixed_type = None if is_edit else request.GET.get("type")
    if fixed_type not in {Category.TYPE_PROGRAM, Category.TYPE_ADVISORY, Category.TYPE_ARTICLE}:
        fixed_type = None
    initial = {}
    if not is_edit:
        parent_id = request.GET.get("parent")
        if parent_id and parent_id.isdigit():
            initial["parent"] = parent_id
        if fixed_type:
            initial["sort_order"] = _next_sort_order(Category.objects.filter(type=fixed_type, parent_id=initial.get("parent")))
    form = CategoryForm(request.POST or None, instance=category, fixed_type=fixed_type, initial=initial)
    if request.method == "POST" and form.is_valid():
        item = form.save()
        messages.success(request, "Ангиллын мэдээлэл хадгалагдлаа.")
        return redirect(f"{reverse('management:category_list')}?type={item.type}")

    list_type = category.type if category else (fixed_type or Category.TYPE_PROGRAM)
    return render(
        request,
        "management/entity_form.html",
        _ctx(
            "categories",
            form=form,
            object=category,
            form_title="Ангилал засах" if is_edit else "Ангилал нэмэх",
            list_url=f"{reverse('management:category_list')}?type={list_type}",
            delete_url=reverse("management:category_delete", args=[category.pk]) if is_edit else None,
        ),
    )


@staff_required
def category_create(request: HttpRequest) -> HttpResponse:
    return _category_form(request)


@staff_required
def category_edit(request: HttpRequest, category_id: int) -> HttpResponse:
    return _category_form(request, get_object_or_404(Category, pk=category_id))


@staff_required
@require_POST
def category_toggle(request: HttpRequest, category_id: int) -> HttpResponse:
    category = get_object_or_404(Category, pk=category_id)
    category.is_active = not category.is_active
    category.save(update_fields=["is_active"])
    state = "идэвхтэй" if category.is_active else "идэвхгүй"
    messages.success(request, f"«{category.name}» {state} боллоо.")
    return redirect(_safe_next(request, f"{reverse('management:category_list')}?type={category.type}"))


@staff_required
@require_POST
def category_move(request: HttpRequest, category_id: int) -> HttpResponse:
    category = get_object_or_404(Category, pk=category_id)
    with transaction.atomic():
        _swap_order(Category.objects.filter(type=category.type, parent_id=category.parent_id), category, request.POST.get("direction", "up"))
    return redirect(_safe_next(request, f"{reverse('management:category_list')}?type={category.type}"))


@staff_required
def category_delete(request: HttpRequest, category_id: int) -> HttpResponse:
    category = get_object_or_404(Category, pk=category_id)
    list_url = f"{reverse('management:category_list')}?type={category.type}"
    usage = _category_usage(category)
    child_count = category.children.count()
    if request.method == "POST":
        try:
            with transaction.atomic():
                # Дэд ангиллуудыг хамт устгана (эцэг устахад хүүхэд нь өнчин үлдэхгүй).
                for child in category.children.all():
                    child.delete()
                category.delete()
        except ProtectedError:
            messages.error(
                request,
                f"«{category.name}» ангиллыг програм хангамж ашиглаж байгаа тул устгах боломжгүй. "
                "Идэвхгүй болгох эсвэл тухайн програмын төрлийг өөрчилнө үү.",
            )
            return redirect(list_url)
        messages.success(request, "Ангилал устгагдлаа.")
        return redirect(list_url)

    notes = []
    if child_count:
        notes.append(f"{child_count} дэд ангилал хамт устна.")
    if usage:
        notes.append(f"Энэ ангиллыг {usage} бүртгэл ашиглаж байна.")
    return render(
        request,
        "management/entity_delete.html",
        _ctx(
            "categories",
            object_label=category.name,
            extra_note=" ".join(notes),
            cancel_url=reverse("management:category_edit", args=[category.pk]),
            list_url=list_url,
        ),
    )


# Зөвлөх үйлчилгээний төрөл ------------------------------------------------


def _service_type_form(request: HttpRequest, item: AdvisoryServiceType | None = None) -> HttpResponse:
    is_edit = item is not None
    initial = {} if is_edit else {"sort_order": _next_sort_order(AdvisoryServiceType.objects.all())}
    form = AdvisoryServiceTypeForm(request.POST or None, instance=item, initial=initial)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Зөвлөх үйлчилгээний төрөл хадгалагдлаа.")
        return redirect(f"{reverse('management:category_list')}?type=service_type")
    return render(
        request,
        "management/entity_form.html",
        _ctx(
            "categories",
            form=form,
            object=item,
            form_title="Зөвлөх үйлчилгээний төрөл засах" if is_edit else "Зөвлөх үйлчилгээний төрөл нэмэх",
            list_url=f"{reverse('management:category_list')}?type=service_type",
            delete_url=reverse("management:service_type_delete", args=[item.pk]) if is_edit else None,
        ),
    )


@staff_required
def service_type_create(request: HttpRequest) -> HttpResponse:
    return _service_type_form(request)


@staff_required
def service_type_edit(request: HttpRequest, item_id: int) -> HttpResponse:
    return _service_type_form(request, get_object_or_404(AdvisoryServiceType, pk=item_id))


@staff_required
@require_POST
def service_type_toggle(request: HttpRequest, item_id: int) -> HttpResponse:
    item = get_object_or_404(AdvisoryServiceType, pk=item_id)
    item.is_active = not item.is_active
    item.save(update_fields=["is_active"])
    messages.success(request, f"«{item.name}» {'идэвхтэй' if item.is_active else 'идэвхгүй'} боллоо.")
    return redirect(_safe_next(request, f"{reverse('management:category_list')}?type=service_type"))


@staff_required
@require_POST
def service_type_move(request: HttpRequest, item_id: int) -> HttpResponse:
    item = get_object_or_404(AdvisoryServiceType, pk=item_id)
    with transaction.atomic():
        _swap_order(AdvisoryServiceType.objects.all(), item, request.POST.get("direction", "up"))
    return redirect(_safe_next(request, f"{reverse('management:category_list')}?type=service_type"))


@staff_required
def service_type_delete(request: HttpRequest, item_id: int) -> HttpResponse:
    item = get_object_or_404(AdvisoryServiceType, pk=item_id)
    list_url = f"{reverse('management:category_list')}?type=service_type"
    if request.method == "POST":
        try:
            item.delete()
        except ProtectedError:
            messages.error(request, f"«{item.name}» төрлийг зөвлөх үйлчилгээ ашиглаж байгаа тул устгах боломжгүй. Идэвхгүй болгоно уу.")
            return redirect(list_url)
        messages.success(request, "Зөвлөх үйлчилгээний төрөл устгагдлаа.")
        return redirect(list_url)
    usage = item.advisory_services.count()
    return render(
        request,
        "management/entity_delete.html",
        _ctx(
            "categories",
            object_label=item.name,
            extra_note=f"Энэ төрлийг {usage} зөвлөх үйлчилгээ ашиглаж байна." if usage else "",
            cancel_url=reverse("management:service_type_edit", args=[item.pk]),
            list_url=list_url,
        ),
    )


# --------------------------------------------------------------------------
# Ажлын үе шат
# --------------------------------------------------------------------------


@staff_required
def process_edit(request: HttpRequest) -> HttpResponse:
    section = ProcessSection.load()
    form = ProcessSectionForm(request.POST or None, instance=section)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "«Ажлын үе шат» хэсэг хадгалагдлаа. Нүүр хуудсанд шууд харагдана.")
        return redirect("management:process_edit")
    return render(
        request,
        "management/process_edit.html",
        _ctx("process", form=form, process_section=section, steps=section.steps.order_by("sort_order", "id"), page_title="Ажлын үе шат"),
    )


def _process_step_form(request: HttpRequest, step: ProcessStep | None = None) -> HttpResponse:
    section = ProcessSection.load()
    is_edit = step is not None
    initial = {} if is_edit else {"sort_order": _next_sort_order(section.steps.all())}
    form = ProcessStepForm(request.POST or None, instance=step, initial=initial)
    if request.method == "POST" and form.is_valid():
        item = form.save(commit=False)
        item.section = section
        item.save()
        messages.success(request, "Алхам хадгалагдлаа.")
        return redirect("management:process_edit")
    return render(
        request,
        "management/entity_form.html",
        _ctx(
            "process",
            form=form,
            object=step,
            form_title="Алхам засах" if is_edit else "Алхам нэмэх",
            list_url=reverse("management:process_edit"),
            delete_url=reverse("management:process_step_delete", args=[step.pk]) if is_edit else None,
        ),
    )


@staff_required
def process_step_create(request: HttpRequest) -> HttpResponse:
    return _process_step_form(request)


@staff_required
def process_step_edit(request: HttpRequest, step_id: int) -> HttpResponse:
    return _process_step_form(request, get_object_or_404(ProcessStep, pk=step_id))


@staff_required
@require_POST
def process_step_toggle(request: HttpRequest, step_id: int) -> HttpResponse:
    step = get_object_or_404(ProcessStep, pk=step_id)
    step.is_active = not step.is_active
    step.save(update_fields=["is_active"])
    messages.success(request, "Алхмын төлөв шинэчлэгдлээ.")
    return redirect("management:process_edit")


@staff_required
@require_POST
def process_step_move(request: HttpRequest, step_id: int) -> HttpResponse:
    step = get_object_or_404(ProcessStep, pk=step_id)
    with transaction.atomic():
        _swap_order(ProcessStep.objects.filter(section_id=step.section_id), step, request.POST.get("direction", "up"))
    return redirect("management:process_edit")


@staff_required
def process_step_delete(request: HttpRequest, step_id: int) -> HttpResponse:
    step = get_object_or_404(ProcessStep, pk=step_id)
    if request.method == "POST":
        step.delete()
        messages.success(request, "Алхам устгагдлаа.")
        return redirect("management:process_edit")
    return render(
        request,
        "management/entity_delete.html",
        _ctx(
            "process",
            object_label=step.title,
            cancel_url=reverse("management:process_step_edit", args=[step.pk]),
            list_url=reverse("management:process_edit"),
        ),
    )


# --------------------------------------------------------------------------
# Хөл цэсний холбоос
# --------------------------------------------------------------------------


@staff_required
def footer_link_list(request: HttpRequest) -> HttpResponse:
    groups = []
    for key, label in FooterLink.COLUMN_CHOICES:
        groups.append(
            {
                "key": key,
                "label": label,
                "links": FooterLink.objects.filter(column=key).order_by("sort_order", "id"),
                "create_url": f"{reverse('management:footer_link_create')}?column={key}",
            }
        )
    return render(request, "management/footer_link_list.html", _ctx("footer_links", groups=groups, page_title="Хөл цэсний холбоос"))


def _footer_link_form(request: HttpRequest, link: FooterLink | None = None) -> HttpResponse:
    is_edit = link is not None
    initial = {}
    if not is_edit:
        column = request.GET.get("column")
        if column in dict(FooterLink.COLUMN_CHOICES):
            initial = {"column": column, "sort_order": _next_sort_order(FooterLink.objects.filter(column=column))}
    form = FooterLinkForm(request.POST or None, instance=link, initial=initial)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Хөл цэсний холбоос хадгалагдлаа.")
        return redirect("management:footer_link_list")
    return render(
        request,
        "management/entity_form.html",
        _ctx(
            "footer_links",
            form=form,
            object=link,
            form_title="Холбоос засах" if is_edit else "Холбоос нэмэх",
            list_url=reverse("management:footer_link_list"),
            delete_url=reverse("management:footer_link_delete", args=[link.pk]) if is_edit else None,
        ),
    )


@staff_required
def footer_link_create(request: HttpRequest) -> HttpResponse:
    return _footer_link_form(request)


@staff_required
def footer_link_edit(request: HttpRequest, link_id: int) -> HttpResponse:
    return _footer_link_form(request, get_object_or_404(FooterLink, pk=link_id))


@staff_required
@require_POST
def footer_link_toggle(request: HttpRequest, link_id: int) -> HttpResponse:
    link = get_object_or_404(FooterLink, pk=link_id)
    link.is_active = not link.is_active
    link.save(update_fields=["is_active", "update_date"])
    messages.success(request, "Холбоосын төлөв шинэчлэгдлээ.")
    return redirect("management:footer_link_list")


@staff_required
@require_POST
def footer_link_move(request: HttpRequest, link_id: int) -> HttpResponse:
    link = get_object_or_404(FooterLink, pk=link_id)
    with transaction.atomic():
        _swap_order(FooterLink.objects.filter(column=link.column), link, request.POST.get("direction", "up"))
    return redirect("management:footer_link_list")


@staff_required
def footer_link_delete(request: HttpRequest, link_id: int) -> HttpResponse:
    link = get_object_or_404(FooterLink, pk=link_id)
    if request.method == "POST":
        link.delete()
        messages.success(request, "Холбоос устгагдлаа.")
        return redirect("management:footer_link_list")
    return render(
        request,
        "management/entity_delete.html",
        _ctx(
            "footer_links",
            object_label=link.label,
            cancel_url=reverse("management:footer_link_edit", args=[link.pk]),
            list_url=reverse("management:footer_link_list"),
        ),
    )


# --------------------------------------------------------------------------
# Сайтын лого
# --------------------------------------------------------------------------


@staff_required
def site_settings_edit(request: HttpRequest) -> HttpResponse:
    site = SiteSetting.load()
    form = SiteSettingForm(request.POST or None, request.FILES or None, instance=site)
    if request.method == "POST" and form.is_valid():
        form.save()
        messages.success(request, "Логоны тохиргоо хадгалагдлаа. Вэбсайт дээр шууд солигдоно.")
        return redirect("management:site_settings")
    return render(request, "management/site_settings.html", _ctx("site_settings", form=form, site=site, page_title="Лого ба ерөнхий тохиргоо"))

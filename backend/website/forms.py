from django import forms
from django.contrib.auth.models import User

from .models import (
    AboutSection,
    AdvisoryPriceTerm,
    AdvisoryRating,
    AdvisoryService,
    AdvisoryServiceType,
    Article,
    Category,
    Customer,
    CustomerMembershipPayment,
    FooterLink,
    FooterMenuContent,
    PartnerOrganization,
    ProcessSection,
    ProcessStep,
    SiteSetting,
    Slide,
    Software,
    SoftwareRating,
)
from .registry import REGISTER_PATTERN, normalize_register


INPUT_CLASS = "form-control"
SELECT_CLASS = "form-select"
CHECKBOX_CLASS = "form-check-input"


class HierarchicalCategoryChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        prefix = "  - " if getattr(obj, "parent_id", None) else ""
        return f"{prefix}{obj.name}"


def _build_grouped_nodes(items, selected_ids=None):
    selected = {str(value) for value in (selected_ids or [])}
    raw_nodes = []
    item_map = {}

    for item in items:
        node = {
            "id": item.pk,
            "name": item.name,
            "selected": str(item.pk) in selected,
            "children": [],
        }
        raw_nodes.append((item, node))
        item_map[item.pk] = node

    roots = []
    for item, node in raw_nodes:
        parent_id = getattr(item, "parent_id", None)
        if parent_id and parent_id in item_map:
            item_map[parent_id]["children"].append(node)
        else:
            roots.append(node)

    for node in item_map.values():
        node["expanded"] = node["selected"] or any(child["selected"] for child in node["children"])

    return roots


def _build_flat_nodes(items, selected_ids=None, group_label="Сонголтууд"):
    selected = {str(value) for value in (selected_ids or [])}
    children = [{"id": item.pk, "name": item.name, "selected": str(item.pk) in selected} for item in items]
    return [
        {
            "id": "group",
            "name": group_label,
            "selected": any(child["selected"] for child in children),
            "expanded": any(child["selected"] for child in children),
            "children": children,
        }
    ]


class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class MultipleFileField(forms.FileField):
    widget = MultipleFileInput

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if not data:
            return []
        if isinstance(data, (list, tuple)):
            return [single_file_clean(item, initial) for item in data]
        return [single_file_clean(data, initial)]


class StyledFormMixin:
    textarea_fields = {"description", "introduction", "client_organizations", "content", "feature_text"}

    def _apply_widget_classes(self):
        for name, field in self.fields.items():
            widget = field.widget
            classes = widget.attrs.get("class", "").split()

            if isinstance(widget, forms.CheckboxInput):
                widget.attrs["class"] = " ".join(filter(None, [*classes, CHECKBOX_CLASS]))
                continue

            if isinstance(widget, (forms.Select, forms.SelectMultiple)):
                base_class = SELECT_CLASS
            else:
                base_class = INPUT_CLASS

            if name in self.textarea_fields and not isinstance(widget, forms.CheckboxSelectMultiple):
                widget.attrs["rows"] = widget.attrs.get("rows", 5)
                widget.attrs["class"] = " ".join(filter(None, [*classes, base_class, "js-richtext"]))
                continue

            widget.attrs["class"] = " ".join(filter(None, [*classes, base_class]))
class ManagementAuthenticationForm(forms.Form):
    username = forms.CharField(
        label="Имэйл эсвэл нэвтрэх нэр",
        widget=forms.TextInput(
            attrs={
                "class": INPUT_CLASS,
                "placeholder": "admin@example.com",
            }
        ),
    )

    password = forms.CharField(
        label="Нууц үг",
        strip=False,
        widget=forms.PasswordInput(
            attrs={
                "class": INPUT_CLASS,
                "placeholder": "********",
            }
        ),
    )


class ManagementRegistrationForm(forms.Form):
    username = forms.CharField(
        label="Нэвтрэх нэр",
        widget=forms.TextInput(
            attrs={"class": INPUT_CLASS, "placeholder": "admin"}
        ),
    )

    email = forms.EmailField(
        label="Имэйл",
        widget=forms.EmailInput(
            attrs={"class": INPUT_CLASS, "placeholder": "admin@example.com"}
        ),
    )

    password = forms.CharField(
        label="Нууц үг",
        strip=False,
        widget=forms.PasswordInput(
            attrs={"class": INPUT_CLASS, "placeholder": "********"}
        ),
    )

    password_confirm = forms.CharField(
        label="Нууц үг давтах",
        strip=False,
        widget=forms.PasswordInput(
            attrs={"class": INPUT_CLASS, "placeholder": "********"}
        ),
    )

    def clean_username(self):
        username = self.cleaned_data["username"].strip()

        if User.objects.filter(username__iexact=username).exists():
            raise forms.ValidationError(
                "Энэ нэвтрэх нэр бүртгэлтэй байна."
            )

        return username

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError(
                "Энэ имэйл бүртгэлтэй байна."
            )

        return email

    def clean(self):
        cleaned_data = super().clean()

        password = cleaned_data.get("password")
        password_confirm = cleaned_data.get("password_confirm")

        if password and password_confirm and password != password_confirm:
            self.add_error(
                "password_confirm",
                "Нууц үг таарахгүй байна.",
            )

        return cleaned_data

class CustomerAdminForm(StyledFormMixin, forms.ModelForm):
    username = forms.CharField(label="Нэвтрэх нэр", max_length=150)
    password = forms.CharField(
        label="Нууц үг",
        required=False,
        widget=forms.PasswordInput(render_value=True),
        help_text="Шинэ хэрэглэгч дээр заавал. Засварлах үед хоосон орхивол хуучин нууц үг хэвээр үлдэнэ.",
    )
    password_confirm = forms.CharField(
        label="Нууц үг давтах",
        required=False,
        widget=forms.PasswordInput(render_value=True),
    )
    is_staff = forms.BooleanField(label="Админ эрх", required=False)
    is_active = forms.BooleanField(label="Идэвхтэй", required=False, initial=True)

    def __init__(self, *args, account_type=None, **kwargs):
        self.form_account_type = account_type
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            self.form_account_type = self.instance.account_type
        self.fields["account_type"].required = False
        self.fields["type"].required = False
        self.fields.pop("type", None)
        if self.form_account_type == Customer.ACCOUNT_PERSON:
            self.fields["name"].label = "Овог нэр"
            self.fields["logo"].label = "Профайл зураг"
            self.fields.pop("website", None)
            self.fields.pop("contact_person_name", None)
            self.fields.pop("contact_person_phone", None)
            for name in ("register_number", "software_limit", "advisory_limit", "article_limit"):
                self.fields.pop(name, None)
        else:
            self.fields["register_number"].help_text = "Байгууллага энэ регистрээр + нууц үгээр нэвтэрнэ. 7–10 тэмдэгт."
            limit_help = "Silver/Gold багцад оруулж болох тоо. Хоосон бол өгөгдмөл (Silver: 3, Gold: хязгааргүй). Bronze үргэлж 1."
            for name in ("software_limit", "advisory_limit", "article_limit"):
                self.fields[name].help_text = limit_help
                self.fields[name].widget.attrs["min"] = 0
        if self.instance.pk:
            self.fields["username"].initial = self.instance.user.username
            self.fields["is_staff"].initial = self.instance.user.is_staff
            self.fields["is_active"].initial = self.instance.user.is_active
        self._apply_widget_classes()

    class Meta:
        model = Customer
        fields = [
            "name",
            "logo",
            "email",
            "phone",
            "website",
            "address",
            "contact_person_name",
            "contact_person_phone",
            "account_type",
            "type",
            "register_number",
            "software_limit",
            "advisory_limit",
            "article_limit",
        ]
        labels = {
            "name": "Нэр",
            "logo": "Лого",
            "email": "И-мэйл",
            "phone": "Утас",
            "website": "Вэбсайт",
            "address": "Хаяг",
            "contact_person_name": "Холбоо барих хүний нэр",
            "contact_person_phone": "Холбоо барих хүний утас",
            "account_type": "Бүртгэлийн төрөл",
            "type": "Membership",
        }
        widgets = {
            "logo": forms.FileInput(),
            "address": forms.TextInput(),
        }

    def clean_register_number(self):
        value = normalize_register(self.cleaned_data.get("register_number"))
        if not value:
            return None
        if not REGISTER_PATTERN.match(value):
            raise forms.ValidationError("Регистрийн дугаар буруу байна (7–10 тэмдэгт, тоо болон үсэг).")
        qs = Customer.objects.filter(register_number=value)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise forms.ValidationError("Энэ регистрийн дугаар бүртгэлтэй байна.")
        return value

    def clean_username(self):
        username = self.cleaned_data["username"].strip()
        qs = User.objects.filter(username=username)
        if self.instance.pk:
            qs = qs.exclude(pk=self.instance.user_id)
        if qs.exists():
            raise forms.ValidationError("Ийм нэвтрэх нэр аль хэдийн ашиглагдаж байна.")
        return username

    def clean(self):
        cleaned = super().clean()
        password = cleaned.get("password")
        password_confirm = cleaned.get("password_confirm")

        if not self.instance.pk and not password:
            self.add_error("password", "Шинэ хэрэглэгч дээр нууц үг заавал оруулна.")
        if password or password_confirm:
            if password != password_confirm:
                self.add_error("password_confirm", "Нууц үг хоорондоо таарахгүй байна.")
        return cleaned

    def save(self, commit=True):
        customer = super().save(commit=False)
        if self.instance.pk:
            customer.account_type = self.instance.account_type
        elif self.form_account_type in {Customer.ACCOUNT_ORG, Customer.ACCOUNT_PERSON}:
            customer.account_type = self.form_account_type
        elif not customer.account_type:
            customer.account_type = Customer.ACCOUNT_ORG
        if customer.account_type == Customer.ACCOUNT_PERSON:
            customer.website = ""
            customer.contact_person_name = ""
            customer.contact_person_phone = ""
        user = customer.user if self.instance.pk else User()
        user.username = self.cleaned_data["username"]
        user.email = self.cleaned_data["email"]
        user.is_staff = self.cleaned_data["is_staff"]
        user.is_active = self.cleaned_data["is_active"]

        password = self.cleaned_data.get("password")
        if password:
            user.set_password(password)

        if commit:
            user.save()
            customer.user = user
            customer.save()
            self.save_m2m()
        else:
            customer.user = user
        return customer


class CustomerPaymentForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = CustomerMembershipPayment
        fields = [
            "paid_date",
            "end_date",
            "membership_type",
        ]
        labels = {
            "paid_date": "Төлбөр төлсөн огноо",
            "end_date": "Дуусах огноо",
            "membership_type": "Төлбөрийн төрөл",
        }
        widgets = {
            "paid_date": forms.DateInput(attrs={"type": "date"}, format="%Y-%m-%d"),
            "end_date": forms.DateInput(attrs={"type": "date"}, format="%Y-%m-%d"),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["paid_date"].required = True
        self.fields["end_date"].required = True
        self._apply_widget_classes()

    def clean(self):
        cleaned = super().clean()
        paid_date = cleaned.get("paid_date")
        end_date = cleaned.get("end_date")
        if paid_date and end_date and end_date < paid_date:
            self.add_error("end_date", "Дуусах огноо төлбөр төлсөн огнооноос өмнө байж болохгүй.")
        return cleaned


class FooterMenuContentForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = FooterMenuContent
        fields = [
            "key",
            "title",
            "image",
            "content",
            "is_active",
        ]
        labels = {
            "key": "Цэс",
            "title": "Гарчиг",
            "image": "Зураг",
            "content": "Текст",
            "is_active": "Идэвхтэй",
        }
        widgets = {
            "image": forms.FileInput(),
            "content": forms.Textarea(attrs={"rows": 8}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()
        self.fields["content"].widget.attrs["rows"] = 8


class PartnerOrganizationForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = PartnerOrganization
        fields = [
            "name",
            "logo",
            "link_url",
            "sort_order",
            "is_active",
        ]
        labels = {
            "name": "Байгууллагын нэр",
            "logo": "Лого",
            "link_url": "Линк",
            "sort_order": "Дараалал",
            "is_active": "Идэвхтэй",
        }
        widgets = {
            "logo": forms.FileInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()


class SlideForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = Slide
        fields = [
            "partner_label",
            "title",
            "description",
            "image",
            "link_url",
            "sort_order",
            "is_active",
        ]
        labels = {
            "partner_label": "Дээд шошго",
            "title": "Гарчиг",
            "description": "Тайлбар",
            "image": "Зураг",
            "link_url": "Линк",
            "sort_order": "Дараалал",
            "is_active": "Идэвхтэй",
        }
        widgets = {
            "image": forms.FileInput(),
            "description": forms.Textarea(attrs={"rows": 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()


class AboutSectionForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = AboutSection
        fields = [
            "kicker",
            "title",
            "description",
            "feature_title",
            "feature_text",
            "button_text",
            "button_url",
            "circle_right_text",
            "circle_left_text",
            "top_image",
            "bottom_image",
            "sort_order",
            "is_active",
        ]
        labels = {
            "kicker": "Дээд шошго",
            "title": "Гарчиг",
            "description": "Тайлбар",
            "feature_title": "Давуу талын гарчиг",
            "feature_text": "Давуу талын тайлбар",
            "button_text": "Товчны текст",
            "button_url": "Товчны линк",
            "circle_right_text": "Баруун дугуйн текст",
            "circle_left_text": "Зүүн дугуйн текст",
            "top_image": "Дээд зураг",
            "bottom_image": "Доод зураг",
            "sort_order": "Дараалал",
            "is_active": "Идэвхтэй",
        }
        widgets = {
            "top_image": forms.FileInput(),
            "bottom_image": forms.FileInput(),
            "description": forms.Textarea(attrs={"rows": 4}),
            "feature_text": forms.Textarea(attrs={"rows": 3}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()
        self.fields["description"].widget.attrs["class"] = INPUT_CLASS
        self.fields["feature_text"].widget.attrs["class"] = INPUT_CLASS


class SoftwareAdminForm(StyledFormMixin, forms.ModelForm):
    new_images = MultipleFileField(label="Зураг нэмэх", required=False)
    program_type = HierarchicalCategoryChoiceField(queryset=Category.objects.none(), label="Төрөл")

    def _selected_sector_ids(self):
        if self.is_bound:
            return self.data.getlist(self.add_prefix("advisory_sectors"))
        if self.instance.pk:
            return self.instance.advisory_sectors.values_list("id", flat=True)
        return []

    class Meta:
        model = Software
        fields = [
            "name",
            "development_start_year",
            "program_type",
            "advisory_sectors",
            "developer",
            "introduction",
            "description",
            "price",
            "price_type",
            "is_featured",
            "is_approved",
        ]
        labels = {
            "name": "Нэр",
            "development_start_year": "Эхэлсэн он",
            "program_type": "Төрөл",
            "advisory_sectors": "Салбарууд",
            "developer": "Байгууллага",
            "introduction": "Танилцуулга",
            "description": "Дэлгэрэнгүй",
            "price": "Үнэ",
            "price_type": "Үнийн төрөл",
            "is_featured": "Онцлох",
            "is_approved": "Нийтлэх зөвшөөрөл",
        }
        widgets = {
            "advisory_sectors": forms.CheckboxSelectMultiple(),
            "introduction": forms.Textarea(attrs={"rows": 3}),
            "description": forms.Textarea(attrs={"rows": 6}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        program_categories = Category.objects.filter(type=Category.TYPE_PROGRAM).select_related("parent").order_by("parent_id", "sort_order", "name")
        advisory_categories = Category.objects.filter(type=Category.TYPE_ADVISORY).select_related("parent").order_by("parent_id", "sort_order", "name")
        self.fields["program_type"].queryset = program_categories
        self.fields["advisory_sectors"].queryset = advisory_categories
        self.fields["developer"].queryset = Customer.objects.select_related("user").order_by("name")
        self._apply_widget_classes()

        selected_sectors = self._selected_sector_ids()
        self.fields["advisory_sectors"].tree_nodes = _build_grouped_nodes(advisory_categories, selected_sectors)
        self.fields["advisory_sectors"].tree_input_type = "checkbox"


class AdvisoryAdminForm(StyledFormMixin, forms.ModelForm):
    new_images = MultipleFileField(label="Зураг нэмэх", required=False)

    def _selected_sector_ids(self):
        if self.is_bound:
            return self.data.getlist(self.add_prefix("advisory_sectors"))
        if self.instance.pk:
            return self.instance.advisory_sectors.values_list("id", flat=True)
        return []

    class Meta:
        model = AdvisoryService
        fields = [
            "title",
            "service_type",
            "advisory_sectors",
            "service_start_year",
            "company",
            "introduction",
            "description",
            "price_terms",
            "price",
            "client_organizations",
            "is_featured",
            "is_approved",
        ]
        labels = {
            "title": "Гарчиг",
            "service_type": "Төрөл",
            "advisory_sectors": "Салбарууд",
            "service_start_year": "Эхэлсэн он",
            "company": "Байгууллага",
            "introduction": "Танилцуулга",
            "description": "Дэлгэрэнгүй",
            "price_terms": "Үнийн нөхцөл",
            "price": "Үнэ",
            "client_organizations": "Харилцагч байгууллагууд",
            "is_featured": "Онцлох",
            "is_approved": "Нийтлэх зөвшөөрөл",
        }
        widgets = {
            "advisory_sectors": forms.CheckboxSelectMultiple(),
            "introduction": forms.Textarea(attrs={"rows": 3}),
            "description": forms.Textarea(attrs={"rows": 6}),
            "client_organizations": forms.Textarea(attrs={"rows": 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        service_types = AdvisoryServiceType.objects.order_by("sort_order", "name")
        advisory_categories = Category.objects.filter(type=Category.TYPE_ADVISORY).select_related("parent").order_by("parent_id", "sort_order", "name")
        self.fields["service_type"].queryset = service_types
        self.fields["price_terms"].queryset = AdvisoryPriceTerm.objects.order_by("sort_order", "name")
        self.fields["advisory_sectors"].queryset = advisory_categories
        self.fields["company"].queryset = Customer.objects.select_related("user").order_by("name")
        self._apply_widget_classes()

        selected_sectors = self._selected_sector_ids()
        self.fields["advisory_sectors"].tree_nodes = _build_grouped_nodes(advisory_categories, selected_sectors)
        self.fields["advisory_sectors"].tree_input_type = "checkbox"


class ArticleAdminForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = Article
        fields = [
            "title",
            "article_type",
            "organization",
            "published_date",
            "image",
            "description",
            "is_featured",
            "is_approved",
        ]
        labels = {
            "title": "Гарчиг",
            "article_type": "Төрөл",
            "organization": "Байгууллага",
            "published_date": "Нийтэлсэн огноо",
            "image": "Зураг",
            "description": "Дэлгэрэнгүй",
            "is_featured": "Онцлох",
            "is_approved": "Нийтлэх зөвшөөрөл",
        }
        widgets = {
            "published_date": forms.DateInput(attrs={"type": "date"}),
            "description": forms.Textarea(attrs={"rows": 8}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["article_type"].queryset = Category.objects.filter(type=Category.TYPE_ARTICLE).order_by("sort_order", "name")
        self.fields["organization"].queryset = Customer.objects.select_related("user").order_by("name")
        self._apply_widget_classes()


class _UserChoiceField(forms.ModelChoiceField):
    def label_from_instance(self, obj):
        customer = getattr(obj, "customer", None)
        return f"{customer.name} ({obj.username})" if customer else obj.username


class _RatingCommentForm(StyledFormMixin, forms.ModelForm):
    user = _UserChoiceField(label="Хэрэглэгч", queryset=User.objects.select_related("customer").order_by("username"))
    score = forms.IntegerField(label="Үнэлгээ (1–5)", min_value=1, max_value=5, initial=5)
    comment = forms.CharField(label="Сэтгэгдэл", widget=forms.Textarea(attrs={"rows": 5}))

    target_field = ""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            # Засах үед хэнд, юунд бичсэнийг өөрчлөхгүй — зөвхөн сэтгэгдэл, үнэлгээ.
            for name in ("user", self.target_field):
                self.fields[name].disabled = True
        self._apply_widget_classes()


class SoftwareCommentForm(_RatingCommentForm):
    target_field = "software"

    class Meta:
        model = SoftwareRating
        fields = ["software", "user", "score", "comment"]
        labels = {"software": "Програм хангамж"}


class AdvisoryCommentForm(_RatingCommentForm):
    target_field = "advisory_service"

    class Meta:
        model = AdvisoryRating
        fields = ["advisory_service", "user", "score", "comment"]
        labels = {"advisory_service": "Зөвлөх үйлчилгээ"}


class CategoryForm(StyledFormMixin, forms.ModelForm):
    """Програм хангамжийн төрөл, салбар, нийтлэлийн төрлийг админаас удирдах."""

    parent = HierarchicalCategoryChoiceField(queryset=Category.objects.none(), required=False, label="Эцэг ангилал")

    class Meta:
        model = Category
        fields = ["type", "parent", "name", "description", "sort_order", "is_active"]
        labels = {
            "type": "Төрөл",
            "name": "Нэр",
            "description": "Тайлбар",
            "sort_order": "Дараалал",
            "is_active": "Идэвхтэй",
        }
        widgets = {"description": forms.Textarea(attrs={"rows": 3})}

    def __init__(self, *args, fixed_type: str | None = None, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["type"].choices = [
            (Category.TYPE_PROGRAM, "Програм хангамжийн төрөл"),
            (Category.TYPE_ADVISORY, "Салбар"),
            (Category.TYPE_ARTICLE, "Нийтлэлийн төрөл"),
        ]
        category_type = fixed_type or (self.instance.type if self.instance and self.instance.pk else None) or self.data.get(self.add_prefix("type"))
        parents = Category.objects.filter(parent__isnull=True)
        if category_type:
            parents = parents.filter(type=category_type)
        if self.instance and self.instance.pk:
            parents = parents.exclude(pk=self.instance.pk)
        self.fields["parent"].queryset = parents.order_by("type", "sort_order", "name")
        self.fields["parent"].empty_label = "— Үндсэн ангилал —"
        self.fields["parent"].help_text = "Хоосон бол үндсэн (том) ангилал болно."
        if fixed_type:
            self.fields["type"].initial = fixed_type
        self._apply_widget_classes()
        self.fields["description"].widget.attrs["class"] = INPUT_CLASS

    def clean(self):
        cleaned = super().clean()
        parent = cleaned.get("parent")
        category_type = cleaned.get("type")
        if parent and category_type and parent.type != category_type:
            self.add_error("parent", "Эцэг ангилал ижил төрлийнх байх ёстой.")
        if parent and self.instance.pk and self.instance.children.exists():
            self.add_error("parent", "Дэд ангилалтай ангиллыг өөр ангиллын доор оруулах боломжгүй.")
        return cleaned


class AdvisoryServiceTypeForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = AdvisoryServiceType
        fields = ["name", "key", "description", "sort_order", "is_active"]
        labels = {
            "name": "Нэр",
            "key": "Түлхүүр (латин, жижиг үсэг)",
            "description": "Тайлбар",
            "sort_order": "Дараалал",
            "is_active": "Идэвхтэй",
        }
        widgets = {"description": forms.Textarea(attrs={"rows": 3})}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()
        self.fields["description"].widget.attrs["class"] = INPUT_CLASS
        self.fields["key"].help_text = "Холбоос, шүүлтүүрт ашиглагдана. Жишээ: finance"

    def clean_key(self):
        import re

        key = (self.cleaned_data.get("key") or "").strip().lower()
        if not re.fullmatch(r"[a-z0-9_-]+", key):
            raise forms.ValidationError("Зөвхөн латин жижиг үсэг, тоо, '-' болон '_' ашиглана уу.")
        return key


class ProcessSectionForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = ProcessSection
        fields = ["kicker", "title", "cta_text", "cta_button_text", "cta_button_url", "is_active"]
        labels = {
            "kicker": "Дээд гарчиг",
            "title": "Гарчиг",
            "cta_text": "Доод уриалгын бичвэр",
            "cta_button_text": "Товчны бичвэр",
            "cta_button_url": "Товчны холбоос",
            "is_active": "Нүүр хуудсанд харуулах",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()


class ProcessStepForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = ProcessStep
        fields = ["title", "text", "icon", "sort_order", "is_active"]
        labels = {
            "title": "Алхмын гарчиг",
            "text": "Тайлбар",
            "icon": "Дүрс (emoji)",
            "sort_order": "Дараалал",
            "is_active": "Идэвхтэй",
        }
        widgets = {"text": forms.Textarea(attrs={"rows": 3})}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()


class FooterLinkForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = FooterLink
        fields = ["column", "label", "url", "sort_order", "is_active"]
        labels = {
            "column": "Багана",
            "label": "Холбоосын нэр",
            "url": "Холбоос (дэлгэц)",
            "sort_order": "Дугаар / дараалал",
            "is_active": "Идэвхтэй",
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()

    def clean_url(self):
        url = (self.cleaned_data.get("url") or "").strip()
        if not (url.startswith("/") or url.startswith("http://") or url.startswith("https://") or url.startswith("mailto:") or url.startswith("tel:")):
            raise forms.ValidationError("Холбоос '/'-ээр (сайт доторх) эсвэл http(s)://-ээр эхлэх ёстой.")
        return url


class SiteSettingForm(StyledFormMixin, forms.ModelForm):
    class Meta:
        model = SiteSetting
        fields = ["footer_logo", "header_logo", "header_logo_scrolled", "footer_text"]
        widgets = {
            "footer_logo": forms.ClearableFileInput(attrs={"accept": "image/*"}),
            "header_logo": forms.ClearableFileInput(attrs={"accept": "image/*"}),
            "header_logo_scrolled": forms.ClearableFileInput(attrs={"accept": "image/*"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._apply_widget_classes()
        self.fields["footer_text"].help_text = "Хоосон бол өгөгдмөл бичвэр харагдана."

    def _clean_logo(self, name):
        image = self.cleaned_data.get(name)
        if image and hasattr(image, "size") and image.size > 2 * 1024 * 1024:
            raise forms.ValidationError("Логоны хэмжээ 2MB-аас бага байх ёстой.")
        return image

    def clean_footer_logo(self):
        return self._clean_logo("footer_logo")

    def clean_header_logo(self):
        return self._clean_logo("header_logo")

    def clean_header_logo_scrolled(self):
        return self._clean_logo("header_logo_scrolled")

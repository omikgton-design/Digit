from django.db import models
from django.contrib.auth.models import User
from imagekit.models import ImageSpecField
from imagekit.processors import ResizeToFill


class Customer(models.Model):
    ACCOUNT_ORG = "org"
    ACCOUNT_PERSON = "person"
    ACCOUNT_TYPE_CHOICES = [
        (ACCOUNT_ORG, "Organization"),
        (ACCOUNT_PERSON, "Person"),
    ]

    TYPE_GOLD = "gold"
    TYPE_SILVER = "silver"
    TYPE_BRONZE = "bronze"
    TYPE_CHOICES = [
        (TYPE_GOLD, "Gold"),
        (TYPE_SILVER, "Silver"),
        (TYPE_BRONZE, "Bronze"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer")
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="customer_logos/", blank=True, null=True)
    email = models.EmailField(max_length=255)
    phone = models.CharField(max_length=50, blank=True)
    website = models.URLField(max_length=255, blank=True)
    address = models.CharField(max_length=255, blank=True)
    contact_person_name = models.CharField(max_length=255, blank=True)
    contact_person_phone = models.CharField(max_length=50, blank=True)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPE_CHOICES, default=ACCOUNT_ORG)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=TYPE_BRONZE)
    # Байгууллагын регистрийн дугаар: байгууллага регистр + нууц үгээр нэвтэрнэ.
    register_number = models.CharField("Регистрийн дугаар", max_length=20, unique=True, null=True, blank=True)
    # Silver/Gold багцад хэдийг оруулж болохыг админ хэсэгт хэрэглэгч тус бүрээр тохируулна.
    # Хоосон бол өгөгдмөл (Silver: 5, Gold: хязгааргүй). Bronze үргэлж 1/1/1.
    software_limit = models.PositiveIntegerField("Програм хангамжийн хязгаар", null=True, blank=True)
    advisory_limit = models.PositiveIntegerField("Зөвлөх үйлчилгээний хязгаар", null=True, blank=True)
    article_limit = models.PositiveIntegerField("Нийтлэлийн хязгаар", null=True, blank=True)

    def __str__(self):
        return self.name

    def content_limit(self, kind: str = "software") -> int | None:
        """Тухайн багцын төрлөөр нэмж болох контентын дээд хязгаар (None = хязгааргүй).

        kind: "software" | "advisory" | "article"
          Bronze (энгийн): 1 програм хангамж, 1 зөвлөх үйлчилгээ, 1 нийтлэл (тогтмол)
          Silver / Gold:   админ хэсэгт хэрэглэгч тус бүрээр тохируулсан тоо.
                           Тохируулаагүй бол Silver 5 хүртэл, Gold хязгааргүй.
        """
        if self.type == self.TYPE_BRONZE:
            return 1
        configured = {
            "software": self.software_limit,
            "advisory": self.advisory_limit,
            "article": self.article_limit,
        }.get(kind)
        if configured is not None:
            return configured
        return 5 if self.type == self.TYPE_SILVER else None

    def banner_limit(self) -> int:
        """Зөвхөн Gold багцад баннер байршуулах эрх олгоно (2 ширхэг хүртэл)."""
        return 2 if self.type == self.TYPE_GOLD else 0


class CustomerMembershipPayment(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="membership_payments")
    paid_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    membership_type = models.CharField(max_length=10, choices=Customer.TYPE_CHOICES, default=Customer.TYPE_BRONZE)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-paid_date", "-id"]

    def __str__(self):
        when = self.paid_date.strftime("%Y-%m-%d") if self.paid_date else "хүлээгдэж буй"
        return f"{self.customer.name} - {self.get_membership_type_display()} ({when})"


class CustomerBanner(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="banners")
    image = models.ImageField(upload_to="customer_banners/")
    link_url = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-created_date", "id"]

    def __str__(self):
        return f"{self.customer.name} - баннер #{self.pk}"


class FooterMenuContent(models.Model):
    KEY_TOP_SOFTWARE = "top_software"
    KEY_TOP_ADVISORY = "top_advisory"
    KEY_TOP_ARTICLE = "top_article"
    KEY_UPDATE_INFO = "update_info"
    KEY_UPDATE_PRODUCT = "update_product"
    KEY_SUBMIT_ARTICLE = "submit_article"
    KEY_ABOUT = "about"
    KEY_PRICING = "pricing"
    KEY_CONTACT = "contact"
    KEY_CHOICES = [
        (KEY_TOP_SOFTWARE, "Топ программ хангамж"),
        (KEY_TOP_ADVISORY, "Топ зөвлөх үйлчилгээ"),
        (KEY_TOP_ARTICLE, "Топ нийтлэл"),
        (KEY_UPDATE_INFO, "Мэдээлэл шинэчлэх"),
        (KEY_UPDATE_PRODUCT, "Бүтээгдэхүүн шинэчлэх"),
        (KEY_SUBMIT_ARTICLE, "Нийтлэл оруулах"),
        (KEY_ABOUT, "Бидний тухай"),
        (KEY_PRICING, "Үнийн санал"),
        (KEY_CONTACT, "Холбоо барих"),
    ]

    key = models.CharField(max_length=50, choices=KEY_CHOICES, unique=True)
    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to="footer_menu_content/", blank=True, null=True)
    content = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]

    def __str__(self):
        return self.title


class PartnerOrganization(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to="partner_logos/")
    link_url = models.URLField(max_length=500, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name", "id"]

    def __str__(self):
        return self.name


class Slide(models.Model):
    partner_label = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="slides/")
    link_url = models.URLField(max_length=500, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-created_date", "-id"]

    def __str__(self):
        return self.title


class AboutSection(models.Model):
    kicker = models.CharField(max_length=120, default="Бидний тухай")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    feature_title = models.CharField(max_length=255, blank=True)
    feature_text = models.TextField(blank=True)
    button_text = models.CharField(max_length=120, blank=True)
    button_url = models.CharField(max_length=500, blank=True)
    circle_right_text = models.CharField(max_length=120, blank=True)
    circle_left_text = models.CharField(max_length=120, blank=True)
    top_image = models.ImageField(upload_to="about_section/", blank=True, null=True)
    bottom_image = models.ImageField(upload_to="about_section/", blank=True, null=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-created_date", "-id"]

    def __str__(self):
        return self.title


class Category(models.Model):
    TYPE_PROGRAM = "program"
    TYPE_ADVISORY = "advisory"
    TYPE_ARTICLE = "article"
    TYPE_CHOICES = [
        (TYPE_PROGRAM, "Program"),
        (TYPE_ADVISORY, "Advisory"),
        (TYPE_ARTICLE, "Article"),
    ]

    name = models.CharField("Нэр", max_length=255)
    parent = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children", verbose_name="Эцэг ангилал")
    type = models.CharField("Төрөл", max_length=20, choices=TYPE_CHOICES)
    # Админ хэсгээс удирдах: тайлбар, харуулах дараалал, идэвхтэй эсэх.
    description = models.TextField("Тайлбар", blank=True)
    sort_order = models.PositiveIntegerField("Дараалал", default=0)
    is_active = models.BooleanField("Идэвхтэй", default=True)

    class Meta:
        ordering = ["type", "sort_order", "name", "id"]

    def __str__(self):
        return self.name


class AdvisoryServiceType(models.Model):
    key = models.CharField("Түлхүүр", max_length=50, unique=True)
    name = models.CharField("Нэр", max_length=255, unique=True)
    description = models.TextField("Тайлбар", blank=True)
    sort_order = models.PositiveIntegerField("Дараалал", default=0)
    is_active = models.BooleanField("Идэвхтэй", default=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class AdvisoryPriceTerm(models.Model):
    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255, unique=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class Software(models.Model):
    PRICE_TYPE_RENT = "rent"
    PRICE_TYPE_SALE = "sale"
    PRICE_TYPE_CHOICES = [
        (PRICE_TYPE_RENT, "Rent"),
        (PRICE_TYPE_SALE, "Sale"),
    ]

    name = models.CharField(max_length=255)
    development_start_year = models.PositiveSmallIntegerField()
    program_type = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="software_program_types",
        limit_choices_to={"type": Category.TYPE_PROGRAM},
    )
    advisory_sectors = models.ManyToManyField(
        Category,
        related_name="software_advisory_sectors",
        blank=True,
        limit_choices_to={"type": Category.TYPE_ADVISORY},
    )
    developer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="softwares")
    description = models.TextField(blank=True)
    introduction = models.TextField(blank=True)
    price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    price_type = models.CharField(max_length=10, choices=PRICE_TYPE_CHOICES, default=PRICE_TYPE_RENT)
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_softwares")
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SoftwareImage(models.Model):
    software = models.ForeignKey(Software, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="software_images/")
    thumbnail = ImageSpecField(
        source="image",
        processors=[ResizeToFill(350, 250)],
        format="JPEG",
        options={"quality": 85},
    )
    sort_order = models.PositiveIntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.software.name} #{self.id}"


class SoftwareRating(models.Model):
    software = models.ForeignKey(Software, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="software_ratings")
    score = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["software", "user"], name="unique_software_rating"),
        ]
        ordering = ["-update_date"]

    def __str__(self):
        return f"{self.user_id}:{self.software_id}:{self.score}"


class AdvisoryService(models.Model):
    title = models.CharField(max_length=255)
    service_type = models.ForeignKey(AdvisoryServiceType, on_delete=models.PROTECT, related_name="advisory_services")
    advisory_sectors = models.ManyToManyField(
        Category,
        related_name="advisory_service_sectors",
        blank=True,
        limit_choices_to={"type": Category.TYPE_ADVISORY},
    )
    service_start_year = models.PositiveSmallIntegerField(default=2024)
    company = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="advisory_services")
    introduction = models.TextField(blank=True)
    description = models.TextField(blank=True)
    price_terms = models.ForeignKey(AdvisoryPriceTerm, on_delete=models.PROTECT, related_name="advisory_services")
    price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    client_organizations = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_advisory_services")
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class AdvisoryServiceImage(models.Model):
    advisory_service = models.ForeignKey(AdvisoryService, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="advisory_service_images/")
    thumbnail = ImageSpecField(
        source="image",
        processors=[ResizeToFill(350, 250)],
        format="JPEG",
        options={"quality": 85},
    )
    sort_order = models.PositiveIntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return f"{self.advisory_service.title} #{self.id}"


class AdvisoryLike(models.Model):
    advisory_service = models.ForeignKey(AdvisoryService, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="advisory_likes")
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["advisory_service", "user"], name="unique_advisory_like"),
        ]
        ordering = ["-created_date"]

    def __str__(self):
        return f"{self.user_id}:{self.advisory_service_id}"


class AdvisoryRating(models.Model):
    advisory_service = models.ForeignKey(AdvisoryService, on_delete=models.CASCADE, related_name="ratings")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="advisory_ratings")
    score = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["advisory_service", "user"], name="unique_advisory_rating"),
        ]
        ordering = ["-update_date"]

    def __str__(self):
        return f"{self.user_id}:{self.advisory_service_id}:{self.score}"


class Article(models.Model):
    title = models.CharField(max_length=255)
    article_type = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="articles",
        limit_choices_to={"type": Category.TYPE_ARTICLE},
    )
    organization = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name="articles")
    image = models.ImageField(upload_to="article_images/")
    thumbnail = ImageSpecField(
        source="image",
        processors=[ResizeToFill(600, 380)],
        format="JPEG",
        options={"quality": 85},
    )
    published_date = models.DateField()
    description = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="created_articles")
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_date", "-id"]

    def __str__(self):
        return self.title

class SavedSoftware(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="saved_softwares",
    )
    software = models.ForeignKey(
        Software,
        on_delete=models.CASCADE,
        related_name="saved_by_users",
    )
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "software")
        ordering = ["-created_date"]

    def __str__(self):
        return f"{self.user} - {self.software}"

class SavedAdvisory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_advisories")
    advisory_service = models.ForeignKey(AdvisoryService, on_delete=models.CASCADE, related_name="saved_by_users")
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "advisory_service")
        ordering = ["-created_date"]


class SavedArticle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_articles")
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="saved_by_users")
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "article")
        ordering = ["-created_date"]


class ArticleLike(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="likes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="article_likes")
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["article", "user"], name="unique_article_like"),
        ]
        ordering = ["-created_date"]

    def __str__(self):
        return f"{self.user_id}:{self.article_id}"


class SiteSetting(models.Model):
    """Вэбсайтын ерөнхий тохиргоо (ганц мөр). Лого зэргийг админ хэсгээс солино."""

    header_logo = models.ImageField("Толгой хэсгийн лого", upload_to="site_logos/", blank=True, null=True,
                                    help_text="Хоосон бол одоогийн лого харагдана. PNG (тунгалаг дэвсгэртэй) зөвлөмжтэй.")
    header_logo_scrolled = models.ImageField("Толгой хэсгийн лого (гүйлгэсэн үед)", upload_to="site_logos/", blank=True, null=True,
                                             help_text="Цагаан дэвсгэр дээр харагдах хувилбар.")
    footer_logo = models.ImageField("Хөл хэсгийн лого", upload_to="site_logos/", blank=True, null=True,
                                    help_text="Хар дэвсгэр дээр харагдана. Харьцаа нь хадгалагдаж, өндөр нь автоматаар тохирно.")
    footer_text = models.CharField("Хөл хэсгийн тайлбар", max_length=500, blank=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Сайтын тохиргоо"
        verbose_name_plural = "Сайтын тохиргоо"

    def __str__(self):
        return "Сайтын тохиргоо"

    @classmethod
    def load(cls) -> "SiteSetting":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ProcessSection(models.Model):
    """Нүүр хуудасны "Ажлын үе шат" хэсэг (ганц мөр)."""

    kicker = models.CharField("Дээд гарчиг", max_length=120, default="Ажлын үе шат")
    title = models.CharField("Гарчиг", max_length=255, default="3 энгийн алхмаар ажиллах явц")
    cta_text = models.CharField("Доод уриалга", max_length=255, blank=True, default="Танд тохирсон төлөвлөгөөний талаар зөвлөгөө аваарай")
    cta_button_text = models.CharField("Товчны бичвэр", max_length=120, blank=True, default="ХОЛБОГДОХ")
    cta_button_url = models.CharField("Товчны холбоос", max_length=500, blank=True, default="/company#contact")
    is_active = models.BooleanField("Идэвхтэй", default=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Ажлын үе шат"
        verbose_name_plural = "Ажлын үе шат"

    def __str__(self):
        return self.title

    @classmethod
    def load(cls) -> "ProcessSection":
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class ProcessStep(models.Model):
    section = models.ForeignKey(ProcessSection, on_delete=models.CASCADE, related_name="steps")
    icon = models.CharField("Дүрс (emoji)", max_length=16, blank=True, default="🧭")
    title = models.CharField("Гарчиг", max_length=255)
    text = models.TextField("Тайлбар", blank=True)
    sort_order = models.PositiveIntegerField("Дараалал", default=0)
    is_active = models.BooleanField("Идэвхтэй", default=True)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.title


class FooterLink(models.Model):
    COLUMN_USER = "user"
    COLUMN_ORG = "org"
    COLUMN_COMPANY = "company"
    COLUMN_CHOICES = [
        (COLUMN_USER, "Хэрэглэгч"),
        (COLUMN_ORG, "Байгууллага"),
        (COLUMN_COMPANY, "Компани"),
    ]

    column = models.CharField("Багана", max_length=20, choices=COLUMN_CHOICES)
    label = models.CharField("Нэр", max_length=255)
    url = models.CharField("Холбоос", max_length=500,
                           help_text="Сайт доторх хаяг (жишээ: /footer/top_software, /company#about) эсвэл бүтэн URL.")
    sort_order = models.PositiveIntegerField("Дараалал", default=0)
    is_active = models.BooleanField("Идэвхтэй", default=True)
    created_date = models.DateTimeField(auto_now_add=True)
    update_date = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["column", "sort_order", "id"]

    def __str__(self):
        return self.label

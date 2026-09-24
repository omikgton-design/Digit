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

    def __str__(self):
        return self.name

    def content_limit(self) -> int | None:
        if self.type == self.TYPE_BRONZE:
            return 1
        if self.type == self.TYPE_SILVER:
            return 2
        return None


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
        return f"{self.customer.name} - {self.get_membership_type_display()} ({self.paid_date:%Y-%m-%d})"


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

    name = models.CharField(max_length=255)
    parent = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="children")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)

    def __str__(self):
        return self.name


class AdvisoryServiceType(models.Model):
    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255, unique=True)
    sort_order = models.PositiveIntegerField(default=0)

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

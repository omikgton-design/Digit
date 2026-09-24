from django.contrib import admin
from website.models import AboutSection, AdvisoryLike, AdvisoryPriceTerm, AdvisoryService, AdvisoryServiceImage, AdvisoryServiceType, Article, Category, Customer, CustomerMembershipPayment, FooterMenuContent, PartnerOrganization, Slide, Software, SoftwareImage

admin.site.site_header = "Digit Admin"
admin.site.site_title = "Digit Admin"
admin.site.index_title = "Control Panel"


class SoftwareImageInline(admin.TabularInline):
    model = SoftwareImage
    extra = 1
    fields = ("image", "sort_order")


@admin.register(Software)
class SoftwareAdmin(admin.ModelAdmin):
    list_display = ("name", "program_type", "is_approved", "is_featured", "developer", "price", "price_type", "development_start_year", "created_by")
    list_filter = ("is_approved", "is_featured", "price_type", "program_type", "development_start_year")
    search_fields = ("name", "developer__name", "created_by__username", "created_by__email")
    filter_horizontal = ("advisory_sectors",)
    inlines = [SoftwareImageInline]
    list_editable = ("is_approved",)


class AdvisoryServiceImageInline(admin.TabularInline):
    model = AdvisoryServiceImage
    extra = 1
    fields = ("image", "sort_order")


@admin.register(AdvisoryService)
class AdvisoryServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "service_type", "company", "is_approved", "price_terms", "price", "service_start_year", "is_featured", "created_by", "created_date")
    list_filter = ("is_approved", "is_featured", "service_type", "price_terms", "service_start_year")
    search_fields = ("title", "company__name", "created_by__username", "created_by__email")
    filter_horizontal = ("advisory_sectors",)
    inlines = [AdvisoryServiceImageInline]
    list_editable = ("is_approved",)


@admin.register(AdvisoryServiceType)
class AdvisoryServiceTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "sort_order")
    search_fields = ("name", "key")
    ordering = ("sort_order", "name")


@admin.register(AdvisoryPriceTerm)
class AdvisoryPriceTermAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "sort_order")
    search_fields = ("name", "key")
    ordering = ("sort_order", "name")


@admin.register(AdvisoryLike)
class AdvisoryLikeAdmin(admin.ModelAdmin):
    list_display = ("advisory_service", "user", "created_date")
    search_fields = ("advisory_service__title", "user__username", "user__email")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "type", "parent")
    list_filter = ("type",)
    search_fields = ("name",)


class CustomerMembershipPaymentInline(admin.TabularInline):
    model = CustomerMembershipPayment
    extra = 1
    fields = ("paid_date", "end_date", "membership_type")


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "account_type", "type", "created_date")
    list_filter = ("type", "account_type")
    search_fields = ("name", "email")
    inlines = [CustomerMembershipPaymentInline]


@admin.register(CustomerMembershipPayment)
class CustomerMembershipPaymentAdmin(admin.ModelAdmin):
    list_display = ("customer", "paid_date", "end_date", "membership_type", "created_date")
    list_filter = ("membership_type", "paid_date", "end_date")
    search_fields = ("customer__name", "customer__email")


@admin.register(FooterMenuContent)
class FooterMenuContentAdmin(admin.ModelAdmin):
    list_display = ("key", "title", "is_active", "update_date")
    list_filter = ("is_active", "key")
    search_fields = ("title", "content")


@admin.register(PartnerOrganization)
class PartnerOrganizationAdmin(admin.ModelAdmin):
    list_display = ("name", "link_url", "sort_order", "is_active", "update_date")
    list_filter = ("is_active",)
    search_fields = ("name", "link_url")
    list_editable = ("sort_order", "is_active")


@admin.register(Slide)
class SlideAdmin(admin.ModelAdmin):
    list_display = ("title", "partner_label", "sort_order", "is_active", "update_date")
    list_filter = ("is_active",)
    search_fields = ("title", "partner_label", "description")
    list_editable = ("sort_order", "is_active")


@admin.register(AboutSection)
class AboutSectionAdmin(admin.ModelAdmin):
    list_display = ("title", "kicker", "sort_order", "is_active", "update_date")
    list_filter = ("is_active",)
    search_fields = ("title", "description", "feature_title")
    list_editable = ("sort_order", "is_active")


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ("title", "article_type", "organization", "is_approved", "published_date", "is_featured", "created_by")
    list_filter = ("article_type", "is_approved", "is_featured", "published_date")
    search_fields = ("title", "organization__name", "created_by__username", "created_by__email")
    list_editable = ("is_approved",)

from django.contrib import admin
from django.conf.urls.static import static
from django.views.static import serve
from django.shortcuts import redirect
from django.http import HttpResponse
from django.urls import include, path, re_path
from django.conf import settings
from website import api_views

urlpatterns = [
                  path('', lambda request: HttpResponse("Digit API", content_type="text/plain")),
                  path('admin/', include('website.management_urls')),
                  re_path(r"^management/(?P<path>.*)$", lambda request, path: redirect(f"/admin/{path}")),
                  path('django-admin/', admin.site.urls),
                  path('api/csrf/', api_views.csrf, name='api_csrf'),
                  path('api/auth/login/', api_views.login_api, name='api_login'),
                  path('api/auth/signup/', api_views.signup_api, name='api_signup'),
                  path('api/auth/logout/', api_views.logout_api, name='api_logout'),
                  path('api/auth/me/', api_views.me_api, name='api_me'),
                  path('api/auth/password/', api_views.change_password_api, name='api_change_password'),
                  path('api/profile/', api_views.profile_api, name='api_profile'),
                  path('api/profile/logo/', api_views.profile_logo_api, name='api_profile_logo'),
                  path('api/profile/ratings/', api_views.my_ratings_api, name='api_profile_ratings'),
                  path('api/profile/saved-softwares/', api_views.my_saved_softwares_api, name='api_profile_saved_softwares',),
                  path('api/profile/saved-advisories/', api_views.my_saved_advisories_api, name='api_profile_saved_advisories'),
                  path('api/profile/saved-articles/', api_views.my_saved_articles_api, name='api_profile_saved_articles'),
                  path('api/softwares/<int:software_id>/save/', api_views.saved_software_toggle_api, name='api_saved_software_toggle'),
                  path('api/advisories/<int:advisory_id>/save/', api_views.saved_advisory_toggle_api, name='api_saved_advisory_toggle'),
                  path('api/articles/<int:article_id>/save/', api_views.saved_article_toggle_api, name='api_saved_article_toggle'),
                  path('api/categories/', api_views.categories_api, name='api_categories'),
                  path('api/stats/', api_views.public_stats_api, name='api_public_stats'),
                  path('api/partners/', api_views.public_partners_api, name='api_public_partners'),
                  path('api/slides/', api_views.public_slides_api, name='api_public_slides'),
                  path('api/about-section/', api_views.public_about_section_api, name='api_public_about_section'),
                  path('api/footer-contents/<str:key>/', api_views.footer_content_api, name='api_footer_content'),
                  path('api/softwares/featured/', api_views.featured_softwares_api, name='api_featured_softwares'),
                  path('api/advisories/featured/', api_views.featured_advisories_api, name='api_featured_advisories'),
                  path('api/articles/featured/', api_views.featured_articles_api, name='api_featured_articles'),
                  path('api/softwares/<int:software_id>/', api_views.software_detail_api, name='api_software_detail'),
                  path('api/advisories/<int:advisory_id>/', api_views.advisory_detail_api, name='api_advisory_detail'),
                  path('api/articles/<int:article_id>/', api_views.article_detail_api, name='api_article_detail'),
                  path('api/softwares/<int:software_id>/rating/', api_views.software_rating_api, name='api_software_rating'),
                  path('api/advisories/<int:advisory_id>/rating/', api_views.advisory_rating_api, name='api_advisory_rating'),
                  path('api/advisories/<int:advisory_id>/like/', api_views.advisory_like_toggle_api, name='api_advisory_like_toggle'),
                  path('api/softwares/', api_views.softwares_api, name='api_softwares'),
                  path('api/advisories/', api_views.advisories_api, name='api_advisories'),
                  path('api/articles/', api_views.articles_api, name='api_articles'),
                  re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

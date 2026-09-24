from pathlib import Path
import os
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-6r8@$2q5isgw%x#gloim*$_-7wih$oxa&f-hi4r(plo^=o5$%3'
DEBUG = False
ALLOWED_HOSTS = ["129.121.85.178", "localhost", "127.0.0.1"]
INSTALLED_APPS = [
    'whitenoise.runserver_nostatic',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'website',
]
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'digit.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'digit.wsgi.application'
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'digit',
        'USER': 'root',
        'PASSWORD': '12345678',
        'HOST': '127.0.0.1',
        'PORT': '3307'
    }
}
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
LANGUAGE_CODE = 'mn-mn'
TIME_ZONE = 'Asia/Ulaanbaatar'
USE_I18N = True
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MAIN_ROOT = os.path.join(BASE_DIR, '..')
MEDIA_URL = '/media/'
PDF_URL = MEDIA_ROOT + '/pdf/'
STATIC_URL = '/static/'
PROJECT_ROOT = os.path.normpath(os.path.dirname(__file__))
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [
    path for path in [BASE_DIR / "zagvar"] if path.exists()
]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale')
]

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

X_FRAME_OPTIONS = 'SAMEORIGIN'

BASE_URL = os.getenv("BASE_URL", "").strip()
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@example.com")
CSRF_TRUSTED_ORIGINS = [
    "http://129.121.85.178",
    "http://129.121.85.178:5173",
    "https://129.121.85.178",
    "https://129.121.85.178:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if DEBUG:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.sendgrid.net")
    EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "apikey")
    EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "true").lower() == "true"

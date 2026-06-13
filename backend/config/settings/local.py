from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS += [
    'django_extensions',
]

ROOT_URLCONF = 'config.urls'

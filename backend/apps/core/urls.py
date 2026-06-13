from django.urls import path
from .views import health_check, api_root

app_name = 'core'

urlpatterns = [
    path('', api_root, name='api-root'),
    path('health-check/', health_check, name='health-check'),
]
from django.urls import path, include
from django.contrib import admin
from apps.core import views

urlpatterns = [
    # Core app (tenant middleware, API roots)
    path('', include('apps.core.urls')),
    # Admin interface
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/v1/', include('api.v1.urls')),
    # Health check endpoint
    path('health/', views.health_check),
]

# Django REST Framework admin
urlpatterns += [
    path('api-auth/', include('rest_framework.urls')),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, DocumentViewSet, DocumentVersionViewSet

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'versions', DocumentVersionViewSet, basename='documentversion')

urlpatterns = [
    path('', include(router.urls)),
]

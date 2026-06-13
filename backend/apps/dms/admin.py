from django.contrib import admin
from .models import Folder, Document, DocumentVersion


@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'path', 'is_public']
    list_filter = ['is_public']
    search_fields = ['name', 'path']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['name', 'file_type', 'folder', 'file_size', 'version', 'ocr_processed']
    list_filter = ['file_type', 'is_public', 'ocr_processed']
    search_fields = ['name', 'description']
    readonly_fields = ['file_size', 'version']


@admin.register(DocumentVersion)
class DocumentVersionAdmin(admin.ModelAdmin):
    list_display = ['document', 'version_number', 'file_size', 'uploaded_by', 'created_at']
    list_filter = ['version_number', 'created_at']
    search_fields = ['document__name', 'change_notes']
    readonly_fields = ['file_size', 'created_at']

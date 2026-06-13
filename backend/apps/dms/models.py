from django.db import models
from apps.core.models import TenantScopedModel


class Folder(TenantScopedModel):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    path = models.CharField(max_length=1000, blank=True, help_text='Full path to folder')
    description = models.TextField(blank=True)
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ['name']
        verbose_name = 'Folder'
        verbose_name_plural = 'Folders'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.parent:
            self.path = f"{self.parent.path}/{self.name}"
        else:
            self.path = self.name
        super().save(*args, **kwargs)


class Document(TenantScopedModel):
    DOCUMENT_TYPES = [
        ('pdf', 'PDF'),
        ('doc', 'Document'),
        ('image', 'Image'),
        ('spreadsheet', 'Spreadsheet'),
        ('presentation', 'Presentation'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, default='other')
    file_size = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, blank=True)
    folder = models.ForeignKey(Folder, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    description = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    is_public = models.BooleanField(default=False)
    version = models.PositiveIntegerField(default=1)
    storage_path = models.CharField(max_length=1000, blank=True, help_text='S3 or storage path')
    ocr_processed = models.BooleanField(default=False)
    ocr_text = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
            self.mime_type = self.file.content_type if hasattr(self.file, 'content_type') else ''
        super().save(*args, **kwargs)


class DocumentVersion(TenantScopedModel):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='versions')
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to='documents/versions/%Y/%m/')
    file_size = models.BigIntegerField(default=0)
    uploaded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, related_name='uploaded_document_versions')
    change_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        verbose_name = 'Document Version'
        verbose_name_plural = 'Document Versions'
        unique_together = ['document', 'version_number']

    def __str__(self):
        return f"{self.document.name} v{self.version_number}"

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = self.file.size
        super().save(*args, **kwargs)

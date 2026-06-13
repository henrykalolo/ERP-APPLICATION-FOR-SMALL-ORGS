from django.db import models
from django.utils import timezone

class Tenant(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=100, unique=True)
    schema_name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    plan = models.CharField(max_length=50, default='free')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=timezone.now)

    class Meta:
        verbose_name = 'Tenant'
        verbose_name_plural = 'Tenants'

    def __str__(self):
        return self.name
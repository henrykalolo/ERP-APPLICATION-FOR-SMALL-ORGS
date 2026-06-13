from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.conf import settings
from .models import TenantScopedModel

@receiver(pre_save)
def set_tenant_on_save(sender, instance, **kwargs):
    if isinstance(instance, TenantScopedModel) and not instance.tenant_id:
        from django.utils.deprecation import MiddlewareMixin
        from threading import local
        
        _thread_locals = local()
        if hasattr(_thread_locals, 'request'):
            request = _thread_locals.request
            if hasattr(request, 'tenant'):
                instance.tenant = request.tenant

@receiver(post_save)
def audit_log_create(sender, instance, created, **kwargs):
    if isinstance(instance, TenantScopedModel) and created:
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            tenant=instance.tenant,
            user=getattr(instance, 'created_by', None),
            action='CREATE',
            model=sender.__name__,
            object_id=str(instance.pk),
            changes={}
        )

@receiver(post_save)
def audit_log_update(sender, instance, created, **kwargs):
    if isinstance(instance, TenantScopedModel) and not created:
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            tenant=instance.tenant,
            user=getattr(instance, 'updated_by', None),
            action='UPDATE',
            model=sender.__name__,
            object_id=str(instance.pk),
            changes={}
        )

@receiver(post_delete)
def audit_log_delete(sender, instance, **kwargs):
    if isinstance(instance, TenantScopedModel):
        from apps.audit.models import AuditLog
        AuditLog.objects.create(
            tenant=instance.tenant,
            user=getattr(instance, 'deleted_by', None),
            action='DELETE',
            model=sender.__name__,
            object_id=str(instance.pk),
            changes={}
        )
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from django.apps import apps
from apps.core.models import TenantScopedModel
from apps.core.threadlocals import get_current_request


def _get_request():
    return get_current_request()


def _compute_changes(instance, original):
    changes = {}
    if original is None:
        return changes

    for field in instance._meta.fields:
        name = field.name
        new_value = getattr(instance, name)
        old_value = getattr(original, name)
        if new_value != old_value:
            changes[name] = {'from': old_value, 'to': new_value}
    return changes


@receiver(pre_save)
def set_tenant_and_ownership(sender, instance, **kwargs):
    if getattr(sender._meta, 'app_label', '') == 'audit':
        return

    if isinstance(instance, TenantScopedModel):
        request = _get_request()
        if request is not None:
            if not instance.tenant_id and hasattr(request, 'tenant'):
                instance.tenant = request.tenant
            if not getattr(instance, 'created_by', None):
                instance.created_by = request.user if request.user.is_authenticated else None
            if hasattr(request, 'user') and request.user.is_authenticated:
                instance.updated_by = request.user

        if instance.pk:
            try:
                original = sender.objects.get(pk=instance.pk)
                instance._original_values = {field.name: getattr(original, field.name) for field in sender._meta.fields}
            except sender.DoesNotExist:
                instance._original_values = None


@receiver(post_save)
def audit_log_save(sender, instance, created, **kwargs):
    if getattr(sender._meta, 'app_label', '') == 'audit':
        return

    if isinstance(instance, TenantScopedModel):
        AuditLog = apps.get_model('audit', 'AuditLog')
        changes = {}
        if created:
            changes = _compute_changes(instance, None)
            AuditLog.objects.create(
                tenant=instance.tenant,
                user=getattr(instance, 'created_by', None),
                action='CREATE',
                model=sender.__name__,
                object_id=str(instance.pk),
                changes=changes,
            )
        else:
            original_values = getattr(instance, '_original_values', None)
            if original_values:
                changes = {
                    name: {'from': original_values.get(name), 'to': getattr(instance, name)}
                    for name in original_values
                    if getattr(instance, name) != original_values.get(name)
                }
            AuditLog.objects.create(
                tenant=instance.tenant,
                user=getattr(instance, 'updated_by', None) or getattr(instance, 'created_by', None),
                action='UPDATE',
                model=sender.__name__,
                object_id=str(instance.pk),
                changes=changes,
            )


@receiver(post_delete)
def audit_log_delete(sender, instance, **kwargs):
    if getattr(sender._meta, 'app_label', '') == 'audit':
        return

    if isinstance(instance, TenantScopedModel):
        AuditLog = apps.get_model('audit', 'AuditLog')
        AuditLog.objects.create(
            tenant=instance.tenant,
            user=getattr(instance, 'deleted_by', None) or getattr(instance, 'updated_by', None) or getattr(instance, 'created_by', None),
            action='DELETE',
            model=sender.__name__,
            object_id=str(instance.pk),
            changes={},
        )

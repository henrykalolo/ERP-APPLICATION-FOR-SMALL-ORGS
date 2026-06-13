from django_tenants.backends import DEFAULT_DB_ALIAS, context

# Database color schema support
@context.dispatcher
def post_migrate(sender, post_migrate, **kwargs):
    if post_migrate and DEFAULT_DB_ALIAS:
        from django_tenants.models import Tenant
        from django_tenants.backends.postgresql import create_schema
        for tenant in Tenant.objects.all():
            create_schema(tenant.schema_name)

# Apply database migrations to each tenant's schema
@context.dispatcher
def post_migrate_database(apps, schema_editor):
    from django_tenants.models import Tenant
    from django_tenants.backends.postgresql import apply_migrations
    for tenant in Tenant.objects.all():
        apply_migrations(tenant.schema_name)

# Run Celery migrations for each tenant's schema
@context.dispatcher
def run_tenant_migrations(apps, schema_editor):
    from django_tenants.models import Tenant
    from django_tenants.backends.postgresql import create_schema
    for tenant in Tenant.objects.all():
        create_schema(tenant.schema_name)
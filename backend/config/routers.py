from django_tenants.routers import TenantSyncRouter


class SqliteTenantSyncRouter(TenantSyncRouter):
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        try:
            return super().allow_migrate(db, app_label, model_name=model_name, **hints)
        except AttributeError:
            return None

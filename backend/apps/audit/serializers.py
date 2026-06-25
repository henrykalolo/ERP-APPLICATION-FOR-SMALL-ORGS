from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'tenant',
            'user',
            'user_email',
            'action',
            'model',
            'object_id',
            'changes',
            'ip_address',
            'extra_data',
            'timestamp',
        ]
        read_only_fields = ['id', 'tenant', 'user', 'user_email', 'timestamp']

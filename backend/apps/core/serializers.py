from rest_framework import serializers
from .models import TenantScopedModel, TimeStampedModel

class TenantScopedSerializer(serializers.ModelSerializer):
    class Meta:
        abstract = True

    def create(self, validated_data):
        validated_data['tenant'] = self.context['request'].tenant
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data['updated_by'] = self.context['request'].user
        return super().update(instance, validated_data)

class TimeStampedSerializer(serializers.ModelSerializer):
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    class Meta:
        abstract = True
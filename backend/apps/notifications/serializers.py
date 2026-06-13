from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    recipient_email = serializers.EmailField(source='recipient.email', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'recipient_email', 'title', 'message', 'notification_type', 
                  'is_read', 'read_at', 'action_url', 'metadata', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = NotificationPreference
        fields = ['id', 'user', 'user_email', 'email_notifications', 'push_notifications', 
                  'in_app_notifications', 'digest_frequency', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at']

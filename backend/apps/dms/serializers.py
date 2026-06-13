from rest_framework import serializers
from .models import Folder, Document, DocumentVersion


class FolderSerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    children_count = serializers.IntegerField(source='children.count', read_only=True)
    documents_count = serializers.IntegerField(source='documents.count', read_only=True)

    class Meta:
        model = Folder
        fields = ['id', 'name', 'parent', 'parent_name', 'path', 'description', 
                  'is_public', 'children_count', 'documents_count', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'path']


class DocumentSerializer(serializers.ModelSerializer):
    folder_name = serializers.CharField(source='folder.name', read_only=True)
    folder_path = serializers.CharField(source='folder.path', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ['id', 'name', 'file', 'file_url', 'file_type', 'file_size', 
                  'mime_type', 'folder', 'folder_name', 'folder_path', 'description', 
                  'tags', 'is_public', 'version', 'storage_path', 'ocr_processed', 
                  'ocr_text', 'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'file_size', 'version']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class DocumentVersionSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = DocumentVersion
        fields = ['id', 'document', 'version_number', 'file', 'file_url', 'file_size', 
                  'uploaded_by', 'uploaded_by_email', 'change_notes', 'created_at', 
                  'tenant', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tenant', 'created_at', 'updated_at', 'file_size']

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

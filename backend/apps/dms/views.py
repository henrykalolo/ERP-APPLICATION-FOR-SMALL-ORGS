from uuid import uuid4
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.files.uploadedfile import UploadedFile
from apps.core.views import BaseModelViewSet
from .models import Folder, Document, DocumentVersion
from .serializers import FolderSerializer, DocumentSerializer, DocumentVersionSerializer
from .tasks import process_ocr


class FolderViewSet(BaseModelViewSet):
    queryset = Folder.objects.all()
    serializer_class = FolderSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        parent = self.request.query_params.get('parent')
        
        if parent:
            queryset = queryset.filter(parent_id=parent)
            
        return queryset.select_related('parent')

    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        folder = self.get_object()
        folders = folder.children.all()
        documents = folder.documents.all()
        
        folders_serializer = FolderSerializer(folders, many=True)
        documents_serializer = DocumentSerializer(documents, many=True)
        
        return Response({
            'folders': folders_serializer.data,
            'documents': documents_serializer.data
        })


class DocumentViewSet(BaseModelViewSet):
    queryset = Document.objects.select_related('folder').all()
    serializer_class = DocumentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        folder = self.request.query_params.get('folder')
        file_type = self.request.query_params.get('file_type')
        tags = self.request.query_params.get('tags')
        
        if folder:
            queryset = queryset.filter(folder_id=folder)
        if file_type:
            queryset = queryset.filter(file_type=file_type)
        if tags:
            queryset = queryset.filter(tags__contains=tags)
            
        return queryset

    def perform_create(self, serializer):
        document = serializer.save()
        # Trigger OCR processing for supported file types
        if document.file_type in ['pdf', 'doc', 'image']:
            process_ocr.delay(document.id)

    @action(detail=True, methods=['post'])
    def upload_version(self, request, pk=None):
        document = self.get_object()
        file = request.FILES.get('file')
        change_notes = request.data.get('change_notes', '')
        
        if not file:
            return Response({'error': 'File is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get next version number
        last_version = document.versions.order_by('-version_number').first()
        next_version = (last_version.version_number + 1) if last_version else 1
        
        # Create new version
        document_version = DocumentVersion.objects.create(
            document=document,
            version_number=next_version,
            file=file,
            uploaded_by=request.user,
            change_notes=change_notes,
            tenant=request.tenant,
            created_by=request.user
        )
        
        # Update document version
        document.version = next_version
        document.file = file
        document.save()
        
        return Response({'message': 'Document version uploaded successfully', 'version': next_version})

    @action(detail=False, methods=['post'])
    def upload_url(self, request):
        file = request.FILES.get('file')
        name = request.data.get('name') or (file.name if file else None)
        if not name:
            return Response({'error': 'Document name is required'}, status=status.HTTP_400_BAD_REQUEST)

        folder_id = request.data.get('folder')
        folder = None
        if folder_id:
            try:
                folder = Folder.objects.get(id=folder_id, tenant=request.tenant)
            except Folder.DoesNotExist:
                return Response({'error': 'Folder not found'}, status=status.HTTP_404_NOT_FOUND)

        storage_path = f"tenant_{request.tenant.id}/documents/{uuid4().hex}-{file.name if file else name}"
        return Response({
            'upload_url': request.build_absolute_uri('/api/v1/dms/documents/upload/'),
            'storage_path': storage_path,
            'folder': folder.id if folder else None,
            'name': name,
            'file_type': request.data.get('file_type', 'other'),
        })

    @action(detail=False, methods=['post'])
    def upload(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'File is required'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['file'] = file
        data.setdefault('name', file.name)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['get'])
    def download_url(self, request, pk=None):
        document = self.get_object()
        if not document.file:
            return Response({'error': 'Document file is not available'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'download_url': request.build_absolute_uri(document.file.url)})

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        document = self.get_object()
        folder_id = request.data.get('folder_id')
        
        if folder_id:
            try:
                folder = Folder.objects.get(id=folder_id, tenant=request.tenant)
                document.folder = folder
                document.save()
                return Response({'message': 'Document moved successfully'})
            except Folder.DoesNotExist:
                return Response({'error': 'Folder not found'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'error': 'folder_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        documents = Document.objects.filter(
            tenant=request.tenant,
            name__icontains=query
        ).select_related('folder')
        
        page = self.paginate_queryset(documents)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(documents, many=True)
        return Response(serializer.data)


class DocumentVersionViewSet(BaseModelViewSet):
    queryset = DocumentVersion.objects.select_related('document', 'uploaded_by').all()
    serializer_class = DocumentVersionSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        document = self.request.query_params.get('document')
        
        if document:
            queryset = queryset.filter(document_id=document)
            
        return queryset

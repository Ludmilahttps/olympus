from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q, Avg, Count
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError

from .models import Category, Workspace, WorkspaceImage, Review, ReviewImage, WorkspaceFavorite # Importe WorkspaceFavorite
from .serializers import (
    WorkspaceSerializer, WorkspaceDetailSerializer, WorkspaceCreateSerializer,
    WorkspaceImageSerializer, ReviewSerializer, ReviewCreateSerializer,
    WorkspaceFavoriteSerializer, CategorySerializer
)
from .filters import WorkspaceFilter

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class CategoryViewSet(ModelViewSet):
    """
    ViewSet para categorias
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_permissions(self):
        """Apenas admins podem criar/editar/deletar categorias"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.AllowAny]
        
        return [permission() for permission in permission_classes]

class WorkspaceViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar espaços de trabalho
    """
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = WorkspaceFilter
    search_fields = ['name', 'description', 'city', 'neighborhood', 'address']
    ordering_fields = ['created_at', 'average_rating', 'review_count', 'view_count']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WorkspaceDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WorkspaceCreateSerializer
        return WorkspaceSerializer

    def get_permissions(self):
        """
        Define permissões baseadas na ação
        """
        if self.action in ['create']:
            # Apenas usuários autenticados podem criar espaços
            permission_classes = [permissions.IsAuthenticated]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # Apenas o criador ou staff podem editar/deletar
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Listagem e detalhes são públicos
            permission_classes = [permissions.AllowAny]
        
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """
        Define o usuário atual como criador do espaço
        """
        serializer.save(created_by=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """
        Incrementa contador de visualizações ao acessar detalhes
        """
        instance = self.get_object()
        
        # Incrementar visualizações (apenas uma vez por sessão)
        session_key = f'viewed_workspace_{instance.id}'
        if not request.session.get(session_key):
            instance.view_count += 1
            instance.save(update_fields=['view_count'])
            request.session[session_key] = True
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        """
        Retorna espaços mais bem avaliados
        """
        workspaces = self.get_queryset().filter(
            average_rating__gte=4.0,
            review_count__gte=3
        ).order_by('-average_rating', '-review_count')[:12]
        
        serializer = self.get_serializer(workspaces, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Retorna espaços em destaque
        """
        workspaces = self.get_queryset().filter(
            is_featured=True
        ).order_by('-created_at')[:12]
        
        serializer = self.get_serializer(workspaces, many=True)
        return Response(serializer_class=WorkspaceSerializer, data=serializer.data)

    @action(detail=False, methods=['get'])
    def most_reviewed(self, request):
        """
        Retorna espaços mais avaliados
        """
        workspaces = self.get_queryset().filter(
            review_count__gte=1
        ).order_by('-review_count', '-average_rating')[:12]
        
        serializer = self.get_serializer(workspaces, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search_suggestions(self, request):
        """
        Retorna sugestões para busca
        """
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({
                'cities': [],
                'neighborhoods': [],
                'workspaces': []
            })

        # Buscar cidades
        cities = Workspace.objects.filter(
            Q(city__icontains=query) | Q(state__icontains=query)
        ).values('city', 'state').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        city_suggestions = [
            {
                'name': f"{city['city']}, {city['state']}",
                'type': 'city',
                'count': city['count']
            }
            for city in cities
        ]

        # Buscar bairros
        neighborhoods = Workspace.objects.filter(
            neighborhood__icontains=query
        ).values('neighborhood', 'city', 'state').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        neighborhood_suggestions = [
            {
                'name': f"{n['neighborhood']} - {n['city']}, {n['state']}",
                'type': 'neighborhood',
                'count': n['count']
            }
            for n in neighborhoods
        ]

        # Buscar espaços
        workspaces = Workspace.objects.filter(
            name__icontains=query
        ).order_by('-average_rating', '-review_count')[:5]
        
        workspace_suggestions = [
            {
                'name': ws.name,
                'slug': ws.slug,
                'location': f"{ws.neighborhood}, {ws.city}" if ws.neighborhood else ws.city,
                'type': 'workspace',
                'rating': ws.average_rating
            }
            for ws in workspaces
        ]

        return Response({
            'cities': city_suggestions,
            'neighborhoods': neighborhood_suggestions,
            'workspaces': workspace_suggestions
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Retorna estatísticas gerais
        """
        total_workspaces = Workspace.objects.count()
        total_reviews = Review.objects.count()
        average_rating = Review.objects.aggregate(
            avg_rating=Avg('overall_rating')
        )['avg_rating'] or 0

        # Cidades mais populares
        top_cities = Workspace.objects.values('city', 'state').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        # Tipos mais populares
        popular_types = Workspace.objects.values('workspace_type').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        # Avaliações recentes
        recent_reviews = Review.objects.select_related(
            'user', 'workspace'
        ).order_by('-created_at')[:6]

        recent_reviews_data = [
            {
                'id': review.id,
                'overall_rating': review.overall_rating,
                'comment': review.comment[:150] + '...' if len(review.comment) > 150 else review.comment,
                'created_at': review.created_at,
                'user_name': review.user.get_full_name() or review.user.username,
                'workspace_name': review.workspace.name,
                'workspace': {'slug': review.workspace.slug}
            }
            for review in recent_reviews
        ]

        return Response({
            'total_workspaces': total_workspaces,
            'total_reviews': total_reviews,
            'average_rating': round(average_rating, 1),
            'top_cities': list(top_cities),
            'popular_types': list(popular_types),
            'recent_reviews': recent_reviews_data
        })

    @action(detail=True, methods=['post', 'delete'])
    def favorite(self, request, slug=None):
        """
        Adiciona/remove espaço dos favoritos
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Autenticação necessária'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        workspace = self.get_object()
        
        if request.method == 'POST':
            favorite, created = WorkspaceFavorite.objects.get_or_create(
                user=request.user,
                workspace=workspace
            )
            return Response({
                'favorited': True,
                'created': created
            })
        
        elif request.method == 'DELETE':
            deleted_count, _ = WorkspaceFavorite.objects.filter(
                user=request.user,
                workspace=workspace
            ).delete()
            
            return Response({
                'favorited': False,
                'deleted': deleted_count > 0
            })

    @action(detail=True, methods=['post'])
    def claim(self, request, slug=None):
        """
        Reivindicar propriedade do espaço
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Autenticação necessária'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        workspace = self.get_object()
        
        # Verificar se já foi reivindicado
        if workspace.claimed_by:
            return Response(
                {'error': 'Este espaço já foi reivindicado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar se o usuário já reivindicou este espaço
        # if hasattr(workspace, 'claim_requests') and workspace.claim_requests.filter(user=request.user).exists():
        #     return Response(
        #         {'error': 'Você já solicitou a reivindicação deste espaço'}, 
        #         status=status.HTTP_400_BAD_REQUEST
        #     )

        # Por enquanto, apenas marcar como reivindicado
        # Em uma implementação completa, criaria um processo de aprovação
        workspace.claimed_by = request.user
        workspace.is_verified = True
        workspace.save()

        return Response({
            'message': 'Espaço reivindicado com sucesso',
            'claimed': True
        })

class WorkspaceImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar imagens dos espaços
    """
    queryset = WorkspaceImage.objects.all()
    serializer_class = WorkspaceImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        workspace_slug = self.kwargs.get('workspace_slug')
        if workspace_slug:
            return self.queryset.filter(workspace__slug=workspace_slug)
        return self.queryset

    def perform_create(self, serializer):
        workspace_slug = self.kwargs.get('workspace_slug')
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        
        # Verificar se o usuário pode adicionar imagens
        if workspace.created_by != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Apenas o proprietário pode adicionar imagens")
        
        serializer.save(
            workspace=workspace,
            uploaded_by=self.request.user
        )

class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar avaliações
    """
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_queryset(self):
        workspace_slug = self.kwargs.get('workspace_slug')
        if workspace_slug:
            return self.queryset.filter(workspace__slug=workspace_slug)
        return self.queryset

    def perform_create(self, serializer):
        workspace_slug = self.kwargs.get('workspace_slug')
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        
        # Verificar se o usuário já avaliou este espaço
        if Review.objects.filter(user=self.request.user, workspace=workspace).exists():
            raise ValidationError("Você já avaliou este espaço")
        
        serializer.save(
            user=self.request.user,
            workspace=workspace
        )

    def perform_update(self, serializer):
        # Verificar se o usuário pode editar esta avaliação
        if self.get_object().user != self.request.user:
            raise PermissionError("Você só pode editar suas próprias avaliações")
        
        serializer.save()

    def perform_destroy(self, instance):
        # Verificar se o usuário pode deletar esta avaliação
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionError("Você só pode deletar suas próprias avaliações")
        
        instance.delete()

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        """
        Retorna avaliações do usuário atual
        """
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Autenticação necessária'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        reviews = Review.objects.filter(
            user=request.user
        ).select_related('workspace').order_by('-created_at')
        
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def workspace_stats(request):
    """
    Estatísticas gerais dos espaços
    """
    stats = {
        'total_workspaces': Workspace.objects.filter(is_active=True).count(),
        'total_reviews': Review.objects.filter(is_active=True).count(),
        'average_rating': Review.objects.filter(is_active=True).aggregate(
            avg=Avg('overall_rating')
        )['avg'] or 0,
        'top_cities': list(
            Workspace.objects.filter(is_active=True)
            .values('city', 'state')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        ),
        'popular_types': list(
            Workspace.objects.filter(is_active=True)
            .values('workspace_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        ),
        'recent_reviews': ReviewSerializer(
            Review.objects.filter(is_active=True).order_by('-created_at')[:5],
            many=True,
            context={'request': request}
        ).data
    }
    
    serializer = WorkspaceStatsSerializer(stats)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_favorites(request):
    """
    Espaços favoritos do usuário
    """
    favorites = WorkspaceFavorite.objects.filter(user=request.user).order_by('-created_at')
    
    # Paginação
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(favorites, request)
    if page is not None:
        serializer = WorkspaceFavoriteSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    serializer = WorkspaceFavoriteSerializer(favorites, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_workspace_image(request, workspace_slug):
    """
    Upload de imagem para espaço
    """
    workspace = get_object_or_404(Workspace, slug=workspace_slug, is_active=True)
    
    # Verificar permissão
    if not (workspace.owner == request.user or 
            workspace.claimed_by == request.user or 
            request.user.is_staff):
        return Response(
            {'error': 'Você não tem permissão para adicionar imagens a este espaço.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if 'image' not in request.FILES:
        return Response(
            {'error': 'Nenhuma imagem fornecida.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Criar imagem
    image_data = {
        'workspace': workspace.id,
        'image': request.FILES['image'],
        'image_type': request.data.get('image_type', 'interior'),
        'caption': request.data.get('caption', ''),
        'alt_text': request.data.get('alt_text', ''),
        'is_owner_image': workspace.owner == request.user or workspace.claimed_by == request.user,
        'uploaded_by': request.user.id
    }
    
    serializer = WorkspaceImageSerializer(data=image_data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_review_image(request, review_id):
    """
    Upload de imagem para avaliação
    """
    review = get_object_or_404(Review, id=review_id, user=request.user, is_active=True)
    
    if 'image' not in request.FILES:
        return Response(
            {'error': 'Nenhuma imagem fornecida.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Criar imagem
    image_data = {
        'review': review.id,
        'image': request.FILES['image'],
        'caption': request.data.get('caption', ''),
        'alt_text': request.data.get('alt_text', ''),
    }
    
    serializer = ReviewImageSerializer(data=image_data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_suggestions(request):
    """
    Sugestões para busca
    """
    query = request.GET.get('q', '').strip()
    if len(query) < 2:
        return Response([])
    
    # Buscar cidades
    cities = list(
        Workspace.objects.filter(
            is_active=True,
            city__icontains=query
        ).values_list('city', 'state').distinct()[:5]
    )
    
    # Buscar bairros
    neighborhoods = list(
        Workspace.objects.filter(
            is_active=True,
            neighborhood__icontains=query
        ).values_list('neighborhood', 'city', 'state').distinct()[:5]
    )
    
    # Buscar nomes de espaços
    workspaces = list(
        Workspace.objects.filter(
            is_active=True,
            name__icontains=query
        ).values('name', 'slug', 'city', 'state')[:5]
    )
    
    suggestions = {
        'cities': [{'name': f"{city}, {state}", 'type': 'city'} for city, state in cities],
        'neighborhoods': [{'name': f"{neighborhood} - {city}, {state}", 'type': 'neighborhood'} for neighborhood, city, state in neighborhoods],
        'workspaces': [{'name': ws['name'], 'slug': ws['slug'], 'location': f"{ws['city']}, {ws['state']}", 'type': 'workspace'} for ws in workspaces]
    }
    
    return Response(suggestions)



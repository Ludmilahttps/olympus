import django_filters
from django.db.models import Q
from .models import Workspace, Category

class WorkspaceFilter(django_filters.FilterSet):
    """
    Filtros para busca de espaços de trabalho
    """
    # Filtros de localização
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    state = django_filters.CharFilter(field_name='state', lookup_expr='icontains')
    neighborhood = django_filters.CharFilter(field_name='neighborhood', lookup_expr='icontains')
    
    # Filtros de tipo e categoria
    workspace_type = django_filters.ChoiceFilter(choices=Workspace.WORKSPACE_TYPES)
    categories = django_filters.ModelMultipleChoiceFilter(
        queryset=Category.objects.filter(is_active=True),
        field_name='categories',
        conjoined=False  # OR logic
    )
    
    # Filtros de preço
    price_range = django_filters.ChoiceFilter(choices=Workspace.PRICE_RANGES)
    min_daily_price = django_filters.NumberFilter(field_name='daily_price', lookup_expr='gte')
    max_daily_price = django_filters.NumberFilter(field_name='daily_price', lookup_expr='lte')
    min_hourly_price = django_filters.NumberFilter(field_name='hourly_price', lookup_expr='gte')
    max_hourly_price = django_filters.NumberFilter(field_name='hourly_price', lookup_expr='lte')
    
    # Filtros de avaliação
    min_rating = django_filters.NumberFilter(method='filter_min_rating')
    has_reviews = django_filters.BooleanFilter(method='filter_has_reviews')
    
    # Filtros de status
    verified = django_filters.BooleanFilter(field_name='is_verified')
    featured = django_filters.BooleanFilter(field_name='is_featured')
    
    # Filtros de comodidades
    amenities = django_filters.CharFilter(method='filter_amenities')
    
    # Busca geral
    search = django_filters.CharFilter(method='filter_search')
    
    class Meta:
        model = Workspace
        fields = [
            'city', 'state', 'neighborhood', 'workspace_type', 
            'categories', 'price_range', 'verified', 'featured'
        ]
    
    def filter_min_rating(self, queryset, name, value):
        """Filtrar por avaliação mínima"""
        if value:
            # Usar subquery para filtrar por média de avaliações
            from django.db.models import Avg
            return queryset.annotate(
                avg_rating=Avg('reviews__overall_rating')
            ).filter(avg_rating__gte=value)
        return queryset
    
    def filter_has_reviews(self, queryset, name, value):
        """Filtrar espaços que têm ou não têm avaliações"""
        if value is True:
            return queryset.filter(reviews__isnull=False).distinct()
        elif value is False:
            return queryset.filter(reviews__isnull=True)
        return queryset
    
    def filter_amenities(self, queryset, name, value):
        """Filtrar por comodidades específicas"""
        if value:
            amenities_list = [amenity.strip() for amenity in value.split(',')]
            q_objects = Q()
            for amenity in amenities_list:
                q_objects |= Q(amenities__icontains=amenity)
            return queryset.filter(q_objects)
        return queryset
    
    def filter_search(self, queryset, name, value):
        """Busca geral por nome, cidade, bairro ou descrição"""
        if value:
            return queryset.filter(
                Q(name__icontains=value) |
                Q(city__icontains=value) |
                Q(state__icontains=value) |
                Q(neighborhood__icontains=value) |
                Q(description__icontains=value) |
                Q(address__icontains=value)
            ).distinct()
        return queryset
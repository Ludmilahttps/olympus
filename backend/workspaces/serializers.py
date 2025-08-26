# Caminho: olympus-backend/workspaces/serializers.py
# ADICIONE este serializer ao arquivo existente

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Workspace, WorkspaceImage, Review, ReviewImage, 
    WorkspaceFavorite, Category, WorkspaceView
)

User = get_user_model()

class WorkspaceFavoriteSerializer(serializers.ModelSerializer):
    """
    Serializer para favoritos de espaços de trabalho
    """
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    workspace_slug = serializers.CharField(source='workspace.slug', read_only=True)
    workspace_city = serializers.CharField(source='workspace.city', read_only=True)
    workspace_state = serializers.CharField(source='workspace.state', read_only=True)
    workspace_type = serializers.CharField(source='workspace.get_workspace_type_display', read_only=True)
    workspace_average_rating = serializers.FloatField(source='workspace.average_rating', read_only=True)
    workspace_review_count = serializers.IntegerField(source='workspace.review_count', read_only=True)
    
    class Meta:
        model = WorkspaceFavorite
        fields = [
            'id', 'workspace', 'created_at',
            'workspace_name', 'workspace_slug', 'workspace_city', 
            'workspace_state', 'workspace_type', 'workspace_average_rating',
            'workspace_review_count'
        ]
        read_only_fields = ['id', 'created_at']

class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorias
    """
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 
            'color', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class WorkspaceImageSerializer(serializers.ModelSerializer):
    """
    Serializer para imagens dos espaços
    """
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = WorkspaceImage
        fields = [
            'id', 'image', 'image_type', 'caption', 'alt_text',
            'is_owner_image', 'uploaded_by', 'uploaded_by_name',
            'is_active', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'uploaded_by_name', 'created_at']

class ReviewImageSerializer(serializers.ModelSerializer):
    """
    Serializer para imagens das avaliações
    """
    class Meta:
        model = ReviewImage
        fields = [
            'id', 'image', 'caption', 'alt_text', 
            'is_active', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer para leitura de avaliações
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_avatar = serializers.ImageField(source='user.avatar', read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    workspace_slug = serializers.CharField(source='workspace.slug', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'overall_rating', 'wifi_quality', 'power_outlets',
            'noise_level', 'comfort', 'location', 'value_for_money',
            'food_quality', 'service_quality', 'comment', 'visit_date',
            'visit_purpose', 'is_active', 'is_verified', 'created_at',
            'updated_at', 'user_name', 'user_avatar', 'images',
            'workspace_name', 'workspace_slug'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'user_name', 
            'user_avatar', 'workspace_name', 'workspace_slug'
        ]

class ReviewCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação/edição de avaliações
    """
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
        max_length=10  # Máximo 10 imagens por avaliação
    )
    
    class Meta:
        model = Review
        fields = [
            'overall_rating', 'wifi_quality', 'power_outlets',
            'noise_level', 'comfort', 'location', 'value_for_money',
            'food_quality', 'service_quality', 'comment', 'visit_date',
            'visit_purpose', 'images'
        ]
    
    def validate_overall_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("A avaliação deve estar entre 1 e 5 estrelas.")
        return value
    
    def validate_images(self, value):
        """Validar imagens enviadas"""
        if len(value) > 10:
            raise serializers.ValidationError("Máximo de 10 imagens por avaliação.")
        
        for image in value:
            # Validar tamanho (5MB máximo)
            if image.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Cada imagem deve ter no máximo 5MB.")
            
            # Validar tipo
            if not image.content_type.startswith('image/'):
                raise serializers.ValidationError("Apenas arquivos de imagem são permitidos.")
        
        return value
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        review = Review.objects.create(**validated_data)
        
        # Criar imagens da avaliação
        for i, image_data in enumerate(images_data):
            ReviewImage.objects.create(
                review=review,
                image=image_data,
                order=i
            )
        
        return review
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        
        # Atualizar campos da avaliação
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Se novas imagens foram enviadas, substituir as existentes
        if images_data is not None:
            # Deletar imagens existentes
            instance.images.all().delete()
            
            # Criar novas imagens
            for i, image_data in enumerate(images_data):
                ReviewImage.objects.create(
                    review=instance,
                    image=image_data,
                    order=i
                )
        
        return instance

class WorkspaceSerializer(serializers.ModelSerializer):
    """
    Serializer básico para listagem de espaços
    """
    categories = CategorySerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Workspace
        fields = [
            'id', 'name', 'slug', 'description', 'workspace_type',
            'city', 'state', 'neighborhood', 'price_range',
            'daily_price', 'hourly_price', 'amenities', 'categories',
            'main_image', 'average_rating', 'review_count',
            'is_favorited', 'is_featured', 'is_verified',
            'view_count', 'created_at'
        ]
    
    def get_main_image(self, obj):
        """Retorna a imagem principal do espaço"""
        main_image = obj.images.filter(is_active=True).first()
        if main_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(main_image.image.url)
        return None
    
    def get_is_favorited(self, obj):
        """Verifica se o espaço está nos favoritos do usuário atual"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return WorkspaceFavorite.objects.filter(
                user=request.user,
                workspace=obj
            ).exists()
        return False

class WorkspaceDetailSerializer(WorkspaceSerializer):
    """
    Serializer detalhado para visualização individual
    """
    images = WorkspaceImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    detailed_ratings = serializers.ReadOnlyField()
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta(WorkspaceSerializer.Meta):
        fields = WorkspaceSerializer.Meta.fields + [
            'address', 'country', 'postal_code', 'latitude', 'longitude',
            'phone', 'email', 'website', 'instagram', 'facebook',
            'opening_hours', 'owner', 'owner_name', 'created_by_name',
            'is_claimed', 'claim_date', 'images', 'reviews',
            'detailed_ratings', 'updated_at'
        ]

class WorkspaceCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação/edição de espaços
    """
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True,
        max_length=20  # Máximo 20 imagens
    )
    categories = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        many=True,
        required=False
    )
    
    class Meta:
        model = Workspace
        fields = [
            'name', 'description', 'workspace_type', 'categories',
            'address', 'city', 'state', 'country', 'neighborhood',
            'postal_code', 'latitude', 'longitude', 'phone', 'email',
            'website', 'instagram', 'facebook', 'opening_hours',
            'price_range', 'daily_price', 'hourly_price', 'amenities',
            'images'
        ]
    
    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("O nome deve ter pelo menos 3 caracteres.")
        return value.strip()
    
    def validate_description(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError("A descrição deve ter pelo menos 20 caracteres.")
        return value.strip()
    
    def validate_images(self, value):
        """Validar imagens enviadas"""
        if len(value) > 20:
            raise serializers.ValidationError("Máximo de 20 imagens por espaço.")
        
        for image in value:
            # Validar tamanho (5MB máximo)
            if image.size > 5 * 1024 * 1024:
                raise serializers.ValidationError("Cada imagem deve ter no máximo 5MB.")
            
            # Validar tipo
            if not image.content_type.startswith('image/'):
                raise serializers.ValidationError("Apenas arquivos de imagem são permitidos.")
        
        return value
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        categories_data = validated_data.pop('categories', [])
        
        # Gerar slug único
        from django.utils.text import slugify
        import uuid
        
        base_slug = slugify(validated_data['name'])
        slug = base_slug
        counter = 1
        
        while Workspace.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        validated_data['slug'] = slug
        
        # Criar espaço
        workspace = Workspace.objects.create(**validated_data)
        
        # Adicionar categorias
        if categories_data:
            workspace.categories.set(categories_data)
        
        # Criar imagens
        for i, image_data in enumerate(images_data):
            WorkspaceImage.objects.create(
                workspace=workspace,
                image=image_data,
                image_type='main' if i == 0 else 'interior',
                is_owner_image=True,
                uploaded_by=workspace.created_by,
                order=i
            )
        
        return workspace
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        categories_data = validated_data.pop('categories', None)
        
        # Atualizar campos do espaço
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Atualizar categorias
        if categories_data is not None:
            instance.categories.set(categories_data)
        
        # Se novas imagens foram enviadas, adicionar às existentes
        if images_data is not None:
            current_images_count = instance.images.count()
            
            for i, image_data in enumerate(images_data):
                WorkspaceImage.objects.create(
                    workspace=instance,
                    image=image_data,
                    image_type='interior',
                    is_owner_image=True,
                    uploaded_by=instance.created_by,
                    order=current_images_count + i
                )
        
        return instance



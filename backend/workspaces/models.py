from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from decimal import Decimal
import uuid

User = get_user_model()

class Category(models.Model):
    """
    Categorias de espaços de trabalho
    """
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug")
    description = models.TextField(blank=True, verbose_name="Descrição")
    icon = models.CharField(max_length=50, blank=True, verbose_name="Ícone")
    color = models.CharField(max_length=7, default="#3B82F6", verbose_name="Cor")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['name']
    
    def __str__(self):
        return self.name

class Workspace(models.Model):
    """
    Modelo principal para espaços de trabalho
    """
    WORKSPACE_TYPES = [
        ('coworking', 'Coworking'),
        ('cafe', 'Café'),
        ('library', 'Biblioteca'),
        ('hotel_lobby', 'Lobby de Hotel'),
        ('restaurant', 'Restaurante'),
        ('other', 'Outro'),
    ]
    
    PRICE_RANGES = [
        ('free', 'Gratuito'),
        ('budget', 'Econômico (R$ 1-30)'),
        ('moderate', 'Moderado (R$ 31-60)'),
        ('expensive', 'Caro (R$ 61-100)'),
        ('luxury', 'Luxo (R$ 100+)'),
    ]
    
    # Identificação
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, verbose_name="Nome")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="Slug")
    description = models.TextField(verbose_name="Descrição")
    workspace_type = models.CharField(
        max_length=20, 
        choices=WORKSPACE_TYPES, 
        default='coworking',
        verbose_name="Tipo de Espaço"
    )
    categories = models.ManyToManyField(Category, blank=True, verbose_name="Categorias")
    
    # Localização
    address = models.TextField(verbose_name="Endereço")
    city = models.CharField(max_length=100, verbose_name="Cidade")
    state = models.CharField(max_length=100, verbose_name="Estado")
    country = models.CharField(max_length=100, default="Brasil", verbose_name="País")
    neighborhood = models.CharField(max_length=100, blank=True, verbose_name="Bairro")
    postal_code = models.CharField(max_length=20, blank=True, verbose_name="CEP")
    latitude = models.DecimalField(
        max_digits=10, 
        decimal_places=8, 
        null=True, 
        blank=True,
        verbose_name="Latitude"
    )
    longitude = models.DecimalField(
        max_digits=11, 
        decimal_places=8, 
        null=True, 
        blank=True,
        verbose_name="Longitude"
    )
    
    # Informações de contato
    phone = models.CharField(max_length=20, blank=True, verbose_name="Telefone")
    email = models.EmailField(blank=True, verbose_name="Email")
    website = models.URLField(blank=True, verbose_name="Website")
    instagram = models.CharField(max_length=100, blank=True, verbose_name="Instagram")
    facebook = models.CharField(max_length=100, blank=True, verbose_name="Facebook")
    
    # Horário de funcionamento
    opening_hours = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Horário de Funcionamento",
        help_text="JSON com horários por dia da semana"
    )
    
    # Preços
    price_range = models.CharField(
        max_length=20,
        choices=PRICE_RANGES,
        blank=True,
        verbose_name="Faixa de Preço"
    )
    daily_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Preço Diário"
    )
    hourly_price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Preço por Hora"
    )
    
    # Amenidades
    amenities = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Comodidades",
        help_text="Lista de comodidades disponíveis"
    )
    
    # Gestão
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_workspaces',
        verbose_name="Proprietário"
    )
    claimed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='claimed_workspaces',
        verbose_name="Reivindicado por"
    )
    is_claimed = models.BooleanField(default=False, verbose_name="Reivindicado")
    claim_date = models.DateTimeField(null=True, blank=True, verbose_name="Data da Reivindicação")
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    is_verified = models.BooleanField(default=False, verbose_name="Verificado")
    is_featured = models.BooleanField(default=False, verbose_name="Destaque")
    
    # Estatísticas
    view_count = models.PositiveIntegerField(default=0, verbose_name="Visualizações")
    favorite_count = models.PositiveIntegerField(default=0, verbose_name="Favoritos")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_workspaces',
        verbose_name="Criado por"
    )
    
    class Meta:
        verbose_name = "Espaço de Trabalho"
        verbose_name_plural = "Espaços de Trabalho"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['city', 'state']),
            models.Index(fields=['workspace_type']),
            models.Index(fields=['is_active', 'is_verified']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.city}, {self.state}"
    
    @property
    def average_rating(self):
        """Calcula a média geral das avaliações"""
        reviews = self.reviews.filter(is_active=True)
        if not reviews.exists():
            return 0
        
        total_score = sum([
            review.overall_rating for review in reviews
        ])
        return round(total_score / reviews.count(), 1)
    
    @property
    def review_count(self):
        """Conta o número de avaliações ativas"""
        return self.reviews.filter(is_active=True).count()
    
    @property
    def detailed_ratings(self):
        """Calcula médias detalhadas por categoria"""
        reviews = self.reviews.filter(is_active=True)
        if not reviews.exists():
            return {}
        
        ratings = {
            'wifi_quality': 0,
            'power_outlets': 0,
            'noise_level': 0,
            'comfort': 0,
            'location': 0,
            'value_for_money': 0,
            'food_quality': 0,
            'service_quality': 0,
        }
        
        for category in ratings.keys():
            scores = [getattr(review, category) for review in reviews if getattr(review, category, None)]
            if scores:
                ratings[category] = round(sum(scores) / len(scores), 1)
        
        return ratings

class WorkspaceImage(models.Model):
    """
    Imagens dos espaços de trabalho
    """
    IMAGE_TYPES = [
        ('main', 'Principal'),
        ('interior', 'Interior'),
        ('exterior', 'Exterior'),
        ('amenity', 'Comodidade'),
        ('food', 'Comida/Bebida'),
        ('other', 'Outro'),
    ]
    
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Espaço de Trabalho"
    )
    image = models.ImageField(
        upload_to='workspaces/images/',
        verbose_name="Imagem"
    )
    image_type = models.CharField(
        max_length=20,
        choices=IMAGE_TYPES,
        default='other',
        verbose_name="Tipo de Imagem"
    )
    caption = models.CharField(max_length=200, blank=True, verbose_name="Legenda")
    alt_text = models.CharField(max_length=200, blank=True, verbose_name="Texto Alternativo")
    
    # Prioridade (imagens do proprietário têm prioridade)
    is_owner_image = models.BooleanField(default=False, verbose_name="Imagem do Proprietário")
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        verbose_name="Enviado por"
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Imagem do Espaço"
        verbose_name_plural = "Imagens dos Espaços"
        ordering = ['-is_owner_image', 'order', '-created_at']
    
    def __str__(self):
        return f"{self.workspace.name} - {self.get_image_type_display()}"

class Review(models.Model):
    """
    Avaliações dos espaços de trabalho
    """
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Espaço de Trabalho"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='reviews',
        verbose_name="Usuário"
    )
    
    # Avaliação geral
    overall_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Avaliação Geral"
    )
    
    # Avaliações específicas (1-5 estrelas)
    wifi_quality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Qualidade do WiFi"
    )
    power_outlets = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Disponibilidade de Tomadas"
    )
    noise_level = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Nível de Ruído (1=Muito Barulhento, 5=Muito Silencioso)"
    )
    comfort = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Conforto"
    )
    location = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Localização"
    )
    value_for_money = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Custo-Benefício"
    )
    food_quality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Qualidade da Comida"
    )
    service_quality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True,
        verbose_name="Qualidade do Atendimento"
    )
    
    # Comentário
    comment = models.TextField(blank=True, verbose_name="Comentário")
    
    # Informações adicionais
    visit_date = models.DateField(null=True, blank=True, verbose_name="Data da Visita")
    visit_purpose = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Propósito da Visita"
    )
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    is_verified = models.BooleanField(default=False, verbose_name="Verificada")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Avaliação"
        verbose_name_plural = "Avaliações"
        ordering = ['-created_at']
        unique_together = ['workspace', 'user']  # Um usuário pode fazer apenas uma avaliação por espaço
        indexes = [
            models.Index(fields=['workspace', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['overall_rating']),
        ]
    
    def __str__(self):
        return f"{self.user.full_name} - {self.workspace.name} ({self.overall_rating}★)"
    
    def save(self, *args, **kwargs):
        # Atualizar timestamp de modificação
        if self.pk:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)

class ReviewImage(models.Model):
    """
    Imagens das avaliações
    """
    review = models.ForeignKey(
        Review,
        on_delete=models.CASCADE,
        related_name='images',
        verbose_name="Avaliação"
    )
    image = models.ImageField(
        upload_to='reviews/images/',
        verbose_name="Imagem"
    )
    caption = models.CharField(max_length=200, blank=True, verbose_name="Legenda")
    alt_text = models.CharField(max_length=200, blank=True, verbose_name="Texto Alternativo")
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name="Ativa")
    order = models.PositiveIntegerField(default=0, verbose_name="Ordem")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Imagem da Avaliação"
        verbose_name_plural = "Imagens das Avaliações"
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return f"Imagem - {self.review}"

class WorkspaceFavorite(models.Model):
    """
    Espaços favoritos dos usuários
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorite_workspaces',
        verbose_name="Usuário"
    )
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='favorited_by',
        verbose_name="Espaço de Trabalho"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Espaço Favorito"
        verbose_name_plural = "Espaços Favoritos"
        unique_together = ['user', 'workspace']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.workspace.name}"

class WorkspaceView(models.Model):
    """
    Visualizações dos espaços de trabalho
    """
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='views',
        verbose_name="Espaço de Trabalho"
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Usuário"
    )
    ip_address = models.GenericIPAddressField(verbose_name="Endereço IP")
    user_agent = models.TextField(blank=True, verbose_name="User Agent")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Visualização"
        verbose_name_plural = "Visualizações"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['workspace', '-created_at']),
            models.Index(fields=['ip_address', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.workspace.name} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"
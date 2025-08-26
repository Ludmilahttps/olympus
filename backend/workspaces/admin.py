from django.contrib import admin
from django.utils.html import format_html
from .models import (
    Category, Workspace, WorkspaceImage, Review, 
    ReviewImage, WorkspaceFavorite, WorkspaceView
)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color_display', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at']
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 5px 10px; color: white; border-radius: 3px;">{}</span>',
            obj.color,
            obj.color
        )
    color_display.short_description = 'Cor'

class WorkspaceImageInline(admin.TabularInline):
    model = WorkspaceImage
    extra = 0
    readonly_fields = ['uploaded_by', 'created_at']
    fields = ['image', 'image_type', 'caption', 'is_owner_image', 'order', 'is_active']

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'city', 'state', 'workspace_type', 'is_verified', 
        'is_featured', 'is_claimed', 'average_rating', 'review_count', 'created_at'
    ]
    list_filter = [
        'workspace_type', 'is_active', 'is_verified', 'is_featured', 
        'is_claimed', 'city', 'state', 'created_at'
    ]
    search_fields = ['name', 'city', 'state', 'neighborhood', 'description']
    readonly_fields = [
        'slug', 'average_rating', 'review_count', 'view_count', 
        'favorite_count', 'created_at', 'updated_at', 'created_by'
    ]
    prepopulated_fields = {'slug': ('name',)}
    filter_horizontal = ['categories']
    inlines = [WorkspaceImageInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'slug', 'description', 'workspace_type', 'categories')
        }),
        ('Localização', {
            'fields': ('address', 'city', 'state', 'country', 'neighborhood', 'postal_code', 'latitude', 'longitude')
        }),
        ('Contato', {
            'fields': ('phone', 'email', 'website', 'instagram', 'facebook')
        }),
        ('Preços e Horários', {
            'fields': ('price_range', 'daily_price', 'hourly_price', 'opening_hours')
        }),
        ('Comodidades', {
            'fields': ('amenities',)
        }),
        ('Gestão', {
            'fields': ('owner', 'claimed_by', 'is_claimed', 'claim_date', 'created_by')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified', 'is_featured')
        }),
        ('Estatísticas', {
            'fields': ('average_rating', 'review_count', 'view_count', 'favorite_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('categories', 'reviews')

class ReviewImageInline(admin.TabularInline):
    model = ReviewImage
    extra = 0
    readonly_fields = ['created_at']
    fields = ['image', 'caption', 'order', 'is_active']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = [
        'workspace', 'user', 'overall_rating', 'wifi_quality', 
        'power_outlets', 'noise_level', 'is_verified', 'created_at'
    ]
    list_filter = [
        'overall_rating', 'is_active', 'is_verified', 'created_at',
        'workspace__city', 'workspace__workspace_type'
    ]
    search_fields = ['workspace__name', 'user__email', 'user__first_name', 'user__last_name', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ReviewImageInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('workspace', 'user', 'overall_rating', 'comment')
        }),
        ('Avaliações Específicas', {
            'fields': (
                'wifi_quality', 'power_outlets', 'noise_level', 'comfort',
                'location', 'value_for_money', 'food_quality', 'service_quality'
            )
        }),
        ('Detalhes da Visita', {
            'fields': ('visit_date', 'visit_purpose')
        }),
        ('Status', {
            'fields': ('is_active', 'is_verified')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('workspace', 'user')

@admin.register(WorkspaceImage)
class WorkspaceImageAdmin(admin.ModelAdmin):
    list_display = ['workspace', 'image_type', 'is_owner_image', 'uploaded_by', 'is_active', 'created_at']
    list_filter = ['image_type', 'is_owner_image', 'is_active', 'created_at']
    search_fields = ['workspace__name', 'caption', 'uploaded_by__email']
    readonly_fields = ['uploaded_by', 'created_at']

@admin.register(ReviewImage)
class ReviewImageAdmin(admin.ModelAdmin):
    list_display = ['review', 'caption', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['review__workspace__name', 'review__user__email', 'caption']
    readonly_fields = ['created_at']

@admin.register(WorkspaceFavorite)
class WorkspaceFavoriteAdmin(admin.ModelAdmin):
    list_display = ['user', 'workspace', 'created_at']
    list_filter = ['created_at', 'workspace__city']
    search_fields = ['user__email', 'workspace__name']
    readonly_fields = ['created_at']

@admin.register(WorkspaceView)
class WorkspaceViewAdmin(admin.ModelAdmin):
    list_display = ['workspace', 'user', 'ip_address', 'created_at']
    list_filter = ['created_at', 'workspace__city']
    search_fields = ['workspace__name', 'user__email', 'ip_address']
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        return False  # Não permitir criação manual
    
    def has_change_permission(self, request, obj=None):
        return False  # Não permitir edição

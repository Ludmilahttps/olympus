from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'workspaces'

# Router para ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet)
router.register(r'workspaces', views.WorkspaceViewSet)
router.register(r'reviews', views.ReviewViewSet)

urlpatterns = [
    # URLs do router
    path('', include(router.urls)),
    
    # URLs customizadas
    path('stats/', views.workspace_stats, name='workspace_stats'),
    path('favorites/', views.user_favorites, name='user_favorites'),
    path('search/suggestions/', views.search_suggestions, name='search_suggestions'),
    
    # Upload de imagens
    path('workspaces/<slug:workspace_slug>/upload-image/', 
         views.upload_workspace_image, 
         name='upload_workspace_image'),
    path('reviews/<int:review_id>/upload-image/', 
         views.upload_review_image, 
         name='upload_review_image'),
]
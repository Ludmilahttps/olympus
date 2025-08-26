// Caminho: olympus-frontend/src/pages/Workspace/WorkspaceDetail.jsx

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Instagram, 
  Facebook,
  Star,
  Heart,
  Share,
  Clock,
  DollarSign,
  Users,
  Wifi,
  Car,
  Accessibility,
  CheckCircle
} from 'lucide-react';
import { workspacesAPI } from '@/lib/api/workspaces';
import { useAuthStore } from '@/lib/store';
import ImageGallery from '@/components/Workspace/ImageGallery';
import ReviewCard from '@/components/Review/ReviewCard';
import ReviewForm from '@/components/Review/ReviewForm';

const WorkspaceDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const loadWorkspace = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      const response = await workspacesAPI.getWorkspace(slug);
      setWorkspace(response.data);
      setIsFavorited(response.data.is_favorited || false);
    } catch (error) {
      console.error('Erro ao carregar espaço:', error);
      setError('Erro ao carregar informações do espaço');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Você precisa estar logado para favoritar espaços');
      return;
    }

    try {
      if (isFavorited) {
        await workspacesAPI.unfavoriteWorkspace(slug);
        setIsFavorited(false);
      } else {
        await workspacesAPI.favoriteWorkspace(slug);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Erro ao favoritar/desfavoritar:', error);
      alert('Erro ao atualizar favoritos');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workspace.name,
          text: workspace.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const renderRating = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getWorkspaceTypeLabel = (type) => {
    const types = {
      'coworking': 'Coworking',
      'cafe': 'Café',
      'library': 'Biblioteca',
      'hotel_lobby': 'Lobby de Hotel',
      'restaurant': 'Restaurante',
      'other': 'Outro'
    };
    return types[type] || type;
  };

  const getPriceRangeLabel = (range) => {
    const ranges = {
      'free': 'Gratuito',
      'budget': 'Econômico (R$ 1-30)',
      'moderate': 'Moderado (R$ 31-60)',
      'expensive': 'Caro (R$ 61-100)',
      'luxury': 'Luxo (R$ 100+)'
    };
    return ranges[range] || range;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Espaço não encontrado</h1>
        <p className="text-muted-foreground">O espaço solicitado não foi encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{workspace.name}</h1>
            <div className="flex items-center gap-4 text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{workspace.address}, {workspace.city}, {workspace.state}</span>
              </div>
              {workspace.is_verified && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Verificado</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{getWorkspaceTypeLabel(workspace.workspace_type)}</Badge>
              {workspace.average_rating > 0 && (
                <div className="flex items-center gap-2">
                  {renderRating(workspace.average_rating)}
                  <span className="text-sm text-muted-foreground">
                    ({workspace.review_count} avaliações)
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleFavorite}>
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Galeria de Imagens */}
      {workspace.images && workspace.images.length > 0 && (
        <div className="mb-8">
          <ImageGallery images={workspace.images} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-8">
          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre este espaço</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {workspace.description}
              </p>
            </CardContent>
          </Card>

          {/* Comodidades */}
          {workspace.amenities && workspace.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comodidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {workspace.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Avaliações Detalhadas */}
          {workspace.detailed_ratings && Object.keys(workspace.detailed_ratings).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Avaliações Detalhadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(workspace.detailed_ratings).map(([key, rating]) => {
                    const labels = {
                      'wifi_quality': 'Qualidade do WiFi',
                      'power_outlets': 'Disponibilidade de Tomadas',
                      'noise_level': 'Nível de Ruído',
                      'comfort': 'Conforto',
                      'location': 'Localização',
                      'value_for_money': 'Custo-Benefício',
                      'food_quality': 'Qualidade da Comida',
                      'service_quality': 'Qualidade do Atendimento'
                    };
                    
                    if (rating > 0) {
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm">{labels[key]}</span>
                          {renderRating(rating)}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Avaliações dos Usuários */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Avaliações ({workspace.review_count})
                </CardTitle>
                {isAuthenticated && (
                  <Button onClick={() => setShowReviewForm(!showReviewForm)}>
                    {showReviewForm ? 'Cancelar' : 'Avaliar'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {showReviewForm && (
                <div className="mb-6">
                  <ReviewForm 
                    workspaceSlug={slug} 
                    onReviewSubmitted={() => {
                      setShowReviewForm(false);
                      loadWorkspace();
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-4">
                {workspace.reviews && workspace.reviews.length > 0 ? (
                  workspace.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Ainda não há avaliações para este espaço.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{workspace.phone}</span>
                </div>
              )}
              {workspace.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{workspace.email}</span>
                </div>
              )}
              {workspace.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={workspace.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
              {workspace.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`https://instagram.com/${workspace.instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {workspace.instagram}
                  </a>
                </div>
              )}
              {workspace.facebook && (
                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={workspace.facebook} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Facebook
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preços */}
          {(workspace.daily_price || workspace.hourly_price || workspace.price_range) && (
            <Card>
              <CardHeader>
                <CardTitle>Preços</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.daily_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Diária</span>
                    <span className="font-medium">R$ {workspace.daily_price}</span>
                  </div>
                )}
                {workspace.hourly_price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Por hora</span>
                    <span className="font-medium">R$ {workspace.hourly_price}</span>
                  </div>
                )}
                {workspace.price_range && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Faixa de preço</span>
                    <Badge variant="outline">
                      {getPriceRangeLabel(workspace.price_range)}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações Adicionais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {workspace.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Capacidade: {workspace.capacity} pessoas</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Visualizações: {workspace.view_count}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDetail;


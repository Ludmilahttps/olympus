import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  MapPin, 
  Heart,
  Coffee,
  Verified
} from 'lucide-react';
import { workspacesAPI } from '@/lib/api/workspaces';
import { useAuthStore } from '@/lib/store';

const WorkspaceCarousel = ({ 
  title = "Espaços Mais Avaliados", 
  endpoint = "top_rated",
  showRating = true,
  className = ""
}) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadWorkspaces();
  }, [endpoint]);

  const loadWorkspaces = async () => {
    try {
      let response;
      switch (endpoint) {
        case 'featured':
          response = await workspacesAPI.getFeaturedWorkspaces();
          break;
        case 'most_reviewed':
          response = await workspacesAPI.getMostReviewedWorkspaces();
          break;
        case 'top_rated':
        default:
          response = await workspacesAPI.getTopRatedWorkspaces();
          break;
      }
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Erro ao carregar espaços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async (slug, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) return;

    try {
      const response = await workspacesAPI.toggleFavorite(slug);
      setWorkspaces(prev => 
        prev.map(workspace => 
          workspace.slug === slug 
            ? { ...workspace, is_favorited: response.data.favorited }
            : workspace
        )
      );
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    }
  };

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      const cardWidth = 320; // Largura aproximada do card + gap
      const scrollPosition = index * cardWidth;
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const maxIndex = Math.max(0, workspaces.length - 4); // Mostra 4 cards por vez
    const newIndex = Math.min(maxIndex, currentIndex + 1);
    scrollToIndex(newIndex);
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getPriceRangeLabel = (priceRange) => {
    const ranges = {
      'free': 'Gratuito',
      'budget': 'Econômico',
      'moderate': 'Moderado',
      'expensive': 'Caro',
      'luxury': 'Luxo'
    };
    return ranges[priceRange] || priceRange;
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

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="w-80 shrink-0 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={scrollLeft}
            disabled={currentIndex === 0}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollRight}
            disabled={currentIndex >= Math.max(0, workspaces.length - 4)}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" asChild className="ml-2">
            <Link to="/workspaces">Ver Todos</Link>
          </Button>
        </div>
      </div>

      {/* Carrossel */}
      <div className="relative">
        <div 
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className="w-80 shrink-0 group hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <Link to={`/workspaces/${workspace.slug}`}>
                <div className="relative">
                  {/* Imagem Principal */}
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                    {workspace.main_image ? (
                      <img
                        src={workspace.main_image}
                        alt={workspace.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <Coffee className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Badges de Status */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {workspace.is_verified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Verified className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
                    {workspace.is_featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        ⭐ Destaque
                      </Badge>
                    )}
                  </div>

                  {/* Botão de Favorito */}
                  {isAuthenticated && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white ${
                        workspace.is_favorited ? 'text-red-500' : 'text-gray-600'
                      }`}
                      onClick={(e) => handleFavoriteToggle(workspace.slug, e)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${workspace.is_favorited ? 'fill-current' : ''}`} 
                      />
                    </Button>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Título e Localização */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {workspace.name}
                      </h3>
                      <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                        {getWorkspaceTypeLabel(workspace.workspace_type)}
                      </Badge>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1 shrink-0" />
                      <span className="line-clamp-1">
                        {workspace.neighborhood && `${workspace.neighborhood}, `}
                        {workspace.city}, {workspace.state}
                      </span>
                    </div>
                  </div>

                  {/* Avaliação */}
                  {showRating && (
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        {workspace.average_rating > 0 ? (
                          <>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="ml-1 font-medium">
                                {workspace.average_rating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              ({workspace.review_count})
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Sem avaliações
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Preço */}
                  {(workspace.daily_price || workspace.hourly_price || workspace.price_range) && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center text-sm">
                        {workspace.daily_price ? (
                          <span>
                            <span className="font-semibold">{formatPrice(workspace.daily_price)}</span>
                            <span className="text-muted-foreground">/dia</span>
                          </span>
                        ) : workspace.hourly_price ? (
                          <span>
                            <span className="font-semibold">{formatPrice(workspace.hourly_price)}</span>
                            <span className="text-muted-foreground">/hora</span>
                          </span>
                        ) : (
                          <span className="font-medium">
                            {getPriceRangeLabel(workspace.price_range)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Indicadores de Posição */}
        {workspaces.length > 4 && (
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: Math.ceil(workspaces.length / 4) }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index * 4)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / 4) === index 
                    ? 'bg-primary' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceCarousel;
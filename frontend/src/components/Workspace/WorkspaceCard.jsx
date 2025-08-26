import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Star, 
  MapPin, 
  Wifi, 
  Coffee, 
  Car, 
  Users,
  Clock,
  DollarSign,
  Verified
} from 'lucide-react';
import { workspacesAPI } from '@/lib/api/workspaces';
import { useAuthStore } from '@/lib/store';

const WorkspaceCard = ({ workspace, onFavoriteChange }) => {
  const [isFavorited, setIsFavorited] = useState(workspace.is_favorited);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleFavoriteToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      // Redirecionar para login ou mostrar modal
      return;
    }

    setIsLoading(true);
    try {
      const response = await workspacesAPI.toggleFavorite(workspace.slug);
      setIsFavorited(response.data.favorited);
      if (onFavoriteChange) {
        onFavoriteChange(workspace.id, response.data.favorited);
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
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
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white ${
              isFavorited ? 'text-red-500' : 'text-gray-600'
            }`}
            onClick={handleFavoriteToggle}
            disabled={isLoading}
          >
            <Heart 
              className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} 
            />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Título e Localização */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {workspace.name}
              </h3>
              <Badge variant="outline" className="ml-2 shrink-0">
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

          {/* Categorias */}
          {workspace.categories && workspace.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {workspace.categories.slice(0, 3).map((category) => (
                <Badge 
                  key={category.id} 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {category.name}
                </Badge>
              ))}
              {workspace.categories.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{workspace.categories.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Avaliação */}
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
                    ({workspace.review_count} {workspace.review_count === 1 ? 'avaliação' : 'avaliações'})
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Sem avaliações
                </span>
              )}
            </div>
          </div>

          {/* Preço */}
          {(workspace.daily_price || workspace.hourly_price || workspace.price_range) && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm">
                  <DollarSign className="h-4 w-4 mr-1" />
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
            </div>
          )}
        </CardContent>
      </Link>
    </Card>
  );
};

export default WorkspaceCard;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Star, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Eye,
  BarChart3
} from 'lucide-react';
import { workspacesAPI } from '@/lib/api/workspaces';
import ReviewCard from '@/components/Review/ReviewCard';
import { useDebounce } from '@/hooks/useDebounce';

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sortBy, setSortBy] = useState('-created_at');
  const [stats, setStats] = useState({
    total_reviews: 0,
    average_rating: 0,
    ratings_distribution: {},
    recent_reviews: 0
  });

  // Paginação
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadUserReviews();
    calculateStats();
  }, [debouncedSearchQuery, filterRating, sortBy]);

  const loadUserReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        ordering: sortBy,
      };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      if (filterRating) {
        params.overall_rating = filterRating;
      }

      const response = await workspacesAPI.getMyReviews();
      
      // Filtrar localmente se necessário (já que a API pode não suportar todos os filtros)
      let filteredReviews = response.data.results || response.data;
      
      if (debouncedSearchQuery) {
        filteredReviews = filteredReviews.filter(review =>
          review.workspace_name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          review.comment?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
      }

      if (filterRating) {
        filteredReviews = filteredReviews.filter(review =>
          review.overall_rating === parseInt(filterRating)
        );
      }

      // Ordenar localmente
      filteredReviews.sort((a, b) => {
        switch (sortBy) {
          case '-created_at':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'created_at':
            return new Date(a.created_at) - new Date(b.created_at);
          case '-overall_rating':
            return b.overall_rating - a.overall_rating;
          case 'overall_rating':
            return a.overall_rating - b.overall_rating;
          case 'workspace_name':
            return (a.workspace_name || '').localeCompare(b.workspace_name || '');
          case '-workspace_name':
            return (b.workspace_name || '').localeCompare(a.workspace_name || '');
          default:
            return 0;
        }
      });

      setReviews(filteredReviews);
      
      // Simular paginação se a API não retornar dados paginados
      if (response.data.results) {
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous,
          current_page: page,
          total_pages: Math.ceil(response.data.count / 20),
        });
      } else {
        setPagination({
          count: filteredReviews.length,
          next: null,
          previous: null,
          current_page: 1,
          total_pages: 1,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      const response = await workspacesAPI.getMyReviews();
      const allReviews = response.data.results || response.data;

      if (allReviews.length === 0) {
        setStats({
          total_reviews: 0,
          average_rating: 0,
          ratings_distribution: {},
          recent_reviews: 0
        });
        return;
      }

      // Calcular estatísticas
      const totalReviews = allReviews.length;
      const averageRating = allReviews.reduce((sum, review) => sum + review.overall_rating, 0) / totalReviews;
      
      // Distribuição de avaliações
      const ratingsDistribution = {};
      for (let i = 1; i <= 5; i++) {
        ratingsDistribution[i] = allReviews.filter(review => review.overall_rating === i).length;
      }

      // Avaliações recentes (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentReviews = allReviews.filter(review => 
        new Date(review.created_at) >= thirtyDaysAgo
      ).length;

      setStats({
        total_reviews: totalReviews,
        average_rating: averageRating,
        ratings_distribution: ratingsDistribution,
        recent_reviews: recentReviews
      });
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  const handleReviewUpdate = () => {
    loadUserReviews();
    calculateStats();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                <p className="text-2xl font-bold">{stats.total_reviews}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}
                  </p>
                  {renderStars(Math.round(stats.average_rating))}
                </div>
              </div>
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Este Mês</p>
                <p className="text-2xl font-bold">{stats.recent_reviews}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Distribuição</p>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="flex items-center gap-2 text-xs">
                    <span>{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{
                          width: `${stats.total_reviews > 0 
                            ? (stats.ratings_distribution[rating] / stats.total_reviews) * 100 
                            : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-muted-foreground">
                      {stats.ratings_distribution[rating] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por espaço ou comentário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Avaliação */}
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as avaliações</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_at">Mais recentes</SelectItem>
                <SelectItem value="created_at">Mais antigas</SelectItem>
                <SelectItem value="-overall_rating">Melhor avaliadas</SelectItem>
                <SelectItem value="overall_rating">Pior avaliadas</SelectItem>
                <SelectItem value="workspace_name">Espaço (A-Z)</SelectItem>
                <SelectItem value="-workspace_name">Espaço (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de Avaliações */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full" />
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-32" />
                          <div className="h-3 bg-gray-200 rounded w-24" />
                        </div>
                      </div>
                      <div className="h-16 bg-gray-200 rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="space-y-4">
                <div className="h-16 w-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <Star className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Nenhuma avaliação encontrada</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || filterRating 
                      ? 'Tente ajustar seus filtros de busca.'
                      : 'Você ainda não fez nenhuma avaliação. Que tal visitar alguns espaços?'
                    }
                  </p>
                </div>
                {!searchQuery && !filterRating && (
                  <Button asChild>
                    <Link to="/workspaces">Explorar Espaços</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  showWorkspaceName={true}
                  onUpdate={handleReviewUpdate}
                />
              ))}
            </div>
          )}

          {/* Paginação */}
          {pagination.total_pages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  disabled={!pagination.previous}
                  onClick={() => loadUserReviews(pagination.current_page - 1)}
                >
                  Anterior
                </Button>
                
                <span className="px-4 py-2 text-sm">
                  Página {pagination.current_page} de {pagination.total_pages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={!pagination.next}
                  onClick={() => loadUserReviews(pagination.current_page + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserReviews;
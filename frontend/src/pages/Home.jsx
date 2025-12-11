import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Star, 
  MapPin, 
  TrendingUp, 
  Users, 
  Building,
  Coffee,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import WorkspaceCarousel from '@/components/Workspace/WorkspaceCarousel';
import SearchBar from '@/components/Search/SearchBar';
import { workspacesAPI } from '@/lib/api/workspaces';

const Home = () => {
  const [stats, setStats] = useState({
    total_workspaces: 0,
    total_reviews: 0,
    average_rating: 0,
    top_cities: [],
    popular_types: [],
    recent_reviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await workspacesAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Título Principal */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                Encontre o espaço perfeito para
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  {' '}trabalhar
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubra coworkings, cafés e espaços únicos para trabalhar remotamente. 
                Avalie, compare e encontre seu lugar ideal.
              </p>
            </div>

            {/* Barra de Busca Principal */}
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                size="lg"
                placeholder="Buscar por cidade, bairro ou nome do espaço..."
                className="shadow-lg"
              />
            </div>

            {/* Estatísticas Rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.total_workspaces}
                </div>
                <div className="text-sm text-gray-600">Espaços</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.total_reviews}
                </div>
                <div className="text-sm text-gray-600">Avaliações</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.average_rating.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Média Geral</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {loading ? '...' : stats.top_cities.length}
                </div>
                <div className="text-sm text-gray-600">Cidades</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrossel de Espaços Mais Avaliados */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <WorkspaceCarousel 
            title="🏆 Espaços Mais Bem Avaliados"
            endpoint="top_rated"
            showRating={true}
          />
        </div>
      </section>

      {/* Carrossel de Espaços em Destaque */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <WorkspaceCarousel 
            title="⭐ Espaços em Destaque"
            endpoint="featured"
            showRating={true}
          />
        </div>
      </section>

      {/* Carrossel de Espaços Mais Avaliados */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <WorkspaceCarousel 
            title="🔥 Espaços Mais Populares"
            endpoint="most_reviewed"
            showRating={true}
          />
        </div>
      </section>

      {/* Seção de Cidades e Tipos Populares */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cidades Populares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Cidades Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.top_cities.slice(0, 5).map((city, index) => (
                      <Link
                        key={index}
                        to={`/workspaces?city=${encodeURIComponent(city.city)}&state=${encodeURIComponent(city.state)}`}
                        className="flex justify-between items-center p-2 rounded hover:bg-gray-100 transition-colors group"
                      >
                        <span className="group-hover:text-primary transition-colors">
                          {city.city}, {city.state}
                        </span>
                        <Badge variant="secondary">
                          {city.count} espaços
                        </Badge>
                      </Link>
                    ))}
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link to="/workspaces">
                        Ver Todas as Cidades
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tipos de Espaços Populares */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Tipos de Espaços
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.popular_types.slice(0, 5).map((type, index) => (
                      <Link
                        key={index}
                        to={`/workspaces?workspace_type=${type.workspace_type}`}
                        className="flex justify-between items-center p-2 rounded hover:bg-gray-100 transition-colors group"
                      >
                        <span className="group-hover:text-primary transition-colors">
                          {getWorkspaceTypeLabel(type.workspace_type)}
                        </span>
                        <Badge variant="secondary">
                          {type.count} espaços
                        </Badge>
                      </Link>
                    ))}
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link to="/workspaces">
                        Explorar Todos os Tipos
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Avaliações Recentes */}
      {stats.recent_reviews && stats.recent_reviews.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Avaliações Recentes</h2>
              <p className="text-gray-600">Veja o que outros usuários estão dizendo</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {stats.recent_reviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Header da Avaliação */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.overall_rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-medium">{review.overall_rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      {/* Comentário */}
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {review.comment}
                      </p>

                      {/* Autor e Espaço */}
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {review.user_name}
                        </div>
                        <Link
                          to={`/workspaces/${review.workspace?.slug || '#'}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {review.workspace_name}
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link to="/workspaces">
                  Ver Todos os Espaços
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Pronto para encontrar seu espaço ideal?
            </h2>
            <p className="text-xl opacity-90">
              Junte-se a milhares de profissionais que já encontraram o lugar perfeito para trabalhar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/workspaces">
                  <Search className="h-5 w-5 mr-2" />
                  Explorar Espaços
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
                <Link to="/register">
                  <Users className="h-5 w-5 mr-2" />
                  Criar Conta
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  X
} from 'lucide-react';
import WorkspaceCard from '@/components/Workspace/WorkspaceCard';
import { workspacesAPI } from '@/lib/api/workspaces';
import { useDebounce } from '@/hooks/useDebounce';

const WorkspaceList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [workspaces, setWorkspaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  // Filtros
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    workspace_type: searchParams.get('workspace_type') || '',
    categories: searchParams.getAll('categories') || [],
    price_range: searchParams.get('price_range') || '',
    min_rating: searchParams.get('min_rating') || '',
    verified: searchParams.get('verified') || '',
    featured: searchParams.get('featured') || '',
  });

  // Paginação
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    current_page: 1,
    total_pages: 1,
  });

  // Ordenação
  const [ordering, setOrdering] = useState(searchParams.get('ordering') || '-created_at');

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadWorkspaces();
  }, [debouncedSearchQuery, filters, ordering, searchParams]);

  const loadCategories = async () => {
    try {
      const response = await workspacesAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadWorkspaces = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        search: debouncedSearchQuery,
        ordering,
        ...filters,
      };

      // Remover parâmetros vazios
      Object.keys(params).forEach(key => {
        if (!params[key] || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      const response = await workspacesAPI.getWorkspaces(params);
      setWorkspaces(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        current_page: page,
        total_pages: Math.ceil(response.data.count / 20),
      });
    } catch (error) {
      console.error('Erro ao carregar espaços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleCategoryToggle = (categoryId) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    handleFilterChange('categories', newCategories);
  };

  const clearFilters = () => {
    const emptyFilters = {
      city: '',
      state: '',
      workspace_type: '',
      categories: [],
      price_range: '',
      min_rating: '',
      verified: '',
      featured: '',
    };
    setFilters(emptyFilters);
    setSearchQuery('');
    updateURL(emptyFilters);
  };

  const updateURL = (newFilters) => {
    const params = new URLSearchParams();
    
    if (debouncedSearchQuery) params.set('search', debouncedSearchQuery);
    if (ordering !== '-created_at') params.set('ordering', ordering);
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }
    });

    setSearchParams(params);
  };

  const handleFavoriteChange = (workspaceId, isFavorited) => {
    setWorkspaces(prev => 
      prev.map(workspace => 
        workspace.id === workspaceId 
          ? { ...workspace, is_favorited: isFavorited }
          : workspace
      )
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          count += value.length;
        } else {
          count += 1;
        }
      }
    });
    return count;
  };

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Espaços de Trabalho</h1>
        <p className="text-muted-foreground">
          Encontre o espaço perfeito para trabalhar
        </p>
      </div>

      {/* Busca e Filtros */}
      <div className="mb-6 space-y-4">
        {/* Barra de Busca */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, cidade ou bairro..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filtros Expandidos */}
        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filtros</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpar Filtros
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Localização */}
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    placeholder="Ex: São Paulo"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    placeholder="Ex: SP"
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                  />
                </div>

                {/* Tipo de Espaço */}
                <div className="space-y-2">
                  <Label>Tipo de Espaço</Label>
                  <Select
                    value={filters.workspace_type}
                    onValueChange={(value) => handleFilterChange('workspace_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os tipos</SelectItem>
                      <SelectItem value="coworking">Coworking</SelectItem>
                      <SelectItem value="cafe">Café</SelectItem>
                      <SelectItem value="library">Biblioteca</SelectItem>
                      <SelectItem value="hotel_lobby">Lobby de Hotel</SelectItem>
                      <SelectItem value="restaurant">Restaurante</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Faixa de Preço */}
                <div className="space-y-2">
                  <Label>Faixa de Preço</Label>
                  <Select
                    value={filters.price_range}
                    onValueChange={(value) => handleFilterChange('price_range', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer preço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer preço</SelectItem>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="budget">Econômico (R$ 1-30)</SelectItem>
                      <SelectItem value="moderate">Moderado (R$ 31-60)</SelectItem>
                      <SelectItem value="expensive">Caro (R$ 61-100)</SelectItem>
                      <SelectItem value="luxury">Luxo (R$ 100+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categorias */}
              {categories.length > 0 && (
                <div className="mt-4">
                  <Label className="mb-3 block">Categorias</Label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={filters.categories.includes(category.id.toString()) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleCategoryToggle(category.id.toString())}
                        style={filters.categories.includes(category.id.toString()) ? 
                          { backgroundColor: category.color, borderColor: category.color } : 
                          { borderColor: category.color, color: category.color }
                        }
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros Adicionais */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Avaliação Mínima</Label>
                  <Select
                    value={filters.min_rating}
                    onValueChange={(value) => handleFilterChange('min_rating', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Qualquer avaliação</SelectItem>
                      <SelectItem value="4">4+ estrelas</SelectItem>
                      <SelectItem value="3">3+ estrelas</SelectItem>
                      <SelectItem value="2">2+ estrelas</SelectItem>
                      <SelectItem value="1">1+ estrelas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={filters.verified === 'true'}
                    onChange={(e) => handleFilterChange('verified', e.target.checked ? 'true' : '')}
                  />
                  <Label htmlFor="verified">Apenas verificados</Label>
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={filters.featured === 'true'}
                    onChange={(e) => handleFilterChange('featured', e.target.checked ? 'true' : '')}
                  />
                  <Label htmlFor="featured">Apenas destaques</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Controles de Visualização e Ordenação */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {pagination.count} espaços encontrados
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Ordenação */}
          <Select value={ordering} onValueChange={setOrdering}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-created_at">Mais recentes</SelectItem>
              <SelectItem value="created_at">Mais antigos</SelectItem>
              <SelectItem value="-average_rating">Melhor avaliados</SelectItem>
              <SelectItem value="-review_count">Mais avaliados</SelectItem>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="-name">Nome (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          {/* Modo de Visualização */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Lista de Espaços */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Search className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">Nenhum espaço encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar seus filtros ou buscar por outros termos.
              </p>
            </div>
            <Button onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </Card>
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {pagination.total_pages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!pagination.previous}
              onClick={() => loadWorkspaces(pagination.current_page - 1)}
            >
              Anterior
            </Button>
            
            <span className="px-4 py-2 text-sm">
              Página {pagination.current_page} de {pagination.total_pages}
            </span>
            
            <Button
              variant="outline"
              disabled={!pagination.next}
              onClick={() => loadWorkspaces(pagination.current_page + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceList;
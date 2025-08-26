import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import Header from './components/Layout/Header';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Profile from './pages/Profile';
import { useUIStore, useAuthStore } from './lib/store';
import { Building2 } from 'lucide-react';
import './App.css';

// Criar cliente do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Componente Home atualizado
const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <Building2 className="h-24 w-24 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {isAuthenticated ? (
                <>
                  Bem-vindo de volta,
                  <span className="text-primary block">{user?.first_name}!</span>
                </>
              ) : (
                <>
                  Bem-vindo ao
                  <span className="text-primary block">Olympus</span>
                </>
              )}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A plataforma definitiva para encontrar e gerenciar espaços de trabalho para nômades digitais e profissionais remotos.
            </p>
          </div>

          {isAuthenticated && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-2">Seu Perfil</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Membro desde:</strong> {new Date(user?.date_joined).toLocaleDateString('pt-BR')}</p>
                {user?.location && <p><strong>Localização:</strong> {user.location}</p>}
                {user?.profession && <p><strong>Profissão:</strong> {user.profession}</p>}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-primary text-2xl mb-4">🏢</div>
              <h3 className="text-lg font-semibold mb-2">Espaços Verificados</h3>
              <p className="text-muted-foreground">
                Todos os espaços são cuidadosamente verificados e avaliados pela nossa comunidade.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-primary text-2xl mb-4">🌍</div>
              <h3 className="text-lg font-semibold mb-2">Global</h3>
              <p className="text-muted-foreground">
                Encontre espaços de trabalho em qualquer lugar do mundo, de coworkings a cafés únicos.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-primary text-2xl mb-4">👥</div>
              <h3 className="text-lg font-semibold mb-2">Comunidade</h3>
              <p className="text-muted-foreground">
                Conecte-se com outros nômades digitais e profissionais remotos.
              </p>
            </div>
          </div>

          <div className="mt-16 space-y-4">
            <h2 className="text-2xl font-bold">Status do Desenvolvimento</h2>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
                <span className="text-green-800 dark:text-green-200 font-medium">✓ Sistema de Autenticação</span>
              </div>
              <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
                <span className="text-green-800 dark:text-green-200 font-medium">✓ API RESTful</span>
              </div>
              <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
                <span className="text-green-800 dark:text-green-200 font-medium">✓ Interface Moderna</span>
              </div>
              <div className="bg-green-100 dark:bg-green-900 px-4 py-2 rounded-full">
                <span className="text-green-800 dark:text-green-200 font-medium">✓ Perfil de Usuário</span>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-full">
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">🚧 Busca de Espaços</span>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-full">
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">🚧 Planejamento de Viagens</span>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900 px-4 py-2 rounded-full">
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">🚧 Sistema de Avaliações</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para páginas não encontradas
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Página não encontrada</h2>
        <p className="text-muted-foreground">A página que você está procurando não existe.</p>
        <Button asChild>
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  );
};

function App() {
  const { theme } = useUIStore();
  const { isAuthenticated, setLoading } = useAuthStore();

  // Aplicar tema ao documento
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Verificar autenticação ao carregar a aplicação
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('olympus-auth-storage');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.state?.user && userData.state?.isAuthenticated) {
            // Usuário já está autenticado
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
        }
      }
      
      // Limpar dados inválidos
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('olympus-auth-storage');
      setLoading(false);
    };

    checkAuth();
  }, [setLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Header />
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Rotas protegidas */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas futuras (protegidas) */}
            <Route 
              path="/workspaces" 
              element={
                <ProtectedRoute>
                  <div className="container mx-auto py-8 px-4">
                    <h1 className="text-3xl font-bold">Espaços de Trabalho</h1>
                    <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/trips" 
              element={
                <ProtectedRoute>
                  <div className="container mx-auto py-8 px-4">
                    <h1 className="text-3xl font-bold">Minhas Viagens</h1>
                    <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
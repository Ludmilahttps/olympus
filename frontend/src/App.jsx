import { BrowserRouter as Router, Routes, Route, Outlet, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

// CSS OBRIGATÓRIO
import './index.css'; 

import Header from './components/Layout/Header';

// IMPORTS DE PÁGINAS
import AuthPage from './pages/Auth'; 
import Home from './pages/Home';
import Profile from './pages/Profile';

// IMPORT CORRIGIDO (Usando @ para evitar erro de caminho)
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

import { useUIStore, useAuthStore } from './lib/store';
import { Button } from '@/components/ui/button';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-olympus-cream dark:bg-gray-900">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-olympus-terra">404</h1>
        <h2 className="text-2xl font-semibold text-olympus-green dark:text-white">Página não encontrada</h2>
        <Button asChild className="bg-olympus-green hover:bg-olympus-olive text-white">
          <Link to="/">Voltar ao Início</Link>
        </Button>
      </div>
    </div>
  );
};

function App() {
  const { theme } = useUIStore();
  const { setLoading } = useAuthStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('olympus-auth-storage');
      
      if (token && user) {
        try {
          const userData = JSON.parse(user);
          if (userData.state?.user && userData.state?.isAuthenticated) {
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
        }
      }
      
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
        <Routes>
            {/* ROTAS DE AUTENTICAÇÃO */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* ROTAS DA APLICAÇÃO */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                
                <Route 
                    path="/profile" 
                    element={
                    <ProtectedRoute>
                        <Profile />
                    </ProtectedRoute>
                    } 
                />
                
                <Route 
                    path="/workspaces" 
                    element={
                    <ProtectedRoute>
                        <div className="container mx-auto py-8 px-4">
                        <h1 className="text-3xl font-bold text-olympus-green">Espaços de Trabalho</h1>
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
                        <h1 className="text-3xl font-bold text-olympus-green">Minhas Viagens</h1>
                        <p className="text-muted-foreground mt-2">Em desenvolvimento...</p>
                        </div>
                    </ProtectedRoute>
                    } 
                />
            </Route>
            
            <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  MapPin,
  Plus,
  Building,
  Briefcase
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { useAuthStore } from '@/lib/store';
import SearchBar from '@/components/Search/SearchBar';

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.username) {
      return user.username;
    }
    return 'Usuário';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Building className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Olympus</span>
          </Link>

          {/* Barra de Busca Central */}
          <div className="hidden md:flex flex-1 max-w-sm mx-8">
            <SearchBar 
              placeholder="Buscar espaços de trabalho..."
              className="w-full"
            />
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {/* Botão de Tema */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Alternar tema</span>
            </Button>

            {/* Links de Navegação */}
            <Button variant="ghost" asChild>
              <Link to="/workspaces" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Espaços</span>
              </Link>
            </Button>

            <Button variant="ghost" asChild>
              <Link to="/trips" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Viagens</span>
              </Link>
            </Button>

            {/* Botão Cadastrar Espaço */}
            {isAuthenticated && (
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link to="/workspaces/create" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar Espaço
                </Link>
              </Button>
            )}

            {/* Menu do Usuário */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={getUserDisplayName(user)} />
                      <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{getUserDisplayName(user)}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile/reviews" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Minhas Avaliações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Cadastrar Espaço no mobile */}
                  <DropdownMenuItem asChild className="sm:hidden">
                    <Link to="/workspaces/create" className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Cadastrar Espaço
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Cadastrar</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>

        {/* Barra de Busca Mobile */}
        <div className="md:hidden pb-4">
          <SearchBar 
            placeholder="Buscar espaços de trabalho..."
            className="w-full"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
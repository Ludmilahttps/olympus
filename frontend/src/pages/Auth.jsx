import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { Logo } from '@/components/Logo';

// IMPORTS DE LAYOUT PARA O FUNDO
import Header from '@/components/Layout/Header';
import Home from './Home'; // <--- AGORA IMPORTA DIRETO DA MESMA PASTA

// Ícone do Google
const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthPage = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  useEffect(() => {
    if (location.pathname === '/register') {
      setIsRightPanelActive(true);
    } else {
      setIsRightPanelActive(false);
    }
  }, [location.pathname]);

  const togglePanel = (toRegister) => {
    setIsRightPanelActive(toRegister);
    window.history.pushState(null, '', toRegister ? '/register' : '/login');
  };

  // --- LOGIN LOGIC ---
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [isLoadingLogin, setIsLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (loginError) setLoginError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoadingLogin(true);
    setLoginError('');
    try {
      const response = await authAPI.login(loginData);
      const { user, tokens } = response.data;
      login(user, tokens);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
        console.error(err);
        const msg = err.response?.data?.message || 'Erro ao fazer login.';
        setLoginError(msg);
    } finally {
      setIsLoadingLogin(false);
    }
  };

  // --- REGISTER LOGIC ---
  const [regData, setRegData] = useState({ email: '', first_name: '', last_name: '', password: '', password_confirm: '' });
  const [showRegPass, setShowRegPass] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoadingReg, setIsLoadingReg] = useState(false);
  const [regErrors, setRegErrors] = useState({});
  const [regGeneralError, setRegGeneralError] = useState('');

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegData(prev => ({ ...prev, [name]: value }));
    if (regErrors[name]) setRegErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!regData.first_name.trim()) newErrors.first_name = 'Nome obrigatório';
    if (!regData.email.trim()) newErrors.email = 'Email obrigatório';
    if (!regData.password || regData.password.length < 8) newErrors.password = 'Mínimo 8 caracteres';
    if (regData.password !== regData.password_confirm) newErrors.password_confirm = 'Senhas não coincidem';
    if (!acceptTerms) newErrors.terms = 'Aceite os termos';
    setRegErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setIsLoadingReg(true);
    setRegGeneralError('');
    const generatedUsername = `${regData.first_name.trim().toLowerCase()}.${regData.last_name.trim().toLowerCase() || ''}`.replace(/\s+/g, '');
    const finalData = { ...regData, username: generatedUsername };

    try {
      const response = await authAPI.register(finalData);
      const { user, tokens } = response.data;
      login(user, tokens);
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
        if (err.response?.data?.errors) {
            setRegErrors(err.response.data.errors);
        } else {
            setRegGeneralError(err.response?.data?.message || 'Erro ao criar conta.');
        }
    } finally {
      setIsLoadingReg(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-olympus-green overflow-hidden">
      
      {/* CAMADA 1: FUNDO (Header + Home) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden max-h-screen">
         <Header />
         <Home />
      </div>

      {/* CAMADA 2: MODAL FOSCO */}
      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm transition-all duration-500"></div>

      {/* BOTÃO FECHAR */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all cursor-pointer border border-white/20 shadow-lg group"
      >
        <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* CAMADA 3: CARTÃO */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        
        <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
            
            {/* SIGN UP */}
            <div className="form-container sign-up-container bg-olympus-cream">
                <Logo variant="symbol" className="h-12 w-auto text-olympus-green mb-2" />
                <h1 className="text-2xl font-bold mb-4 font-serif text-olympus-green">Criar Conta</h1>
                <div className="social-container mb-4 w-full flex justify-center">
                    <Button variant="outline" className="w-full max-w-xs border-olympus-olive/30 hover:bg-white hover:text-olympus-green flex items-center justify-center gap-2">
                        <GoogleIcon /><span className="text-xs font-bold text-gray-600">Continuar com Google</span>
                    </Button>
                </div>
                <span className="text-xs text-olympus-olive mb-4">ou use seu email</span>
                <form onSubmit={handleRegSubmit} className="w-full overflow-y-auto max-h-[400px] px-2 space-y-3 custom-scrollbar">
                    {regGeneralError && <Alert variant="destructive"><AlertDescription>{regGeneralError}</AlertDescription></Alert>}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1 text-left">
                            <Input name="first_name" placeholder="Nome" value={regData.first_name} onChange={handleRegChange} className="bg-transparent border-0 border-b-2 border-olympus-olive rounded-none focus:border-olympus-terra px-1" />
                            {regErrors.first_name && <p className="text-xs text-olympus-burgundy">{regErrors.first_name}</p>}
                        </div>
                        <div className="space-y-1 text-left">
                            <Input name="last_name" placeholder="Sobrenome" value={regData.last_name} onChange={handleRegChange} className="bg-transparent border-0 border-b-2 border-olympus-olive rounded-none focus:border-olympus-terra px-1" />
                        </div>
                    </div>
                    <div className="space-y-1 text-left">
                        <Input name="email" type="email" placeholder="Email" value={regData.email} onChange={handleRegChange} className="bg-transparent border-0 border-b-2 border-olympus-olive rounded-none focus:border-olympus-terra px-1" />
                        {regErrors.email && <p className="text-xs text-olympus-burgundy">{regErrors.email}</p>}
                    </div>
                    <div className="relative text-left">
                        <Input name="password" type={showRegPass ? "text" : "password"} placeholder="Senha" value={regData.password} onChange={handleRegChange} className="bg-transparent border-0 border-b-2 border-olympus-olive rounded-none focus:border-olympus-terra px-1" />
                        <button type="button" onClick={() => setShowRegPass(!showRegPass)} className="absolute right-2 top-2 text-olympus-olive"><Eye className="h-4 w-4"/></button>
                        {regErrors.password && <p className="text-xs text-olympus-burgundy">{regErrors.password}</p>}
                    </div>
                    <div className="text-left">
                        <Input name="password_confirm" type="password" placeholder="Confirmar Senha" value={regData.password_confirm} onChange={handleRegChange} className="bg-transparent border-0 border-b-2 border-olympus-olive rounded-none focus:border-olympus-terra px-1" />
                        {regErrors.password_confirm && <p className="text-xs text-olympus-burgundy">{regErrors.password_confirm}</p>}
                    </div>
                    <div className="flex items-center space-x-2 mt-2 justify-center sm:justify-start">
                        <Checkbox id="terms" checked={acceptTerms} onCheckedChange={setAcceptTerms} className="border-olympus-olive data-[state=checked]:bg-olympus-terra" />
                        <Label htmlFor="terms" className="text-xs">Aceito os termos.</Label>
                    </div>
                    {regErrors.terms && <p className="text-xs text-olympus-burgundy text-left">{regErrors.terms}</p>}
                    <Button type="submit" disabled={isLoadingReg} className="w-full mt-4 bg-olympus-terra hover:bg-[#7a3426] text-white rounded-full font-bold tracking-wider uppercase">
                        {isLoadingReg ? <Loader2 className="animate-spin h-4 w-4"/> : 'Cadastrar'}
                    </Button>
                    <div className="mt-4 md:hidden text-sm">
                        <span className="text-olympus-olive">Já tem uma conta? </span>
                        <button type="button" onClick={() => togglePanel(false)} className="text-olympus-terra font-bold hover:underline">Entrar</button>
                    </div>
                </form>
            </div>

            {/* SIGN IN */}
            <div className="form-container sign-in-container bg-olympus-cream">
                <div className="mb-6"><Logo variant="full" className="h-16 w-auto text-olympus-green" /></div>
                <div className="social-container mb-6 w-full flex justify-center">
                    <Button variant="outline" className="w-full max-w-xs border-olympus-olive/30 hover:bg-white hover:text-olympus-green flex items-center justify-center gap-2">
                        <GoogleIcon /><span className="text-xs font-bold text-gray-600">Entrar com Google</span>
                    </Button>
                </div>
                <span className="text-xs text-olympus-olive mb-6">ou use sua conta</span>
                <form onSubmit={handleLoginSubmit} className="w-full space-y-4">
                    {loginError && <Alert variant="destructive" className="py-2"><AlertDescription>{loginError}</AlertDescription></Alert>}
                    <div className="text-left relative">
                        <Mail className="absolute left-0 top-3 h-4 w-4 text-olympus-olive" />
                        <Input name="email" type="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} className="pl-6 bg-transparent border-0 border-b-2 border-olympus-olive rounded-none focus:border-olympus-terra" />
                    </div>
                    <div className="text-left relative">
                        <Lock className="absolute left-0 top-3 h-4 w-4 text-olympus-olive" />
                        <Input name="password" type={showLoginPass ? "text" : "password"} placeholder="Senha" value={loginData.password} onChange={handleLoginChange} className="pl-6 bg-transparent border-0 border-b-2 border-olympus-olive rounded-none focus:border-olympus-terra" />
                        <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-2 top-3 text-olympus-olive"><Eye className="h-4 w-4"/></button>
                    </div>
                    <a href="/forgot-password" class="text-xs text-olympus-green hover:underline mt-2 block mb-4">Esqueceu sua senha?</a>
                    <Button type="submit" disabled={isLoadingLogin} className="w-full bg-olympus-terra hover:bg-[#7a3426] text-white rounded-full font-bold tracking-wider uppercase py-6">
                        {isLoadingLogin ? <Loader2 className="animate-spin h-4 w-4"/> : 'Entrar'}
                    </Button>
                    <div className="mt-6 md:hidden text-sm">
                        <span className="text-olympus-olive">Não tem conta? </span>
                        <button type="button" onClick={() => togglePanel(true)} className="text-olympus-terra font-bold hover:underline">Cadastre-se</button>
                    </div>
                </form>
            </div>

            {/* OVERLAY DESKTOP */}
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left text-white">
                        <Logo variant="full" className="h-20 mb-4 text-white" />
                        <h1 className="text-3xl font-bold mb-4 font-serif">Bem-vindo de volta!</h1>
                        <p className="mb-8 font-light text-sm">Para se manter conectado com os melhores espaços, faça login.</p>
                        <button onClick={() => togglePanel(false)} className="bg-transparent border border-white text-white rounded-full px-12 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-olympus-green transition-colors cursor-pointer">Entrar</button>
                    </div>
                    <div className="overlay-panel overlay-right text-white">
                        <Logo variant="symbol" className="h-16 mb-4 text-white" />
                        <h1 className="text-3xl font-bold mb-4 font-serif">Olá, Explorador!</h1>
                        <p className="mb-8 font-light text-sm">Comece sua jornada e descubra workspaces incríveis.</p>
                        <button onClick={() => togglePanel(true)} className="bg-transparent border border-white text-white rounded-full px-12 py-3 font-bold uppercase tracking-wider hover:bg-white hover:text-olympus-green transition-colors cursor-pointer">Cadastrar</button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;
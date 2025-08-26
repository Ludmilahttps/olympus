# Olympus Frontend

Interface moderna e responsiva para a plataforma Olympus - Sistema de gerenciamento de espaços de trabalho para nômades digitais.

## 🏗️ Tecnologias

- **React 18** - Biblioteca JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI modernos
- **React Router** - Roteamento
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
olympus-frontend/
├── public/                # Arquivos públicos
├── src/
│   ├── assets/           # Recursos estáticos (imagens, etc.)
│   ├── components/       # Componentes React
│   │   ├── ui/          # Componentes UI base (shadcn/ui)
│   │   ├── Layout/      # Componentes de layout
│   │   ├── Auth/        # Componentes de autenticação
│   │   ├── Workspace/   # Componentes de espaços
│   │   └── Trip/        # Componentes de viagens
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitários e configurações
│   │   ├── api.js       # Configuração da API
│   │   ├── store.js     # Store Zustand
│   │   └── utils.js     # Funções utilitárias
│   ├── pages/           # Páginas da aplicação
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos globais
│   └── main.jsx         # Ponto de entrada
├── .env.example         # Exemplo de variáveis de ambiente
├── package.json         # Dependências e scripts
├── tailwind.config.js   # Configuração do Tailwind
├── vite.config.js       # Configuração do Vite
└── README.md            # Este arquivo
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- pnpm (recomendado) ou npm
- Git

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd olympus-frontend
```

### 2. Instale as dependências

```bash
# Usando pnpm (recomendado)
pnpm install

# Ou usando npm
npm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite o arquivo .env.local com suas configurações
# Para desenvolvimento local, use:
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Inicie o servidor de desenvolvimento

```bash
# Usando pnpm
pnpm run dev

# Ou usando npm
npm run dev
```

A aplicação estará disponível em: `http://localhost:5173`

## 📱 Funcionalidades

### 🔐 Autenticação
- Login e registro de usuários
- Recuperação de senha
- Perfil do usuário
- Logout automático

### 🏢 Espaços de Trabalho
- Listagem de espaços com filtros
- Busca por localização e características
- Visualização detalhada dos espaços
- Sistema de avaliações
- Galeria de imagens

### ✈️ Viagens
- Planejamento de viagens
- Adição de espaços às viagens
- Itinerário detalhado
- Controle de orçamento

### 👤 Perfil
- Edição de informações pessoais
- Histórico de viagens
- Espaços favoritos
- Configurações da conta

## 🎨 Design System

### Cores
- **Primary**: Azul moderno (#3B82F6)
- **Secondary**: Cinza neutro (#6B7280)
- **Success**: Verde (#10B981)
- **Warning**: Amarelo (#F59E0B)
- **Error**: Vermelho (#EF4444)

### Tipografia
- **Heading**: Inter (Bold)
- **Body**: Inter (Regular)
- **Code**: JetBrains Mono

### Componentes
Todos os componentes seguem o design system do shadcn/ui com customizações para o tema Olympus.

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev          # Inicia servidor de desenvolvimento
pnpm run dev --host   # Inicia servidor acessível na rede

# Build
pnpm run build        # Gera build de produção
pnpm run preview      # Preview do build de produção

# Qualidade de código
pnpm run lint         # Executa ESLint
pnpm run lint:fix     # Corrige problemas do ESLint automaticamente

# Testes (se configurado)
pnpm run test         # Executa testes
pnpm run test:watch   # Executa testes em modo watch
```

## 🌐 Deploy

### Build para Produção

```bash
# Gerar build otimizado
pnpm run build

# Os arquivos estarão na pasta 'dist/'
```

### Variáveis de Ambiente para Produção

```bash
# .env.production
VITE_API_BASE_URL=https://api.olympus.com/api
VITE_APP_NAME=Olympus
VITE_NODE_ENV=production
```

### Deploy em Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy em Netlify

```bash
# Build e deploy manual
pnpm run build
# Faça upload da pasta 'dist/' no Netlify

# Ou conecte o repositório Git no Netlify
```

### Deploy com Docker

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔌 Integração com Backend

### Configuração da API

O frontend se comunica com o backend através de APIs RESTful. A configuração está em `src/lib/api.js`:

```javascript
// Exemplo de uso
import { authAPI, workspacesAPI } from '@/lib/api';

// Login
const response = await authAPI.login({ email, password });

// Buscar espaços
const workspaces = await workspacesAPI.getAll({ city: 'São Paulo' });
```

### Autenticação

O sistema utiliza JWT tokens armazenados no localStorage:

```javascript
// Token é automaticamente incluído nas requisições
// Refresh automático quando token expira
// Logout automático em caso de erro 401
```

## 🧪 Testes

```bash
# Executar testes unitários
pnpm run test

# Executar testes com coverage
pnpm run test:coverage

# Executar testes E2E (se configurado)
pnpm run test:e2e
```

## 📦 Dependências Principais

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "zustand": "^4.3.0",
  "axios": "^1.3.0",
  "tailwindcss": "^3.2.0",
  "@radix-ui/react-*": "^1.0.0",
  "lucide-react": "^0.220.0",
  "framer-motion": "^10.0.0"
}
```

## 🔧 Configuração do Editor

### VS Code

Extensões recomendadas:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

### Configuração do Prettier

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript quando possível
- Siga os padrões do ESLint configurado
- Componentes devem ter nomes em PascalCase
- Arquivos de componentes devem ter extensão `.jsx`
- Use Tailwind CSS para estilização
- Prefira componentes funcionais com hooks

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas e suporte:
- Email: dev@olympus.com
- Issues: [GitHub Issues](link-para-issues)

---

**Olympus Frontend** - Interface moderna para conectar profissionais aos melhores espaços de trabalho! 🏛️


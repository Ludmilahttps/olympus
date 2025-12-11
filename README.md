# coWorker - Plataforma de Espaços de Trabalho

Uma plataforma moderna para encontrar e reservar espaços de trabalho para nômades digitais e profissionais remotos.

## 🏗️ Arquitetura

Este projeto foi refatorado para uma arquitetura moderna separando frontend e backend:

- **Frontend**: React.js com TypeScript, Tailwind CSS e shadcn/ui
- **Backend**: Django REST Framework com PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)
- **Estado**: Zustand para gerenciamento de estado
- **Estilização**: Tailwind CSS com sistema de design consistente

## 📁 Estrutura do Projeto

```
coworker-refactored/
├── backend/                 # Django REST API
│   ├── backend/            # Configurações do Django
│   ├── users/              # App de usuários
│   ├── workspaces/         # App de espaços de trabalho
│   ├── trips/              # App de viagens
│   ├── categories/         # App de categorias
│   └── manage.py
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── lib/            # Utilitários e configurações
│   │   └── assets/         # Recursos estáticos
│   ├── public/
│   └── package.json
└── README.md
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Python 3.11+
- Node.js 20+
- PostgreSQL 13+
- Git

### Backend (Django)

1. **Clone o repositório e navegue para o backend:**
   ```bash
   cd backend
   ```

2. **Crie um ambiente virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate     # Windows
   ```

3. **Instale as dependências:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure o banco de dados:**
   ```bash
   # Crie um banco PostgreSQL chamado 'coworker'
   createdb coworker
   ```

5. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

6. **Execute as migrações:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Crie um superusuário:**
   ```bash
   python manage.py createsuperuser
   ```

8. **Inicie o servidor:**
   ```bash
   python manage.py runserver
   ```

### Frontend (React)

1. **Navegue para o frontend:**
   ```bash
   cd frontend
   ```

2. **Instale as dependências:**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   # Edite o arquivo .env.local com a URL da API
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   pnpm run dev
   # ou
   npm run dev
   ```

## 🔧 Configuração de Desenvolvimento

### Backend

O backend Django está configurado com:

- **Django REST Framework** para APIs RESTful
- **django-cors-headers** para CORS
- **djangorestframework-simplejwt** para autenticação JWT
- **Pillow** para manipulação de imagens

### Frontend

O frontend React inclui:

- **Vite** como bundler
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Zustand** para gerenciamento de estado
- **React Query** para cache de dados
- **Axios** para requisições HTTP
- **React Router** para roteamento

## 📊 Modelos de Dados

### User (Usuário)
- Modelo customizado baseado no AbstractUser do Django
- Campos adicionais: bio, location, avatar, etc.

### Category (Categoria)
- Categorização dos espaços de trabalho
- Nome, descrição e ícone

### Workspace (Espaço de Trabalho)
- Informações completas do espaço
- Localização, preços, comodidades
- Relacionamento com usuário proprietário

### Trip (Viagem)
- Planejamento de viagens de trabalho
- Relacionamento com usuário e espaços

### Review (Avaliação)
- Sistema de avaliações dos espaços
- Nota e comentários dos usuários

## 🔐 Autenticação

O sistema utiliza JWT para autenticação:

1. **Login**: POST `/api/login/`
2. **Registro**: POST `/api/register/`
3. **Refresh Token**: POST `/api/auth/token/refresh/`
4. **Logout**: POST `/api/auth/logout/`

## 📱 Funcionalidades

### Para Usuários
- ✅ Cadastro e login
- ✅ Busca de espaços de trabalho
- ✅ Filtros avançados (localização, preço, comodidades)
- ✅ Visualização detalhada dos espaços
- ✅ Sistema de avaliações
- ✅ Planejamento de viagens
- ✅ Perfil personalizado

### Para Proprietários
- ✅ Cadastro de espaços
- ✅ Gerenciamento de reservas
- ✅ Upload de imagens
- ✅ Estatísticas de uso

### Administrativas
- ✅ Painel administrativo Django
- ✅ Moderação de conteúdo
- ✅ Relatórios e analytics

## 🎨 Design System

O projeto utiliza um design system consistente baseado em:

- **Cores**: Paleta moderna com modo claro/escuro
- **Tipografia**: Sistema hierárquico de fontes
- **Componentes**: Biblioteca shadcn/ui customizada
- **Ícones**: Lucide React
- **Responsividade**: Mobile-first design

## 🧪 Testes

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
pnpm test
# ou
npm test
```

## 🚀 Deploy

### Backend (Django)
1. Configure as variáveis de ambiente de produção
2. Execute `python manage.py collectstatic`
3. Configure o servidor web (Nginx + Gunicorn)
4. Configure o banco de dados PostgreSQL

### Frontend (React)
1. Execute `pnpm build` para gerar os arquivos de produção
2. Sirva os arquivos estáticos via CDN ou servidor web
3. Configure as variáveis de ambiente de produção

## 📚 API Documentation

A documentação completa da API está disponível em:
- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`

### Principais Endpoints

#### Autenticação
- `POST /api/login/` - Login
- `POST /api/register/` - Registro
- `GET /api/auth/profile/` - Perfil do usuário

#### Espaços de Trabalho
- `GET /api/workspaces/` - Listar espaços
- `POST /api/workspaces/` - Criar espaço
- `GET /api/workspaces/{id}/` - Detalhes do espaço
- `PATCH /api/workspaces/{id}/` - Atualizar espaço

#### Viagens
- `GET /api/trips/` - Listar viagens
- `POST /api/trips/` - Criar viagem
- `GET /api/trips/{id}/` - Detalhes da viagem

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: Equipe coWorker
- **Design**: UI/UX Team
- **Backend**: Django Developers
- **Frontend**: React Developers

## 📞 Suporte

Para suporte e dúvidas:
- Email: suporte@coworker.com
- Discord: [Servidor da Comunidade]
- GitHub Issues: [Reportar Bugs]

---

**coWorker** - Conectando profissionais aos melhores espaços de trabalho do mundo! 🌍
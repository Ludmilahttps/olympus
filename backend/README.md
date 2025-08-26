# Olympus Backend API

API RESTful para a plataforma Olympus - Sistema de gerenciamento de espaços de trabalho para nômades digitais.

## 🏗️ Tecnologias

- **Django 5.0.1** - Framework web
- **Django REST Framework** - API RESTful
- **PostgreSQL** - Banco de dados principal
- **Redis** - Cache e message broker
- **JWT** - Autenticação
- **Celery** - Processamento assíncrono

## 📁 Estrutura do Projeto

```
olympus-backend/
├── olympus_api/           # Configurações do Django
├── users/                 # App de usuários
├── workspaces/           # App de espaços de trabalho
├── trips/                # App de viagens
├── categories/           # App de categorias
├── requirements.txt      # Dependências Python
├── .env.example         # Exemplo de variáveis de ambiente
├── manage.py            # Script de gerenciamento Django
└── README.md            # Este arquivo
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Python 3.11+
- PostgreSQL 13+
- Redis (opcional, para cache)
- Git

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd olympus-backend
```

### 2. Crie um ambiente virtual

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Configure o banco de dados

#### PostgreSQL (Recomendado para produção)

```bash
# Instale o PostgreSQL e crie um banco de dados
createdb olympus

# Ou usando psql
psql -U postgres
CREATE DATABASE olympus;
\q
```

#### SQLite (Para desenvolvimento)

O projeto já está configurado para usar SQLite por padrão. Nenhuma configuração adicional é necessária.

### 5. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite o arquivo .env com suas configurações
# Para desenvolvimento, você pode usar as configurações padrão
```

### 6. Execute as migrações

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Crie um superusuário (opcional)

```bash
python manage.py createsuperuser
```

### 8. Inicie o servidor de desenvolvimento

```bash
python manage.py runserver
```

A API estará disponível em: `http://localhost:8000`

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/register/` - Registro de usuário
- `POST /api/auth/login/` - Login
- `POST /api/auth/token/refresh/` - Renovar token
- `GET /api/auth/profile/` - Perfil do usuário

### Usuários
- `GET /api/users/` - Listar usuários
- `GET /api/users/{id}/` - Detalhes do usuário
- `PATCH /api/users/{id}/` - Atualizar usuário

### Espaços de Trabalho
- `GET /api/workspaces/` - Listar espaços
- `POST /api/workspaces/` - Criar espaço
- `GET /api/workspaces/{id}/` - Detalhes do espaço
- `PATCH /api/workspaces/{id}/` - Atualizar espaço
- `DELETE /api/workspaces/{id}/` - Excluir espaço

### Viagens
- `GET /api/trips/` - Listar viagens
- `POST /api/trips/` - Criar viagem
- `GET /api/trips/{id}/` - Detalhes da viagem
- `PATCH /api/trips/{id}/` - Atualizar viagem

### Categorias
- `GET /api/categories/` - Listar categorias
- `POST /api/categories/` - Criar categoria

## 🔧 Configuração para Produção

### 1. Variáveis de Ambiente

```bash
# .env para produção
SECRET_KEY=sua-chave-secreta-super-segura
DEBUG=False
ALLOWED_HOSTS=seudominio.com,www.seudominio.com
DATABASE_URL=postgresql://user:password@localhost:5432/olympus
```

### 2. Colete arquivos estáticos

```bash
python manage.py collectstatic
```

### 3. Configure o servidor web

#### Usando Gunicorn

```bash
# Instalar Gunicorn (já incluído no requirements.txt)
pip install gunicorn

# Executar
gunicorn olympus_api.wsgi:application --bind 0.0.0.0:8000
```

#### Usando Nginx (recomendado)

```nginx
server {
    listen 80;
    server_name seudominio.com;

    location /static/ {
        alias /caminho/para/olympus-backend/staticfiles/;
    }

    location /media/ {
        alias /caminho/para/olympus-backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🧪 Testes

```bash
# Executar todos os testes
python manage.py test

# Executar testes com coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

## 📚 Documentação da API

A documentação interativa da API está disponível em:

- **Swagger UI**: `http://localhost:8000/api/docs/`
- **ReDoc**: `http://localhost:8000/api/redoc/`

## 🔒 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos:

1. Faça login em `/api/auth/login/` para obter os tokens
2. Inclua o token de acesso no header: `Authorization: Bearer <seu-token>`
3. Use o token de refresh para renovar tokens expirados

## 🐳 Docker (Opcional)

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "olympus_api.wsgi:application", "--bind", "0.0.0.0:8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      POSTGRES_DB: olympus
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas e suporte:
- Email: dev@olympus.com
- Issues: [GitHub Issues](link-para-issues)

---

**Olympus Backend** - Conectando profissionais aos melhores espaços de trabalho! 🏛️


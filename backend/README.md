# 5K Platform - Backend

Sistema de gestão de vendedores e leads com QR Codes para rastreamento.

## 🚀 Funcionalidades

### Administração
- ✅ Autenticação com JWT (login/registro)
- ✅ Gestão de usuários administrativos
- ✅ CRUD completo de vendedores
- ✅ CRUD completo de leads
- ✅ Dashboard com estatísticas
- ✅ Upload de arquivos (fotos, documentos)

### Vendedores
- ✅ Cadastro com dados pessoais e Pix
- ✅ Geração automática de QR Code único
- ✅ Visualização de leads vinculados
- ✅ Estatísticas de conversão
- ✅ Ativar/desativar perfis

### Leads (Clientes em Potencial)
- ✅ Formulário público via QR Code
- ✅ Upload de conta de energia e foto do telhado
- ✅ Status: Comprou, Negociando, Não Comprou
- ✅ Rastreamento de origem (vendedor)

### QR Codes
- ✅ Geração automática de imagem
- ✅ Rastreamento de scans
- ✅ Vinculação automática de leads

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- MinIO (ou S3)
- Docker (opcional)

## 🔧 Instalação

1. **Clone o repositório**
```bash
cd backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Execute as migrações do Prisma**
```bash
npm run prisma:migrate
```

5. **Execute o seed (usuário admin padrão)**
```bash
npm run prisma:seed
```

6. **Inicie o servidor**
```bash
npm run dev
```

## 📚 API Endpoints

### 🔐 Autenticação (`/api/auth`)

#### Registro de Admin
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@exemplo.com",
  "password": "senha123",
  "name": "Nome do Admin"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@exemplo.com",
  "password": "senha123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### 👥 Vendedores (`/api/person`)

#### Criar Vendedor
```http
POST /api/person
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "phone": "(11) 99999-9999",
  "pixKey": "joao@exemplo.com",
  "photoUrl": "/uploads/profiles/foto.jpg"
}
```

#### Listar Vendedores
```http
GET /api/person?active=true
Authorization: Bearer {token}
```

#### Buscar por ID
```http
GET /api/person/{id}
Authorization: Bearer {token}
```

#### Estatísticas do Vendedor
```http
GET /api/person/{id}/stats
Authorization: Bearer {token}
```

#### Atualizar Vendedor
```http
PUT /api/person/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "active": false
}
```

#### Deletar Vendedor (soft delete)
```http
DELETE /api/person/{id}
Authorization: Bearer {token}
```

### 📋 Leads (`/api/lead`)

#### Criar Lead
```http
POST /api/lead
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Maria Santos",
  "email": "maria@exemplo.com",
  "phone": "(11) 88888-8888",
  "energyBill": "/uploads/energy-bills/conta.pdf",
  "roofPhoto": "/uploads/roof-photos/telhado.jpg",
  "ownerId": "vendedor-id"
}
```

#### Listar Leads
```http
GET /api/lead?status=NEGOTIATION&ownerId={id}
Authorization: Bearer {token}
```

#### Leads de um Vendedor
```http
GET /api/lead/owner/{ownerId}
Authorization: Bearer {token}
```

#### Atualizar Status
```http
PATCH /api/lead/{id}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "BOUGHT"
}
```

#### Estatísticas de Leads
```http
GET /api/lead/stats
Authorization: Bearer {token}
```

### 📱 QR Code (`/api/qrcode`)

#### Registrar Scan (Público)
```http
POST /api/qrcode/scan/{qrCode}
```

#### Criar Lead via QR Code (Público)
```http
POST /api/qrcode/lead/{qrCode}
Content-Type: application/json

{
  "name": "Cliente Nome",
  "email": "cliente@exemplo.com",
  "phone": "(11) 77777-7777",
  "energyBill": "/uploads/energy-bills/conta.pdf",
  "roofPhoto": "/uploads/roof-photos/telhado.jpg"
}
```

#### Histórico de Scans
```http
GET /api/qrcode/scans/{personId}
Authorization: Bearer {token}
```

### 📤 Upload (`/api/upload`)

#### Upload de Foto de Perfil
```http
POST /api/upload/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [arquivo]
```

#### Upload de Conta de Energia (Público)
```http
POST /api/upload/energy-bill
Content-Type: multipart/form-data

file: [arquivo]
```

#### Upload de Foto do Telhado (Público)
```http
POST /api/upload/roof-photo
Content-Type: multipart/form-data

file: [arquivo]
```

## 🗂️ Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── config/
│   │   └── env.ts         # Configurações de ambiente
│   ├── controllers/       # Controladores
│   ├── database/
│   │   └── prisma.ts      # Cliente Prisma
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── routes/            # Rotas da API
│   ├── services/          # Lógica de negócio
│   ├── utils/             # Utilitários
│   ├── app.ts             # Configuração Express
│   └── server.ts          # Servidor HTTP
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔑 Credenciais Padrão

Após executar o seed:
- **Email:** admin@5kplatform.com
- **Senha:** admin123

⚠️ **IMPORTANTE:** Altere essas credenciais em produção!

## 🐳 Docker

Para rodar com Docker Compose (na raiz do projeto):

```bash
docker-compose up -d
```

## 📊 Prisma Studio

Para visualizar o banco de dados:

```bash
npm run prisma:studio
```

## 🧪 Status dos Leads

- `BOUGHT` - Comprou
- `NEGOTIATION` - Negociando
- `CANCELLED` - Não Comprou

## 🔐 Autenticação

Todas as rotas protegidas requerem o header:
```
Authorization: Bearer {token}
```

O token é obtido no login e tem validade de 7 dias (configurável).

## 📝 Notas

- Arquivos são armazenados no MinIO (S3-compatible)
- QR Codes são gerados automaticamente ao criar um vendedor
- Scans são rastreados automaticamente
- Soft delete nos vendedores (apenas desativa)

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento
- `npm run build` - Compila TypeScript
- `npm start` - Inicia em produção
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:studio` - Abre Prisma Studio
- `npm run prisma:seed` - Popula banco com dados iniciais

## 📄 Licença

Proprietary - 5K Platform
# 5K Platform - Frontend

Frontend da plataforma de gestão de vendedores e leads.

## 🚀 Tecnologias

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Axios
- React Hook Form
- Zustand
- React Icons

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração

```bash
cp .env.example .env.local
# Edite NEXT_PUBLIC_API_URL
```

## 🏃 Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## 🏗️ Build

```bash
npm run build
npm start
```

## 🐳 Docker

```bash
docker build -t 5kplatform-frontend .
docker run -p 3000:3000 5kplatform-frontend
```

## 📁 Estrutura

- `src/app` - Páginas (App Router)
- `src/components` - Componentes reutilizáveis
- `src/lib` - Utilitários e API
- `src/types` - Tipos TypeScript
- `src/store` - Estado global (Zustand)
- `src/hooks` - Custom hooks

## 🔐 Login Padrão

Email: admin@5kplatform.com
Senha: admin123

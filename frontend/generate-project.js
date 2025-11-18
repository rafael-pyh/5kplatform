const fs = require('fs');
const path = require('path');

// Este script gera todos os arquivos necessários para o frontend

const files = {
  // Types
  'src/types/index.ts': `export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface Vendedor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoUrl?: string;
  qrCode: string;
  qrCodeUrl?: string;
  active: boolean;
  scanCount: number;
  createdAt: string;
  _count?: {
    leads: number;
    qrCodeScans: number;
  };
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  status: 'BOUGHT' | 'CANCELLED' | 'NEGOTIATION';
  notes?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  bought: number;
  negotiation: number;
  cancelled: number;
  conversionRate: string;
}`,

  // API Client
  'src/lib/api.ts': `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;`,

  // Root Layout
  'src/app/layout.tsx': `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '5K Platform',
  description: 'Plataforma de gestão de vendedores e leads',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}`,

  // Home Page (redirect to dashboard)
  'src/app/page.tsx': `'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}`,

  // README
  'README.md': `# 5K Platform - Frontend

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

\`\`\`bash
npm install
\`\`\`

## 🔧 Configuração

\`\`\`bash
cp .env.example .env.local
# Edite NEXT_PUBLIC_API_URL
\`\`\`

## 🏃 Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:3000

## 🏗️ Build

\`\`\`bash
npm run build
npm start
\`\`\`

## 🐳 Docker

\`\`\`bash
docker build -t 5kplatform-frontend .
docker run -p 3000:3000 5kplatform-frontend
\`\`\`

## 📁 Estrutura

- \`src/app\` - Páginas (App Router)
- \`src/components\` - Componentes reutilizáveis
- \`src/lib\` - Utilitários e API
- \`src/types\` - Tipos TypeScript
- \`src/store\` - Estado global (Zustand)
- \`src/hooks\` - Custom hooks

## 🔐 Login Padrão

Email: admin@5kplatform.com
Senha: admin123
`,
};

console.log('🚀 Gerando arquivos do frontend...\n');

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  // Criar diretórios
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Criar arquivo
  fs.writeFileSync(fullPath, content);
  console.log(`✅ Criado: ${filePath}`);
});

console.log(`\n✅ Total: ${Object.keys(files).length} arquivos criados!`);
console.log(`\n📝 Próximos passos:`);
console.log(`1. npm install`);
console.log(`2. cp .env.example .env.local`);
console.log(`3. npm run dev`);

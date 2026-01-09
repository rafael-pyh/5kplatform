'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { Button } from '@/components/ui';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redireciona para o dashboard apropriado após 3 segundos
    const timer = setTimeout(() => {
      if (user?.role === 'SELLER' || user?.role === 'AFFILIATE') {
        router.push('/seller/dashboard');
      } else if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Acesso Negado</h1>
        <p className="text-slate-600 mb-2">Você não tem permissão para acessar esta página.</p>
        <p className="text-sm text-slate-500 mb-8">
          Você será redirecionado em breve...
        </p>

        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>

        <Button
          onClick={() => {
            if (user?.role === 'SELLER' || user?.role === 'AFFILIATE') {
              router.push('/seller/dashboard');
            } else if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
              router.push('/dashboard');
            } else {
              router.push('/login');
            }
          }}
          variant="gradient"
          className="mt-8 px-6 py-2"
        >
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}

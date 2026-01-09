'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [message, setMessage] = useState('Verificando credenciais...');

  useEffect(() => {
    if (isLoading) {
      setMessage('Verificando credenciais...');
      return;
    }

    // Se o usuário está autenticado, redireciona para o dashboard apropriado
    if (user) {
      const role = user.role;
      if (role === 'SELLER' || role === 'AFFILIATE') {
        setMessage(`Bem-vindo, ${user.name || 'vendedor'}! Redirecionando para seu dashboard...`);
        setTimeout(() => {
          router.replace('/seller/dashboard');
        }, 1000);
      } else if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
        setMessage(`Bem-vindo, ${user.name || 'administrador'}! Redirecionando para o painel...`);
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1000);
      } else {
        setMessage('Redirecionando...');
        setTimeout(() => {
          router.replace('/');
        }, 1000);
      }
    } else {
      // Se não está autenticado, volta para login
      setMessage('Autenticação falhou. Redirecionando para login...');
      setTimeout(() => {
        router.replace('/login');
      }, 1500);
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        </div>
        <p className="text-slate-600 font-medium">{message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}

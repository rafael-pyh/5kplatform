'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Aguarda o AuthContext terminar de carregar
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Se autenticado, redireciona para o dashboard baseado no role
        if (user.role === 'SELLER') {
          router.push('/seller/dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        // Se não autenticado, vai para login
        router.push('/login');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);
}
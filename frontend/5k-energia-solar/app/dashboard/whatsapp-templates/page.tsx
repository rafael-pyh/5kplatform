'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import WhatsappTemplatesManager from '@/components/leads/WhatsappTemplatesManager';

export default function WhatsappTemplatesPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obter token do localStorage
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      router.push('/login');
      return;
    }

    // Validar permissões do usuário
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Apenas admins podem gerenciar templates
        if (!['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
          router.push('/unauthorized');
          return;
        }
      } catch (error) {
        console.error('Erro ao parsear usuário:', error);
        router.push('/login');
        return;
      }
    }

    setToken(storedToken);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-8 mt-18 flex items-center justify-center">
          <div className="text-gray-600">Carregando...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 p-8 mt-18 max-w-6xl mx-auto">
        <WhatsappTemplatesManager token={token || undefined} />
      </div>
    </DashboardLayout>
  );
}

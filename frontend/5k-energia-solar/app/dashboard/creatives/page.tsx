'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import CreativesUploadForm from '@/components/CreativesUploadForm';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Creative {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  type: string;
  tags?: string;
  downloadCount: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function CreativesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Verificar se é admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Carregar criativos
  useEffect(() => {
    const fetchCreatives = async () => {
      try {
        setLoading(true);
        const response = await api.get<any>('/creatives?limit=100');
        setCreatives(response.data.data.criativos || []);
      } catch (error) {
        console.error('Erro ao carregar criativos:', error);
        toast.error('Erro ao carregar criativos');
      } finally {
        setLoading(false);
      }
    };

    fetchCreatives();
  }, [refreshTrigger]);

  const handleDeleteCreative = async (creativeId: string) => {
    if (!confirm('Tem certeza que deseja deletar este criativo?')) return;

    try {
      await api.delete(`/creatives/${creativeId}`);
      toast.success('Criativo deletado com sucesso');
      setRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error('Erro ao deletar criativo:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao deletar criativo';
      toast.error(errorMsg);
    }
  };

  const handleCreativeUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className= "sticky top-0 z-10 mb-8">
          <h1 className="text-2xl font-bold text-gray-700">Gerenciar Criativos</h1>
          <p className="text-gray-600 mt-1">Faça upload e gerencie as placas/criativos disponíveis para os usuários</p>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário de upload */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Novo Criativo</h2>
                </div>
                <div className="p-6">
                  <CreativesUploadForm onSuccess={handleCreativeUploaded} />
                </div>
              </div>
            </div>

            {/* Lista de criativos */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Criativos Cadastrados</h2>
                    <p className="text-gray-600 text-sm mt-1">{creatives.length} criativo(s) no total</p>
                  </div>
                </div>

                {loading ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Carregando criativos...</p>
                  </div>
                ) : creatives.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-4xl mb-3">🎨</div>
                    <p className="text-gray-500">Nenhum criativo cadastrado ainda</p>
                    <p className="text-gray-400 text-sm mt-2">Comece a subir criativos usando o formulário ao lado</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {creatives.map((creative) => (
                      <div key={creative.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
                            <img
                              src={creative.imageUrl}
                              alt={creative.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Informações */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate">{creative.name}</h3>
                            {creative.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{creative.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                              <span>👤 {creative.uploadedBy?.name || 'Admin'}</span>
                              <span>📅 {new Date(creative.createdAt).toLocaleDateString('pt-BR')}</span>
                              <span>📥 {creative.downloadCount} downloads</span>
                              {creative.tags && <span>🏷️ {creative.tags}</span>}
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleDeleteCreative(creative.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Deletar criativo"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

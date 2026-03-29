'use client';

import DashboardLayout from '@/components/DashboardLayout';
import CreativesUploadCard from '@/components/creatives/CreativesUploadCard';
import CreativesList from '@/components/creatives/CreativesList';
import useCreatives from '@/hooks/useCreatives';

export default function CreativesPage() {
  const { creatives, loading, handleDeleteCreative, handleCreativeUploaded, user } = useCreatives();

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col">
        <div className="mb-2 md:mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Gerenciar Criativos</h1>
          <p className="text-gray-600 mt-1">Faça upload e gerencie as placas/criativos disponíveis para os usuários</p>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <CreativesUploadCard onSuccess={handleCreativeUploaded} />

            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Criativos Cadastrados</h2>
                    <p className="text-gray-600 text-sm mt-1">{creatives.length} criativo(s) no total</p>
                  </div>
                </div>

                <CreativesList creatives={creatives} loading={loading} onDelete={handleDeleteCreative} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

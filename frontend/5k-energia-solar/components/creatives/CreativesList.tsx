"use client";

import React from 'react';

type Creative = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  downloadCount: number;
  uploadedBy?: { id: string; name: string };
  createdAt: string;
  tags?: string;
};

const CreativesList = ({ creatives, loading, onDelete }: { creatives: Creative[]; loading: boolean; onDelete: (id: string) => void }) => {
  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Carregando criativos...</p>
      </div>
    );
  }

  if (!creatives || creatives.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-4xl mb-3">🎨</div>
        <p className="text-gray-500">Nenhum criativo cadastrado ainda</p>
        <p className="text-gray-400 text-sm mt-2">Comece a subir criativos usando o formulário ao lado</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {creatives.map((creative) => (
        <div key={creative.id} className="p-6 hover:bg-gray-50 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-200">
              <img src={creative.imageUrl} alt={creative.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 truncate">{creative.name}</h3>
              {creative.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{creative.description}</p>}
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                <span>👤 {creative.uploadedBy?.name || 'Admin'}</span>
                <span>📅 {new Date(creative.createdAt).toLocaleDateString('pt-BR')}</span>
                <span>📥 {creative.downloadCount} downloads</span>
                {creative.tags && <span>🏷️ {creative.tags}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => onDelete(creative.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Deletar criativo">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreativesList;

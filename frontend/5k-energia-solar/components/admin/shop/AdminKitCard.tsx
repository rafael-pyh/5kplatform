'use client';

import { Kit } from '@/lib/types/shop.types';
import { useState } from 'react';

interface AdminKitCardProps {
  kit: Kit;
  onEdit: (kit: Kit) => void;
  onDelete: (id: string) => void;
  onImageUpload?: (id: string) => void;
}

export function AdminKitCard({ kit, onEdit, onDelete, onImageUpload }: AdminKitCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja deletar o kit "${kit.name}"?`)) {
      setIsDeleting(true);
      try {
        onDelete(kit.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const totalItems = kit.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagem do Kit */}
      <div className="relative h-48 bg-linear-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        {kit.imageUrl ? (
          <img
            src={kit.imageUrl}
            alt={kit.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-16 h-16 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8 4m-8-4v10M7 12v10m6-10v10"
            />
          </svg>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{kit.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{kit.sku}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              kit.active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {kit.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {kit.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {kit.description}
          </p>
        )}

        {/* Informações do Kit */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-50 rounded p-2">
            <p className="text-xs text-gray-600">Preço Total</p>
            <p className="font-bold text-blue-600">R$ {Number(kit.price || 0).toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <p className="text-xs text-gray-600">Itens</p>
            <p className="font-bold text-purple-600">{totalItems} un.</p>
          </div>
        </div>

        {/* Lista de Produtos */}
        {kit.items && kit.items.length > 0 && (
          <div className="bg-gray-50 rounded p-3 mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Componentes do Kit:
            </p>
            <ul className="space-y-1">
              {kit.items.slice(0, 3).map((item) => (
                <li key={item.id} className="text-xs text-gray-600">
                  • {item.product?.name || 'Produto'} ({item.quantity}x)
                </li>
              ))}
              {kit.items.length > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{kit.items.length - 3} item(ns)
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Tags */}
        {kit.tags && kit.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {kit.tags.split(',').map((tag) => (
              <span
                key={tag.trim()}
                className="text-xs bg-gray-100 text-gray-700 rounded-full px-2 py-1"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {onImageUpload && (
            <button
              onClick={() => onImageUpload(kit.id)}
              className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-medium transition-colors"
            >
              📷 Imagem
            </button>
          )}
          <button
            onClick={() => onEdit(kit)}
            className="flex-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded font-medium transition-colors"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded font-medium transition-colors disabled:opacity-50"
          >
            {isDeleting ? '⏳' : '🗑️'} Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Product } from '@/lib/types/shop.types';
import { useState } from 'react';

interface AdminProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onImageUpload: (id: string) => void;
}

export function AdminProductCard({
  product,
  onEdit,
  onDelete,
  onImageUpload,
}: AdminProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm(`Tem certeza que deseja deletar o produto "${product.name}"?`)) {
      setIsDeleting(true);
      try {
        onDelete(product.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Imagem do Produto */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0].imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <svg
            className="w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.sku}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              product.active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {product.active ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-blue-50 rounded p-2">
            <p className="text-xs text-gray-600">Preço</p>
            <p className="font-bold text-blue-600">R$ {(Number(product.price) || 0).toFixed(2)}</p>
          </div>
          <div className="bg-purple-50 rounded p-2">
            <p className="text-xs text-gray-600">Estoque</p>
            <p className="font-bold text-purple-600">{product.stock} un.</p>
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.split(',').map((tag) => (
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
          <button
            onClick={() => onImageUpload(product.id)}
            className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-medium transition-colors"
          >
            📷 Imagem
          </button>
          <button
            onClick={() => onEdit(product)}
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

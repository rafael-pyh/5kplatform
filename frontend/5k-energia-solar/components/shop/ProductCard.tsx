'use client';

import { Product } from '@/lib/types/shop.types';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../ui';

interface ProductCardProps {
  product: Product;
  onOrderClick: (product: Product) => void;
}

export function ProductCard({ product, onOrderClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  // Não mostrar produtos inativos ou sem estoque
  if (!product.active || product.stock <= 0) {
    return null;
  }

  return (
    <div className="flex flex-col justify-between h-full rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Imagem */}
      <div className="relative h-48 w-full bg-gray-100">
        {product.images && product.images.length > 0 && !imageError ? (
          <Image
            src={product.images[0].imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-green-50 to-green-100">
            <div className="text-center">
              <div className="text-4xl text-green-300">📦</div>
              <p className="text-xs text-green-400 mt-2">Produto</p>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{product.name}</h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}

        {/* Preço e Estoque */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-green-600">
            R$ {(Number(product.price) || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {product.stock} em estoque
          </div>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.split(',').map((tag) => (
              <span
                key={tag.trim()}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Botão de Pedido */}
        <Button
          variant="outline-green"
          onClick={() => onOrderClick(product)}
          className="w-full"
        >
          Solicitar Produto
        </Button>
      </div>
    </div>
  );
}
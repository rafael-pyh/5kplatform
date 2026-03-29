'use client';

import { Kit } from '@/lib/types/shop.types';
import Image from 'next/image';
import { useState } from 'react';

interface KitCardProps {
  kit: Kit;
  onOrderClick: (kit: Kit) => void;
}

export function KitCard({ kit, onOrderClick }: KitCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      {/* Imagem */}
      <div className="relative h-48 w-full bg-gray-100">
        {kit.imageUrl && !imageError ? (
          <Image
            src={kit.imageUrl}
            alt={kit.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : kit.items && kit.items.length > 0 && kit.items[0]?.product?.images?.[0] ? (
          <Image
            src={kit.items[0].product.images[0].imageUrl}
            alt={kit.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <div className="text-4xl text-blue-300">📦</div>
              <p className="text-xs text-blue-400 mt-2">Sem imagem</p>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{kit.name}</h3>

        {kit.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{kit.description}</p>
        )}

        {/* Itens */}
        {kit.items && kit.items.length > 0 && (
          <div className="mb-3 pb-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              {kit.items.length} item{kit.items.length !== 1 ? 'ns' : ''}
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              {kit.items.map((item, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{item.product?.name || 'Produto'}</span>
                  <span className="text-gray-500">×{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preço e Botão */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-xs text-gray-500">Preço</p>
            <p className="text-xl font-bold text-green-600">R$ {Number(kit.price || 0).toFixed(2)}</p>
          </div>
          <button
            onClick={() => onOrderClick(kit)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Solicitar
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { memo } from 'react';
import Button from '@/components/ui/Button';

interface SellerFiltersProps {
  filter: 'all' | 'active';
  onFilterChange: (filter: 'all' | 'active') => void;
  onAddNew: () => void;
}

function SellerFilters({ filter, onFilterChange, onAddNew }: SellerFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendedores</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie os vendedores e seus QR codes
        </p>
      </div>
      <Button onClick={onAddNew} size="md">
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Novo Vendedor
      </Button>
    </div>
  );
}

export default memo(SellerFilters);

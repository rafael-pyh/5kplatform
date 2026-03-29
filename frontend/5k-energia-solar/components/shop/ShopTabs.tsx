'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils/cn';

interface ShopTabsProps {
  activeTab: 'kits' | 'products';
  onTabChange: (tab: 'kits' | 'products') => void;
  kitsCount: number;
  productsCount: number;
  className?: string;
}

function ShopTabs({ activeTab, onTabChange, kitsCount, productsCount, className }: ShopTabsProps) {
  const tabs = [
    { id: 'kits' as const, label: 'Kits', count: kitsCount },
    { id: 'products' as const, label: 'Produtos', count: productsCount },
  ];

  return (
    <div className={cn('border-b border-gray-200 mb-6', className)}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
            <span
              className={`
                ml-2 py-0.5 px-2.5 rounded-full text-xs
                ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default memo(ShopTabs);
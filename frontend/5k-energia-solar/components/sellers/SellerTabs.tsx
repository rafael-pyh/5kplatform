'use client';

import { memo } from 'react';

interface SellerTabsProps {
  activeTab: 'all' | 'active';
  onTabChange: (tab: 'all' | 'active') => void;
  allCount: number;
  activeCount: number;
}

function SellerTabs({ activeTab, onTabChange, allCount, activeCount }: SellerTabsProps) {
  const tabs = [
    { id: 'all' as const, label: 'Todos', count: allCount },
    { id: 'active' as const, label: 'Ativos', count: activeCount },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
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
                    ? 'bg-green-100 text-green-600'
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

export default memo(SellerTabs);

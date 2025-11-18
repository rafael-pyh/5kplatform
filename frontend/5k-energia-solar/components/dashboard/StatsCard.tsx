'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconBgColor?: string;
  iconColor?: string;
}

function StatsCard({
  title,
  value,
  icon,
  trend,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
}: StatsCardProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p
                className={cn(
                  'text-xs font-medium mt-2 flex items-center',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                <svg
                  className={cn('w-4 h-4 mr-1', trend.isPositive ? 'rotate-0' : 'rotate-180')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
                {Math.abs(trend.value)}% este mês
              </p>
            )}
          </div>
          <div className={cn('p-3 rounded-full', iconBgColor)}>
            <div className={cn('w-8 h-8', iconColor)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(StatsCard);

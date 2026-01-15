'use client';

import { useDashboardContext } from '@/contexts/DashboardContext';

export function usePersonsData() {
  const { persons, loading, refreshData } = useDashboardContext();

  return {
    persons,
    loading,
    refreshPersons: refreshData,
  };
}

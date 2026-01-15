'use client';

import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/lib/types';
import { cachedLeadService } from '@/lib/services/cached';
import { useDashboardContext } from '@/contexts/DashboardContext';

export function useLeads() {
  // Tentar usar dados do context se disponível
  let contextData;
  try {
    contextData = useDashboardContext();
  } catch {
    contextData = null;
  }
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Se temos dados de leads no context, use do context
      if (contextData?.allLeads && Array.isArray(contextData.allLeads) && contextData.allLeads.length > 0) {
        setLeads(contextData.allLeads);
        setLoading(false);
        return;
      }
      
      // Caso contrário, buscar da API
      const data = await cachedLeadService.getAll();
      setLeads(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filterByStatus = (status: LeadStatus | 'all') => {
    if (status === 'all') return leads;
    return leads.filter((lead) => lead.status === status);
  };

  const getCounts = () => ({
    all: leads.length,
    bought: leads.filter((l) => l.status === LeadStatus.BOUGHT).length,
    negotiation: leads.filter((l) => l.status === LeadStatus.NEGOTIATION).length,
    cancelled: leads.filter((l) => l.status === LeadStatus.CANCELLED).length,
  });

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    filterByStatus,
    getCounts,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/lib/types';
import { leadService } from '@/lib/services';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await leadService.getAll();
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

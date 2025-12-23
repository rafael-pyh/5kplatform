"use client";

import { useCallback, useMemo, useState } from 'react';
import { useLeads } from '@/lib/hooks/useLeads';
import { Lead, LeadStatus } from '@/lib/types';

type TabType = 'all' | 'bought' | 'negotiation' | 'cancelled';

export default function useLeadsPage() {
  const { leads, loading, error, refetch, filterByStatus, getCounts } = useLeads();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [additionalFilters, setAdditionalFilters] = useState({ name: '', city: '', state: '', status: 'all', owner: '', month: '', year: '' });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    if (activeTab === 'all') return leads;
    const statusMap: Record<Exclude<TabType, 'all'>, LeadStatus> = {
      bought: LeadStatus.BOUGHT,
      negotiation: LeadStatus.NEGOTIATION,
      cancelled: LeadStatus.CANCELLED,
    };
    return filterByStatus(statusMap[activeTab as Exclude<TabType, 'all'>]);
  }, [leads, activeTab, filterByStatus]);

  const finalFilteredLeads = useMemo(() => {
    return filteredLeads.filter((lead) => {
      const matchesName = additionalFilters.name ? lead.name.toLowerCase().includes(additionalFilters.name.toLowerCase()) : true;
      const matchesCity = additionalFilters.city ? lead.city?.toLowerCase() === additionalFilters.city.toLowerCase() : true;
      const matchesState = additionalFilters.state ? lead.state?.toLowerCase() === additionalFilters.state.toLowerCase() : true;
      const matchesOwner = additionalFilters.owner
        ? (lead.owner?.id ? lead.owner.id === additionalFilters.owner : (lead.owner?.name || '').toLowerCase() === additionalFilters.owner.toLowerCase())
        : true;

      const matchesMonth = additionalFilters.month ? new Date(lead.createdAt).getMonth() + 1 === Number(additionalFilters.month) : true;
      const matchesYear = additionalFilters.year ? new Date(lead.createdAt).getFullYear() === Number(additionalFilters.year) : true;

      return matchesName && matchesCity && matchesState && matchesOwner && matchesMonth && matchesYear;
    });
  }, [filteredLeads, additionalFilters]);

  const handleViewDetails = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  }, []);

  const handleUpdateStatus = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsStatusModalOpen(true);
  }, []);

  const handleStatusUpdateSuccess = useCallback(() => {
    refetch();
    setIsStatusModalOpen(false);
    setSelectedLead(null);
  }, [refetch]);

  const handleDetailsModalClose = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedLead(null);
  }, []);

  const counts = useMemo(() => getCounts(), [getCounts]);

  return {
    leads,
    loading,
    error,
    refetch,
    activeTab,
    setActiveTab,
    selectedLead,
    setSelectedLead,
    additionalFilters,
    setAdditionalFilters,
    isDetailsModalOpen,
    isStatusModalOpen,
    handleViewDetails,
    handleUpdateStatus,
    handleStatusUpdateSuccess,
    handleDetailsModalClose,
    counts,
    filteredLeads,
    finalFilteredLeads,
  };
}

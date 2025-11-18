'use client';

import { useState, useCallback, useMemo, Suspense, lazy } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Sidebar from '@/components/Sidebar';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LeadTable from '@/components/leads/LeadTable';
import LeadTabs from '@/components/leads/LeadTabs';
import { useLeads } from '@/lib/hooks/useLeads';
import { Lead, LeadStatus } from '@/lib/types';
import { useToggle } from '@/hooks/useToggle';

const LeadDetailsModal = lazy(() => import('@/components/leads/LeadDetailsModal'));
const UpdateStatusModal = lazy(() => import('@/components/leads/UpdateStatusModal'));

type TabType = 'all' | 'bought' | 'negotiation' | 'cancelled';

export default function LeadsPage() {
  const { leads, loading, error, refetch, filterByStatus, getCounts } = useLeads();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [isDetailsModalOpen, toggleDetailsModal, setIsDetailsModalOpen] = useToggle(false);
  const [isStatusModalOpen, toggleStatusModal, setIsStatusModalOpen] = useToggle(false);

  // Filtra leads baseado na aba ativa
  const filteredLeads = useMemo(() => {
    if (activeTab === 'all') return leads;
    
    const statusMap: Record<Exclude<TabType, 'all'>, LeadStatus> = {
      bought: LeadStatus.BOUGHT,
      negotiation: LeadStatus.NEGOTIATION,
      cancelled: LeadStatus.CANCELLED,
    };
    
    return filterByStatus(statusMap[activeTab as Exclude<TabType, 'all'>]);
  }, [leads, activeTab, filterByStatus]);

  // Handlers
  const handleViewDetails = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  }, [setIsDetailsModalOpen]);

  const handleUpdateStatus = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsStatusModalOpen(true);
  }, [setIsStatusModalOpen]);

  const handleStatusUpdateSuccess = useCallback(() => {
    refetch();
    setIsStatusModalOpen(false);
    setSelectedLead(null);
  }, [refetch, setIsStatusModalOpen]);

  const handleDetailsModalClose = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedLead(null);
  }, [setIsDetailsModalOpen]);

  const counts = useMemo(() => getCounts(), [getCounts]);

  if (error) {
    return (
      <DashboardLayout>
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os leads capturados através dos QR codes
          </p>
        </div>

        {/* Content Card */}
        <Card>
          {/* Tabs */}
          <LeadTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />

          {/* Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <LeadTable
                leads={filteredLeads}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </div>
        </Card>

        {/* Modals */}
        {isDetailsModalOpen && selectedLead && (
          <Suspense fallback={null}>
            <LeadDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={handleDetailsModalClose}
              lead={selectedLead}
            />
          </Suspense>
        )}

        {isStatusModalOpen && selectedLead && (
          <Suspense fallback={null}>
            <UpdateStatusModal
              isOpen={isStatusModalOpen}
              onClose={() => {
                setIsStatusModalOpen(false);
                setSelectedLead(null);
              }}
              onSuccess={handleStatusUpdateSuccess}
              lead={selectedLead}
            />
          </Suspense>
        )}
      </div>
    </DashboardLayout>
  );
}
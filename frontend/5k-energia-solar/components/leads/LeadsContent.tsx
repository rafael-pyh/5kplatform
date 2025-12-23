"use client";

import React, { Suspense, lazy } from 'react';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LeadTabs from '@/components/leads/LeadTabs';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadTable from '@/components/leads/LeadTable';

const LeadDetailsModal = lazy(() => import('@/components/leads/LeadDetailsModal'));
const UpdateStatusModal = lazy(() => import('@/components/leads/UpdateStatusModal'));

const LeadsContent = ({
  leads,
  loading,
  finalFilteredLeads,
  activeTab,
  setActiveTab,
  additionalFilters,
  setAdditionalFilters,
  counts,
  onViewDetails,
  onUpdateStatus,
  isDetailsModalOpen,
  isStatusModalOpen,
  selectedLead,
  onDetailsClose,
  onStatusSuccess,
}: any) => {
  return (
    <>
      <LeadFilters
        additionalFilters={additionalFilters}
        onAdditionalFiltersChange={setAdditionalFilters}
        cities={Array.from(new Set(leads.map((lead: any) => lead.city).filter((city: any) => Boolean(city)))).sort()}
        states={Array.from(new Set(leads.map((lead: any) => lead.state).filter((s: any) => Boolean(s)))).sort()}
        years={Array.from(new Set(leads.map((l: any) => new Date(l.createdAt).getFullYear().toString()))).sort((a: any,b: any) => Number(b) - Number(a))}
        sellers={Array.from(new Map(leads.map((lead: any) => [lead.owner?.id ?? lead.owner?.name, { id: lead.owner?.id ?? lead.owner?.name, name: lead.owner?.name ?? lead.owner?.email ?? lead.owner?.id }])).values()).filter((s: any) => Boolean(s.id && s.name))}
      />

      <Card className="overflow-hidden w-full min-w-0 mt-4" padding="xs">
        <LeadTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />

        <div className="overflow-x-auto w-full">
          {loading ? (
            <div className="flex justify-center py-1">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <LeadTable leads={finalFilteredLeads} onViewDetails={onViewDetails} onUpdateStatus={onUpdateStatus} />
          )}
        </div>
      </Card>

      {/* Modals */}
      {isDetailsModalOpen && selectedLead && (
        <Suspense fallback={null}>
          <LeadDetailsModal isOpen={isDetailsModalOpen} onClose={onDetailsClose} lead={selectedLead} className="max-w-full sm:max-w-lg mx-auto" />
        </Suspense>
      )}

      {isStatusModalOpen && selectedLead && (
        <Suspense fallback={null}>
          <UpdateStatusModal isOpen={isStatusModalOpen} onClose={() => {}} onSuccess={onStatusSuccess} lead={selectedLead} className="max-w-full sm:max-w-lg mx-auto" />
        </Suspense>
      )}
    </>
  );
};

export default LeadsContent;

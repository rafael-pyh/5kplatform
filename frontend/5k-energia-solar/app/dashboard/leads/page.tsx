'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { exportToCSV } from '@/lib/utils/exportToCSV';
import LeadsPageHeader from '@/components/leads/LeadsPageHeader';
import LeadsContent from '@/components/leads/LeadsContent';
import useLeadsPage from '@/hooks/useLeadsPage';

export default function LeadsPage() {
  const {
    leads,
    loading,
    error,
    activeTab,
    setActiveTab,
    additionalFilters,
    setAdditionalFilters,
    counts,
    finalFilteredLeads,
    handleViewDetails,
    handleUpdateStatus,
    isDetailsModalOpen,
    isStatusModalOpen,
    selectedLead,
    handleDetailsModalClose,
    handleStatusUpdateSuccess,
  } = useLeadsPage();

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 w-full min-w-0">
        <LeadsPageHeader onExport={() => exportToCSV(finalFilteredLeads, 'leads.csv')} disabled={finalFilteredLeads.length === 0} />

        <LeadsContent
          leads={leads}
          loading={loading}
          finalFilteredLeads={finalFilteredLeads}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          additionalFilters={additionalFilters}
          setAdditionalFilters={setAdditionalFilters}
          counts={counts}
          onViewDetails={handleViewDetails}
          onUpdateStatus={handleUpdateStatus}
          isDetailsModalOpen={isDetailsModalOpen}
          isStatusModalOpen={isStatusModalOpen}
          selectedLead={selectedLead}
          onDetailsClose={handleDetailsModalClose}
          onStatusSuccess={handleStatusUpdateSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
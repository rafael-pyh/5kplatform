"use client";

import React from 'react';
import RecentLeadsTable from '@/components/dashboard/RecentLeadsTable';

const RecentLeadsSection = ({ recentLeads, persons }: { recentLeads: any[]; persons: any[] }) => {
  return <RecentLeadsTable leads={recentLeads} sellers={persons.filter((p) => p.role !== 'ADMIN' && p.role !== 'SUPER_ADMIN')} />;
};

export default RecentLeadsSection;

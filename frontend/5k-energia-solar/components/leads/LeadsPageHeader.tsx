"use client";

import React from 'react';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

const LeadsPageHeader = ({ onExport, disabled }: { onExport: () => void; disabled: boolean }) => {
  return (
    <div className="flex items-start justify-between">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-700">Leads</h1>
          <p className="text-gray-600 mt-1">Gerencie os leads capturados através dos QR codes</p>
        </div>
      </div>
      <div className="flex gap-4 h-full items-start self-start">
        <Button onClick={onExport} variant="outline-blue" disabled={disabled} className="w-full md:w-auto">
          <Icon icon="bi-filetype-csv" className="w-5 h-5 mr-2" />
          Exportar CSV
        </Button>
      </div>
    </div>
  );
};

export default LeadsPageHeader;

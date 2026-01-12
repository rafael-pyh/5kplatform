"use client";

import React from 'react';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

const LeadsPageHeader = ({ onExport, disabled, onManageTemplates }: { onExport: () => void; disabled: boolean; onManageTemplates?: () => void }) => {
  return (
    <div className="flex items-start justify-between">
      <div className="md:mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-700">Leads</h1>
          <p className="text-gray-600 mt-1">Gerencie os leads capturados através dos QR codes</p>
        </div>
      </div>
      <div className="flex gap-4 h-full items-start self-start">
        {onManageTemplates && (
          <Button onClick={onManageTemplates} variant="outline-green" className="w-full md:w-auto" title="Gerenciar templates de WhatsApp">
            <Icon icon="bi-chat-dots" className="w-5 h-5 md:mr-2" />
            <p className="hidden md:block">Templates WhatsApp</p>
          </Button>
        )}
        <Button onClick={onExport} variant="outline-blue" disabled={disabled} className="w-full md:w-auto">
          <Icon icon="bi-filetype-csv" className="w-5 h-5 md:mr-2" />
          <p className="hidden md:block">Exportar CSV</p>
        </Button>
      </div>
    </div>
  );
};

export default LeadsPageHeader;

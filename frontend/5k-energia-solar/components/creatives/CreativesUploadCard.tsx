"use client";

import React from 'react';
import CreativesUploadForm from '@/components/CreativesUploadForm';

const CreativesUploadCard = ({ onSuccess }: { onSuccess: () => void }) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Novo Criativo</h2>
        </div>
        <div className="p-6">
          <CreativesUploadForm onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
};

export default CreativesUploadCard;

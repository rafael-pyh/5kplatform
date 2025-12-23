"use client";

import React from 'react';

const LeadHeader = ({ sellerName }: { sellerName: string }) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-500 via-blue-400 to-green-500 rounded-xl mb-4">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">5K Energia Solar</h1>
      <p className="text-gray-600 mt-2">Cadastro de interesse - Vendedor: <span className="font-semibold">{sellerName}</span></p>
    </div>
  );
};

export default LeadHeader;

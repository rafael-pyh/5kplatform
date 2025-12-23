"use client";

import React from 'react';

const StatsCards = ({ stats }: { stats: any }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-600">Total de Leads</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-600">Negociando</p>
        <p className="text-3xl font-bold text-yellow-600 mt-2">{stats?.negotiation || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-600">Compraram</p>
        <p className="text-3xl font-bold text-green-600 mt-2">{stats?.bought || 0}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
        <p className="text-3xl font-bold text-blue-600 mt-2">{stats?.conversionRate || '0%'}</p>
      </div>
    </div>
  );
};

export default StatsCards;

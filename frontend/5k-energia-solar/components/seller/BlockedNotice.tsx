"use client";

import React from 'react';

const BlockedNotice = ({ reason, onLogout }: { reason: 'unverified' | 'pendingApproval' | 'inactive'; onLogout: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl mx-auto mb-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800">
                {reason === 'unverified' && 'Email não verificado'}
                {reason === 'pendingApproval' && 'Conta pendente de aprovação'}
                {reason === 'inactive' && 'Conta inativa'}
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                {reason === 'unverified' && 'Você precisa verificar seu email antes de acessar o painel. Verifique sua caixa de entrada (ou spam) e clique no link de ativação.'}
                {reason === 'pendingApproval' && 'Sua conta ainda está sendo avaliada pelo administrador. Aguarde a aprovação e você será notificado por email.'}
                {reason === 'inactive' && 'Sua conta foi marcada como inativa. Contate o suporte para obter mais informações.'}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button onClick={onLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedNotice;

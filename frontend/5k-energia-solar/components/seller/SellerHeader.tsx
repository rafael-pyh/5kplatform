"use client";

import Image from 'next/image';
import React from 'react';

const SellerHeader = ({ seller, onOpenQR, onLogout }: any) => {
  return (
    <header className="bg-linear-to-br from-blue-50 to-green-50 shadow-md border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image src="/5klogo.png" alt="Logo 5K Energia Solar" width={100} height={100} />
            <div className="flex items-center gap-2">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                <Image src={seller?.photoBase64 || '/default-avatar.png'} alt="Foto do Vendedor" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{seller?.name}</p>
                <p className="text-xs text-gray-500">{seller?.email}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {seller?.qrCodeUrl && (
              <button
                onClick={onOpenQR}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                title="Ver meu QR Code"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="hidden sm:inline font-medium">Meu QR Code</span>
              </button>
            )}
            <button onClick={onLogout} className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              Sair
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader;

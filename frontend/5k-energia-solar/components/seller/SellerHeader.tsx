"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const SellerHeader = ({ seller, onOpenQR, onLogout, blocked }: any) => {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleEditProfile = () => {
    setIsProfileOpen(false);
    router.push('/seller/edit-profile');
  };

  return (
    <header className="bg-linear-to-br from-blue-50 to-green-50 shadow-md border-b border-gray-200">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image src="/5klogo.png" alt="Logo 5K Energia Solar" width={100} height={100} />
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Image src={seller?.photoBase64 || '/default-avatar.png'} alt="Foto do Vendedor" fill className="object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">{seller?.name}</p>
                  <p className="text-xs text-gray-500">{seller?.email}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <button
                    onClick={handleEditProfile}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span className="font-medium">Editar Perfil</span>
                  </button>
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 rounded-b-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {seller?.qrCodeUrl && (
              <button
                onClick={onOpenQR}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ver meu QR Code"
                disabled={blocked}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="hidden sm:inline font-medium">Meu QR Code</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default SellerHeader;

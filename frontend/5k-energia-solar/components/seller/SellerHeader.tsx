"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import { Button } from '../ui';
import { useGlobalRefresh } from '@/hooks/useGlobalRefresh';

const SellerHeader = ({ seller, onOpenQR, onLogout, blocked }: any) => {
  const router = useRouter();
  const { user } = useAuth();
  const { handleRefresh, isRefreshing } = useGlobalRefresh();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Usa seller se disponível, senão usa user do contexto
  const profileData = seller || user;

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleEditProfile = () => {
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/seller/edit-profile');
  };

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className="bg-linear-to-br from-blue-50 to-green-50 shadow-md border-b border-gray-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Image src="/5klogo.png" alt="Logo 5K Energia Solar" width={100} height={100} />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Refresh Button */}
            <Button
              onClick={() => handleRefresh()}
              disabled={isRefreshing}
              variant='none'
              title="Atualizar dados do servidor"
              className="p-2 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>

            {seller?.qrCodeUrl && (
              <Button
                onClick={onOpenQR}
                variant="outline-blue"
                size='sm'
                title="Ver meu QR Code"
                className="flex gap-2"
                disabled={blocked}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <span className="hidden sm:inline font-medium">QR Code</span>
              </Button>
            )}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-blue-100 flex items-center justify-center">
                  {profileData?.photoBase64 && !profileData.photoBase64.includes('data:') ? (
                    <img src={profileData.photoBase64} alt="Foto do Vendedor" className="w-full h-full object-cover" />
                  ) : profileData?.photoBase64 ? (
                    <Image src={profileData.photoBase64} alt="Foto do Vendedor" fill className="object-cover" />
                  ) : (
                    <span className="text-blue-600 font-semibold text-sm">{profileData?.name?.[0]?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-600">{profileData?.name}</p>
                  <p className="text-xs text-gray-500">{profileData?.email}</p>
                </div>
                <svg className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Desktop Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {profileData?.email && (
                    <button
                      onClick={handleEditProfile}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className="font-medium">Editar Perfil</span>
                    </button>
                  )}
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

          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="Menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4 pt-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-blue-100 flex items-center justify-center">
                {profileData?.photoBase64 && !profileData.photoBase64.includes('data:') ? (
                  <img src={profileData.photoBase64} alt="Foto do Vendedor" className="w-full h-full object-cover" />
                ) : profileData?.photoBase64 ? (
                  <Image src={profileData.photoBase64} alt="Foto do Vendedor" fill className="object-cover" />
                ) : (
                  <span className="text-blue-600 font-semibold text-sm">{profileData?.name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{profileData?.name}</p>
                <p className="text-xs text-gray-600">{profileData?.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              {/* Refresh Button Mobile */}
              <button
                onClick={() => {
                  handleRefresh();
                  setIsMobileMenuOpen(false);
                }}
                disabled={isRefreshing}
                className="w-full px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                title="Atualizar dados do servidor"
              >
                <svg
                  className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="font-medium">{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
              </button>

              {seller?.qrCodeUrl && (
                <button
                  onClick={() => {
                    onOpenQR();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  disabled={blocked}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="font-medium">Meu QR Code</span>
                </button>
              )}

              <button
                onClick={handleEditProfile}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 border border-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="font-medium">Editar Perfil</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 border border-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default SellerHeader;

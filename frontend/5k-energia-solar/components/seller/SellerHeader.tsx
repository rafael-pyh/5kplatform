"use client";

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { Button } from '../ui';
import { useGlobalRefresh } from '@/hooks/useGlobalRefresh';
import { useCredits } from '@/hooks/useCredits';

const SellerHeader = ({ seller, onOpenQR, onOpenCriativos, onLogout, blocked }: any) => {
  const router = useRouter();
  const { user } = useAuth();
  const { handleRefresh, isRefreshing } = useGlobalRefresh();
  const { balance, fetchBalance } = useCredits();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Usa seller se disponível, senão usa user do contexto
  const profileData = seller || user;

  // Buscar saldo de créditos ao montar o componente
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

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

  const handleShopKits = () => {
    setIsMobileMenuOpen(false);
    router.push('/shop');
  };

  const handleMyOrders = () => {
    setIsMobileMenuOpen(false);
    router.push('/shop/my-orders');
  };

  const handleWithdrawals = () => {
    setIsMobileMenuOpen(false);
    router.push('/shop/withdrawals');
  };

  const handleDashboard = () => {
    setIsMobileMenuOpen(false);
    router.push('/seller/dashboard');
  };

  return (
    <header className="bg-linear-to-br from-blue-50 to-green-50 shadow-md border-b border-gray-300">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full gap-8">
            {/* Logo (left) */}
            <div className="shrink-0">
              <Image src="/5klogo.png" alt="Logo 5K Energia Solar" width={100} height={100} />
            </div>

            {/* Centered nav (desktop) */}
            <nav className="hidden md:flex items-center gap-0.5">
              <Button
                onClick={() => handleDashboard()}
                variant="link"
                title="Ir para o Dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                <svg
                  className={`w-5 h-5`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span className="hidden sm:inline">Home</span>
              </Button>

              <Button
                onClick={handleShopKits}
                variant="link"
                size='sm'
                title="Comprar Kits"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="hidden sm:inline font-medium">Loja</span>
              </Button>

              <Button
                onClick={handleMyOrders}
                variant="link"
                size='sm'
                title="Meus Pedidos"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline font-medium">Meus Pedidos</span>
              </Button>

              <Button
                onClick={handleWithdrawals}
                variant="link"
                size='sm'
                title="Saques"
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="hidden sm:inline font-medium">Saques</span>
              </Button>
            </nav>

            {/* Right side - actions & profile */}
            <div className="flex items-center gap-2">
              {user?.qrCodeUrl && (user?.role === 'SELLER' || user?.role === 'AFFILIATE') && (
                <div className="flex gap-2">
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
                </div>
              )}

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
                  <div className="text-left hidden sm:block">
                    <p className="text-sm text-gray-600">{profileData?.name}</p>
                    <p className="text-xs text-gray-500">{profileData?.email}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      <span className="text-xs font-medium text-yellow-600">{balance} créditos</span>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>

                {/* Desktop Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
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
                <div className="flex items-center gap-1 mt-1">
                  <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className="text-xs font-medium text-yellow-600">{balance} créditos</span>
                </div>
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

              {/* Shop Kits Button Mobile (route-styled) */}
              <button
                onClick={handleShopKits}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="font-medium">Comprar Kits</span>
              </button>

              {/* My Orders Button Mobile (route-styled) */}
              <button
                onClick={handleMyOrders}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="font-medium">Meus Pedidos</span>
              </button>

              {/* Withdrawals Button Mobile (route-styled) */}
              <button
                onClick={handleWithdrawals}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="font-medium">Saques</span>
              </button>

              {user?.qrCodeUrl && (user?.role === 'SELLER' || user?.role === 'AFFILIATE') && (
                <div className="flex flex-col gap-2">
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
                  <button
                    onClick={() => {
                      onOpenCriativos();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    disabled={blocked}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Criativos</span>
                  </button>
                </div>
              )}

              <button
                onClick={handleEditProfile}
                className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2 border border-gray-200"
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

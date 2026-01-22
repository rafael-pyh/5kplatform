'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export function useSellerHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrModalMode, setQrModalMode] = useState<'qr' | 'criativos' | 'poster'>('qr');
  const [blocked, setBlocked] = useState(false);

  // Para sellers/affiliates, usar os dados do user como seller
  const seller = user?.role === 'SELLER' || user?.role === 'AFFILIATE' ? user : null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const openQRModal = (mode: 'qr' | 'criativos' | 'poster' = 'qr') => {
    setQrModalMode(mode);
    setIsQRModalOpen(true);
  };

  const openQRCodeModal = () => openQRModal('qr');
  const openCriativosModal = () => openQRModal('criativos');

  const closeQRModal = () => {
    setIsQRModalOpen(false);
  };

  // Verificar se está bloqueado (lógica básica)
  useEffect(() => {
    if (user?.approvalStatus === 'pending' || user?.approvalStatus === 'rejected' || !user?.active) {
      setBlocked(true);
    } else {
      setBlocked(false);
    }
  }, [user]);

  return {
    seller,
    onOpenQR: openQRCodeModal,
    onOpenCriativos: openCriativosModal,
    onLogout: handleLogout,
    blocked,
    isQRModalOpen,
    qrModalMode,
    closeQRModal,
  };
}
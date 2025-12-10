'use client';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para verificar se o usuário tem uma role específica
 */
export function useRole() {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = () => {
    return isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN');
  };

  const isSuperAdmin = () => {
    return isAuthenticated && user?.role === 'SUPER_ADMIN';
  };

  const isSeller = () => {
    return isAuthenticated && user?.role === 'SELLER';
  };

  const hasRole = (roles: ('ADMIN' | 'SUPER_ADMIN' | 'SELLER')[]) => {
    return isAuthenticated && user && roles.includes(user.role);
  };

  return {
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    isSeller: isSeller(),
    hasRole,
  };
}

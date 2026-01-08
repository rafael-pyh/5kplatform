'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PersonRole } from '@/types/Person';

/**
 * Hook: Controle de acesso baseado em roles
 * 
 * Retorna funções para validar permissões no frontend
 */
export const useAccessControl = () => {
  const { user } = useAuth();

  const userRole = (user?.role || '') as PersonRole;
  const registrationType = user?.registration_type || 'ADMIN';

  return {
    // Verificação de role
    isSuperAdmin: userRole === 'SUPER_ADMIN',
    isAdmin: userRole === 'ADMIN',
    isSeller: userRole === 'SELLER',
    isAffiliate: userRole === 'AFFILIATE',
    isInternal: ['SUPER_ADMIN', 'ADMIN', 'SELLER'].includes(userRole),

    // Verificação de tipo de registro
    isPublicAffiliate: registrationType === 'PUBLIC',
    isAdminCreated: registrationType === 'ADMIN',

    // Permissões específicas
    canViewPersonalData: ['SUPER_ADMIN', 'ADMIN', 'SELLER'].includes(userRole),
    canListSellers: ['SUPER_ADMIN', 'ADMIN', 'SELLER'].includes(userRole),
    canCreateSeller: ['SUPER_ADMIN', 'ADMIN'].includes(userRole),
    canChangeSellersRole: userRole === 'SUPER_ADMIN',
    canDeleteSeller: ['SUPER_ADMIN', 'ADMIN'].includes(userRole),
    canConvertAffiliateToSeller: ['SUPER_ADMIN', 'ADMIN'].includes(userRole),

    // Informações gerais
    userRole,
    registrationType,
    currentUser: user
  };
};

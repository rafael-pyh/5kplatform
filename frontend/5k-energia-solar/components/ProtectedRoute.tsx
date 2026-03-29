'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'SUPER_ADMIN' | 'SELLER' | 'AFFILIATE')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const userRole = user?.role;

      // Special handling for SUPER_ADMIN - they should have access to everything
      const isSuperAdmin = userRole === 'SUPER_ADMIN';
      const hasPermission = isSuperAdmin || (allowedRoles ? allowedRoles.includes(userRole as any) : true);
      const willRedirect = allowedRoles && user && !hasPermission && !isSuperAdmin;

      if (!isAuthenticated) {
        router.push('/login');
      } else if (willRedirect) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}

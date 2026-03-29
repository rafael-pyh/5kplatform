import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-green-100">
          <LoadingSpinner size="lg" text="Verificando..." />
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}

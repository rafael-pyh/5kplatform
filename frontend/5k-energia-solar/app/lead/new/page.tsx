'use client';

import { Suspense } from 'react';
import NewLeadForm from './NewLeadForm';

export default function NewLeadPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-transparent to-green-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <NewLeadForm />
    </Suspense>
  );
}

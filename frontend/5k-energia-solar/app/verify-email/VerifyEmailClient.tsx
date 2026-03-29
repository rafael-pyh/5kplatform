"use client";

import React from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useVerifyEmail } from '../../hooks/useVerifyEmail';
import VerifyEmailForm from '../../components/verify-email/VerifyEmailForm';

export default function VerifyEmailClient() {
  const { form, loading, verifying, verified, sellerInfo, onSubmit } = useVerifyEmail();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-green-100">
        <LoadingSpinner size="lg" text="Verificando..." />
      </div>
    );
  }

  if (!verified) return null;

  return <VerifyEmailForm form={form} verifying={verifying} sellerInfo={sellerInfo} onSubmit={onSubmit} />;
}

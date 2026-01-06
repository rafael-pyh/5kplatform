'use client';

import { useSearchParams } from 'next/navigation';
import ResetPasswordForm from '@/components/login/ResetPasswordForm';
import { useResetPassword } from '@/hooks/useResetPassword';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 px-4 text-slate-700">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-slate-800">Link Inválido</h1>
            <p className="text-gray-600 mb-6">Este link de redefinição é inválido ou expirou.</p>
            <a href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
              Solicitar novo link
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { form, onSubmit, isLoading } = useResetPassword(token);

  return <ResetPasswordForm form={form} onSubmit={onSubmit} isLoading={isLoading} />;
}

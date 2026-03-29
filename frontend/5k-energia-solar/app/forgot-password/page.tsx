'use client';

import ForgotPasswordForm from '@/components/login/ForgotPasswordForm';
import { useForgotPassword } from '@/hooks/useForgotPassword';

export default function ForgotPasswordPage() {
  const { form, onSubmit, isLoading } = useForgotPassword();

  return <ForgotPasswordForm form={form} onSubmit={onSubmit} isLoading={isLoading} />;
}

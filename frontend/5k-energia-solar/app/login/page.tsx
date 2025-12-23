"use client";

import LoginForm from '../../components/login/LoginForm';
import { useLogin } from '../../hooks/useLogin';

export default function LoginPage() {
  const { form, onSubmit, isLoading } = useLogin();

  return <LoginForm form={form} onSubmit={onSubmit} isLoading={isLoading} />;
}

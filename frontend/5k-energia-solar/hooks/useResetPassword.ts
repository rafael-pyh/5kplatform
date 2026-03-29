'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { resetPasswordAction } from '@/app/actions/auth';

export function useResetPassword(token: string) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<{ password: string; confirmPassword: string }>({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = useCallback(
    async (data: { password: string; confirmPassword: string }) => {
      if (data.password !== data.confirmPassword) {
        toast.error('As senhas não correspondem');
        return;
      }

      setIsLoading(true);
      try {
        const result = await resetPasswordAction({
          token,
          password: data.password,
        });

        if (result.success) {
          toast.success(result.message || 'Senha redefinida com sucesso!');
          // Redireciona para dashboard após 1.5s
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          toast.error(result.error || 'Erro ao redefinir senha');
        }
      } catch (error: any) {
        console.error('Reset password error:', error);
        toast.error(error?.message || 'Erro ao redefinir senha');
      } finally {
        setIsLoading(false);
      }
    },
    [token, router]
  );

  return { form, onSubmit, isLoading } as const;
}

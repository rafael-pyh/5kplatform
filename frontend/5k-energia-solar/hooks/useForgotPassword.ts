'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { forgotPasswordAction } from '@/app/actions/auth';

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<{ email: string }>({
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = useCallback(
    async (data: { email: string }) => {
      setIsLoading(true);
      try {
        const result = await forgotPasswordAction(data);
        
        if (result.success) {
          toast.success(result.message || 'Email enviado com sucesso! Verifique sua caixa de entrada.');
          form.reset();
        } else {
          toast.error(result.error || 'Erro ao solicitar reset de senha');
        }
      } catch (error: any) {
        console.error('Forgot password error:', error);
        toast.error(error?.message || 'Erro ao solicitar reset de senha');
      } finally {
        setIsLoading(false);
      }
    },
    [form]
  );

  return { form, onSubmit, isLoading } as const;
}

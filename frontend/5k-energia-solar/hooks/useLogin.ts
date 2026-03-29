'use client';

import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/lib/types';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginCredentials>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });
  const { login } = useAuth();

  const onSubmit = useCallback(
    async (data: LoginCredentials) => {
      setIsLoading(true);
      try {
        await login(data);
      } catch (error: any) {
        console.error('Login error:', error);
        toast.error(error?.message || 'Erro ao efetuar login');
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  return { form, onSubmit, isLoading } as const;
}

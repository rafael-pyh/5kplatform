'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
}

export function useVerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<any>(null);

  const form = useForm<SetPasswordForm>();
  const { handleSubmit } = form;

  const verifyToken = useCallback(async () => {
    if (!token) {
      toast.error('Token inválido');
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/seller/verify/${token}`);
      setSellerInfo(response.data.data);
      setVerified(true);
    } catch (error: any) {
      console.error('Erro ao verificar token:', error);
      toast.error(error.response?.data?.message || 'Token inválido ou expirado');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const onSubmit = useCallback(async (data: SetPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setVerifying(true);
      const response = await api.post('/seller/set-password', {
        token,
        password: data.password,
        city: data.city,
        state: data.state,
      });

      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.person));
      localStorage.setItem('userType', 'seller');

      toast.success('Conta ativada com sucesso!');
      setTimeout(() => router.push('/seller/dashboard'), 1500);
    } catch (error: any) {
      console.error('Erro ao definir senha:', error);
      toast.error(error.response?.data?.message || 'Erro ao definir senha');
    } finally {
      setVerifying(false);
    }
  }, [token, router]);

  return {
    form,
    handleSubmit,
    loading,
    verifying,
    verified,
    sellerInfo,
    onSubmit,
  } as const;
}

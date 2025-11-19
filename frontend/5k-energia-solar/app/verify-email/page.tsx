'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
}

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SetPasswordForm>();

  const password = watch('password');

  useEffect(() => {
    if (!token) {
      toast.error('Token inválido');
      router.push('/login');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
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
  };

  const onSubmit = async (data: SetPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      setVerifying(true);
      const response = await api.post('/seller/set-password', {
        token,
        password: data.password,
      });

      // Salvar token JWT e dados do usuário
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-500">
        <LoadingSpinner size="lg" text="Verificando..." />
      </div>
    );
  }

  if (!verified) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-green-500 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Email Verificado!</h1>
          <p className="text-gray-600 mt-2">
            Olá, <strong>{sellerInfo?.name}</strong>! Agora defina sua senha para acessar sua conta.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter no mínimo 6 caracteres',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="******"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Senha *
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Confirmação de senha é obrigatória',
                validate: (value) => value === password || 'As senhas não coincidem',
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="******"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={verifying}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {verifying ? 'Ativando conta...' : 'Ativar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}

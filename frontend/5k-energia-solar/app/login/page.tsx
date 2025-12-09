'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth';
import { LoginCredentials } from '@/lib/types';
import { loginAction } from '../actions/auth';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await loginAction(data);

      if (!response.success) {
        toast.error(response.error || 'Erro ao fazer login');
        return;
      }

      if (!response.token || !response.user) {
        toast.error('Dados de autenticação incompletos');
        return;
      }

      setAuth(response.user, response.token);
      console.log('Login successful:', response);
      toast.success('Login realizado com sucesso!');
      if (response.user.role === 'SELLER') {
        router.push('/seller/dashboard');
        return;
      } else if (response.user.role === 'ADMIN' || response.user.role === 'SUPER_ADMIN') {
        router.push('/dashboard');
        return;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message =
        error.response?.data?.message ||
        error.message ||
        'Erro ao fazer login. Verifique suas credenciais.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <Image src="/5klogo.png" alt="5K Energia Logo" width={150} height={80} className="mx-auto mb-4" />
            <h1 className="text-2xl font-thin text-gray-900">Energia Solar</h1>
            <p className="text-gray-600 mt-2">Faça login para acessar o sistema</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
            <div className="w-full flex justify-between">
              <p>Ainda não tem uma conta?</p>
              <Link href="/register" className="text-blue-600 hover:cursor-pointer">
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import PasswordField from '@/components/ui/PasswordField';
import { LoginCredentials } from '@/lib/types';
import { Button } from '../ui';

interface Props {
  form: UseFormReturn<LoginCredentials>;
  onSubmit: (data: LoginCredentials) => Promise<void> | void;
  isLoading: boolean;
}

export default function LoginForm({ form, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-green-100 px-4 text-slate-700">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          <div className="text-center">
            <Image src="/5klogocomplete.png" alt="5K Energia Logo" width={300} height={80} className="mx-auto my-1" />
            <p className="text-gray-600">Faça login para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                  maxLength: { value: 254, message: 'Email muito longo' },
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="seu@email.com"
                maxLength={254}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <PasswordField
                name="password"
                register={register as any}
                registerOptions={{
                  required: 'Senha é obrigatória',
                  minLength: { value: 8, message: 'Senha deve ter no mínimo 8 caracteres, incluindo letras e números' },
                  maxLength: { value: 128, message: 'Senha deve ter no máximo 128 caracteres' },
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                maxLength={128}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  Lembrar de mim
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full "
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="w-full flex flex-col md:flex-row justify-between">
              <p>Gostaria de se tornar um parceiro?</p>
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

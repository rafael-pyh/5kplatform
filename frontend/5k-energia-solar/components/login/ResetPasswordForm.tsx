'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import PasswordField from '@/components/ui/PasswordField';

interface Props {
  form: UseFormReturn<{ password: string; confirmPassword: string }>;
  onSubmit: (data: { password: string; confirmPassword: string }) => Promise<void> | void;
  isLoading: boolean;
}

export default function ResetPasswordForm({ form, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  const password = watch('password');

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-green-100 px-4 text-slate-700">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <Image src="/5klogo.png" alt="5K Energia Logo" width={200} height={80} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-slate-800">Criar Nova Senha</h1>
            <p className="text-gray-600">Digite sua nova senha abaixo</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <PasswordField
                name="password"
                register={register as any}
                registerOptions={{
                  required: 'Senha é obrigatória',
                  minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' },
                  maxLength: { value: 128, message: 'Senha deve ter no máximo 128 caracteres' },
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                maxLength={128}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <PasswordField
                name="confirmPassword"
                register={register as any}
                registerOptions={{
                  required: 'Confirme sua senha',
                  validate: (value: string) => value === password || 'As senhas não correspondem',
                }}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                maxLength={128}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-blue-100 to-green-100 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Voltar para{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

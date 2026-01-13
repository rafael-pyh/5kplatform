'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { UseFormReturn } from 'react-hook-form';
import toast from 'react-hot-toast';

interface Props {
  form: UseFormReturn<{ email: string }>;
  onSubmit: (data: { email: string }) => Promise<void> | void;
  isLoading: boolean;
}

export default function ForgotPasswordForm({ form, onSubmit, isLoading }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-green-100 px-4 text-slate-700">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <Image src="/5klogo.png" alt="5K Energia Logo" width={200} height={80} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-slate-800">Esqueceu a Senha?</h1>
            <p className="text-gray-600">Digite seu email para receber um link de redefinição</p>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-blue-100 to-green-100 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Lembrou sua senha?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Voltar para login
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                Não tem conta?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

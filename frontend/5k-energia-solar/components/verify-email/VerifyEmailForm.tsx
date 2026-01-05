'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import PasswordField from '@/components/ui/PasswordField';

interface SetPasswordForm {
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
}

type Props = {
  form: UseFormReturn<SetPasswordForm>;
  verifying: boolean;
  sellerInfo: any;
  onSubmit: (data: SetPasswordForm) => Promise<void> | void;
};

export default function VerifyEmailForm({ form, verifying, sellerInfo, onSubmit }: Props) {
  const { register, formState: { errors }, handleSubmit } = form;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-500 to-green-500 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
            <PasswordField
              name="password"
              register={register as any}
              registerOptions={{
                required: 'Senha é obrigatória',
                minLength: { value: 8, message: 'Senha deve ter no mínimo 8 caracteres, incluindo letras e números' },
              }}
              placeholder="******"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
            <PasswordField
              name="confirmPassword"
              register={register as any}
              registerOptions={{
                required: 'Confirmação de senha é obrigatória',
                validate: (value: string) => value === (form.getValues('password') || '') || 'As senhas não coincidem',
              }}
              placeholder="******"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
            <input id="city" type="text" {...register('city', { required: 'Cidade é obrigatória' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="São Paulo" />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <input id="state" type="text" {...register('state', { required: 'Estado é obrigatório', maxLength: { value: 2, message: 'Estado deve ter 2 caracteres (ex: SP)' } })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase" placeholder="SP" maxLength={2} />
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
          </div>

          <button type="submit" disabled={verifying} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">{verifying ? 'Ativando conta...' : 'Ativar Conta'}</button>
        </form>
      </div>
    </div>
  );
}

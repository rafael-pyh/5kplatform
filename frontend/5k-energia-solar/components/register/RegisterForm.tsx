'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PasswordField from '@/components/ui/PasswordField';

type Props = {
  states: string[];
  formData: Record<string, any>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  isLoading: boolean;
};

export default function RegisterForm({ states, formData, handleChange, handleFileChange, handleSubmit, isLoading }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 px-4 text-slate-700 mb-4">
      <div className="w-full max-w-4xl mt-4">
        <div className="bg-white rounded-2xl shadow-xl px-8 py-4">
          <div className="text-center mb-4">
            <Image
              src="/5klogo.png"
              alt="5K Energia Logo"
              width={180}
              height={80}
              className="mx-auto mb-4"
            />
            <p className="text-gray-600 w-10/12 mx-auto">Crie sua conta para que possamos analisar seu perfil.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-0.5">Nome</label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} maxLength={100} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Seu nome completo" required />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-0.5">Email</label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} maxLength={254} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="seu@email.com" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-0.5">Senha</label>
              <PasswordField name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" maxLength={128} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>

            <div>
              <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-700 mb-0.5">Repita a Senha</label>
              <PasswordField name="repeatPassword" value={formData.repeatPassword} onChange={handleChange} placeholder="••••••••" maxLength={128} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-0.5">Telefone</label>
              <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} inputMode="numeric" pattern="[0-9]*" maxLength={11} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Somente números (ex: 11999999999)" required />
            </div>

            <div>
              <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700 mb-0.5">Chave Pix</label>
              <input id="pixKey" type="text" name="pixKey" value={formData.pixKey} onChange={handleChange} maxLength={77} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Sua chave Pix" required />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-0.5">Cidade</label>
              <input id="city" type="text" name="city" value={formData.city} onChange={handleChange} maxLength={100} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Sua cidade" required />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-0.5">Estado</label>
              <select id="state" name="state" value={formData.state} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" required>
                <option value="">Selecione um estado</option>
                {states.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-0.5">Foto</label>
              <input id="photo" type="file" accept="image/*" onChange={handleFileChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:cursor-pointer file:border-0 file:text-sm file:bg-blue-50 file:rounded-lg file:text-blue-700 hover:file:bg-blue-100" required />
            </div>

            <div className="md:col-span-2">
              <button type="submit" disabled={isLoading} className="w-full bg-linear-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition">{isLoading ? 'Cadastrando...' : 'Cadastrar'}</button>
            </div>

            <div className="md:col-span-2 w-full flex justify-between">
              <p>Já tem uma conta?</p>
              <Link href="/login" className="text-blue-600 hover:cursor-pointer">Faça login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PasswordField from '@/components/ui/PasswordField';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { Button, FileUpload } from '@/components/ui';

interface StateOption {
  id: string;
  name: string;
  abbreviation: string;
}

interface CityOption {
  id: string;
  name: string;
}

type Props = {
  states: StateOption[];
  cities: CityOption[];
  citiesLoading: boolean;
  formData: Record<string, any>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSetCity: (city: string) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  isLoading: boolean;
};

export default function RegisterForm({ 
  states, 
  cities, 
  citiesLoading,
  formData, 
  handleChange, 
  handleFileChange,
  handleSetCity,
  handleSubmit, 
  isLoading 
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-green-100 px-4 text-slate-700 mb-4">
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-1">
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
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-0.5">CPF</label>
              <input id="cpf" type="text" name="cpf" value={formData.cpf} onChange={handleChange} inputMode="numeric" pattern="[0-9]*" maxLength={11} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" placeholder="Somente números (ex: 12345678900)" required />
            </div>

            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-0.5">Data de Nascimento</label>
              <input id="birthDate" type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" required />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-0.5">Estado</label>
              <select id="state" name="state" value={formData.state} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" required>
                <option value="">Selecione um estado</option>
                {states.map((state) => (
                  <option key={state.abbreviation} value={state.abbreviation}>
                    {state.name} ({state.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-0.5">Cidade</label>
              {formData.state ? (
                citiesLoading ? (
                  <div className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm flex items-center justify-center">
                    Carregando cidades...
                  </div>
                ) : (
                  <CityAutocomplete
                    cities={cities}
                    value={formData.city}
                    onChange={handleSetCity}
                    placeholder="Digite para filtrar a cidade"
                    disabled={cities.length === 0 || citiesLoading}
                  />
                )
              ) : (
                <div className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                  Selecione um estado primeiro
                </div>
              )}
            </div>

            <div>
              <label htmlFor="commissionType" className="block text-sm font-medium text-gray-700 mb-0.5">Tipo de Comissão</label>
              <select id="commissionType" name="commissionType" value={formData.commissionType} onChange={handleChange} className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" required>
                <option value="PERCENTAGE">Porcentagem sobre a venda</option>
                <option value="FIXED">Valor fixo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-0.5">Foto</label>
              <FileUpload
                id="photo"
                accept="image/*"
                onChange={handleFileChange}
                label="Clique para selecionar uma foto"
                dragText="ou arraste uma imagem aqui"
              />
              {formData.photoBase64 && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={formData.photoBase64}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                  />
                  <span className="text-sm text-gray-600">Imagem selecionada</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Cadastrando...' : 'Cadastrar'}</Button>
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

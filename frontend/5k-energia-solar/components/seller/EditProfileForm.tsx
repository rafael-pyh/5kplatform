'use client';

import React from 'react';
import Image from 'next/image';
import { Person } from '@/lib/types';
import { FileUpload } from '@/components/ui';

type Props = {
  seller: Person | null;
  states: string[];
  formData: Record<string, any>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void> | void;
  isLoading: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
};

export default function EditProfileForm({ 
  seller, 
  states, 
  formData, 
  handleChange, 
  handleFileChange, 
  handleSubmit, 
  isLoading,
  showCancel = true,
  onCancel
}: Props) {
  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
        <input 
          id="name" 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          maxLength={100} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
          placeholder="Seu nome completo" 
          required 
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input 
          id="email" 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          maxLength={254} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
          placeholder="seu@email.com" 
          required 
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
        <input 
          id="phone" 
          type="tel" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          inputMode="numeric" 
          pattern="[0-9]*" 
          maxLength={11} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
          placeholder="Somente números (ex: 11999999999)" 
          required 
        />
      </div>

      <div>
        <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700 mb-2">Chave Pix</label>
        <input 
          id="pixKey" 
          type="text" 
          name="pixKey" 
          value={formData.pixKey} 
          onChange={handleChange} 
          maxLength={77} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
          placeholder="Sua chave Pix" 
          required 
        />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
        <select 
          id="state" 
          name="state" 
          value={formData.state} 
          onChange={handleChange} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
          required
        >
          <option value="">Selecione um estado</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
        <input 
          id="city" 
          type="text" 
          name="city" 
          value={formData.city} 
          onChange={handleChange} 
          maxLength={100} 
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
          placeholder="Sua cidade" 
          required 
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
        <div className="flex gap-4 items-start">
          {formData.photoBase64 && (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
              <Image 
                src={formData.photoBase64} 
                alt="Preview" 
                fill 
                className="object-cover"
              />
            </div>
          )}
          <div className="grow">
            <FileUpload
              id="photo"
              accept="image/*"
              onChange={handleFileChange}
              label="Clique para alterar a foto"
              dragText="ou arraste uma imagem aqui"
            />
            <p className="text-xs text-gray-500 mt-2">Foto opcional</p>
          </div>
        </div>
      </div>

      <div className="md:col-span-2 flex gap-4 justify-end border-t border-gray-200 pt-6">
        {showCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={isLoading}
          className="px-6 py-2 bg-linear-to-r from-blue-500 to-green-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
}

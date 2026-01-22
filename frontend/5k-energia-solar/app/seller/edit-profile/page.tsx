'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useEditProfile } from '@/hooks/useEditProfile';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button, FileUpload } from '@/components/ui';

export default function EditProfilePage() {
  const router = useRouter();
  const { user: seller, isLoading: loading } = useAuth();
  const {
    states,
    cities,
    citiesLoading,
    formData,
    handleChange,
    handleFileChange,
    handleSubmit,
    isLoading,
    profileLoading,
  } = useEditProfile(seller as any);

  useEffect(() => {
    if (!loading && !seller) {
      router.push('/login');
    }
  }, [seller, loading, router]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Carregando dados do perfil..." />
      </div>
    );
  }

  if (!seller) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-green-50 px-4 py-4 md:py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 md:mb-8">
          <Button
            onClick={() => router.back()}
            variant='none'
            size='none'
            className="p-0 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={seller.photoBase64 || '/default-avatar.png'}
                alt="Foto do Vendedor"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Perfil</h1>
              <p className="text-gray-600">{seller.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
          <form onSubmit={async (e?: React.FormEvent<HTMLFormElement>) => {
            await handleSubmit(e);
            router.push('/seller/dashboard');
          }} className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
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
              <CityAutocomplete
                cities={cities}
                value={formData.city}
                onChange={(city) => handleChange({ target: { name: 'city', value: city } } as any)}
                placeholder="Selecione uma cidade"
                disabled={!formData.state || citiesLoading}
              />
              {!formData.state && <p className="text-xs text-gray-500 mt-1">Selecione um estado primeiro</p>}
              {citiesLoading && <p className="text-xs text-blue-500 mt-1">Carregando cidades...</p>}
            </div>


            <div className="md:col-span-2">
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
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

            <div className="w-full md:col-span-2 flex gap-4 md:justify-end border-t border-gray-200 md:pt-6">
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline-danger"
                className="w-1/2 md:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                variant="gradient"
                className="w-1/2 md:w-auto"
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

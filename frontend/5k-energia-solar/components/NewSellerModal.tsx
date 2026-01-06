'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { personService, uploadService } from '@/lib/services';
import { CreatePersonDto } from '@/lib/types';
import ResponsiveModal from '@/components/ResponsiveModal';

interface NewSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewSellerModal({ isOpen, onClose, onSuccess }: NewSellerModalProps) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePersonDto>();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CreatePersonDto) => {
    setLoading(true);
    try {
      let photoBase64 = undefined;

      if (photoFile) {
        photoBase64 = await uploadService.uploadProfilePhoto(photoFile);
      }

      await personService.create({
        ...data,
        photoBase64,
      });

      toast.success('Vendedor criado com sucesso!');
      reset();
      setPhotoFile(null);
      setPhotoPreview('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao criar vendedor');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setPhotoFile(null);
      setPhotoPreview('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-2xl px-6 py-6">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Novo Vendedor</h2>
          <p className="text-sm text-gray-600">Preencha os dados para criar um novo vendedor</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Nome *
            </label>
            <input
              {...register('name', { required: 'Nome é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Seu nome completo"
              maxLength={100}
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Email *
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="seu@email.com"
              maxLength={254}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Telefone *
            </label>
            <input
              {...register('phone', { required: 'Telefone é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Somente números (ex: 11999999999)"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              required
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Chave Pix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Chave Pix *
            </label>
            <input
              {...register('pixKey', { required: 'Chave Pix é obrigatória' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Sua chave Pix"
              maxLength={77}
              required
            />
            {errors.pixKey && (
              <p className="mt-1 text-sm text-red-600">{errors.pixKey.message}</p>
            )}
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Cidade *
            </label>
            <input
              {...register('city', { required: 'Cidade é obrigatória' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Sua cidade"
              maxLength={100}
              required
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Estado *
            </label>
            <select
              {...register('state', { required: 'Estado é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            >
              <option value="">Selecione um estado</option>
              <option value="AC">AC</option>
              <option value="AL">AL</option>
              <option value="AP">AP</option>
              <option value="AM">AM</option>
              <option value="BA">BA</option>
              <option value="CE">CE</option>
              <option value="DF">DF</option>
              <option value="ES">ES</option>
              <option value="GO">GO</option>
              <option value="MA">MA</option>
              <option value="MT">MT</option>
              <option value="MS">MS</option>
              <option value="MG">MG</option>
              <option value="PA">PA</option>
              <option value="PB">PB</option>
              <option value="PR">PR</option>
              <option value="PE">PE</option>
              <option value="PI">PI</option>
              <option value="RJ">RJ</option>
              <option value="RN">RN</option>
              <option value="RS">RS</option>
              <option value="RO">RO</option>
              <option value="RR">RR</option>
              <option value="SC">SC</option>
              <option value="SP">SP</option>
              <option value="SE">SE</option>
              <option value="TO">TO</option>
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          {/* Foto de Perfil - full width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Foto de Perfil
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:cursor-pointer file:border-0 file:text-sm file:bg-blue-50 file:rounded-lg file:text-blue-700 hover:file:bg-blue-100"
            />
            {photoPreview && (
              <div className="mt-2 flex items-center gap-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                />
                <span className="text-sm text-gray-600">Imagem selecionada</span>
              </div>
            )}
          </div>

          {/* Submit Button - full width */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full bg-linear-to-r from-blue-500 to-green-500 text-white py-2 rounded-lg font-medium hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Criando...
                </>
              ) : (
                'Criar Vendedor'
              )}
            </button>
          </div>

          {/* Cancel Button - full width */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="cursor-pointer w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  );
}

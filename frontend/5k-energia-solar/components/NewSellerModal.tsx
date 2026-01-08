'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { personService } from '@/lib/services';
import { CreatePersonDto } from '@/lib/types';
import ResponsiveModal from '@/components/ResponsiveModal';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { getStates, getCitiesByState } from '@/lib/actions/locationActions';

interface NewSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface StateOption {
  id: string;
  name: string;
  abbreviation: string;
}

interface CityOption {
  id: string;
  name: string;
}

export default function NewSellerModal({ isOpen, onClose, onSuccess }: NewSellerModalProps) {
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [citiesLoading, setCitiesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreatePersonDto>();

  const watchState = watch('state');

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await getStates();
        setStates(statesData);
      } catch (error) {
        console.error('Error loading states:', error);
        toast.error('Erro ao carregar estados');
      }
    };

    if (isOpen) {
      loadStates();
    }
  }, [isOpen]);

  // Load cities when state changes
  useEffect(() => {
    const loadCities = async () => {
      if (!watchState) {
        setCities([]);
        setValue('city', '');
        return;
      }

      setCitiesLoading(true);
      try {
        const citiesData = await getCitiesByState(watchState);
        setCities(citiesData);
        setValue('city', '');
      } catch (error) {
        console.error('Error loading cities:', error);
        toast.error('Erro ao carregar cidades');
      } finally {
        setCitiesLoading(false);
      }
    };

    loadCities();
  }, [watchState, setValue]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo deve ter no máximo 5MB');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const onSubmit = async (data: CreatePersonDto) => {
    setLoading(true);
    try {
      let photoBase64 = undefined;

      if (photoFile) {
        photoBase64 = await fileToBase64(photoFile);
      }

      await personService.create({
        ...data,
        photoBase64,
      });

      toast.success('Vendedor criado com sucesso!');
      reset();
      setPhotoFile(null);
      setPhotoPreview('');
      setSelectedState('');
      setCities([]);
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

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Estado *
            </label>
            <select
              {...register('state', { required: 'Estado é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              required
            >
              <option value="">Selecione um estado</option>
              {states.map((state) => (
                <option key={state.abbreviation} value={state.abbreviation}>
                  {state.name} ({state.abbreviation})
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          {/* Cidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Cidade *
            </label>
            {watchState ? (
              citiesLoading ? (
                <div className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm flex items-center justify-center">
                  Carregando cidades...
                </div>
              ) : (
                <>
                  <input
                    type="hidden"
                    {...register('city', { required: 'Cidade é obrigatória' })}
                  />
                  <CityAutocomplete
                    cities={cities}
                    value={watch('city')}
                    onChange={(cityName) => setValue('city', cityName)}
                    placeholder="Digite para filtrar a cidade"
                    disabled={cities.length === 0 || citiesLoading}
                  />
                </>
              )
            ) : (
              <div className="w-full px-2 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                Selecione um estado primeiro
              </div>
            )}
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Tipo de Usuário *
            </label>
            <select
              {...register('role', { required: 'Tipo de usuário é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              required
            >
              <option value="">Selecione um tipo</option>
              <option value="SELLER">Vendedor</option>
              <option value="AFFILIATE">Afiliado</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
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

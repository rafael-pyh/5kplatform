'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { personService } from '@/lib/services';
import { Person, UpdatePersonDto } from '@/lib/types';
import ResponsiveModal from '@/components/ResponsiveModal';
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import { getStates, getCitiesByState } from '@/lib/actions/locationActions';
import { Button } from './ui';

interface EditSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  person: any;
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

export default function EditSellerModal({
  isOpen,
  onClose,
  onSuccess,
  person,
}: EditSellerModalProps) {
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(person.photoBase64 || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [states, setStates] = useState<StateOption[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<UpdatePersonDto>({
    defaultValues: {
      name: person.name,
      email: person.email,
      phone: person.phone,
      pixKey: (person as any).pixKey || '',
      city: (person as any).city || '',
      state: (person as any).state || '',
      role: (person as any).role || 'SELLER',
    },
  });

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
        return;
      }

      setCitiesLoading(true);
      try {
        const citiesData = await getCitiesByState(watchState);
        setCities(citiesData);
      } catch (error) {
        console.error('Error loading cities:', error);
        toast.error('Erro ao carregar cidades');
      } finally {
        setCitiesLoading(false);
      }
    };

    loadCities();
  }, [watchState]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A foto deve ter no máximo 5MB');
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

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

  const onSubmit = async (data: UpdatePersonDto) => {
    try {
      setLoading(true);

      let photoBase64: string | undefined = undefined;

      // If user selected a file, convert to base64
      if (photoFile) {
        try {
          photoBase64 = await fileToBase64(photoFile);
        } catch (err) {
          console.error('Erro ao processar foto:', err);
          toast.error('Erro ao processar foto. Tente novamente.');
          setLoading(false);
          return;
        }
      }

      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if ((data as any).pixKey !== undefined) updateData.pixKey = (data as any).pixKey;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;
      if ((data as any).role !== undefined) updateData.role = (data as any).role;
      if (photoBase64) updateData.photoBase64 = photoBase64;

      await personService.update(person.id, updateData);

      toast.success('Vendedor atualizado com sucesso!');
      reset();
      setPhotoPreview(null);
      setPhotoFile(null);
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar vendedor');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        {/* Header */}
        <div className="text-start mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Editar Vendedor</h2>
          <p className="text-sm text-gray-600 mt-1">Atualize as informações do vendedor</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-0.5">
              Nome Completo
            </label>
            <input
              id="name"
              type="text"
              maxLength={100}
              {...register('name')}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="Nome do vendedor"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-0.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              maxLength={120}
              {...register('email', {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-0.5">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={20}
              pattern="[\d\s\-\(\)]+"
              {...register('phone')}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="(00) 00000-0000"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-0.5">{errors.phone.message}</p>
            )}
          </div>

          {/* Pix Key */}
          <div>
            <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700 mb-0.5">
              Chave Pix
            </label>
            <input
              id="pixKey"
              type="text"
              maxLength={150}
              {...register('pixKey')}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="CPF, email, telefone ou chave aleatória"
            />
            {errors && (errors as any).pixKey && (
              <p className="text-red-500 text-xs mt-0.5">{(errors as any).pixKey.message}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-0.5">
              Estado
            </label>
            <select
              id="state"
              {...register('state')}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="">Selecione um estado</option>
              {states.map((state) => (
                <option key={state.abbreviation} value={state.abbreviation}>
                  {state.name} ({state.abbreviation})
                </option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-xs mt-0.5">{errors.state.message}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-0.5">
              Cidade
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
                    {...register('city')}
                  />
                  <CityAutocomplete
                    cities={cities}
                    value={watch('city') || ''}
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
              <p className="text-red-500 text-xs mt-0.5">{errors.city.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-0.5">
              Cargo (Role) *
            </label>
            <select
              id="role"
              {...register('role', { required: 'Cargo é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            >
              <option value="">Selecione um cargo</option>
              <option value="AFFILIATE">Afiliado</option>
              <option value="SELLER">Vendedor</option>
              <option value="ADMIN">Administrador</option>
              <option value="SUPER_ADMIN">Super Administrador</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-0.5">{errors.role.message}</p>
            )}
          </div>

          {/* Photo Upload - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Foto do Vendedor
            </label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-700 hover:text-white transition inline-block text-sm font-medium">
                  Alterar Foto
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Actions - Full Width */}
          <div className="md:col-span-2 flex gap-2 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant='outline-danger'
              className="cursor-pointer w-full px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              variant='gradient'
              className="cursor-pointer w-full px-4 py-2 font-semibold rounded-lg text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  );
}

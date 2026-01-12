'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { adminService } from '@/lib/services';
import { CreateAdminDto } from '@/lib/types';
import PasswordField from '@/components/ui/PasswordField';
import ResponsiveModal from '@/components/ResponsiveModal';
import { Button } from '../ui';

interface NewAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewAdminModal({ isOpen, onClose, onSuccess }: NewAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateAdminDto>();

  const password = watch('password');

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: CreateAdminDto) => {
    setLoading(true);
    try {
      const createData = { ...data };

      // Se o usuário selecionou uma imagem, adiciona ao payload
      if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
        const file = fileInputRef.current.files[0];
        const base64 = await toBase64(file);
        (createData as any).photoBase64 = base64;
      }

      await adminService.create(createData);
      toast.success('Administrador criado com sucesso!');
      reset();
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar administrador');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4">
        {/* Header */}
        <div className="text-start mb-2 md:mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Novo Administrador</h2>
          <p className="text-sm text-gray-600 mt-1">Crie um novo administrador do sistema</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-0.5">
              Nome completo *
            </label>
            <input
              id="name"
              type="text"
              maxLength={100}
              {...register('name', { required: 'Nome é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Ex: João Silva"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-0.5">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-0.5">
              E-mail *
            </label>
            <input
              id="email"
              type="email"
              maxLength={120}
              {...register('email', {
                required: 'E-mail é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'E-mail inválido',
                },
              })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="admin@exemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-0.5">
              Senha *
            </label>
            <PasswordField
              name="password"
              register={register as any}
              registerOptions={{
                required: 'Senha é obrigatória',
                minLength: { value: 8, message: 'Mínimo 8 caracteres' },
              }}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-0.5">
              Tipo de administrador *
            </label>
            <select
              id="role"
              {...register('role', { required: 'Tipo é obrigatório' })}
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Selecione...</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-0.5">{errors.role.message}</p>
            )}
          </div>

          {/* Imagem de perfil - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-0.5">
              Imagem de perfil
            </label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer">
                <span className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-100 transition inline-block text-sm font-medium">
                  Escolher Arquivo
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Actions - Full Width */}
          <div className="md:col-span-2 flex gap-2 pt-2">
            <Button
              type="button"
              onClick={handleClose}
              disabled={loading}
              variant="outline-danger"
              className="cursor-pointer w-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full"
            >
              {loading ? 'Criando...' : 'Criar Administrador'}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  );
}

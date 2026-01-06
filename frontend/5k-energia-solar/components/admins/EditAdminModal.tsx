'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { adminService } from '@/lib/services';
import { User, UpdateAdminDto } from '@/lib/types';
import PasswordField from '@/components/ui/PasswordField';
import ResponsiveModal from '@/components/ResponsiveModal';

interface EditAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  admin: User | null;
}

export default function EditAdminModal({ isOpen, onClose, onSuccess, admin }: EditAdminModalProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UpdateAdminDto>();

  useEffect(() => {
    if (admin && isOpen) {
      setValue('name', admin.name);
      setValue('email', admin.email);
      setValue('role', admin.role);
      setValue('active', admin.active ?? true);
        setValue('phone', (admin as any).phone || '');
        setValue('pixKey', (admin as any).pixKey || '');
      // set existing avatar preview if admin has one
      if ((admin as any).photoBase64) {
        setPreview((admin as any).photoBase64);
      } else if ((admin as any).avatar) {
        setPreview((admin as any).avatar);
      } else if ((admin as any).imageBase64) {
        setPreview((admin as any).imageBase64);
      } else {
        setPreview(null);
      }
    }
  }, [admin, isOpen, setValue]);

  const onSubmit = async (data: UpdateAdminDto) => {
    if (!admin) return;

    setLoading(true);
    try {
      // Se senha não foi preenchida, remove do objeto
      const updateData = { ...data };
      if (!updateData.password) {
        delete updateData.password;
      }

      // if user selected a new file, read base64 and include as `avatar` (or imageBase64)
      if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
        const file = fileInputRef.current.files[0];
        const base64 = await toBase64(file);
        // attach to payload as `photoBase64` (backend expects this field)
        (updateData as any).photoBase64 = base64;
      }

      await adminService.update(admin.id, updateData);
      toast.success('Administrador atualizado com sucesso!');
      reset();
      // clear preview and file input
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating admin:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar administrador');
    } finally {
      setLoading(false);
    }
  };

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

  const handleClose = () => {
    if (!loading) {
      reset();
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    }
  };

  if (!isOpen || !admin) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={handleClose}>
      <div className="p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Editar Administrador</h2>
          <p className="text-sm text-gray-600 mt-1">Atualize as informações do administrador</p>
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
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-xs mt-0.5">{errors.role.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center">
            <input
              id="active"
              type="checkbox"
              {...register('active')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="active" className="ml-2 block text-sm font-medium text-gray-700">
              Administrador ativo
            </label>
          </div>

          {/* Senha (opcional) */}
          <div className="md:col-span-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-0.5">
              Nova senha (deixe em branco para manter a atual)
            </label>
            <PasswordField
              name="password"
              register={register as any}
              registerOptions={{ minLength: { value: 8, message: 'Mínimo 8 caracteres' } }}
              placeholder="Mínimo 8 caracteres"
              className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-0.5">{errors.password.message}</p>
            )}
          </div>

          {/* Avatar upload - Full Width */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-0.5">Imagem de perfil</label>
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
                <span className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block text-sm font-medium">
                  Alterar Foto
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
          <div className="md:col-span-2 flex flex-col gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full px-4 py-2 bg-linear-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="cursor-pointer w-full px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  );
}

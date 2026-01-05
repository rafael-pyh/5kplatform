'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { adminService } from '@/lib/services';
import { User, UpdateAdminDto } from '@/lib/types';
import PasswordField from '@/components/ui/PasswordField';

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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Editar Administrador</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo *
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Nome é obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: João Silva"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail inválido',
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@exemplo.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <input
                  id="phone"
                  type="text"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(xx) xxxxx-xxxx"
                />
              </div>

              {/* Pix Key */}
              <div>
                <label htmlFor="pixKey" className="block text-sm font-medium text-gray-700 mb-1">
                  Chave PIX
                </label>
                <input
                  id="pixKey"
                  type="text"
                  {...register('pixKey')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="chave@pix"
                />
              </div>

              {/* Senha (opcional) */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Nova senha (deixe em branco para manter a atual)
                </label>
                <PasswordField
                  name="password"
                  register={register as any}
                  registerOptions={{ minLength: { value: 8, message: 'Senha deve ter no mínimo 8 caracteres, incluindo letras e números' } }}
                  placeholder="******"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de administrador *
                </label>
                <select
                  id="role"
                  {...register('role', { required: 'Tipo é obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Avatar upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de perfil</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {preview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                    />
                    <p className="mt-1 text-xs text-gray-500">Envie uma imagem para o perfil (opcional).</p>
                  </div>
                </div>
              </div>
              {/* Status */}
              <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  {...register('active')}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                  Administrador ativo
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

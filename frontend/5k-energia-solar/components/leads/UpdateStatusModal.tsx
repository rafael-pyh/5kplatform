 'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { leadService } from '@/lib/services';
import { Lead } from '@/lib/types';
import ResponsiveModal from '@/components/ResponsiveModal';

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lead: Lead;
  className?: string;
}

export default function UpdateStatusModal({
  isOpen,
  onClose,
  onSuccess,
  lead,
  className,
}: UpdateStatusModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ status: string }>({
    defaultValues: {
      status: lead.status,
    },
  });

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

  const onSubmit = async (data: { status: string }) => {
    try {
      setLoading(true);
      await leadService.updateStatus(lead.id, data.status as any);
      toast.success('Status atualizado com sucesso!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

if (!isOpen) return null;

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Atualizar Status</h2>
        </div>

        {/* Lead Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-900">{lead.name}</p>
          <p className="text-xs text-gray-500">{lead.email}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              {...register('status', { required: 'Status é obrigatório' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="NEGOTIATION">Negociando</option>
              <option value="BOUGHT">Comprou</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
            {errors.status && (
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline-danger" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={loading}
              disabled={loading}
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveModal>
  );
}

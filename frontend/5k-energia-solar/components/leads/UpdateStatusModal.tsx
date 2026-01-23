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
  const [showCreditsField, setShowCreditsField] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ status: string; credits?: number }>({
    defaultValues: {
      status: lead.status,
      credits: 100, // Valor padrão
    },
  });

  // Observar mudanças no status para mostrar/esconder campo de créditos
  const watchedStatus = watch('status');
  useEffect(() => {
    // Mostrar campo de créditos sempre que houver um owner (vendedor/afiliado)
    setShowCreditsField(!!lead.owner);
  }, [lead.owner]);

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

  const onSubmit = async (data: { status: string; credits?: number }) => {
    try {
      setLoading(true);

      // Primeiro atualiza o status do lead
      await leadService.updateStatus(lead.id, data.status as any);

      // Se houver créditos definidos e for maior que 0, e houver owner, atribui créditos
      if (data.credits && data.credits > 0 && lead.owner?.id) {
        try {
          // Importar dinamicamente para evitar problemas de dependência circular
          const { shopService } = await import('@/lib/services/shop.service');
          await shopService.credits.adjust(lead.owner.id, data.credits, `Lead atualizado para ${data.status}: ${lead.name}`);
          toast.success(`Status atualizado e ${data.credits} créditos atribuídos a ${lead.owner.name}!`);
        } catch (creditError: any) {
          console.error('Erro ao atribuir créditos:', creditError);
          toast.error('Status atualizado, mas erro ao atribuir créditos');
        }
      } else {
        toast.success('Status atualizado com sucesso!');
      }

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
          {/* Credits Field - Only show when status is BOUGHT */}
          {showCreditsField && (
            <div>
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
                Créditos para {lead.owner?.name || 'Vendedor/Afiliado'} *
              </label>
              <input
                type="number"
                id="credits"
                {...register('credits', {
                  required: showCreditsField ? 'Quantidade de créditos é obrigatória' : false,
                  min: { value: 0, message: 'Mínimo 0 créditos' },
                  max: { value: 100000, message: 'Máximo 100000 créditos' }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="10"
                min="1"
                max="100000"
              />
              {errors.credits && (
                <p className="mt-1 text-sm text-red-600">{errors.credits.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Créditos serão atribuídos automaticamente ao vendedor/afiliado responsável pelo lead.
              </p>
            </div>
          )}
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

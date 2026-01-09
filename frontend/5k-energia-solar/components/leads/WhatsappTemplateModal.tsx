'use client';

import { useState, useEffect, memo } from 'react';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import ResponsiveModal from '@/components/ResponsiveModal';
import toast from 'react-hot-toast';
import {
  adminCreateTemplate,
  adminUpdateTemplate,
  adminDeleteTemplate,
} from '@/lib/services/whatsapp-template.service';
import { WhatsappTemplate } from '@/lib/types';

interface WhatsappTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: WhatsappTemplate | null;
  onSuccess?: () => void;
  token?: string;
}

const PLACEHOLDER_TEXT = '{{NOME_CLIENTE}}';

function WhatsappTemplateModal({
  isOpen,
  onClose,
  template,
  onSuccess,
  token,
}: WhatsappTemplateModalProps) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (template) {
      setName(template.name);
      setMessage(template.message);
    } else {
      setName('');
      setMessage(`Olá {{NOME_CLIENTE}},\n\nTemos uma excelente oportunidade de energia solar para você!`);
    }
  }, [template, isOpen]);

  const handleInsertPlaceholder = () => {
    const textarea = document.getElementById('message-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + PLACEHOLDER_TEXT + message.substring(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + PLACEHOLDER_TEXT.length;
        textarea.focus();
      }, 0);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error('Nome do template é obrigatório');
      return false;
    }

    if (!message.trim()) {
      toast.error('Mensagem é obrigatória');
      return false;
    }

    if (!message.includes(PLACEHOLDER_TEXT)) {
      toast.error(`A mensagem deve conter o placeholder "${PLACEHOLDER_TEXT}"`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !token) {
      return;
    }

    setIsLoading(true);

    try {
      if (template) {
        // Editar
        await adminUpdateTemplate(token, template.id, { name, message });
        toast.success('Template atualizado com sucesso!');
      } else {
        // Criar
        await adminCreateTemplate(token, { name, message });
        toast.success('Template criado com sucesso!');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!template || !token) return;

    setIsLoading(true);

    try {
      const success = await adminDeleteTemplate(token, template.id);
      if (success) {
        toast.success('Template deletado com sucesso!');
        onSuccess?.();
        onClose();
      } else {
        toast.error('Erro ao deletar template');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar template');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {template ? 'Editar Template' : 'Novo Template'}
          </h2>
          <p className="text-sm text-gray-500">
            {template ? 'Edite a mensagem do template' : 'Crie um novo template de mensagem'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome do Template *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Saudação Padrão"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Identificador único do template
          </p>
        </div>

        {/* Message Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Mensagem *
            </label>
            <Button
              type="button"
              variant="none"
              size="sm"
              onClick={handleInsertPlaceholder}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700"
            >
              <Icon icon="bi-plus-circle" className="mr-1" />
              Inserir {PLACEHOLDER_TEXT}
            </Button>
          </div>

          <textarea
            id="message-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Escreva sua mensagem aqui. Use ${PLACEHOLDER_TEXT} para inserir o nome do cliente.\n\nEx: Olá ${PLACEHOLDER_TEXT}, temos uma excelente oportunidade para você!`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-40 resize-none"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use <code className="bg-gray-100 px-1 rounded">{PLACEHOLDER_TEXT}</code> como placeholder para o nome do cliente
          </p>
        </div>

        {/* Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
          <div className="bg-white border border-gray-200 rounded p-3 text-sm text-gray-800 whitespace-pre-wrap break-word">
            {message.replace(/{{NOME_CLIENTE}}/g, 'João Silva')}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            *Exemplo com nome: João Silva
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div>
            {template && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <Icon icon="bi-trash" className="mr-2" />
                Deletar
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar este template? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deletando...' : 'Deletar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">{modalContent}</div>
    </ResponsiveModal>
  );
}

export default memo(WhatsappTemplateModal);

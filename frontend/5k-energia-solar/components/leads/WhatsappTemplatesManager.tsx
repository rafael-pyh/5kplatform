'use client';

import { useEffect, useState, memo } from 'react';
import Button from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import toast from 'react-hot-toast';
import {
  adminListAllTemplates,
} from '@/lib/services/whatsapp-template.service';
import { WhatsappTemplate } from '@/lib/types';
import WhatsappTemplateModal from '@/components/leads/WhatsappTemplateModal';

interface WhatsappTemplatesManagerProps {
  token?: string;
}

function WhatsappTemplatesManager({ token }: WhatsappTemplatesManagerProps) {
  const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await adminListAllTemplates(token);
      setTemplates(data);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setIsModalOpen(true);
  };

  const handleEdit = (template: WhatsappTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleSuccess = () => {
    loadTemplates();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Carregando templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Templates de WhatsApp</h2>
          <p className="text-sm text-gray-600">
            Gerenciar mensagens pré-definidas para contato com clientes
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          variant="primary"
        >
          <Icon icon="bi-plus-lg" className="mr-2" />
          Novo Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Icon icon="bi-chat-dots" className="text-4xl text-gray-400 mb-2" />
          <p className="text-gray-600">Nenhum template criado ainda</p>
          <p className="text-sm text-gray-500 mt-1">
            Crie um template para começar a usar mensagens pré-definidas
          </p>
          <Button
            onClick={handleCreateNew}
            variant="primary"
            className="mt-4"
          >
            <Icon icon="bi-plus-lg" className="mr-2" />
            Criar Primeiro Template
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {template.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap wrap-break-word">
                    {template.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Criado em{' '}
                    {new Date(template.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Icon icon="bi-pencil" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <WhatsappTemplateModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        template={selectedTemplate}
        onSuccess={handleSuccess}
        token={token}
      />
    </div>
  );
}

export default memo(WhatsappTemplatesManager);

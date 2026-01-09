import {
  WhatsappTemplate,
  CreateWhatsappTemplateDto,
  UpdateWhatsappTemplateDto,
  ProcessedMessage,
} from '@/lib/types';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`;

/**
 * Listar templates ativos
 */
export const getActiveTemplates = async (): Promise<WhatsappTemplate[]> => {
  try {
    const response = await fetch(`${API_BASE}/whatsapp-templates/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar templates ativos');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar templates ativos:', error);
    return [];
  }
};

/**
 * Obter template padrão
 */
export const getDefaultTemplate = async (): Promise<WhatsappTemplate | null> => {
  try {
    const response = await fetch(`${API_BASE}/whatsapp-templates/default`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Erro ao buscar template padrão:', error);
    return null;
  }
};

/**
 * Processar mensagem com nome do cliente
 */
export const processMessage = async (
  templateId: string,
  customerName: string
): Promise<ProcessedMessage | null> => {
  try {
    const response = await fetch(
      `${API_BASE}/whatsapp-templates/process-message`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          customerName,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao processar mensagem');
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Erro ao processar mensagem:', error);
    return null;
  }
};

/**
 * ADMIN: Listar todos os templates (ativos e inativos)
 */
export const adminListAllTemplates = async (
  token: string
): Promise<WhatsappTemplate[]> => {
  try {
    const response = await fetch(`${API_BASE}/whatsapp-templates/admin/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar templates');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return [];
  }
};

/**
 * ADMIN: Criar novo template
 */
export const adminCreateTemplate = async (
  token: string,
  dto: CreateWhatsappTemplateDto
): Promise<WhatsappTemplate | null> => {
  try {
    const response = await fetch(`${API_BASE}/whatsapp-templates/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar template');
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Erro ao criar template:', error);
    throw error;
  }
};

/**
 * ADMIN: Obter um template por ID
 */
export const adminGetTemplate = async (
  token: string,
  templateId: string
): Promise<WhatsappTemplate | null> => {
  try {
    const response = await fetch(
      `${API_BASE}/whatsapp-templates/admin/${templateId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao buscar template');
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Erro ao buscar template:', error);
    return null;
  }
};

/**
 * ADMIN: Atualizar um template
 */
export const adminUpdateTemplate = async (
  token: string,
  templateId: string,
  dto: UpdateWhatsappTemplateDto
): Promise<WhatsappTemplate | null> => {
  try {
    const response = await fetch(
      `${API_BASE}/whatsapp-templates/admin/${templateId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar template');
    }

    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    throw error;
  }
};

/**
 * ADMIN: Deletar um template
 */
export const adminDeleteTemplate = async (
  token: string,
  templateId: string
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${API_BASE}/whatsapp-templates/admin/${templateId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao deletar template');
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar template:', error);
    return false;
  }
};

/**
 * Gerar URL do WhatsApp com mensagem pré-processada
 */
export const generateWhatsappLink = (
  phoneNumber: string,
  message: string
): string => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};

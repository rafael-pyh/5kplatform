import { Request, Response } from 'express';
import {
  createTemplate,
  listAllTemplates,
  listActiveTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  processMessage,
  getDefaultTemplate,
} from '../services/whatsapp-template.service';

/**
 * ADMIN ONLY: Criar novo template de mensagem WhatsApp
 */
export const adminCreateTemplate = async (req: Request, res: Response) => {
  try {
    const { name, message } = req.body;

    // Validações básicas
    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nome e mensagem são obrigatórios',
      });
    }

    if (!message.includes('{{NOME_CLIENTE}}')) {
      return res.status(400).json({
        success: false,
        message: 'A mensagem deve conter o placeholder {{NOME_CLIENTE}} para o nome do cliente',
      });
    }

    const template = await createTemplate(name, message);

    return res.status(201).json({
      success: true,
      message: 'Template criado com sucesso',
      data: template,
    });
  } catch (error: any) {
    console.error('Erro ao criar template:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao criar template',
    });
  }
};

/**
 * ADMIN ONLY: Listar todos os templates
 */
export const adminListAllTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await listAllTemplates();

    return res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error('Erro ao listar templates:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao listar templates',
    });
  }
};

/**
 * PUBLIC: Listar apenas templates ativos
 */
export const getActiveTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await listActiveTemplates();

    return res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    console.error('Erro ao listar templates ativos:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao listar templates ativos',
    });
  }
};

/**
 * ADMIN ONLY: Obter um template por ID
 */
export const adminGetTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    const template = await getTemplateById(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    return res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Erro ao obter template:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter template',
    });
  }
};

/**
 * ADMIN ONLY: Atualizar um template
 */
export const adminUpdateTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    const { name, message, isActive } = req.body;

    // Validar que a mensagem contém o placeholder se for atualizar
    if (message && !message.includes('{{NOME_CLIENTE}}')) {
      return res.status(400).json({
        success: false,
        message: 'A mensagem deve conter o placeholder {{NOME_CLIENTE}} para o nome do cliente',
      });
    }

    const template = await updateTemplate(templateId, name, message, isActive);

    return res.json({
      success: true,
      message: 'Template atualizado com sucesso',
      data: template,
    });
  } catch (error: any) {
    console.error('Erro ao atualizar template:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao atualizar template',
    });
  }
};

/**
 * ADMIN ONLY: Deletar um template
 */
export const adminDeleteTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    await deleteTemplate(templateId);

    return res.json({
      success: true,
      message: 'Template deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar template:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao deletar template',
    });
  }
};

/**
 * PUBLIC: Obter mensagem processada com nome do cliente
 * Body: { templateId: string, customerName: string }
 */
export const getProcessedMessage = async (req: Request, res: Response) => {
  try {
    const { templateId, customerName } = req.body;

    if (!templateId || !customerName) {
      return res.status(400).json({
        success: false,
        message: 'templateId e customerName são obrigatórios',
      });
    }

    const template = await getTemplateById(templateId);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template não encontrado',
      });
    }

    const processedMessage = processMessage(template, customerName);

    return res.json({
      success: true,
      data: {
        templateId,
        customerName,
        message: processedMessage,
      },
    });
  } catch (error: any) {
    console.error('Erro ao processar mensagem:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao processar mensagem',
    });
  }
};

/**
 * PUBLIC: Obter template padrão
 */
export const getDefaultTemplateController = async (
  req: Request,
  res: Response
) => {
  try {
    const template = await getDefaultTemplate();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum template padrão disponível',
      });
    }

    return res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    console.error('Erro ao obter template padrão:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erro ao obter template padrão',
    });
  }
};

import { WhatsappTemplate } from '../models/WhatsappTemplate';

/**
 * Criar um novo template de mensagem WhatsApp
 */
export const createTemplate = async (
  name: string,
  message: string
): Promise<WhatsappTemplate> => {
  try {
    // Validar que a mensagem contém o placeholder
    if (!message.includes('{{NOME_CLIENTE}}')) {
      throw new Error('A mensagem deve conter o placeholder {{NOME_CLIENTE}}');
    }

    const template = await WhatsappTemplate.create({
      name,
      message,
      isActive: true,
    });

    return template;
  } catch (error: any) {
    console.error('Erro ao criar template de WhatsApp:', error);
    throw new Error(`Erro ao criar template: ${error.message}`);
  }
};

/**
 * Listar todos os templates ativos
 */
export const listActiveTemplates = async (): Promise<WhatsappTemplate[]> => {
  try {
    const templates = await WhatsappTemplate.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
    });
    return templates;
  } catch (error: any) {
    console.error('Erro ao listar templates de WhatsApp:', error);
    throw new Error(`Erro ao listar templates: ${error.message}`);
  }
};

/**
 * Obter todos os templates (ativos e inativos)
 */
export const listAllTemplates = async (): Promise<WhatsappTemplate[]> => {
  try {
    const templates = await WhatsappTemplate.findAll({
      order: [['createdAt', 'DESC']],
    });
    return templates;
  } catch (error: any) {
    console.error('Erro ao listar templates de WhatsApp:', error);
    throw new Error(`Erro ao listar templates: ${error.message}`);
  }
};

/**
 * Obter um template por ID
 */
export const getTemplateById = async (
  templateId: string
): Promise<WhatsappTemplate | null> => {
  try {
    const template = await WhatsappTemplate.findByPk(templateId);
    return template;
  } catch (error: any) {
    console.error('Erro ao obter template de WhatsApp:', error);
    throw new Error(`Erro ao obter template: ${error.message}`);
  }
};

/**
 * Atualizar um template
 */
export const updateTemplate = async (
  templateId: string,
  name?: string,
  message?: string,
  isActive?: boolean
): Promise<WhatsappTemplate> => {
  try {
    const template = await WhatsappTemplate.findByPk(templateId);

    if (!template) {
      throw new Error('Template não encontrado');
    }

    // Validar que a mensagem contém o placeholder se for atualizar
    if (message && !message.includes('{{NOME_CLIENTE}}')) {
      throw new Error('A mensagem deve conter o placeholder {{NOME_CLIENTE}}');
    }

    if (name) template.name = name;
    if (message) template.message = message;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();
    return template;
  } catch (error: any) {
    console.error('Erro ao atualizar template de WhatsApp:', error);
    throw new Error(`Erro ao atualizar template: ${error.message}`);
  }
};

/**
 * Deletar um template
 */
export const deleteTemplate = async (templateId: string): Promise<void> => {
  try {
    const template = await WhatsappTemplate.findByPk(templateId);

    if (!template) {
      throw new Error('Template não encontrado');
    }

    await template.destroy();
  } catch (error: any) {
    console.error('Erro ao deletar template de WhatsApp:', error);
    throw new Error(`Erro ao deletar template: ${error.message}`);
  }
};

/**
 * Processar mensagem substituindo placeholder pelo nome do cliente
 */
export const processMessage = (
  template: WhatsappTemplate,
  customerName: string
): string => {
  return template.message.replace('{{NOME_CLIENTE}}', customerName);
};

/**
 * Obter o primeiro template ativo como padrão
 */
export const getDefaultTemplate = async (): Promise<WhatsappTemplate | null> => {
  try {
    const template = await WhatsappTemplate.findOne({
      where: { isActive: true },
      order: [['createdAt', 'ASC']],
    });
    return template;
  } catch (error: any) {
    console.error('Erro ao obter template padrão de WhatsApp:', error);
    throw new Error(`Erro ao obter template padrão: ${error.message}`);
  }
};

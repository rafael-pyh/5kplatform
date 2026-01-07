import { Creative, CreativeType } from '../models/Creative';
import { uploadFileToMinIO, deleteFileFromMinIO } from './storage.service';
import { Op } from 'sequelize';

/**
 * Fazer upload de um criativo (placard, banner, etc)
 * Pode receber um arquivo para fazer upload ou uma URL já existente no MinIO
 */
export const uploadCreative = async (
  fileOrUrl: Express.Multer.File | string,
  userId: string,
  name: string,
  type: CreativeType = CreativeType.PLACARD,
  description?: string,
  tags?: string
): Promise<Creative> => {
  try {
    let imageUrl: string;

    // Se for um arquivo, fazer upload para MinIO
    if (typeof fileOrUrl === 'object' && fileOrUrl.buffer) {
      imageUrl = await uploadFileToMinIO(
        fileOrUrl,
        fileOrUrl.originalname,
        'criativos'
      );
    } else if (typeof fileOrUrl === 'string') {
      // Se for URL, usar diretamente
      imageUrl = fileOrUrl;
    } else {
      throw new Error('Arquivo ou URL inválida');
    }

    // Criar registro no banco de dados
    const creative = await Creative.create({
      name,
      description,
      imageUrl,
      type,
      uploadedByUserId: userId,
      tags,
      downloadCount: 0,
    });

    return creative;
  } catch (error: any) {
    console.error('Erro ao fazer upload de criativo:', error);
    throw new Error(`Erro ao fazer upload do criativo: ${error.message}`);
  }
};

/**
 * Listar todos os criativos ativos
 */
export const listActiveCreatives = async (
  type?: CreativeType,
  limit: number = 50,
  offset: number = 0
): Promise<{ total: number; creatives: Creative[] }> => {
  try {
    const where: any = { active: true };

    if (type) {
      where.type = type;
    }

    const { count, rows } = await Creative.findAndCountAll({
      where,
      include: [
        {
          association: 'uploadedBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      creatives: rows,
    };
  } catch (error: any) {
    console.error('Erro ao listar criativos:', error);
    throw new Error(`Erro ao listar criativos: ${error.message}`);
  }
};

/**
 * Buscar criativo por ID
 */
export const getCreativeById = async (creativeId: string): Promise<Creative | null> => {
  try {
    const creative = await Creative.findByPk(creativeId, {
      include: [
        {
          association: 'uploadedBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (creative) {
      // Incrementar contador de downloads
      await creative.increment('downloadCount');
    }

    return creative;
  } catch (error: any) {
    console.error('Erro ao buscar criativo:', error);
    throw new Error(`Erro ao buscar criativo: ${error.message}`);
  }
};

/**
 * Buscar criativos por tipo
 */
export const getCreativesByType = async (
  type: CreativeType,
  limit: number = 50,
  offset: number = 0
): Promise<{ total: number; creatives: Creative[] }> => {
  try {
    const { count, rows } = await Creative.findAndCountAll({
      where: { type, active: true },
      include: [
        {
          association: 'uploadedBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      creatives: rows,
    };
  } catch (error: any) {
    console.error('Erro ao buscar criativos por tipo:', error);
    throw new Error(`Erro ao buscar criativos: ${error.message}`);
  }
};

/**
 * Buscar criativos por tags
 */
export const searchCreativesByTags = async (
  searchTags: string[],
  limit: number = 50,
  offset: number = 0
): Promise<{ total: number; creatives: Creative[] }> => {
  try {
    const tagConditions = searchTags.map((tag) => ({
      tags: {
        [Op.iLike]: `%${tag}%`,
      },
    }));

    const { count, rows } = await Creative.findAndCountAll({
      where: {
        active: true,
        [Op.or]: tagConditions,
      },
      include: [
        {
          association: 'uploadedBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['downloadCount', 'DESC']],
    });

    return {
      total: count,
      creatives: rows,
    };
  } catch (error: any) {
    console.error('Erro ao buscar criativos por tags:', error);
    throw new Error(`Erro ao buscar criativos: ${error.message}`);
  }
};

/**
 * Atualizar um criativo (apenas admin)
 */
export const updateCreative = async (
  creativeId: string,
  updates: Partial<Creative>
): Promise<Creative | null> => {
  try {
    const creative = await Creative.findByPk(creativeId);

    if (!creative) {
      throw new Error('Criativo não encontrado');
    }

    await creative.update(updates);
    return creative;
  } catch (error: any) {
    console.error('Erro ao atualizar criativo:', error);
    throw new Error(`Erro ao atualizar criativo: ${error.message}`);
  }
};

/**
 * Deletar um criativo (apenas admin)
 */
export const deleteCreative = async (creativeId: string): Promise<void> => {
  try {
    const creative = await Creative.findByPk(creativeId);

    if (!creative) {
      throw new Error('Criativo não encontrado');
    }

    // Extrair o nome do objeto do MinIO da URL
    // URL: http://localhost:9000/images/criativos/1702876543210-name.jpg
    const urlParts = creative.imageUrl.split('/');
    const objectName = `criativos/${urlParts[urlParts.length - 1]}`;

    // Deletar arquivo do MinIO
    await deleteFileFromMinIO(objectName);

    // Deletar registro do banco
    await creative.destroy();
  } catch (error: any) {
    console.error('Erro ao deletar criativo:', error);
    throw new Error(`Erro ao deletar criativo: ${error.message}`);
  }
};

/**
 * Desativar um criativo (ao invés de deletar)
 */
export const deactivateCreative = async (creativeId: string): Promise<Creative | null> => {
  try {
    const creative = await Creative.findByPk(creativeId);

    if (!creative) {
      throw new Error('Criativo não encontrado');
    }

    await creative.update({ active: false });
    return creative;
  } catch (error: any) {
    console.error('Erro ao desativar criativo:', error);
    throw new Error(`Erro ao desativar criativo: ${error.message}`);
  }
};

/**
 * Obter estatísticas de criativos
 */
export const getCreativeStats = async () => {
  try {
    const total = await Creative.count();
    const active = await Creative.count({ where: { active: true } });
    const byType = await Creative.findAll({
      attributes: [
        'type',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    const mostDownloaded = await Creative.findAll({
      where: { active: true },
      limit: 5,
      order: [['downloadCount', 'DESC']],
      attributes: ['id', 'name', 'downloadCount'],
    });

    return {
      total,
      active,
      byType,
      mostDownloaded,
    };
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    throw new Error(`Erro ao obter estatísticas: ${error.message}`);
  }
};
/**
 * Salvar a posição do QR code no criativo (apenas ADMIN/SUPER_ADMIN)
 */
export const setQRCodePosition = async (
  creativeId: string,
  boxCenterXRatio: number,
  boxCenterYRatio: number,
  boxSizeRatio: number
): Promise<Creative> => {
  try {
    // Validar valores (devem estar entre 0 e 1)
    if (
      boxCenterXRatio < 0 || boxCenterXRatio > 1 ||
      boxCenterYRatio < 0 || boxCenterYRatio > 1 ||
      boxSizeRatio < 0 || boxSizeRatio > 1
    ) {
      throw new Error(
        'Valores de posição devem estar entre 0 e 1'
      );
    }

    const creative = await Creative.findByPk(creativeId);
    if (!creative) {
      throw new Error('Criativo não encontrado');
    }

    // Atualizar a posição do QR code
    creative.qrBoxCenterXRatio = boxCenterXRatio;
    creative.qrBoxCenterYRatio = boxCenterYRatio;
    creative.qrBoxSizeRatio = boxSizeRatio;
    await creative.save();

    return creative;
  } catch (error: any) {
    console.error('Erro ao salvar posição do QR code:', error);
    throw new Error(`Erro ao salvar posição do QR code: ${error.message}`);
  }
};

/**
 * Obter a posição do QR code de um criativo
 */
export const getQRCodePosition = async (
  creativeId: string
): Promise<{
  boxCenterXRatio?: number;
  boxCenterYRatio?: number;
  boxSizeRatio?: number;
} | null> => {
  try {
    const creative = await Creative.findByPk(creativeId);
    if (!creative) {
      return null;
    }

    return {
      boxCenterXRatio: creative.qrBoxCenterXRatio,
      boxCenterYRatio: creative.qrBoxCenterYRatio,
      boxSizeRatio: creative.qrBoxSizeRatio,
    };
  } catch (error: any) {
    console.error('Erro ao obter posição do QR code:', error);
    throw new Error(`Erro ao obter posição do QR code: ${error.message}`);
  }
};
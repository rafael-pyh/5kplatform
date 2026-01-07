import { Request, Response } from 'express';
import {
  uploadCreative,
  listActiveCreatives,
  getCreativeById,
  getCreativesByType,
  searchCreativesByTags,
  updateCreative,
  deleteCreative,
  deactivateCreative,
  getCreativeStats,
  setQRCodePosition,
  getQRCodePosition,
} from '../services/creative.service';
import { CreativeType } from '../models/Creative';

/**
 * ADMIN ONLY: Upload de um novo criativo
 * Pode receber:
 * 1. Multipart form-data com file (upload direto)
 * 2. JSON com imageUrl já em MinIO
 */
export const adminUploadCreative = async (req: Request, res: Response) => {
  try {
    const { name, description, type = CreativeType.PLACARD, tags, imageUrl } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome do criativo é obrigatório',
      });
    }

    // Validar tipo
    if (!Object.values(CreativeType).includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Tipo inválido. Tipos válidos: ${Object.values(CreativeType).join(', ')}`,
      });
    }

    // Validar que temos ou arquivo ou URL
    if (!req.file && !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Forneça um arquivo ou uma URL de imagem',
      });
    }

    // Usar o arquivo ou a URL
    const fileOrUrl = req.file || imageUrl;

    const creative = await uploadCreative(
      fileOrUrl,
      userId,
      name,
      type,
      description,
      tags
    );

    return res.status(201).json({
      success: true,
      data: {
        id: creative.id,
        name: creative.name,
        description: creative.description,
        imageUrl: creative.imageUrl,
        type: creative.type,
        tags: creative.tags,
        createdAt: creative.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro no upload de criativo:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUBLIC: Listar todos os criativos ativos
 */
export const listCreatives = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as CreativeType | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await listActiveCreatives(type, limit, offset);

    return res.json({
      success: true,
      data: {
        total: result.total,
        limit,
        offset,
        criativos: result.creatives.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
          type: c.type,
          tags: c.tags,
          downloadCount: c.downloadCount,
          uploadedBy: {
            id: (c as any).uploadedBy?.id,
            name: (c as any).uploadedBy?.name,
          },
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Erro ao listar criativos:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUBLIC: Obter detalhes de um criativo específico
 */
export const getCreative = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const creative = await getCreativeById(id);

    if (!creative || !creative.active) {
      return res.status(404).json({
        success: false,
        message: 'Criativo não encontrado',
      });
    }

    return res.json({
      success: true,
      data: {
        id: creative.id,
        name: creative.name,
        description: creative.description,
        imageUrl: creative.imageUrl,
        type: creative.type,
        tags: creative.tags,
        downloadCount: creative.downloadCount,
        uploadedBy: {
          id: (creative as any).uploadedBy?.id,
          name: (creative as any).uploadedBy?.name,
        },
        createdAt: creative.createdAt,
        updatedAt: creative.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter criativo:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUBLIC: Buscar criativos por tipo
 */
export const getCreativesByTypeController = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    if (!Object.values(CreativeType).includes(type as CreativeType)) {
      return res.status(400).json({
        success: false,
        message: `Tipo inválido. Tipos válidos: ${Object.values(CreativeType).join(', ')}`,
      });
    }

    const result = await getCreativesByType(type as CreativeType, limit, offset);

    return res.json({
      success: true,
      data: {
        type,
        total: result.total,
        limit,
        offset,
        criativos: result.creatives.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
          type: c.type,
          tags: c.tags,
          downloadCount: c.downloadCount,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar criativos por tipo:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUBLIC: Buscar criativos por tags
 */
export const searchCreatives = async (req: Request, res: Response) => {
  try {
    const { tags } = req.query;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "tags" é obrigatório. Ex: ?tags=solar,energia',
      });
    }

    const tagArray = (tags as string).split(',').map((t) => t.trim());

    const result = await searchCreativesByTags(tagArray, limit, offset);

    return res.json({
      success: true,
      data: {
        searchTags: tagArray,
        total: result.total,
        limit,
        offset,
        criativos: result.creatives.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
          type: c.type,
          tags: c.tags,
          downloadCount: c.downloadCount,
          createdAt: c.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Erro ao buscar criativos:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN ONLY: Atualizar criativo
 */
export const adminUpdateCreative = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, type, tags, active } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (type) updates.type = type;
    if (tags !== undefined) updates.tags = tags;
    if (active !== undefined) updates.active = active;

    const creative = await updateCreative(id, updates);

    if (!creative) {
      return res.status(404).json({
        success: false,
        message: 'Criativo não encontrado',
      });
    }

    return res.json({
      success: true,
      data: {
        id: creative.id,
        name: creative.name,
        description: creative.description,
        type: creative.type,
        tags: creative.tags,
        active: creative.active,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar criativo:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN ONLY: Desativar criativo
 */
export const adminDeactivateCreative = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const creative = await deactivateCreative(id);

    if (!creative) {
      return res.status(404).json({
        success: false,
        message: 'Criativo não encontrado',
      });
    }

    return res.json({
      success: true,
      message: 'Criativo desativado com sucesso',
      data: {
        id: creative.id,
        active: creative.active,
      },
    });
  } catch (error: any) {
    console.error('Erro ao desativar criativo:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN ONLY: Deletar criativo
 */
export const adminDeleteCreative = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteCreative(id);

    return res.json({
      success: true,
      message: 'Criativo deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar criativo:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN ONLY: Obter estatísticas de criativos
 */
export const adminGetStats = async (req: Request, res: Response) => {
  try {
    const stats = await getCreativeStats();

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ADMIN ONLY: Definir posição do QR code no criativo
 */
export const adminSetQRCodePosition = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { boxCenterXRatio, boxCenterYRatio, boxSizeRatio } = req.body;

    // Validar que os valores foram fornecidos
    if (
      boxCenterXRatio === undefined ||
      boxCenterYRatio === undefined ||
      boxSizeRatio === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Forneça boxCenterXRatio, boxCenterYRatio e boxSizeRatio',
      });
    }

    const creative = await setQRCodePosition(
      id,
      boxCenterXRatio,
      boxCenterYRatio,
      boxSizeRatio
    );

    return res.json({
      success: true,
      message: 'Posição do QR code salva com sucesso',
      data: {
        id: creative.id,
        name: creative.name,
        qrBoxCenterXRatio: creative.qrBoxCenterXRatio,
        qrBoxCenterYRatio: creative.qrBoxCenterYRatio,
        qrBoxSizeRatio: creative.qrBoxSizeRatio,
      },
    });
  } catch (error: any) {
    console.error('Erro ao salvar posição do QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUBLIC: Obter a posição do QR code de um criativo
 */
export const getQRCodePositionController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const position = await getQRCodePosition(id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Criativo não encontrado',
      });
    }

    return res.json({
      success: true,
      data: position,
    });
  } catch (error: any) {
    console.error('Erro ao obter posição do QR code:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

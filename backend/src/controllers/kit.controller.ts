import { Request, Response } from 'express';
import { Kit } from '../models/Kit';
import {
  createKit,
  listKits,
  getKitById,
  updateKit,
  updateKitItems,
  toggleKitStatus,
  deleteKit,
  uploadKitImage,
} from '../services/kit.service';

/**
 * Kit Controller
 * Endpoints REST para CRUD de kits
 */

/**
 * POST /api/kits
 * Criar novo kit com itens (ADMIN)
 */
export const createKitController = async (req: Request, res: Response) => {
  try {
    const { name, price, description, sku, imageUrl, tags, items } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!name || price === undefined || !items) {
      return res.status(400).json({
        success: false,
        message: 'Nome, preço e itens são obrigatórios',
      });
    }

    const kit = await createKit({
      name,
      price: parseFloat(price),
      userId,
      description,
      sku,
      imageUrl,
      tags,
      items,
    });

    // Buscar o kit criado com os includes
    const createdKit = await Kit.findByPk(kit.id, {
      include: [
        {
          association: 'items',
          include: [{ association: 'product' }],
        },
        {
          association: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      data: {
        id: createdKit!.id,
        name: createdKit!.name,
        price: createdKit!.price,
        description: createdKit!.description,
        sku: createdKit!.sku,
        imageUrl: createdKit!.imageUrl,
        tags: createdKit!.tags,
        active: createdKit!.active,
        items: createdKit!.items?.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            sku: item.product.sku,
          } : undefined,
        })),
        createdAt: createdKit!.createdAt,
        updatedAt: createdKit!.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar kit:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/kits
 * Listar kits com filtros e paginação
 */
export const listKitsController = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const filters: any = {};
    if (req.query.name) filters.name = req.query.name;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
    if (req.query.tags) filters.tags = req.query.tags;
    if (req.query.active !== undefined) filters.active = req.query.active === 'true';

    const { total, kits } = await listKits(limit, offset, filters);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        limit,
        offset,
      },
      data: kits.map((k) => ({
        id: k.id,
        name: k.name,
        price: k.price,
        description: k.description,
        sku: k.sku,
        imageUrl: k.imageUrl,
        tags: k.tags,
        active: k.active,
        itemsCount: k.items?.length || 0,
        createdAt: k.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar kits:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/kits/:id
 * Obter detalhes de um kit com todos os itens
 */
export const getKitController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const kit = await getKitById(id);

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Kit não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: kit.id,
        name: kit.name,
        price: kit.price,
        description: kit.description,
        sku: kit.sku,
        imageUrl: kit.imageUrl,
        tags: kit.tags,
        active: kit.active,
        items: kit.items?.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.product?.name,
          productPrice: item.product?.price,
          quantity: item.quantity,
          notes: item.notes,
        })) || [],
        createdAt: kit.createdAt,
        updatedAt: kit.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter kit:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUT /api/kits/:id
 * Atualizar informações do kit (sem alterar itens)
 */
export const updateKitController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const kit = await updateKit(id, updates);

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Kit não encontrado',
      });
    }

    // Buscar o kit atualizado com os includes
    const updatedKit = await Kit.findByPk(id, {
      include: [
        {
          association: 'items',
          include: [{ association: 'product' }],
        },
        {
          association: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        id: updatedKit!.id,
        name: updatedKit!.name,
        price: updatedKit!.price,
        description: updatedKit!.description,
        sku: updatedKit!.sku,
        imageUrl: updatedKit!.imageUrl,
        tags: updatedKit!.tags,
        active: updatedKit!.active,
        items: updatedKit!.items?.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            sku: item.product.sku,
          } : undefined,
        })),
        createdAt: updatedKit!.createdAt,
        updatedAt: updatedKit!.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar kit:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUT /api/kits/:id/items
 * Atualizar itens do kit
 */
export const updateKitItemsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de itens é obrigatória e não pode estar vazia',
      });
    }

    const newItems = await updateKitItems(id, items);

    return res.status(200).json({
      success: true,
      data: newItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao atualizar itens do kit:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/kits/:id/status
 * Ativar/Inativar kit
 */
export const toggleKitStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Campo "active" deve ser booleano',
      });
    }

    const kit = await toggleKitStatus(id, active);

    if (!kit) {
      return res.status(404).json({
        success: false,
        message: 'Kit não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: kit.id,
        active: kit.active,
      },
    });
  } catch (error: any) {
    console.error('Erro ao alternar status do kit:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/kits/:id
 * Deletar kit
 */
export const deleteKitController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteKit(id);

    return res.status(200).json({
      success: true,
      message: 'Kit deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar kit:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/kits/:id/image
 * Fazer upload de imagem do kit (multipart)
 */
export const uploadKitImageController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo de imagem é obrigatório',
      });
    }

    const kit = await uploadKitImage(id, req.file);

    return res.status(200).json({
      success: true,
      data: {
        id: kit.id,
        name: kit.name,
        price: kit.price,
        imageUrl: kit.imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload de imagem do kit:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

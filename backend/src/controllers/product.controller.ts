import { Request, Response } from 'express';
import {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  addProductImage,
  removeProductImage,
  reorderProductImages,
  deleteProduct,
  toggleProductStatus,
} from '../services/product.service';

/**
 * Product Controller
 * Endpoints REST para CRUD de produtos
 * Todas as validações de negócio são feitas no service
 */

/**
 * POST /api/products
 * Criar novo produto (ADMIN)
 */
export const createProductController = async (req: Request, res: Response) => {
  try {
    const { name, price, description, sku, stock, tags } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nome e preço são obrigatórios',
      });
    }

    const product = await createProduct(
      name,
      parseFloat(price),
      userId,
      description,
      sku,
      stock ? parseInt(stock) : undefined,
      tags
    );

    return res.status(201).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        sku: product.sku,
        stock: product.stock,
        tags: product.tags,
        active: product.active,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar produto:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/products
 * Listar produtos com filtros
 */
export const listProductsController = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const filters: any = {};
    if (req.query.name) filters.name = req.query.name;
    if (req.query.minPrice) filters.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) filters.maxPrice = parseFloat(req.query.maxPrice as string);
    if (req.query.tags) filters.tags = req.query.tags;
    if (req.query.active !== undefined) filters.active = req.query.active === 'true';

    const { total, products } = await listProducts(limit, offset, filters);

    return res.status(200).json({
      success: true,
      pagination: {
        total,
        limit,
        offset,
      },
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        sku: p.sku,
        stock: p.stock,
        tags: p.tags,
        active: p.active,
        images: p.images?.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          order: img.order,
          description: img.description,
        })) || [],
        imagesCount: p.images?.length || 0,
        createdAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar produtos:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/products/:id
 * Obter detalhes de um produto
 */
export const getProductController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        sku: product.sku,
        stock: product.stock,
        tags: product.tags,
        active: product.active,
        images: product.images?.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          order: img.order,
          description: img.description,
        })) || [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter produto:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PUT /api/products/:id
 * Atualizar produto
 */
export const updateProductController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await updateProduct(id, updates);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        sku: product.sku,
        stock: product.stock,
        tags: product.tags,
        active: product.active,
      },
    });
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * PATCH /api/products/:id/status
 * Ativar/Inativar produto
 */
export const toggleProductStatusController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Campo "active" deve ser booleano',
      });
    }

    const product = await toggleProductStatus(id, active);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: product.id,
        active: product.active,
      },
    });
  } catch (error: any) {
    console.error('Erro ao alternar status do produto:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/products/:id/images
 * Adicionar imagem ao produto (multipart)
 */
export const addProductImageController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { order, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo de imagem é obrigatório',
      });
    }

    const image = await addProductImage(
      id,
      req.file,
      order ? parseInt(order) : undefined,
      description
    );

    return res.status(201).json({
      success: true,
      data: {
        id: image.id,
        imageUrl: image.imageUrl,
        order: image.order,
        description: image.description,
      },
    });
  } catch (error: any) {
    console.error('Erro ao adicionar imagem:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/products/:productId/images/:imageId
 * Remover imagem do produto
 */
export const removeProductImageController = async (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;

    await removeProductImage(imageId);

    return res.status(200).json({
      success: true,
      message: 'Imagem removida com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao remover imagem:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/products/:id/images/reorder
 * Reordenar imagens
 */
export const reorderProductImagesController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { imageIds } = req.body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lista de IDs de imagens é obrigatória',
      });
    }

    await reorderProductImages(id, imageIds);

    return res.status(200).json({
      success: true,
      message: 'Imagens reordenadas com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao reordenar imagens:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/products/:id
 * Deletar produto
 */
export const deleteProductController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteProduct(id);

    return res.status(200).json({
      success: true,
      message: 'Produto deletado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

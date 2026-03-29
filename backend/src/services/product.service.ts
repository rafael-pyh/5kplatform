import { Product } from '../models/Product';
import { ProductImage } from '../models/ProductImage';
import { uploadFileToMinIO, deleteFileFromMinIO } from './storage.service';
import { Op } from 'sequelize';

/**
 * Product Service
 * Gerencia CRUD de produtos e imagens
 * Validações de negócio: estoque, ativação, etc
 */

/**
 * Criar um novo produto
 */
export const createProduct = async (
  name: string,
  price: number,
  userId: string,
  description?: string,
  sku?: string,
  stock?: number,
  tags?: string,
): Promise<Product> => {
  try {
    if (price <= 0) {
      throw new Error('Preço do produto deve ser maior que zero');
    }

    const product = await Product.create({
      name,
      price,
      description,
      sku,
      stock,
      tags,
      createdByUserId: userId,
      active: true,
    });

    return product;
  } catch (error: any) {
    console.error('Erro ao criar produto:', error);
    throw new Error(`Erro ao criar produto: ${error.message}`);
  }
};

/**
 * Listar todos os produtos ativos com paginação
 */
export const listProducts = async (
  limit: number = 50,
  offset: number = 0,
  filters?: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string;
    active?: boolean;
  }
): Promise<{ total: number; products: Product[] }> => {
  try {
    const where: any = {};

    // Filtro de nome (case-insensitive)
    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    // Filtro de preço
    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price[Op.gte] = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price[Op.lte] = filters.maxPrice;
      }
    }

    // Filtro de tags
    if (filters?.tags) {
      where.tags = { [Op.iLike]: `%${filters.tags}%` };
    }

    // Filtro de atividade
    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    const { count, rows } = await Product.findAndCountAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: [
        {
          association: 'images',
          attributes: ['id', 'imageUrl', 'order', 'description'],
        },
        {
          association: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      products: rows,
    };
  } catch (error: any) {
    console.error('Erro ao listar produtos:', error);
    throw new Error(`Erro ao listar produtos: ${error.message}`);
  }
};

/**
 * Buscar produto por ID com imagens
 */
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const product = await Product.findByPk(productId, {
      include: [
        {
          association: 'images',
          attributes: ['id', 'imageUrl', 'order', 'description'],
          order: [['order', 'ASC']],
        },
        {
          association: 'createdBy',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return product;
  } catch (error: any) {
    console.error('Erro ao buscar produto:', error);
    throw new Error(`Erro ao buscar produto: ${error.message}`);
  }
};

/**
 * Atualizar produto
 */
export const updateProduct = async (
  productId: string,
  updates: Partial<{
    name: string;
    description: string;
    price: number;
    sku: string;
    stock: number;
    tags: string;
    active: boolean;
  }>,
): Promise<Product | null> => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Validar preço se fornecido
    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error('Preço do produto deve ser maior que zero');
    }

    await product.update(updates);
    return product;
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error);
    throw new Error(`Erro ao atualizar produto: ${error.message}`);
  }
};

/**
 * Adicionar imagem ao produto
 */
export const addProductImage = async (
  productId: string,
  file: Express.Multer.File,
  order?: number,
  description?: string,
): Promise<ProductImage> => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Fazer upload para MinIO
    const imageUrl = await uploadFileToMinIO(
      file,
      file.originalname,
      'products',
    );

    // Criar registro de imagem
    const image = await ProductImage.create({
      productId,
      imageUrl,
      order: order || 999, // Padrão: adiciona no final
      description,
    });

    return image;
  } catch (error: any) {
    console.error('Erro ao adicionar imagem ao produto:', error);
    throw new Error(`Erro ao adicionar imagem: ${error.message}`);
  }
};

/**
 * Remover imagem do produto
 */
export const removeProductImage = async (imageId: string): Promise<void> => {
  try {
    const image = await ProductImage.findByPk(imageId);
    if (!image) {
      throw new Error('Imagem não encontrada');
    }

    // Deletar arquivo do MinIO
    try {
      await deleteFileFromMinIO(image.imageUrl);
    } catch (err) {
      console.warn('Erro ao deletar arquivo do MinIO:', err);
    }

    // Deletar registro
    await image.destroy();
  } catch (error: any) {
    console.error('Erro ao remover imagem:', error);
    throw new Error(`Erro ao remover imagem: ${error.message}`);
  }
};

/**
 * Reordenar imagens do produto
 */
export const reorderProductImages = async (
  productId: string,
  imageIds: string[],
): Promise<void> => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Atualizar ordem de cada imagem
    for (let i = 0; i < imageIds.length; i++) {
      await ProductImage.update(
        { order: i + 1 },
        { where: { id: imageIds[i], productId } }
      );
    }
  } catch (error: any) {
    console.error('Erro ao reordenar imagens:', error);
    throw new Error(`Erro ao reordenar imagens: ${error.message}`);
  }
};

/**
 * Deletar produto
 * Também deleta suas imagens e remove referências de kits
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    const product = await Product.findByPk(productId, {
      include: ['images'],
    });
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Deletar imagens do MinIO
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        try {
          await deleteFileFromMinIO(image.imageUrl);
        } catch (err) {
          console.warn('Erro ao deletar imagem do MinIO:', err);
        }
      }
    }

    // Deletar produto (cascata deleta ProductImage automaticamente)
    await product.destroy();
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error);
    throw new Error(`Erro ao deletar produto: ${error.message}`);
  }
};

/**
 * Ativar/Inativar produto
 */
export const toggleProductStatus = async (
  productId: string,
  active: boolean,
): Promise<Product | null> => {
  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    product.active = active;
    await product.save();

    return product;
  } catch (error: any) {
    console.error('Erro ao alternar status do produto:', error);
    throw new Error(`Erro ao alternar status do produto: ${error.message}`);
  }
};

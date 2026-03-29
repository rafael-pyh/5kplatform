import { Kit } from '../models/Kit';
import { KitItem } from '../models/KitItem';
import { Product } from '../models/Product';
import { Op } from 'sequelize';
import { deleteFileFromMinIO, uploadFileToMinIO } from './storage.service';

/**
 * Kit Service
 * Gerencia CRUD de kits, itens do kit, validações de negócio
 * Não permite deletar produtos que estão em kits ativos
 */

interface CreateKitInput {
  name: string;
  price: number;
  userId: string;
  description?: string;
  sku?: string;
  imageUrl?: string;
  tags?: string;
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
}

/**
 * Criar novo kit com itens
 */
export const createKit = async (input: CreateKitInput): Promise<Kit> => {
  try {
    const { name, price, userId, description, sku, imageUrl, tags, items } = input;

    if (price <= 0) {
      throw new Error('Preço do kit deve ser maior que zero');
    }

    if (!items || items.length === 0) {
      throw new Error('Kit deve conter pelo menos um produto');
    }

    // Validar que todos os produtos existem
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw new Error(`Produto ${item.productId} não encontrado`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Quantidade deve ser maior que zero`);
      }
    }

    // Criar kit
    const kit = await Kit.create({
      name,
      price,
      description,
      sku,
      imageUrl,
      tags,
      createdByUserId: userId,
      active: true,
    });

    // Criar itens do kit
    for (const item of items) {
      await KitItem.create({
        kitId: kit.id,
        productId: item.productId,
        quantity: item.quantity,
        notes: item.notes,
      });
    }

    return kit;
  } catch (error: any) {
    console.error('Erro ao criar kit:', error);
    throw new Error(`Erro ao criar kit: ${error.message}`);
  }
};

/**
 * Listar kits com paginação e filtros
 */
export const listKits = async (
  limit: number = 50,
  offset: number = 0,
  filters?: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string;
    active?: boolean;
  }
): Promise<{ total: number; kits: Kit[] }> => {
  try {
    const where: any = {};

    if (filters?.name) {
      where.name = { [Op.iLike]: `%${filters.name}%` };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters?.minPrice !== undefined) {
        where.price[Op.gte] = filters.minPrice;
      }
      if (filters?.maxPrice !== undefined) {
        where.price[Op.lte] = filters.maxPrice;
      }
    }

    if (filters?.tags) {
      where.tags = { [Op.iLike]: `%${filters.tags}%` };
    }

    if (filters?.active !== undefined) {
      where.active = filters.active;
    }

    const { count, rows } = await Kit.findAndCountAll({
      where: Object.keys(where).length > 0 ? where : undefined,
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
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      total: count,
      kits: rows,
    };
  } catch (error: any) {
    console.error('Erro ao listar kits:', error);
    throw new Error(`Erro ao listar kits: ${error.message}`);
  }
};

/**
 * Buscar kit por ID com todos os itens
 */
export const getKitById = async (kitId: string): Promise<Kit | null> => {
  try {
    const kit = await Kit.findByPk(kitId, {
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

    return kit;
  } catch (error: any) {
    console.error('Erro ao buscar kit:', error);
    throw new Error(`Erro ao buscar kit: ${error.message}`);
  }
};

/**
 * Atualizar kit (sem alterar itens)
 */
export const updateKit = async (
  kitId: string,
  updates: Partial<{
    name: string;
    description: string;
    price: number;
    sku: string;
    imageUrl: string;
    tags: string;
    active: boolean;
  }>,
): Promise<Kit | null> => {
  try {
    const kit = await Kit.findByPk(kitId);
    if (!kit) {
      throw new Error('Kit não encontrado');
    }

    if (updates.price !== undefined && updates.price <= 0) {
      throw new Error('Preço do kit deve ser maior que zero');
    }

    await kit.update(updates);
    return kit;
  } catch (error: any) {
    console.error('Erro ao atualizar kit:', error);
    throw new Error(`Erro ao atualizar kit: ${error.message}`);
  }
};

/**
 * Atualizar itens de um kit
 * Remove itens antigos e cria novos
 */
export const updateKitItems = async (
  kitId: string,
  items: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>,
): Promise<KitItem[]> => {
  try {
    const kit = await Kit.findByPk(kitId);
    if (!kit) {
      throw new Error('Kit não encontrado');
    }

    if (!items || items.length === 0) {
      throw new Error('Kit deve conter pelo menos um produto');
    }

    // Validar produtos
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (!product) {
        throw new Error(`Produto ${item.productId} não encontrado`);
      }
      if (item.quantity <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
    }

    // Deletar itens antigos
    await KitItem.destroy({ where: { kitId } });

    // Criar novos itens
    const newItems = await Promise.all(
      items.map((item) =>
        KitItem.create({
          kitId,
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes,
        })
      )
    );

    return newItems;
  } catch (error: any) {
    console.error('Erro ao atualizar itens do kit:', error);
    throw new Error(`Erro ao atualizar itens do kit: ${error.message}`);
  }
};

/**
 * Ativar/Inativar kit
 */
export const toggleKitStatus = async (
  kitId: string,
  active: boolean,
): Promise<Kit | null> => {
  try {
    const kit = await Kit.findByPk(kitId);
    if (!kit) {
      throw new Error('Kit não encontrado');
    }

    kit.active = active;
    await kit.save();

    return kit;
  } catch (error: any) {
    console.error('Erro ao alternar status do kit:', error);
    throw new Error(`Erro ao alternar status do kit: ${error.message}`);
  }
};

/**
 * Deletar kit
 */
export const deleteKit = async (kitId: string): Promise<void> => {
  try {
    const kit = await Kit.findByPk(kitId);
    if (!kit) {
      throw new Error('Kit não encontrado');
    }

    // Deletar imagem se existir
    if (kit.imageUrl) {
      try {
        await deleteFileFromMinIO(kit.imageUrl);
      } catch (err) {
        console.warn('Erro ao deletar imagem do MinIO:', err);
      }
    }

    // Deletar kit (cascata deleta KitItems automaticamente)
    await kit.destroy();
  } catch (error: any) {
    console.error('Erro ao deletar kit:', error);
    throw new Error(`Erro ao deletar kit: ${error.message}`);
  }
};

/**
 * Obter kit item por ID
 */
export const getKitItem = async (kitItemId: string): Promise<KitItem | null> => {
  try {
    return await KitItem.findByPk(kitItemId, {
      include: [
        { association: 'kit' },
        { association: 'product' },
      ],
    });
  } catch (error: any) {
    console.error('Erro ao buscar item do kit:', error);
    throw new Error(`Erro ao buscar item do kit: ${error.message}`);
  }
};
/**
 * Fazer upload de imagem para o kit
 */
export const uploadKitImage = async (
  kitId: string,
  file: Express.Multer.File,
): Promise<Kit> => {
  try {
    const kit = await Kit.findByPk(kitId);
    if (!kit) {
      throw new Error('Kit não encontrado');
    }

    // Se existia imagem anterior, deletar do MinIO
    if (kit.imageUrl) {
      try {
        await deleteFileFromMinIO(kit.imageUrl);
      } catch (err) {
        console.warn('Erro ao deletar imagem anterior do MinIO:', err);
      }
    }

    // Fazer upload para MinIO
    const imageUrl = await uploadFileToMinIO(
      file,
      file.originalname,
      'kits',
    );

    // Atualizar kit com nova URL
    await kit.update({ imageUrl });

    return kit;
  } catch (error: any) {
    console.error('Erro ao fazer upload de imagem do kit:', error);
    throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
  }
};
import { Request, Response } from 'express';
import {
  createOrder,
  listOrders,
  getOrderById,
  getOrderByCode,
  uploadPaymentProof,
  approveOrder,
  rejectOrder,
  listPaymentProofs,
  removePaymentProof,
} from '../services/order.service';
import { OrderStatus } from '../models/Order';
import { Order } from '../models/Order';

/**
 * Order Controller
 * Endpoints REST para gerenciar pedidos e comprovantes
 */

/**
 * POST /api/orders
 * Criar novo pedido
 * Body: { kitId | productId, useCredit?, notes? }
 */
export const createOrderController = async (req: Request, res: Response) => {
  try {
    const { kitId, productId, useCredit = false, notes } = req.body;
    const personId = (req as any).user?.userId;

    if (!personId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!kitId && !productId) {
      return res.status(400).json({
        success: false,
        message: 'kitId ou productId é obrigatório',
      });
    }

    if (kitId && productId) {
      return res.status(400).json({
        success: false,
        message: 'Apenas kitId ou productId pode ser especificado',
      });
    }

    const order = await createOrder({
      personId,
      kitId,
      productId,
      useCredit,
      notes,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: order.id,
        orderCode: order.orderCode,
        status: order.status,
        totalPrice: order.totalPrice,
        usesCredit: order.usesCredit,
        createdAt: order.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/orders
 * Listar pedidos com filtros (ADMIN - todos, SELLER - seus)
 */
export const listOrdersController = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    // SELLER vê apenas seus próprios pedidos
    const personId = userRole === 'SELLER' ? userId : (req.query.personId as string);

    const filters: any = {};
    if (personId) filters.personId = personId;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    console.debug('[listOrdersController] Filters:', filters);
    const { total, orders } = await listOrders(limit, offset, filters);

    console.debug('[listOrdersController] Found', orders.length, 'orders with filters:', filters);
    return res.status(200).json({
      success: true,
      pagination: {
        total,
        limit,
        offset,
      },
      data: orders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        personId: o.personId,
        kitId: o.kitId,
        productId: o.productId,
        personName: o.person?.name,
        kitName: o.kit?.name,
        productName: o.product?.name,
        totalPrice: o.totalPrice,
        status: o.status,
        usesCredit: o.usesCredit,
        notes: o.notes,
        hasPaymentProofs: (o.paymentProofs?.length || 0) > 0,
        paymentProofs: o.paymentProofs,
        kit: o.kit,
        product: o.product,
        person: o.person,
        approvedBy: o.approvedBy ? {
          id: o.approvedBy.id,
          name: o.approvedBy.name,
        } : undefined,
        approvedAt: o.approvedAt,
        rejectionReason: o.rejectionReason,
        createdAt: o.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar pedidos:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/orders/:id
 * Obter detalhes completos de um pedido
 */
export const getOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    const order = await getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    // Verificar permissão (SELLER só pode ver seus próprios)
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && order.personId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para visualizar este pedido',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        orderCode: order.orderCode,
        personId: order.personId,
        kitId: order.kitId,
        productId: order.productId,
        person: {
          id: order.person?.id,
          name: order.person?.name,
          email: order.person?.email,
          pixKey: order.person?.pixKey,
        },
        kit: order.kit ? {
          id: order.kit.id,
          name: order.kit.name,
          price: order.kit.price,
          items: order.kit.items?.map((item) => ({
            id: item.id,
            productName: item.product?.name,
            quantity: item.quantity,
            unitPrice: item.product?.price,
          })) || [],
        } : null,
        product: order.product ? {
          id: order.product.id,
          name: order.product.name,
          price: order.product.price,
          description: order.product.description,
        } : null,
        totalPrice: order.totalPrice,
        status: order.status,
        usesCredit: order.usesCredit,
        notes: order.notes,
        paymentProofs: order.paymentProofs?.map((p) => ({
          id: p.id,
          fileUrl: p.fileUrl,
          fileType: p.fileType,
          originalFileName: p.originalFileName,
          createdAt: p.createdAt,
        })) || [],
        approvedBy: order.approvedBy ? {
          id: order.approvedBy.id,
          name: order.approvedBy.name,
        } : null,
        approvedAt: order.approvedAt,
        rejectionReason: order.rejectionReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter pedido:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/orders/code/:orderCode
 * Obter pedido por código
 */
export const getOrderByCodeController = async (req: Request, res: Response) => {
  try {
    const { orderCode } = req.params;
    const order = await getOrderByCode(orderCode);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        orderCode: order.orderCode,
        status: order.status,
        totalPrice: order.totalPrice,
        usesCredit: order.usesCredit,
      },
    });
  } catch (error: any) {
    console.error('Erro ao obter pedido por código:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/orders/:id/payment-proofs
 * Fazer upload de comprovante de pagamento (multipart)
 */
export const uploadPaymentProofController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo é obrigatório',
      });
    }

    const proof = await uploadPaymentProof(id, req.file);

    return res.status(201).json({
      success: true,
      data: {
        id: proof.id,
        fileUrl: proof.fileUrl,
        fileType: proof.fileType,
        originalFileName: proof.originalFileName,
        fileSize: proof.fileSize,
        createdAt: proof.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload de comprovante:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/orders/:id/payment-proofs
 * Listar comprovantes de um pedido
 */
export const listPaymentProofsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proofs = await listPaymentProofs(id);

    return res.status(200).json({
      success: true,
      data: proofs.map((p) => ({
        id: p.id,
        fileUrl: p.fileUrl,
        fileType: p.fileType,
        originalFileName: p.originalFileName,
        fileSize: p.fileSize,
        createdAt: p.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar comprovantes:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * DELETE /api/orders/:orderId/payment-proofs/:proofId
 * Remover comprovante de um pedido
 */
export const removePaymentProofController = async (req: Request, res: Response) => {
  try {
    const { proofId } = req.params;

    await removePaymentProof(proofId);

    return res.status(200).json({
      success: true,
      message: 'Comprovante removido com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao remover comprovante:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/orders/:id/approve
 * Aprovar pedido (ADMIN ONLY)
 */
export const approveOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    const order = await approveOrder(id, userId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    // Buscar o pedido com approvedBy populado
    const orderWithApprovedBy = await Order.findByPk(id, {
      include: [
        { association: 'approvedBy', attributes: ['id', 'name', 'email'] },
      ],
    });

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        orderCode: order.orderCode,
        status: order.status,
        approvedBy: orderWithApprovedBy?.approvedBy ? {
          id: orderWithApprovedBy.approvedBy.id,
          name: orderWithApprovedBy.approvedBy.name,
        } : undefined,
        approvedAt: order.approvedAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao aprovar pedido:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/orders/:id/reject
 * Rejeitar pedido (ADMIN ONLY)
 * Body: { rejectionReason }
 */
export const rejectOrderController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Motivo da rejeição é obrigatório',
      });
    }

    const order = await rejectOrder(id, userId, rejectionReason);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pedido não encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        orderCode: order.orderCode,
        status: order.status,
        rejectionReason: order.rejectionReason,
      },
    });
  } catch (error: any) {
    console.error('Erro ao rejeitar pedido:', error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

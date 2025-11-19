import { Request, Response, NextFunction } from "express";
import * as leadService from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";

// ==================== SELLER LEADS CONTROLLER ====================

export const getMyLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    const { status } = req.query;
    const leads = await leadService.getSellerLeads(sellerId, {
      status: status as any,
    });
    return ResponseBuilder.success(res, leads);
  } catch (error) {
    next(error);
  }
};

export const getMyLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    const { id } = req.params;
    const lead = await leadService.getSellerLeadById(sellerId, id);
    return ResponseBuilder.success(res, lead);
  } catch (error) {
    next(error);
  }
};

export const getMyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    const stats = await leadService.getSellerLeadsStats(sellerId);
    return ResponseBuilder.success(res, stats);
  } catch (error) {
    next(error);
  }
};

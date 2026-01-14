import { Request, Response, NextFunction } from "express";
import { LeadServiceFunctions } from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";

// ==================== SELLER LEADS CONTROLLER ====================

export const getMyLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    const { status } = req.query;
    const leads = await LeadServiceFunctions.getSellerLeads(sellerId, {
      status: status as any,
    });
    const jsonData = Array.isArray(leads) ? leads.map((item: any) => item.toJSON ? item.toJSON() : item) : leads;
    return ResponseBuilder.success(res, jsonData);
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
    const lead = await LeadServiceFunctions.getSellerLeadById(sellerId, id);
    const jsonData = (lead as any).toJSON ? (lead as any).toJSON() : lead;
    return ResponseBuilder.success(res, jsonData);
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

    const stats = await LeadServiceFunctions.getSellerLeadsStats(sellerId);
    return ResponseBuilder.success(res, stats);
  } catch (error) {
    next(error);
  }
};

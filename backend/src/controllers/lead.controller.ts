import { Request, Response, NextFunction } from "express";
import { LeadServiceFunctions } from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";
import { LeadStatus } from "../models/Lead";

// Helper: normalize commissionAmount returned as string (DECIMAL from PG) to number
function normalizeCommission(items: any) {
  if (!Array.isArray(items)) return items;
  return items.map((it: any) => {
    if (it && it.commissionAmount != null && typeof it.commissionAmount === 'string') {
      const n = Number(it.commissionAmount);
      // If parse fails, keep original value
      it.commissionAmount = Number.isNaN(n) ? it.commissionAmount : n;
    }
    return it;
  });
}
// ==================== LEAD CONTROLLER (Single Responsibility: HTTP handling) ====================

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await LeadServiceFunctions.createLead(req.body);
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.created(res, normalizeCommission([jsonData])[0]);
  } catch (error) {
    next(error);
  }
};

export const getAllLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, ownerId, limit, offset } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status as LeadStatus;
    if (ownerId) filters.ownerId = ownerId as string;
    if (limit) filters.limit = parseInt(limit as string);
    if (offset) filters.offset = parseInt(offset as string);

    const data = await LeadServiceFunctions.getAllLeads(filters);
    let jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    jsonData = normalizeCommission(jsonData);
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const getLeadsByOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = req.query;
    const data = await LeadServiceFunctions.getLeadsByOwner(
      req.params.ownerId,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined,
    );
    let jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    jsonData = normalizeCommission(jsonData);
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await LeadServiceFunctions.getLeadById(req.params.id);
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.success(res, normalizeCommission([jsonData])[0]);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await LeadServiceFunctions.updateLead(req.params.id, req.body);
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.success(res, normalizeCommission([jsonData])[0]);
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, commissionAmount } = req.body; // Allow commissionAmount input

    if (commissionAmount != null && isNaN(Number(commissionAmount))) {
      return next(new Error('Invalid commission amount'));
    }

    const data = await LeadServiceFunctions.updateLeadStatus(req.params.id, status, Number(commissionAmount));
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.success(res, normalizeCommission([jsonData])[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await LeadServiceFunctions.deleteLead(req.params.id);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getLeadsStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await LeadServiceFunctions.getLeadsStats();
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getNewLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const data = await LeadServiceFunctions.getNewLeads(days);
    let jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    jsonData = normalizeCommission(jsonData);
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

// Endpoint para pegar leads do vendedor/afiliado autenticado com filtragem por role
export const getMyLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as any)?.userId;
    const userRole = (req.user as any)?.role;
    const { limit, offset } = req.query;

    if (!userId) {
      return next(new Error('Usuário não autenticado'));
    }

    const data = await LeadServiceFunctions.getLeadsByPersonRole(
      userId,
      userRole,
      limit ? parseInt(limit as string) : undefined,
      offset ? parseInt(offset as string) : undefined,
    );
    let jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    jsonData = normalizeCommission(jsonData);
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};
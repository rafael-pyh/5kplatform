import { Request, Response, NextFunction } from "express";
import * as service from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";

// ==================== LEAD CONTROLLER (Single Responsibility: HTTP handling) ====================

// Definir os tipos manualmente até o Prisma Client ser gerado
type LeadStatus = "BOUGHT" | "CANCELLED" | "NEGOTIATION";

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.createLead(req.body);
    return ResponseBuilder.created(res, data);
  } catch (error) {
    next(error);
  }
};

export const getAllLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, ownerId } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status as LeadStatus;
    if (ownerId) filters.ownerId = ownerId as string;

    const data = await service.getAllLeads(filters);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getLeadsByOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getLeadsByOwner(req.params.ownerId);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getLeadById(req.params.id);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateLead(req.params.id, req.body);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const data = await service.updateLeadStatus(req.params.id, status);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.deleteLead(req.params.id);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getLeadsStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getLeadsStats();
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getNewLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const data = await service.getNewLeads(days);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};
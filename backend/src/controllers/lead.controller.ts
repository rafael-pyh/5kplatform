import { Request, Response, NextFunction } from "express";
import * as service from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";
import { LeadStatus } from "../models/Lead";

// ==================== LEAD CONTROLLER (Single Responsibility: HTTP handling) ====================

export const createLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.createLead(req.body);
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.created(res, jsonData);
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
    const jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const getLeadsByOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getLeadsByOwner(req.params.ownerId);
    const jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getLeadById(req.params.id);
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateLead(req.params.id, req.body);
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const data = await service.updateLeadStatus(req.params.id, status);
    const jsonData = data.toJSON ? data.toJSON() : data;
    return ResponseBuilder.success(res, jsonData);
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
    const jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
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

    if (!userId) {
      throw new Error('Usuário não autenticado');
    }

    const data = await service.getLeadsByPersonRole(userId, userRole);
    const jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};
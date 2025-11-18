import { Request, Response } from "express";
import * as service from "../services/lead.service";

// Definir os tipos manualmente até o Prisma Client ser gerado
type LeadStatus = "BOUGHT" | "CANCELLED" | "NEGOTIATION";

export const createLead = async (req: Request, res: Response) => {
  try {
    const data = await service.createLead(req.body);
    res.status(201).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllLeads = async (req: Request, res: Response) => {
  try {
    const { status, ownerId } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status as LeadStatus;
    if (ownerId) filters.ownerId = ownerId as string;

    const data = await service.getAllLeads(filters);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeadsByOwner = async (req: Request, res: Response) => {
  try {
    const data = await service.getLeadsByOwner(req.params.ownerId);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeadById = async (req: Request, res: Response) => {
  try {
    const data = await service.getLeadById(req.params.id);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const data = await service.updateLead(req.params.id, req.body);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateLeadStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const data = await service.updateLeadStatus(req.params.id, status);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const data = await service.deleteLead(req.params.id);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeadsStats = async (req: Request, res: Response) => {
  try {
    const data = await service.getLeadsStats();
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getNewLeads = async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const data = await service.getNewLeads(days);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
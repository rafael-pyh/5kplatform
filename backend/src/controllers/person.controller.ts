import { Request, Response, NextFunction } from "express";
import * as service from "../services/person.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";

// ==================== PERSON CONTROLLER (Single Responsibility: HTTP handling) ====================

export const createPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.createPerson(req.body);
    return ResponseBuilder.created(res, data);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOnly = req.query.active === "true";
    const data = await service.getAll(activeOnly);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getById(req.params.id);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getByQRCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getByQRCode(req.params.qrCode);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.updateById(req.params.id, req.body);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const deleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.deleteById(req.params.id);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const hardDeleteById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.hardDeleteById(req.params.id);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getPersonStats(req.params.id);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};
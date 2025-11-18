import { Request, Response } from "express";
import * as service from "../services/person.service";

export const createPerson = async (req: Request, res: Response) => {
  try {
    const data = await service.createPerson(req.body);
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

export const getAll = async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active === "true";
    const data = await service.getAll(activeOnly);
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

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await service.getById(req.params.id);
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

export const getByQRCode = async (req: Request, res: Response) => {
  try {
    const data = await service.getByQRCode(req.params.qrCode);
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

export const updateById = async (req: Request, res: Response) => {
  try {
    const data = await service.updateById(req.params.id, req.body);
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

export const deleteById = async (req: Request, res: Response) => {
  try {
    const data = await service.deleteById(req.params.id);
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

export const hardDeleteById = async (req: Request, res: Response) => {
  try {
    const data = await service.hardDeleteById(req.params.id);
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

export const getStats = async (req: Request, res: Response) => {
  try {
    const data = await service.getPersonStats(req.params.id);
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
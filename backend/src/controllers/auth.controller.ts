import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";

// ==================== AUTH CONTROLLER (Single Responsibility: HTTP handling) ====================

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.register(req.body);
    return ResponseBuilder.created(res, result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    return ResponseBuilder.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await authService.getAllUsers();
    return ResponseBuilder.success(res, users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.params.id);
    return ResponseBuilder.success(res, user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    return ResponseBuilder.success(res, user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.deleteUser(req.params.id);
    return ResponseBuilder.noContent(res);
  } catch (error) {
    next(error);
  }
};
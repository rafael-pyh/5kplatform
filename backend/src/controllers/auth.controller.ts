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
    const jsonData = Array.isArray(users) ? users.map((item: any) => item.toJSON ? item.toJSON() : item) : users;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getUserById(req.params.id);
    const jsonData = user.toJSON ? user.toJSON() : user;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.updateUser(req.params.id, req.body);
    const jsonData = (user as any).toJSON ? (user as any).toJSON() : user;
    return ResponseBuilder.success(res, jsonData);
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

export const createAdminUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // O role do usuário que está fazendo a requisição vem do JWT no middleware authenticate
    const creatorRole = req.user?.role || "";
    const newUser = await authService.createAdminUser(req.body, creatorRole);
    const jsonData = (newUser as any).toJSON ? (newUser as any).toJSON() : newUser;
    return ResponseBuilder.created(res, jsonData);
  } catch (error) {
    next(error);
  }
};
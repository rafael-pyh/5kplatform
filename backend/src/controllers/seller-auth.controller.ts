import { Request, Response, NextFunction } from "express";
import * as sellerAuthService from "../services/seller-auth.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";

// ==================== SELLER AUTH CONTROLLER ====================

export const sellerLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sellerAuthService.sellerLogin(req.body);
    return ResponseBuilder.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const verifyEmailToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const result = await sellerAuthService.verifyEmailToken(token);
    return ResponseBuilder.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const setPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sellerAuthService.setPassword(req.body);
    return ResponseBuilder.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const result = await sellerAuthService.requestPasswordReset(email);
    return ResponseBuilder.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const result = await sellerAuthService.resetPassword(token, password);
    return ResponseBuilder.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getSellerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }
    const result = await sellerAuthService.getSellerProfile(sellerId);
    return ResponseBuilder.success(res, result);
  } catch (error) {
    next(error);
  }
};

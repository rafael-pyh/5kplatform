import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";

// Estende o tipo Request para incluir o usuário autenticado
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pega o token do header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Token não fornecido",
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido",
      });
    }

    const token = parts[1];

    // Verifica o token
    const decoded = verifyToken(token);

    // Log para debug em produção
    console.log('[AUTHENTICATE] Token decodificado com sucesso:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      roleType: typeof decoded.role,
      roleUpperCase: decoded.role?.toUpperCase?.(),
    });

    // Adiciona os dados do usuário ao request
    req.user = decoded;

    next();
  } catch (error: any) {
    console.error('[AUTHENTICATE] Erro ao validar token:', error.message);
    return res.status(401).json({
      success: false,
      message: error.message || "Token inválido",
    });
  }
};

// Middleware para verificar se é SUPER_ADMIN
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = req.user?.role?.toUpperCase();
  if (userRole !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas SUPER_ADMIN pode acessar este recurso.",
    });
  }
  next();
};

// Middleware para verificar se é ADMIN ou SUPER_ADMIN
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = req.user?.role?.toUpperCase();
  if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas administradores podem acessar este recurso.",
    });
  }
  next();
};

// Middleware para verificar se é SELLER (vendedor) ou AFFILIATE
export const requireSeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = req.user?.role?.toUpperCase();
  if (userRole !== "SELLER" && userRole !== "AFFILIATE") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas vendedores e afiliados podem acessar este recurso.",
    });
  }
  next();
};

// Middleware para verificar se é ADMIN ou SELLER ou AFFILIATE
export const requireAdminOrSeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = req.user?.role?.toUpperCase();
  if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== "SELLER" && userRole !== "AFFILIATE")) {
    return res.status(403).json({
      success: false,
      message: "Acesso negado.",
    });
  }
  next();
};
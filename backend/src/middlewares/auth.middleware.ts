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
    console.log('[Auth Middleware] Autenticando...');
    
    // Pega o token do header
    const authHeader = req.headers.authorization;
    console.log('[Auth Middleware] Authorization header:', authHeader ? 'presente' : 'ausente');

    if (!authHeader) {
      console.log('[Auth Middleware] ERRO: Authorization header não fornecido');
      return res.status(401).json({
        success: false,
        message: "Token não fornecido",
      });
    }

    // Formato esperado: "Bearer TOKEN"
    const parts = authHeader.split(" ");
    console.log('[Auth Middleware] Parts length:', parts.length, 'Type:', parts[0]);

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.log('[Auth Middleware] ERRO: Formato inválido');
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido",
      });
    }

    const token = parts[1];
    console.log('[Auth Middleware] Token extraído, verificando...');

    // Verifica o token
    const decoded = verifyToken(token);
    console.log('[Auth Middleware] Token verificado com sucesso:', decoded);

    // Adiciona os dados do usuário ao request
    req.user = decoded;
    console.log('[Auth Middleware] req.user atribuído:', req.user);

    next();
  } catch (error: any) {
    console.error('[Auth Middleware] ERRO:', error.message);
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
  if (req.user?.role !== "SUPER_ADMIN") {
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
  if (!req.user?.role || (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN")) {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas administradores podem acessar este recurso.",
    });
  }
  next();
};

// Middleware para verificar se é SELLER (vendedor)
export const requireSeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "SELLER") {
    return res.status(403).json({
      success: false,
      message: "Acesso negado. Apenas vendedores podem acessar este recurso.",
    });
  }
  next();
};

// Middleware para verificar se é ADMIN ou SELLER
export const requireAdminOrSeller = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.role || (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN" && req.user.role !== "SELLER")) {
    return res.status(403).json({
      success: false,
      message: "Acesso negado.",
    });
  }
  next();
};
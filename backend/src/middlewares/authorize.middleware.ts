import { Request, Response, NextFunction } from 'express';
import { PersonRole } from '../models/Person';

// Não estender Express.Request, que já tem type conflicts com user
// Em vez disso, vamos usar type assertion onde necessário

/**
 * Middleware: Valida se o usuário tem uma das roles permitidas
 * 
 * Uso:
 * router.get('/admin-only', requireRole([PersonRole.ADMIN, PersonRole.SUPER_ADMIN]), controller)
 */
export const requireRole = (allowedRoles: (PersonRole | string)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Você não tem permissão para acessar este recurso.',
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
};

/**
 * Middleware: Valida se é SELLER ou acima (nega AFFILIATE)
 * Afiliados não têm acesso a listagens e dados sensíveis
 */
export const requireInternalSeller = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (userRole === PersonRole.AFFILIATE || userRole === 'AFFILIATE') {
    return res.status(403).json({
      success: false,
      message: 'Afiliados não têm acesso a este recurso',
      userRole: userRole
    });
  }

  if (!userRole) {
    return res.status(401).json({
      success: false,
      message: 'Não autenticado'
    });
  }

  next();
};

/**
 * Middleware: Verifica se o usuário é o dono do recurso ou ADMIN
 * 
 * Uso:
 * router.put('/profile/:id', authenticate, requireOwnerOrAdmin, controller)
 */
export const requireOwnerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.user as any)?.id;
  const resourceOwnerId = req.params.id;
  const userRole = req.user?.role;

  const isOwner = userId === resourceOwnerId;
  const isAdmin = userRole && [PersonRole.ADMIN, PersonRole.SUPER_ADMIN, 'ADMIN', 'SUPER_ADMIN'].includes(userRole);

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Você não pode acessar este recurso.'
    });
  }

  next();
};

/**
 * Middleware: Apenas SUPER_ADMIN pode acessar
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (userRole !== PersonRole.SUPER_ADMIN && userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas SUPER_ADMIN pode acessar este recurso.',
      userRole: userRole
    });
  }

  next();
};

/**
 * Middleware: Valida se é ADMIN ou SUPER_ADMIN
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (!userRole || ![PersonRole.ADMIN, PersonRole.SUPER_ADMIN, 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
      userRole: userRole
    });
  }

  next();
};


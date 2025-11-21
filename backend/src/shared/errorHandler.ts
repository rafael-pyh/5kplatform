import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Trata erros do Prisma
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target || [];
      const field = Array.isArray(target) ? target[0] : target;
      return res.status(409).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Valor'} já está cadastrado no sistema`,
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Registro não encontrado',
      });
    }
  }

  console.error('Erro não tratado:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
};

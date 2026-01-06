import { Request, Response, NextFunction } from 'express';
import { AppError } from './errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('🔴 [ERROR HANDLER] Erro capturado:', {
    name: err.name,
    message: err.message,
    type: err.constructor.name,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  if (err instanceof AppError) {
    console.log(`✅ [ERROR HANDLER] AppError detectado - Status: ${err.statusCode}, Mensagem: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Trata erros do Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const seqError = err as any;
    const field = seqError.errors?.[0]?.path || 'campo';
    return res.status(409).json({
      success: false,
      message: `${field === 'email' ? 'Email' : 'Valor'} já está cadastrado no sistema`,
    });
  }

  if (err.name === 'SequelizeValidationError') {
    const seqError = err as any;
    const message = seqError.errors?.[0]?.message || 'Erro de validação';
    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de referência: registro relacionado não encontrado',
    });
  }

  console.error('❌ [ERROR HANDLER] Erro não tratado:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
};

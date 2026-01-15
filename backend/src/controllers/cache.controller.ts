import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder } from '../shared/ResponseBuilder';
import { getGlobalCache } from '../cache/cache.service';

export const invalidateLeadCache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invalidated = getGlobalCache().invalidateByPattern(/^Lead:.*/);
    return ResponseBuilder.success(res, { invalidated }, 'Cache de Lead invalidado');
  } catch (error) {
    next(error);
  }
};

export const clearAllCache = async (req: Request, res: Response, next: NextFunction) => {
  try {
    getGlobalCache().clear();
    return ResponseBuilder.success(res, { cleared: true }, 'Cache global limpo');
  } catch (error) {
    next(error);
  }
};

export default {
  invalidateLeadCache,
  clearAllCache,
};

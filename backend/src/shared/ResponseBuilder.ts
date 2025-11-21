import { Response } from 'express';

export class ResponseBuilder {
  static success<T>(res: Response, data: T, message?: string): Response {
    return res.status(200).json({
      success: true,
      data,
      ...(message && { message }),
    });
  }

  static created<T>(res: Response, data: T, message?: string): Response {
    return res.status(201).json({
      success: true,
      data,
      ...(message && { message }),
    });
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}

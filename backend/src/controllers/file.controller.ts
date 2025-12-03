import { Request, Response, NextFunction } from "express";
import { getFileStream } from "../utils/minio";
import { NotFoundError } from "../shared/errors";

// Endpoint genérico para servir arquivos do MinIO via proxy
export const serveFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Captura o caminho completo após /api/files/
    const filePath = req.params[0]; // Usa wildcard route
    
    if (!filePath) {
      throw new NotFoundError("Arquivo");
    }

    // Busca o arquivo no MinIO
    const fileStream = await getFileStream(filePath);

    // Define o tipo de conteúdo baseado na extensão
    const extension = filePath.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'pdf': 'application/pdf',
      'json': 'application/json',
    };

    const contentType = contentTypeMap[extension || ''] || 'application/octet-stream';

    // Define headers de resposta
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache de 1 ano
    
    // Envia o arquivo
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

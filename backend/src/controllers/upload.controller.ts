import { Request, Response } from "express";
import { uploadFileToMinIO } from "../services/storage.service";

// Upload de foto de perfil - salva no S3 e retorna URL
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    console.log('[uploadProfilePhoto] Iniciando upload de foto de perfil');
    console.log('[uploadProfilePhoto] Arquivo recebido:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    } : 'NENHUM ARQUIVO');

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const fileUrl = await uploadFileToMinIO(
      req.file,
      req.file.originalname,
      "profile-photos"
    );

    console.log('[uploadProfilePhoto] ✅ Upload concluído');

    res.json({
      success: true,
      data: { 
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    console.error('[uploadProfilePhoto] ❌ Erro:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload de conta de energia - salva no S3 e retorna URL
export const uploadEnergyBill = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const fileUrl = await uploadFileToMinIO(
      req.file,
      req.file.originalname,
      "energy-bills"
    );

    res.json({
      success: true,
      data: { 
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload de foto do telhado - salva no S3 e retorna URL
export const uploadRoofPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const fileUrl = await uploadFileToMinIO(
      req.file,
      req.file.originalname,
      "roof-photos"
    );

    res.json({
      success: true,
      data: { 
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload de imagem de poster/criativo - salva no MinIO e retorna URL
export const uploadPoster = async (req: Request, res: Response) => {
  try {
    console.log('[Upload Controller] uploadPoster iniciado', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      fileType: req.file?.mimetype,
      userId: (req as any).user?.userId,
      userRole: (req as any).user?.role,
      fullUser: (req as any).user,
      headers: req.headers,
    });

    if (!req.file) {
      console.log('[Upload Controller] Erro: nenhum arquivo enviado');
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    console.log('[Upload Controller] Iniciando upload para MinIO');
    const fileUrl = await uploadFileToMinIO(
      req.file,
      `${Date.now()}-${req.file.originalname}`,
      "posters"
    );

    console.log('[Upload Controller] Upload bem-sucedido', {
      fileUrl,
      originalName: req.file.originalname,
    });

    res.json({
      success: true,
      data: { 
        url: fileUrl,
        fileName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    console.error('[Upload Controller] Erro no uploadPoster:', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
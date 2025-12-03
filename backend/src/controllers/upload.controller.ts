import { Request, Response } from "express";

/**
 * Converte um arquivo para base64
 */
const fileToBase64 = (file: Express.Multer.File): string => {
  const base64Data = file.buffer.toString('base64');
  const mimeType = file.mimetype;
  return `data:${mimeType};base64,${base64Data}`;
};

// Upload de foto de perfil - retorna base64
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const base64 = fileToBase64(req.file);

    res.json({
      success: true,
      data: { base64 },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload de conta de energia - retorna base64
export const uploadEnergyBill = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const base64 = fileToBase64(req.file);

    res.json({
      success: true,
      data: { base64 },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload de foto do telhado - retorna base64
export const uploadRoofPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const base64 = fileToBase64(req.file);

    res.json({
      success: true,
      data: { base64 },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
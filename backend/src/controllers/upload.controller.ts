import { Request, Response } from "express";
import { uploadFile } from "../utils/minio";

// Upload de foto de perfil
export const uploadProfilePhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const url = await uploadFile(req.file, "profiles");

    res.json({
      success: true,
      data: { url },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload de conta de energia
export const uploadEnergyBill = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const url = await uploadFile(req.file, "energy-bills");

    res.json({
      success: true,
      data: { url },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Upload de foto do telhado
export const uploadRoofPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nenhum arquivo enviado",
      });
    }

    const url = await uploadFile(req.file, "roof-photos");

    res.json({
      success: true,
      data: { url },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
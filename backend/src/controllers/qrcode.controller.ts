import { Request, Response } from "express";
import * as qrcodeService from "../services/qrcode.service";
import * as personService from "../services/person.service";
import * as leadService from "../services/lead.service";

// Endpoint público para registrar scan do QR Code
export const scanQRCode = async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;

    // Busca o vendedor pelo QR Code
    const person = await personService.getByQRCode(qrCode);

    // Registra o scan
    const ipAddress = 
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await qrcodeService.registerScan({
      personId: person.id,
      ipAddress,
      userAgent,
    });

    res.json({
      success: true,
      data: {
        personId: person.id,
        personName: person.name,
        message: "QR Code escaneado com sucesso",
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Endpoint público para criar lead (formulário)
export const createLeadFromQR = async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;

    // Busca o vendedor pelo QR Code
    const person = await personService.getByQRCode(qrCode);

    // Cria o lead
    const leadData = {
      ...req.body,
      ownerId: person.id,
    };

    const lead = await leadService.createLead(leadData);

    res.status(201).json({
      success: true,
      data: lead,
      message: "Cadastro realizado com sucesso!",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Buscar scans de um vendedor (protegido)
export const getScansByPerson = async (req: Request, res: Response) => {
  try {
    const data = await qrcodeService.getScansByPerson(req.params.personId);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Estatísticas de scans (protegido)
export const getScansStats = async (req: Request, res: Response) => {
  try {
    const personId = req.query.personId as string | undefined;
    const data = await qrcodeService.getScansStats(personId);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
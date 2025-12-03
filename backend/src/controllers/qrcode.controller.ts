import { Request, Response, NextFunction } from "express";
import * as qrcodeService from "../services/qrcode.service";
import * as personService from "../services/person.service";
import * as leadService from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";
import { NotFoundError } from "../shared/errors";

// ==================== QRCODE CONTROLLER (Single Responsibility: HTTP handling) ====================

// Endpoint público para registrar scan do QR Code
export const scanQRCode = async (req: Request, res: Response, next: NextFunction) => {
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

    return ResponseBuilder.success(res, {
      personId: person.id,
      personName: person.name,
      message: "QR Code escaneado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

// Endpoint público para criar lead (formulário)
export const createLeadFromQR = async (req: Request, res: Response, next: NextFunction) => {
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
    const jsonData = (lead as any).toJSON ? (lead as any).toJSON() : lead;

    return ResponseBuilder.created(res, jsonData, "Cadastro realizado com sucesso!");
  } catch (error) {
    next(error);
  }
};

// Buscar scans de um vendedor (protegido)
export const getScansByPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await qrcodeService.getScansByPerson(req.params.personId);
    const jsonData = Array.isArray(data) ? data.map((item: any) => item.toJSON ? item.toJSON() : item) : data;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

// Estatísticas de scans (protegido)
export const getScansStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const personId = req.query.personId as string | undefined;
    const data = await qrcodeService.getScansStats(personId);
    return ResponseBuilder.success(res, data);
  } catch (error) {
    next(error);
  }
};

// Endpoint para servir QR Code como base64
export const serveQRCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { personId } = req.params;

    // Busca o vendedor pelo ID
    const person = await personService.getById(personId);
    if (!person || !person.qrCode) {
      throw new NotFoundError("QR Code");
    }

    // Gera QR Code como base64
    const qrCodeBase64 = await qrcodeService.getQRCodeBase64(person.qrCode);

    return ResponseBuilder.success(res, {
      personId: person.id,
      personName: person.name,
      qrCode: person.qrCode,
      qrCodeImage: qrCodeBase64,
    });
  } catch (error) {
    next(error);
  }
};
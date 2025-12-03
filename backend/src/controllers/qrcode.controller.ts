import { Request, Response, NextFunction } from "express";
import * as qrcodeService from "../services/qrcode.service";
import * as personService from "../services/person.service";
import * as leadService from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";

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

    return ResponseBuilder.created(res, lead, "Cadastro realizado com sucesso!");
  } catch (error) {
    next(error);
  }
};

// Buscar scans de um vendedor (protegido)
export const getScansByPerson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await qrcodeService.getScansByPerson(req.params.personId);
    return ResponseBuilder.success(res, data);
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

// Novo endpoint para servir QR Code
export const serveQRCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { personId } = req.params;

    // Busca o vendedor pelo ID
    const person = await personService.getById(personId);
    if (!person || !person.qrCodeUrl) {
      return ResponseBuilder.notFound(res, "QR Code não encontrado para este vendedor.");
    }

    // Busca o QR Code no bucket
    const qrCodeStream = await qrcodeService.getQRCodeStream(person.qrCodeUrl);

    // Define o cabeçalho e envia o QR Code como resposta
    res.setHeader("Content-Type", "image/png");
    qrCodeStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
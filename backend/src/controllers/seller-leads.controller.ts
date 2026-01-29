import { Request, Response, NextFunction } from "express";
import { LeadServiceFunctions } from "../services/lead.service";
import { ResponseBuilder } from "../shared/ResponseBuilder";
import { fileLogger } from "../utils/file-logger";

// ==================== SELLER LEADS CONTROLLER ====================

export const getMyLeads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    const { status } = req.query;
    const leads = await LeadServiceFunctions.getSellerLeads(sellerId, {
      status: status as any,
    });
    const jsonData = Array.isArray(leads) ? leads.map((item: any) => item.toJSON ? item.toJSON() : item) : leads;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const getMyLeadById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user?.userId;
    if (!sellerId) {
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    const { id } = req.params;
    const lead = await LeadServiceFunctions.getSellerLeadById(sellerId, id);
    const jsonData = (lead as any).toJSON ? (lead as any).toJSON() : lead;
    return ResponseBuilder.success(res, jsonData);
  } catch (error) {
    next(error);
  }
};

export const getMyStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // CRITICAL DEBUG: Extract and validate sellerId from token
    const sellerId = req.user?.userId;
    const userEmail = req.user?.email;
    const userRole = req.user?.role;
    
    // Log IMEDIATO no arquivo
    fileLogger.logStats({
      context: 'getMyStats_start',
      sellerId,
      userEmail,
      userRole,
      timestamp: new Date().toISOString(),
    });
    
    console.log('[MY-STATS] ========== INICIANDO BUSCA DE STATS ==========');
    console.log('[MY-STATS] Token decodificado:', {
      sellerId: sellerId || 'UNDEFINED/NULL',
      email: userEmail || 'UNDEFINED/NULL',
      role: userRole || 'UNDEFINED/NULL',
      tokenExists: !!req.user,
    });

    if (!sellerId) {
      console.error('[MY-STATS] ❌ ERRO: sellerId está undefined/null no token');
      return res.status(401).json({ success: false, message: "Não autenticado" });
    }

    // Validate sellerId is a valid UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerId)) {
      console.error('[MY-STATS] ❌ ERRO: sellerId não é um UUID válido:', sellerId);
      return res.status(400).json({ 
        success: false, 
        message: "ID do vendedor inválido", 
        debug: { sellerId, format: typeof sellerId }
      });
    }

    console.log('[MY-STATS] ✓ sellerId válido:', sellerId);

    // CRITICAL: Verify that the Person exists and matches the email
    try {
      const LeadServiceFunctions = require("../services/lead.service").LeadServiceFunctions || require("../services/lead.service");
      const Person = require("../models/Person").Person;
      
      const personInDb = await Person.findByPk(sellerId);
      console.log('[MY-STATS] Person no DB:', {
        exists: !!personInDb,
        id: personInDb?.id || 'NOT FOUND',
        email: personInDb?.email || 'NOT FOUND',
        name: personInDb?.name || 'NOT FOUND',
        active: personInDb?.active,
        emailVerified: personInDb?.emailVerified,
      });

      if (!personInDb) {
        console.error('[MY-STATS] ❌ ERRO CRÍTICO: Person com sellerId não encontrado no DB!');
        return res.status(404).json({ 
          success: false, 
          message: "Vendedor não encontrado", 
          debug: { sellerId }
        });
      }

      if (personInDb.email !== userEmail) {
        console.error('[MY-STATS] ❌ ERRO CRÍTICO: Email do token não corresponde ao email da Person no DB!', {
          tokenEmail: userEmail,
          dbEmail: personInDb.email,
          personId: sellerId
        });
      }
    } catch (dbCheckError) {
      console.error('[MY-STATS] ⚠️ Erro ao validar Person no DB:', dbCheckError);
      // Continue anyway, just log the error
    }

    let stats: any;
    try {
      stats = await LeadServiceFunctions.getSellerLeadsStats(sellerId);
    } catch (statsError: any) {
      console.error('[MY-STATS] ❌ Erro ao obter stats:', statsError);
      // Fallback para objeto vazio se houver erro
      stats = {
        total: 0,
        bought: 0,
        negotiation: 0,
        cancelled: 0,
        conversionRate: '0%',
        error: statsError?.message || 'Erro ao calcular stats',
      };
    }

    // Garantir que stats é sempre um objeto válido
    if (!stats || typeof stats !== 'object') {
      console.error('[MY-STATS] ❌ ERRO CRÍTICO: stats retornou valor inválido:', stats);
      stats = {
        total: 0,
        bought: 0,
        negotiation: 0,
        cancelled: 0,
        conversionRate: '0%',
        error: 'Valor de stats inválido',
      };
    }
    
    // Log detailed stats for debugging
    console.log('[MY-STATS] ✓ Stats finais:', {
      sellerId,
      stats: {
        total: stats.total || 0,
        bought: stats.bought || 0,
        negotiation: stats.negotiation || 0,
        cancelled: stats.cancelled || 0,
        conversionRate: stats.conversionRate || '0%',
        error: stats.error || undefined,
      }
    });

    console.log('[MY-STATS] ========== BUSCA DE STATS CONCLUÍDA ==========');
    
    // Log em arquivo também
    fileLogger.logStats({
      context: 'getMyStats_response',
      sellerId,
      stats,
      timestamp: new Date().toISOString(),
    });
    
    // Adicionar debug header na resposta para produção
    res.set('X-Debug-Stats', JSON.stringify({
      timestamp: new Date().toISOString(),
      sellerId,
      hasTotalField: 'total' in stats,
      statsType: typeof stats,
    }));
    
    return ResponseBuilder.success(res, stats);
  } catch (error) {
    console.error('[MY-STATS] ❌ Erro na busca de stats:', error);
    next(error);
  }
};

/**
 * DEBUG ENDPOINT: Retornar logs de stats
 * GET /api/seller-leads/debug/logs
 */
export const debugLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileLogger } = require("../utils/file-logger");
    const logContent = fileLogger.readStatsLog();
    
    return ResponseBuilder.success(res, {
      debug: true,
      logPath: fileLogger.getLogPath(),
      logContent: logContent,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DEBUG-LOGS] Erro:', error);
    next(error);
  }
};
  const timestamp = new Date().toISOString();
  
  console.log('[TEST-LOGGING] ========== TESTE DE LOGGING ==========');
  console.log('[TEST-LOGGING] Timestamp:', timestamp);
  console.log('[TEST-LOGGING] User:', req.user?.userId);
  console.error('[TEST-LOGGING] ESTE É UM ERRO TESTE - deve aparecer em stderr');
  console.warn('[TEST-LOGGING] ESTE É UM AVISO TESTE - deve aparecer em stdout');
  
  console.log('[TEST-LOGGING] ========== FIM DO TESTE ==========');

  return ResponseBuilder.success(res, {
    message: 'Teste de logging executado - verifique os logs do servidor',
    timestamp,
    userId: req.user?.userId,
    loggingWorking: true,
  });
};
  try {
    const sellerId = req.user?.userId;
    
    if (!sellerId) {
      return res.status(401).json({ 
        success: false, 
        message: "Não autenticado",
        timestamp: new Date().toISOString()
      });
    }

    console.log('[DEBUG-STATS] ========== INICIANDO DEBUG DE STATS ==========');
    console.log('[DEBUG-STATS] sellerId:', sellerId);

    // Buscar informações do vendedor
    const Person = require("../models/Person").Person;
    const Lead = require("../models/Lead").Lead;

    const person = await Person.findByPk(sellerId);
    console.log('[DEBUG-STATS] Person:', {
      id: person?.id,
      name: person?.name,
      email: person?.email,
      active: person?.active,
      emailVerified: person?.emailVerified,
      createdAt: person?.createdAt,
    });

    // Buscar TODOS os leads deste vendedor manualmente
    const allLeads = await Lead.findAll({
      where: { ownerId: sellerId },
      attributes: ['id', 'name', 'status', 'ownerId', 'createdAt'],
    });

    console.log('[DEBUG-STATS] Leads encontrados:', allLeads.length);
    console.log('[DEBUG-STATS] Primeiros 10 leads:', allLeads.slice(0, 10).map((l: any) => ({
      id: l.id,
      name: l.name,
      status: l.status,
      ownerId: l.ownerId,
      ownerIdMatches: l.ownerId === sellerId,
    })));

    // Contar por status manualmente
    const counts = {
      total: allLeads.length,
      bought: allLeads.filter((l: any) => l.status === 'BOUGHT').length,
      negotiation: allLeads.filter((l: any) => l.status === 'NEGOTIATION').length,
      cancelled: allLeads.filter((l: any) => l.status === 'CANCELLED').length,
    };

    console.log('[DEBUG-STATS] Contagens:', counts);

    return ResponseBuilder.success(res, {
      debug: true,
      sellerId,
      personExists: !!person,
      personInfo: person ? {
        id: person.id,
        name: person.name,
        email: person.email,
        active: person.active,
      } : null,
      leadsCount: counts,
      allLeadsCount: allLeads.length,
      sampleLeads: allLeads.slice(0, 3).map((l: any) => ({
        id: l.id,
        name: l.name,
        status: l.status,
        ownerId: l.ownerId,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[DEBUG-STATS] ❌ Erro:', error);
    next(error);
  }
};

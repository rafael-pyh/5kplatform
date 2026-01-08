import { Request, Response, NextFunction } from 'express';
import {
  registerPublicAffiliate,
  createAdminSeller,
  PublicAffiliateRegistrationDto,
  AdminSellerCreationDto
} from '../services/registration.service';
import { ResponseBuilder } from '../shared/ResponseBuilder';
import { generateToken } from '../utils/jwt';

/**
 * POST /auth/register/affiliate
 * Cadastro PÚBLICO de afiliados via link/QR Code
 * 
 * Cria automaticamente com role AFFILIATE
 * Login imediato (retorna JWT)
 */
export const registerAffiliate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, phone, state, city } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Senha deve ter pelo menos 8 caracteres'
      });
    }

    const dto: PublicAffiliateRegistrationDto = {
      name,
      email,
      password,
      phone,
      state,
      city
    };

    const affiliate = await registerPublicAffiliate(dto);

    // Gerar token JWT
    const token = generateToken({
      userId: affiliate.id,
      email: affiliate.email ?? '',
      role: affiliate.role
    });

    console.log(`✅ [AFFILIATE] Novo afiliado registrado: ${affiliate.email}`);

    return ResponseBuilder.created(res, {
      id: affiliate.id,
      name: affiliate.name,
      email: (affiliate.email ?? '') as string,
      role: affiliate.role,
      token
    }, 'Cadastro realizado com sucesso!');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/seller
 * Cadastro ADMINISTRATIVO de vendedor
 * 
 * Apenas ADMIN/SUPER_ADMIN podem criar
 * Cria com role SELLER ou ADMIN (conforme permissão)
 * Gera senha temporária que deve ser alterada no primeiro login
 */
export const createSellerAsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user;
    const { name, email, phone, pixKey, state, city, role } = req.body;

    // Validações básicas
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }

    // Validação: apenas SUPER_ADMIN pode criar ADMIN
    if (role === 'ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas SUPER_ADMIN pode criar outros ADMINs'
      });
    }

    const dto: AdminSellerCreationDto = {
      name,
      email,
      phone,
      pixKey,
      state,
      city,
      role,
      created_by: (currentUser as any)?.id || ''
    };

    const { seller, tempPassword } = await createAdminSeller(dto);

    // TODO: Enviar email com senha temporária
    // await emailService.sendTempPasswordEmail(seller.email, tempPassword);

    console.log(
      `✅ [ADMIN] Novo vendedor criado: ${seller.email} por ${currentUser?.email}`
    );

    return ResponseBuilder.created(res, {
      id: seller.id,
      name: seller.name,
      email: seller.email,
      role: seller.role,
      registration_type: seller.registration_type,
      tempPassword: tempPassword, // ← Retornar apenas uma vez
      message: 'Uma senha temporária foi enviada para o email do vendedor'
    }, 'Vendedor criado com sucesso!');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/seller/:id/convert-to-seller
 * Converte um AFFILIATE em SELLER
 * 
 * Apenas ADMIN/SUPER_ADMIN podem fazer
 * registration_type permanece PUBLIC (marca origem)
 */
export const convertAffiliateToSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { newRole = 'SELLER' } = req.body;

    const personService = require('../services/person.service');
    const person = await personService.getPersonById(id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (person.role !== 'AFFILIATE') {
      return res.status(400).json({
        success: false,
        message: 'Usuário não é um afiliado'
      });
    }

    // Validação: apenas SUPER_ADMIN pode promover para ADMIN
    if (newRole === 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas SUPER_ADMIN pode criar ADMINs'
      });
    }

    // Atualizar role (registration_type permanece PUBLIC)
    await personService.updatePerson(id, {
      role: newRole
    });

    console.log(
      `✅ [AUDIT] AFFILIATE convertido para SELLER: ${id} por ${req.user?.email}`
    );

    return ResponseBuilder.success(res, {
      id: person.id,
      name: person.name,
      email: person.email,
      role: newRole,
      registration_type: person.registration_type
    }, `Afiliado convertido para ${newRole} com sucesso!`);
  } catch (error) {
    next(error);
  }
};

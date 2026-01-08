import { Request, Response, NextFunction } from 'express';
import * as personService from '../services/person.service';
import { PersonRole } from '../models/Person';
import { ResponseBuilder } from '../shared/ResponseBuilder';
import { transformPersonUrls } from '../utils/url-transformer';

/**
 * Constrói resposta diferenciada baseada na role do usuário
 * 
 * AFFILIATE: vê apenas dados públicos
 * SELLER/ADMIN/SUPER_ADMIN: vê dados completos
 */
const buildSellerResponse = (person: any, userRole: string | PersonRole | undefined) => {
  const base = {
    id: person.id,
    name: person.name,
    active: person.active,
    registration_type: person.registration_type
  };

  // AFFILIATE vê apenas dados públicos
  if (userRole === PersonRole.AFFILIATE) {
    return base;
  }

  // SELLER+ vê dados completos
  return {
    ...base,
    email: person.email,
    phone: person.phone,
    pixKey: person.pixKey,
    state: person.state,
    city: person.city,
    role: person.role,
    approvalStatus: person.approvalStatus,
    created_at: person.createdAt,
    updated_at: person.updatedAt,
    created_by: person.created_by,
    scanCount: person.scanCount,
    photoBase64: person.photoBase64 ? '[Foto do perfil]' : null
  };
};

/**
 * GET /seller/:id
 * Retorna dados completos ou anonimizados conforme role do usuário
 */
export const getSellerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;

    const person = await (personService as any).getById(id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor não encontrado'
      });
    }

    const personData = person.toJSON ? person.toJSON() : person;
    const responseData = buildSellerResponse(personData, userRole);
    const transformedData = transformPersonUrls(responseData);

    return ResponseBuilder.success(res, transformedData);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /seller
 * Lista todos os vendedores (apenas para SELLER+)
 * AFFILIATE não consegue acessar via middleware
 */
export const listSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userRole = req.user?.role;

    // Busca todos os vendors
    const sellers = await (personService as any).getAll(true);

    const responseData = (Array.isArray(sellers) ? sellers : [sellers]).map((seller: any) =>
      buildSellerResponse(seller.toJSON ? seller.toJSON() : seller, userRole)
    );

    return ResponseBuilder.success(res, responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /seller/:id
 * Atualiza dados do vendedor (apenas dono ou admin)
 */
export const updateSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req.user as any)?.id;
    const userRole = req.user?.role;
    const { name, phone, pixKey, state, city, photoBase64 } = req.body;

    // AFFILIATE não pode atualizar
    if (userRole === PersonRole.AFFILIATE || userRole === 'AFFILIATE') {
      return res.status(403).json({
        success: false,
        message: 'Afiliados não podem atualizar vendedores'
      });
    }

    const person = await (personService as any).getById(id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor não encontrado'
      });
    }

    // Só dono ou admin pode atualizar
    const isOwner = userId === id;
    const isAdmin = userRole && [PersonRole.ADMIN, PersonRole.SUPER_ADMIN, 'ADMIN', 'SUPER_ADMIN'].includes(userRole);

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (pixKey) updateData.pixKey = pixKey;
    if (state) updateData.state = state;
    if (city) updateData.city = city;
    if (photoBase64) updateData.photoBase64 = photoBase64;

    await person.update(updateData);
    const updated = person.toJSON ? person.toJSON() : person;

    return ResponseBuilder.success(
      res,
      buildSellerResponse(updated, userRole),
      'Vendedor atualizado com sucesso'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /seller/:id
 * Deleta vendedor (soft delete)
 */
export const deleteSeller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const person = await (personService as any).getById(id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor não encontrado'
      });
    }

    // Soft delete
    await person.update({ active: false });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /seller/:id/role
 * Altera role do usuário (SUPER_ADMIN apenas)
 */
export const changeSellerRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !Object.values(PersonRole).includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role inválida'
      });
    }

    // Só SUPER_ADMIN pode criar outros ADMIN
    if ((role === PersonRole.ADMIN || role === 'ADMIN') && req.user?.role !== PersonRole.SUPER_ADMIN && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas SUPER_ADMIN pode criar outros ADMINs'
      });
    }

    const person = await (personService as any).getById(id);

    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await person.update({ role });
    const updated = person.toJSON ? person.toJSON() : person;

    return ResponseBuilder.success(
      res,
      buildSellerResponse(updated, req.user?.role),
      'Role alterada com sucesso'
    );
  } catch (error) {
    next(error);
  }
};


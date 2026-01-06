import sequelize from "../database/sequelize";
import { Person, PersonRole } from "../models/Person";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { Validator } from "../shared/Validator";
import { UnauthorizedError, NotFoundError, BadRequestError } from "../shared/errors";
import crypto from "crypto";
import { Op } from "sequelize";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/email";

// ==================== DTOs ====================
export interface SellerLoginDto {
  email: string;
  password: string;
}

export interface SetPasswordDto {
  token: string;
  password: string;
  city?: string;
  state?: string;
}

export interface VerifyEmailDto {
  token: string;
}

// ==================== SELLER AUTH SERVICE ====================

export const sellerLogin = async (data: SellerLoginDto) => {
  // Validações
  Validator.required(data.email, 'Email');
  Validator.required(data.password, 'Senha');
  Validator.email(data.email);

  // Busca o vendedor
  const person = await Person.findOne({
    where: { email: data.email },
  });

  if (!person || !person.email) {
    throw new UnauthorizedError("Credenciais inválidas");
  }

  // Verificação crítica: vendedor deve estar ativo
  if (!person.active) {
    throw new UnauthorizedError("Conta desativada. Entre em contato com o administrador.");
  }

  if (!person.emailVerified) {
    throw new UnauthorizedError("Email não verificado. Verifique seu email antes de fazer login.");
  }

  // Verificação: vendedor deve estar aprovado
  if (person.approvalStatus !== 'approved') {
    throw new UnauthorizedError("Sua conta ainda não foi aprovada pelo administrador. Aguarde a aprovação.");
  }

  if (!person.password) {
    throw new UnauthorizedError("Senha não definida. Complete o cadastro através do link enviado por email.");
  }

  // Verifica a senha
  const isValidPassword = await comparePassword(data.password, person.password);

  if (!isValidPassword) {
    throw new UnauthorizedError("Credenciais inválidas");
  }

  // Gera o token com role SELLER
  const token = generateToken({
    userId: person.id,
    email: person.email,
    role: PersonRole.SELLER,
  });

  return {
    person: {
      id: person.id,
      email: person.email,
      name: person.name,
      phone: person.phone,
      photoBase64: person.photoBase64,
      qrCode: person.qrCode,
      qrCodeUrl: person.qrCodeUrl,
    },
    token,
  };
};

export const verifyEmailToken = async (token: string) => {
  Validator.required(token, 'Token');

  console.log('[SellerAuthService] Buscando token:', token);

  const person = await Person.findOne({
    where: {
      verificationToken: token,
      tokenExpiry: {
        [Op.gte]: new Date(), // Token ainda não expirou
      },
    },
  });

  if (!person) {
    console.warn('[SellerAuthService] Token não encontrado ou expirado:', token);
    throw new BadRequestError("Token inválido ou expirado");
  }

  console.log('[SellerAuthService] Token válido para pessoa:', person.email);

  return {
    id: person.id,
    name: person.name,
    email: person.email,
    emailVerified: person.emailVerified,
  };
};

export const setPassword = async (data: SetPasswordDto) => {
  Validator.required(data.token, 'Token');
  Validator.required(data.password, 'Senha');
  Validator.minLength(data.password, 8, 'Senha');

  console.log('[SellerAuthService] Definindo senha com token:', data.token);

  // Busca pessoa pelo token
  const person = await Person.findOne({
    where: {
      verificationToken: data.token,
      tokenExpiry: {
        [Op.gte]: new Date(),
      },
    },
  });

  if (!person) {
    console.warn('[SellerAuthService] Token inválido ou expirado para setPassword:', data.token);
    throw new BadRequestError("Token inválido ou expirado");
  }

  console.log('[SellerAuthService] Token válido, atualizando senha para:', person.email);

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Prepara dados para atualizar
  const updateData: any = {
    password: hashedPassword,
    emailVerified: true,
    verificationToken: null,
    tokenExpiry: null,
  };

  // Adiciona cidade se fornecida
  if (data.city) {
    updateData.city = data.city;
  }

  // Adiciona estado se fornecido
  if (data.state) {
    updateData.state = data.state?.toUpperCase();
  }

  // Atualiza pessoa
  await person.update(updateData);

  console.log('[SellerAuthService] Senha definida com sucesso para:', person.email);

  // Gera token JWT
  const token = generateToken({
    userId: person.id,
    email: person.email!,
    role: PersonRole.SELLER,
  });

  return {
    person: {
      id: person.id,
      email: person.email,
      name: person.name,
      emailVerified: person.emailVerified,
      city: person.city,
      state: person.state,
    },
    token,
  };
};

export const requestPasswordReset = async (email: string) => {
  Validator.required(email, 'Email');
  Validator.email(email);

  const person = await Person.findOne({
    where: { email },
  });

  if (!person || !person.email) {
    // Não revela se o email existe por segurança
    return { message: "Se o email existir, um link de redefinição será enviado." };
  }

  // Gera novo token
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // 1 hora

  await person.update({
    verificationToken: token,
    tokenExpiry: expiry,
  });

  // TODO: Enviar email de reset (implementar depois)
  await sendPasswordResetEmail(person.email, person.name, token);

  return { message: "Se o email existir, um link de redefinição será enviado." };
};

export const resetPassword = async (token: string, newPassword: string) => {
  Validator.required(token, 'Token');
  Validator.required(newPassword, 'Nova senha');
  Validator.minLength(newPassword, 6, 'Nova senha');

  const person = await Person.findOne({
    where: {
      verificationToken: token,
      tokenExpiry: {
        [Op.gte]: new Date(),
      },
    },
  });

  if (!person) {
    throw new BadRequestError("Token inválido ou expirado");
  }

  const hashedPassword = await hashPassword(newPassword);

  await person.update({
    password: hashedPassword,
    verificationToken: null,
    tokenExpiry: null,
  });

  return { message: "Senha redefinida com sucesso" };
};

export const getSellerProfile = async (sellerId: string) => {
  const person = await Person.findByPk(sellerId, {
    attributes: [
      'id',
      'name',
      'email',
      'phone',
      'photoBase64',
      'qrCode',
      'qrCodeUrl',
      'scanCount',
      'active',
      'emailVerified',
      'createdAt',
    ],
  });

  if (!person) {
    throw new NotFoundError("Vendedor não encontrado");
  }

  return person;
};
export const resendVerificationEmail = async (email: string) => {
  Validator.required(email, 'Email');
  Validator.email(email);

  const person = await Person.findOne({
    where: { email },
  });

  if (!person || !person.email) {
    // Não revela se o email existe por segurança
    return { message: "Se o email existir na plataforma, um novo link de verificação será enviado." };
  }

  // Se o email já foi verificado, avisa
  if (person.emailVerified) {
    return { message: "Este email já foi verificado. Você pode fazer login normalmente." };
  }

  // Gera novo token
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 horas

  await person.update({
    verificationToken: token,
    tokenExpiry: expiry,
  });

  // Envia email com novo token
  await sendVerificationEmail(person.email, person.name, token);

  return { message: "Um novo link de verificação foi enviado para seu email." };
};
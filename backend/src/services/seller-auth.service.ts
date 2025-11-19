import prisma from "../database/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { Validator } from "../shared/Validator";
import { UnauthorizedError, NotFoundError, BadRequestError } from "../shared/errors";
import crypto from "crypto";

// ==================== DTOs ====================
export interface SellerLoginDto {
  email: string;
  password: string;
}

export interface SetPasswordDto {
  token: string;
  password: string;
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
  const person = await prisma.person.findUnique({
    where: { email: data.email },
  });

  if (!person || !person.email) {
    throw new UnauthorizedError("Credenciais inválidas");
  }

  if (!person.active) {
    throw new UnauthorizedError("Conta desativada");
  }

  if (!person.emailVerified) {
    throw new UnauthorizedError("Email não verificado. Verifique seu email antes de fazer login.");
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
    role: "SELLER",
  });

  return {
    person: {
      id: person.id,
      email: person.email,
      name: person.name,
      phone: person.phone,
      photoUrl: person.photoUrl,
      qrCode: person.qrCode,
    },
    token,
  };
};

export const verifyEmailToken = async (token: string) => {
  Validator.required(token, 'Token');

  const person = await prisma.person.findFirst({
    where: {
      verificationToken: token,
      tokenExpiry: {
        gte: new Date(), // Token ainda não expirou
      },
    },
  });

  if (!person) {
    throw new BadRequestError("Token inválido ou expirado");
  }

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
  Validator.minLength(data.password, 6, 'Senha');

  // Busca pessoa pelo token
  const person = await prisma.person.findFirst({
    where: {
      verificationToken: data.token,
      tokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!person) {
    throw new BadRequestError("Token inválido ou expirado");
  }

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Atualiza pessoa: define senha, verifica email, remove token
  const updatedPerson = await prisma.person.update({
    where: { id: person.id },
    data: {
      password: hashedPassword,
      emailVerified: true,
      verificationToken: null,
      tokenExpiry: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
    },
  });

  // Gera token JWT
  const token = generateToken({
    userId: updatedPerson.id,
    email: updatedPerson.email!,
    role: "SELLER",
  });

  return {
    person: updatedPerson,
    token,
  };
};

export const requestPasswordReset = async (email: string) => {
  Validator.required(email, 'Email');
  Validator.email(email);

  const person = await prisma.person.findUnique({
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

  await prisma.person.update({
    where: { id: person.id },
    data: {
      verificationToken: token,
      tokenExpiry: expiry,
    },
  });

  // TODO: Enviar email de reset (implementar depois)
  // await sendPasswordResetEmail(person.email, person.name, token);

  return { message: "Se o email existir, um link de redefinição será enviado." };
};

export const resetPassword = async (token: string, newPassword: string) => {
  Validator.required(token, 'Token');
  Validator.required(newPassword, 'Nova senha');
  Validator.minLength(newPassword, 6, 'Nova senha');

  const person = await prisma.person.findFirst({
    where: {
      verificationToken: token,
      tokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!person) {
    throw new BadRequestError("Token inválido ou expirado");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.person.update({
    where: { id: person.id },
    data: {
      password: hashedPassword,
      verificationToken: null,
      tokenExpiry: null,
    },
  });

  return { message: "Senha redefinida com sucesso" };
};

export const getSellerProfile = async (sellerId: string) => {
  const person = await prisma.person.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      qrCode: true,
      qrCodeUrl: true,
      scanCount: true,
      active: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!person) {
    throw new NotFoundError("Vendedor não encontrado");
  }

  return person;
};

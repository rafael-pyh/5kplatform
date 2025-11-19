import prisma from "../database/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { Validator } from "../shared/Validator";
import { UnauthorizedError, ConflictError } from "../shared/errors";

// ==================== DTOs ====================
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: "ADMIN" | "SUPER_ADMIN";
}

export interface LoginDto {
  email: string;
  password: string;
}

// ==================== AUTH SERVICE (Single Responsibility) ====================

export const register = async (data: CreateUserDto) => {
  // Validações
  Validator.required(data.name, 'Nome');
  Validator.required(data.email, 'Email');
  Validator.required(data.password, 'Senha');
  Validator.email(data.email);
  Validator.minLength(data.password, 6, 'Senha');

  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("Email já cadastrado");
  }

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Cria o usuário
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || "ADMIN",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  // Gera o token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { user, token };
};

export const login = async (data: LoginDto) => {
  // Validações
  Validator.required(data.email, 'Email');
  Validator.required(data.password, 'Senha');
  Validator.email(data.email);

  // Busca o usuário
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError("Credenciais inválidas");
  }

  if (!user.active) {
    throw new UnauthorizedError("Usuário desativado");
  }

  // Verifica a senha
  const isValidPassword = await comparePassword(data.password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError("Credenciais inválidas");
  }

  // Gera o token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return user;
};

export const updateUser = async (
  id: string,
  data: Partial<CreateUserDto> & { active?: boolean }
) => {
  const updateData: any = {
    email: data.email,
    name: data.name,
    role: data.role,
    active: data.active,
  };

  // Se a senha foi fornecida, faz o hash
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
};

export const deleteUser = async (id: string) => {
  return prisma.user.delete({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
};

// Função para admins criarem outros usuários admin
export const createAdminUser = async (data: CreateUserDto, creatorRole: string) => {
  // Validações
  Validator.required(data.name, 'Nome');
  Validator.required(data.email, 'Email');
  Validator.required(data.password, 'Senha');
  Validator.email(data.email);
  Validator.minLength(data.password, 6, 'Senha');

  // Verifica se o criador é admin
  if (creatorRole !== "ADMIN" && creatorRole !== "SUPER_ADMIN") {
    throw new UnauthorizedError("Apenas administradores podem criar usuários admin");
  }

  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("Email já cadastrado");
  }

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Cria o usuário admin
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role || "ADMIN",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return user;
};
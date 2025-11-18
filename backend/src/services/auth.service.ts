import prisma from "../database/prisma";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";

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

export const register = async (data: CreateUserDto) => {
  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email já cadastrado");
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
  // Busca o usuário
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("Email ou senha inválidos");
  }

  if (!user.active) {
    throw new Error("Usuário desativado");
  }

  // Verifica a senha
  const isValidPassword = await comparePassword(data.password, user.password);

  if (!isValidPassword) {
    throw new Error("Email ou senha inválidos");
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
import sequelize from "../database/sequelize";
import { Person, PersonRole } from "../models/Person";
import { Lead } from "../models/Lead";
import { QRCodeScan } from "../models/QRCodeScan";
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
  const existingUser = await Person.findOne({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("Email já cadastrado");
  }

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Cria o usuário na tabela Person
  const user = await Person.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: (data.role || "ADMIN") as PersonRole,
    qrCode: `ADMIN-${Date.now()}`,
    emailVerified: true,
    active: true,
  });

  // Gera o token
  const token = generateToken({
    userId: user.id,
    email: user.email!,
    role: user.role || PersonRole.ADMIN,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      active: user.active,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const login = async (data: LoginDto) => {
  // Validações
  Validator.required(data.email, 'Email');
  Validator.required(data.password, 'Senha');
  Validator.email(data.email);

  // Busca o usuário na tabela Person (unificada)
  const user = await Person.findOne({
    where: { email: data.email },
  });

  console.log('🔍 Login attempt:', { email: data.email, userFound: !!user });

  if (!user) {
    console.log('❌ User not found for email:', data.email);
    throw new UnauthorizedError("Credenciais inválidas");
  }

  // Verificação crítica: usuário deve estar ativo
  console.log('✅ User found:', { id: user.id, email: user.email, active: user.active, hasPassword: !!user.password, role: user.role });
  
  if (!user.active) {
    console.log('❌ User account is not active');
    throw new UnauthorizedError("Conta desativada. Entre em contato com o administrador.");
  }

  // Verifica se tem senha definida
  if (!user.password) {
    console.log('❌ User has no password set');
    throw new UnauthorizedError("Senha não definida. Verifique seu email para concluir o cadastro.");
  }

  // Verifica a senha
  const isValidPassword = await comparePassword(data.password, user.password);
  console.log('🔐 Password check:', { isValid: isValidPassword });

  if (!isValidPassword) {
    console.log('❌ Invalid password');
    throw new UnauthorizedError("Credenciais inválidas");
  }

  // Validações adicionais
  if (!user.email) {
    throw new UnauthorizedError("Email não encontrado");
  }

  // Define o role (se não tiver, assume SELLER)
  const userRole = user.role || PersonRole.SELLER;

  // Gera o token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: userRole,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || 'Usuário',
      role: user.role || PersonRole.SELLER,
    },
    token,
  };
};

export const getAllUsers = async () => {
  return Person.findAll({
    where: {
      role: [PersonRole.ADMIN, PersonRole.SUPER_ADMIN],
    },
    attributes: ['id', 'email', 'name', 'role', 'active', 'createdAt'],
    order: [['createdAt', 'DESC']],
  });
};

export const getUserById = async (id: string) => {
  const user = await Person.findByPk(id, {
    attributes: ['id', 'email', 'name', 'role', 'active', 'createdAt'],
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
  const user = await Person.findByPk(id);
  if (!user) throw new Error("Usuário não encontrado");

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

  await user.update(updateData);
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
};

export const deleteUser = async (id: string) => {
  const user = await Person.findByPk(id);
  if (!user) throw new Error("Usuário não encontrado");

  await user.destroy();
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
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
  const existingUser = await Person.findOne({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError("Email já cadastrado");
  }

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Cria o usuário admin na tabela Person
  const user = await Person.create({
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: (data.role || "ADMIN") as PersonRole,
    qrCode: `ADMIN-${Date.now()}`,
    emailVerified: true,
    active: true,
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
  };
};

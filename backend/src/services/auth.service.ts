import sequelize from "../database/sequelize";
import { Person, PersonRole } from "../models/Person";
import { Lead } from "../models/Lead";
import { QRCodeScan } from "../models/QRCodeScan";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { Validator } from "../shared/Validator";
import { UnauthorizedError, ConflictError } from "../shared/errors";
import { uploadBase64ToS3 } from "./storage.service";
import * as crypto from "crypto";

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
  rememberMe?: boolean;
}

// ==================== AUTH SERVICE (Single Responsibility) ====================

export const register = async (data: CreateUserDto) => {
  // Validações
  Validator.required(data.name, 'Nome');
  Validator.required(data.email, 'Email');
  Validator.required(data.password, 'Senha');
  Validator.email(data.email);
  // Limites de tamanho para mitigar payloads muito grandes
  Validator.maxLength(data.name, 100, 'Nome');
  Validator.maxLength(data.email, 254, 'Email');
  Validator.maxLength(data.password, 128, 'Senha');
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

  // Prepara os dados para criar o usuário
  const createData: any = {
    email: data.email,
    password: hashedPassword,
    name: data.name,
    role: (data.role || "ADMIN") as PersonRole,
    qrCode: `ADMIN-${Date.now()}`,
    emailVerified: true,
    active: true,
  };

  // Faz upload de photoBase64 para S3 se fornecido
  if ((data as any).photoBase64) {
    try {
      const fileName = `${data.email.replace('@', '_').replace(/\./g, '_')}.jpg`;
      const photoUrl = await uploadBase64ToS3((data as any).photoBase64, fileName, 'profile-photos');
      createData.photoBase64 = photoUrl; // Salva apenas a URL, não o base64
    } catch (error) {
      throw error;
    }
  }
  const user = await Person.create(createData);

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
      photoBase64: (user as any).photoBase64,
    },
    token,
  };
};

export const login = async (data: LoginDto) => {
  // Validações
  Validator.required(data.email, 'Email');
  Validator.required(data.password, 'Senha');
  Validator.email(data.email);
  // Limites de tamanho
  Validator.maxLength(data.email, 254, 'Email');
  Validator.maxLength(data.password, 128, 'Senha');

  // Busca o usuário na tabela Person (unificada)
  const user = await Person.findOne({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError("Credenciais inválidas");
  }

  // Verificação crítica: usuário deve estar ativo
  
  if (!user.active) {
    throw new UnauthorizedError("Conta desativada. Entre em contato com o administrador.");
  }

  // Verifica se tem senha definida
  if (!user.password) {
    throw new UnauthorizedError("Senha não definida. Verifique seu email para concluir o cadastro.");
  }

  // Verifica a senha
  const isValidPassword = await comparePassword(data.password, user.password);

  if (!isValidPassword) {
    throw new UnauthorizedError("Credenciais inválidas");
  }

  // Validações adicionais
  if (!user.email) {
    throw new UnauthorizedError("Email não encontrado");
  }

  // Define o role (se não tiver, assume SELLER)
  const userRole = user.role || PersonRole.SELLER;

  // Gera o token JWT
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: userRole,
  });

  // Gera token de "Lembrar de mim" se solicitado (válido por 30 dias)
  let rememberMeToken: string | undefined;
  if (data.rememberMe) {
    rememberMeToken = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 dias
    
    await user.update({
      rememberMeToken,
      rememberMeExpiry: expiryDate,
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name || 'Usuário',
      role: user.role || PersonRole.SELLER,
      photoBase64: (user as any).photoBase64,
    },
    token,
    rememberMeToken,
  };
};

export const getAllUsers = async () => {
  return Person.findAll({
    where: {
      role: [PersonRole.ADMIN, PersonRole.SUPER_ADMIN],
    },
    attributes: ['id', 'email', 'name', 'role', 'active', 'createdAt', 'photoBase64', 'phone', 'pixKey'],
    order: [['createdAt', 'DESC']],
  });
};

export const getUserById = async (id: string) => {
  const user = await Person.findByPk(id, {
    attributes: ['id', 'email', 'name', 'role', 'active', 'createdAt', 'photoBase64', 'phone', 'pixKey'],
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

  // Faz upload de photoBase64 para S3 se fornecido
  if ((data as any).photoBase64) {
    try {
      const fileName = `${data.email?.replace('@', '_').replace(/\./g, '_') || user.id}.jpg`;
      const photoUrl = await uploadBase64ToS3((data as any).photoBase64, fileName, 'profile-photos');
      updateData.photoBase64 = photoUrl; // Salva apenas a URL, não o base64
    } catch (error) {
      throw error;
    }
  } else if ((data as any).avatar) {
    try {
      const fileName = `${data.email?.replace('@', '_').replace(/\./g, '_') || user.id}.jpg`;
      const photoUrl = await uploadBase64ToS3((data as any).avatar, fileName, 'profile-photos');
      updateData.photoBase64 = photoUrl; // Salva apenas a URL, não o base64
    } catch (error) {
      throw error;
    }
  }

  // Se a senha foi fornecida, faz o hash
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  // Additional person fields
  if ((data as any).phone !== undefined) updateData.phone = (data as any).phone;
  if ((data as any).pixKey !== undefined) updateData.pixKey = (data as any).pixKey;
  if ((data as any).qrCodeUrl !== undefined) updateData.qrCodeUrl = (data as any).qrCodeUrl;
  if ((data as any).emailVerified !== undefined) updateData.emailVerified = (data as any).emailVerified;

  await user.update(updateData);
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    photoBase64: (user as any).photoBase64,
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

export const confirmEmail = async (token: string) => {
  // Valida se o token foi fornecido
  if (!token || token.trim() === '') {
    throw new Error("Token é obrigatório");
  }
  
  const person = await Person.findOne({ where: { verificationToken: token } });

  if (!person) {
    throw new Error("Token inválido ou expirado.");
  }

  // Verifica se o token expirou
  if (person.tokenExpiry && new Date() > person.tokenExpiry) {
    throw new Error("Token expirado. Solicite um novo link de verificação.");
  }

  person.emailVerified = true;
  person.verificationToken = undefined;
  person.tokenExpiry = undefined;

  await person.save();

  return { message: "Email confirmado com sucesso." };
};

export const getCurrentUser = async (userId: string) => {
  const user = await Person.findByPk(userId, {
    attributes: ['id', 'email', 'name', 'role', 'active', 'createdAt', 'photoBase64', 'phone', 'pixKey', 'emailVerified', 'approvalStatus', 'qrCode', 'qrCodeUrl'],
  });

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  if (!user.active) {
    throw new UnauthorizedError("Conta desativada");
  }

  return user;
};

// Valida e usa o token de "Lembrar de mim"
export const validateRememberMeToken = async (rememberMeToken: string) => {
  if (!rememberMeToken) {
    throw new UnauthorizedError("Token 'Lembrar de mim' inválido");
  }

  const user = await Person.findOne({
    where: { rememberMeToken },
  });

  if (!user) {
    throw new UnauthorizedError("Token 'Lembrar de mim' inválido");
  }

  // Verifica se o token expirou
  if (user.rememberMeExpiry && new Date() > user.rememberMeExpiry) {
    // Limpa o token expirado
    await user.update({
      rememberMeToken: null,
      rememberMeExpiry: null,
    });
    throw new UnauthorizedError("Token 'Lembrar de mim' expirado");
  }

  // Verifica se o usuário está ativo
  if (!user.active) {
    throw new UnauthorizedError("Conta desativada");
  }

  // Gera novo token JWT
  const token = generateToken({
    userId: user.id,
    email: user.email!,
    role: user.role || PersonRole.SELLER,
  });

  // Regenera o token de "lembrar" (refresh)
  const newRememberMeToken = crypto.randomBytes(32).toString('hex');
  const newExpiryDate = new Date();
  newExpiryDate.setDate(newExpiryDate.getDate() + 30);

  await user.update({
    rememberMeToken: newRememberMeToken,
    rememberMeExpiry: newExpiryDate,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || PersonRole.SELLER,
      photoBase64: (user as any).photoBase64,
    },
    token,
    rememberMeToken: newRememberMeToken,
  };
};

import { Person, PersonRole } from '../models/Person';
import { hashPassword } from '../utils/bcrypt';
import { generateQRCode } from '../utils/qr';
import { ConflictError } from '../shared/errors';
import crypto from 'crypto';

export interface PublicAffiliateRegistrationDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  birthDate: string | Date;
  state?: string;
  city?: string;
}

export interface AdminSellerCreationDto {
  name: string;
  email: string;
  phone?: string;
  pixKey?: string;
  state?: string;
  city?: string;
  role?: PersonRole;
  created_by: string; // ID do admin
}

/**
 * Serviço: Cadastro público de afiliados
 * 
 * Cria usuário com role AFFILIATE e registration_type PUBLIC
 * Não requer aprovação admin
 */
export const registerPublicAffiliate = async (data: PublicAffiliateRegistrationDto) => {
  // Verificar email duplicado
  const existingPerson = await Person.findOne({
    where: { email: data.email }
  });

  if (existingPerson) {
    throw new ConflictError('Email já registrado. Faça login para continuar.');
  }

  // Gerar QR code string
  const qrCode = generateQRCode();

  // Hash da senha
  const hashedPassword = await hashPassword(data.password);

  // Criar afiliado
  const affiliate = await Person.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone || null,
    cpf: data.cpf || null, // Novo campo
    birthDate: data.birthDate || null, // Novo campo
    state: data.state || null,
    city: data.city || null,
    qrCode,
    role: PersonRole.AFFILIATE, // ← Sempre AFFILIATE
    registration_type: 'PUBLIC', // ← Sempre PUBLIC
    created_by: null, // ← Afiliados não têm criador admin
    approvalStatus: 'approved', // ← Afiliados são auto-aprovados
    active: true
  });

  return affiliate;
};

/**
 * Serviço: Criação administrativa de vendedor
 * 
 * Apenas ADMIN/SUPER_ADMIN podem criar vendedores
 * Cria com role SELLER (ou ADMIN se SUPER_ADMIN) e registration_type ADMIN
 */
export const createAdminSeller = async (data: AdminSellerCreationDto) => {
  // Validar role
  let roleToCreate = data.role || PersonRole.SELLER;
  
  // Validar se email já existe
  const existingPerson = await Person.findOne({
    where: { email: data.email }
  });

  if (existingPerson) {
    throw new ConflictError('Email já registrado.');
  }

  // Gerar QR code string
  const qrCode = generateQRCode();

  // Gerar senha temporária
  const tempPassword = generateTemporaryPassword();
  const hashedPassword = await hashPassword(tempPassword);

  // Criar vendedor
  const seller = await Person.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    phone: data.phone || null,
    pixKey: data.pixKey || null,
    state: data.state || null,
    city: data.city || null,
    qrCode,
    role: roleToCreate,
    registration_type: 'ADMIN', // ← Sempre ADMIN
    created_by: data.created_by, // ← Marca quem criou
    approvalStatus: 'approved', // ← Vendedores administrativos já são aprovados
    active: true
  });

  return { seller, tempPassword };
};

/**
 * Altera a role de um usuário
 * Apenas SUPER_ADMIN pode promover para ADMIN
 */
export const changeUserRole = async (userId: string, newRole: PersonRole, changedByRole: PersonRole) => {
  const user = await Person.findByPk(userId);

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Validação: apenas SUPER_ADMIN pode criar ADMINs
  if (newRole === PersonRole.ADMIN && changedByRole !== PersonRole.SUPER_ADMIN) {
    throw new Error('Apenas SUPER_ADMIN pode criar outros ADMINs');
  }

  // Se convertermos de AFFILIATE para SELLER, atualize registration_type se necessário
  const updates: any = { role: newRole };

  // Log de auditoria
  console.log(`🔐 Role alterada: ${user.id} de ${user.role} para ${newRole}`);

  await user.update(updates);
  return user;
};

/**
 * Função auxiliar: Gerar senha temporária
 */
function generateTemporaryPassword(): string {
  return crypto
    .randomBytes(8)
    .toString('hex')
    .substring(0, 12)
    .toUpperCase();
}

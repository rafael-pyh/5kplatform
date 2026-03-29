export type PersonRole = 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | 'AFFILIATE';
export type RegistrationType = 'PUBLIC' | 'ADMIN';

export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoBase64?: string;
  qrCode: string;
  qrCodeUrl?: string;
  qrCodeBase64?: string;
  active: boolean;
  scanCount: number;
  role: PersonRole;
  registration_type?: RegistrationType;
  password?: string;
  emailVerified: boolean;
  city: string;
  state: string;
  cpf?: string;
  birthDate?: string | Date;
  commissionType?: 'FIXED' | 'PERCENTAGE';
  verificationToken?: string;
  tokenExpiry?: Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  created_by?: string;
}

export interface CreateAffiliateDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  state?: string;
  city?: string;
}

export interface CreateSellerDTO {
  name: string;
  email: string;
  phone?: string;
  pixKey?: string;
  state?: string;
  city?: string;
  role?: PersonRole;
}
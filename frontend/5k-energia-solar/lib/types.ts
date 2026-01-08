// ========== USER & AUTH ==========
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'SELLER' | 'AFFILIATE';
  registration_type?: 'PUBLIC' | 'ADMIN';
  active?: boolean;
  createdAt: string;
  updatedAt: string;
  photoBase64?: string;
  emailVerified?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  qrCode?: string;
  qrCodeUrl?: string;
  phone?: string;
  pixKey?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  token: string;
  rememberMeToken?: string;
  user: User;
}

export interface CreateAffiliateDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  state?: string;
  city?: string;
}

export interface CreateSellerDto {
  name: string;
  email: string;
  phone?: string;
  pixKey?: string;
  state?: string;
  city?: string;
  role?: 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | 'AFFILIATE';
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'SELLER' | 'AFFILIATE';
}

export interface UpdateAdminDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'SUPER_ADMIN' | 'SELLER' | 'AFFILIATE';
  active?: boolean;
  phone?: string;
  pixKey?: string;
  photoBase64?: string;
  qrCodeUrl?: string;
  emailVerified?: boolean;
}

// ========== PERSON (VENDEDOR) ==========
export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoBase64?: string; // Base64 data URL da foto de perfil
  qrCode: string;
  qrCodeUrl?: string; // URL S3 do QR code
  scanCount: number;
  active: boolean;
  role: 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | 'AFFILIATE';
  emailVerified: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  city: string;
  state: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreatePersonDto {
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  city: string;
  state: string;
  photoBase64?: string;
}

export interface UpdatePersonDto {
  name?: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  city?: string;
  state?: string;
  photoBase64?: string;
  active?: boolean;
  role?: 'SELLER' | 'ADMIN' | 'SUPER_ADMIN' | 'AFFILIATE';
}

// ========== LEAD (INTERESSADO) ==========
export enum LeadStatus {
  BOUGHT = 'BOUGHT',
  CANCELLED = 'CANCELLED',
  NEGOTIATION = 'NEGOTIATION',
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  energyBillUrl?: string;
  roofPhotoUrl?: string;
  status: LeadStatus;
  ownerId: string;
  owner?: Person;
  createdAt: string;
  updatedAt: string;
  city?: string;
  state?: string;
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone: string;
  energyBillUrl?: string;
  roofPhotoUrl?: string;
  ownerId: string;
  city?: string;
  state?: string;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  energyBillUrl?: string;
  roofPhotoUrl?: string;
  status?: LeadStatus;
  city?: string;
  state?: string;
}

// ========== QR CODE SCAN ==========
export interface QRCodeScan {
  id: string;
  personId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ========== STATISTICS ==========
export interface DashboardStats {
  totalPersons: number;
  activePersons: number;
  totalLeads: number;
  newLeads: number;
  leadsByStatus: {
    bought: number;
    negotiation: number;
    cancelled: number;
  };
}

export interface PersonStats {
  totalLeads: number;
  totalScans: number;
  conversionRate: number;
  leadsByStatus: {
    bought: number;
    negotiation: number;
    cancelled: number;
  };
}

// ========== API RESPONSES ==========
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ========== FILTERS ==========
export interface LeadFilters {
  status?: LeadStatus;
  ownerId?: string;
  search?: string;
}

// ========== USER & AUTH ==========
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface UpdateAdminDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'ADMIN' | 'SUPER_ADMIN';
  active?: boolean;
}

// ========== PERSON (VENDEDOR) ==========
export interface Person {
  id: string;
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  photoUrl?: string;
  qrCode: string;
  qrCodeUrl?: string;
  scanCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonDto {
  name: string;
  email: string;
  phone: string;
  pixKey: string;
  photoUrl?: string;
}

export interface UpdatePersonDto {
  name?: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoUrl?: string;
  active?: boolean;
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
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone: string;
  energyBillUrl?: string;
  roofPhotoUrl?: string;
  ownerId: string;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  phone?: string;
  energyBillUrl?: string;
  roofPhotoUrl?: string;
  status?: LeadStatus;
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

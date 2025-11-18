export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

export interface Vendedor {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoUrl?: string;
  qrCode: string;
  qrCodeUrl?: string;
  active: boolean;
  scanCount: number;
  createdAt: string;
  _count?: {
    leads: number;
    qrCodeScans: number;
  };
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  energyBill?: string;
  roofPhoto?: string;
  status: 'BOUGHT' | 'CANCELLED' | 'NEGOTIATION';
  notes?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  total: number;
  bought: number;
  negotiation: number;
  cancelled: number;
  conversionRate: string;
}
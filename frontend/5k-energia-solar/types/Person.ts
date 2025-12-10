export interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  pixKey?: string;
  photoBase64?: string;
  qrCode: string;
  qrCodeBase64?: string;
  active: boolean;
  scanCount: number;
  role: 'SELLER' | 'ADMIN' | 'SUPER_ADMIN';
  password?: string;
  emailVerified: boolean;
  city: string;
  state: string;
  verificationToken?: string;
  tokenExpiry?: Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  approvalStatus: 'pending' | 'approved' | 'rejected';
}
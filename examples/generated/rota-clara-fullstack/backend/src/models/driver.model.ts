export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  region?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
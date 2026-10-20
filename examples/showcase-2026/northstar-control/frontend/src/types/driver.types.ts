export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  region?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type DriverCreateInput = Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>;
export type DriverUpdateInput = Partial<DriverCreateInput>;
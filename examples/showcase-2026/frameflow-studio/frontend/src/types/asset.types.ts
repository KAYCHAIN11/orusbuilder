export interface Asset {
  id: string;
  name: string;
  serialNumber?: string;
  category?: string;
  location?: string;
  lastMaintenanceAt?: Date | string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type AssetCreateInput = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>;
export type AssetUpdateInput = Partial<AssetCreateInput>;
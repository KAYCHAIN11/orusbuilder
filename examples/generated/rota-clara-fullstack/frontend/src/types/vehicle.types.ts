export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  capacity?: number;
  lastMaintenanceAt?: Date | string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type VehicleCreateInput = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
export type VehicleUpdateInput = Partial<VehicleCreateInput>;
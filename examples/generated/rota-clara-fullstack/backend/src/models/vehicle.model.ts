export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  capacity?: number | null;
  lastMaintenanceAt?: Date | string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
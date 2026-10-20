export interface DeliveryRoute {
  id: string;
  name: string;
  vehicleId?: string | null;
  scheduledAt: Date | string;
  stops: number;
  distance?: number | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
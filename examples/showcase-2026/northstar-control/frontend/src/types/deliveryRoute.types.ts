export interface DeliveryRoute {
  id: string;
  name: string;
  vehicleId?: string;
  scheduledAt: Date | string;
  stops: number;
  distance?: number;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type DeliveryRouteCreateInput = Omit<DeliveryRoute, 'id' | 'createdAt' | 'updatedAt'>;
export type DeliveryRouteUpdateInput = Partial<DeliveryRouteCreateInput>;
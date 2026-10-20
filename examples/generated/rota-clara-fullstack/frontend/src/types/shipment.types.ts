export interface Shipment {
  id: string;
  name: string;
  trackingCode: string;
  origin: string;
  destination: string;
  estimatedDeliveryAt?: Date | string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ShipmentCreateInput = Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>;
export type ShipmentUpdateInput = Partial<ShipmentCreateInput>;
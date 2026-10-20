export interface Shipment {
  id: string;
  name: string;
  trackingCode: string;
  origin: string;
  destination: string;
  estimatedDeliveryAt?: Date | string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
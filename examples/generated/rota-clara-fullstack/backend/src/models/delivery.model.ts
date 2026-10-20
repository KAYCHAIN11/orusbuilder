export interface Delivery {
  id: string;
  name: string;
  shipmentId: string;
  address: string;
  scheduledAt?: Date | string | null;
  proofUrl?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Delivery {
  id: string;
  name: string;
  shipmentId: string;
  address: string;
  scheduledAt?: Date | string;
  proofUrl?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type DeliveryCreateInput = Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>;
export type DeliveryUpdateInput = Partial<DeliveryCreateInput>;
export interface TrackingEvent {
  id: string;
  name: string;
  shipmentId: string;
  occurredAt: Date | string;
  location?: string;
  description: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type TrackingEventCreateInput = Omit<TrackingEvent, 'id' | 'createdAt' | 'updatedAt'>;
export type TrackingEventUpdateInput = Partial<TrackingEventCreateInput>;
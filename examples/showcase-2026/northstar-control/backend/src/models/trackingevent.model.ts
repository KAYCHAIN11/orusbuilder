export interface TrackingEvent {
  id: string;
  name: string;
  shipmentId: string;
  occurredAt: Date | string;
  location?: string | null;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Ticket {
  id: string;
  name: string;
  eventId: string;
  code: string;
  price: number;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
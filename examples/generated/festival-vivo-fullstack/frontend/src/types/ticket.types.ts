export interface Ticket {
  id: string;
  name: string;
  eventId: string;
  code: string;
  price: number;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type TicketCreateInput = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;
export type TicketUpdateInput = Partial<TicketCreateInput>;
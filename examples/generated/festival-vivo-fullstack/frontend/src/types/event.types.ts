export interface Event {
  id: string;
  name: string;
  startsAt: Date | string;
  endsAt?: Date | string;
  venue?: string;
  capacity?: number;
  description: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type EventCreateInput = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type EventUpdateInput = Partial<EventCreateInput>;
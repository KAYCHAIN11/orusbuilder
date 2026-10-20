export interface EventSession {
  id: string;
  name: string;
  eventId: string;
  startsAt: Date | string;
  speaker?: string;
  room?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type EventSessionCreateInput = Omit<EventSession, 'id' | 'createdAt' | 'updatedAt'>;
export type EventSessionUpdateInput = Partial<EventSessionCreateInput>;
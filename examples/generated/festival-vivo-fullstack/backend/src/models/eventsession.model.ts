export interface EventSession {
  id: string;
  name: string;
  eventId: string;
  startsAt: Date | string;
  speaker?: string | null;
  room?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
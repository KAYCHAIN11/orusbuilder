export interface Event {
  id: string;
  name: string;
  startsAt: Date | string;
  endsAt?: Date | string | null;
  venue?: string | null;
  capacity?: number | null;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
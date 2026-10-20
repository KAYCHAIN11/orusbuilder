export interface CheckIn {
  id: string;
  name: string;
  ticketId: string;
  checkedInAt?: Date | string | null;
  gate?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
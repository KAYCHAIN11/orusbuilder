export interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type AttendeeCreateInput = Omit<Attendee, 'id' | 'createdAt' | 'updatedAt'>;
export type AttendeeUpdateInput = Partial<AttendeeCreateInput>;
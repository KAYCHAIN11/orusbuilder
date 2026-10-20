export interface Appointment {
  id: string;
  name: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  professional: string;
  patientId?: string;
  type: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type AppointmentCreateInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;
export type AppointmentUpdateInput = Partial<AppointmentCreateInput>;
export interface Appointment {
  id: string;
  name: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  professional: string;
  patientId?: string | null;
  type: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
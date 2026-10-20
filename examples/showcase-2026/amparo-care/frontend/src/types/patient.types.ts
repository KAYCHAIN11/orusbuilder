export interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: Date | string;
  document?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type PatientCreateInput = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;
export type PatientUpdateInput = Partial<PatientCreateInput>;
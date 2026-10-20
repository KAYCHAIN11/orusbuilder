export interface Patient {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  birthDate?: Date | string | null;
  document?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
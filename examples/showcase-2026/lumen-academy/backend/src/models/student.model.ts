export interface Student {
  id: string;
  name: string;
  email: string;
  registrationCode?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface JobOpening {
  id: string;
  name: string;
  department: string;
  location?: string | null;
  workMode: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
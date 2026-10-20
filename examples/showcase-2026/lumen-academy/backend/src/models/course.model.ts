export interface Course {
  id: string;
  name: string;
  category?: string | null;
  durationHours?: number | null;
  instructor?: string | null;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
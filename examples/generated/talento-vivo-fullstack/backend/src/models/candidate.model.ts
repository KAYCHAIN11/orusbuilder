export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  headline?: string | null;
  resumeUrl?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
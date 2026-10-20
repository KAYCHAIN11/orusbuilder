export interface Application {
  id: string;
  name: string;
  candidateId: string;
  jobOpeningId: string;
  appliedAt: Date | string;
  score?: number | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
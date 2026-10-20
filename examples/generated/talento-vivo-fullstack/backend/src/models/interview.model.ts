export interface Interview {
  id: string;
  name: string;
  candidateId: string;
  scheduledAt: Date | string;
  interviewer: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
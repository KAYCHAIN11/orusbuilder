export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  headline?: string;
  resumeUrl?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type CandidateCreateInput = Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>;
export type CandidateUpdateInput = Partial<CandidateCreateInput>;
export interface Interview {
  id: string;
  name: string;
  candidateId: string;
  scheduledAt: Date | string;
  interviewer: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type InterviewCreateInput = Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>;
export type InterviewUpdateInput = Partial<InterviewCreateInput>;
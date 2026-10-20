export interface JobOpening {
  id: string;
  name: string;
  department: string;
  location?: string;
  workMode: string;
  description: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type JobOpeningCreateInput = Omit<JobOpening, 'id' | 'createdAt' | 'updatedAt'>;
export type JobOpeningUpdateInput = Partial<JobOpeningCreateInput>;
export interface Application {
  id: string;
  name: string;
  candidateId: string;
  jobOpeningId: string;
  appliedAt: Date | string;
  score?: number;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ApplicationCreateInput = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>;
export type ApplicationUpdateInput = Partial<ApplicationCreateInput>;
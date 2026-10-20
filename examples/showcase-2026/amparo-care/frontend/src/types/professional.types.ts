export interface Professional {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ProfessionalCreateInput = Omit<Professional, 'id' | 'createdAt' | 'updatedAt'>;
export type ProfessionalUpdateInput = Partial<ProfessionalCreateInput>;
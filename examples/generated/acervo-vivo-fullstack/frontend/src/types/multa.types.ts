export interface Multa {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type MultaCreateInput = Omit<Multa, 'id' | 'createdAt' | 'updatedAt'>;
export type MultaUpdateInput = Partial<MultaCreateInput>;
export interface Obra {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ObraCreateInput = Omit<Obra, 'id' | 'createdAt' | 'updatedAt'>;
export type ObraUpdateInput = Partial<ObraCreateInput>;
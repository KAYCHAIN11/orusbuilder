export interface Devolucao {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type DevolucaoCreateInput = Omit<Devolucao, 'id' | 'createdAt' | 'updatedAt'>;
export type DevolucaoUpdateInput = Partial<DevolucaoCreateInput>;
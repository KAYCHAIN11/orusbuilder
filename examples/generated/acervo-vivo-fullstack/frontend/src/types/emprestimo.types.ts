export interface Emprestimo {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type EmprestimoCreateInput = Omit<Emprestimo, 'id' | 'createdAt' | 'updatedAt'>;
export type EmprestimoUpdateInput = Partial<EmprestimoCreateInput>;
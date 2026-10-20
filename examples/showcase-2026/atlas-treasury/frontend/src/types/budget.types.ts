export interface Budget {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type BudgetCreateInput = Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>;
export type BudgetUpdateInput = Partial<BudgetCreateInput>;
export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: string;
  occurredAt: Date | string;
  category?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type TransactionCreateInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
export type TransactionUpdateInput = Partial<TransactionCreateInput>;
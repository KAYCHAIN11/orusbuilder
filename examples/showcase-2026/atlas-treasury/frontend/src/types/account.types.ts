export interface Account {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type AccountCreateInput = Omit<Account, 'id' | 'createdAt' | 'updatedAt'>;
export type AccountUpdateInput = Partial<AccountCreateInput>;
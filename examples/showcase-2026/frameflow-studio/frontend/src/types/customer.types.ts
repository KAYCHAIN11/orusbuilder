export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lifetimeValue?: number;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type CustomerCreateInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
export type CustomerUpdateInput = Partial<CustomerCreateInput>;
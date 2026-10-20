export interface Invoice {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;
  paidAt?: Date | string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type InvoiceCreateInput = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>;
export type InvoiceUpdateInput = Partial<InvoiceCreateInput>;
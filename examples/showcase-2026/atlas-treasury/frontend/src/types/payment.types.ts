export interface Payment {
  id: string;
  name: string;
  amount: number;
  method: string;
  paidAt?: Date | string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type PaymentCreateInput = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
export type PaymentUpdateInput = Partial<PaymentCreateInput>;
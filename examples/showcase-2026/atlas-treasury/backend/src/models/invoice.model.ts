export interface Invoice {
  id: string;
  name: string;
  amount: number;
  dueDate: Date | string;
  paidAt?: Date | string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
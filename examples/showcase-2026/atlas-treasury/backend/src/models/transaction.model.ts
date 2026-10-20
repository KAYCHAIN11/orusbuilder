export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: string;
  occurredAt: Date | string;
  category?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
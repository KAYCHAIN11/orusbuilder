export interface Report {
  id: string;
  name: string;
  metric: string;
  value: number;
  periodStart?: Date | string | null;
  periodEnd?: Date | string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Report {
  id: string;
  name: string;
  metric: string;
  value: number;
  periodStart?: Date | string;
  periodEnd?: Date | string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ReportCreateInput = Omit<Report, 'id' | 'createdAt' | 'updatedAt'>;
export type ReportUpdateInput = Partial<ReportCreateInput>;
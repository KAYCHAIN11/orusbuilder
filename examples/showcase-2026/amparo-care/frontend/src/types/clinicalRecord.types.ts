export interface ClinicalRecord {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type ClinicalRecordCreateInput = Omit<ClinicalRecord, 'id' | 'createdAt' | 'updatedAt'>;
export type ClinicalRecordUpdateInput = Partial<ClinicalRecordCreateInput>;
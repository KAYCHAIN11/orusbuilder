export interface Student {
  id: string;
  name: string;
  email: string;
  registrationCode?: string;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type StudentCreateInput = Omit<Student, 'id' | 'createdAt' | 'updatedAt'>;
export type StudentUpdateInput = Partial<StudentCreateInput>;
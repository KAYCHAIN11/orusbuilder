export interface Enrollment {
  id: string;
  name: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date | string;
  progress?: number;
  description?: string;
  status: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type EnrollmentCreateInput = Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>;
export type EnrollmentUpdateInput = Partial<EnrollmentCreateInput>;
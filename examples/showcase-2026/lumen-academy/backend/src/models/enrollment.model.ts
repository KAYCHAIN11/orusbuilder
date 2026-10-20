export interface Enrollment {
  id: string;
  name: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date | string;
  progress?: number | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}